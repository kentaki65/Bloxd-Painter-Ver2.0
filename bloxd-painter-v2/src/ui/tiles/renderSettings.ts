export type ColorMode = "biome" | "block";

interface ContorsOverrideSettings {
  countorsInterval: number;
  countorsIntervalOverride: boolean;
}

export interface RenderSettings {
  mode: ColorMode;
  shading: boolean;
  contours: boolean;
  modifyHeight: boolean;
  countorsOverride: ContorsOverrideSettings;
}

export const DEFAULT_SETTINGS: RenderSettings = {
  mode: "biome",
  shading: true,
  contours: true,
  modifyHeight: false,
  countorsOverride: {
    countorsIntervalOverride: false,
    countorsInterval: 10
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