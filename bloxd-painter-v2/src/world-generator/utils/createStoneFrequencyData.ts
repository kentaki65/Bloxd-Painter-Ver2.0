import type { BlockId } from "../core/types.js";

interface StoneType {
  stoneId: BlockId;
  frequency: number;
}

export function createStoneFrequencyData(stoneFrequencies: StoneType[]) {
  let stonesTotalFrequency = 0;
  const frequencyValues: number[] = [];

  for (const stoneFrequency of stoneFrequencies) {
    stonesTotalFrequency += stoneFrequency.frequency;
    frequencyValues.push(stoneFrequency.frequency);
  }

  return {
    stoneFrequencies,
    frequencyValues,
    stonesTotalFrequency
  };
}