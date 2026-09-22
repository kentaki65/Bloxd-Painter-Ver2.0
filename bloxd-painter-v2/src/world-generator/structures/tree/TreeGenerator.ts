import { CanopyType, TreeType, CanopyBlockPlacement, CanopyShape, CanopyLevel, HeightField, OUT_OF_RUNGE_NUMBER } from "../../core/constants.js";
import type { BlockId, BlockMetadata, ChunkArray, PrefabCenter, Seed, TreePlacement } from "../../core/types.js";
import { ChunkArray2D } from "../../data/array/ChunkArray2D.js";
import { PointsGenerator } from "../../generator/PointsGenerator.js";
import { CaveManager } from "../cave/CaveManager.js";
import { PrefabGenerator } from "../prefab/PrefabGenerator.js";
import { FixedPointPrefabManager } from "../prefab/FixedPointPrefabManager.js";
import { SeededRandom } from "../../noise/SeededRandom.js";
import { BiomeSelector } from "../../biome/BiomeSelector.js";
import { ChunkGeneratorCache } from "../../data/cache/ChunkGeneratorCache.js";
import { ChunkDataCache3D } from "../../data/cache/ChunkDataCache3D.js";
import { CaveDataView } from "../cave/CaveDataViewer.js";
import { Biome } from "../../biome/Biome.js";

type GeneratorFn = (dx: number, dz: number) => CanopyBlockPlacement;

interface TreeSettings {
  maxTreeRadius: number;
  biomeSelector: BiomeSelector;
}

interface TreeBlock {
  x: number;
  y: number;
  z: number;
  id: BlockId;
}

export class TreeGenerator {
  static initCanopyGenerationSchemaByShape(
    alwaysThreshold: number,
    sometimesThreshold: number,
    radius: number,
    shape: CanopyShape
  ) {
    return this.initCanopyGenerationSchemaByFunction(radius, (dx: number, dz: number): CanopyBlockPlacement => {
      const distance = shape === CanopyShape.CIRCLE
        ? Math.sqrt(dx * dx + dz * dz)
        : Math.max(Math.abs(dx - dz), Math.abs(dx + dz));
      if (distance < alwaysThreshold) {
        return CanopyBlockPlacement.ALWAYS;
      } else if (distance < sometimesThreshold) {
        return CanopyBlockPlacement.SOMETIMES;
      } else {
        return CanopyBlockPlacement.NEVER;
      }
    });
  }

  static initCanopyGenerationSchemaByFunction(
    radius: number,
    generatorFn: GeneratorFn,
  ) {
    const grid = new ChunkArray2D(radius * 2 + 1, [-radius, -radius]);
    for (let dx = -radius; dx <= radius; dx++) {
      for (let dz = -radius; dz <= radius; dz++) {
        const value = generatorFn(dx, dz);
        grid.set(dx, dz, value);
      }
    }
    return grid;
  }

  chunkSize: number;
  seed: Seed;
  blockMetadata: BlockMetadata;
  maxTreeRadius: number;
  treePointGen: PointsGenerator;
  minTreeHeight: number;
  maxTreeHeight: number;

  treeInfos: Record<TreeType, {
    trunkBlockId: BlockId;
    trunkBaseId: BlockId;
    canopyLeavesId: BlockId;
    canopyLeavesWithDropId: BlockId | null;
    canopyType: CanopyType;
    minHeight?: number;
    maxHeight?: number;
    vineProbability: number;
  }>;

  canopyInfos: Record<CanopyType, {
    canopyBottomOffset: number;
    canopyTopOffset: number;
    canopyRadius: number;
    canopyLevelToGenerationSchema: Record<CanopyLevel, ChunkArray2D | null>
  }>

  constructor(
    settings: TreeSettings,
    biomeAccessor: BiomeSelector,
    chunkSize: number,
    seed: Seed,
    blockMetadata: BlockMetadata
  ) {

    this.chunkSize = chunkSize;
    this.seed = seed;
    this.blockMetadata = blockMetadata;
    this.minTreeHeight = 4;
    this.maxTreeHeight = 7;

    const defaultVineProbability = 1 / 30;

    this.treeInfos = {
      [TreeType.Maple]: {
        trunkBlockId: blockMetadata["Maple Log"].id,
        trunkBaseId: blockMetadata["Maple Log|TreeBase|Maple"].id,
        canopyLeavesId: blockMetadata["Maple Leaves|TreeCanopy"].id,
        canopyLeavesWithDropId: blockMetadata["Fruity Maple Leaves"].id,
        canopyType: CanopyType.STANDARD,
        vineProbability: defaultVineProbability
      },
      [TreeType.Pine]: {
        trunkBlockId: blockMetadata["Pine Log"].id,
        trunkBaseId: blockMetadata["Pine Log|TreeBase|Pine"].id,
        canopyLeavesId: blockMetadata["Pine Leaves|TreeCanopy"].id,
        canopyLeavesWithDropId: blockMetadata["Pine Cone Leaves"].id,
        canopyType: CanopyType.FRILLED,
        vineProbability: 0,
        minHeight: 5,
        maxHeight: 7
      },
      [TreeType.Plum]: {
        trunkBlockId: blockMetadata["Plum Log"].id,
        trunkBaseId: blockMetadata["Plum Log|TreeBase|Plum"].id,
        canopyLeavesId: blockMetadata["Plum Leaves|TreeCanopy"].id,
        canopyLeavesWithDropId: blockMetadata["Fruity Plum Leaves"].id,
        canopyType: CanopyType.STANDARD,
        vineProbability: defaultVineProbability
      },
      [TreeType.Cedar]: {
        trunkBlockId: blockMetadata["Cedar Log"].id,
        trunkBaseId: blockMetadata["Cedar Log|TreeBase|Cedar"].id,
        canopyLeavesId: blockMetadata["Cedar Leaves|TreeCanopy"].id,
        canopyLeavesWithDropId: null,
        canopyType: CanopyType.STANDARD,
        vineProbability: defaultVineProbability
      },
      [TreeType.Aspen]: {
        trunkBlockId: blockMetadata["Aspen Log"].id,
        trunkBaseId: blockMetadata["Aspen Log|TreeBase|Aspen"].id,
        canopyLeavesId: blockMetadata["Aspen Leaves|TreeCanopy"].id,
        canopyLeavesWithDropId: null,
        canopyType: CanopyType.FRILLED,
        vineProbability: defaultVineProbability,
        minHeight: 5,
        maxHeight: 6
      },
      [TreeType.Jungle]: {
        trunkBlockId: blockMetadata["Jungle Log"].id,
        trunkBaseId: blockMetadata["Jungle Log|TreeBase|Jungle"].id,
        canopyLeavesId: blockMetadata["Jungle Leaves|TreeCanopy"].id,
        canopyLeavesWithDropId: null,
        canopyType: CanopyType.FLAT,
        vineProbability: 0.5,
        minHeight: 2,
        maxHeight: 7
      },
      [TreeType.Palm]: {
        trunkBlockId: blockMetadata["Palm Log"].id,
        trunkBaseId: blockMetadata["Palm Log|TreeBase|Palm"].id,
        canopyLeavesId: blockMetadata["Palm Leaves|TreeCanopy"].id,
        canopyLeavesWithDropId: blockMetadata["Fruity Palm Leaves"].id,
        canopyType: CanopyType.DROOPY,
        vineProbability: 1 / 3,
        minHeight: 4,
        maxHeight: 6
      },
      [TreeType.AutumnMaple]: {
        trunkBlockId: blockMetadata["Maple Log"].id,
        trunkBaseId: blockMetadata["Maple Log|TreeBase|Maple"].id,
        canopyLeavesId: blockMetadata["Autumn Maple Leaves|TreeCanopy"].id,
        canopyLeavesWithDropId: null,
        canopyType: CanopyType.STANDARD,
        vineProbability: defaultVineProbability
      },
      [TreeType.Pear]: {
        trunkBlockId: blockMetadata["Pear Log"].id,
        trunkBaseId: blockMetadata["Pear Log|TreeBase|Pear"].id,
        canopyLeavesId: blockMetadata["Pear Leaves|TreeCanopy"].id,
        canopyLeavesWithDropId: blockMetadata["Fruity Pear Leaves"].id,
        canopyType: CanopyType.TALL,
        vineProbability: defaultVineProbability,
        minHeight: 3,
        maxHeight: 5
      },
      [TreeType.Cherry]: {
        trunkBlockId: blockMetadata["Cherry Log"].id,
        trunkBaseId: blockMetadata["Cherry Log|TreeBase|Cherry"].id,
        canopyLeavesId: blockMetadata["Cherry Leaves|TreeCanopy"].id,
        canopyLeavesWithDropId: blockMetadata["Fruity Cherry Leaves"].id,
        canopyType: CanopyType.DROOPY,
        vineProbability: 0,
        minHeight: 4,
        maxHeight: 6
      },
      [TreeType.Spectral]: {
        trunkBlockId: blockMetadata["Spectral Log"].id,
        trunkBaseId: blockMetadata["Spectral Log|TreeBase|Spectral"].id,
        canopyLeavesId: blockMetadata["Spectral Leaves|TreeCanopy"].id,
        canopyLeavesWithDropId: null,
        canopyType: CanopyType.STANDARD,
        vineProbability: 0
      },
      [TreeType.Mango]: {
        trunkBlockId: blockMetadata["Mango Log"].id,
        trunkBaseId: blockMetadata["Mango Log|TreeBase|Mango"].id,
        canopyLeavesId: blockMetadata["Mango Leaves|TreeCanopy"].id,
        canopyLeavesWithDropId: blockMetadata["Fruity Mango Leaves"].id,
        canopyType: CanopyType.TALL,
        vineProbability: 0.2,
        minHeight: 3,
        maxHeight: 6
      },
      [TreeType.AutumnAspen]: {
        trunkBlockId: blockMetadata["Aspen Log"].id,
        trunkBaseId: blockMetadata["Aspen Log|TreeBase|Aspen"].id,
        canopyLeavesId: blockMetadata["Autumn Aspen Leaves|TreeCanopy"].id,
        canopyLeavesWithDropId: null,
        canopyType: CanopyType.FRILLED,
        vineProbability: defaultVineProbability,
        minHeight: 5,
        maxHeight: 6
      }
    };

    this.maxTreeRadius = settings.maxTreeRadius;
    if (this.chunkSize <= this.maxTreeRadius * 2 + 1) {
      throw new Error("Tree radius is too large for chunk size");
    }
    if (this.chunkSize <= this.maxTreeHeight) {
      throw new Error("Max tree height is too large for chunk size");
    }

    this.canopyInfos = {
      [CanopyType.STANDARD]: {
        canopyBottomOffset: -2,
        canopyTopOffset: 1,
        canopyRadius: 2,
        canopyLevelToGenerationSchema: {
          [CanopyLevel.TOP]: TreeGenerator.initCanopyGenerationSchemaByShape(0.2, 1.1, 2, CanopyShape.CIRCLE),
          [CanopyLevel.UPPER_MIDDLE]: null,
          [CanopyLevel.MIDDLE]: TreeGenerator.initCanopyGenerationSchemaByShape(1.2, 1.7, 2, CanopyShape.CIRCLE),
          [CanopyLevel.LOWER_MIDDLE]: null,
          [CanopyLevel.BOTTOM]: TreeGenerator.initCanopyGenerationSchemaByShape(2.8, 3, 2, CanopyShape.CIRCLE)
        }
      },
      [CanopyType.FRILLED]: {
        canopyBottomOffset: -3,
        canopyTopOffset: 1,
        canopyRadius: 2,
        canopyLevelToGenerationSchema: {
          [CanopyLevel.TOP]: TreeGenerator.initCanopyGenerationSchemaByShape(0.1, 0.1, 2, CanopyShape.CIRCLE),
          [CanopyLevel.UPPER_MIDDLE]: TreeGenerator.initCanopyGenerationSchemaByShape(2, 2, 2, CanopyShape.DIAMOND),
          [CanopyLevel.MIDDLE]: null,
          [CanopyLevel.LOWER_MIDDLE]: TreeGenerator.initCanopyGenerationSchemaByShape(3, 3, 2, CanopyShape.DIAMOND),
          [CanopyLevel.BOTTOM]: TreeGenerator.initCanopyGenerationSchemaByShape(2.8, 2.8, 2, CanopyShape.CIRCLE)
        }
      },
      [CanopyType.TALL]: {
        canopyBottomOffset: -1,
        canopyTopOffset: 2,
        canopyRadius: 2,
        canopyLevelToGenerationSchema: {
          [CanopyLevel.TOP]: TreeGenerator.initCanopyGenerationSchemaByShape(0.8, 2, 2, CanopyShape.DIAMOND),
          [CanopyLevel.UPPER_MIDDLE]: TreeGenerator.initCanopyGenerationSchemaByShape(1.7, 1.7, 2, CanopyShape.CIRCLE),
          [CanopyLevel.MIDDLE]: null,
          [CanopyLevel.LOWER_MIDDLE]: TreeGenerator.initCanopyGenerationSchemaByShape(1.7, 2.2, 2, CanopyShape.CIRCLE),
          [CanopyLevel.BOTTOM]: TreeGenerator.initCanopyGenerationSchemaByShape(2.8, 2.8, 2, CanopyShape.CIRCLE)
        }
      },
      [CanopyType.FLAT]: {
        canopyBottomOffset: 0,
        canopyTopOffset: 1,
        canopyRadius: 3,
        canopyLevelToGenerationSchema: {
          [CanopyLevel.TOP]: TreeGenerator.initCanopyGenerationSchemaByShape(2.2, 2.5, 3, CanopyShape.CIRCLE),
          [CanopyLevel.UPPER_MIDDLE]: TreeGenerator.initCanopyGenerationSchemaByFunction(3, (dx, dz) => {
            if (Math.sqrt(dx * dx + dz * dz) > 3.2) {
              return CanopyBlockPlacement.NEVER;
            }
            const absDx = Math.abs(dx);
            const absDz = Math.abs(dz);
            if (absDx === 1 && absDz === 3 || absDx === 3 && absDz === 1) {
              return CanopyBlockPlacement.SOMETIMES;
            } else {
              return CanopyBlockPlacement.ALWAYS;
            }
          }),
          [CanopyLevel.MIDDLE]: null,
          [CanopyLevel.LOWER_MIDDLE]: null,
          [CanopyLevel.BOTTOM]: null
        }
      },
      [CanopyType.DROOPY]: {
        canopyBottomOffset: -2,
        canopyTopOffset: 1,
        canopyRadius: 2,
        canopyLevelToGenerationSchema: {
          [CanopyLevel.TOP]: TreeGenerator.initCanopyGenerationSchemaByShape(2, 2, 2, CanopyShape.CIRCLE),
          [CanopyLevel.UPPER_MIDDLE]: TreeGenerator.initCanopyGenerationSchemaByShape(2.2, 2.8, 2, CanopyShape.CIRCLE),
          [CanopyLevel.MIDDLE]: null,
          [CanopyLevel.LOWER_MIDDLE]: TreeGenerator.initCanopyGenerationSchemaByFunction(2, (dx, dz) =>
            Math.abs(dx) === 2 && Math.abs(dz) === 2 ? CanopyBlockPlacement.SOMETIMES : CanopyBlockPlacement.ALWAYS
          ),
          [CanopyLevel.BOTTOM]: TreeGenerator.initCanopyGenerationSchemaByFunction(2, (dx, dz) => {
            const absDx = Math.abs(dx);
            const absDz = Math.abs(dz);
            if (absDx === 2 && absDz === 2 || absDx === 0 && absDz === 1 || absDx === 1 && absDz === 0) {
              return CanopyBlockPlacement.ALWAYS;
            } else {
              return CanopyBlockPlacement.NEVER;
            }
          })
        }
      }
    };

    for (const canopyType in this.canopyInfos) {
      const canopyInfo = this.canopyInfos[canopyType as unknown as CanopyType];

      if (canopyInfo.canopyRadius > this.maxTreeRadius) {
        throw new Error(
          `Canopy radius ${canopyInfo.canopyRadius} for canopy type "${canopyType}" is larger than tree radius ${this.maxTreeRadius}`
        );
      }
    }

    let minTreeMinDist = 100000;
    let maxTreeMinDist = 0;
    for (const biomeSelectorEntry of settings.biomeSelector.biomeEntries) {
      if (biomeSelectorEntry.biome.treeMinDist) {
        minTreeMinDist = Math.min(minTreeMinDist, biomeSelectorEntry.biome.treeMinDist);
        maxTreeMinDist = Math.max(maxTreeMinDist, biomeSelectorEntry.biome.treeMinDist);
      }
    }

    this.treePointGen = new PointsGenerator(
      "tree", 6, true, false, seed, 300, chunkSize,
      {
        func: point => biomeAccessor.getBiome(point[0], point[1]).biome.treeMinDist || maxTreeMinDist,
        min: minTreeMinDist,
        max: maxTreeMinDist
      },
      false,
      2
    );
  }

  getTreesForChunk(
    chunkStartX: number,
    chunkStartZ: number,
    heightmapVals: ChunkDataCache3D | null,
    biomeGrid: ChunkGeneratorCache,
    caveHeightmapVals: CaveDataView,
    placedPrefabs: PrefabCenter[],
    fixedPrefabInfo: ChunkDataCache3D | null,
  ): TreePlacement[] {
    const trees = [];
    for (let worldX = chunkStartX - this.maxTreeRadius; worldX < chunkStartX + this.chunkSize + this.maxTreeRadius; worldX++) {
      for (let worldZ = chunkStartZ - this.maxTreeRadius; worldZ < chunkStartZ + this.chunkSize + this.maxTreeRadius; worldZ++) {
        const biome = biomeGrid.getOrGenerate(worldX, worldZ)[0]!.biome;
        if (biome.treeMinDist !== null) {
          if (biome.getTotalTreeChance() <= 0) {
            console.error("Biome", biome, "has 0 total tree chance");
          }
          if (!this.treePointGen.isPoint(worldX, worldZ)) {
            continue;
          }
          if (heightmapVals?.getOrGenerate(worldX, worldZ, HeightField.WaterHeight) !== OUT_OF_RUNGE_NUMBER.NO_WATER_VALUE) {
            continue;
          }
          const groundHeight = heightmapVals.getOrGenerate(worldX, worldZ, HeightField.GroundHeight);
          if (CaveManager.isInCave(worldX, groundHeight!, worldZ, caveHeightmapVals)) {
            continue;
          }
          if (PrefabGenerator.isWithinPrefabClearing(worldX, worldZ, placedPrefabs)) {
            continue;
          }
          if (FixedPointPrefabManager.isNearFixedPointPrefab(worldX, worldZ, fixedPrefabInfo)) {
            continue;
          }
          const rng = new SeededRandom(`${worldX}${worldZ}${this.seed}treeHeight`);
          const treeType = TreeGenerator.getTreeTypeFromBiome(biome, rng);
          const { height: treeHeight, vineDir } = this.getRandTreeInfo(rng, treeType);
          trees.push({
            treeX: worldX,
            treeZ: worldZ,
            trunkBase: groundHeight! + 1,
            height: treeHeight,
            vineDir,
            treeType
          });
        }
      }
    }
    return trees;
  }

  getRandTreeInfo(
    rng: SeededRandom,
    treeType: TreeType
  ) {
    const treeInfo = this.treeInfos[treeType];
    const minHeight = treeInfo.minHeight ?? this.minTreeHeight;
    const maxHeight = treeInfo.maxHeight ?? this.maxTreeHeight;
    return {
      height: Math.floor(rng.next() * (maxHeight - minHeight)) + minHeight,
      vineDir: rng.next() < treeInfo.vineProbability ? Math.floor(rng.next() * 4) : -1
    };
  }

  static getTreeTypeFromBiome(
    biome: Biome,
    rng: SeededRandom
  ) {
    const randomValue = Math.floor(rng.next() * biome.getTotalTreeChance());
    let cumulativeChance = 0;
    let index = 0;
    while (cumulativeChance <= randomValue) {
      cumulativeChance += biome.treeChances[index]!.chance;
      index++;
    }
    return biome.treeChances[index - 1]!.treeType;
  }

  addTreesToChunk(
    chunkArray: ChunkArray,
    chunkStartX: number,
    chunkStartY: number,
    chunkStartZ: number,
    trees: TreePlacement[]
  ) {
    for (const tree of trees) {
      const rng = new SeededRandom(`${tree.treeX}|${tree.treeZ}|${tree.trunkBase}|tree`);
      const canopyBottomY = this.addTreeCanopyToChunk(chunkArray, chunkStartX, chunkStartY, chunkStartZ, tree, rng);
      this.addTreeTrunkToChunk(chunkArray, chunkStartX, chunkStartY, chunkStartZ, tree, canopyBottomY);
    }
  }

  addTreeCanopyToChunk(
    chunkArray: ChunkArray,
    chunkStartX: number,
    chunkStartY: number,
    chunkStartZ: number,
    tree: TreePlacement,
    rng: SeededRandom
  ) {
    const treeX = tree.treeX;
    const treeZ = tree.treeZ;
    const trunkBase = tree.trunkBase;
    const trunkTop = trunkBase + tree.height - 1;
    const treeInfo = this.treeInfos[tree.treeType];
    const canopyInfo = this.canopyInfos[treeInfo.canopyType];
    const canopyBottomY = trunkBase + tree.height + canopyInfo.canopyBottomOffset;
    const canopyTopY = trunkBase + tree.height + canopyInfo.canopyTopOffset;

    const clampedMinY = Math.max(canopyBottomY, chunkStartY);
    const clampedMaxY = Math.min(canopyTopY, chunkStartY + this.chunkSize - 1);
    if (clampedMaxY < clampedMinY) {
      return canopyBottomY;
    }

    const clampedMinX = Math.max(treeX - canopyInfo.canopyRadius, chunkStartX);
    const clampedMaxX = Math.min(treeX + canopyInfo.canopyRadius, chunkStartX + this.chunkSize - 1);
    if (clampedMinX > clampedMaxX) {
      return canopyBottomY;
    }

    const clampedMinZ = Math.max(treeZ - canopyInfo.canopyRadius, chunkStartZ);
    const clampedMaxZ = Math.min(treeZ + canopyInfo.canopyRadius, chunkStartZ + this.chunkSize - 1);
    if (clampedMinZ > clampedMaxZ) {
      return canopyBottomY;
    }

    const canopyLeavesId = treeInfo.canopyLeavesId;
    const canopyLeavesWithDropId = treeInfo.canopyLeavesWithDropId;

    if (treeInfo.canopyType === CanopyType.FRILLED) {
      this.addFrilledCanopyToChunk(chunkArray, chunkStartX, chunkStartY, chunkStartZ, treeX, treeZ, clampedMinX, clampedMaxX, clampedMinZ, clampedMaxZ, trunkTop, canopyLeavesId, canopyLeavesWithDropId, clampedMinY, clampedMaxY, canopyTopY, canopyInfo.canopyLevelToGenerationSchema, rng);
    } else if (treeInfo.canopyType === CanopyType.TALL || treeInfo.canopyType === CanopyType.DROOPY) {
      this.addTallOrDroopyCanopyToChunk(chunkArray, chunkStartX, chunkStartY, chunkStartZ, treeX, treeZ, clampedMinX, clampedMaxX, clampedMinZ, clampedMaxZ, trunkTop, canopyLeavesId, canopyLeavesWithDropId, clampedMinY, clampedMaxY, canopyTopY, canopyInfo.canopyLevelToGenerationSchema, rng);
    } else if (treeInfo.canopyType === CanopyType.FLAT) {
      this.addFlatCanopyToChunk(chunkArray, chunkStartX, chunkStartY, chunkStartZ, treeX, treeZ, clampedMinX, clampedMaxX, clampedMinZ, clampedMaxZ, trunkTop, canopyLeavesId, canopyLeavesWithDropId, clampedMinY, clampedMaxY, canopyTopY, canopyInfo.canopyLevelToGenerationSchema, rng);
    } else {
      this.addStandardCanopyToChunk(chunkArray, chunkStartX, chunkStartY, chunkStartZ, treeX, treeZ, clampedMinX, clampedMaxX, clampedMinZ, clampedMaxZ, trunkTop, canopyLeavesId, canopyLeavesWithDropId, clampedMinY, clampedMaxY, canopyTopY, canopyInfo.canopyLevelToGenerationSchema, rng);
    }

    return canopyBottomY;
  }

  addStandardCanopyToChunk(
    chunkArray: ChunkArray,
    chunkStartX: number,
    chunkStartY: number,
    chunkStartZ: number,
    treeX: number,
    treeZ: number,
    clampedMinX: number,
    clampedMaxX: number,
    clampedMinZ: number,
    clampedMaxZ: number,
    trunkTop: number,
    canopyLeavesId: BlockId,
    canopyLeavesWithDropId: BlockId | null,
    clampedMinY: number,
    clampedMaxY: number,
    canopyTopY: number,
    canopyLevelToGenerationSchema: Record<CanopyLevel, ChunkArray2D | null>,
    rng: SeededRandom
  ) {
    for (let worldX = clampedMinX; worldX <= clampedMaxX; worldX++) {
      const localX = worldX - treeX;
      for (let worldY = clampedMinY; worldY <= clampedMaxY; worldY++) {
        let canopyLevel;
        canopyLevel = worldY === canopyTopY ? CanopyLevel.TOP : worldY === canopyTopY - 1 ? CanopyLevel.MIDDLE : CanopyLevel.BOTTOM;
        const generationSchema = canopyLevelToGenerationSchema[canopyLevel];
        for (let worldZ = clampedMinZ; worldZ <= clampedMaxZ; worldZ++) {
          const localZ = worldZ - treeZ;
          this.applyCanopyGenerationSchema(chunkArray, chunkStartX, chunkStartY, chunkStartZ, worldX, worldY, worldZ, trunkTop, canopyLeavesId, canopyLeavesWithDropId, localX, localZ, generationSchema, rng);
        }
      }
    }
  }

  addFrilledCanopyToChunk(
    chunkArray: ChunkArray,
    chunkStartX: number,
    chunkStartY: number,
    chunkStartZ: number,
    treeX: number,
    treeZ: number,
    clampedMinX: number,
    clampedMaxX: number,
    clampedMinZ: number,
    clampedMaxZ: number,
    trunkTop: number,
    canopyLeavesId: BlockId,
    canopyLeavesWithDropId: BlockId | null,
    clampedMinY: number,
    clampedMaxY: number,
    canopyTopY: number,
    canopyLevelToGenerationSchema: Record<CanopyLevel, ChunkArray2D | null>,
    rng: SeededRandom
  ) {
    const useLowerMiddleLayer = rng.next() < 0.7;
    for (let worldX = clampedMinX; worldX <= clampedMaxX; worldX++) {
      const localX = worldX - treeX;
      for (let worldY = clampedMinY; worldY <= clampedMaxY; worldY++) {
        const levelOffset = canopyTopY - worldY;
        let canopyLevel;
        if (levelOffset === 0) {
          canopyLevel = CanopyLevel.TOP;
        } else if (levelOffset === 2) {
          if (!useLowerMiddleLayer) {
            continue;
          }
          canopyLevel = CanopyLevel.LOWER_MIDDLE;
        } else {
          canopyLevel = levelOffset === 4 ? CanopyLevel.BOTTOM : CanopyLevel.UPPER_MIDDLE;
        }
        const generationSchema = canopyLevelToGenerationSchema[canopyLevel];
        for (let worldZ = clampedMinZ; worldZ <= clampedMaxZ; worldZ++) {
          const localZ = worldZ - treeZ;
          this.applyCanopyGenerationSchema(chunkArray, chunkStartX, chunkStartY, chunkStartZ, worldX, worldY, worldZ, trunkTop, canopyLeavesId, canopyLeavesWithDropId, localX, localZ, generationSchema, rng);
        }
      }
    }
  }

  addTallOrDroopyCanopyToChunk(
    chunkArray: ChunkArray,
    chunkStartX: number,
    chunkStartY: number,
    chunkStartZ: number,
    treeX: number,
    treeZ: number,
    clampedMinX: number,
    clampedMaxX: number,
    clampedMinZ: number,
    clampedMaxZ: number,
    trunkTop: number,
    canopyLeavesId: BlockId,
    canopyLeavesWithDropId: BlockId | null,
    clampedMinY: number,
    clampedMaxY: number,
    canopyTopY: number,
    canopyLevelToGenerationSchema: Record<CanopyLevel, ChunkArray2D | null>,
    rng: SeededRandom
  ) {
    for (let worldX = clampedMinX; worldX <= clampedMaxX; worldX++) {
      const localX = worldX - treeX;
      for (let worldY = clampedMinY; worldY <= clampedMaxY; worldY++) {
        let canopyLevel;
        canopyLevel = worldY === canopyTopY
          ? CanopyLevel.TOP
          : worldY === canopyTopY - 1
            ? CanopyLevel.UPPER_MIDDLE
            : worldY === canopyTopY - 2
              ? CanopyLevel.LOWER_MIDDLE
              : CanopyLevel.BOTTOM;
        const generationSchema = canopyLevelToGenerationSchema[canopyLevel];
        for (let worldZ = clampedMinZ; worldZ <= clampedMaxZ; worldZ++) {
          const localZ = worldZ - treeZ;
          this.applyCanopyGenerationSchema(chunkArray, chunkStartX, chunkStartY, chunkStartZ, worldX, worldY, worldZ, trunkTop, canopyLeavesId, canopyLeavesWithDropId, localX, localZ, generationSchema, rng);
        }
      }
    }
  }

  addFlatCanopyToChunk(
    chunkArray: ChunkArray,
    chunkStartX: number,
    chunkStartY: number,
    chunkStartZ: number,
    treeX: number,
    treeZ: number,
    clampedMinX: number,
    clampedMaxX: number,
    clampedMinZ: number,
    clampedMaxZ: number,
    trunkTop: number,
    canopyLeavesId: BlockId,
    canopyLeavesWithDropId: BlockId | null,
    clampedMinY: number,
    clampedMaxY: number,
    canopyTopY: number,
    canopyLevelToGenerationSchema: Record<CanopyLevel, ChunkArray2D | null>,
    rng: SeededRandom
  ) {
    for (let worldX = clampedMinX; worldX <= clampedMaxX; worldX++) {
      const localX = worldX - treeX;
      for (let worldY = clampedMinY; worldY <= clampedMaxY; worldY++) {
        let canopyLevel;
        if (worldY === canopyTopY) {
          canopyLevel = CanopyLevel.TOP;
        } else if (worldY === canopyTopY - 1) {
          canopyLevel = CanopyLevel.UPPER_MIDDLE;
        }
        const generationSchema = canopyLevelToGenerationSchema[canopyLevel!];
        for (let worldZ = clampedMinZ; worldZ <= clampedMaxZ; worldZ++) {
          const localZ = worldZ - treeZ;
          this.applyCanopyGenerationSchema(chunkArray, chunkStartX, chunkStartY, chunkStartZ, worldX, worldY, worldZ, trunkTop, canopyLeavesId, canopyLeavesWithDropId, localX, localZ, generationSchema, rng);
        }
      }
    }
  }

  applyCanopyGenerationSchema(
    chunkArray: ChunkArray,
    chunkStartX: number,
    chunkStartY: number,
    chunkStartZ: number,
    worldX: number,
    worldY: number,
    worldZ: number,
    trunkTop: number,
    canopyLeavesId: BlockId,
    canopyLeavesWithDropId: BlockId | null,
    localX: number,
    localZ: number,
    generationSchema: ChunkArray2D | null,
    rng: SeededRandom
  ) {
    if (worldY <= trunkTop && localX === 0 && localZ === 0) {
      return;
    }

    if (generationSchema === null) {
      return;
    }

    let blockId;
    const schemaValue = generationSchema.get(localX, localZ);
    if (schemaValue === CanopyBlockPlacement.ALWAYS) {
      blockId = canopyLeavesId;
    } else {
      if (schemaValue === CanopyBlockPlacement.NEVER) {
        return;
      }
      if (schemaValue !== CanopyBlockPlacement.SOMETIMES) {
        console.error(`Invalid canopy-generation type: ${schemaValue}`);
        return;
      }
      if (!(rng.next() < 0.8)) {
        return;
      }
      blockId = canopyLeavesId;
    }
    if (canopyLeavesWithDropId !== null && rng.next() < 1 / 15) {
      blockId = canopyLeavesWithDropId;
    }
    chunkArray.set(worldX - chunkStartX, worldY - chunkStartY, worldZ - chunkStartZ, blockId);
  }

  addTreeTrunkToChunk(
    chunkArray: ChunkArray,
    chunkStartX: number,
    chunkStartY: number,
    chunkStartZ: number,
    tree: TreePlacement,
    canopyBottomY: number
  ) {
    const chunkEndX = chunkStartX + this.chunkSize;
    const chunkEndY = chunkStartY + this.chunkSize;
    const chunkEndZ = chunkStartZ + this.chunkSize;
    const treeX = tree.treeX;
    const trunkBase = tree.trunkBase;
    const treeZ = tree.treeZ;
    const treeInfo = this.treeInfos[tree.treeType];
    const isTreeXZInChunk = chunkStartX <= treeX && treeX < chunkEndX && chunkStartZ <= treeZ && treeZ < chunkEndZ;
    const isTrunkBaseInChunkY = chunkStartY <= trunkBase && trunkBase < chunkEndY;
    const trunkStartY = Math.max(trunkBase + 1, chunkStartY);
    const trunkEndY = Math.min(trunkBase + tree.height, chunkEndY) - 1;
    canopyBottomY = Math.min(canopyBottomY, chunkEndY);

    if (isTreeXZInChunk) {
      if (isTrunkBaseInChunkY) {
        chunkArray.set(treeX - chunkStartX, trunkBase - chunkStartY, treeZ - chunkStartZ, treeInfo.trunkBaseId);
      }
      for (let y = trunkStartY; y <= trunkEndY; y++) {
        chunkArray.set(treeX - chunkStartX, y - chunkStartY, treeZ - chunkStartZ, treeInfo.trunkBlockId);
      }
    }

    const vineDir = tree.vineDir;
    if (vineDir === -1) {
      return;
    }

    let vineBlockId;
    let dx = 0;
    let dz = 0;
    if (vineDir === 0) {
      dx = -1;
      vineBlockId = this.blockMetadata["Vines|meta|rot4"].id;
    } else if (vineDir === 1) {
      dz = 1;
      vineBlockId = this.blockMetadata.Vines.id;
    } else if (vineDir === 2) {
      dx = 1;
      vineBlockId = this.blockMetadata["Vines|meta|rot2"].id;
    } else if (vineDir === 3) {
      dz = -1;
      vineBlockId = this.blockMetadata["Vines|meta|rot3"].id;
    }

    const vineX = treeX + dx;
    const vineZ = treeZ + dz;
    if (!(vineX < chunkStartX) && !(vineX >= chunkEndX) && !(vineZ < chunkStartZ) && !(vineZ >= chunkEndZ)) {
      if (isTrunkBaseInChunkY) {
        chunkArray.set(vineX - chunkStartX, trunkBase - chunkStartY, vineZ - chunkStartZ, vineBlockId!);
      }
      for (let y = trunkStartY; y < canopyBottomY; y++) {
        chunkArray.set(vineX - chunkStartX, y - chunkStartY, vineZ - chunkStartZ, vineBlockId!);
      }
    }
  }

  getAllBlocksForTree(tree: TreePlacement) {
    const halfChunkSize = this.chunkSize >> 1;
    const originX = tree.treeX - halfChunkSize;
    const originY = tree.trunkBase;
    const originZ = tree.treeZ - halfChunkSize;
    const blocks: TreeBlock[] = [];
    const wrapper = new TreeBlockPlacer(blocks, originX, originY, originZ);
    this.addTreesToChunk(wrapper, originX, originY, originZ, [tree]);
    return blocks;
  }
}

export class TreeBlockPlacer implements ChunkArray {
  treeBlocks: TreeBlock[];

  startX: number;
  startY: number;
  startZ: number;

  constructor(
    treeBlocks: TreeBlock[],
    startX: number,
    startY: number,
    startZ: number
  ) {
    this.treeBlocks = treeBlocks;
    this.startX = startX;
    this.startY = startY;
    this.startZ = startZ;
  }

  set(x: number, y: number, z: number, id: BlockId) {
    this.treeBlocks.push({
      x: x + this.startX,
      y: y + this.startY,
      z: z + this.startZ,
      id
    });
  }
}