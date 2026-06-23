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
const POV_TRANSITION_MS = 1600;
const GLOBE_ROTATE_EVENT = 'v2-globe-rotate';

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

const GLOBE_CONTROLS: Array<{
  direction: GlobeDirection;
  label: string;
  symbol: string;
  className: string;
}> = [
  {
    direction: 'up',
    label: 'Rotate globe up',
    symbol: '↑',
    className: 'col-start-2 row-start-1'
  },
  {
    direction: 'left',
    label: 'Rotate globe left',
    symbol: '←',
    className: 'col-start-1 row-start-2'
  },
  {
    direction: 'right',
    label: 'Rotate globe right',
    symbol: '→',
    className: 'col-start-3 row-start-2'
  },
  {
    direction: 'down',
    label: 'Rotate globe down',
    symbol: '↓',
    className: 'col-start-2 row-start-3'
  }
];

function getInitialAltitude(width: number) {
  return width < 640 ? MOBILE_ALTITUDE : DESKTOP_ALTITUDE;
}

function normalizeLongitude(longitude: number) {
  return ((((longitude + 180) % 360) + 360) % 360) - 180;
}

function clampLatitude(latitude: number) {
  return Math.max(-72, Math.min(72, latitude));
}

function getCountryGeometry(feature: object) {
  return (feature as CountryFeature).geometry;
}

function getPolygonCapColor() {
  return '#050505';
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

  const globeMaterial = useMemo(
    () =>
      new THREE.MeshPhongMaterial({
        color: '#050505',
        emissive: '#020202',
        shininess: 14,
        specular: '#2a2a2a'
      }),
    []
  );

  const focusBengaluru = useCallback(
    (transitionMs = POV_TRANSITION_MS) => {
      const nextPov = {
        ...BENGALURU_VIEW,
        altitude: getInitialAltitude(size.width)
      };

      currentPovRef.current = nextPov;
      globeRef.current?.pointOfView(nextPov, transitionMs);
    },
    [size.width]
  );

  const moveGlobe = useCallback((direction: GlobeDirection) => {
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

    currentPovRef.current = nextPov;
    globeRef.current?.pointOfView(nextPov, 520);
  }, []);

  const handleRotateControl = (direction: GlobeDirection) => {
    window.dispatchEvent(
      new CustomEvent<GlobeDirection>(GLOBE_ROTATE_EVENT, { detail: direction })
    );
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
      controls.minDistance = 175;
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

    const handleRotateEvent = (event: Event) => {
      const { detail } = event as CustomEvent<GlobeDirection>;

      moveGlobe(detail);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener(GLOBE_ROTATE_EVENT, handleRotateEvent);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener(GLOBE_ROTATE_EVENT, handleRotateEvent);
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
          }}
        />
      )}

      <div className='pointer-events-none absolute inset-x-0 bottom-10 z-10 flex justify-center'>
        <div className='grid grid-cols-3 grid-rows-3 gap-2'>
          {GLOBE_CONTROLS.map((control) => (
            <button
              key={control.direction}
              type='button'
              aria-label={control.label}
              onClick={() => {
                handleRotateControl(control.direction);
              }}
              className={cn(
                'pointer-events-auto grid h-11 w-11 place-items-center rounded-md border border-white/15 bg-white/10 text-lg leading-none text-white backdrop-blur transition-colors hover:border-white/35 hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white',
                control.className
              )}
            >
              {control.symbol}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
