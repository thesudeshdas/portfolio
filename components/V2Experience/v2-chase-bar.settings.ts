export interface V2ChaseBarSettings {
  entranceDistance: number;
  gap: number;
  horizontalPadding: number;
  ideaInactivityDuration: number;
  ideaMoveDuration: number;
  ideaReturnDuration: number;
  ideaScale: number;
  topOffset: number;
  trackHeight: number;
  transitionDuration: number;
  trembleDuration: number;
  trembleEndAmplitude: number;
  trembleFrequency: number;
  trembleStartAmplitude: number;
  verticalPadding: number;
  width: number;
}

export type V2ChaseBarNumericSettingKey = keyof V2ChaseBarSettings;

export const DEFAULT_V2_CHASE_BAR_SETTINGS: V2ChaseBarSettings = {
  entranceDistance: 12,
  gap: 12,
  horizontalPadding: 12,
  ideaInactivityDuration: 5000,
  ideaMoveDuration: 350,
  ideaReturnDuration: 600,
  ideaScale: 3,
  topOffset: 20,
  trackHeight: 1,
  transitionDuration: 300,
  trembleDuration: 2000,
  trembleEndAmplitude: 12,
  trembleFrequency: 18,
  trembleStartAmplitude: 1,
  verticalPadding: 8,
  width: 400
};

export const IS_V2_CHASE_BAR_DEV_PANEL_ENABLED = false;
