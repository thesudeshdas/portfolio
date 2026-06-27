export const MADRID_VIEW = {
  lat: 40.4168,
  lng: -3.7038
};

export const INDIA_VIEW = {
  lat: 22.8,
  lng: 78.9
};

export const MIN_ALTITUDE = 0.34;
export const MAX_ALTITUDE = 4.2;
export const MIN_EXTENDED_ALTITUDE = 0.12;
export const MAX_ZOOM = 1500;
export const INTRO_START_ZOOM = 250;
export const INTRO_END_ZOOM = 1425;
export const MIN_DISPLAY_ZOOM = 0;
export const INTRO_END_DISPLAY_ZOOM = 100;
export const MAX_DISPLAY_ZOOM = 300;
export const MIN_OUTLINE_DETAIL = 10;
export const MAX_OUTLINE_DETAIL = 100;
export const DEFAULT_OUTLINE_DETAIL = MIN_OUTLINE_DETAIL;
export const MIN_ROTATION_SPEED = 0.1;
export const MAX_ROTATION_SPEED = 3;
export const DEFAULT_ROTATION_SPEED = 0.35;
export const GLOBE_FADE_IN_MS = 700;
export const INTRO_FLIGHT_MS = 7800;
export const LOCATION_MARKER_ALTITUDE = 0.01;
export const INTRO_STATE_SYNC_MS = 120;
export const BORDER_LINE_ALTITUDE = 0.01;
export const STAGE_THEME_TRANSITION_MS = 900;
export const TARGET_RENDER_PIXEL_RATIO = 1;
export const LOW_FPS_RENDER_PIXEL_RATIO = 0.75;
export const DEFAULT_GLOBE_COLOR = '#0e0e0e';
export const DEFAULT_BORDER_COLOR = '#f4f4f1';
export const INDIA_HOVER_GLOBE_COLOR = '#d8c7aa';
export const INDIA_HOVER_BORDER_COLOR = '#2f1d13';
export const LOCATION_MARKER_COLOR = INDIA_HOVER_BORDER_COLOR;
export const LOCATION_MARKER_PULSE_KEYFRAMES = 'v2-location-marker-breathe';
export const LOCATION_MARKER_PULSE_DURATION_MS = 3200;
export const LOCATION_MARKER_HINT_PULSE_COUNT = 3;
export const LOCATION_CALLOUT_EXTENSION_START = 200;
export const LOCATION_CALLOUT_EXTENSION_END = 760;
export const LOCATION_CALLOUT_EXTENSION_LENGTH =
  LOCATION_CALLOUT_EXTENSION_END - LOCATION_CALLOUT_EXTENSION_START;
export const LOCATION_CALLOUT_BASE_LENGTH =
  Math.hypot(64, 37) + (LOCATION_CALLOUT_EXTENSION_START - 64);
export const LOCATION_CALLOUT_BASE_FRACTION =
  LOCATION_CALLOUT_BASE_LENGTH /
  (LOCATION_CALLOUT_BASE_LENGTH + LOCATION_CALLOUT_EXTENSION_LENGTH);
export const LOCATION_CALLOUT_OPEN_MS = 1200;
export const LOCATION_CALLOUT_CLOSE_MS = 200;
export const LOCATION_FOCUS_TRANSITION_MS = 1200;
export const LOCATION_FOCUS_TIMING_FUNCTION =
  'cubic-bezier(0.25, 0.46, 0.45, 0.94)';
export const LOCATION_CONTENT_TRANSITION_MS = 100;
export const LOCATION_CONTENT_REVEAL_MS = 100;
export const LOCATION_MODAL_WIDTH_RATIO = 0.6;
export const LOCATION_MODAL_HEIGHT_RATIO = 0.7;
export const LOCATION_MODAL_RIGHT_OFFSET_RATIO = 0.08;
export const LOCATION_SELECT_EVENT = 'v2-globe-location-select';
export const LOCATION_CONTENT_CLOSE_EVENT = 'v2-globe-location-content-close';
export const LOCATION_MARKER_WHEEL_EVENT = 'v2-globe-location-marker-wheel';
export const LOCATION_MARKER_SELECTED_EVENT =
  'v2-globe-location-marker-selected';
export const LOCATION_MARKER_RESET_EVENT = 'v2-globe-location-marker-reset';
export const IS_DEV_PANEL_ENABLED = process.env.NODE_ENV === 'development';
export const SKIP_INITIAL_TRANSITION_STORAGE_KEY = 'v2-skip-initial-transition';
export const ACTIVE_LOCATION_MARKER_DATA_KEY = 'v2ActiveLocationMarkerId';

export const V2_COLOR_TOKENS = [
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
