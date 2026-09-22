import { Rarity } from "@/core/constants.js";
import { lootChestGenerators } from "./lootTables.js";
import { LootChestGenerator } from "./LootChestGenerator.js";
import { SeededRandom } from "@/noise/SeededRandom.js";
import { Seed } from "@/core/types.js";

export class LootChestBlockGenerator {
  lootChestBlockId: number;
  seed: Seed;
  x: number;
  y: number;
  z: number;
  chestQuality: Rarity;
  lootChestInventoryDistribution: LootChestGenerator;

  constructor(
    lootChestBlockId: number,
    seed: Seed,
    x: number,
    y: number,
    z: number,
    chestQuality: Rarity,
  ) {
    this.lootChestBlockId = lootChestBlockId;
    this.seed = seed;
    this.x = x;
    this.y = y;
    this.z = z;
    this.chestQuality = chestQuality;
    this.lootChestInventoryDistribution = lootChestGenerators[chestQuality];
  }

  getBlockId() {
    return this.lootChestBlockId;
  }

  generate() {
    const random = new SeededRandom(
      `${this.seed}|${this.x}|${this.y}|${this.z}|lootChest`,
    );

    const inventory =
      this.lootChestInventoryDistribution.sample(random);

    return {
      data: {
        persisted: {
          chestStr: JSON.stringify(inventory),
          lootQuality: this.chestQuality,
        },
      },
      persisted: true,
    };
  }
}