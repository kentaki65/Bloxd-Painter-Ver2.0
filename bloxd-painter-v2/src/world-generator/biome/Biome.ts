import { BiomeRegion, CaveLayer, FeatureHeight, TreeType } from "../core/constants.js";
import type { BiomeConstructorOptions, BlockMetadata, Prefab, PrefabFrequency, Seed } from "../core/types.js";
import { WeightedDistribution } from "../random/WeightedDistribution.js";
import { FloraGenerator } from "../structures/flora/FloraGenerator.js";
import { OreGenerator } from "../structures/ore/oreGenerator.js";
import { createPrefabFrequencySettings } from "./biomeUtils.js";
import { dungeonPrefabFrequencies } from "../structures/prefab/prefabDatas/prefabFrequencies.js";
import { prefabDefinitions } from "../structures/prefab/prefabDatas/prefabDefinitions.js";
import { SimpleOctavesNoise } from "../noise/SimpleOctaveNoise.js";
import { WorldGenerator } from "../generator/WorldGenerator.js";
import { SeededRandom } from "../noise/SeededRandom.js";

interface PrefabFrequencyParams {
  prefabFrequencies: PrefabFrequency[];
  noPrefabFrequency: number;
}

interface PrefabDensitySetting {
  density: number;
  frequencyParams: PrefabFrequencyParams;
}

interface PrefabDataEntry {
  density: number;
  distribution: WeightedDistribution<Prefab | null>; // sI (weighted distribution) のインスタンス
}

interface TreeChanceEntry {
  treeType: TreeType;
  chance: number;
}

export class Biome {
  minDistanceFromOrigin: number = 0;
  offsettedHeight: number = -5;
  topsoilBlockType!: number;
  lowsoilBlockType!: number;
  topwaterBlockType!: number;
  blockMetadata!: BlockMetadata;
  chunkSize!: number;
  treeMinDist: number | null = 5;
  _heightmapSimplex!: SimpleOctavesNoise;
  worldGenerator!: WorldGenerator;
  oreGenerator!: OreGenerator;
  floraGenerator!: FloraGenerator;

  maxCactusHeight: number = 4;
  grassChance: number = 0.0225;
  tallGrassChance: number = 0.0025;
  cornChance: number = 0;
  spectralGrassChance: number = 0;
  pineGrassChance: number = 0;
  pineFernChance: number = 0;
  jungleTallGrassChance: number = 0;
  catnipChance: number = 0;
  autumnFernChance: number = 0;
  maxFloraHeight: number = this.maxCactusHeight;
  flowerPatchDistApart: number | null = 35;
  defaultFlowerInsidePatchSpawnChance: number = 0.5;
  defaultFlowerPatchRadius: number = 3;
  poppyChance: number = 100;
  daisyChance: number = 100;
  pinkTulipChance: number = 100;
  cactusChance: number = 0;
  forgetMeNotChance: number = 0;
  whiteTulipChance: number = 0;
  orangeTulipChance: number = 0;
  redTulipChance: number = 0;
  dandelionChance: number = 0;
  bluebellChance: number = 0;
  alliumChance: number = 0;
  fallenMapleLeavesChance: number = 0;
  fallenCherryLeavesChance: number = 0;
  melonChance: number = 0;
  watermelonChance: number = 0;
  pumpkinChance: number = 0;
  riceChance: number = 0;
  cranberryChance: number = 0;
  redMushroomChance: number = 0;
  brownMushroomChance: number = 0;
  fatRedMushroomChance: number = 0;
  fatBrownMushroomChance: number = 0;
  cottonChance: number = 0;
  chiliPepperChance: number = 0;
  lavaChiliPepperChance: number = 0;
  shadowRoseChance: number = 0;
  fallenPineConeChance: number = 0;

  mapleTreeChance: number = 1;
  pineTreeChance: number = 0;
  plumTreeChance: number = 0;
  cedarTreeChance: number = 0;
  aspenTreeChance: number = 0;
  jungleTreeChance: number = 0;
  palmTreeChance: number = 0;
  autumnMapleTreeChance: number = 0;
  pearTreeChance: number = 0;
  cherryTreeChance: number = 0;
  spectralTreeChance: number = 0;
  mangoTreeChance: number = 0;
  autumnAspenTreeChance: number = 0;

  seed: Seed;
  tags: BiomeRegion[] = [];
  totalTreeChance!: number;
  treeChances!: TreeChanceEntry[];
  prefabDataPerType!: Record<number, PrefabDataEntry | null>;

  constructor(
    chunkSize: number,
    blockMetadata: BlockMetadata,
    worldGenerator: WorldGenerator,
    seed: Seed,
    options: BiomeConstructorOptions,
    surfacePrefabDensitySetting: PrefabDensitySetting | null = null
  ) {
    const { oreGenerator } = options;

    this.chunkSize = chunkSize;
    this.blockMetadata = blockMetadata;
    this.seed = seed;
    this.topsoilBlockType = blockMetadata["Grass Block"].id;
    this.lowsoilBlockType = blockMetadata.Dirt.id;
    this.topwaterBlockType = blockMetadata.Water.id;
    this.worldGenerator = worldGenerator;
    this.oreGenerator = oreGenerator;

    const maxPrefabRadius = Math.ceil(worldGenerator.prefabSize / 2);

    const densitySettingByPrefabPlacementType: Record<number, PrefabDensitySetting | null> = {
      [CaveLayer.SURFACE]: surfacePrefabDensitySetting,
      [CaveLayer.UNDERGROUND]: createPrefabFrequencySettings(FeatureHeight.MEDIUM, dungeonPrefabFrequencies)
    };

    this.prefabDataPerType = Object.fromEntries(
      Object.values(CaveLayer)
        .filter((value): value is number => Number.isInteger(value))
        .map((value) => Number(value))
        .map((placementType) => {
          const densitySetting = densitySettingByPrefabPlacementType[placementType];

          if (!densitySetting || densitySetting.frequencyParams.prefabFrequencies.length === 0) {
            return [placementType, null];
          }

          const { density, frequencyParams } = densitySetting;

          return [
            placementType,
            {
              density,
              distribution: new WeightedDistribution([
                ...(frequencyParams.noPrefabFrequency > 0
                  ? [{ weight: frequencyParams.noPrefabFrequency, value: null }]
                  : []),
                ...frequencyParams.prefabFrequencies.map((entry) => {
                  const { prefabName, frequency } = entry;
                  const prefab = prefabDefinitions[prefabName];
                  const clearingRadius = Math.floor(Math.sqrt(prefab.clearingRadiusSquared));

                  if (clearingRadius > maxPrefabRadius) {
                    throw new Error(
                      `Prefab ${prefabName} has clearing radius ${clearingRadius} which is greater than the world generator's prefab radius ${maxPrefabRadius}`
                    );
                  }
                  if (prefab.groundingRadius > worldGenerator.maxPrefabGroundingRadius) {
                    throw new Error(
                      `Prefab ${prefabName} has grounding radius ${prefab.groundingRadius} which is greater than the world generator's max prefab grounding radius of ${worldGenerator.maxPrefabGroundingRadius}`
                    );
                  }
                  if (prefab.groundingPoints !== "centre" && prefab.groundingPoints.length === 0) {
                    throw new Error(`Prefab ${prefabName} has no grounding points`);
                  }

                  const dimensions = prefab.schematic.dimensions;
                  if (
                    dimensions.x > worldGenerator.prefabSize ||
                    dimensions.y > worldGenerator.prefabSize ||
                    dimensions.z > worldGenerator.prefabSize
                  ) {
                    throw new Error(
                      `Prefab ${prefabName} has dimensions ${JSON.stringify(dimensions)} which are too large for the world generator's prefab size of ${worldGenerator.prefabSize}`
                    );
                  }

                  return {
                    weight: frequency,
                    value: {
                      ...prefab,
                      dimensionX: dimensions.x,
                      dimensionY: dimensions.y,
                      dimensionZ: dimensions.z
                    }
                  };
                })
              ])
            }
          ];
        })
    );
  }

  init(): void {
    this.floraGenerator = new FloraGenerator(
      this.blockMetadata,
      this.chunkSize,
      `${this.seed}flora`,
      this.grassChance,
      this.tallGrassChance,
      this.cornChance,
      this.spectralGrassChance,
      this.pineGrassChance,
      this.pineFernChance,
      this.jungleTallGrassChance,
      this.catnipChance,
      this.autumnFernChance,
      {
        cactusChance: this.cactusChance,
        maxCactusHeight: this.maxCactusHeight
      },
      {
        flowerPatchDistApart: this.flowerPatchDistApart,
        defaultFlowerInsidePatchSpawnChance: this.defaultFlowerInsidePatchSpawnChance,
        defaultFlowerPatchRadius: this.defaultFlowerPatchRadius,
        dandelionChance: this.dandelionChance,
        poppyChance: this.poppyChance,
        forgetMeNotChance: this.forgetMeNotChance,
        redTulipChance: this.redTulipChance,
        pinkTulipChance: this.pinkTulipChance,
        whiteTulipChance: this.whiteTulipChance,
        orangeTulipChance: this.orangeTulipChance,
        daisyChance: this.daisyChance,
        bluebellChance: this.bluebellChance,
        alliumChance: this.alliumChance,
        shadowRoseChance: this.shadowRoseChance,
        fallenMapleLeavesChance: this.fallenMapleLeavesChance,
        fallenCherryLeavesChance: this.fallenCherryLeavesChance,
        melonChance: this.melonChance,
        watermelonChance: this.watermelonChance,
        pumpkinChance: this.pumpkinChance,
        riceChance: this.riceChance,
        cranberryChance: this.cranberryChance,
        redMushroomChance: this.redMushroomChance,
        brownMushroomChance: this.brownMushroomChance,
        fatRedMushroomChance: this.fatRedMushroomChance,
        fatBrownMushroomChance: this.fatBrownMushroomChance,
        cottonChance: this.cottonChance,
        chiliPepperChance: this.chiliPepperChance,
        lavaChiliPepperChance: this.lavaChiliPepperChance,
        fallenPineConeChance: this.fallenPineConeChance
      }
    );

    this.treeChances = [
      { treeType: TreeType.Maple, chance: this.mapleTreeChance },
      { treeType: TreeType.Pine, chance: this.pineTreeChance },
      { treeType: TreeType.Plum, chance: this.plumTreeChance },
      { treeType: TreeType.Cedar, chance: this.cedarTreeChance },
      { treeType: TreeType.Aspen, chance: this.aspenTreeChance },
      { treeType: TreeType.Jungle, chance: this.jungleTreeChance },
      { treeType: TreeType.Palm, chance: this.palmTreeChance },
      { treeType: TreeType.AutumnMaple, chance: this.autumnMapleTreeChance },
      { treeType: TreeType.Pear, chance: this.pearTreeChance },
      { treeType: TreeType.Cherry, chance: this.cherryTreeChance },
      { treeType: TreeType.Spectral, chance: this.spectralTreeChance },
      { treeType: TreeType.Mango, chance: this.mangoTreeChance },
      { treeType: TreeType.AutumnAspen, chance: this.autumnAspenTreeChance }
    ];

    this.totalTreeChance = 0;
    for (const { chance } of this.treeChances) {
      this.totalTreeChance += chance;
    }
  }

  xzId(x: number, z: number): string {
    return `${x}|${z}`;
  }

  getHeightmapVal(x: number, z: number): number {
    return this.offsettedHeight + this._heightmapSimplex.getOctaves(x, z);
  }

  getTopsoilBlock(_worldX: number, _groundHeight: number, _worldZ: number): number {
    return this.topsoilBlockType;
  }

  getLowsoilBlockType(_worldX: number, _y: number, _worldZ: number, _groundHeight: number): number {
    return this.lowsoilBlockType;
  }

  getTotalTreeChance(): number {
    return this.totalTreeChance;
  }

  getRandomPrefab(rng: SeededRandom, placementType: number, density: number) {
    const entry = this.prefabDataPerType?.[placementType];
    if (entry === undefined || entry === null || entry.density !== density) {
      return null;
    }
    return entry.distribution.sample(rng);
  }
}