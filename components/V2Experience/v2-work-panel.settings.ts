export type V2WorkPanelDirection =
  | 'top'
  | 'top-right'
  | 'right'
  | 'bottom-right'
  | 'bottom'
  | 'bottom-left'
  | 'left'
  | 'top-left';

export interface V2WorkPanelSettings {
  entryAngle: number;
  entryBezierX1: number;
  entryBezierX2: number;
  entryBezierY1: number;
  entryBezierY2: number;
  entryDirection: V2WorkPanelDirection;
  entryDuration: number;
  exitAngle: number;
  exitBezierX1: number;
  exitBezierX2: number;
  exitBezierY1: number;
  exitBezierY2: number;
  exitDirection: V2WorkPanelDirection;
  exitDuration: number;
  height: number;
  width: number;
}

export type V2WorkPanelNumericSettingKey = Exclude<
  keyof V2WorkPanelSettings,
  'entryDirection' | 'exitDirection'
>;

export type V2WorkPanelDirectionSettingKey = 'entryDirection' | 'exitDirection';

export const DEFAULT_V2_WORK_PANEL_SETTINGS: V2WorkPanelSettings = {
  entryAngle: 0,
  entryBezierX1: 0.16,
  entryBezierX2: 0.3,
  entryBezierY1: 1,
  entryBezierY2: 1,
  entryDirection: 'top-right',
  entryDuration: 480,
  exitAngle: 0,
  exitBezierX1: 0.5,
  exitBezierX2: 0.7,
  exitBezierY1: 0,
  exitBezierY2: 0.6,
  exitDirection: 'top-right',
  exitDuration: 240,
  height: 95,
  width: 95
};

export const IS_V2_WORK_PANEL_DEV_PANEL_ENABLED = false;
