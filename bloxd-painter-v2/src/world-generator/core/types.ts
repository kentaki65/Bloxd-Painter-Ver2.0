import { MobNameGenerator } from "@/structures/lootChest/MobNameGenerator.js";
import { RandomIntRange } from "@/random/RandomIntRange.js";
import { WeightedDistribution } from "@/random/WeightedDistribution.js";
import { CaveMobs, Rarity, TreeType } from "./constants.js";
import { prefabDefinitions } from "@/structures/prefab/prefabDatas/prefabDefinitions.js";
import { OreGenerator } from "@/structures/ore/oreGenerator.js";
import { Sparse3DMap } from "@/data/array/Sparse3DMap.js";
import { blockMetadata } from "./blockMetadata.js";
import { _TypeOf } from "./index.js";

export type Seed = number | string;
export type Vec3 = [number, number, number];
export type CaveMobNames = (typeof CaveMobs)[number];

export type BlockName = keyof typeof blockMetadata;

export interface Vec3Object {
  x: number;
  y: number;
  z: number;
}
export type Vec2 = [number, number];

export type Octave = {
  amplitude: number;
  frequency: number;
};

export type LootItem = {
  numItemsDistribution: RandomIntRange;
  itemDistribution: WeightedDistribution<{
    name: string;
    amountDistribution: RandomIntRange | null;
    attributesDistribution: MobNameGenerator | null;
  }>;
};
;
export type BlockId = number;
export type NumCaveTypes = number;

export type BlockMetadata = typeof blockMetadata;

export interface ChunkArray {
  set(x: number, y: number, z: number, id: BlockId): void;
}

export interface CaveInterval {
  floorY: number;
  ceilingY: number;
}

export interface WeightedItem<T> {
  value: T;
  weight: number;
}

export interface TTLCacheOption {
  ttl: number;
  max: number;
  updateAgeOnGet?: boolean;
  keySeparator: string;
}

export interface ClosestPoints {
  pt: Vec2;
  distDiffFromFirstPt: number;
  weight: number;
}

export interface GroundHeightmap {
  chunkSize: number;
  caveTypeToBlockIds: BlockId[];

}

export interface Schematic {
  name: string;
  dimensions: {
    x: number;
    y: number;
    z: number;
  };
  getRLEChunk(x: number, y: number, z: number): any;
}

export interface FixedPointPrefabInfo {
  schematic: Schematic;
  bottomLeftX: number;
  bottomLeftZ: number;
  floorY: number;
  ceilingY: number;
  topRightX: number;
  topRightZ: number;
}

export interface FrequenciesItems {
  name: string;
  frequency: number;
  amount?: {
    min: number;
    max: number;
  } | null
  itemAttributesDistribution?: MobNameGenerator;
};

export interface ItemAttributes {
  customDisplayName?: string;
  customAttributes?: {
    mobSettings?: {
      name: string;
    };
  };
}

//seed, chunkSize, blockMetadata, itemMetadata, prefabSize, typeSettings
export interface PrefabConfig {
  seed: Seed;
  chunkSize: number;
  blockMetadata: BlockMetadata;
  itemMetadata: any;
  prefabSize: number;
  typeSettings: any;
}

export interface PrefabDefinition {
  schematic: {
    name: string;
    dimensions: {
      x: number;
      y: number;
      z: number;
    };
    getRLEChunk(x: number, y: number, z: number): any;
  };
  clearingRadiusSquared: number;
  groundingRadius: number;
  groundingPoints:
  | "centre"
  | {
    localX: number;
    localZ: number;
  }[];
  undergroundYInterval: {
    minY: number;
    maxY: number;
  } | null;
  yOffset: number;
  chestLocations: {
    localX: number;
    localY: number;
    localZ: number;
    qualityDistribution: WeightedDistribution<Rarity>;
  }[];
  spawnerBlockLocations: {
    localX: number;
    localY: number;
    localZ: number;
    mobTypeDistribution: WeightedDistribution<CaveMobNames>;
  }[];
  transformationsEnabled?: boolean;
}

export interface Prefab extends PrefabDefinition {
  dimensionX: number;
  dimensionY: number;
  dimensionZ: number;
}


export interface PrefabCenter {
  centreX: number;
  centreZ: number;
  prefab: {
    clearingRadiusSquared: number;
  }
}

export interface TreePlacement {
  treeX: number;
  treeZ: number;
  trunkBase: number;
  height: number;
  treeType: TreeType;
  vineDir?: number
}

export interface PrefabFrequency {
  prefabName: keyof typeof prefabDefinitions;
  frequency: number;
}

export interface PrefabFrequencySettings {
  density: number;
  frequencyParams: {
    noPrefabFrequency: number;
    prefabFrequencies: PrefabFrequency[];
  };
}

export interface BiomeConstructorOptions {
  oreGenerator: OreGenerator;
  [key: string]: any;
}

export interface PrefabPlacement {
  centreX: number;
  centreZ: number;
  anchorX: number;
  anchorZ: number;
  prefab: Prefab;
  xRotationOffset: number | null;
  zRotationOffset: number | null;
  shouldSwapXZ: boolean;
}

export interface PrefabInstance extends PrefabPlacement {
  anchorY: number;
  decodedPrefabSchematic: any;
  chestLocationToQuality: Sparse3DMap<Rarity>;
  spawnerBlockLocationToBlockId: Sparse3DMap<BlockId>;
  blockIdMapping: any;
}

export interface GeneratedPrefabPlacement extends PrefabPlacement {
  anchorY: number;
  chestLocationToQuality: Sparse3DMap<Rarity>;
  spawnerBlockLocationToBlockId: Sparse3DMap<BlockId>;
  blockIdMapping: any;
  decodedPrefabSchematic: any;
}

export interface ClusterConfig {
  blockName: BlockName;

  includeDown: boolean;
  includeSides: boolean;
  includeUp: boolean;

  spawnChance: number;
  minClusterCells: number;
  minChance: number;

  depthSettings?: {
    maxChance: number;
    shallowClusterY: number;
    deepClusterY: number;
  };
}

export interface ClusterSettingsResult {
  seedPrefix: string;
  anchorOptions: {
    offset: Vec3;
    blockId: number;
  }[];
  clusterBoxSize: number;
  spawnChance: number;
  minClusterCells: number;
  minChance: number;
  maxChance?: number;
  shallowClusterY?: number;
  deepClusterY?: number;
}