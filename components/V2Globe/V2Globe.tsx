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

import { V2_GLOBE_LOCATIONS, type V2GlobeLocation } from './v2-globe-locations';

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
const DEFAULT_OUTLINE_DETAIL = MAX_OUTLINE_DETAIL;
const MIN_ROTATION_SPEED = 0.1;
const MAX_ROTATION_SPEED = 3;
const DEFAULT_ROTATION_SPEED = 0.6;
const POV_TRANSITION_MS = 1600;
const LOCATION_MARKER_ALTITUDE = 0.035;
const IS_DEV_PANEL_ENABLED = process.env.NODE_ENV === 'development';

type GlobeDirection = 'up' | 'down' | 'left' | 'right';
type RotationDirection = 'east' | 'west';

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

type V2GlobeLocationMarker = V2GlobeLocation & {
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

function getLocationMarkerScale(altitude: number) {
  const zoomProgress =
    (MAX_ALTITUDE - clampAltitude(altitude)) / (MAX_ALTITUDE - MIN_ALTITUDE);

  return 0.72 + zoomProgress * 0.9;
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

function createLocationMarkerElement(data: object) {
  const pin = data as V2GlobeLocationMarker;
  const element = document.createElement('div');
  const marker = document.createElement('div');
  const square = document.createElement('div');
  const callout = document.createElement('div');
  const diagonalLine = document.createElement('div');
  const horizontalLine = document.createElement('div');
  const content = document.createElement('div');
  const title = document.createElement('div');
  const location = document.createElement('div');
  const coordinates = document.createElement('div');

  element.setAttribute('role', 'button');
  element.setAttribute(
    'aria-label',
    `${pin.title}. ${pin.location}. ${pin.coordinates}`
  );
  element.dataset.v2LocationMarker = 'true';
  element.style.setProperty('--location-marker-scale', '1');
  element.tabIndex = 0;
  element.style.position = 'relative';
  element.style.width = '0';
  element.style.height = '0';
  element.style.pointerEvents = 'auto';
  element.style.cursor = 'pointer';
  element.style.outline = 'none';

  marker.style.position = 'absolute';
  marker.style.left = '0';
  marker.style.top = '0';
  marker.style.width = '220px';
  marker.style.height = '112px';
  marker.style.transform = 'scale(var(--location-marker-scale))';
  marker.style.transformOrigin = '0 0';
  marker.style.transition = 'transform 220ms cubic-bezier(0.22, 1, 0.36, 1)';

  square.style.position = 'absolute';
  square.style.top = '0';
  square.style.left = '0';
  square.style.width = '12px';
  square.style.height = '12px';
  square.style.background = '#f4f4f1';
  square.style.border = '1px solid rgba(0, 0, 0, 0.8)';
  square.style.boxShadow = '0 0 0 4px rgba(244, 244, 241, 0.12)';
  square.style.transform = 'translate(-50%, -50%)';
  square.style.transition =
    'transform 260ms ease, box-shadow 260ms ease, background 260ms ease';

  callout.style.position = 'absolute';
  callout.style.left = '2px';
  callout.style.top = '-104px';
  callout.style.width = '212px';
  callout.style.height = '104px';
  callout.style.pointerEvents = 'none';

  diagonalLine.style.position = 'absolute';
  diagonalLine.style.left = '0';
  diagonalLine.style.bottom = '0';
  diagonalLine.style.width = '74px';
  diagonalLine.style.height = '2px';
  diagonalLine.style.background = '#f4f4f1';
  diagonalLine.style.boxShadow = '0 0 14px rgba(244, 244, 241, 0.18)';
  diagonalLine.style.transform = 'rotate(-31deg) scaleX(0)';
  diagonalLine.style.transformOrigin = 'left center';
  diagonalLine.style.transition =
    'transform 420ms cubic-bezier(0.22, 1, 0.36, 1)';

  horizontalLine.style.position = 'absolute';
  horizontalLine.style.left = '62px';
  horizontalLine.style.bottom = '37px';
  horizontalLine.style.width = '138px';
  horizontalLine.style.height = '2px';
  horizontalLine.style.background = '#f4f4f1';
  horizontalLine.style.boxShadow = '0 0 14px rgba(244, 244, 241, 0.18)';
  horizontalLine.style.transform = 'scaleX(0)';
  horizontalLine.style.transformOrigin = 'left center';
  horizontalLine.style.transition =
    'transform 460ms cubic-bezier(0.22, 1, 0.36, 1) 300ms';

  content.style.position = 'absolute';
  content.style.left = '62px';
  content.style.bottom = '48px';
  content.style.minWidth = '170px';
  content.style.color = '#f4f4f1';
  content.style.opacity = '0';
  content.style.transform = 'translate3d(-10px, 8px, 0)';
  content.style.transition =
    'opacity 360ms ease 700ms, transform 360ms cubic-bezier(0.22, 1, 0.36, 1) 700ms';

  title.textContent = pin.title;
  title.style.fontSize = '11px';
  title.style.fontWeight = '600';
  title.style.letterSpacing = '0.16em';
  title.style.lineHeight = '1.2';
  title.style.textTransform = 'uppercase';
  title.style.textShadow = '0 10px 24px rgba(0, 0, 0, 0.85)';

  location.textContent = pin.location;
  location.style.marginTop = '6px';
  location.style.fontSize = '13px';
  location.style.lineHeight = '1.2';
  location.style.textShadow = '0 10px 24px rgba(0, 0, 0, 0.85)';

  coordinates.textContent = pin.coordinates;
  coordinates.style.marginTop = '5px';
  coordinates.style.color = 'rgba(244, 244, 241, 0.58)';
  coordinates.style.fontSize = '11px';
  coordinates.style.lineHeight = '1.2';
  coordinates.style.textShadow = '0 10px 24px rgba(0, 0, 0, 0.85)';

  content.append(title, location, coordinates);
  callout.append(diagonalLine, horizontalLine, content);
  marker.append(square, callout);
  element.append(marker);

  const showTooltip = () => {
    square.style.background = '#ffffff';
    square.style.boxShadow = '0 0 0 6px rgba(244, 244, 241, 0.16)';
    square.style.transform = 'translate(-50%, -50%) scale(1.08)';
    diagonalLine.style.transform = 'rotate(-31deg) scaleX(1)';
    horizontalLine.style.transform = 'scaleX(1)';
    content.style.opacity = '1';
    content.style.transform = 'translate3d(0, 0, 0)';
  };
  const hideTooltip = () => {
    square.style.background = '#f4f4f1';
    square.style.boxShadow = '0 0 0 4px rgba(244, 244, 241, 0.12)';
    square.style.transform = 'translate(-50%, -50%) scale(1)';
    diagonalLine.style.transform = 'rotate(-31deg) scaleX(0)';
    horizontalLine.style.transform = 'scaleX(0)';
    content.style.opacity = '0';
    content.style.transform = 'translate3d(-10px, 8px, 0)';
  };

  element.addEventListener('mouseenter', showTooltip);
  element.addEventListener('mouseleave', hideTooltip);
  element.addEventListener('focus', showTooltip);
  element.addEventListener('blur', hideTooltip);
  marker.addEventListener('mouseenter', showTooltip);
  marker.addEventListener('mouseleave', hideTooltip);

  return element;
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
  const [isRotationEnabled, setIsRotationEnabled] = useState(false);
  const [rotationDirection, setRotationDirection] =
    useState<RotationDirection>('east');
  const [rotationSpeed, setRotationSpeed] = useState(DEFAULT_ROTATION_SPEED);

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
  const locationMarkers = useMemo(
    () =>
      V2_GLOBE_LOCATIONS.map((location) => ({
        ...location,
        altitude: LOCATION_MARKER_ALTITUDE
      })),
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
    if (!isGlobeReady || !isActive) {
      return;
    }

    const controls = globeRef.current?.controls();

    if (!controls) {
      return;
    }

    controls.autoRotate = isRotationEnabled;
    controls.autoRotateSpeed =
      rotationDirection === 'east' ? rotationSpeed : -rotationSpeed;

    return () => {
      controls.autoRotate = false;
    };
  }, [
    isActive,
    isGlobeReady,
    isRotationEnabled,
    rotationDirection,
    rotationSpeed
  ]);

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

  useEffect(() => {
    const markerScale = getLocationMarkerScale(currentPov.altitude);

    document
      .querySelectorAll<HTMLElement>('[data-v2-location-marker="true"]')
      .forEach((markerElement) => {
        markerElement.style.setProperty(
          '--location-marker-scale',
          markerScale.toFixed(3)
        );
      });
  }, [currentPov.altitude]);

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
          htmlElementsData={locationMarkers}
          htmlLat='lat'
          htmlLng='lng'
          htmlAltitude='altitude'
          htmlElement={createLocationMarkerElement}
          htmlTransitionDuration={400}
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
              <span>
                {outlineDetail === MAX_OUTLINE_DETAIL
                  ? '10m'
                  : `${outlineDetail}%`}
              </span>
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

          <div className='mt-5 border-t border-white/10 pt-4'>
            <label className='flex items-center justify-between gap-3 text-xs text-white/65'>
              <span>Rotate globe</span>
              <input
                type='checkbox'
                checked={isRotationEnabled}
                onChange={(event) => {
                  setIsRotationEnabled(event.target.checked);
                }}
                className='h-4 w-4 accent-white'
              />
            </label>

            <label className='mt-4 block'>
              <span className='mb-2 flex items-center justify-between text-xs text-white/65'>
                <span>Rotation speed</span>
                <span>{rotationSpeed.toFixed(1)}x</span>
              </span>
              <input
                type='range'
                min={MIN_ROTATION_SPEED}
                max={MAX_ROTATION_SPEED}
                step='0.1'
                value={rotationSpeed}
                onChange={(event) => {
                  setRotationSpeed(Number(event.target.value));
                }}
                className='w-full accent-white'
              />
            </label>

            <div className='mt-4'>
              <div className='mb-2 text-xs text-white/65'>Direction</div>
              <div className='grid grid-cols-2 overflow-hidden rounded-md border border-white/15'>
                <button
                  type='button'
                  onClick={() => {
                    setRotationDirection('west');
                  }}
                  className={cn(
                    'min-h-9 px-3 text-xs transition-colors',
                    rotationDirection === 'west'
                      ? 'bg-white text-black'
                      : 'bg-white/0 text-white/65 hover:bg-white/10'
                  )}
                >
                  West
                </button>
                <button
                  type='button'
                  onClick={() => {
                    setRotationDirection('east');
                  }}
                  className={cn(
                    'min-h-9 border-l border-white/15 px-3 text-xs transition-colors',
                    rotationDirection === 'east'
                      ? 'bg-white text-black'
                      : 'bg-white/0 text-white/65 hover:bg-white/10'
                  )}
                >
                  East
                </button>
              </div>
            </div>
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
