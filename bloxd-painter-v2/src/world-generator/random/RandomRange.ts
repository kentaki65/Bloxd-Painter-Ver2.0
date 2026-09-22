import { SeededRandom } from "@/noise/SeededRandom.js";

export class RandomRange {
  min: number;
  max: number;
  multiplier: number;
  offset: number;

  constructor(min: number, max: number, reverse = false) {
    if (min > max) {
      throw new Error(`Min must be less than or equal to Max, but Min=${min} and Max=${max}`);
    }

    if (reverse) {
      this.multiplier = min - max;
      this.offset = max;
    } else {
      this.multiplier = max - min;
      this.offset = min;
    }

    this.min = min;
    this.max = max;
  }

  sample(random: SeededRandom): number {
    return random.next() * this.multiplier + this.offset;
  }
}