export type LeftTabTypes = "terrain" | "biome" | "advanced";
export type RightTabTypes = "brushes" | "options";

export type MenuTypes = "file" | "edit" | "view";
export interface TabProp {
  name: LeftTabTypes | RightTabTypes
};