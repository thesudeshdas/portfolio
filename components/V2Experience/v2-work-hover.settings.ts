export interface V2WorkHoverSettings {
  duration: number;
  scale: number;
  underlineDuration: number;
  underlineGap: number;
  underlineWidth: number;
}

export type V2WorkHoverNumericSettingKey = keyof V2WorkHoverSettings;

export const DEFAULT_V2_WORK_HOVER_SETTINGS: V2WorkHoverSettings = {
  duration: 175,
  scale: 1.25,
  underlineDuration: 175,
  underlineGap: 0,
  underlineWidth: 80
};

export const IS_V2_WORK_HOVER_DEV_PANEL_ENABLED = false;
