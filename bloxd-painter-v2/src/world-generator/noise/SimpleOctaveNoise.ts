import { Octave, Seed } from "@/core/types.js";
import SimplexNoise from "simplex-noise";

//WH
export class SimpleOctavesNoise {
  simplexes: SimplexNoise[];
  customOctaves: Octave[];

  constructor(octaves: Octave[], seed: Seed) {
    if (seed === undefined) console.log("Seed must be defined");

    this.simplexes = [];
    this.customOctaves = octaves;

    for (let i = 0; i < octaves.length; i++) {
      this.simplexes.push(new SimplexNoise(`${seed}${i}`));
    }
  }

  getOctaves(x: number, y: number): number {
    let value = 0;

    for (let i = 0; i < this.customOctaves.length; i++) {
      const simplex = this.simplexes[i];
      const octave = this.customOctaves[i];

      if (!simplex || !octave) continue;

      value += simplex.noise2D(x * octave.frequency, y * octave.frequency) * octave.amplitude;
    }

    return value;
  }
}