export type LeftTabTypes = "terrain" | "biome" | "advanced";
export type RightTabTypes = "brushes" | "options";
export type ToolId = "spray" | "height" | "flatten" | "smooth" | "biome";

export type MenuTypes = "file" | "edit" | "view";
export interface TabProp {
  name: LeftTabTypes | RightTabTypes
};

export interface WorldSettings {
  fileName: string;
  seed: string;
  chunkX: number;
  chunkZ: number;
  chunkY: number;
}