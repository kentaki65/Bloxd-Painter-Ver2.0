export type ColorMode = "biome" | "block";

interface ContorsOverrideSettings {
  contourInterval: number | null;
  contorsIntervalOverride: boolean;
}

export interface RenderSettings {
  mode: ColorMode;
  shading: boolean;
  contours: boolean;
  countorsOverride: ContorsOverrideSettings;
}

export const DEFAULT_SETTINGS: RenderSettings = {
  mode: "biome",
  shading: true,
  contours: true,
  countorsOverride: {
    contorsIntervalOverride: false,
    contourInterval: null
  }
};

export class RenderState {
  settings: RenderSettings = DEFAULT_SETTINGS;
  version = 0;

  set(next: RenderSettings) {
    this.settings = next;
    this.version++;
  }
}