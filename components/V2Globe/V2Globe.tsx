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
const LOCATION_MARKER_ALTITUDE = 0.035;
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
const LOCATION_FOCUS_TRANSITION_MS = 1200;
const LOCATION_CONTENT_TRANSITION_MS = 500;
const LOCATION_SELECT_EVENT = 'v2-globe-location-select';
const IS_DEV_PANEL_ENABLED = process.env.NODE_ENV === 'development';
const DEV_PANEL_WIDTH = 260;

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

type LngLatPoint = [number, number];
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
type LocationSelectEvent = CustomEvent<{ id: string }>;

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

  clickHintText.textContent = 'Click me';
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

  calloutPath.setAttribute('d', 'M0 104 L64 67 L200 67');
  calloutPath.setAttribute('fill', 'none');
  calloutPath.setAttribute('stroke', LOCATION_MARKER_COLOR);
  calloutPath.setAttribute('stroke-width', '2.5');
  calloutPath.setAttribute('stroke-linecap', 'square');
  calloutPath.setAttribute('stroke-linejoin', 'miter');
  calloutPath.setAttribute('pathLength', '1');
  calloutPath.style.filter = 'drop-shadow(0 0 12px rgba(47, 29, 19, 0.32))';
  calloutPath.style.strokeDasharray = '1';
  calloutPath.style.strokeDashoffset = '1';
  calloutPath.style.transition =
    'stroke-dashoffset 680ms cubic-bezier(0.22, 1, 0.36, 1)';

  content.style.position = 'absolute';
  content.style.left = '62px';
  content.style.bottom = '48px';
  content.style.minWidth = '170px';
  content.style.color = LOCATION_MARKER_COLOR;
  content.style.opacity = '0';
  content.style.transform = 'translate3d(0, 10px, 0)';
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
  coordinates.style.color = 'rgba(47, 29, 19, 0.62)';
  coordinates.style.fontSize = '11px';
  coordinates.style.lineHeight = '1.2';
  coordinates.style.textShadow = '0 10px 24px rgba(0, 0, 0, 0.85)';

  content.append(title, location, coordinates);
  calloutLine.append(calloutPath);
  callout.append(calloutLine, content);
  clickHintLine.append(clickHintPath);
  clickHint.append(clickHintLine, clickHintText);
  hitArea.append(pulseSquare, square);
  marker.append(hitArea, clickHint, callout);
  element.append(style, marker);

  let isTooltipVisible = false;
  let pulseCount = 0;
  let isClickHintDismissed = false;

  const showClickHint = () => {
    if (isClickHintDismissed) {
      return;
    }

    clickHint.style.opacity = '1';
    clickHint.style.transform = 'translate3d(0, 0, 0)';
    clickHintPath.style.strokeDashoffset = '0';
    clickHintText.style.opacity = '1';
    clickHintText.style.transform = 'translate3d(0, 0, 0)';
  };
  const hideClickHint = () => {
    clickHint.style.opacity = '0';
    clickHint.style.transform = 'translate3d(8px, 0, 0)';
    clickHintPath.style.strokeDashoffset = '1';
    clickHintText.style.opacity = '0';
    clickHintText.style.transform = 'translate3d(0, 10px, 0)';
  };

  const showTooltip = () => {
    if (isTooltipVisible) {
      return;
    }

    isTooltipVisible = true;
    isClickHintDismissed = true;
    hideClickHint();
    square.style.background = LOCATION_MARKER_COLOR;
    calloutPath.style.strokeDashoffset = '0';
    content.style.opacity = '1';
    content.style.transform = 'translate3d(0, 0, 0)';
  };
  const hideTooltip = () => {
    if (!isTooltipVisible) {
      return;
    }

    isTooltipVisible = false;
    square.style.background = LOCATION_MARKER_COLOR;
    calloutPath.style.strokeDashoffset = '1';
    content.style.opacity = '0';
    content.style.transform = 'translate3d(0, 10px, 0)';
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
  const handleMarkerSelect = (event: MouseEvent | KeyboardEvent) => {
    event.stopPropagation();
    isClickHintDismissed = true;
    hideClickHint();
    window.dispatchEvent(
      new CustomEvent(LOCATION_SELECT_EVENT, {
        detail: {
          id: pin.id
        }
      })
    );
  };
  const handleMarkerKeyDown = (event: KeyboardEvent) => {
    if (event.key !== 'Enter' && event.key !== ' ') {
      return;
    }

    event.preventDefault();
    handleMarkerSelect(event);
  };
  const handlePulseIteration = () => {
    if (isClickHintDismissed) {
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

  element.addEventListener('mouseenter', showTooltip);
  element.addEventListener('mouseleave', hideTooltip);
  element.addEventListener('pointerenter', showTooltip);
  element.addEventListener('pointerleave', hideTooltip);
  element.addEventListener('focus', showTooltip);
  element.addEventListener('blur', hideTooltip);
  element.addEventListener('keydown', handleMarkerKeyDown);
  marker.addEventListener('mouseenter', showTooltip);
  marker.addEventListener('mouseleave', hideTooltip);
  marker.addEventListener('pointerenter', showTooltip);
  marker.addEventListener('pointerleave', hideTooltip);
  clickHint.addEventListener('click', handleMarkerSelect);
  hitArea.addEventListener('click', handleMarkerSelect);
  hitArea.addEventListener('pointerenter', showTooltip);
  pulseSquare.addEventListener('animationiteration', handlePulseIteration);
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
  const isSecondStageRef = useRef(false);
  const themeAnimationFrameRef = useRef<number | null>(null);
  const themeProgressRef = useRef(0);
  const devPanelDragRef = useRef<DevPanelDragState | null>(null);
  const locationContentTimeoutRef = useRef<number | null>(null);
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
  const [isCursorInsideIndia, setIsCursorInsideIndia] = useState(false);
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
  const [isColorsModalOpen, setIsColorsModalOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] =
    useState<V2GlobeLocation | null>(null);
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
  const openLocationContent = useCallback(
    (location: V2GlobeLocation) => {
      clearIntroTimeouts();

      if (locationContentTimeoutRef.current !== null) {
        window.clearTimeout(locationContentTimeoutRef.current);
        locationContentTimeoutRef.current = null;
      }

      if (!selectedLocation) {
        previousLocationPovRef.current = currentPovRef.current;
      }

      setSelectedLocation(location);
      window.requestAnimationFrame(() => {
        setIsLocationContentVisible(true);
      });
      updatePointOfView(
        {
          lat: location.focusView.lat,
          lng: location.focusView.lng,
          altitude: getAltitudeFromDisplayZoom(location.focusView.zoom)
        },
        LOCATION_FOCUS_TRANSITION_MS
      );
    },
    [clearIntroTimeouts, selectedLocation, updatePointOfView]
  );
  const closeLocationContent = useCallback(() => {
    setIsLocationContentVisible(false);

    const previousPov = previousLocationPovRef.current;

    if (previousPov) {
      updatePointOfView(previousPov, LOCATION_FOCUS_TRANSITION_MS);
      previousLocationPovRef.current = null;
    }

    if (locationContentTimeoutRef.current !== null) {
      window.clearTimeout(locationContentTimeoutRef.current);
    }

    locationContentTimeoutRef.current = window.setTimeout(() => {
      setSelectedLocation(null);
      locationContentTimeoutRef.current = null;
    }, LOCATION_CONTENT_TRANSITION_MS);
  }, [updatePointOfView]);
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
    if (!isActive) {
      setIsLocationContentVisible(false);
      setSelectedLocation(null);
      previousLocationPovRef.current = null;
      return;
    }

    const handleLocationSelect = (event: Event) => {
      const locationId = (event as LocationSelectEvent).detail.id;
      const location = V2_GLOBE_LOCATIONS.find(
        (candidateLocation) => candidateLocation.id === locationId
      );

      if (!location) {
        return;
      }

      openLocationContent(location);
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

    const shouldUseIndiaTheme = isSecondStage || isCursorInsideIndia;
    const targetProgress = shouldUseIndiaTheme ? 1 : 0;
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
  }, [applyThemeProgress, isCursorInsideIndia, isSecondStage]);

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

      {selectedLocation && (
        <div
          className={cn(
            'pointer-events-none absolute inset-0 z-[11000] flex items-center justify-end px-6 pr-[8vw] transition-opacity duration-500',
            isLocationContentVisible ? 'opacity-100' : 'opacity-0'
          )}
        >
          <button
            type='button'
            aria-label='Close location content'
            onClick={closeLocationContent}
            className='pointer-events-auto absolute inset-0 bg-[#2f1d13]/35 backdrop-blur-[2px]'
          />
          <article
            className={cn(
              'pointer-events-auto relative h-[70vh] w-[60vw] max-w-[1100px] min-w-[320px] border border-[#2f1d13]/30 bg-[#d8c7aa]/90 p-8 text-[#2f1d13] shadow-2xl backdrop-blur-sm transition-transform duration-500',
              isLocationContentVisible ? 'translate-y-0' : 'translate-y-4'
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
          </article>
        </div>
      )}

      {IS_DEV_PANEL_ENABLED && (
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
              : undefined)
          }}
          className='absolute bottom-5 left-5 z-[10000] rounded-md border border-white/15 bg-black/75 p-4 text-white shadow-2xl backdrop-blur-md'
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
          className='fixed inset-0 z-[10001] flex items-center justify-center bg-black/65 p-6 backdrop-blur-sm'
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
