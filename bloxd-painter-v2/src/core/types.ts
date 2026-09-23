export const chunkSize = 32;
export type Vec3 = [number, number, number];

export enum BiomeId {
  Jungle = 0,
  Desert = 1,
  FrozenBadlandsPlains = 2,
  CactusDesert = 3,
  RedDesert = 4,
  // Jungle は 5 にも重複登録 (frequency: 6)
  Plains = 6,
  // FrozenBadlandsPlains は 7 にも重複登録 (frequency: 2)
  MaplePlains = 8,
  TallGrassPlains = 9,
  SnowyPlains = 10,
  Forest = 11,
  CherryForest = 12,
  PearForest = 13,
  AutumnForest = 14,
  PumpkinForest = 15,
  FrozenBadlandsForest = 16,
  // CherryForest は 17 にも重複登録 (frequency: 2)
  // Jungle は 18 にも重複登録 (frequency: 4)
  PineForest = 19,
  // FrozenBadlandsForest は 20 にも重複登録 (frequency: 2)
  SnowyPineForest = 21,
  RollingHills = 22,
  SnowyMountains = 23,
  BlueForest = 24,
}