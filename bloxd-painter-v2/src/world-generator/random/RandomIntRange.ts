import { SeededRandom } from "@/noise/SeededRandom.js";
import { RandomRange } from "./RandomRange.js";

export class RandomIntRange {
  uniformRealDistribution: RandomRange;

  constructor(min: number, max: number, reverse = false) {
    this.uniformRealDistribution = new RandomRange(min, max, reverse);

    if (!Number.isInteger(min) || !Number.isInteger(max)) {
      throw new Error(`Min and Max must be integers, but Min=${min} and Max=${max}`);
    }
  }

  sample(random: SeededRandom): number {
    const value = this.uniformRealDistribution.sample(random);
    return Math.floor(value);
  }
}