export interface RangeOption { enabled: boolean; value: number }
export interface BrushOptions {
  intensity: number;
  atOrAbove: RangeOption;
  atOrBelow: RangeOption;
  slopeAbove: RangeOption;
  slopeBelow: RangeOption;
}
export const defaultBrushOptions: BrushOptions = {
  intensity: 0.025,
  atOrAbove: { enabled: false, value: 0 },
  atOrBelow: { enabled: false, value: 255 },
  slopeAbove: { enabled: false, value: 0 },
  slopeBelow: { enabled: false, value: 90 },
};