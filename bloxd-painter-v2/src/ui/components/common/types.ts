export type LeftTabTypes = "terrain" | "biome" | "advanced";
export type RightTabTypes = "brushes" | "options";

export interface TabProp {
  name: LeftTabTypes | RightTabTypes
};