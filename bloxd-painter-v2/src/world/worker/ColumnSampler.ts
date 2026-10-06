// 1点(x, z)ずつ「地面の高さ・水面・バイオームID」を求める試作。
// WorldGenerator と同じ階層(generator/)に置く想定。import パスは環境に合わせて直してください。

import type { WorldGenerator } from "../../world-generator";
import type { BiomeGenerateResult } from "../../world-generator/biome/BiomeSelector";
import { HeightField } from "../../world-generator/core/constants";
import { HeightmapGenerator } from "../../world-generator/generator/HeightmapGenerator";

type HeightGenArgs = ConstructorParameters<typeof HeightmapGenerator>;
type HeightStore = Parameters<HeightmapGenerator["generateAndSet"]>[2];

export interface ColumnSample {
  ground: number;  // 地面の高さ(水の下では水底)
  water: number;   // 水面の高さ。水がなければ NO_WATER_VALUE
  biomeId: number; // 表示用のバイオームID(biomeEntries の添字)
}

class ColumnStore {
  ground = 0;
  water = 0;
  set(_x: number, _z: number, field: HeightField, value: number): void {
    if (field === HeightField.GroundHeight) this.ground = value;
    else if (field === HeightField.WaterHeight) this.water = value;
  }
}

export class ColumnSampler {
  private current: BiomeGenerateResult[] = [];
  private store = new ColumnStore();
  private heightGen: HeightmapGenerator;
  private gen: WorldGenerator;

  constructor(gen: WorldGenerator) {
    this.gen = gen;

    // ChunkGeneratorCache の代わり。直前に求めた generate(x, z) の結果をそのまま返す。
    const biomeSource = { getOrGenerate: () => this.current };

    this.heightGen = new HeightmapGenerator(
      biomeSource as unknown as HeightGenArgs[0],
      null as unknown as HeightGenArgs[1], // 固定プレハブなし
      gen.noWaterHeightmapGenerator,
      gen.heightmapPerturb,
      gen.waterBodyGenerator,
      gen.heightOverrideLayer
    );
  }

  sample(x: number, z: number, out: ColumnSample): void {
    this.current = this.gen.biomeSelector.generate(x, z);
    this.heightGen.generateAndSet(x, z, this.store as unknown as HeightStore);
    out.ground = this.store.ground;
    out.water = this.store.water;
    out.biomeId = this.current[0]!.biomeId;
  }
}