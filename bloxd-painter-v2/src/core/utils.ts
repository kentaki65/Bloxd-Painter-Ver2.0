import { biomeRelations } from "./constants";

export function worldToCanvasX(worldX: number, viewOriginX: number, canvasWidth: number): number {
  return canvasWidth - 1 - (worldX - viewOriginX);
}

export function canvasToWorldX(canvasX: number, viewOriginX: number, canvasWidth: number): number {
  return canvasWidth - 1 - canvasX + viewOriginX;
}

export const getBaseBiome = (biomeName: string): string | undefined => {
  for (const [baseBiome, children] of Object.entries(biomeRelations)) {
    if (children.includes(biomeName)) {
      return baseBiome;
    }
  }

  return undefined;
};