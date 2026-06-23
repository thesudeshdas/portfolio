'use client';

import dynamic from 'next/dynamic';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MutableRefObject
} from 'react';
import type { GlobeMethods, GlobeProps } from 'react-globe.gl';
import * as THREE from 'three';

import { cn } from '@/lib/utils';

const Globe = dynamic<
  GlobeProps & { ref?: MutableRefObject<GlobeMethods | undefined> }
>(() => import('react-globe.gl'), { ssr: false });

const BENGALURU_VIEW = {
  lat: 12.9716,
  lng: 77.5946
};
const DESKTOP_ALTITUDE = 2.2;
const MOBILE_ALTITUDE = 2.85;
const MIN_ALTITUDE = 0.45;
const MAX_ALTITUDE = 4.2;
const MAX_ZOOM = 500;
const POV_TRANSITION_MS = 1600;
const IS_DEV_PANEL_ENABLED = process.env.NODE_ENV === 'development';

type GlobeDirection = 'up' | 'down' | 'left' | 'right';

type GeoJsonGeometry = {
  type: string;
  coordinates: number[];
};

type CountryFeature = {
  type: 'Feature';
  properties: Record<string, unknown>;
  geometry: GeoJsonGeometry;
};

type CountriesGeoJson = {
  type: 'FeatureCollection';
  features: CountryFeature[];
};

type GlobePointOfView = {
  lat: number;
  lng: number;
  altitude: number;
};

function getInitialAltitude(width: number) {
  return width < 640 ? MOBILE_ALTITUDE : DESKTOP_ALTITUDE;
}

function normalizeLongitude(longitude: number) {
  return ((((longitude + 180) % 360) + 360) % 360) - 180;
}

function clampLatitude(latitude: number) {
  return Math.max(-72, Math.min(72, latitude));
}

function clampAltitude(altitude: number) {
  return Math.max(MIN_ALTITUDE, Math.min(MAX_ALTITUDE, altitude));
}

function getZoomFromAltitude(altitude: number) {
  const clampedAltitude = clampAltitude(altitude);

  return Math.round(
    ((MAX_ALTITUDE - clampedAltitude) / (MAX_ALTITUDE - MIN_ALTITUDE)) *
      MAX_ZOOM
  );
}

function getAltitudeFromZoom(zoom: number) {
  const clampedZoom = Math.max(0, Math.min(MAX_ZOOM, zoom));

  return (
    MAX_ALTITUDE - (clampedZoom / MAX_ZOOM) * (MAX_ALTITUDE - MIN_ALTITUDE)
  );
}

function getCountryGeometry(feature: object) {
  return (feature as CountryFeature).geometry;
}

function getPolygonCapColor() {
  return 'rgba(0,0,0,0)';
}

function getPolygonSideColor() {
  return 'rgba(0,0,0,0)';
}

function getPolygonStrokeColor() {
  return 'rgba(244,244,241,0.92)';
}

export default function V2Globe({ isActive }: { isActive: boolean }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const globeRef = useRef<GlobeMethods | undefined>(undefined);
  const currentPovRef = useRef<GlobePointOfView>({
    ...BENGALURU_VIEW,
    altitude: DESKTOP_ALTITUDE
  });
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [countries, setCountries] = useState<CountryFeature[]>([]);
  const [isGlobeReady, setIsGlobeReady] = useState(false);
  const [currentPov, setCurrentPov] = useState<GlobePointOfView>(
    currentPovRef.current
  );

  const globeMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: '#050505'
      }),
    []
  );
  const polygonCapMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: '#050505',
        depthWrite: false,
        opacity: 0,
        transparent: true
      }),
    []
  );

  const updatePointOfView = useCallback(
    (pov: GlobePointOfView, transitionMs = 0) => {
      currentPovRef.current = pov;
      setCurrentPov(pov);
      globeRef.current?.pointOfView(pov, transitionMs);
    },
    []
  );

  const focusBengaluru = useCallback(
    (transitionMs = POV_TRANSITION_MS) => {
      updatePointOfView(
        {
          ...BENGALURU_VIEW,
          altitude: getInitialAltitude(size.width)
        },
        transitionMs
      );
    },
    [size.width, updatePointOfView]
  );

  const moveGlobe = useCallback(
    (direction: GlobeDirection) => {
      const currentPov = currentPovRef.current;
      const nextPov = {
        ...currentPov,
        lat:
          direction === 'up'
            ? clampLatitude(currentPov.lat + 8)
            : direction === 'down'
            ? clampLatitude(currentPov.lat - 8)
            : currentPov.lat,
        lng:
          direction === 'left'
            ? normalizeLongitude(currentPov.lng - 12)
            : direction === 'right'
            ? normalizeLongitude(currentPov.lng + 12)
            : currentPov.lng
      };

      updatePointOfView(nextPov, 520);
    },
    [updatePointOfView]
  );

  const handleZoomChange = (value: number) => {
    updatePointOfView(
      {
        ...currentPovRef.current,
        altitude: getAltitudeFromZoom(value)
      },
      0
    );
  };

  const handleResetNorth = () => {
    updatePointOfView(currentPovRef.current, 420);
  };

  useEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    const resizeObserver = new ResizeObserver(([entry]) => {
      const width = Math.round(entry.contentRect.width);
      const height = Math.round(entry.contentRect.height);

      setSize({ width, height });
    });

    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!isActive || countries.length > 0) {
      return;
    }

    const controller = new AbortController();

    fetch('/data/countries.geojson', { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error('Failed to load country boundaries');
        }

        return (await response.json()) as CountriesGeoJson;
      })
      .then((data) => {
        setCountries(data.features);
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return;
        }

        throw error;
      });

    return () => {
      controller.abort();
    };
  }, [countries.length, isActive]);

  useEffect(() => {
    if (!isGlobeReady || !isActive) {
      return;
    }

    const controls = globeRef.current?.controls();

    if (controls) {
      controls.autoRotate = false;
      controls.enableDamping = true;
      controls.enablePan = false;
      controls.rotateSpeed = 0.55;
      controls.minDistance = 80;
      controls.maxDistance = 420;
    }

    focusBengaluru();
  }, [focusBengaluru, isActive, isGlobeReady]);

  useEffect(() => {
    if (!isActive) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.target instanceof HTMLElement &&
        event.target.closest('[data-v2-dev-control="true"]')
      ) {
        return;
      }

      if (
        event.key !== 'ArrowUp' &&
        event.key !== 'ArrowDown' &&
        event.key !== 'ArrowLeft' &&
        event.key !== 'ArrowRight'
      ) {
        return;
      }

      event.preventDefault();
      const direction = event.key.replace('Arrow', '').toLowerCase();
      moveGlobe(direction as GlobeDirection);
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isActive, moveGlobe]);

  return (
    <section
      ref={containerRef}
      className={cn(
        'relative min-h-screen overflow-hidden bg-black transition-opacity duration-700',
        isActive ? 'opacity-100' : 'opacity-0'
      )}
    >
      {size.width > 0 && size.height > 0 && (
        <Globe
          ref={globeRef}
          width={size.width}
          height={size.height}
          backgroundColor='rgba(0,0,0,0)'
          globeMaterial={globeMaterial}
          showAtmosphere={false}
          polygonsData={countries}
          polygonGeoJsonGeometry={getCountryGeometry}
          polygonCapColor={getPolygonCapColor}
          polygonCapMaterial={polygonCapMaterial}
          polygonSideColor={getPolygonSideColor}
          polygonStrokeColor={getPolygonStrokeColor}
          polygonAltitude={0.01}
          polygonsTransitionDuration={900}
          enablePointerInteraction
          onGlobeReady={() => {
            setIsGlobeReady(true);
          }}
          onZoom={(pov) => {
            currentPovRef.current = pov;
            setCurrentPov(pov);
          }}
        />
      )}

      {IS_DEV_PANEL_ENABLED && isActive && (
        <aside
          data-v2-dev-control='true'
          className='absolute top-24 right-5 z-20 w-[260px] rounded-md border border-white/15 bg-black/75 p-4 text-white shadow-2xl backdrop-blur-md'
        >
          <div className='mb-4 flex items-center justify-between gap-3'>
            <h2 className='text-xs font-medium tracking-[0.22em] text-white/70 uppercase'>
              Dev controls
            </h2>
            <span className='rounded-sm border border-white/10 px-2 py-1 text-[10px] leading-none text-white/45'>
              V2
            </span>
          </div>

          <label className='block'>
            <span className='mb-2 flex items-center justify-between text-xs text-white/65'>
              <span>Zoom</span>
              <span>{getZoomFromAltitude(currentPov.altitude)}%</span>
            </span>
            <input
              type='range'
              min='0'
              max={MAX_ZOOM}
              step='1'
              value={getZoomFromAltitude(currentPov.altitude)}
              onChange={(event) => {
                handleZoomChange(Number(event.target.value));
              }}
              className='w-full accent-white'
            />
          </label>

          <div className='mt-5 border-t border-white/10 pt-4'>
            <div className='mb-2 text-xs text-white/65'>North axis</div>
            <button
              type='button'
              onClick={handleResetNorth}
              className='min-h-9 w-full rounded-md border border-white/15 bg-white/5 px-3 text-left text-xs text-white transition-colors hover:border-white/35 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white'
            >
              Reset north-up
            </button>
          </div>

          <dl className='mt-5 grid grid-cols-2 gap-x-4 gap-y-2 border-t border-white/10 pt-4 text-xs'>
            <dt className='text-white/45'>Lat</dt>
            <dd className='text-right text-white/80 tabular-nums'>
              {currentPov.lat.toFixed(4)}
            </dd>
            <dt className='text-white/45'>Lng</dt>
            <dd className='text-right text-white/80 tabular-nums'>
              {currentPov.lng.toFixed(4)}
            </dd>
            <dt className='text-white/45'>Alt</dt>
            <dd className='text-right text-white/80 tabular-nums'>
              {currentPov.altitude.toFixed(2)}
            </dd>
          </dl>
        </aside>
      )}
    </section>
  );
}
