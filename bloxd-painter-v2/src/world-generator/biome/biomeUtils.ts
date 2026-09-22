import { PrefabFrequency, PrefabFrequencySettings } from "@/core/types.js";
import { SeededRandom } from "@/noise/SeededRandom.js";

export function createPrefabFrequencySettings(
  density: number,
  ...prefabFrequencyGroups: PrefabFrequency[][]
): PrefabFrequencySettings {
  let totalFrequency = 0;
  const prefabFrequencies: PrefabFrequency[] = [];

  for (const prefabFrequency of prefabFrequencyGroups.flat()) {
    totalFrequency += prefabFrequency.frequency;
    prefabFrequencies.push(prefabFrequency);
  }

  if (totalFrequency > 100) {
    throw new Error(`Total frequency of prefabs exceeds ${100}: ${totalFrequency}`);
  }

  return {
    density,
    frequencyParams: {
      noPrefabFrequency: 100 - totalFrequency,
      prefabFrequencies
    }
  };
}

export function selectWeightedIndex(
  frequencyValues: number[],
  totalFrequency: number,
  rng: SeededRandom
) {
  const target = rng.next() * totalFrequency;

  let cumulativeFrequency = 0;
  let index = 0;

  while (cumulativeFrequency <= target) {
    cumulativeFrequency += frequencyValues[index]!;
    index++;
  }

  return index - 1;
}