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
const MIN_EXTENDED_ALTITUDE = 0.12;
const MAX_ZOOM = 1500;
const INTRO_START_ZOOM = 250;
const INTRO_END_ZOOM = 1425;
const MIN_DISPLAY_ZOOM = 0;
const INTRO_END_DISPLAY_ZOOM = 100;
const MAX_DISPLAY_ZOOM = 300;
const MIN_OUTLINE_DETAIL = 10;
const MAX_OUTLINE_DETAIL = 100;
const DEFAULT_OUTLINE_DETAIL = MIN_OUTLINE_DETAIL;
const MIN_ROTATION_SPEED = 0.1;
const MAX_ROTATION_SPEED = 3;
const DEFAULT_ROTATION_SPEED = 0.35;
const GLOBE_FADE_IN_MS = 700;
const INTRO_FLIGHT_MS = 7800;
const LOCATION_MARKER_ALTITUDE = 0.01;
const INTRO_STATE_SYNC_MS = 120;
const BORDER_LINE_ALTITUDE = 0.01;
const STAGE_THEME_TRANSITION_MS = 900;
const TARGET_RENDER_PIXEL_RATIO = 1;
const LOW_FPS_RENDER_PIXEL_RATIO = 0.75;
const DEFAULT_GLOBE_COLOR = '#0e0e0e';
const DEFAULT_BORDER_COLOR = '#f4f4f1';
const INDIA_HOVER_GLOBE_COLOR = '#d8c7aa';
const INDIA_HOVER_BORDER_COLOR = '#2f1d13';
const LOCATION_MARKER_COLOR = INDIA_HOVER_BORDER_COLOR;
const LOCATION_MARKER_PULSE_KEYFRAMES = 'v2-location-marker-breathe';
const LOCATION_MARKER_PULSE_DURATION_MS = 3200;
const LOCATION_MARKER_HINT_PULSE_COUNT = 3;
const LOCATION_CALLOUT_EXTENSION_START = 200;
const LOCATION_CALLOUT_EXTENSION_END = 760;
const LOCATION_CALLOUT_EXTENSION_LENGTH =
  LOCATION_CALLOUT_EXTENSION_END - LOCATION_CALLOUT_EXTENSION_START;
const LOCATION_CALLOUT_BASE_LENGTH =
  Math.hypot(64, 37) + (LOCATION_CALLOUT_EXTENSION_START - 64);
const LOCATION_CALLOUT_BASE_FRACTION =
  LOCATION_CALLOUT_BASE_LENGTH /
  (LOCATION_CALLOUT_BASE_LENGTH + LOCATION_CALLOUT_EXTENSION_LENGTH);
const LOCATION_CALLOUT_OPEN_MS = 1200;
const LOCATION_CALLOUT_CLOSE_MS = 200;
const LOCATION_FOCUS_TRANSITION_MS = 1200;
const LOCATION_FOCUS_TIMING_FUNCTION = 'cubic-bezier(0.25, 0.46, 0.45, 0.94)';
const LOCATION_CONTENT_TRANSITION_MS = 100;
const LOCATION_CONTENT_REVEAL_MS = 100;
const LOCATION_MODAL_WIDTH_RATIO = 0.6;
const LOCATION_MODAL_HEIGHT_RATIO = 0.7;
const LOCATION_MODAL_RIGHT_OFFSET_RATIO = 0.08;
const LOCATION_SELECT_EVENT = 'v2-globe-location-select';
const LOCATION_CONTENT_CLOSE_EVENT = 'v2-globe-location-content-close';
const LOCATION_MARKER_WHEEL_EVENT = 'v2-globe-location-marker-wheel';
const LOCATION_MARKER_SELECTED_EVENT = 'v2-globe-location-marker-selected';
const LOCATION_MARKER_RESET_EVENT = 'v2-globe-location-marker-reset';
const IS_DEV_PANEL_ENABLED = process.env.NODE_ENV === 'development';
const SKIP_INITIAL_TRANSITION_STORAGE_KEY = 'v2-skip-initial-transition';
const ACTIVE_LOCATION_MARKER_DATA_KEY = 'v2ActiveLocationMarkerId';
const DEV_PANEL_WIDTH = 260;
let currentLocationMarkerScale = 1;
let activeLocationMarkerId: string | null = null;

const V2_COLOR_TOKENS = [
  {
    name: 'Page black',
    hex: '#000000',
    useCase: 'V2 screen background'
  },
  {
    name: 'Globe off black',
    hex: DEFAULT_GLOBE_COLOR,
    useCase: 'Default globe fill'
  },
  {
    name: 'Outline off white',
    hex: DEFAULT_BORDER_COLOR,
    useCase: 'Default country borders and text callout copy'
  },
  {
    name: 'India beige',
    hex: INDIA_HOVER_GLOBE_COLOR,
    useCase: 'Stage three / India focus globe fill'
  },
  {
    name: 'Coffee',
    hex: INDIA_HOVER_BORDER_COLOR,
    useCase: 'India borders, marker, pulse, callout line'
  }
];

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

type ColorMaterial = THREE.Material & { color: THREE.Color };
type DevPanelPosition = {
  x: number;
  y: number;
};
type DevPanelDragState = DevPanelPosition & {
  pointerId: number;
  offsetX: number;
  offsetY: number;
  width: number;
  height: number;
};
type ScreenPoint = {
  calloutSide?: 'left' | 'right';
  x: number;
  y: number;
  calloutWidth?: number;
};
type LocationSelectEvent = CustomEvent<{ id: string; anchor: ScreenPoint }>;
type LocationContentCloseEvent = CustomEvent<{ id: string }>;
type LocationMarkerWheelEvent = CustomEvent<{ deltaY: number }>;
type LocationMarkerSelectedEvent = CustomEvent<{ id: string }>;

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

function getInterpolatedHexColor(from: string, to: string, progress: number) {
  const color = new THREE.Color(from);

  color.lerp(new THREE.Color(to), Math.max(0, Math.min(1, progress)));

  return `#${color.getHexString()}`;
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

function clampLatitude(latitude: number) {
  return Math.max(-72, Math.min(72, latitude));
}

function clampAltitude(altitude: number) {
  return Math.max(MIN_EXTENDED_ALTITUDE, Math.min(MAX_ALTITUDE, altitude));
}

function getZoomFromAltitude(altitude: number) {
  const clampedAltitude = Math.max(
    MIN_ALTITUDE,
    Math.min(MAX_ALTITUDE, altitude)
  );

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
  const clampedAltitude = clampAltitude(altitude);
  const endAltitude = getAltitudeFromZoom(INTRO_END_ZOOM);

  if (clampedAltitude >= endAltitude) {
    const displayZoom =
      ((getZoomFromAltitude(clampedAltitude) - INTRO_START_ZOOM) /
        (INTRO_END_ZOOM - INTRO_START_ZOOM)) *
      INTRO_END_DISPLAY_ZOOM;

    return Math.round(
      Math.max(MIN_DISPLAY_ZOOM, Math.min(INTRO_END_DISPLAY_ZOOM, displayZoom))
    );
  }

  const extendedZoom =
    INTRO_END_DISPLAY_ZOOM +
    ((endAltitude - clampedAltitude) / (endAltitude - MIN_EXTENDED_ALTITUDE)) *
      (MAX_DISPLAY_ZOOM - INTRO_END_DISPLAY_ZOOM);

  return Math.round(
    Math.max(INTRO_END_DISPLAY_ZOOM, Math.min(MAX_DISPLAY_ZOOM, extendedZoom))
  );
}

function getAltitudeFromDisplayZoom(displayZoom: number) {
  const clampedDisplayZoom = Math.max(
    MIN_DISPLAY_ZOOM,
    Math.min(MAX_DISPLAY_ZOOM, displayZoom)
  );

  if (clampedDisplayZoom > INTRO_END_DISPLAY_ZOOM) {
    const extendedProgress =
      (clampedDisplayZoom - INTRO_END_DISPLAY_ZOOM) /
      (MAX_DISPLAY_ZOOM - INTRO_END_DISPLAY_ZOOM);
    const endAltitude = getAltitudeFromZoom(INTRO_END_ZOOM);

    return (
      endAltitude + (MIN_EXTENDED_ALTITUDE - endAltitude) * extendedProgress
    );
  }

  const rawZoom =
    INTRO_START_ZOOM +
    (clampedDisplayZoom / INTRO_END_DISPLAY_ZOOM) *
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
  currentLocationMarkerScale = markerScale;

  document
    .querySelectorAll<HTMLElement>('[data-v2-location-marker="true"]')
    .forEach((markerElement) => {
      markerElement.style.setProperty(
        '--location-marker-scale',
        markerScale.toFixed(3)
      );
    });
}

function getLocationMarkerLineEndpoint(locationId: string) {
  const markerElement = document.querySelector<HTMLElement>(
    `[data-v2-location-id="${locationId}"]`
  );

  if (!markerElement) {
    return null;
  }

  const markerRect = markerElement.getBoundingClientRect();
  const markerScale = Number(
    markerElement.style.getPropertyValue('--location-marker-scale') || 1
  );
  const calloutSide: ScreenPoint['calloutSide'] =
    markerElement.dataset.v2LocationCalloutSide === 'left' ? 'left' : 'right';
  const directionMultiplier = calloutSide === 'left' ? -1 : 1;

  return {
    calloutSide,
    calloutWidth: LOCATION_CALLOUT_EXTENSION_LENGTH * markerScale,
    x:
      markerRect.left +
      directionMultiplier * (LOCATION_CALLOUT_EXTENSION_END + 2) * markerScale,
    y: markerRect.top - 37 * markerScale
  };
}

function getNearestLocationMarkerElement(event: PointerEvent) {
  let nearestMarker: HTMLElement | null = null;
  let nearestDistance = Number.POSITIVE_INFINITY;

  document
    .querySelectorAll<HTMLElement>('[data-v2-location-marker="true"]')
    .forEach((markerElement) => {
      const rect = markerElement.getBoundingClientRect();
      const markerScale = Number(
        markerElement.style.getPropertyValue('--location-marker-scale') || 1
      );
      const hitRadius = 14 * markerScale;
      const distance = Math.hypot(
        event.clientX - rect.left,
        event.clientY - rect.top
      );

      if (distance > hitRadius || distance >= nearestDistance) {
        return;
      }

      nearestMarker = markerElement;
      nearestDistance = distance;
    });

  return nearestMarker;
}

function getActiveLocationMarkerId() {
  return (
    document.documentElement.dataset[ACTIVE_LOCATION_MARKER_DATA_KEY] ??
    activeLocationMarkerId
  );
}

function setActiveLocationMarkerId(locationId: string | null) {
  activeLocationMarkerId = locationId;

  if (locationId) {
    document.documentElement.dataset[ACTIVE_LOCATION_MARKER_DATA_KEY] =
      locationId;
    return;
  }

  delete document.documentElement.dataset[ACTIVE_LOCATION_MARKER_DATA_KEY];
}

function resetLocationMarkerState() {
  setActiveLocationMarkerId(null);
  window.dispatchEvent(new CustomEvent(LOCATION_MARKER_RESET_EVENT));
}

function getLocationContentLayout(
  size: { width: number; height: number },
  anchor: ScreenPoint | null
) {
  const desiredModalWidth = Math.max(
    320,
    Math.min(
      1100,
      anchor?.calloutWidth ?? size.width * LOCATION_MODAL_WIDTH_RATIO
    )
  );
  const modalWidth = anchor
    ? anchor.calloutSide === 'left'
      ? Math.min(desiredModalWidth, Math.max(320, size.width - anchor.x - 24))
      : Math.min(desiredModalWidth, Math.max(320, anchor.x - 24))
    : desiredModalWidth;
  const modalHeight = Math.max(320, size.height * LOCATION_MODAL_HEIGHT_RATIO);
  const modalRightOffset = size.width * LOCATION_MODAL_RIGHT_OFFSET_RATIO;
  const fallbackLeft = Math.max(24, size.width - modalRightOffset - modalWidth);
  const modalLeft = anchor
    ? anchor.calloutSide === 'left'
      ? Math.max(24, Math.min(size.width - modalWidth - 24, anchor.x))
      : Math.max(
          24,
          Math.min(size.width - modalWidth - 24, anchor.x - modalWidth)
        )
    : fallbackLeft;
  const centeredTop = (size.height - modalHeight) / 2;
  const anchorTop = anchor ? anchor.y - modalHeight / 2 : centeredTop;
  const modalTop = Math.max(
    24,
    Math.min(size.height - modalHeight - 24, anchorTop)
  );
  const lineY = modalTop + modalHeight / 2;
  const lineStartX = anchor?.x ?? modalLeft;

  return {
    lineStartX,
    lineY,
    modalHeight,
    modalLeft,
    modalTop,
    modalWidth
  };
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
  const calloutSide = pin.calloutSide ?? 'right';
  const isLeftCallout = calloutSide === 'left';
  const isClickHintEnabled = pin.showClickHint !== false;
  const directionMultiplier = isLeftCallout ? -1 : 1;
  const element = document.createElement('div');
  const style = document.createElement('style');
  const marker = document.createElement('div');
  const hitArea = document.createElement('div');
  const pulseSquare = document.createElement('div');
  const square = document.createElement('div');
  const clickHint = document.createElement('div');
  const clickHintText = document.createElement('span');
  const clickHintLine = document.createElementNS(
    'http://www.w3.org/2000/svg',
    'svg'
  );
  const clickHintPath = document.createElementNS(
    'http://www.w3.org/2000/svg',
    'path'
  );
  const callout = document.createElement('div');
  const calloutLine = document.createElementNS(
    'http://www.w3.org/2000/svg',
    'svg'
  );
  const calloutPath = document.createElementNS(
    'http://www.w3.org/2000/svg',
    'path'
  );
  const content = document.createElement('div');
  const title = document.createElement('div');
  const date = document.createElement('div');
  const location = document.createElement('div');
  const coordinates = document.createElement('div');

  element.setAttribute('role', 'button');
  element.setAttribute(
    'aria-label',
    `${pin.title}. ${pin.location}. ${pin.coordinates}`
  );
  element.dataset.v2LocationMarker = 'true';
  element.dataset.v2LocationId = pin.id;
  element.dataset.v2LocationCalloutSide = calloutSide;
  element.style.setProperty(
    '--location-marker-scale',
    currentLocationMarkerScale.toFixed(3)
  );
  element.tabIndex = 0;
  element.style.position = 'relative';
  element.style.width = '0';
  element.style.height = '0';
  element.style.pointerEvents = 'auto';
  element.style.cursor = 'pointer';
  element.style.opacity = '0';
  element.style.outline = 'none';
  element.style.transition = `opacity ${STAGE_THEME_TRANSITION_MS}ms ease`;

  style.textContent = `
    @keyframes ${LOCATION_MARKER_PULSE_KEYFRAMES} {
      0%, 100% {
        transform: translate(-50%, -50%) scale(1);
        background: rgba(47, 29, 19, 0.16);
      }

      50% {
        transform: translate(-50%, -50%) scale(2);
        background: rgba(47, 29, 19, 0.22);
      }
    }
  `;

  window.requestAnimationFrame(() => {
    element.style.opacity = '1';
  });

  marker.style.position = 'absolute';
  marker.style.left = '0';
  marker.style.top = '0';
  marker.style.width = '220px';
  marker.style.height = '112px';
  marker.style.pointerEvents = 'none';
  marker.style.transform = 'scale(var(--location-marker-scale))';
  marker.style.transformOrigin = '0 0';
  marker.style.transition = 'transform 220ms cubic-bezier(0.22, 1, 0.36, 1)';

  hitArea.style.position = 'absolute';
  hitArea.style.top = '0';
  hitArea.style.left = '0';
  hitArea.style.display = 'grid';
  hitArea.style.width = '40px';
  hitArea.style.height = '40px';
  hitArea.style.placeItems = 'center';
  hitArea.style.cursor = 'pointer';
  hitArea.style.pointerEvents = 'auto';
  hitArea.style.transform = 'translate(-50%, -50%)';
  hitArea.style.transition = 'transform 260ms ease';

  pulseSquare.style.position = 'absolute';
  pulseSquare.style.top = '50%';
  pulseSquare.style.left = '50%';
  pulseSquare.style.width = '12px';
  pulseSquare.style.height = '12px';
  pulseSquare.style.background = 'rgba(47, 29, 19, 0.16)';
  pulseSquare.style.pointerEvents = 'none';
  pulseSquare.style.transform = 'translate(-50%, -50%)';
  pulseSquare.style.animation = `${LOCATION_MARKER_PULSE_KEYFRAMES} ${LOCATION_MARKER_PULSE_DURATION_MS}ms ease-in-out infinite`;
  pulseSquare.style.transition = 'transform 260ms ease, background 260ms ease';

  clickHint.style.position = 'absolute';
  clickHint.style.left = '-210px';
  clickHint.style.top = '-104px';
  clickHint.style.width = '212px';
  clickHint.style.height = '104px';
  clickHint.style.color = LOCATION_MARKER_COLOR;
  clickHint.style.display = isClickHintEnabled ? 'block' : 'none';
  clickHint.style.opacity = '0';
  clickHint.style.cursor = 'pointer';
  clickHint.style.pointerEvents = 'auto';
  clickHint.style.transform = 'translate3d(8px, 0, 0)';
  clickHint.style.transition =
    'opacity 360ms ease, transform 360ms cubic-bezier(0.22, 1, 0.36, 1)';

  clickHintLine.setAttribute('viewBox', '0 0 212 104');
  clickHintLine.style.position = 'absolute';
  clickHintLine.style.left = '0';
  clickHintLine.style.top = '0';
  clickHintLine.style.width = '212px';
  clickHintLine.style.height = '104px';
  clickHintLine.style.overflow = 'visible';

  clickHintPath.setAttribute('d', 'M212 104 L148 67 L12 67');
  clickHintPath.setAttribute('fill', 'none');
  clickHintPath.setAttribute('stroke', LOCATION_MARKER_COLOR);
  clickHintPath.setAttribute('stroke-width', '2.5');
  clickHintPath.setAttribute('stroke-linecap', 'square');
  clickHintPath.setAttribute('stroke-linejoin', 'miter');
  clickHintPath.setAttribute('pathLength', '1');
  clickHintPath.style.filter = 'drop-shadow(0 0 12px rgba(47, 29, 19, 0.32))';
  clickHintPath.style.strokeDasharray = '1';
  clickHintPath.style.strokeDashoffset = '1';
  clickHintPath.style.transition =
    'stroke-dashoffset 680ms cubic-bezier(0.22, 1, 0.36, 1)';

  clickHintText.textContent = isClickHintEnabled ? 'Click me' : '';
  clickHintText.style.position = 'absolute';
  clickHintText.style.left = '12px';
  clickHintText.style.bottom = '48px';
  clickHintText.style.fontSize = '11px';
  clickHintText.style.fontWeight = '600';
  clickHintText.style.letterSpacing = '0.12em';
  clickHintText.style.lineHeight = '1';
  clickHintText.style.opacity = '0';
  clickHintText.style.textTransform = 'uppercase';
  clickHintText.style.transform = 'translate3d(0, 10px, 0)';
  clickHintText.style.transition =
    'opacity 360ms ease 700ms, transform 360ms cubic-bezier(0.22, 1, 0.36, 1) 700ms';

  square.style.position = 'relative';
  square.style.width = '12px';
  square.style.height = '12px';
  square.style.background = LOCATION_MARKER_COLOR;
  square.style.border = '1px solid rgba(216, 199, 170, 0.85)';
  square.style.pointerEvents = 'none';
  square.style.transition = 'background 260ms ease';

  callout.style.position = 'absolute';
  callout.style.left = '2px';
  callout.style.top = '-104px';
  callout.style.width = '212px';
  callout.style.height = '104px';
  callout.style.pointerEvents = 'none';

  calloutLine.setAttribute('viewBox', '0 0 212 104');
  calloutLine.style.position = 'absolute';
  calloutLine.style.left = '0';
  calloutLine.style.top = '0';
  calloutLine.style.width = '212px';
  calloutLine.style.height = '104px';
  calloutLine.style.overflow = 'visible';

  calloutPath.setAttribute(
    'd',
    `M0 104 L${64 * directionMultiplier} 67 L${
      LOCATION_CALLOUT_EXTENSION_END * directionMultiplier
    } 67`
  );
  calloutPath.setAttribute('fill', 'none');
  calloutPath.setAttribute('stroke', LOCATION_MARKER_COLOR);
  calloutPath.setAttribute('stroke-width', '2.5');
  calloutPath.setAttribute('stroke-linecap', 'square');
  calloutPath.setAttribute('stroke-linejoin', 'miter');
  calloutPath.setAttribute('pathLength', '1');
  calloutPath.style.filter = 'drop-shadow(0 0 12px rgba(47, 29, 19, 0.32))';
  calloutPath.style.strokeDasharray = `${LOCATION_CALLOUT_BASE_FRACTION} 1`;
  calloutPath.style.strokeDashoffset = `${LOCATION_CALLOUT_BASE_FRACTION}`;
  calloutPath.style.transition =
    'stroke-dasharray 680ms cubic-bezier(0.22, 1, 0.36, 1), stroke-dashoffset 680ms cubic-bezier(0.22, 1, 0.36, 1)';

  content.style.position = 'absolute';
  if (isLeftCallout) {
    content.style.right = '274px';
    content.style.textAlign = 'right';
  } else {
    content.style.left = '62px';
  }
  content.style.top = '0';
  content.style.height = '104px';
  content.style.minWidth = '360px';
  content.style.color = LOCATION_MARKER_COLOR;
  content.style.opacity = '0';
  content.style.transform = 'translate3d(0, 10px, 0)';
  content.style.transition = `opacity 360ms ease ${LOCATION_CALLOUT_CLOSE_MS}ms, transform 360ms cubic-bezier(0.22, 1, 0.36, 1) ${LOCATION_CALLOUT_CLOSE_MS}ms`;

  title.textContent = pin.title;
  title.style.fontSize = '13px';
  title.style.fontWeight = '600';
  title.style.letterSpacing = '0';
  title.style.lineHeight = '1.2';
  title.style.position = 'absolute';
  title.style.bottom = pin.date ? '84px' : '68px';
  title.style.textTransform = 'none';
  if (isLeftCallout) {
    title.style.right = '0';
  } else {
    title.style.left = '0';
  }

  date.textContent = pin.date ?? '';
  date.style.display = pin.date ? 'block' : 'none';
  date.style.position = 'absolute';
  date.style.bottom = '70px';
  date.style.marginTop = '0';
  date.style.color = 'rgba(47, 29, 19, 0.72)';
  date.style.fontSize = '10px';
  date.style.lineHeight = '1.2';
  if (isLeftCallout) {
    date.style.right = '0';
  } else {
    date.style.left = '0';
  }

  location.textContent = pin.location;
  location.style.position = 'absolute';
  location.style.bottom = '45px';
  location.style.marginTop = '0';
  location.style.fontSize = '16px';
  location.style.fontWeight = '700';
  location.style.letterSpacing = '0.08em';
  location.style.lineHeight = '1.2';
  location.style.textTransform = 'uppercase';
  if (isLeftCallout) {
    location.style.right = '0';
  } else {
    location.style.left = '0';
  }

  coordinates.textContent = pin.coordinates;
  coordinates.style.position = 'absolute';
  coordinates.style.top = '75px';
  coordinates.style.marginTop = '0';
  coordinates.style.color = 'rgba(47, 29, 19, 0.62)';
  coordinates.style.fontSize = '10px';
  coordinates.style.fontWeight = '600';
  coordinates.style.lineHeight = '1.2';
  if (isLeftCallout) {
    coordinates.style.right = '0';
  } else {
    coordinates.style.left = '0';
  }

  content.append(title, date, location, coordinates);
  calloutLine.append(calloutPath);
  callout.append(calloutLine, content);
  clickHintLine.append(clickHintPath);
  if (isClickHintEnabled) {
    clickHint.append(clickHintLine, clickHintText);
  }
  hitArea.append(pulseSquare, square);
  marker.append(hitArea, ...(isClickHintEnabled ? [clickHint] : []), callout);
  element.append(style, marker);

  let isTooltipVisible = false;
  let isTooltipSuppressed = false;
  let isLocationContentOpen = false;
  let isCalloutRetracting = false;
  let calloutRetractTimeout: number | null = null;
  let pulseCount = 0;
  let isClickHintDismissed = !isClickHintEnabled;

  const showClickHint = () => {
    if (!isClickHintEnabled || isClickHintDismissed) {
      return;
    }

    clickHint.style.opacity = '1';
    clickHint.style.transform = 'translate3d(0, 0, 0)';
    clickHintPath.style.strokeDashoffset = '0';
    clickHintText.style.opacity = '1';
    clickHintText.style.transform = 'translate3d(0, 0, 0)';
  };
  const hideClickHint = () => {
    if (!isClickHintEnabled) {
      return;
    }

    clickHint.style.opacity = '0';
    clickHint.style.transform = 'translate3d(8px, 0, 0)';
    clickHintPath.style.strokeDashoffset = '1';
    clickHintText.style.opacity = '0';
    clickHintText.style.transform = 'translate3d(0, 10px, 0)';
  };
  const setCalloutState = (
    state: 'hidden' | 'base' | 'full',
    durationMs: number,
    timingFunction = 'cubic-bezier(0.22, 1, 0.36, 1)',
    delayMs = 0
  ) => {
    calloutPath.style.transition = [
      `stroke-dasharray ${durationMs}ms ${timingFunction} ${delayMs}ms`,
      `stroke-dashoffset ${durationMs}ms ${timingFunction} ${delayMs}ms`
    ].join(', ');

    if (state === 'full') {
      calloutPath.style.strokeDasharray = '1 0';
      calloutPath.style.strokeDashoffset = '0';
      return;
    }

    calloutPath.style.strokeDasharray = `${LOCATION_CALLOUT_BASE_FRACTION} 1`;
    calloutPath.style.strokeDashoffset =
      state === 'base' ? '0' : `${LOCATION_CALLOUT_BASE_FRACTION}`;
  };

  const showTooltip = () => {
    const selectedLocationMarkerId = getActiveLocationMarkerId();

    if (
      isTooltipVisible ||
      isTooltipSuppressed ||
      isCalloutRetracting ||
      (selectedLocationMarkerId !== null && selectedLocationMarkerId !== pin.id)
    ) {
      return;
    }

    isTooltipVisible = true;
    isClickHintDismissed = true;
    hideClickHint();
    square.style.background = LOCATION_MARKER_COLOR;
    setCalloutState('base', LOCATION_CALLOUT_CLOSE_MS);
    content.style.transition = `opacity 360ms ease ${LOCATION_CALLOUT_CLOSE_MS}ms, transform 360ms cubic-bezier(0.22, 1, 0.36, 1) ${LOCATION_CALLOUT_CLOSE_MS}ms`;
    content.style.opacity = '1';
    content.style.transform = 'translate3d(0, 0, 0)';
  };
  const hideTooltipContent = () => {
    content.style.transition =
      'opacity 320ms ease, transform 320ms cubic-bezier(0.22, 1, 0.36, 1)';
    content.style.opacity = '0';
    content.style.transform = 'translate3d(0, 10px, 0)';
  };
  const retractCallout = (lockHover = false) => {
    if (calloutRetractTimeout !== null) {
      window.clearTimeout(calloutRetractTimeout);
      calloutRetractTimeout = null;
    }

    if (lockHover) {
      isCalloutRetracting = true;
      calloutRetractTimeout = window.setTimeout(() => {
        isCalloutRetracting = false;
        calloutRetractTimeout = null;
      }, LOCATION_CALLOUT_CLOSE_MS + 50);
    }

    isTooltipVisible = false;
    square.style.background = LOCATION_MARKER_COLOR;
    hideTooltipContent();
    setCalloutState(
      'hidden',
      LOCATION_CALLOUT_CLOSE_MS,
      LOCATION_FOCUS_TIMING_FUNCTION
    );
  };
  const hideTooltip = () => {
    if (!isTooltipVisible) {
      return;
    }

    if (isLocationContentOpen) {
      hideTooltipContent();
      setCalloutState('full', LOCATION_CALLOUT_OPEN_MS);
      return;
    }

    retractCallout();
  };
  const handleWindowPointerMove = (event: PointerEvent) => {
    if (!element.isConnected) {
      if (calloutRetractTimeout !== null) {
        window.clearTimeout(calloutRetractTimeout);
      }

      window.removeEventListener('pointermove', handleWindowPointerMove);
      window.removeEventListener(
        LOCATION_CONTENT_CLOSE_EVENT,
        handleLocationContentClose
      );
      window.removeEventListener(
        LOCATION_MARKER_SELECTED_EVENT,
        handleLocationMarkerSelected
      );
      window.removeEventListener(
        LOCATION_MARKER_RESET_EVENT,
        handleLocationMarkerReset
      );
      return;
    }

    if (isCalloutRetracting) {
      return;
    }

    const selectedLocationMarkerId = getActiveLocationMarkerId();

    if (
      selectedLocationMarkerId !== null &&
      selectedLocationMarkerId !== pin.id
    ) {
      retractCallout(true);
      return;
    }

    const nearestMarkerElement = getNearestLocationMarkerElement(event);

    if (nearestMarkerElement && nearestMarkerElement !== element) {
      hideTooltip();
      return;
    }

    if (nearestMarkerElement === element) {
      showTooltip();
      return;
    }

    if (isLocationContentOpen) {
      hideTooltipContent();
      setCalloutState('full', 0);
      return;
    }

    isTooltipSuppressed = false;

    if (document.activeElement !== element) {
      hideTooltip();
    }
  };
  const handleMarkerSelect = (event: MouseEvent | KeyboardEvent) => {
    event.stopPropagation();
    if (calloutRetractTimeout !== null) {
      window.clearTimeout(calloutRetractTimeout);
      calloutRetractTimeout = null;
    }

    isCalloutRetracting = false;
    isClickHintDismissed = true;
    isTooltipSuppressed = true;
    isLocationContentOpen = true;
    setActiveLocationMarkerId(pin.id);
    hideClickHint();
    isTooltipVisible = true;
    setCalloutState(
      'full',
      LOCATION_CALLOUT_OPEN_MS,
      LOCATION_FOCUS_TIMING_FUNCTION
    );
    hideTooltipContent();

    const elementRect = element.getBoundingClientRect();
    const markerScale = Number(
      element.style.getPropertyValue('--location-marker-scale') || 1
    );
    const anchor = {
      calloutSide,
      calloutWidth: LOCATION_CALLOUT_EXTENSION_LENGTH * markerScale,
      x:
        elementRect.left +
        directionMultiplier *
          (LOCATION_CALLOUT_EXTENSION_END + 2) *
          markerScale,
      y: elementRect.top - 37 * markerScale
    };

    window.dispatchEvent(
      new CustomEvent(LOCATION_MARKER_SELECTED_EVENT, {
        detail: {
          id: pin.id
        }
      })
    );

    window.dispatchEvent(
      new CustomEvent(LOCATION_SELECT_EVENT, {
        detail: {
          anchor,
          id: pin.id
        }
      })
    );
  };
  const handleMarkerWheel = (event: WheelEvent) => {
    event.preventDefault();
    event.stopPropagation();

    window.dispatchEvent(
      new CustomEvent(LOCATION_MARKER_WHEEL_EVENT, {
        detail: {
          deltaY: event.deltaY
        }
      })
    );
  };
  const handleHitAreaPointerEnter = (event: PointerEvent) => {
    if (getNearestLocationMarkerElement(event) !== element) {
      return;
    }

    showTooltip();
  };
  const handleMarkerKeyDown = (event: KeyboardEvent) => {
    if (event.key !== 'Enter' && event.key !== ' ') {
      return;
    }

    event.preventDefault();
    handleMarkerSelect(event);
  };
  const handlePulseIteration = () => {
    if (!isClickHintEnabled || isClickHintDismissed) {
      return;
    }

    pulseCount += 1;

    if (
      !isClickHintDismissed &&
      pulseCount >= LOCATION_MARKER_HINT_PULSE_COUNT
    ) {
      showClickHint();
    }
  };
  const handleLocationContentClose = (event: Event) => {
    const { id: locationId } = (event as LocationContentCloseEvent).detail;

    if (locationId === getActiveLocationMarkerId()) {
      setActiveLocationMarkerId(null);
    }

    if (locationId !== pin.id) {
      return;
    }

    isTooltipSuppressed = true;
    isLocationContentOpen = false;
    retractCallout(true);
  };
  const handleLocationMarkerSelected = (event: Event) => {
    const { id: locationId } = (event as LocationMarkerSelectedEvent).detail;

    if (locationId === pin.id) {
      return;
    }

    isTooltipSuppressed = true;
    isLocationContentOpen = false;
    retractCallout(true);
  };
  const handleLocationMarkerReset = () => {
    isTooltipSuppressed = false;
    isLocationContentOpen = false;
    retractCallout(true);
  };

  element.addEventListener('focus', showTooltip);
  element.addEventListener('blur', hideTooltip);
  element.addEventListener('keydown', handleMarkerKeyDown);
  marker.addEventListener('mouseleave', hideTooltip);
  if (isClickHintEnabled) {
    clickHint.addEventListener('click', handleMarkerSelect);
  }
  hitArea.addEventListener('click', handleMarkerSelect);
  hitArea.addEventListener('pointerenter', handleHitAreaPointerEnter);
  hitArea.addEventListener('wheel', handleMarkerWheel, { passive: false });
  element.addEventListener('wheel', handleMarkerWheel, { passive: false });
  pulseSquare.addEventListener('animationiteration', handlePulseIteration);
  window.addEventListener(
    LOCATION_CONTENT_CLOSE_EVENT,
    handleLocationContentClose
  );
  window.addEventListener(
    LOCATION_MARKER_SELECTED_EVENT,
    handleLocationMarkerSelected
  );
  window.addEventListener(
    LOCATION_MARKER_RESET_EVENT,
    handleLocationMarkerReset
  );
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
  const isSecondStageRef = useRef(false);
  const themeAnimationFrameRef = useRef<number | null>(null);
  const themeProgressRef = useRef(0);
  const devPanelDragRef = useRef<DevPanelDragState | null>(null);
  const locationContentAnimationFrameRef = useRef<number | null>(null);
  const locationContentTimeoutRef = useRef<number | null>(null);
  const locationContentRevealTimeoutRef = useRef<number | null>(null);
  const isLocationContentClosingRef = useRef(false);
  const previousLocationPovRef = useRef<GlobePointOfView | null>(null);
  const currentPovRef = useRef<GlobePointOfView>({
    ...MADRID_VIEW,
    altitude: getAltitudeFromZoom(INTRO_START_ZOOM)
  });
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [borderPaths, setBorderPaths] = useState<CountryBorderPath[]>([]);
  const [fps, setFps] = useState(0);
  const [isGlobeReady, setIsGlobeReady] = useState(false);
  const [isGlobeVisible, setIsGlobeVisible] = useState(false);
  const [currentPov, setCurrentPov] = useState<GlobePointOfView>(
    currentPovRef.current
  );
  const [outlineDetail, setOutlineDetail] = useState(DEFAULT_OUTLINE_DETAIL);
  const [isRotationEnabled, setIsRotationEnabled] = useState(false);
  const [rotationDirection, setRotationDirection] =
    useState<RotationDirection>('west');
  const [rotationSpeed, setRotationSpeed] = useState(DEFAULT_ROTATION_SPEED);
  const [devPanelPosition, setDevPanelPosition] =
    useState<DevPanelPosition | null>(null);
  const [isDevPanelOpen, setIsDevPanelOpen] = useState(false);
  const [isColorsModalOpen, setIsColorsModalOpen] = useState(false);
  const [hasLoadedDevPreferences, setHasLoadedDevPreferences] = useState(
    !IS_DEV_PANEL_ENABLED
  );
  const [shouldSkipInitialTransition, setShouldSkipInitialTransition] =
    useState(false);
  const [selectedLocation, setSelectedLocation] =
    useState<V2GlobeLocation | null>(null);
  const [selectedLocationAnchor, setSelectedLocationAnchor] =
    useState<ScreenPoint | null>(null);
  const [locationContentProgress, setLocationContentProgress] = useState(0);
  const [isLocationContentVisible, setIsLocationContentVisible] =
    useState(false);

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
  const isSecondStage = getDisplayZoomFromAltitude(currentPov.altitude) >= 100;
  const locationMarkers = useMemo(
    () =>
      V2_GLOBE_LOCATIONS.map((location) => ({
        ...location,
        altitude: LOCATION_MARKER_ALTITUDE
      })),
    []
  );
  const visibleLocationMarkers = useMemo(
    () => (isSecondStage ? locationMarkers : []),
    [isSecondStage, locationMarkers]
  );
  const locationContentLayout = useMemo(
    () => getLocationContentLayout(size, selectedLocationAnchor),
    [selectedLocationAnchor, size]
  );
  const applyThemeProgress = useCallback(
    (progress: number) => {
      const nextGlobeColor = getInterpolatedHexColor(
        DEFAULT_GLOBE_COLOR,
        INDIA_HOVER_GLOBE_COLOR,
        progress
      );
      const nextBorderColor = getInterpolatedHexColor(
        DEFAULT_BORDER_COLOR,
        INDIA_HOVER_BORDER_COLOR,
        progress
      );

      themeProgressRef.current = progress;
      setMaterialColor(globeMaterial, nextGlobeColor);
      if (borderLineMaterialRef.current) {
        setMaterialColor(borderLineMaterialRef.current, nextBorderColor);
      }
    },
    [globeMaterial]
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

    if (themeAnimationFrameRef.current !== null) {
      window.cancelAnimationFrame(themeAnimationFrameRef.current);
      themeAnimationFrameRef.current = null;
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
  const animateLocationContentProgress = useCallback(
    (from: number, to: number, durationMs: number, onComplete?: () => void) => {
      if (locationContentAnimationFrameRef.current !== null) {
        window.cancelAnimationFrame(locationContentAnimationFrameRef.current);
        locationContentAnimationFrameRef.current = null;
      }

      const startTime = performance.now();

      const animate = (currentTime: number) => {
        const elapsedMs = currentTime - startTime;
        const progress = Math.min(1, elapsedMs / durationMs);
        const nextProgress = from + (to - from) * progress;

        setLocationContentProgress(nextProgress);

        if (progress < 1) {
          locationContentAnimationFrameRef.current =
            window.requestAnimationFrame(animate);
          return;
        }

        setLocationContentProgress(to);
        locationContentAnimationFrameRef.current = null;
        onComplete?.();
      };

      setLocationContentProgress(from);
      locationContentAnimationFrameRef.current =
        window.requestAnimationFrame(animate);
    },
    []
  );
  const openLocationContent = useCallback(
    (location: V2GlobeLocation, anchor: ScreenPoint) => {
      clearIntroTimeouts();

      if (locationContentTimeoutRef.current !== null) {
        window.clearTimeout(locationContentTimeoutRef.current);
        locationContentTimeoutRef.current = null;
      }
      isLocationContentClosingRef.current = false;

      if (locationContentRevealTimeoutRef.current !== null) {
        window.clearTimeout(locationContentRevealTimeoutRef.current);
        locationContentRevealTimeoutRef.current = null;
      }

      if (!selectedLocation && !previousLocationPovRef.current) {
        previousLocationPovRef.current = currentPovRef.current;
      }

      setIsLocationContentVisible(false);
      setLocationContentProgress(0);
      setSelectedLocation(null);
      setSelectedLocationAnchor(null);
      updatePointOfView(
        {
          lat: location.focusView.lat,
          lng: location.focusView.lng,
          altitude: getAltitudeFromDisplayZoom(location.focusView.zoom)
        },
        LOCATION_FOCUS_TRANSITION_MS
      );

      locationContentRevealTimeoutRef.current = window.setTimeout(() => {
        const liveAnchor = getLocationMarkerLineEndpoint(location.id) ?? anchor;
        const containerRect = containerRef.current?.getBoundingClientRect();
        const relativeAnchor = containerRect
          ? {
              calloutSide: liveAnchor.calloutSide,
              calloutWidth: liveAnchor.calloutWidth,
              x: liveAnchor.x - containerRect.left,
              y: liveAnchor.y - containerRect.top
            }
          : liveAnchor;

        setSelectedLocation(location);
        setSelectedLocationAnchor(relativeAnchor);
        window.requestAnimationFrame(() => {
          setIsLocationContentVisible(true);
          animateLocationContentProgress(0, 1, LOCATION_CONTENT_REVEAL_MS);
        });
        locationContentRevealTimeoutRef.current = null;
      }, LOCATION_FOCUS_TRANSITION_MS);
    },
    [
      animateLocationContentProgress,
      clearIntroTimeouts,
      selectedLocation,
      updatePointOfView
    ]
  );
  const closeLocationContent = useCallback(() => {
    if (!selectedLocation || isLocationContentClosingRef.current) {
      return;
    }

    if (locationContentRevealTimeoutRef.current !== null) {
      window.clearTimeout(locationContentRevealTimeoutRef.current);
      locationContentRevealTimeoutRef.current = null;
    }

    const closingLocation = selectedLocation;
    const previousPov = previousLocationPovRef.current;
    isLocationContentClosingRef.current = true;

    setIsLocationContentVisible(false);
    animateLocationContentProgress(
      locationContentProgress,
      0,
      LOCATION_CONTENT_TRANSITION_MS,
      () => {
        window.dispatchEvent(
          new CustomEvent(LOCATION_CONTENT_CLOSE_EVENT, {
            detail: {
              id: closingLocation.id
            }
          })
        );
        resetLocationMarkerState();

        locationContentTimeoutRef.current = window.setTimeout(() => {
          setSelectedLocation(null);
          setSelectedLocationAnchor(null);

          if (previousPov) {
            updatePointOfView(previousPov, LOCATION_FOCUS_TRANSITION_MS);
            previousLocationPovRef.current = null;
          }

          isLocationContentClosingRef.current = false;
          locationContentTimeoutRef.current = null;
        }, LOCATION_CALLOUT_CLOSE_MS);
      }
    );
  }, [
    animateLocationContentProgress,
    locationContentProgress,
    selectedLocation,
    updatePointOfView
  ]);
  const handleDevPanelDragStart = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      if (event.button !== 0) {
        return;
      }

      const panel = event.currentTarget.closest('[data-v2-dev-control="true"]');

      if (!(panel instanceof HTMLElement)) {
        return;
      }

      const rect = panel.getBoundingClientRect();

      devPanelDragRef.current = {
        pointerId: event.pointerId,
        offsetX: event.clientX - rect.left,
        offsetY: event.clientY - rect.top,
        width: rect.width,
        height: rect.height,
        x: rect.left,
        y: rect.top
      };
      setDevPanelPosition({ x: rect.left, y: rect.top });
      event.currentTarget.setPointerCapture(event.pointerId);
      event.preventDefault();
    },
    []
  );
  const handleDevPanelDragMove = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      const dragState = devPanelDragRef.current;

      if (!dragState || dragState.pointerId !== event.pointerId) {
        return;
      }

      const maxX = Math.max(0, window.innerWidth - dragState.width);
      const maxY = Math.max(0, window.innerHeight - dragState.height);

      setDevPanelPosition({
        x: Math.max(0, Math.min(maxX, event.clientX - dragState.offsetX)),
        y: Math.max(0, Math.min(maxY, event.clientY - dragState.offsetY))
      });
    },
    []
  );
  const handleDevPanelDragEnd = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      const dragState = devPanelDragRef.current;

      if (!dragState || dragState.pointerId !== event.pointerId) {
        return;
      }

      devPanelDragRef.current = null;
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
    },
    []
  );
  const handleSkipInitialTransitionChange = useCallback(
    (isChecked: boolean) => {
      setShouldSkipInitialTransition(isChecked);
      window.localStorage.setItem(
        SKIP_INITIAL_TRANSITION_STORAGE_KEY,
        isChecked ? 'true' : 'false'
      );
    },
    []
  );
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
    if (!IS_DEV_PANEL_ENABLED) {
      return;
    }

    setShouldSkipInitialTransition(
      window.localStorage.getItem(SKIP_INITIAL_TRANSITION_STORAGE_KEY) ===
        'true'
    );
    setHasLoadedDevPreferences(true);
  }, []);

  useEffect(() => {
    if (!isActive) {
      if (locationContentAnimationFrameRef.current !== null) {
        window.cancelAnimationFrame(locationContentAnimationFrameRef.current);
        locationContentAnimationFrameRef.current = null;
      }

      if (locationContentRevealTimeoutRef.current !== null) {
        window.clearTimeout(locationContentRevealTimeoutRef.current);
        locationContentRevealTimeoutRef.current = null;
      }

      setIsLocationContentVisible(false);
      setLocationContentProgress(0);
      setSelectedLocation(null);
      setSelectedLocationAnchor(null);
      isLocationContentClosingRef.current = false;
      previousLocationPovRef.current = null;
      resetLocationMarkerState();
      return;
    }

    const handleLocationSelect = (event: Event) => {
      const { anchor, id: locationId } = (event as LocationSelectEvent).detail;
      const location = V2_GLOBE_LOCATIONS.find(
        (candidateLocation) => candidateLocation.id === locationId
      );

      if (!location) {
        return;
      }

      openLocationContent(location, anchor);
    };

    window.addEventListener(LOCATION_SELECT_EVENT, handleLocationSelect);

    return () => {
      window.removeEventListener(LOCATION_SELECT_EVENT, handleLocationSelect);
    };
  }, [isActive, openLocationContent]);

  useEffect(() => {
    return () => {
      if (locationContentTimeoutRef.current !== null) {
        window.clearTimeout(locationContentTimeoutRef.current);
      }

      if (locationContentAnimationFrameRef.current !== null) {
        window.cancelAnimationFrame(locationContentAnimationFrameRef.current);
      }

      if (locationContentRevealTimeoutRef.current !== null) {
        window.clearTimeout(locationContentRevealTimeoutRef.current);
      }
    };
  }, []);

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
      getInterpolatedHexColor(
        DEFAULT_BORDER_COLOR,
        INDIA_HOVER_BORDER_COLOR,
        themeProgressRef.current
      )
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
    if (themeAnimationFrameRef.current !== null) {
      window.cancelAnimationFrame(themeAnimationFrameRef.current);
      themeAnimationFrameRef.current = null;
    }

    const targetProgress = isSecondStage ? 1 : 0;
    const shouldEaseTheme = isSecondStage || isSecondStageRef.current;

    isSecondStageRef.current = isSecondStage;

    if (!shouldEaseTheme) {
      applyThemeProgress(targetProgress);
      return;
    }

    const startProgress = themeProgressRef.current;
    const startTime = performance.now();

    const animateTheme = (currentTime: number) => {
      const elapsedMs = currentTime - startTime;
      const progress = Math.min(1, elapsedMs / STAGE_THEME_TRANSITION_MS);
      const nextProgress =
        startProgress +
        (targetProgress - startProgress) * easeInOutCubic(progress);

      applyThemeProgress(nextProgress);

      if (progress < 1) {
        themeAnimationFrameRef.current =
          window.requestAnimationFrame(animateTheme);
      }
    };

    themeAnimationFrameRef.current = window.requestAnimationFrame(animateTheme);

    return () => {
      if (themeAnimationFrameRef.current !== null) {
        window.cancelAnimationFrame(themeAnimationFrameRef.current);
        themeAnimationFrameRef.current = null;
      }
    };
  }, [applyThemeProgress, isSecondStage]);

  useEffect(() => {
    if (!isGlobeReady || (IS_DEV_PANEL_ENABLED && !hasLoadedDevPreferences)) {
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

    if (IS_DEV_PANEL_ENABLED && shouldSkipInitialTransition) {
      updatePointOfView(getIntroPointOfView(1), 0);
      applyThemeProgress(1);
      setIsGlobeVisible(true);
      return;
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
    hasLoadedDevPreferences,
    isActive,
    isGlobeReady,
    applyThemeProgress,
    queueIntroFlight,
    shouldSkipInitialTransition,
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
  }, [currentPov.altitude, visibleLocationMarkers.length]);

  useEffect(() => {
    if (!isActive) {
      return;
    }

    const handleLocationMarkerWheel = (event: Event) => {
      const { deltaY } = (event as LocationMarkerWheelEvent).detail;
      const currentZoom = getDisplayZoomFromAltitude(
        currentPovRef.current.altitude
      );
      const nextZoom = Math.max(
        MIN_DISPLAY_ZOOM,
        Math.min(MAX_DISPLAY_ZOOM, currentZoom - deltaY * 0.08)
      );

      updatePointOfView(
        {
          ...currentPovRef.current,
          altitude: getAltitudeFromDisplayZoom(nextZoom)
        },
        0
      );
    };

    window.addEventListener(
      LOCATION_MARKER_WHEEL_EVENT,
      handleLocationMarkerWheel
    );

    return () => {
      window.removeEventListener(
        LOCATION_MARKER_WHEEL_EVENT,
        handleLocationMarkerWheel
      );
    };
  }, [isActive, updatePointOfView]);

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
            htmlElementsData={visibleLocationMarkers}
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
              updateLocationMarkerScale(pov.altitude);
            }}
          />
        )}
      </div>

      {IS_DEV_PANEL_ENABLED && (
        <div className='absolute top-5 left-5 z-[12000] rounded-md border border-white/15 bg-black/75 px-3 py-2 font-mono text-xs text-white shadow-2xl backdrop-blur-md'>
          <span className='text-white/45'>FPS</span>{' '}
          <span className='tabular-nums'>{fps}</span>
        </div>
      )}

      {IS_DEV_PANEL_ENABLED && (
        <button
          type='button'
          aria-label={
            isDevPanelOpen ? 'Close dev controls' : 'Open dev controls'
          }
          onClick={() => {
            setIsDevPanelOpen((isOpen) => !isOpen);
          }}
          className='absolute top-16 left-5 z-[12000] grid size-11 place-items-center rounded-full border border-white/15 bg-black/75 text-xs font-semibold tracking-[0.12em] text-white shadow-2xl backdrop-blur-md transition-colors hover:border-white/35 hover:bg-white hover:text-black'
        >
          V2
        </button>
      )}

      {selectedLocation && (
        <div className='pointer-events-none absolute inset-0 z-[11000]'>
          <button
            type='button'
            aria-label='Close location content'
            onClick={closeLocationContent}
            className='pointer-events-auto absolute inset-0 bg-[#2f1d13] backdrop-blur-[2px]'
            style={{
              opacity: locationContentProgress * 0.35
            }}
          />
          <article
            className='pointer-events-auto absolute overflow-hidden border border-[#2f1d13]/30 bg-[#d8c7aa]/50 p-8 text-[#2f1d13] shadow-2xl backdrop-blur-sm'
            style={{
              clipPath: `inset(${(1 - locationContentProgress) * 50}% 0 ${
                (1 - locationContentProgress) * 50
              }% 0)`,
              height: `${locationContentLayout.modalHeight}px`,
              left: `${locationContentLayout.modalLeft}px`,
              top: `${locationContentLayout.modalTop}px`,
              width: `${locationContentLayout.modalWidth}px`
            }}
          >
            <div
              className={cn(
                'relative transition-opacity duration-100',
                isLocationContentVisible && locationContentProgress >= 0.9
                  ? 'opacity-100'
                  : 'opacity-0'
              )}
            >
              <div className='mb-5 flex items-start justify-between gap-4'>
                <div>
                  <p className='text-xs font-semibold tracking-[0.22em] uppercase'>
                    {selectedLocation.title}
                  </p>
                  <h2 className='mt-2 text-2xl font-semibold'>
                    {selectedLocation.location}
                  </h2>
                  {selectedLocation.date && (
                    <p className='mt-2 text-sm text-[#2f1d13]/65'>
                      {selectedLocation.date}
                    </p>
                  )}
                </div>
                <button
                  type='button'
                  onClick={closeLocationContent}
                  className='grid size-8 place-items-center border border-[#2f1d13]/30 text-lg leading-none text-[#2f1d13] transition-colors hover:bg-[#2f1d13] hover:text-[#d8c7aa]'
                  aria-label='Close location content'
                >
                  ×
                </button>
              </div>

              <dl className='grid grid-cols-2 gap-x-4 gap-y-3 border-t border-[#2f1d13]/20 pt-6 text-sm'>
                <dt className='text-[#2f1d13]/55'>Coordinates</dt>
                <dd className='text-right font-mono text-[#2f1d13]/80'>
                  {selectedLocation.coordinates}
                </dd>
                <dt className='text-[#2f1d13]/55'>Focus</dt>
                <dd className='text-right font-mono text-[#2f1d13]/80'>
                  {selectedLocation.focusView.zoom}%
                </dd>
              </dl>
            </div>
          </article>
        </div>
      )}

      {IS_DEV_PANEL_ENABLED && isDevPanelOpen && (
        <aside
          data-v2-dev-control='true'
          style={{
            width: `${DEV_PANEL_WIDTH}px`,
            ...(devPanelPosition
              ? {
                  top: `${devPanelPosition.y}px`,
                  bottom: 'auto',
                  right: 'auto',
                  left: `${devPanelPosition.x}px`
                }
              : {
                  top: '112px',
                  bottom: 'auto',
                  right: 'auto',
                  left: '20px'
                })
          }}
          className='absolute z-[12000] max-h-[calc(100vh-132px)] overflow-y-auto rounded-md border border-white/15 bg-black/75 p-4 text-white shadow-2xl backdrop-blur-md'
        >
          <div className='mb-4 flex items-center justify-between gap-3'>
            <button
              type='button'
              onPointerDown={handleDevPanelDragStart}
              onPointerMove={handleDevPanelDragMove}
              onPointerUp={handleDevPanelDragEnd}
              onPointerCancel={handleDevPanelDragEnd}
              className='min-h-8 flex-1 cursor-grab touch-none py-1 text-left active:cursor-grabbing'
              aria-label='Drag dev controls'
            >
              <h2 className='text-xs font-medium tracking-[0.22em] text-white/70 uppercase'>
                Dev controls
              </h2>
            </button>
            <div className='flex items-center gap-2'>
              <button
                type='button'
                onClick={() => {
                  setIsColorsModalOpen(true);
                }}
                className='rounded-sm border border-white/15 px-2 py-1 text-[10px] leading-none text-white/60 transition-colors hover:border-white/35 hover:text-white'
              >
                Colors
              </button>
              <span className='rounded-sm border border-white/10 px-2 py-1 text-[10px] leading-none text-white/45'>
                V2
              </span>
            </div>
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

          <label className='mb-5 flex items-center justify-between gap-3 border-b border-white/10 pb-4 text-xs text-white/65'>
            <span>Skip initial transition</span>
            <input
              type='checkbox'
              checked={shouldSkipInitialTransition}
              onChange={(event) => {
                handleSkipInitialTransitionChange(event.target.checked);
              }}
              className='h-4 w-4 accent-white'
            />
          </label>

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

          <div className='mt-3 flex items-center justify-between text-xs text-white/65'>
            <span>Stage</span>
            <span>{isSecondStage ? 'Second' : 'First'}</span>
          </div>

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

      {IS_DEV_PANEL_ENABLED && isColorsModalOpen && (
        <div
          data-v2-dev-control='true'
          className='fixed inset-0 z-[12001] flex items-center justify-center bg-black/65 p-6 backdrop-blur-sm'
        >
          <div
            role='dialog'
            aria-modal='true'
            aria-label='V2 color table'
            className='w-full max-w-2xl rounded-md border border-white/15 bg-black/90 p-5 text-white shadow-2xl'
          >
            <div className='mb-4 flex items-center justify-between gap-4'>
              <h2 className='text-xs font-medium tracking-[0.22em] text-white/70 uppercase'>
                Colors
              </h2>
              <button
                type='button'
                onClick={() => {
                  setIsColorsModalOpen(false);
                }}
                className='rounded-sm border border-white/15 px-2 py-1 text-xs text-white/65 transition-colors hover:border-white/35 hover:text-white'
              >
                Close
              </button>
            </div>

            <div className='overflow-hidden rounded-md border border-white/10'>
              <table className='w-full border-collapse text-left text-xs'>
                <thead className='bg-white/10 text-white/55'>
                  <tr>
                    <th className='px-3 py-2 font-medium'>Color</th>
                    <th className='px-3 py-2 font-medium'>Hex</th>
                    <th className='px-3 py-2 font-medium'>Use case</th>
                  </tr>
                </thead>
                <tbody>
                  {V2_COLOR_TOKENS.map((colorToken) => (
                    <tr
                      key={colorToken.name}
                      className='border-t border-white/10 text-white/75'
                    >
                      <td className='px-3 py-2'>
                        <span className='flex items-center gap-2'>
                          <span
                            className='h-3 w-3 shrink-0 rounded-sm border border-white/20'
                            style={{ backgroundColor: colorToken.hex }}
                          />
                          {colorToken.name}
                        </span>
                      </td>
                      <td className='px-3 py-2 font-mono text-white/60'>
                        {colorToken.hex}
                      </td>
                      <td className='px-3 py-2'>{colorToken.useCase}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
