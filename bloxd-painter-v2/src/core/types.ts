export const chunkSize = 32;
export const BRUSH_RADIUS = 32;

export type Vec3 = [number, number, number];

export const BiomeId = {
  Jungle: 0,
  Desert: 1,
  FrozenBadlandsPlains: 2,
  CactusDesert: 3,
  RedDesert: 4,
  Plains: 6,
  MaplePlains: 8,
  TallGrassPlains: 9,
  SnowyPlains: 10,
  Forest: 11,
  CherryForest: 12,
  PearForest: 13,
  AutumnForest: 14,
  PumpkinForest: 15,
  FrozenBadlandsForest: 16,
  PineForest: 19,
  SnowyPineForest: 21,
  RollingHills: 22,
  SnowyMountains: 23,
  BlueForest: 24,
} as const;

export type BiomeName = keyof typeof BiomeId;
export type BiomeId = typeof BiomeId[BiomeName];

export interface WorldRect {
  x0: number; 
  x1: number;
  z0: number;
  z1: number;
}

export interface TileCoord {
  step: number;
  tx: number;
  tz: number;
}

export interface CameraRef {
  camX: number;
  camY: number;
  zoom: number;
  panning: boolean;
  panStartX: number;
  panStartY: number;
}

export interface MouseRef {
  x: number,
  y: number,
}

export const biomeNameById = Object.fromEntries(
  Object.entries(BiomeId).map(([name, id]) => [id, name])
) as Record<BiomeId, BiomeName>;