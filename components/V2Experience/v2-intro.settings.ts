export interface V2IntroSettings {
  drawDuration: number;
  easing: string;
  handFadeDuration: number;
  handSize: number;
  heyRevealDuration: number;
  questionDelay: number;
  questionDotDelay: number;
  questionSettleDelay: number;
  questionSize: number;
  questionX: number;
  settleDuration: number;
  shrinkDuration: number;
  slideDuration: number;
  textRevealDuration: number;
  tracerFadeDuration: number;
  tracerSize: number;
  waveAngle: number;
  waveCycle: number;
  waveHold: number;
  wordDelay: number;
}

export const DEFAULT_V2_INTRO_SETTINGS: V2IntroSettings = {
  drawDuration: 900,
  easing: 'cubic-bezier(.65, 0, .35, 1)',
  handFadeDuration: 600,
  handSize: 50,
  heyRevealDuration: 600,
  questionDelay: 0,
  questionDotDelay: 100,
  questionSettleDelay: 100,
  questionSize: 45,
  questionX: 64,
  settleDuration: 600,
  shrinkDuration: 600,
  slideDuration: 800,
  textRevealDuration: 1500,
  tracerFadeDuration: 150,
  tracerSize: 6,
  waveAngle: 14,
  waveCycle: 2500,
  waveHold: 2000,
  wordDelay: 0
};

export const V2_INTRO_EASINGS = [
  {
    label: 'Sine-like',
    value: 'cubic-bezier(.65, 0, .35, 1)'
  },
  {
    label: 'Smooth overshoot',
    value: 'cubic-bezier(.22, 1, .36, 1)'
  },
  {
    label: 'Fast settle',
    value: 'cubic-bezier(.16, 1, .3, 1)'
  },
  {
    label: 'Standard',
    value: 'cubic-bezier(.4, 0, .2, 1)'
  }
];

export const IS_V2_INTRO_DEV_PANEL_ENABLED = false;

export const IS_V2_QUESTION_FOCUS_MODE = false;
