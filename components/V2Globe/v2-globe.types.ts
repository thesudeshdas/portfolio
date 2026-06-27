import type * as THREE from 'three';

export type GlobeDirection = 'up' | 'down' | 'left' | 'right';
export type RotationDirection = 'east' | 'west';
export type V2FlowStep = 'loading' | 'globe';

export type V2FlowControl = {
  id: V2FlowStep;
  label: string;
};

export type GeoJsonPosition = [number, number, ...number[]];
export type GeoJsonLineCoordinates = GeoJsonPosition[];
export type GeoJsonMultiLineCoordinates = GeoJsonPosition[][];

export type GeoJsonGeometry =
  | {
      type: 'LineString';
      coordinates: GeoJsonLineCoordinates;
    }
  | {
      type: 'MultiLineString';
      coordinates: GeoJsonMultiLineCoordinates;
    };

export type MapLineFeature = {
  type: 'Feature';
  properties: Record<string, unknown>;
  geometry: GeoJsonGeometry;
};

export type MapLinesGeoJson = {
  type: 'FeatureCollection';
  features: MapLineFeature[];
};

export type GlobePointOfView = {
  lat: number;
  lng: number;
  altitude: number;
};

export type CountryBorderPoint = {
  lat: number;
  lng: number;
  altitude: number;
};

export type CountryBorderPath = {
  points: CountryBorderPoint[];
};

export type ColorMaterial = THREE.Material & { color: THREE.Color };

export type DevPanelPosition = {
  x: number;
  y: number;
};

export type DevPanelDragState = DevPanelPosition & {
  pointerId: number;
  offsetX: number;
  offsetY: number;
  width: number;
  height: number;
};

export type ScreenPoint = {
  calloutSide?: 'left' | 'right';
  x: number;
  y: number;
  calloutWidth?: number;
};

export type LocationSelectEvent = CustomEvent<{
  id: string;
  anchor: ScreenPoint;
}>;
export type LocationContentCloseEvent = CustomEvent<{ id: string }>;
export type LocationMarkerWheelEvent = CustomEvent<{ deltaY: number }>;
export type LocationMarkerSelectedEvent = CustomEvent<{ id: string }>;
