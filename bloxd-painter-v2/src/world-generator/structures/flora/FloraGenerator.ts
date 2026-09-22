import type { BlockId, BlockMetadata, ChunkArray, Seed } from "../../core/types.js";
import { PointsGenerator } from "../../generator/PointsGenerator.js";
import { SeededRandom } from "../../noise/SeededRandom.js";
import { manhattanDistance } from "../../utils/mathHelper.js";

type FlowerTypes = "Dandelion" | "Poppy" | "Red Tulip" | "Pink Tulip" | "White Tulip" | "Orange Tulip" | "Daisy" | "Allium" | "Shadow Rose" | "Bluebell" | "Fallen Maple Leaves" | "Fallen Cherry Leaves" | "Melon" | "Watermelon" | "Pumpkin" | "Rice|FreshlyGrown" | "Cranberries_stage2" | "Red Mushroom" | "Brown Mushroom" | "Fat Red Mushroom" | "Fat Brown Mushroom" | "Cotton_stage3" | "Chili Pepper Plant|FreshlyGrown" | "Chili Pepper Plant|Lava|FreshlyGrown" | "Forget-me-not" | "Fallen Pine Cone"

interface FlowerInfos {
  flower: FlowerTypes;
  patchChance: number;
  insidePatchSpawnChance: number;
  patchRadius: number;
}

interface CactusSettings {
  cactusChance: number, 
  maxCactusHeight: number
}

interface FlowerSettings {
  dandelionChance: number;
  poppyChance: number;
  forgetMeNotChance: number;
  redTulipChance: number;
  pinkTulipChance: number;
  whiteTulipChance: number;
  orangeTulipChance: number;
  daisyChance: number;
  alliumChance: number;
  shadowRoseChance: number;
  bluebellChance: number;
  fallenMapleLeavesChance: number;
  fallenCherryLeavesChance: number;
  melonChance: number;
  watermelonChance: number;
  pumpkinChance: number;
  riceChance: number;
  cranberryChance: number;
  redMushroomChance: number;
  brownMushroomChance: number;
  fatRedMushroomChance: number;
  fatBrownMushroomChance: number;
  cottonChance: number;
  chiliPepperChance: number;
  lavaChiliPepperChance: number;
  fallenPineConeChance: number;

  defaultFlowerInsidePatchSpawnChance: number;
  defaultFlowerPatchRadius: number;

  flowerPatchDistApart: number | null;
}
export class FloraGenerator {
  blockMetadata: BlockMetadata;
  chunkSize: number;
  seed: Seed;
  grassChance: number;
  tallGrassChance: number;
  cornChance: number;
  spectralGrassChance: number;
  pineGrassChance: number;
  pineFernChance: number;
  jungleTallGrassChance: number;
  catnipChance: number;
  autumnFernChance: number;
  cactusChance: number;
  maxCactusHeight: number;
  doFlowerGen: boolean;
  flowerInfos: FlowerInfos[];
  totalFlowerPatchChance: number;
  flowerPatchPointGen: PointsGenerator | undefined;
  maxPatchRadius: number;
  grassId: BlockId;
  tallGrassId: BlockId;
  tallGrassTopId: BlockId;
  cornSeedsId: BlockId;
  cornPlantId: BlockId;
  spectralGrassId: BlockId;
  pineGrassId: BlockId;
  pineFernId: BlockId;
  jungleTallGrassId: BlockId;
  jungleTallGrassTopId: BlockId;
  catnipId: BlockId;
  autumnFernId: BlockId;
  cactusId: BlockId;
  fatCactusId: BlockId;

  constructor(
    blockMetadata: BlockMetadata,
    chunkSize: number,
    seed: Seed,
    grassChance: number,
    tallGrassChance: number,
    cornChance: number,
    spectralGrassChance: number,
    pineGrassChance: number,
    pineFernChance: number,
    jungleTallGrassChance: number,
    catnipChance: number,
    autumnFernChance: number,
    cactusSettings: CactusSettings,
    flowerSettings: FlowerSettings
  ) {
    let { cactusChance, maxCactusHeight } = cactusSettings;

    this.blockMetadata = blockMetadata;
    this.seed = seed;
    this.grassChance = grassChance;
    this.tallGrassChance = tallGrassChance;
    this.cornChance = cornChance;
    this.spectralGrassChance = spectralGrassChance;
    this.pineGrassChance = pineGrassChance;
    this.pineFernChance = pineFernChance;
    this.jungleTallGrassChance = jungleTallGrassChance;
    this.catnipChance = catnipChance;
    this.autumnFernChance = autumnFernChance;
    this.cactusChance = cactusChance;
    this.maxCactusHeight = maxCactusHeight;
    this.chunkSize = chunkSize;

    this.flowerInfos = [
      { flower: "Dandelion", patchChance: flowerSettings.dandelionChance, insidePatchSpawnChance: flowerSettings.defaultFlowerInsidePatchSpawnChance, patchRadius: flowerSettings.defaultFlowerPatchRadius },
      { flower: "Poppy", patchChance: flowerSettings.poppyChance, insidePatchSpawnChance: flowerSettings.defaultFlowerInsidePatchSpawnChance, patchRadius: flowerSettings.defaultFlowerPatchRadius },
      { flower: "Forget-me-not", patchChance: flowerSettings.forgetMeNotChance, insidePatchSpawnChance: flowerSettings.defaultFlowerInsidePatchSpawnChance, patchRadius: flowerSettings.defaultFlowerPatchRadius },
      { flower: "Red Tulip", patchChance: flowerSettings.redTulipChance, insidePatchSpawnChance: flowerSettings.defaultFlowerInsidePatchSpawnChance, patchRadius: flowerSettings.defaultFlowerPatchRadius },
      { flower: "Pink Tulip", patchChance: flowerSettings.pinkTulipChance, insidePatchSpawnChance: flowerSettings.defaultFlowerInsidePatchSpawnChance, patchRadius: flowerSettings.defaultFlowerPatchRadius },
      { flower: "White Tulip", patchChance: flowerSettings.whiteTulipChance, insidePatchSpawnChance: flowerSettings.defaultFlowerInsidePatchSpawnChance, patchRadius: flowerSettings.defaultFlowerPatchRadius },
      { flower: "Orange Tulip", patchChance: flowerSettings.orangeTulipChance, insidePatchSpawnChance: flowerSettings.defaultFlowerInsidePatchSpawnChance, patchRadius: flowerSettings.defaultFlowerPatchRadius },
      { flower: "Daisy", patchChance: flowerSettings.daisyChance, insidePatchSpawnChance: flowerSettings.defaultFlowerInsidePatchSpawnChance, patchRadius: flowerSettings.defaultFlowerPatchRadius },
      { flower: "Allium", patchChance: flowerSettings.alliumChance, insidePatchSpawnChance: flowerSettings.defaultFlowerInsidePatchSpawnChance, patchRadius: flowerSettings.defaultFlowerPatchRadius },
      { flower: "Shadow Rose", patchChance: flowerSettings.shadowRoseChance, insidePatchSpawnChance: flowerSettings.defaultFlowerInsidePatchSpawnChance, patchRadius: flowerSettings.defaultFlowerPatchRadius },
      { flower: "Bluebell", patchChance: flowerSettings.bluebellChance, insidePatchSpawnChance: 0.85, patchRadius: 8 },
      { flower: "Fallen Maple Leaves", patchChance: flowerSettings.fallenMapleLeavesChance, insidePatchSpawnChance: 0.5, patchRadius: 2 },
      { flower: "Fallen Cherry Leaves", patchChance: flowerSettings.fallenCherryLeavesChance, insidePatchSpawnChance: 0.5, patchRadius: 2 },
      { flower: "Melon", patchChance: flowerSettings.melonChance, insidePatchSpawnChance: 0.5, patchRadius: 2 },
      { flower: "Watermelon", patchChance: flowerSettings.watermelonChance, insidePatchSpawnChance: 0.5, patchRadius: 2 },
      { flower: "Pumpkin", patchChance: flowerSettings.pumpkinChance, insidePatchSpawnChance: 0.5, patchRadius: 2 },
      { flower: "Rice|FreshlyGrown", patchChance: flowerSettings.riceChance, insidePatchSpawnChance: 0.5, patchRadius: 2 },
      { flower: "Cranberries_stage2", patchChance: flowerSettings.cranberryChance, insidePatchSpawnChance: 0.5, patchRadius: 2 },
      { flower: "Red Mushroom", patchChance: flowerSettings.redMushroomChance, insidePatchSpawnChance: 0.5, patchRadius: 2 },
      { flower: "Brown Mushroom", patchChance: flowerSettings.brownMushroomChance, insidePatchSpawnChance: 0.5, patchRadius: 2 },
      { flower: "Fat Red Mushroom", patchChance: flowerSettings.fatRedMushroomChance, insidePatchSpawnChance: 0.5, patchRadius: 2 },
      { flower: "Fat Brown Mushroom", patchChance: flowerSettings.fatBrownMushroomChance, insidePatchSpawnChance: 0.5, patchRadius: 2 },
      { flower: "Cotton_stage3", patchChance: flowerSettings.cottonChance, insidePatchSpawnChance: 0.5, patchRadius: 3 },
      { flower: "Chili Pepper Plant|FreshlyGrown", patchChance: flowerSettings.chiliPepperChance, insidePatchSpawnChance: 0.2, patchRadius: 5 },
      { flower: "Chili Pepper Plant|Lava|FreshlyGrown", patchChance: flowerSettings.lavaChiliPepperChance, insidePatchSpawnChance: 0.2, patchRadius: 5 },
      { flower: "Fallen Pine Cone", patchChance: flowerSettings.fallenPineConeChance, insidePatchSpawnChance: 0.4, patchRadius: 3 }
    ];

    this.maxPatchRadius = 0;
    for (const { patchRadius } of this.flowerInfos) {
      this.maxPatchRadius = Math.max(this.maxPatchRadius, patchRadius);
    }

    this.totalFlowerPatchChance = 0;
    for (const { patchChance } of this.flowerInfos) {
      this.totalFlowerPatchChance += patchChance;
    }

    this.doFlowerGen = flowerSettings.flowerPatchDistApart !== null;

    if (this.doFlowerGen) {
      this.flowerPatchPointGen = new PointsGenerator("flwrPtch", flowerSettings.flowerPatchDistApart!, false, true, seed, 4, chunkSize);
    }

    this.grassId = blockMetadata.Grass.id;
    this.tallGrassId = blockMetadata["Tall Grass"].id;
    this.tallGrassTopId = blockMetadata["Tall Grass|Top"].id;
    this.cornSeedsId = blockMetadata["Corn Seeds|FreshlyGrown"].id;
    this.cornPlantId = blockMetadata["Corn Plant|FreshlyGrown"].id;
    this.spectralGrassId = blockMetadata["Spectral Grass"].id;
    this.pineGrassId = blockMetadata["Pine Grass"].id;
    this.pineFernId = blockMetadata["Pine Fern"].id;
    this.jungleTallGrassId = blockMetadata["Jungle Tall Grass"].id;
    this.jungleTallGrassTopId = blockMetadata["Jungle Tall Grass|Top"].id;
    this.catnipId = blockMetadata.Catnip.id;
    this.autumnFernId = blockMetadata["Autumn Fern"].id;
    this.cactusId = blockMetadata.Cactus.id;
    this.fatCactusId = blockMetadata["Fat Cactus"].id;
  }

  addBiomeFloraToColumn(
    chunkArray: ChunkArray, 
    chunkStartX: number, 
    chunkStartZ: number, 
    worldX: number, 
    chunkStartY: number, 
    worldZ: number, 
    groundHeight: number
  ) {
    if (groundHeight + 3 >= chunkStartY && groundHeight + 1 < chunkStartY + this.chunkSize) {
      const floraRng = new SeededRandom(`${worldX}${worldZ}${this.seed}flora`);
      const roll = floraRng.next();

      if (roll < this.grassChance) {
        const localY = groundHeight + 1 - chunkStartY;
        if (localY >= 0 && localY < this.chunkSize) {
          chunkArray.set(worldX - chunkStartX, localY, worldZ - chunkStartZ, this.grassId);
        }
      } else {
        if (roll < this.grassChance + this.tallGrassChance) {
          {
            const localY = groundHeight + 1 - chunkStartY;
            if (localY >= 0 && localY < this.chunkSize) {
              chunkArray.set(worldX - chunkStartX, localY, worldZ - chunkStartZ, this.tallGrassId);
            }
          }
          {
            const localY = groundHeight + 2 - chunkStartY;
            if (localY >= 0 && localY < this.chunkSize) {
              chunkArray.set(worldX - chunkStartX, localY, worldZ - chunkStartZ, this.tallGrassTopId);
            }
          }
          return;
        }
        if (roll < this.grassChance + this.tallGrassChance + this.cornChance) {
          {
            const localY = groundHeight + 1 - chunkStartY;
            if (localY >= 0 && localY < this.chunkSize) {
              chunkArray.set(worldX - chunkStartX, localY, worldZ - chunkStartZ, this.cornSeedsId);
            }
          }
          {
            const localY = groundHeight + 2 - chunkStartY;
            if (localY >= 0 && localY < this.chunkSize) {
              chunkArray.set(worldX - chunkStartX, localY, worldZ - chunkStartZ, this.cornPlantId);
            }
          }
          {
            const localY = groundHeight + 3 - chunkStartY;
            if (localY >= 0 && localY < this.chunkSize) {
              chunkArray.set(worldX - chunkStartX, localY, worldZ - chunkStartZ, this.cornPlantId);
            }
          }
          return;
        }
        if (roll < this.grassChance + this.tallGrassChance + this.cornChance + this.spectralGrassChance) {
          const localY = groundHeight + 1 - chunkStartY;
          if (localY >= 0 && localY < this.chunkSize) {
            chunkArray.set(worldX - chunkStartX, localY, worldZ - chunkStartZ, this.spectralGrassId);
          }
        } else if (roll < this.grassChance + this.tallGrassChance + this.cornChance + this.spectralGrassChance + this.pineGrassChance) {
          const localY = groundHeight + 1 - chunkStartY;
          if (localY >= 0 && localY < this.chunkSize) {
            chunkArray.set(worldX - chunkStartX, localY, worldZ - chunkStartZ, this.pineGrassId);
          }
        } else if (roll < this.grassChance + this.tallGrassChance + this.cornChance + this.spectralGrassChance + this.pineGrassChance + this.pineFernChance) {
          const localY = groundHeight + 1 - chunkStartY;
          if (localY >= 0 && localY < this.chunkSize) {
            chunkArray.set(worldX - chunkStartX, localY, worldZ - chunkStartZ, this.pineFernId);
          }
        } else {
          if (roll < this.grassChance + this.tallGrassChance + this.cornChance + this.spectralGrassChance + this.pineGrassChance + this.pineFernChance + this.jungleTallGrassChance) {
            {
              const localY = groundHeight + 1 - chunkStartY;
              if (localY >= 0 && localY < this.chunkSize) {
                chunkArray.set(worldX - chunkStartX, localY, worldZ - chunkStartZ, this.jungleTallGrassId);
              }
            }
            {
              const localY = groundHeight + 2 - chunkStartY;
              if (localY >= 0 && localY < this.chunkSize) {
                chunkArray.set(worldX - chunkStartX, localY, worldZ - chunkStartZ, this.jungleTallGrassTopId);
              }
            }
            return;
          }
          if (roll < this.grassChance + this.tallGrassChance + this.cornChance + this.spectralGrassChance + this.pineGrassChance + this.pineFernChance + this.jungleTallGrassChance + this.catnipChance) {
            const localY = groundHeight + 1 - chunkStartY;
            if (localY >= 0 && localY < this.chunkSize) {
              chunkArray.set(worldX - chunkStartX, localY, worldZ - chunkStartZ, this.catnipId);
            }
          } else if (roll < this.grassChance + this.tallGrassChance + this.cornChance + this.spectralGrassChance + this.pineGrassChance + this.pineFernChance + this.jungleTallGrassChance + this.catnipChance + this.autumnFernChance) {
            const localY = groundHeight + 1 - chunkStartY;
            if (localY >= 0 && localY < this.chunkSize) {
              chunkArray.set(worldX - chunkStartX, localY, worldZ - chunkStartZ, this.autumnFernId);
            }
          }
        }
      }

      if (this.doFlowerGen && this.totalFlowerPatchChance > 0 && groundHeight + 1 >= chunkStartY) {
        const patchCentre = this.flowerPatchPointGen!.getClosestPoint(worldX, worldZ);
        const distToPatchCentre = manhattanDistance(patchCentre, worldX, worldZ);

        if (distToPatchCentre < this.maxPatchRadius) {
          const patchRng = new SeededRandom(`${patchCentre[0]}${patchCentre[1]}${this.seed}flowerpatch`);
          const patchRoll = Math.floor(patchRng.next() * this.totalFlowerPatchChance);
          let cumulativeChance = 0;
          let flowerIndex = 0;

          while (cumulativeChance <= patchRoll) {
            cumulativeChance += this.flowerInfos[flowerIndex]!.patchChance;
            flowerIndex++;
          }

          const chosenFlower = this.flowerInfos[flowerIndex - 1]!;
          if (distToPatchCentre < chosenFlower.patchRadius && floraRng.next() < chosenFlower.insidePatchSpawnChance) {
            const flowerName = chosenFlower.flower;
            chunkArray.set(worldX - chunkStartX, groundHeight + 1 - chunkStartY, worldZ - chunkStartZ, this.blockMetadata[flowerName].id);
          }
        }
      }
    }

    if (this.cactusChance !== 0) {
      const cactusRng = new SeededRandom(`${worldX}${worldZ}${this.seed}cactus`);
      const roll = cactusRng.next();

      if (roll < this.cactusChance) {
        const cactusHeight = Math.floor(cactusRng.next() * (this.maxCactusHeight - 1)) + 1;
        const maxY = Math.min(groundHeight + cactusHeight + 1, chunkStartY + this.chunkSize);
        const isFatCactus = roll < this.cactusChance * (2 / 3);

        for (let worldY = Math.max(groundHeight + 1, chunkStartY); worldY < maxY; worldY++) {
          chunkArray.set(worldX - chunkStartX, worldY - chunkStartY, worldZ - chunkStartZ, isFatCactus ? this.fatCactusId : this.cactusId);
        }
      }
    }
  }
}