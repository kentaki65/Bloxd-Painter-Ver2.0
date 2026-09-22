export const ChunkSize = 32;

export const CaveMobs = [
  "Cave Golem", 
  "Draugr Zombie", 
  "Draugr Skeleton", 
  "Frost Golem", 
  "Frost Zombie", 
  "Frost Skeleton", 
  "Draugr Knight", 
  "Draugr Huntress", 
  "Magma Golem"
] as const;

export enum HeightField {
  GroundHeight,
  WaterHeight,
  CavesAllowedBelowY,
  NumFields
}

export enum CaveField {
  FloorY,
  CeilingY,
  NumFields
}

export enum CaveLayer {
  SURFACE,
  UNDERGROUND
}

export enum FeatureHeight {
  HIGH,
  MEDIUM
}

export enum FixedPrefabField {
  DistanceToNearestFixedPrefab,
  HeightOfNearestFixedPrefab,
  NumFields
}

export enum TreeType {
  Maple = 0,
  Pine = 1,
  Plum = 2,
  Cedar = 4,
  Aspen = 5,
  Jungle = 6,
  Palm = 7,
  AutumnMaple = 8,
  Pear = 9,
  Cherry = 10,
  Spectral = 11,
  Mango = 12,
  AutumnAspen = 13,
}

export enum Rarity {
  COMMON = 0,
  UNCOMMON = 1,
  RARE = 2,
  EPIC = 3,
  LEGENDARY = 4,
}

export enum BiomeRegion {
  PLAINS = 0,
  AUTUMN = 1,
}

export enum TERRAIN_LEVELS {
  seaLevel = 0,
  bedrockLevel = -100
};

export enum BlockPlacementMode {
  GUARANTEED_AIR = -1,
}

//修正必要
export enum OUT_OF_RUNGE_NUMBER {
  NO_WATER_VALUE = -10000,
  NO_CAVE_NUMBER = -10000,
  OUT_OF_RANGE = -10000,
}

export enum MaterialTier {
  WOOD = "Wood",
  STONE = "Stone",
  IRON = "Iron",
  GOLD = "Gold",
  DIAMOND = "Diamond",
}

export enum CanopyType {
  STANDARD = 0,
  FRILLED = 1,
  TALL = 2,
  FLAT = 3,
  DROOPY = 4
}

export enum CanopyLevel {
  TOP = 0,
  UPPER_MIDDLE = 1,
  MIDDLE = 2,
  LOWER_MIDDLE = 3,
  BOTTOM = 4
}

export enum CanopyShape {
  CIRCLE = 0,
  DIAMOND = 1
}

export enum CanopyBlockPlacement {
  ALWAYS = 0,
  SOMETIMES = 1,
  NEVER = 2
}

export const emptyArray = {
  get() {
    return undefined;
  }
};