import * as THREE from 'three';

import {
  INDIA_VIEW,
  INTRO_END_ZOOM,
  INTRO_END_DISPLAY_ZOOM,
  INTRO_START_ZOOM,
  MADRID_VIEW,
  MAX_ALTITUDE,
  MAX_DISPLAY_ZOOM,
  MAX_ZOOM,
  MIN_ALTITUDE,
  MIN_DISPLAY_ZOOM,
  MIN_EXTENDED_ALTITUDE
} from './v2-globe.constants';
import type { ColorMaterial, GlobePointOfView } from './v2-globe.types';

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

export function normalizeLongitude(longitude: number) {
  return ((((longitude + 180) % 360) + 360) % 360) - 180;
}

export function getInterpolatedHexColor(
  from: string,
  to: string,
  progress: number
) {
  const color = new THREE.Color(from);

  color.lerp(new THREE.Color(to), Math.max(0, Math.min(1, progress)));

  return `#${color.getHexString()}`;
}

export function setMaterialColor(material: ColorMaterial, color: string) {
  material.color.set(color);
  material.needsUpdate = true;
}

export function easeInOutCubic(progress: number) {
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

export function getIntroPointOfView(progress: number) {
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

export function clampLatitude(latitude: number) {
  return Math.max(-72, Math.min(72, latitude));
}

export function clampAltitude(altitude: number) {
  return Math.max(MIN_EXTENDED_ALTITUDE, Math.min(MAX_ALTITUDE, altitude));
}

export function getZoomFromAltitude(altitude: number) {
  const clampedAltitude = Math.max(
    MIN_ALTITUDE,
    Math.min(MAX_ALTITUDE, altitude)
  );

  return Math.round(
    ((MAX_ALTITUDE - clampedAltitude) / (MAX_ALTITUDE - MIN_ALTITUDE)) *
      MAX_ZOOM
  );
}

export function getAltitudeFromZoom(zoom: number) {
  const clampedZoom = Math.max(0, Math.min(MAX_ZOOM, zoom));

  return (
    MAX_ALTITUDE - (clampedZoom / MAX_ZOOM) * (MAX_ALTITUDE - MIN_ALTITUDE)
  );
}

export function getDisplayZoomFromAltitude(altitude: number) {
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

export function getAltitudeFromDisplayZoom(displayZoom: number) {
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

export function getLocationMarkerScale(altitude: number) {
  const zoomProgress =
    (MAX_ALTITUDE - clampAltitude(altitude)) / (MAX_ALTITUDE - MIN_ALTITUDE);

  return 0.72 + zoomProgress * 0.9;
}
