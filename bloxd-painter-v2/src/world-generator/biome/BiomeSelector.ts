import type { BlockId, BlockMetadata, Seed, Vec2 } from "../core/types.js";
import { Biome } from "./Biome.js";
import { PointsGenerator } from "../generator/PointsGenerator.js";
import { SimpleOctavesNoise } from "../noise/SimpleOctaveNoise.js";
import { SeededRandom } from "../noise/SeededRandom.js";
import { ChunkArray2D } from "../data/array/ChunkArray2D.js";
import { selectWeightedIndex } from "./biomeUtils.js";
import { WorldGenerator } from "../generator/WorldGenerator.js";
import { ChunkGeneratorCache } from "../data/cache/ChunkGeneratorCache.js";

interface MostRecentlyAccessedModifier {
  stoneTypeId: BlockId
}

interface StoneType {
  stoneId: number;
  frequency: number;
}

interface BiomeEntry {
  biome: Biome;
  frequency: number;
  altBiome: Biome | null;

  stoneTypes: StoneType[];
  stoneFrequencies: number[];
  stonesTotalFrequency: number;
}

export interface BiomeGenerateResult {
  weight: number;
  biome: Biome;
  biomeId: number;
  biomeModifiers: MostRecentlyAccessedModifier | null;
}

export class BiomeSelector {
  biomePointGen: PointsGenerator;
  biomeOffsetSimplex: SimpleOctavesNoise;
  baseBiome: Biome;
  biomesTotalFrequency: number;
  biomeEntries: BiomeEntry[];
  biomeFrequencies: number[];
  seed: Seed;
  blockMetadata: BlockMetadata;
  chunkSize: number;
  mostRecentlyAccessedPtForBiome: Vec2;
  mostRecentlyAccessedBiome: {
    biome: Biome;
    biomeId: number;
  } | undefined;
  mostRecentlyAccessedModifierPt: Vec2;
  mostRecentlyAccessedModifier: MostRecentlyAccessedModifier | undefined;

  constructor(
    worldGenerator: WorldGenerator,
    itemMetadata: any,
    seed: Seed,
    chunkSize: number,
    blockMetadata: BlockMetadata,
    biomeEntries: BiomeEntry[]
  ) {
    this.mostRecentlyAccessedPtForBiome = [0, 0];
    this.mostRecentlyAccessedBiome = undefined;
    this.mostRecentlyAccessedModifierPt = [0, 0];
    this.mostRecentlyAccessedModifier = undefined;

    this.seed = seed;
    this.blockMetadata = blockMetadata;
    this.chunkSize = chunkSize;

    this.biomePointGen = new PointsGenerator("biome", 150, false, true, seed, 3, chunkSize);
    this.biomeOffsetSimplex = new SimpleOctavesNoise([
      { amplitude: 1, frequency: 0.2 },
      { amplitude: 5, frequency: 1 / 70 }
    ], `${seed}BiomeOffsetSimplex`);

    this.baseBiome = new Biome(chunkSize, blockMetadata, worldGenerator, seed, {
      oreGenerator: itemMetadata
    });

    this.biomeEntries = biomeEntries;
    this.biomesTotalFrequency = 0;
    this.biomeFrequencies = new Array(this.biomeEntries.length);

    for (let biomeIndex = 0; biomeIndex < this.biomeEntries.length; biomeIndex++) {
      const biomeEntry = this.biomeEntries[biomeIndex]!;
      const { biome, frequency, altBiome } = biomeEntry;

      this.biomeFrequencies[biomeIndex] = frequency;

      if (altBiome !== null) {
        altBiome.init();
        if (altBiome.minDistanceFromOrigin > 0) {
          throw new Error(`Alt Biomes cannot have non-zero minDistanceFromOrigin: biomeId = ${biomeIndex}`);
        }
        let foundAltBiome = false;
        for (let searchIndex = 0; searchIndex < this.biomeEntries.length; searchIndex++) {
          if (this.biomeEntries[searchIndex]!.biome === altBiome) {
            foundAltBiome = true;
            break;
          }
        }
        if (!foundAltBiome) {
          throw new Error(`Alt Biome not found in list of biomes: biomeId = ${biomeIndex}`);
        }
      } else if (biome.minDistanceFromOrigin > 0) {
        throw new Error(`Biome has non-zero minDistanceFromOrigin, but no altBiome: biomeId = ${biomeIndex}`);
      }

      this.biomesTotalFrequency += frequency;
      biome.init();
    }
  }

  generate(
    worldX: number,
    worldZ: number
  ): BiomeGenerateResult[] {
    const offsetX = this.getBiomeXOffset(worldX, worldZ);
    const offsetZ = this.getBiomeZOffset(worldX, worldZ);
    const nearbyPoints = this.biomePointGen.getKClosestPointsWithWeights(worldX + offsetX, worldZ + offsetZ, 60);

    const result = [];
    for (let i = 0; i < nearbyPoints.length; i++) {
      const point = nearbyPoints[i]!;
      const { biome, biomeId } = this.getBiomeForBiomePoint(point.pt);

      const entry: BiomeGenerateResult = {
        weight: point.weight,
        biome,
        biomeId,
        biomeModifiers: null
      };

      if (i === 0) {
        entry.biomeModifiers = this.getBiomeModifiersForBiomePoint(point.pt);
      }

      result.push(entry);
    }

    return result;
  }

  getBiome(
    worldX: number,
    worldZ: number
  ) {
    const offsetX = this.getBiomeXOffset(worldX, worldZ);
    const offsetZ = this.getBiomeZOffset(worldX, worldZ);
    const closestPoint = this.biomePointGen.getClosestPoint(worldX + offsetX, worldZ + offsetZ);
    return this.getBiomeForBiomePoint(closestPoint);
  }

  getBiomeXOffset(
    worldX: number,
    worldZ: number
  ) {
    return Math.floor(this.biomeOffsetSimplex.getOctaves(worldX, worldZ));
  }

  getBiomeZOffset(
    worldX: number,
    worldZ: number
  ) {
    return Math.floor(this.biomeOffsetSimplex.getOctaves(worldX + 500, worldZ + 860));
  }

  getBiomeForBiomePoint(
    point: Vec2
  ) {
    if (
      this.mostRecentlyAccessedBiome &&
      point[0] === this.mostRecentlyAccessedPtForBiome[0] &&
      point[1] === this.mostRecentlyAccessedPtForBiome[1]
    ) {
      return this.mostRecentlyAccessedBiome;
    }

    const distFromOrigin = Math.max(Math.abs(point[0]), Math.abs(point[1]));
    const rng = new SeededRandom(`${point[0]}|${point[1]}|${this.seed}`);

    //のちほど
    let biomeIndex = selectWeightedIndex(this.biomeFrequencies, this.biomesTotalFrequency, rng);
    let selectedBiome = this.biomeEntries[biomeIndex]!.biome;

    if (distFromOrigin < selectedBiome.minDistanceFromOrigin) {
      selectedBiome = this.biomeEntries[biomeIndex]!.altBiome!;
      for (let searchIndex = 0; searchIndex < this.biomeEntries.length; searchIndex++) {
        if (this.biomeEntries[searchIndex]!.biome === selectedBiome) {
          biomeIndex = searchIndex;
          break;
        }
      }
    }

    const result = {
      biome: selectedBiome,
      biomeId: biomeIndex
    };

    this.mostRecentlyAccessedBiome = result;
    this.mostRecentlyAccessedPtForBiome[0] = point[0];
    this.mostRecentlyAccessedPtForBiome[1] = point[1];

    return result;
  }

  getBiomeModifiersForBiomePoint(
    point: Vec2
  ) {
    if (
      this.mostRecentlyAccessedModifier &&
      point[0] === this.mostRecentlyAccessedModifierPt[0] &&
      point[1] === this.mostRecentlyAccessedModifierPt[1]
    ) {
      return this.mostRecentlyAccessedModifier;
    }

    const { biomeId } = this.getBiomeForBiomePoint(point);
    const { stoneTypes, stoneFrequencies, stonesTotalFrequency } = this.biomeEntries[biomeId]!;

    const result = {
      stoneTypeId: stoneTypes[
        selectWeightedIndex(
          stoneFrequencies,
          stonesTotalFrequency,
          new SeededRandom(`${point[0]}|${point[1]}|${this.seed}Modifiers`)
        )
      ].stoneId
    };

    this.mostRecentlyAccessedModifier = result;
    this.mostRecentlyAccessedModifierPt[0] = point[0];
    this.mostRecentlyAccessedModifierPt[1] = point[1];

    return result;
  }

  getBiomeInfoForChunkFill(
    chunkStartX: number,
    chunkStartZ: number,
    biomeGrid: ChunkGeneratorCache
  ) {
    const result = {
      biomeIds: new ChunkArray2D(this.chunkSize, [chunkStartX, chunkStartZ]),
      stoneTypeIds: new ChunkArray2D(this.chunkSize, [chunkStartX, chunkStartZ])
    };

    for (let worldX = chunkStartX; worldX < chunkStartX + this.chunkSize; worldX++) {
      for (let worldZ = chunkStartZ; worldZ < chunkStartZ + this.chunkSize; worldZ++) {
        const point = biomeGrid.getOrGenerate(worldX, worldZ)[0]!;
        result.biomeIds.set(worldX, worldZ, point.biomeId);
        result.stoneTypeIds.set(worldX, worldZ, point.biomeModifiers!.stoneTypeId);
      }
    }

    return result;
  }

  getBiomeFromId(
    biomeId: number
  ) {
    return this.biomeEntries[biomeId]!.biome;
  }
}