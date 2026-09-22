import { MaterialTier, Rarity } from "../../core/constants.js";
import { normalizeFrequencies } from "./NormalizeFrequencies.js";
import type { FrequenciesItems } from "../../core/types.js";
import { LootChestGenerator } from "./LootChestGenerator.js";
import { MobNameGenerator } from "./MobNameGenerator.js";

//AE
const coalLootItem = {
  name: "Coal",
  frequency: 1,
  amount: {
    min: 5,
    max: 15,
  },
};

//VE
const ironBarLootItem = {
  name: "Iron Bar",
  frequency: 2,
  amount: {
    min: 3,
    max: 6,
  },
};

//YE
const goldBarLootItem = {
  name: "Gold Bar",
  frequency: 2,
  amount: {
    min: 3,
    max: 6,
  },
};

//QE
const diamondLootItem = {
  name: "Diamond",
  frequency: 1,
  amount: {
    min: 2,
    max: 4,
  },
};

//JE
const SpiritSaddleItem = {
  name: "Spirit Saddle",
  frequency: 0.5,
  amount: null
};

function getToolLoot(
  materialTier: MaterialTier,
  targetTotalFrequency: number
) {
  return normalizeFrequencies([
    {
      name: `${materialTier} Pickaxe`,
      frequency: 1,
      amount: null,
    },
    {
      name: `${materialTier} Axe`,
      frequency: 0.9,
      amount: null,
    },
    {
      name: `${materialTier} Spade`,
      frequency: 0.7,
      amount: null,
    },
    {
      name: `${materialTier} Hoe`,
      frequency: 0.2,
      amount: null,
    },
  ], targetTotalFrequency);
}

function getAuraXpPotions(targetFrequency: number) {
  return normalizeFrequencies([{
    name: "Aura XP Potion",
    frequency: 4,
    amount: null
  }, {
    name: "Aura XP Potion II",
    frequency: 1,
    amount: null
  }], targetFrequency);
}

function getMobLoot(targetFrequency: number) {
  return normalizeFrequencies([...normalizeFrequencies([{
    name: "Wheat",
    frequency: 1,
    amount: {
      min: 2,
      max: 4
    }
  }, {
    name: "Wheat Seeds",
    frequency: 1,
    amount: {
      min: 2,
      max: 4
    }
  }, {
    name: "Bone Meal",
    frequency: 1,
    amount: {
      min: 4,
      max: 9
    }
  }], 4), ...normalizeFrequencies([{
    name: "Leather",
    frequency: 2,
    amount: {
      min: 2,
      max: 4
    }
  }, {
    name: "Rotten Flesh",
    frequency: 1,
    amount: {
      min: 2,
      max: 4
    }
  }, {
    name: "Rotten Brain",
    frequency: 1,
    amount: {
      min: 1,
      max: 3
    }
  }], 2), ...normalizeFrequencies([{
    name: "Firecracker",
    frequency: 1,
    amount: {
      min: 10,
      max: 20
    }
  }, {
    name: "Firecracker Pebble",
    frequency: 1,
    amount: {
      min: 10,
      max: 20
    }
  }, {
    name: "Net",
    frequency: 2,
    amount: {
      min: 4,
      max: 9
    }
  }], 1), ...normalizeFrequencies([{
    name: "Saddle",
    frequency: 4,
    amount: null
  }, {
    name: "Mob Catcher",
    frequency: 4,
    amount: null
  }, {
    name: "Name Tag",
    frequency: 2,
    amount: null
  }, {
    name: "Bucket",
    frequency: 1,
    amount: null
  }, {
    name: "Chaos Potion",
    frequency: 1,
    amount: null
  }], 2)], targetFrequency);
}

function getFoodLoot(targetFrequency: number) {
  const IH = {
    min: 2,
    max: 4
  };

  const EH = [{
    name: "Carrot",
    frequency: 1,
    amount: IH
  }, {
    name: "Raw Potato",
    frequency: 1,
    amount: IH
  }, {
    name: "Beetroot",
    frequency: 1,
    amount: IH
  }];

  return normalizeFrequencies([...normalizeFrequencies([{
    name: "Apple",
    frequency: 1,
    amount: IH
  }, {
    name: "Bowl of Rice",
    frequency: 1,
    amount: null
  }, {
    name: "Bread",
    frequency: 1,
    amount: IH
  }, {
    name: "Cherry",
    frequency: 1,
    amount: IH
  }, {
    name: "Bowl of Cranberries",
    frequency: 1,
    amount: null
  }, {
    name: "Mushroom Soup",
    frequency: 1,
    amount: null
  }, {
    name: "Pear",
    frequency: 1,
    amount: IH
  }, {
    name: "Plum",
    frequency: 1,
    amount: IH
  }, {
    name: "Pumpkin Pie",
    frequency: 1,
    amount: IH
  }], 2), ...normalizeFrequencies(EH, 1)], targetFrequency);
}

function getBuildingMaterialLoot(targetFrequency: number) {
  return normalizeFrequencies([{
    name: "Stone",
    frequency: 1,
    amount: {
      min: 40,
      max: 80
    }
  }, {
    name: "Maple Log",
    frequency: 1,
    amount: {
      min: 10,
      max: 20
    }
  }, {
    name: "Bricks",
    frequency: 0.5,
    amount: {
      min: 15,
      max: 40
    }
  }, {
    name: "Chalk",
    frequency: 0.5,
    amount: {
      min: 15,
      max: 40
    }
  }], targetFrequency);
}

function getDecorativeBlockLoot(targetFrequency: number) {
  const blockGroups = [
    [
      "White Concrete",
      "Orange Concrete",
      "Magenta Concrete",
      "Light Blue Concrete",
      "Yellow Concrete",
      "Lime Concrete",
      "Pink Concrete",
      "Gray Concrete",
      "Light Gray Concrete",
      "Cyan Concrete",
      "Purple Concrete",
      "Blue Concrete",
      "Brown Concrete",
      "Green Concrete",
      "Red Concrete",
      "Black Concrete",
    ],
    [
      "Green Glass",
      "White Glass",
      "Light Gray Glass",
      "Gray Glass",
      "Black Glass",
      "Brown Glass",
      "Red Glass",
      "Orange Glass",
      "Yellow Glass",
      "Lime Glass",
      "Cyan Glass",
      "Light Blue Glass",
      "Blue Glass",
      "Purple Glass",
      "Magenta Glass",
      "Pink Glass",
    ],
    [
      "Patterned Green Glass",
      "Patterned White Glass",
      "Patterned Light Gray Glass",
      "Patterned Gray Glass",
      "Patterned Black Glass",
      "Patterned Brown Glass",
      "Patterned Red Glass",
      "Patterned Orange Glass",
      "Patterned Yellow Glass",
      "Patterned Lime Glass",
      "Patterned Cyan Glass",
      "Patterned Light Blue Glass",
      "Patterned Blue Glass",
      "Patterned Purple Glass",
      "Patterned Magenta Glass",
      "Patterned Pink Glass",
    ],
    [
      "White Baked Clay",
      "Orange Baked Clay",
      "Magenta Baked Clay",
      "Light Blue Baked Clay",
      "Yellow Baked Clay",
      "Lime Baked Clay",
      "Pink Baked Clay",
      "Gray Baked Clay",
      "Light Gray Baked Clay",
      "Cyan Baked Clay",
      "Purple Baked Clay",
      "Blue Baked Clay",
      "Brown Baked Clay",
      "Green Baked Clay",
      "Red Baked Clay",
      "Black Baked Clay",
    ],
    [
      "White Ceramic",
      "Orange Ceramic",
      "Magenta Ceramic",
      "Light Blue Ceramic",
      "Yellow Ceramic",
      "Lime Ceramic",
      "Pink Ceramic",
      "Gray Ceramic",
      "Light Gray Ceramic",
      "Cyan Ceramic",
      "Purple Ceramic",
      "Blue Ceramic",
      "Brown Ceramic",
      "Green Ceramic",
      "Red Ceramic",
      "Black Ceramic",
    ],
    [
      "Stone Bricks",
      "Engraved Stone",
      "Mossy Stone Bricks",
      "Cracked Stone Bricks",
      "Mossy Messy Stone",
      "Compressed Messy Stone",
      "Extra Compressed Messy Stone",
      "Smooth Sandstone",
      "Engraved Sandstone",
      "Marked Sandstone",
      "Sandstone Bricks",
      "Smooth Red Sandstone",
      "Engraved Red Sandstone",
      "Marked Red Sandstone",
      "Red Sandstone Bricks",
      "Engraved Diorite",
      "Diorite Bricks",
      "Engraved Andesite",
      "Andesite Bricks",
      "Engraved Granite",
      "Granite Bricks",
      "Ice Bricks",
      "Dark Red Stone",
      "Dark Red Brick",
    ],
    [
      "White Chalk",
      "Orange Chalk",
      "Magenta Chalk",
      "Light Blue Chalk",
      "Yellow Chalk",
      "Lime Chalk",
      "Pink Chalk",
      "Gray Chalk",
      "Light Gray Chalk",
      "Cyan Chalk",
      "Purple Chalk",
      "Blue Chalk",
      "Brown Chalk",
      "Green Chalk",
      "Red Chalk",
      "Black Chalk",
    ],
  ];

  const blockLootItems: FrequenciesItems[] = [];

  for (const blockGroup of blockGroups) {
    const groupLootItems: FrequenciesItems[] = [];

    for (const blockName of blockGroup) {
      groupLootItems.push({
        name: blockName,
        frequency: 1,
        amount: {
          min: 10,
          max: 25,
        },
      });
    }

    blockLootItems.push(...normalizeFrequencies(groupLootItems, 1));
  }

  const rareBlockNames = [
    "Super Compressed Messy Stone",
    "Hyper Compressed Messy Stone",
    "Ultra Compressed Messy Stone",
  ];

  const rareBlockLootItems: FrequenciesItems[] = [];

  for (const blockName of rareBlockNames) {
    rareBlockLootItems.push({
      name: blockName,
      frequency: 1,
      amount: {
        min: 1,
        max: 1,
      },
    });
  }

  return [
    ...normalizeFrequencies(blockLootItems, targetFrequency * 0.999),
    ...normalizeFrequencies(rareBlockLootItems, targetFrequency * 0.001),
  ];
}

function getArrowLoot(
  targetTotalFrequency: number,
  specialArrowChance: number
) {
  if (specialArrowChance < 0 || specialArrowChance > 1) {
    throw new Error(
      `Special arrow chance must be between 0 and 1, but is ${specialArrowChance}`
    );
  }

  const items: FrequenciesItems[] = [{
    name: "Arrow",
    frequency: 1 - specialArrowChance,
    amount: {
      min: 15,
      max: 25,
    },
  }];

  const specialArrowNames = [
    "Arrow of Slowness",
    "Arrow of Poison",
    "Arrow of Weakness",
    "Arrow of Knockback",
    "Arrow of Instant Damage",
  ];

  const specialArrows = [];

  for (const name of specialArrowNames) {
    specialArrows.push({
      name,
      frequency: 1,
      amount: {
        min: 10,
        max: 15,
      },
    });
  }

  items.push(...normalizeFrequencies(specialArrows, specialArrowChance));

  return normalizeFrequencies(items, targetTotalFrequency);
}

function getWeaponLoot(
  materialTier: MaterialTier,
  targetFrequency: number,
) {
  const specialArrowChance = {
    [MaterialTier.WOOD]: 0.05,
    [MaterialTier.STONE]: 0.1,
    [MaterialTier.IRON]: 0.3,
    [MaterialTier.GOLD]: 0.5,
    [MaterialTier.DIAMOND]: 0.7,
  };

  return normalizeFrequencies(
    [
      {
        name: `${materialTier} Sword`,
        frequency: 0.75,
        amount: null,
      },
      {
        name: `${materialTier} Bow`,
        frequency: 0.6,
        amount: null,
      },
      {
        name: `${materialTier} Crossbow`,
        frequency: 0.15,
        amount: null,
      },
      ...getArrowLoot(1, specialArrowChance[materialTier]),
    ],
    targetFrequency,
  );
}

function getArmorLoot(
  materialTier: MaterialTier,
  targetFrequency: number,
) {
  if (materialTier === MaterialTier.STONE) {
    throw new Error(`${materialTier} armour is not supported`);
  }

  const armorLootItems: FrequenciesItems[] = [
    {
      name: `${materialTier} Helmet`,
      frequency: 1,
      amount: null,
    },
    {
      name: `${materialTier} Chestplate`,
      frequency: 1,
      amount: null,
    },
    {
      name: `${materialTier} Gauntlets`,
      frequency: 1,
      amount: null,
    },
    {
      name: `${materialTier} Leggings`,
      frequency: 1,
      amount: null,
    },
    {
      name: `${materialTier} Boots`,
      frequency: 1,
      amount: null,
    },
  ];

  const weaponAndArmorLootItems = [
    ...getWeaponLoot(materialTier, 1),
    ...normalizeFrequencies(armorLootItems, 1.5),
  ];

  return normalizeFrequencies(
    weaponAndArmorLootItems,
    targetFrequency,
  );
}

export const lootChestGenerators = {
  [Rarity.COMMON]: new LootChestGenerator({
    enchantmentTier: "Tier 1",
    enchantmentProbability: 1,
    itemCategories: [{
      minItems: 1,
      maxItems: 2,
      items: getAuraXpPotions(1)
    }, {
      minItems: 2,
      maxItems: 3,
      items: getMobLoot(1)
    }, {
      minItems: 2,
      maxItems: 3,
      items: getFoodLoot(1)
    }, {
      minItems: 1,
      maxItems: 2,
      items: getBuildingMaterialLoot(1)
    }, {
      minItems: 3,
      maxItems: 4,
      items: [...getToolLoot(MaterialTier.WOOD, 1), ...getToolLoot(MaterialTier.STONE, 1), ...getArmorLoot(MaterialTier.WOOD, 1), ...getWeaponLoot(MaterialTier.STONE, 1)]
    }, {
      minItems: 1,
      maxItems: 2,
      items: [coalLootItem]
    }]
  }),
  [Rarity.UNCOMMON]: new LootChestGenerator({
    enchantmentTier: "Tier 2",
    enchantmentProbability: 0.9,
    itemCategories: [{
      minItems: 1,
      maxItems: 2,
      items: getAuraXpPotions(1)
    }, {
      minItems: 2,
      maxItems: 3,
      items: getMobLoot(1)
    }, {
      minItems: 2,
      maxItems: 3,
      items: getFoodLoot(1)
    }, {
      minItems: 1,
      maxItems: 2,
      items: [...getBuildingMaterialLoot(2), ...getDecorativeBlockLoot(1)]
    }, {
      minItems: 3,
      maxItems: 4,
      items: [...getToolLoot(MaterialTier.STONE, 1), ...getToolLoot(MaterialTier.IRON, 1), ...getWeaponLoot(MaterialTier.STONE, 1), ...getArmorLoot(MaterialTier.IRON, 1)]
    }, {
      minItems: 2,
      maxItems: 3,
      items: [coalLootItem, ironBarLootItem]
    }]
  }),
  [Rarity.RARE]: new LootChestGenerator({
    enchantmentTier: "Tier 3",
    enchantmentProbability: 0.75,
    itemCategories: [{
      minItems: 2,
      maxItems: 3,
      items: getAuraXpPotions(1)
    }, {
      minItems: 2,
      maxItems: 3,
      items: getMobLoot(1)
    }, {
      minItems: 2,
      maxItems: 3,
      items: getFoodLoot(1)
    }, {
      minItems: 1,
      maxItems: 2,
      items: [...getDecorativeBlockLoot(1)]
    }, {
      minItems: 3,
      maxItems: 4,
      items: [...getToolLoot(MaterialTier.IRON, 1), ...getToolLoot(MaterialTier.GOLD, 1), ...getArmorLoot(MaterialTier.IRON, 1), ...getArmorLoot(MaterialTier.GOLD, 1)]
    }, {
      minItems: 2,
      maxItems: 4,
      items: [coalLootItem, ironBarLootItem, goldBarLootItem, SpiritSaddleItem]
    }]
  }),
  [Rarity.EPIC]: new LootChestGenerator({
    enchantmentTier: "Tier 4",
    enchantmentProbability: 0.6,
    itemCategories: [{
      minItems: 3,
      maxItems: 4,
      items: getAuraXpPotions(1)
    }, {
      minItems: 1,
      maxItems: 2,
      items: getMobLoot(1)
    }, {
      minItems: 2,
      maxItems: 3,
      items: getFoodLoot(1)
    }, {
      minItems: 2,
      maxItems: 3,
      items: [...getDecorativeBlockLoot(1)]
    }, {
      minItems: 3,
      maxItems: 4,
      items: [...getToolLoot(MaterialTier.GOLD, 1), ...getToolLoot(MaterialTier.DIAMOND, 1), ...getArmorLoot(MaterialTier.GOLD, 1), ...getArmorLoot(MaterialTier.DIAMOND, 1), ...normalizeFrequencies([{
        name: "Fur Chestplate",
        frequency: 1,
        amount: null
      }, {
        name: "Spiked Boots",
        frequency: 1,
        amount: null
      }], 1)]
    }, {
      minItems: 2,
      maxItems: 3,
      items: [goldBarLootItem, diamondLootItem, SpiritSaddleItem]
    }]
  }),
  [Rarity.LEGENDARY]: new LootChestGenerator({
    enchantmentTier: "Tier 5",
    enchantmentProbability: 0.5,
    itemCategories: [{
      minItems: 4,
      maxItems: 5,
      items: getAuraXpPotions(1)
    }, {
      minItems: 2,
      maxItems: 3,
      items: [...getDecorativeBlockLoot(1)]
    }, {
      minItems: 3,
      maxItems: 4,
      items: [...getToolLoot(MaterialTier.DIAMOND, 1), ...getArmorLoot(MaterialTier.DIAMOND, 2), ...normalizeFrequencies([{
        name: "Knight Sword",
        frequency: 2,
        amount: null
      }, {
        name: "Golem Pickaxe",
        frequency: 2,
        amount: null
      }, {
        name: "Moonstone Pickaxe",
        frequency: 2,
        amount: null
      }, {
        name: "Moonstone Axe",
        frequency: 1,
        amount: null
      }, {
        name: "Fur Chestplate",
        frequency: 1,
        amount: null
      }, {
        name: "Spiked Boots",
        frequency: 1,
        amount: null
      }], 1)]
    }, {
      minItems: 4,
      maxItems: 5,
      items: [goldBarLootItem, diamondLootItem, {
        name: "Moonstone",
        frequency: 1,
        amount: {
          min: 2,
          max: 4
        }
      }, SpiritSaddleItem]
    }, {
      minItems: 1,
      maxItems: 1,
      items: (normalizeFrequencies([{
        name: "Caught Mob Spirit_Golem Default",
        frequency: 1,
        amount: null,
        itemAttributesDistribution: new MobNameGenerator("Spirit Golem")
      }, {
        name: "Caught Mob Spirit_Wolf Default",
        frequency: 1,
        amount: null,
        itemAttributesDistribution: new MobNameGenerator("Spirit Wolf")
      }, {
        name: "Caught Mob Spirit_Bear Default",
        frequency: 1,
        amount: null,
        itemAttributesDistribution: new MobNameGenerator("Spirit Bear")
      }, {
        name: "Caught Mob Spirit_Stag Default",
        frequency: 1,
        amount: null,
        itemAttributesDistribution: new MobNameGenerator("Spirit Stag")
      }, {
        name: "Caught Mob Spirit_Gorilla Default",
        frequency: 1,
        amount: null,
        itemAttributesDistribution: new MobNameGenerator("Spirit Gorilla")
      }], 1))
    }, {
      minItems: 2,
      maxItems: 3,
      items: function (HH) {
        return normalizeFrequencies([{
          name: "Moonstone Explosive",
          frequency: 2,
          amount: {
            min: 2,
            max: 4
          }
        }, {
          name: "Fireball",
          frequency: 1,
          amount: {
            min: 4,
            max: 9
          }
        }, {
          name: "Iceball",
          frequency: 1,
          amount: {
            min: 4,
            max: 9
          }
        }, {
          name: "Bouncy Bomb",
          frequency: 1,
          amount: {
            min: 4,
            max: 9
          }
        }], HH);
      }(1)
    }]
  })
};