import { SeededRandom } from "../noise/SeededRandom.js";
import { generateRandomId } from "../random/generateRandomId.js";

const MAX_ENCHANTMENT_COUNT = 3;

const enchantableItemNames: Record<string, string[]> = {
  Sword: ["Damage", "Attack Speed", "Critical Damage"],
  Spear: ["Damage", "Attack Speed", "Critical Damage"],
  Dagger: ["Damage", "Attack Speed", "Critical Damage"],
  Mace: ["Damage", "Attack Speed", "Critical Damage"],
  Whip: ["Damage", "Attack Speed", "Critical Damage"],
  Helmet: ["Protection", "Health", "Health Regen"],
  Chestplate: ["Protection", "Health", "Health Regen"],
  Leggings: ["Protection", "Health", "Health Regen"],
  Boots: ["Protection", "Health", "Health Regen"],
  Gauntlets: ["Protection", "Health", "Health Regen"],
  Bow: ["Arrow Speed", "Arrow Damage", "Quick Charge"],
  Crossbow: ["Arrow Speed", "Arrow Damage", "Quick Charge"],
  Pickaxe: ["Break Speed", "Momentum", "Mining Yield", "Mining Aura"],
  Spade: ["Break Speed", "Momentum", "Digging Aura"],
  Axe: ["Break Speed", "Momentum", "Lumber Aura"],
  Hoe: ["Break Speed", "Momentum", "Farming Yield", "Farming Aura"],
  "Knight Sword": ["Damage", "Attack Speed", "Critical Damage", "Horizontal Knockback"],
  "Moonstone Pickaxe": ["Break Speed", "Momentum"],
  Stick: ["Horizontal Knockback", "Vertical Knockback", "Damage"],
  "Fur Chestplate": ["Protection", "Health", "Health Regen", "Knockback Resist"],
  "Spiked Boots": ["Protection", "Health", "Health Regen", "Stomp Damage"]
};

const tierLevel = {
  "Tier 1": 1,
  "Tier 2": 2,
  "Tier 3": 3,
  "Tier 4": 4,
  "Tier 5": 5
};

type EnchantmentTier = keyof typeof tierLevel;

export let EE: EnchantmentGenerator | undefined;

export function initializeEnchantmentGenerator(itemMetadata: any) {
  EE ||= new EnchantmentGenerator(itemMetadata);
}

export function getEnchantmentGenerator(): EnchantmentGenerator {
  if (EE === undefined) {
    throw new Error("EnchantmentGenerator has not been initialized.");
  }

  return EE;
}

export class EnchantmentGenerator {
  suffixMapping: Record<string, string>;

  constructor(itemMetadata: any) {
    this.suffixMapping = Object.fromEntries(
      Object.entries(itemMetadata).map(([itemId, itemData]: [string, any]) => {
        const itemName = itemData.name;

        if (enchantableItemNames[itemName] !== undefined) {
          return [itemId, itemName];
        }

        return [itemId, itemName.split(" ").at(-1)!];
      })
    );
  }

  getPossibleEnchantmentsForItem(itemId: string) {
    if (this.suffixMapping[itemId]) {
      return enchantableItemNames[this.suffixMapping[itemId]];
    } else {
      return [];
    }
  }

  chooseRandomEnchantmentAttributes(
    random: SeededRandom,
    enchantmentTier: EnchantmentTier,
    enchantments: string[]
  ) {
    const availableEnchantments = [...enchantments];

    const result = {
      enchantments: {} as Record<string, number>,
      enchantmentTier,
      id: generateRandomId()
    };

    const numEnchantments = tierLevel[enchantmentTier];

    for (let i = 0; i < numEnchantments; i++) {
      if (availableEnchantments.length === 0) {
        console.error("Ran out of enchantments to choose from");
        break;
      }

      const enchantment = availableEnchantments[
        Math.floor(random.next() * availableEnchantments.length)
      ]!;

      result.enchantments[enchantment] =
        (result.enchantments[enchantment] ?? 0) + 1;

      if (result.enchantments[enchantment] >= MAX_ENCHANTMENT_COUNT) {
        availableEnchantments.splice(
          availableEnchantments.indexOf(enchantment),
          1
        );
      }
    }

    return result;
  }
}