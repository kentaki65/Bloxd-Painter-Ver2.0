import { _TypeOf } from "@/core/index.js";
import { FrequenciesItems, LootItem } from "@/core/types.js";
import { getEnchantmentGenerator } from "@/enchantment/EnchantmentGenerator.js";
import { SeededRandom } from "@/noise/SeededRandom.js";
import { Probability } from "@/random/Probability.js";
import { RandomIntRange } from "@/random/RandomIntRange.js";
import { WeightedDistribution } from "@/random/WeightedDistribution.js";

export class LootChestGenerator {
  itemCategoryDistributions: LootItem[];

  shouldEnchantDistribution: Probability;
  enchantmentTier: (_TypeOf["enchantmentTiers"])[number];

  constructor(metadata: {
    itemCategories: {
      minItems: number;
      maxItems: number;
      items: FrequenciesItems[];
    }[];
    enchantmentProbability: number;
    enchantmentTier: (_TypeOf["enchantmentTiers"])[number]
  }) {
    this.itemCategoryDistributions = [];
    this.shouldEnchantDistribution = new Probability(
      metadata.enchantmentProbability
    );
    this.enchantmentTier = metadata.enchantmentTier;

    for (const category of metadata.itemCategories) {
      const numItemsDistribution = new RandomIntRange(
        category.minItems,
        category.maxItems + 1
      );

      const items = [];

      for (const item of category.items) {
        const amountDistribution = item.amount
          ? new RandomIntRange(item.amount.min, item.amount.max + 1)
          : null;

        const attributesDistribution = item.itemAttributesDistribution ?? null;

        items.push({
          weight: item.frequency,
          value: {
            name: item.name,
            amountDistribution,
            attributesDistribution,
          },
        });
      }

      const itemDistribution = new WeightedDistribution(items);

      this.itemCategoryDistributions.push({
        numItemsDistribution,
        itemDistribution,
      });
    }
  }

  sample(random: SeededRandom) {
    const items = Array<any | null>(36).fill(null);
    let itemIndex = 0;

    for (const category of this.itemCategoryDistributions) {
      const numItems = category.numItemsDistribution.sample(random);

      for (let i = 0; i < numItems; i++, itemIndex++) {
        const item = category.itemDistribution.sample(random);
        const name = item.name;

        const amount = item.amountDistribution?.sample(random) ?? null;
        const attributes = item.attributesDistribution?.sample(random) ?? {};

        const enchantmentAttributes = this.getEnchantmentAttributesForItem(random, name) ?? {};

        items[itemIndex] = {
          name,
          amount,
          attributes: {
            ...attributes,
            customAttributes: {
              ...(attributes.customAttributes ?? {}),
              ...enchantmentAttributes,
            },
          },
        };
      }
    }

    for (let i = 0; i < items.length; i++) {
      const j = i + Math.floor(random.next() * (items.length - i));
      [items[i], items[j]] = [items[j], items[i]];
    }

    return items;
  }

  getEnchantmentAttributesForItem(
    random: SeededRandom,
    itemName: string
  ) {
    if (!this.shouldEnchantDistribution.sample(random)) {
      return null;
    }
    const enchantmentGenerator = getEnchantmentGenerator();
    const enchantments = enchantmentGenerator.getPossibleEnchantmentsForItem(itemName);

    if (enchantments.length === 0) {
      return null;
    }

    return enchantmentGenerator.chooseRandomEnchantmentAttributes(
      random,
      this.enchantmentTier,
      enchantments
    );
  }
}