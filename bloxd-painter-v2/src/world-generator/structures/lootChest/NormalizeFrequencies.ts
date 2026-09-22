import type { FrequenciesItems } from "../../core/types.js";

export function normalizeFrequencies(
  items: FrequenciesItems[],
  targetTotal: number
) {
  let totalFrequency = 0;

  for (const item of items) {
    totalFrequency += item.frequency;
  }

  const scale = targetTotal / totalFrequency;

  return items.map(item => ({
    ...item,
    frequency: item.frequency * scale,
  }));
}