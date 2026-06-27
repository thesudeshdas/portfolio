import type { GlobeMethods } from 'react-globe.gl';
import * as THREE from 'three';

import {
  BORDER_LINE_ALTITUDE,
  MAX_OUTLINE_DETAIL,
  MIN_OUTLINE_DETAIL
} from './v2-globe.constants';
import type { CountryBorderPath, MapLineFeature } from './v2-globe.types';

export function getCountryBorderPaths(features: MapLineFeature[]) {
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

export function getDetailedBorderPaths(
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

export function createBorderLineSegments(
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

export function disposeBorderLineSegments(
  lineSegments: THREE.LineSegments | null
) {
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
