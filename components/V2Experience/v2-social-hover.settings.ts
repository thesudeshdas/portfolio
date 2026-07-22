export interface V2SocialHoverSettings {
  duration: number;
  hoverStrokeWidth: number;
  restingStrokeWidth: number;
  scale: number;
}

export type V2SocialHoverNumericSettingKey = keyof V2SocialHoverSettings;

export const DEFAULT_V2_SOCIAL_HOVER_SETTINGS: V2SocialHoverSettings = {
  duration: 300,
  hoverStrokeWidth: 1,
  restingStrokeWidth: 0.75,
  scale: 1.2
};

export const IS_V2_SOCIAL_HOVER_DEV_PANEL_ENABLED =
  process.env.NODE_ENV === 'development';
