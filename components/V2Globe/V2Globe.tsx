'use client';

import dynamic from 'next/dynamic';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MutableRefObject,
  type PointerEvent as ReactPointerEvent
} from 'react';
import type { GlobeMethods, GlobeProps } from 'react-globe.gl';
import * as THREE from 'three';

import { cn } from '@/lib/utils';

import { V2_GLOBE_LOCATIONS, type V2GlobeLocation } from './v2-globe-locations';

const Globe = dynamic<
  GlobeProps & { ref?: MutableRefObject<GlobeMethods | undefined> }
>(() => import('react-globe.gl'), { ssr: false });

const MADRID_VIEW = {
  lat: 40.4168,
  lng: -3.7038
};
const INDIA_VIEW = {
  lat: 22.8,
  lng: 78.9
};
const MIN_ALTITUDE = 0.34;
const MAX_ALTITUDE = 4.2;
const MAX_ZOOM = 1500;
const INTRO_START_ZOOM = 250;
const INTRO_END_ZOOM = 1425;
const MIN_DISPLAY_ZOOM = 0;
const MAX_DISPLAY_ZOOM = 100;
const MIN_OUTLINE_DETAIL = 10;
const MAX_OUTLINE_DETAIL = 100;
const DEFAULT_OUTLINE_DETAIL = MIN_OUTLINE_DETAIL;
const MIN_ROTATION_SPEED = 0.1;
const MAX_ROTATION_SPEED = 3;
const DEFAULT_ROTATION_SPEED = 0.35;
const GLOBE_FADE_IN_MS = 700;
const INTRO_FLIGHT_MS = 7800;
const LOCATION_MARKER_ALTITUDE = 0.035;
const INTRO_STATE_SYNC_MS = 120;
const BORDER_LINE_ALTITUDE = 0.01;
const TARGET_RENDER_PIXEL_RATIO = 1;
const LOW_FPS_RENDER_PIXEL_RATIO = 0.75;
const DEFAULT_GLOBE_COLOR = '#0e0e0e';
const DEFAULT_BORDER_COLOR = '#f4f4f1';
const INDIA_HOVER_GLOBE_COLOR = '#d8c7aa';
const INDIA_HOVER_BORDER_COLOR = '#2f1d13';
const IS_DEV_PANEL_ENABLED = process.env.NODE_ENV === 'development';

type GlobeDirection = 'up' | 'down' | 'left' | 'right';
type RotationDirection = 'east' | 'west';
type V2FlowStep = 'loading' | 'globe';

type V2FlowControl = {
  id: V2FlowStep;
  label: string;
};

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

type LngLatPoint = [number, number];
type ColorMaterial = THREE.Material & { color: THREE.Color };

const INDIA_HOVER_REGIONS: LngLatPoint[][] = [
  [
    [68.0, 23.6],
    [68.9, 24.9],
    [71.3, 27.2],
    [73.8, 32.8],
    [75.7, 36.8],
    [79.6, 35.6],
    [83.5, 31.6],
    [88.4, 28.2],
    [91.4, 27.8],
    [97.4, 28.4],
    [96.0, 24.1],
    [92.0, 22.0],
    [88.0, 21.6],
    [86.7, 20.4],
    [84.1, 18.4],
    [81.1, 16.5],
    [80.3, 13.1],
    [77.5, 7.8],
    [75.2, 11.0],
    [73.4, 15.4],
    [72.6, 20.7]
  ],
  [
    [92.4, 12.0],
    [94.3, 13.9],
    [93.2, 14.4],
    [92.2, 13.3]
  ]
];
const INTRO_FLIGHT_POINTS: Array<Pick<GlobePointOfView, 'lat' | 'lng'>> = [
  {
    ...MADRID_VIEW
  },
  {
    lat: 34,
    lng: 25
  },
  {
    lat: 27,
    lng: 57
  },
  {
    ...INDIA_VIEW
  }
];

function normalizeLongitude(longitude: number) {
  return ((((longitude + 180) % 360) + 360) % 360) - 180;
}

function setMaterialColor(material: ColorMaterial, color: string) {
  material.color.set(color);
  material.needsUpdate = true;
}

function easeInOutCubic(progress: number) {
  return progress < 0.5
    ? 4 * progress * progress * progress
    : 1 - Math.pow(-2 * progress + 2, 3) / 2;
}

function getCatmullRomValue(
  previousValue: number,
  currentValue: number,
  nextValue: number,
  followingValue: number,
  progress: number
) {
  const progressSquared = progress * progress;
  const progressCubed = progressSquared * progress;

  return (
    0.5 *
    (2 * currentValue +
      (-previousValue + nextValue) * progress +
      (2 * previousValue - 5 * currentValue + 4 * nextValue - followingValue) *
        progressSquared +
      (-previousValue + 3 * currentValue - 3 * nextValue + followingValue) *
        progressCubed)
  );
}

function getFlightPoint(index: number) {
  return INTRO_FLIGHT_POINTS[
    Math.max(0, Math.min(INTRO_FLIGHT_POINTS.length - 1, index))
  ];
}

function getIntroPointOfView(progress: number) {
  const clampedProgress = Math.max(0, Math.min(1, progress));
  const timelineProgress = easeInOutCubic(clampedProgress);
  const segmentCount = INTRO_FLIGHT_POINTS.length - 1;
  const segmentProgress = timelineProgress * segmentCount;
  const segmentIndex = Math.min(
    Math.floor(segmentProgress),
    INTRO_FLIGHT_POINTS.length - 2
  );
  const localProgress = segmentProgress - segmentIndex;
  const previousPoint = getFlightPoint(segmentIndex - 1);
  const currentPoint = getFlightPoint(segmentIndex);
  const nextPoint = getFlightPoint(segmentIndex + 1);
  const followingPoint = getFlightPoint(segmentIndex + 2);

  return {
    lat: getCatmullRomValue(
      previousPoint.lat,
      currentPoint.lat,
      nextPoint.lat,
      followingPoint.lat,
      localProgress
    ),
    lng: getCatmullRomValue(
      previousPoint.lng,
      currentPoint.lng,
      nextPoint.lng,
      followingPoint.lng,
      localProgress
    ),
    altitude:
      getAltitudeFromZoom(INTRO_START_ZOOM) +
      (getAltitudeFromZoom(INTRO_END_ZOOM) -
        getAltitudeFromZoom(INTRO_START_ZOOM)) *
        timelineProgress
  };
}

function isPointInPolygon(
  point: { lat: number; lng: number },
  polygon: LngLatPoint[]
) {
  let isInside = false;

  for (
    let pointIndex = 0, previousPointIndex = polygon.length - 1;
    pointIndex < polygon.length;
    previousPointIndex = pointIndex++
  ) {
    const [currentLng, currentLat] = polygon[pointIndex];
    const [previousLng, previousLat] = polygon[previousPointIndex];
    const intersects =
      currentLat > point.lat !== previousLat > point.lat &&
      point.lng <
        ((previousLng - currentLng) * (point.lat - currentLat)) /
          (previousLat - currentLat) +
          currentLng;

    if (intersects) {
      isInside = !isInside;
    }
  }

  return isInside;
}

function isPointInIndia(point: { lat: number; lng: number }) {
  const normalizedPoint = {
    ...point,
    lng: normalizeLongitude(point.lng)
  };

  return INDIA_HOVER_REGIONS.some((region) =>
    isPointInPolygon(normalizedPoint, region)
  );
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

function getDisplayZoomFromAltitude(altitude: number) {
  const rawZoom = getZoomFromAltitude(altitude);
  const displayZoom =
    ((rawZoom - INTRO_START_ZOOM) / (INTRO_END_ZOOM - INTRO_START_ZOOM)) *
    MAX_DISPLAY_ZOOM;

  return Math.round(
    Math.max(MIN_DISPLAY_ZOOM, Math.min(MAX_DISPLAY_ZOOM, displayZoom))
  );
}

function getAltitudeFromDisplayZoom(displayZoom: number) {
  const clampedDisplayZoom = Math.max(
    MIN_DISPLAY_ZOOM,
    Math.min(MAX_DISPLAY_ZOOM, displayZoom)
  );
  const rawZoom =
    INTRO_START_ZOOM +
    (clampedDisplayZoom / MAX_DISPLAY_ZOOM) *
      (INTRO_END_ZOOM - INTRO_START_ZOOM);

  return getAltitudeFromZoom(rawZoom);
}

function getLocationMarkerScale(altitude: number) {
  const zoomProgress =
    (MAX_ALTITUDE - clampAltitude(altitude)) / (MAX_ALTITUDE - MIN_ALTITUDE);

  return 0.72 + zoomProgress * 0.9;
}

function updateLocationMarkerScale(altitude: number) {
  const markerScale = getLocationMarkerScale(altitude);

  document
    .querySelectorAll<HTMLElement>('[data-v2-location-marker="true"]')
    .forEach((markerElement) => {
      markerElement.style.setProperty(
        '--location-marker-scale',
        markerScale.toFixed(3)
      );
    });
}

function isPointerNearElementAnchor(event: PointerEvent, element: HTMLElement) {
  const rect = element.getBoundingClientRect();
  const markerScale = Number(
    element.style.getPropertyValue('--location-marker-scale') || 1
  );
  const hitRadius = 14 * markerScale;

  return (
    Math.abs(event.clientX - rect.left) <= hitRadius &&
    Math.abs(event.clientY - rect.top) <= hitRadius
  );
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

function createBorderLineSegments(
  paths: CountryBorderPath[],
  getCoords: GlobeMethods['getCoords'],
  color: string
) {
  const segmentCount = paths.reduce(
    (count, path) => count + Math.max(0, path.points.length - 1),
    0
  );
  const positions = new Float32Array(segmentCount * 2 * 3);
  let positionIndex = 0;

  paths.forEach((path) => {
    for (let pointIndex = 1; pointIndex < path.points.length; pointIndex += 1) {
      const fromPoint = path.points[pointIndex - 1];
      const toPoint = path.points[pointIndex];
      const fromCoords = getCoords(
        fromPoint.lat,
        fromPoint.lng,
        BORDER_LINE_ALTITUDE
      );
      const toCoords = getCoords(
        toPoint.lat,
        toPoint.lng,
        BORDER_LINE_ALTITUDE
      );

      positions[positionIndex++] = fromCoords.x;
      positions[positionIndex++] = fromCoords.y;
      positions[positionIndex++] = fromCoords.z;
      positions[positionIndex++] = toCoords.x;
      positions[positionIndex++] = toCoords.y;
      positions[positionIndex++] = toCoords.z;
    }
  });

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.computeBoundingSphere();

  const material = new THREE.LineBasicMaterial({
    color,
    depthWrite: false,
    transparent: true
  });
  const lines = new THREE.LineSegments(geometry, material);
  lines.renderOrder = 2;

  return { lines, material };
}

function disposeBorderLineSegments(lineSegments: THREE.LineSegments | null) {
  if (!lineSegments) {
    return;
  }

  lineSegments.geometry.dispose();
  const material = lineSegments.material;

  if (Array.isArray(material)) {
    material.forEach((candidateMaterial) => {
      candidateMaterial.dispose();
    });
    return;
  }

  material.dispose();
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

  let isTooltipVisible = false;

  const showTooltip = () => {
    if (isTooltipVisible) {
      return;
    }

    isTooltipVisible = true;
    square.style.background = '#ffffff';
    square.style.boxShadow = '0 0 0 6px rgba(244, 244, 241, 0.16)';
    square.style.transform = 'translate(-50%, -50%) scale(1.08)';
    diagonalLine.style.transform = 'rotate(-31deg) scaleX(1)';
    horizontalLine.style.transform = 'scaleX(1)';
    content.style.opacity = '1';
    content.style.transform = 'translate3d(0, 0, 0)';
  };
  const hideTooltip = () => {
    if (!isTooltipVisible) {
      return;
    }

    isTooltipVisible = false;
    square.style.background = '#f4f4f1';
    square.style.boxShadow = '0 0 0 4px rgba(244, 244, 241, 0.12)';
    square.style.transform = 'translate(-50%, -50%) scale(1)';
    diagonalLine.style.transform = 'rotate(-31deg) scaleX(0)';
    horizontalLine.style.transform = 'scaleX(0)';
    content.style.opacity = '0';
    content.style.transform = 'translate3d(-10px, 8px, 0)';
  };
  const handleWindowPointerMove = (event: PointerEvent) => {
    if (!element.isConnected) {
      window.removeEventListener('pointermove', handleWindowPointerMove);
      return;
    }

    if (isPointerNearElementAnchor(event, element)) {
      showTooltip();
      return;
    }

    if (document.activeElement !== element) {
      hideTooltip();
    }
  };

  element.addEventListener('mouseenter', showTooltip);
  element.addEventListener('mouseleave', hideTooltip);
  element.addEventListener('pointerenter', showTooltip);
  element.addEventListener('pointerleave', hideTooltip);
  element.addEventListener('focus', showTooltip);
  element.addEventListener('blur', hideTooltip);
  marker.addEventListener('mouseenter', showTooltip);
  marker.addEventListener('mouseleave', hideTooltip);
  marker.addEventListener('pointerenter', showTooltip);
  marker.addEventListener('pointerleave', hideTooltip);
  square.addEventListener('pointerenter', showTooltip);
  window.addEventListener('pointermove', handleWindowPointerMove, {
    passive: true
  });

  return element;
}

export default function V2Globe({
  activeStep,
  flowSteps = [],
  isActive,
  onStepChange
}: {
  activeStep?: V2FlowStep;
  flowSteps?: V2FlowControl[];
  isActive: boolean;
  onStepChange?: (step: V2FlowStep) => void;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const globeRef = useRef<GlobeMethods | undefined>(undefined);
  const introTimeoutsRef = useRef<number[]>([]);
  const introAnimationFrameRef = useRef<number | null>(null);
  const borderLineRef = useRef<THREE.LineSegments | null>(null);
  const borderLineMaterialRef = useRef<THREE.LineBasicMaterial | null>(null);
  const isCursorInsideIndiaRef = useRef(false);
  const currentPovRef = useRef<GlobePointOfView>({
    ...MADRID_VIEW,
    altitude: getAltitudeFromZoom(INTRO_START_ZOOM)
  });
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [borderPaths, setBorderPaths] = useState<CountryBorderPath[]>([]);
  const [fps, setFps] = useState(0);
  const [isGlobeReady, setIsGlobeReady] = useState(false);
  const [isGlobeVisible, setIsGlobeVisible] = useState(false);
  const [isCursorInsideIndia, setIsCursorInsideIndia] = useState(false);
  const [currentPov, setCurrentPov] = useState<GlobePointOfView>(
    currentPovRef.current
  );
  const [outlineDetail, setOutlineDetail] = useState(DEFAULT_OUTLINE_DETAIL);
  const [isRotationEnabled, setIsRotationEnabled] = useState(false);
  const [rotationDirection, setRotationDirection] =
    useState<RotationDirection>('west');
  const [rotationSpeed, setRotationSpeed] = useState(DEFAULT_ROTATION_SPEED);

  const globeMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: DEFAULT_GLOBE_COLOR
      }),
    []
  );
  const updatePointOfView = useCallback(
    (pov: GlobePointOfView, transitionMs = 0) => {
      currentPovRef.current = pov;
      setCurrentPov(pov);
      updateLocationMarkerScale(pov.altitude);
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

  const clearIntroTimeouts = useCallback(() => {
    introTimeoutsRef.current.forEach((timeoutId) => {
      window.clearTimeout(timeoutId);
    });
    introTimeoutsRef.current = [];

    if (introAnimationFrameRef.current !== null) {
      window.cancelAnimationFrame(introAnimationFrameRef.current);
      introAnimationFrameRef.current = null;
    }
  }, []);

  const startIntroFlight = useCallback(() => {
    if (introAnimationFrameRef.current !== null) {
      window.cancelAnimationFrame(introAnimationFrameRef.current);
    }

    const startTime = performance.now();
    let lastStateSyncTime = startTime;

    const animate = (currentTime: number) => {
      const elapsedMs = currentTime - startTime;
      const progress = Math.min(1, elapsedMs / INTRO_FLIGHT_MS);
      const nextPov = getIntroPointOfView(progress);

      currentPovRef.current = nextPov;
      updateLocationMarkerScale(nextPov.altitude);
      globeRef.current?.pointOfView(nextPov, 0);

      if (
        currentTime - lastStateSyncTime >= INTRO_STATE_SYNC_MS ||
        progress === 1
      ) {
        setCurrentPov(nextPov);
        lastStateSyncTime = currentTime;
      }

      if (progress < 1) {
        introAnimationFrameRef.current = window.requestAnimationFrame(animate);
      }
    };

    introAnimationFrameRef.current = window.requestAnimationFrame(animate);
  }, []);

  const queueIntroFlight = useCallback(
    (delayMs: number) => {
      const timeoutId = window.setTimeout(() => {
        startIntroFlight();
      }, delayMs);

      introTimeoutsRef.current.push(timeoutId);
    },
    [startIntroFlight]
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
        altitude: getAltitudeFromDisplayZoom(value)
      },
      0
    );
  };
  const setCursorIndiaState = useCallback((nextIsInsideIndia: boolean) => {
    if (isCursorInsideIndiaRef.current === nextIsInsideIndia) {
      return;
    }

    isCursorInsideIndiaRef.current = nextIsInsideIndia;
    setIsCursorInsideIndia(nextIsInsideIndia);
  }, []);
  const updateCursorIndiaState = useCallback(
    (event: PointerEvent | ReactPointerEvent<HTMLElement>) => {
      const elementAtPointer = document.elementFromPoint(
        event.clientX,
        event.clientY
      );

      if (
        elementAtPointer instanceof HTMLElement &&
        elementAtPointer.closest('[data-v2-dev-control="true"]')
      ) {
        setCursorIndiaState(false);
        return;
      }

      const globeCoords = globeRef.current?.toGlobeCoords(
        event.clientX,
        event.clientY
      );

      setCursorIndiaState(Boolean(globeCoords && isPointInIndia(globeCoords)));
    },
    [setCursorIndiaState]
  );
  const handlePointerLeave = useCallback(() => {
    setCursorIndiaState(false);
  }, [setCursorIndiaState]);

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
    if (!isActive || !isGlobeReady) {
      return;
    }

    window.addEventListener('pointermove', updateCursorIndiaState, {
      passive: true
    });

    return () => {
      window.removeEventListener('pointermove', updateCursorIndiaState);
    };
  }, [isActive, isGlobeReady, updateCursorIndiaState]);

  useEffect(() => {
    if (!isGlobeReady || visibleBorderPaths.length === 0) {
      return;
    }

    const globe = globeRef.current;
    const scene = globe?.scene();

    if (!globe || !scene) {
      return;
    }

    disposeBorderLineSegments(borderLineRef.current);

    const { lines, material } = createBorderLineSegments(
      visibleBorderPaths,
      globe.getCoords.bind(globe),
      isCursorInsideIndiaRef.current
        ? INDIA_HOVER_BORDER_COLOR
        : DEFAULT_BORDER_COLOR
    );

    borderLineRef.current = lines;
    borderLineMaterialRef.current = material;
    scene.add(lines);

    return () => {
      scene.remove(lines);
      disposeBorderLineSegments(lines);

      if (borderLineRef.current === lines) {
        borderLineRef.current = null;
        borderLineMaterialRef.current = null;
      }
    };
  }, [isGlobeReady, visibleBorderPaths]);

  useEffect(() => {
    const nextGlobeColor = isCursorInsideIndia
      ? INDIA_HOVER_GLOBE_COLOR
      : DEFAULT_GLOBE_COLOR;
    const nextBorderColor = isCursorInsideIndia
      ? INDIA_HOVER_BORDER_COLOR
      : DEFAULT_BORDER_COLOR;

    setMaterialColor(globeMaterial, nextGlobeColor);
    if (borderLineMaterialRef.current) {
      setMaterialColor(borderLineMaterialRef.current, nextBorderColor);
    }
  }, [globeMaterial, isCursorInsideIndia]);

  useEffect(() => {
    if (!isGlobeReady) {
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

    globeRef.current?.renderer().setPixelRatio(TARGET_RENDER_PIXEL_RATIO);

    if (!isActive) {
      clearIntroTimeouts();
      setIsGlobeVisible(false);
      return;
    }

    clearIntroTimeouts();
    setIsGlobeVisible(false);
    if (controls) {
      controls.autoRotate = false;
    }

    updatePointOfView(
      {
        ...MADRID_VIEW,
        altitude: getAltitudeFromZoom(INTRO_START_ZOOM)
      },
      0
    );

    const fadeTimeoutId = window.setTimeout(() => {
      setIsGlobeVisible(true);
    }, 80);
    introTimeoutsRef.current.push(fadeTimeoutId);

    queueIntroFlight(GLOBE_FADE_IN_MS);

    return () => {
      clearIntroTimeouts();
    };
  }, [
    clearIntroTimeouts,
    isActive,
    isGlobeReady,
    queueIntroFlight,
    updatePointOfView
  ]);

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
    updateLocationMarkerScale(currentPov.altitude);
  }, [currentPov.altitude]);

  useEffect(() => {
    if (!isGlobeReady || !isActive || fps === 0) {
      return;
    }

    if (fps < 30) {
      globeRef.current?.renderer().setPixelRatio(LOW_FPS_RENDER_PIXEL_RATIO);
      setOutlineDetail((currentDetail) =>
        currentDetail === MIN_OUTLINE_DETAIL
          ? currentDetail
          : Math.max(MIN_OUTLINE_DETAIL, Math.floor(currentDetail * 0.5))
      );
      return;
    }

    globeRef.current?.renderer().setPixelRatio(TARGET_RENDER_PIXEL_RATIO);
  }, [fps, isActive, isGlobeReady]);

  useEffect(() => {
    let animationFrameId = 0;
    let frameCount = 0;
    let lastSampleTime = performance.now();

    const measureFps = (currentTime: number) => {
      frameCount += 1;

      if (currentTime - lastSampleTime >= 1000) {
        setFps(
          Math.round((frameCount * 1000) / (currentTime - lastSampleTime))
        );
        frameCount = 0;
        lastSampleTime = currentTime;
      }

      animationFrameId = window.requestAnimationFrame(measureFps);
    };

    animationFrameId = window.requestAnimationFrame(measureFps);

    return () => {
      window.cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <section
      ref={containerRef}
      onPointerLeave={handlePointerLeave}
      className='relative min-h-screen overflow-hidden bg-black'
    >
      <div
        className={cn(
          'transition-opacity duration-700',
          isActive && isGlobeVisible ? 'opacity-100' : 'opacity-0'
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
      </div>

      {IS_DEV_PANEL_ENABLED && (
        <div className='absolute top-5 left-5 z-[10000] rounded-md border border-white/15 bg-black/75 px-3 py-2 font-mono text-xs text-white shadow-2xl backdrop-blur-md'>
          <span className='text-white/45'>FPS</span>{' '}
          <span className='tabular-nums'>{fps}</span>
        </div>
      )}

      {IS_DEV_PANEL_ENABLED && (
        <aside
          data-v2-dev-control='true'
          className='absolute top-5 right-5 z-[10000] w-[260px] rounded-md border border-white/15 bg-black/75 p-4 text-white shadow-2xl backdrop-blur-md'
        >
          <div className='mb-4 flex items-center justify-between gap-3'>
            <h2 className='text-xs font-medium tracking-[0.22em] text-white/70 uppercase'>
              Dev controls
            </h2>
            <span className='rounded-sm border border-white/10 px-2 py-1 text-[10px] leading-none text-white/45'>
              V2
            </span>
          </div>

          {flowSteps.length > 0 && activeStep && onStepChange && (
            <div className='mb-5 border-b border-white/10 pb-4'>
              <div className='mb-2 text-xs text-white/65'>Flow</div>
              <div className='grid grid-cols-2 overflow-hidden rounded-md border border-white/15'>
                {flowSteps.map((step) => (
                  <button
                    key={step.id}
                    type='button'
                    onClick={() => {
                      onStepChange(step.id);
                    }}
                    className={cn(
                      'min-h-9 px-3 text-xs transition-colors',
                      activeStep === step.id
                        ? 'bg-white text-black'
                        : 'bg-white/0 text-white/65 hover:bg-white/10',
                      step.id !== flowSteps[0]?.id && 'border-l border-white/15'
                    )}
                  >
                    {step.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <label className='block'>
            <span className='mb-2 flex items-center justify-between text-xs text-white/65'>
              <span>Zoom</span>
              <span>{getDisplayZoomFromAltitude(currentPov.altitude)}%</span>
            </span>
            <input
              type='range'
              min={MIN_DISPLAY_ZOOM}
              max={MAX_DISPLAY_ZOOM}
              step='1'
              value={getDisplayZoomFromAltitude(currentPov.altitude)}
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
