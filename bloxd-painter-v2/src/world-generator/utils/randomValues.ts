import { WeightedDistribution } from "@/random/WeightedDistribution.js";

export const rotationDistribution = new WeightedDistribution([
  { value: 0, weight: 1 },
  { value: 90, weight: 1 },
  { value: 180, weight: 1 },
  { value: 270, weight: 1 },
]);

export const mirrorDistribution = new WeightedDistribution([
  { value: false, weight: 1 },
  { value: true, weight: 1 },
]);

export const mobNamePrefixDistribution = new WeightedDistribution(
  ["Powerful","Legendary","Majestic","Fearless","Celestial","Mythic","Epic","Ethereal","Omniscient","Omnipotent","Arcane","Enigmatic","Formidable","Indomitable","Luminous","Ferocious","Astral","Unyielding","Celestine","Ascendant","Otherworldly","Runic","Fabled","Primordial","Cosmic","Enkindled",].map(value => ({
    value,
    weight: 1,
  }))
);