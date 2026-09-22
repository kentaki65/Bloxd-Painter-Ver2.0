import { BlockId, Seed, Vec2, BlockName, BlockMetadata } from "@/core/types.js";
import { PartitionedTTLCache } from "@/data/cache/PartitionedTTLCache.js";
import { PartitionTTLCache } from "@/data/cache/PartitionTTLCache.js";
import { FeaturePointGenerator } from "@/generator/FeaturePointGenerator.js";
import { PointsGenerator } from "@/generator/PointsGenerator.js";
import { SimpleOctavesNoise } from "@/noise/SimpleOctaveNoise.js";
import { ThresholdOctaveNoise } from "@/noise/ThresholdOctavesNoise.js";
import { RandomIntRange } from "@/random/RandomIntRange.js";
import { RandomRange } from "@/random/RandomRange.js";
import { WeightedDistribution } from "@/random/WeightedDistribution.js";
import { getBlockId, isNullOrUndefined } from "@/utils/utils.js";
import { CaveGenerator } from "./CaveGenerator.js";
import { multiplyByChunkSize, normalizeVector2 } from "@/utils/mathHelper.js";
import { SeededRandom } from "@/noise/SeededRandom.js";
import { ChunkDataCache3D } from "@/data/cache/ChunkDataCache3D.js";

type Range = {
  low: number;
  high: number;
};

interface CaveHeightThreshold extends Range {
  midpoint: number;
  width: number;
  halfWidth: number;
}

export interface SpaghettiCaveMetadata {
  caveType: number;
  caveEdgeNoiseGenerator: SimpleOctavesNoise;
  caveHeightNoiseGenerator: ThresholdOctaveNoise;
  caveHeightThreshold: CaveHeightThreshold;
  caveHeightMax: number;
  caveHeightPercentageUpperBound: number;
  caveXZPerturbNoiseGenerator: SimpleOctavesNoise;
  caveYPerturbNoiseGenerator: SimpleOctavesNoise;
  caveCentreY: number;
}

interface PitCaveMetadata {
  caveType: number;
  wallType: number | null;
  ceilingType: number | null;
  pitCeilingThicknessDistribution: RandomIntRange | null;
  pitPointGenerator: FeaturePointGenerator;
  pitXZPerturbNoiseGenerator: SimpleOctavesNoise;
  pitWidthDistribution: RandomIntRange;
  pitLengthDistribution: RandomIntRange;
  pitFloorYDistribution: RandomIntRange;
  pitHeightDistribution: RandomIntRange;
  pitFloorYPerturbNoiseGenerator: SimpleOctavesNoise;
  pitHeightPerturbNoiseGenerator: SimpleOctavesNoise | null;
  pitMidpointYPerturbNoiseGenerator: SimpleOctavesNoise;
}

interface RavineCaveMetadata {
  caveType: number;
  ravinePointGenerator: FeaturePointGenerator;
  ravineXZPerturbNoiseGenerator: SimpleOctavesNoise;
  ravineYPerturbNoiseGenerator: SimpleOctavesNoise;
  ravineWidthDistribution: RandomIntRange;
  ravineLengthDistribution: RandomIntRange;
  ravineFloorYDistribution: RandomIntRange;
  ravineHeightDistribution: RandomIntRange;
  ravineXZDirectionDistribution: RandomRange;
}

interface SphereCaveMetadata {
  caveType: number;
  spherePointGenerator: FeaturePointGenerator;
  sphereXZPerturbNoiseGenerator: SimpleOctavesNoise;
  sphereRadiusDistribution: RandomIntRange;
  sphereCentreYDistribution: RandomIntRange;
}

export type PitCaveMetadataForChunk = {
  caveType: number;
  wallType: number | null;
  ceilingType: number | null;
  pitCeilingThickness: number;
  pitMinX: number;
  pitMaxX: number;
  pitMinZ: number;
  pitMaxZ: number;
  pitFloorY: number;
  pitHeight: number;
  pitXZPerturbNoiseGenerator: SimpleOctavesNoise;
  pitFloorYPerturbNoiseGenerator: SimpleOctavesNoise;
  pitHeightPerturbNoiseGenerator: SimpleOctavesNoise | null;
  pitMidpointYPerturbNoiseGenerator: SimpleOctavesNoise;
};

export type RavineCaveMetadataForChunk = {
  caveType: number;
  ravineCentre: Vec2;
  ravineWidth: number;
  ravineLength: number;
  ravineFloorY: number;
  ravineHeight: number;
  ravineDirection: Vec2;
  ravineXZPerturbNoiseGenerator: SimpleOctavesNoise;
  ravineYPerturbNoiseGenerator: SimpleOctavesNoise;
};

export type SphereCaveMetadataForChunk = {
  caveType: number;
  sphereRadiusSquared: number;
  sphereCentreX: number;
  sphereCentreY: number;
  sphereCentreZ: number;
  sphereXZPerturbNoiseGenerator: SimpleOctavesNoise;
};

interface CaveMetadataForChunk {
  spaghettiCaveMetadataForChunk: SpaghettiCaveMetadata[];
  pitCaveMetadataForChunk: PitCaveMetadataForChunk[];
  ravineCaveMetadataForChunk: RavineCaveMetadataForChunk[];
  sphereCaveMetadataForChunk: SphereCaveMetadataForChunk[];
}

export type CaveTypeBlockId = BlockId | WeightedDistribution<number>;

export function getRangeProperties(range: Range): CaveHeightThreshold {
  const width = range.high - range.low;

  return {
    low: range.low,
    high: range.high,
    midpoint: (range.low + range.high) / 2,
    width,
    halfWidth: width / 2
  };
}

const cachePool = new PartitionedTTLCache({
  max: 100,
  ttl: 30000,
  updateAgeOnGet: true,
  keySeparator: PartitionedTTLCache.DEFAULT_KEY_SEPARATOR
});

export class CaveMetadataManager {
  seed: Seed;
  spaghettiCaveMetadata: SpaghettiCaveMetadata[];
  pitCaveMetadata: PitCaveMetadata[];
  ravineCaveMetadata: RavineCaveMetadata[];
  sphereCaveMetadata: SphereCaveMetadata[];
  numCaveTypes: number;
  caveTypeToBlockId: CaveTypeBlockId[];
  caveTypePrioritization: number[];
  perChunkCache: PartitionTTLCache<CaveMetadataForChunk>;

  constructor(
    seed: Seed,
    chunkSize: number,
    blockMetadata: BlockMetadata,
    blockName: BlockName
  ) {
    this.seed = seed;
    this.perChunkCache = cachePool.partitionTTLCache();

    let nextCaveType = 0;

    const caveTypeToBlockId: CaveTypeBlockId[] = [];
    const caveTypePriority: number[] = [];

    {
      const { spaghettiCaveMetadata, nextCaveType: updatedNextCaveType }
        = function (
          seed: Seed,
          startCaveType: number
        ) {
          const baseSpaghettiParams = {
            caveEdgeNoiseParams: [{ amplitude: 1, frequency: 1 / 210 }],
            caveHeightNoiseParams: [
              { amplitude: 1.5, frequency: 1 / 300 },
              { amplitude: 0.5, frequency: 1 / 150 },
              { amplitude: 0.3, frequency: 1 / 90 },
              { amplitude: 0.03, frequency: 0.1 }
            ],
            caveHeightNoiseThresholdParams: { low: -0.1, high: 0.1 },
            caveXZPerturbNoiseParams: [
              { amplitude: 2, frequency: 1 / 18 },
              { amplitude: 4, frequency: 1 / 40 }
            ],
            caveYPerturbNoiseParams: [
              { amplitude: 25, frequency: 1 / 330 },
              { amplitude: 12, frequency: 1 / 240 }
            ],
            caveHeightMax: 9,
            caveHeightPercentageUpperBound: 0.5
          };

          const spaghettiTypeConfigs = [
            ...[
              { caveCentreYMin: -15, count: 1 },
              { caveCentreYMin: -35, count: 1 },
              { caveCentreYMin: -55, count: 2 },
              { caveCentreYMin: -75, count: 1 },
              { caveCentreYMin: -99, count: 1 }
            ].map((override) => ({ ...baseSpaghettiParams, ...override })),

            {
              count: 2,
              caveEdgeNoiseParams: [{ amplitude: 1, frequency: 1 / 210 }],
              caveHeightNoiseParams: [
                { amplitude: 1.5, frequency: 1 / 300 },
                { amplitude: 0.5, frequency: 1 / 150 },
                { amplitude: 0.3, frequency: 1 / 90 },
                { amplitude: 0.03, frequency: 0.1 }
              ],
              caveHeightNoiseThresholdParams: { low: -0.1, high: 0.1 },
              caveXZPerturbNoiseParams: [
                { amplitude: 2, frequency: 1 / 18 },
                { amplitude: 4, frequency: 1 / 40 }
              ],
              caveYPerturbNoiseParams: [
                { amplitude: 18, frequency: 1 / 210 },
                { amplitude: 6, frequency: 1 / 160 }
              ],
              caveHeightMax: 9,
              caveHeightPercentageUpperBound: 0.5,
              caveCentreYMin: -98
            },
            {
              count: 2,
              caveEdgeNoiseParams: [{ amplitude: 1, frequency: 1 / 310 }],
              caveHeightNoiseParams: [
                { amplitude: 0.3, frequency: 1 / 90 },
                { amplitude: 0.03, frequency: 0.1 }
              ],
              caveHeightNoiseThresholdParams: { low: -0.06, high: 0.06 },
              caveXZPerturbNoiseParams: [{ amplitude: 2, frequency: 1 / 30 }],
              caveYPerturbNoiseParams: [
                { amplitude: 40, frequency: 1 / 300 },
                { amplitude: 15, frequency: 1 / 210 }
              ],
              caveHeightMax: 12,
              caveHeightPercentageUpperBound: 0.5,
              caveCentreYMin: -98
            }
          ];

          const spaghettiCaveMetadataList = [];
          for (let configIndex = 0; configIndex < spaghettiTypeConfigs.length; configIndex++) {
            const config = spaghettiTypeConfigs[configIndex]!;
            let totalYPerturbAmplitude = 0;
            for (const noiseParam of config.caveYPerturbNoiseParams) {
              totalYPerturbAmplitude += noiseParam.amplitude;
            }
            for (let i = 0; i < config.count; i++) {
              spaghettiCaveMetadataList.push({
                caveType: startCaveType++,
                caveEdgeNoiseGenerator: new SimpleOctavesNoise(config.caveEdgeNoiseParams, `${seed}CaveCutoff${configIndex}${i}`),
                caveHeightNoiseGenerator: new ThresholdOctaveNoise(config.caveHeightNoiseParams, config.caveHeightNoiseThresholdParams, `${seed}Cave${configIndex}${i}`),
                caveHeightThreshold: getRangeProperties(config.caveHeightNoiseThresholdParams),
                caveHeightMax: config.caveHeightMax,
                caveHeightPercentageUpperBound: config.caveHeightPercentageUpperBound,
                caveXZPerturbNoiseGenerator: new SimpleOctavesNoise(config.caveXZPerturbNoiseParams, `${seed}CaveHeightPerturb${configIndex}${i}`),
                caveYPerturbNoiseGenerator: new SimpleOctavesNoise(config.caveYPerturbNoiseParams, `${seed}CaveHeightNoise${configIndex}${i}`),
                caveCentreY: config.caveCentreYMin + totalYPerturbAmplitude
              });
            }
          }

          return {
            spaghettiCaveMetadata: spaghettiCaveMetadataList,
            nextCaveType: startCaveType
          };
        }(seed, nextCaveType);

      this.spaghettiCaveMetadata = spaghettiCaveMetadata;
      nextCaveType = updatedNextCaveType;
    }

    {
      const { pitCaveMetadata, nextCaveType: updatedNextCaveType }
        = function (
          seed: Seed,
          chunkSize: number,
          blockMetadata: BlockMetadata,
          blockName: BlockName,
          startCaveType: number,
          caveTypeToBlockId: CaveTypeBlockId[],
          caveTypePriority: number[]
        ) {
          const pitTypeConfigs = [
            {
              count: 1,
              pitXZPerturbNoiseParams: [
                { amplitude: 1, frequency: 1 / 8 },
                { amplitude: 3, frequency: 0.05 },
                { amplitude: 10, frequency: 0.01 },
                { amplitude: 29, frequency: 0.002 }
              ],
              pitFloorYPerturbNoiseParams: [
                { amplitude: 1, frequency: 0.1 },
                { amplitude: 3, frequency: 0.02 }
              ],
              pitHeightPerturbNoiseParams: [
                { amplitude: 3, frequency: 0.1 },
                { amplitude: 10, frequency: 0.02 }
              ],
              pitMidpointNoiseParams: [
                { amplitude: 1, frequency: 1 / 3 },
                { amplitude: 2, frequency: 1 / 7 },
                { amplitude: 2, frequency: 1 / 15 }
              ],
              pitMinWidth: 15,
              pitMaxWidth: 40,
              pitMinFloorY: -99,
              pitMaxFloorY: -25,
              pitMinHeight: 25,
              pitMaxHeight: 45,
              fillBlockId: 0,
              wallBlockIds: null,
              ceilingParams: null,
              numChunksBetweenPits: 5
            },
            {
              count: 1,
              priority: -1,
              pitXZPerturbNoiseParams: [{ amplitude: 10, frequency: 0.01 }],
              pitFloorYPerturbNoiseParams: [
                { amplitude: 1, frequency: 0.1 },
                { amplitude: 3, frequency: 0.02 }
              ],
              pitHeightPerturbNoiseParams: null,
              pitMidpointNoiseParams: [
                { amplitude: 1, frequency: 1 / 3 },
                { amplitude: 2, frequency: 1 / 7 },
                { amplitude: 2, frequency: 1 / 15 }
              ],
              pitMinWidth: 10,
              pitMaxWidth: 15,
              pitMinFloorY: -99,
              pitMaxFloorY: -10,
              pitMinHeight: 7,
              pitMaxHeight: 15,
              fillBlockId: getBlockId(blockName, blockMetadata),
              wallBlockIds: new WeightedDistribution([
                { value: blockMetadata.Stone.id, weight: 3 },
                { value: blockMetadata["Compressed Messy Stone"].id, weight: 5 },
                { value: blockMetadata.Magma.id, weight: 1 }
              ]),
              ceilingParams: { blockIds: 0, minThickness: 2, maxThickness: 5 },
              numChunksBetweenPits: 2
            }
          ];

          const pitCaveMetadataList: PitCaveMetadata[] = [];
          for (const pitConfig of pitTypeConfigs) {
            let totalXZPerturbAmplitude = 0;
            for (const noiseParam of pitConfig.pitXZPerturbNoiseParams) {
              totalXZPerturbAmplitude += noiseParam.amplitude;
            }

            for (let j = 0; j < pitConfig.count; j++) {
              const pitIndex = pitCaveMetadataList.length;
              const pitXZPerturbNoiseGenerator = new SimpleOctavesNoise(pitConfig.pitXZPerturbNoiseParams, `${seed}DistPitPerturb${pitIndex}`);
              const pitGenId = `${seed}PitGen${pitIndex}`;
              const pitSpacingGenerator = new PointsGenerator("cavePit", pitConfig.numChunksBetweenPits, true, false, pitGenId, 100, chunkSize);
              const pitPointGenerator = new FeaturePointGenerator(chunkSize, pitSpacingGenerator, pitConfig.pitMaxWidth + totalXZPerturbAmplitude * 2, pitGenId);

              console.assert(
                pitPointGenerator.chunkSearchRadius <= pitConfig.numChunksBetweenPits / 2,
                `Cannot have overlapping cave features (pits), ${pitPointGenerator.chunkSearchRadius} ${pitConfig.numChunksBetweenPits / 2}`
              );

              const pitWidthLengthDistribution = new RandomIntRange(pitConfig.pitMinWidth, pitConfig.pitMaxWidth);
              const pitFloorYDistribution = new RandomIntRange(pitConfig.pitMinFloorY, pitConfig.pitMaxFloorY);
              const pitHeightDistribution = new RandomIntRange(pitConfig.pitMinHeight, pitConfig.pitMaxHeight);
              const pitFloorYPerturbNoiseGenerator = new SimpleOctavesNoise(pitConfig.pitFloorYPerturbNoiseParams, `${seed}yPitPerturb${pitIndex}`);

              let pitHeightPerturbNoiseGenerator = null;
              if (pitConfig.pitHeightPerturbNoiseParams !== null) {
                pitHeightPerturbNoiseGenerator = new SimpleOctavesNoise(pitConfig.pitHeightPerturbNoiseParams, `${seed}heightPitPerturb${pitIndex}`);
              }

              const pitMidpointYPerturbNoiseGenerator = new SimpleOctavesNoise(pitConfig.pitMidpointNoiseParams, `${seed}edgesPitPerturb${pitIndex}`);

              const fillCaveType = startCaveType++;
              caveTypeToBlockId[fillCaveType] = pitConfig.fillBlockId;

              let wallCaveType = null;
              if (pitConfig.wallBlockIds !== null) {
                wallCaveType = startCaveType++;
                caveTypeToBlockId[wallCaveType] = pitConfig.wallBlockIds;
              }

              let ceilingCaveType = null;
              let pitCeilingThicknessDistribution = null;
              if (pitConfig.ceilingParams !== null) {
                ceilingCaveType = startCaveType++;
                pitCeilingThicknessDistribution = new RandomIntRange(pitConfig.ceilingParams.minThickness, pitConfig.ceilingParams.maxThickness);
                caveTypeToBlockId[ceilingCaveType] = pitConfig.ceilingParams.blockIds;
              }

              if (pitConfig.priority !== undefined) {
                caveTypePriority[fillCaveType] = pitConfig.priority;
                if (wallCaveType !== null) {
                  caveTypePriority[wallCaveType] = pitConfig.priority;
                }
                if (ceilingCaveType !== null) {
                  caveTypePriority[ceilingCaveType] = pitConfig.priority;
                }
              }

              pitCaveMetadataList.push({
                caveType: fillCaveType,
                wallType: wallCaveType,
                ceilingType: ceilingCaveType,
                pitCeilingThicknessDistribution,
                pitPointGenerator,
                pitXZPerturbNoiseGenerator,
                pitWidthDistribution: pitWidthLengthDistribution,
                pitLengthDistribution: pitWidthLengthDistribution,
                pitFloorYDistribution,
                pitHeightDistribution,
                pitFloorYPerturbNoiseGenerator,
                pitHeightPerturbNoiseGenerator,
                pitMidpointYPerturbNoiseGenerator
              });
            }
          }

          return {
            pitCaveMetadata: pitCaveMetadataList,
            nextCaveType: startCaveType
          };
        }(seed, chunkSize, blockMetadata, blockName, nextCaveType, caveTypeToBlockId, caveTypePriority);

      this.pitCaveMetadata = pitCaveMetadata;
      nextCaveType = updatedNextCaveType;
    }

    // ===== Ravine caves =====
    {
      const {
        ravineCaveMetadata,
        nextCaveType: updatedNextCaveType
      } = function (seed, chunkSize, startCaveType) {
        const ravineParams = {
          count: 2,
          ravineXZPerturbNoiseParams: [
            { amplitude: 1, frequency: 1 / 8 },
            { amplitude: 3, frequency: 0.05 },
            { amplitude: 10, frequency: 0.01 },
            { amplitude: 30, frequency: 0.002 }
          ],
          ravineYPerturbNoiseParams: [
            { amplitude: 1, frequency: 0.1 },
            { amplitude: 3, frequency: 0.02 }
          ],
          ravineMinWidth: 10,
          ravineMaxWidth: 15,
          ravineMinLength: 50,
          ravineMaxLength: 90,
          ravineMinFloorY: -99,
          ravineMaxFloorY: -5,
          ravineMinHeight: 25,
          ravineMaxHeight: 45,
          numChunksBetweenRavines: 7
        };

        const ravineCaveMetadataList = [];
        for (let i = 0; i < ravineParams.count; i++) {
          const config = ravineParams;
          const ravineXZPerturbNoiseGenerator = new SimpleOctavesNoise(config.ravineXZPerturbNoiseParams, `${seed}DistRavPerturb${i}`);
          let totalXZPerturbAmplitude = 0;
          for (const noiseParam of config.ravineXZPerturbNoiseParams) {
            totalXZPerturbAmplitude += noiseParam.amplitude;
          }
          const ravineYPerturbNoiseGenerator = new SimpleOctavesNoise(config.ravineYPerturbNoiseParams, `${seed}yRavinePerturb${i}`);
          const ravineGenId = `${seed}RavineGen${i}`;
          const ravineSpacingGenerator = new PointsGenerator("caveRav", config.numChunksBetweenRavines, true, false, ravineGenId, 100, chunkSize);
          const ravinePointGenerator = new FeaturePointGenerator(chunkSize, ravineSpacingGenerator, Math.max(config.ravineMaxLength, config.ravineMaxWidth) + totalXZPerturbAmplitude * 2, ravineGenId);
          console.assert(
            ravinePointGenerator.chunkSearchRadius <= config.numChunksBetweenRavines / 2,
            `Cannot have overlapping cave features (ravines), ${ravinePointGenerator.chunkSearchRadius} ${config.numChunksBetweenRavines / 2}`
          );

          const ravineWidthDistribution = new RandomIntRange(config.ravineMinWidth, config.ravineMaxWidth);
          const ravineLengthDistribution = new RandomIntRange(config.ravineMinLength, config.ravineMaxLength);
          const ravineFloorYDistribution = new RandomIntRange(config.ravineMinFloorY, config.ravineMaxFloorY, true);
          const ravineHeightDistribution = new RandomIntRange(config.ravineMinHeight, config.ravineMaxHeight);
          const ravineXZDirectionDistribution = new RandomRange(-1, 1);

          ravineCaveMetadataList.push({
            caveType: startCaveType++,
            ravinePointGenerator,
            ravineXZPerturbNoiseGenerator,
            ravineYPerturbNoiseGenerator,
            ravineWidthDistribution,
            ravineLengthDistribution,
            ravineFloorYDistribution,
            ravineHeightDistribution,
            ravineXZDirectionDistribution
          });
        }

        return {
          ravineCaveMetadata: ravineCaveMetadataList,
          nextCaveType: startCaveType
        };
      }(seed, chunkSize, nextCaveType);

      this.ravineCaveMetadata = ravineCaveMetadata;
      nextCaveType = updatedNextCaveType;
    }

    {
      const {
        sphereCaveMetadata,
        nextCaveType: updatedNextCaveType
      } = function (seed, chunkSize, startCaveType) {
        const sphereParams = {
          count: 1,
          sphereXZPerturbNoiseParams: [
            { amplitude: 1, frequency: 1 / 8 },
            { amplitude: 3, frequency: 0.05 }
          ],
          sphereMinRadius: 6,
          sphereMaxRadius: 20,
          sphereMinCentreY: -79,
          sphereMaxCentreY: 10,
          numChunksBetweenSpheres: 4
        };

        const sphereCaveMetadataList = [];
        for (let i = 0; i < sphereParams.count; i++) {
          const config = sphereParams;
          const sphereXZPerturbNoiseGenerator = new SimpleOctavesNoise(config.sphereXZPerturbNoiseParams, `${seed}DistSpherePerturb${i}`);
          let totalXZPerturbAmplitude = 0;
          for (const noiseParam of config.sphereXZPerturbNoiseParams) {
            totalXZPerturbAmplitude += noiseParam.amplitude;
          }
          const sphereGenId = `${seed}SphereGen${i}`;
          const sphereSpacingGenerator = new PointsGenerator("caveSph", config.numChunksBetweenSpheres, true, false, sphereGenId, 100, chunkSize);
          const spherePointGenerator = new FeaturePointGenerator(chunkSize, sphereSpacingGenerator, (config.sphereMaxRadius + totalXZPerturbAmplitude) * 2, sphereGenId);
          console.assert(
            spherePointGenerator.chunkSearchRadius <= config.numChunksBetweenSpheres / 2,
            `Cannot have overlapping cave features (spheres), ${spherePointGenerator.chunkSearchRadius} ${config.numChunksBetweenSpheres / 2}`
          );

          const sphereRadiusDistribution = new RandomIntRange(config.sphereMinRadius, config.sphereMaxRadius, true);
          const sphereCentreYDistribution = new RandomIntRange(config.sphereMinCentreY, config.sphereMaxCentreY);

          sphereCaveMetadataList.push({
            caveType: startCaveType,
            spherePointGenerator,
            sphereXZPerturbNoiseGenerator,
            sphereRadiusDistribution,
            sphereCentreYDistribution
          });
        }

        return {
          sphereCaveMetadata: sphereCaveMetadataList,
          nextCaveType: startCaveType
        };
      }(seed, chunkSize, nextCaveType);

      this.sphereCaveMetadata = sphereCaveMetadata;
      nextCaveType = updatedNextCaveType;
    }

    this.numCaveTypes = nextCaveType;
    for (let caveType = 0; caveType < this.numCaveTypes; caveType++) {
      if (caveTypeToBlockId[caveType] === undefined) {
        caveTypeToBlockId[caveType] = 0;
      }
      if (caveTypePriority[caveType] === undefined) {
        caveTypePriority[caveType] = 0;
      }
    }

    type CaveType = {
      caveType: number,
      priority: number
    }

    this.caveTypeToBlockId = caveTypeToBlockId;
    this.caveTypePrioritization = caveTypePriority
      .map((priority: number, caveType: number) => ({ caveType, priority }))
      .sort((a: CaveType, b: CaveType) => a.priority - b.priority)
      .map((entry: CaveType) => entry.caveType);
  }

  getOrCreateCaveGeneratorForChunk(
    chunkX: number,
    chunkZ: number,
    heightmapVals: ChunkDataCache3D
  ) {
    const caveMetadataForChunk = this.getOrBuildCaveMetadataForChunk(chunkX, chunkZ);
    return new CaveGenerator(
      heightmapVals,
      caveMetadataForChunk.spaghettiCaveMetadataForChunk,
      caveMetadataForChunk.pitCaveMetadataForChunk,
      caveMetadataForChunk.ravineCaveMetadataForChunk,
      caveMetadataForChunk.sphereCaveMetadataForChunk,
      this.numCaveTypes
    );
  }

  getOrBuildCaveMetadataForChunk(chunkX: number, chunkZ: number) {
    const cacheKey = `${chunkX}|${chunkZ}`;
    const cached = this.perChunkCache.get(cacheKey);
    if (!isNullOrUndefined(cached)) {
      return cached;
    }

    const chunkCoords: Vec2 = [multiplyByChunkSize(chunkX), multiplyByChunkSize(chunkZ)];
    const caveMetadataForChunk = {
      spaghettiCaveMetadataForChunk: this.spaghettiCaveMetadata,
      pitCaveMetadataForChunk: this.buildPitCaveMetadataForChunk(chunkCoords),
      ravineCaveMetadataForChunk: this.buildRavineCaveMetadataForChunk(chunkCoords),
      sphereCaveMetadataForChunk: this.buildSphereCaveMetadataForChunk(chunkCoords)
    };

    this.perChunkCache.set(cacheKey, caveMetadataForChunk);
    return caveMetadataForChunk;
  }

  buildPitCaveMetadataForChunk(chunkCoords: Vec2): PitCaveMetadataForChunk[] {
    const pitCaveMetadataForChunk: PitCaveMetadataForChunk[] = [];
    for (let pitTypeIndex = 0; pitTypeIndex < this.pitCaveMetadata.length; pitTypeIndex++) {
      const pitType = this.pitCaveMetadata[pitTypeIndex]!;
      const surroundingPits = pitType.pitPointGenerator.getSurroundingFeatures(chunkCoords[0], chunkCoords[1]);

      for (const pitCentre of surroundingPits) {
        var ceilingThicknessDistribution;
        const pitCentreX = pitCentre[0]!;
        const pitCentreZ = pitCentre[1]!;
        const rng = new SeededRandom(`pit${pitCentreX}|${pitCentreZ}|${pitTypeIndex}${this.seed}`);

        const halfWidth = pitType.pitWidthDistribution.sample(rng) >> 1;
        const halfLength = pitType.pitLengthDistribution.sample(rng) >> 1;
        const pitMinX = pitCentreX - halfWidth;
        const pitMaxX = pitCentreX + halfWidth;
        const pitMinZ = pitCentreZ - halfLength;
        const pitMaxZ = pitCentreZ + halfLength;
        const pitFloorY = pitType.pitFloorYDistribution.sample(rng);
        const pitHeight = pitType.pitHeightDistribution.sample(rng);
        const pitCeilingThickness =
          ((ceilingThicknessDistribution = pitType.pitCeilingThicknessDistribution) === null ||
            ceilingThicknessDistribution === undefined
            ? undefined
            : ceilingThicknessDistribution.sample(rng)) ?? 0;

        pitCaveMetadataForChunk.push({
          caveType: pitType.caveType,
          wallType: pitType.wallType,
          ceilingType: pitType.ceilingType,
          pitCeilingThickness,
          pitMinX,
          pitMaxX,
          pitMinZ,
          pitMaxZ,
          pitFloorY,
          pitHeight,
          pitXZPerturbNoiseGenerator: pitType.pitXZPerturbNoiseGenerator,
          pitFloorYPerturbNoiseGenerator: pitType.pitFloorYPerturbNoiseGenerator,
          pitHeightPerturbNoiseGenerator: pitType.pitHeightPerturbNoiseGenerator,
          pitMidpointYPerturbNoiseGenerator: pitType.pitMidpointYPerturbNoiseGenerator
        });
      }
    }
    return pitCaveMetadataForChunk;
  }

  buildRavineCaveMetadataForChunk(chunkCoords: Vec2): RavineCaveMetadataForChunk[] {
    const ravineCaveMetadataForChunk: RavineCaveMetadataForChunk[] = [];
    for (let ravineTypeIndex = 0; ravineTypeIndex < this.ravineCaveMetadata.length; ravineTypeIndex++) {
      const ravineType = this.ravineCaveMetadata[ravineTypeIndex]!;
      const surroundingRavines: Vec2[] = ravineType.ravinePointGenerator.getSurroundingFeatures(chunkCoords[0], chunkCoords[1]);

      for (const ravineCentre of surroundingRavines) {
        const ravineCentreX = ravineCentre[0];
        const ravineCentreZ = ravineCentre[1];
        const rng = new SeededRandom(`rav${ravineCentreX}|${ravineCentreZ}|${ravineTypeIndex}${this.seed}`);

        const ravineWidth = ravineType.ravineWidthDistribution.sample(rng);
        const ravineLength = ravineType.ravineLengthDistribution.sample(rng);
        const ravineFloorY = ravineType.ravineFloorYDistribution.sample(rng);
        const ravineHeight = ravineType.ravineHeightDistribution.sample(rng);

        const ravineDirection: Vec2 = [
          ravineType.ravineXZDirectionDistribution.sample(rng),
          ravineType.ravineXZDirectionDistribution.sample(rng)
        ];
        
        normalizeVector2(ravineDirection);

        ravineCaveMetadataForChunk.push({
          caveType: ravineType.caveType,
          ravineCentre,
          ravineWidth,
          ravineLength,
          ravineFloorY,
          ravineHeight,
          ravineDirection,
          ravineXZPerturbNoiseGenerator: ravineType.ravineXZPerturbNoiseGenerator,
          ravineYPerturbNoiseGenerator: ravineType.ravineYPerturbNoiseGenerator
        });
      }
    }
    return ravineCaveMetadataForChunk;
  }

  buildSphereCaveMetadataForChunk(chunkCoords: Vec2): SphereCaveMetadataForChunk[] {
    const sphereCaveMetadataForChunk: SphereCaveMetadataForChunk[] = [];
    for (let sphereTypeIndex = 0; sphereTypeIndex < this.sphereCaveMetadata.length; sphereTypeIndex++) {
      const sphereType = this.sphereCaveMetadata[sphereTypeIndex]!;
      const surroundingSpheres = sphereType.spherePointGenerator.getSurroundingFeatures(chunkCoords[0], chunkCoords[1]);

      for (const sphereCentre of surroundingSpheres) {
        const sphereCentreX = sphereCentre[0]!;
        const sphereCentreZ = sphereCentre[1]!;
        const rng = new SeededRandom(`sph${sphereCentreX}|${sphereCentreZ}|${sphereTypeIndex}${this.seed}`);

        const sphereRadius = sphereType.sphereRadiusDistribution.sample(rng);
        const sphereRadiusSquared = sphereRadius * sphereRadius;
        const sphereCentreY = sphereType.sphereCentreYDistribution.sample(rng);

        sphereCaveMetadataForChunk.push({
          caveType: sphereType.caveType,
          sphereRadiusSquared,
          sphereCentreX,
          sphereCentreY,
          sphereCentreZ,
          sphereXZPerturbNoiseGenerator: sphereType.sphereXZPerturbNoiseGenerator
        });
      }
    }
    return sphereCaveMetadataForChunk;
  }
}