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
const MIN_OUTLINE_DETAIL = 10;
const MAX_OUTLINE_DETAIL = 100;
const DEFAULT_OUTLINE_DETAIL = 70;
const POV_TRANSITION_MS = 1600;
const IS_DEV_PANEL_ENABLED = process.env.NODE_ENV === 'development';

type GlobeDirection = 'up' | 'down' | 'left' | 'right';

type GeoJsonPosition = [number, number, ...number[]];
type GeoJsonLineCoordinates = GeoJsonPosition[];
type GeoJsonMultiLineCoordinates = GeoJsonPosition[][];

type GeoJsonGeometry =
  | {
      type: 'LineString';
      coordinates: GeoJsonLineCoordinates;
    }
  | {
      type: 'MultiLineString';
      coordinates: GeoJsonMultiLineCoordinates;
    };

type MapLineFeature = {
  type: 'Feature';
  properties: Record<string, unknown>;
  geometry: GeoJsonGeometry;
};

type MapLinesGeoJson = {
  type: 'FeatureCollection';
  features: MapLineFeature[];
};

type GlobePointOfView = {
  lat: number;
  lng: number;
  altitude: number;
};

type CountryBorderPoint = {
  lat: number;
  lng: number;
  altitude: number;
};

type CountryBorderPath = {
  points: CountryBorderPoint[];
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

function getBorderLineColor() {
  return 'rgba(244,244,241,0.92)';
}

function getCountryBorderPaths(features: MapLineFeature[]) {
  return features.flatMap((feature) => {
    const { geometry } = feature;
    const lines =
      geometry.type === 'LineString'
        ? [geometry.coordinates]
        : geometry.coordinates;

    return lines
      .filter((line) => line.length > 1)
      .map((line) => ({
        points: line.map(([lng, lat]) => ({
          lat,
          lng,
          altitude: 0.008
        }))
      }));
  });
}

function getDetailedBorderPaths(
  paths: CountryBorderPath[],
  outlineDetail: number
) {
  const clampedDetail = Math.max(
    MIN_OUTLINE_DETAIL,
    Math.min(MAX_OUTLINE_DETAIL, outlineDetail)
  );

  if (clampedDetail === MAX_OUTLINE_DETAIL) {
    return paths;
  }

  return paths.map((path) => {
    if (path.points.length <= 2) {
      return path;
    }

    const targetPointCount = Math.max(
      2,
      Math.ceil(path.points.length * (clampedDetail / MAX_OUTLINE_DETAIL))
    );
    const pointStep = (path.points.length - 1) / (targetPointCount - 1);
    const points = Array.from(
      { length: targetPointCount },
      (_, index) => path.points[Math.round(index * pointStep)]
    );

    return { points };
  });
}

export default function V2Globe({ isActive }: { isActive: boolean }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const globeRef = useRef<GlobeMethods | undefined>(undefined);
  const currentPovRef = useRef<GlobePointOfView>({
    ...BENGALURU_VIEW,
    altitude: DESKTOP_ALTITUDE
  });
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [borderPaths, setBorderPaths] = useState<CountryBorderPath[]>([]);
  const [isGlobeReady, setIsGlobeReady] = useState(false);
  const [currentPov, setCurrentPov] = useState<GlobePointOfView>(
    currentPovRef.current
  );
  const [outlineDetail, setOutlineDetail] = useState(DEFAULT_OUTLINE_DETAIL);

  const globeMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: '#050505'
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
  const visibleBorderPaths = useMemo(
    () => getDetailedBorderPaths(borderPaths, outlineDetail),
    [borderPaths, outlineDetail]
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
    if (!isActive || borderPaths.length > 0) {
      return;
    }

    const controller = new AbortController();

    fetch('/data/countries.geojson', { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error('Failed to load country boundaries');
        }

        return (await response.json()) as MapLinesGeoJson;
      })
      .then((data) => {
        setBorderPaths(getCountryBorderPaths(data.features));
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
  }, [borderPaths.length, isActive]);

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
          pathsData={visibleBorderPaths}
          pathPoints='points'
          pathPointLat='lat'
          pathPointLng='lng'
          pathPointAlt='altitude'
          pathColor={getBorderLineColor}
          pathStroke={0.32}
          pathResolution={2}
          pathTransitionDuration={0}
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

          <label className='mt-5 block border-t border-white/10 pt-4'>
            <span className='mb-2 flex items-center justify-between text-xs text-white/65'>
              <span>Map detail</span>
              <span>{outlineDetail}%</span>
            </span>
            <input
              type='range'
              min={MIN_OUTLINE_DETAIL}
              max={MAX_OUTLINE_DETAIL}
              step='1'
              value={outlineDetail}
              onChange={(event) => {
                setOutlineDetail(Number(event.target.value));
              }}
              className='w-full accent-white'
            />
          </label>

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
