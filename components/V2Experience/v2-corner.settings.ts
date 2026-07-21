export type V2CornerAnimationMode = 'scale' | 'slide';

export interface V2CornerSettings {
  animationMode: V2CornerAnimationMode;
  duration: number;
  easing: string;
  firstDelay: number;
  slideDistance: number;
  staggerDelay: number;
  startScale: number;
}

export type V2CornerNumericSettingKey = Exclude<
  keyof V2CornerSettings,
  'animationMode' | 'easing'
>;

export const DEFAULT_V2_CORNER_SETTINGS: V2CornerSettings = {
  animationMode: 'slide',
  duration: 500,
  easing: 'ease-out',
  firstDelay: 100,
  slideDistance: 40,
  staggerDelay: 100,
  startScale: 2
};

export function getV2CornerDelay(
  settings: V2CornerSettings,
  itemIndex: number
) {
  return (
    settings.firstDelay +
    itemIndex * (settings.duration + settings.staggerDelay)
  );
}

export const V2_CORNER_EASINGS = [
  { label: 'Ease out', value: 'ease-out' },
  { label: 'Sine-like', value: 'cubic-bezier(.65, 0, .35, 1)' },
  { label: 'Smooth overshoot', value: 'cubic-bezier(.22, 1, .36, 1)' },
  { label: 'Fast settle', value: 'cubic-bezier(.16, 1, .3, 1)' },
  { label: 'Linear', value: 'linear' }
];

export const IS_V2_CORNER_DEV_PANEL_ENABLED = false;

export const IS_V2_CORNER_FOCUS_MODE = false;
