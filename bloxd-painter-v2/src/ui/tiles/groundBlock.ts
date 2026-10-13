// groundBlock.ts
// import は ColumnSampler.ts などと同じ場所から取ってください
import { OUT_OF_RUNGE_NUMBER } from "../../core/TileProtocol";
import type { WorldGenerator } from "../../world-generator";
import { SeededRandom } from "../../world-generator/noise/SeededRandom";
import { squaredDistanceToPoint } from "../../world-generator/utils/mathHelper";

// 川床の点が同じ間は、粘土か白亜かの抽選をやり直さない
let memoGen: WorldGenerator | null = null;
let memoPx = NaN;
let memoPz = NaN;
let memoBlock = 0;

// y = groundHeight にあるブロックのIDを返す
export function getGroundBlockId(
  gen: WorldGenerator,
  biomeId: number,
  x: number,
  z: number,
  ground: number,
  water: number,
): number {
  const biome = gen.biomeSelector.getBiomeFromId(biomeId);

  // 水なし: 表土
  if (water === OUT_OF_RUNGE_NUMBER.NO_WATER_VALUE) {
    return biome.getTopsoilBlock(x, ground, z);
  }

  const cg = gen.chunkGenerator;

  // 水面と地面が同じ高さ: 砂
  if (water === ground) return cg.sandId;

  // 水の下: 川床の点に近ければ粘土か白亜、そうでなければ下の土
  const p = cg.riverbedFeatureGenerator.getClosestPoint(x, z);
  if (squaredDistanceToPoint(p, x, z) < 100) {
    if (gen !== memoGen) {      // 別の生成器(別のシード)に変わったら、記憶を捨てる
      memoGen = gen;
      memoPx = NaN;
      memoPz = NaN;
    }
    if (p[0] !== memoPx || p[1] !== memoPz) {
      memoPx = p[0];
      memoPz = p[1];
      memoBlock =
        new SeededRandom(`${cg.seed}${p[0]}${p[1]}`).next() < 0.3
          ? cg.chalkId
          : cg.clayId;
    }
    return memoBlock;
  }
  return biome.getLowsoilBlockType(x, ground, z, ground);
}