export interface V2SpotlightSettings {
  blobStretch: number;
  contrast: number;
  fadeDuration: number;
  gap: number;
  idleHideDelay: number;
  questionZoneHeight: number;
  questionZoneWidth: number;
  radius: number;
  revealCore: number;
  saturation: number;
  tileRadius: number;
}

export type V2SpotlightNumericSettingKey = keyof V2SpotlightSettings;

export const DEFAULT_V2_SPOTLIGHT_SETTINGS: V2SpotlightSettings = {
  blobStretch: 56,
  contrast: 100,
  fadeDuration: 600,
  gap: 0,
  idleHideDelay: 0,
  questionZoneHeight: 220,
  questionZoneWidth: 140,
  radius: 100,
  revealCore: 0,
  saturation: 100,
  tileRadius: 0
};

export const IS_V2_SPOTLIGHT_DEV_PANEL_ENABLED = false;
