import { OUT_OF_RUNGE_NUMBER } from "@/core/constants.js";
import { Octave } from "@/core/types.js";
import SimplexNoise from "simplex-noise";

type Threshold = {
  low: number;
  high: number;
};

//BH
export class ThresholdOctaveNoise {
  _simplexes: SimplexNoise[];
  customOctaves: Octave[];
  threshold: Threshold;
  remainingAmplitudes: number[];

  constructor(octaves: Octave[], threshold: Threshold, seed: string | number) {
    if (!seed) console.log("Seed must be defined");

    this._simplexes = [];
    this.customOctaves = octaves;
    this.threshold = threshold;

    for (let index = 0; index < octaves.length; index++) {
      this._simplexes.push(new SimplexNoise(`${seed}${index}`))
    };

    this.remainingAmplitudes = new Array(octaves.length);
    let totalAmplitude = 0;

    for (let index = this.remainingAmplitudes.length - 1; index >= 0; index--) {
      const customOctave = this.customOctaves[index];
      if(!customOctave) continue;

      totalAmplitude += customOctave.amplitude;
      this.remainingAmplitudes[index] = totalAmplitude;
    }
  }

  getOctaves(x: number, y: number) {
    let result = 0;
    for (let index = 0; index < this.customOctaves.length; index++) {
      const remainingAmplitude = this.remainingAmplitudes[index];
      if(!remainingAmplitude) continue;

      if (result - remainingAmplitude > this.threshold.high || result + remainingAmplitude < this.threshold.low) {
        return OUT_OF_RUNGE_NUMBER.OUT_OF_RANGE;
      };

      const octave = this.customOctaves[index];
      const simplex = this._simplexes[index];

      if(!octave || !simplex) continue;

      result += simplex.noise2D(x * octave.frequency, y * octave.frequency) * octave.amplitude
    }
    return result;
  }
}