import { SeededRandom } from "@/noise/SeededRandom.js";

export class Probability {
  probability: number;

  constructor(probability: number) {
    this.probability = probability;
  }

  sample(random: SeededRandom): boolean {
    return random.next() < this.probability;
  }
}