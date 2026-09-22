import { Rarity } from "@/core/constants.js";
import { snowStructures } from "./SnowStructure.js";
import { treeStractures } from "./TreeStructures.js";
import { WeightedDistribution } from "@/random/WeightedDistribution.js";
import { jungleStructures } from "./JungleStructures.js";
import { dungeonStructures } from "./DungeonStructures.js";
import { PrefabDefinition } from "@/core/types.js";

export const prefabDefinitions: Record<string, PrefabDefinition> = {
  treeMapleLarge1: {
    schematic: treeStractures.treeMapleLarge1,
    groundingPoints: "centre",
    groundingRadius: 1,
    clearingRadiusSquared: 144,
    undergroundYInterval: null,
    yOffset: 0,
    transformationsEnabled: true,
    chestLocations: [],
    spawnerBlockLocations: []
  },
  treeMapleLarge2: {
    schematic: treeStractures.treeMapleLarge2,
    groundingPoints: "centre",
    groundingRadius: 2,
    clearingRadiusSquared: 144,
    undergroundYInterval: null,
    yOffset: 0,
    transformationsEnabled: true,
    chestLocations: [],
    spawnerBlockLocations: []
  },
  treeSpectralLarge1: {
    schematic: treeStractures.treeSpectralLarge1,
    groundingPoints: [{
      localX: 23,
      localZ: 22
    }],
    groundingRadius: 4,
    clearingRadiusSquared: 144,
    undergroundYInterval: null,
    yOffset: 0,
    transformationsEnabled: true,
    chestLocations: [],
    spawnerBlockLocations: []
  },
  treeSpectralLarge2: {
    schematic: treeStractures.treeSpectralLarge2,
    groundingPoints: [{
      localX: 23,
      localZ: 12
    }],
    groundingRadius: 4,
    clearingRadiusSquared: 144,
    undergroundYInterval: null,
    yOffset: 0,
    transformationsEnabled: true,
    chestLocations: [],
    spawnerBlockLocations: []
  },
  treePineLarge1: {
    schematic: treeStractures.treePineLarge1,
    groundingPoints: [{
      localX: 13,
      localZ: 14
    }],
    groundingRadius: 4,
    clearingRadiusSquared: 361,
    undergroundYInterval: null,
    yOffset: 0,
    transformationsEnabled: false,
    chestLocations: [],
    spawnerBlockLocations: []
  },
  treePineLarge2: {
    schematic: treeStractures.treePineLarge2,
    groundingPoints: [{
      localX: 13,
      localZ: 12
    }],
    groundingRadius: 4,
    clearingRadiusSquared: 361,
    undergroundYInterval: null,
    yOffset: 0,
    transformationsEnabled: false,
    chestLocations: [],
    spawnerBlockLocations: []
  },
  treeJungleLarge1: {
    schematic: treeStractures.treeJungleLarge1,
    groundingPoints: [{
      localX: 9,
      localZ: 9
    }, {
      localX: 8,
      localZ: 16
    }, {
      localX: 11,
      localZ: 21
    }, {
      localX: 16,
      localZ: 19
    }, {
      localX: 19,
      localZ: 21
    }, {
      localX: 22,
      localZ: 20
    }, {
      localX: 26,
      localZ: 11
    }, {
      localX: 21,
      localZ: 9
    }, {
      localX: 17,
      localZ: 9
    }, {
      localX: 18,
      localZ: 16
    }],
    groundingRadius: 2,
    clearingRadiusSquared: 225,
    undergroundYInterval: null,
    yOffset: 0,
    transformationsEnabled: true,
    chestLocations: [],
    spawnerBlockLocations: []
  },
  treeJungleLarge2: {
    schematic: treeStractures.treeJungleLarge2,
    groundingPoints: [{
      localX: 8,
      localZ: 6
    }, {
      localX: 8,
      localZ: 13
    }, {
      localX: 7,
      localZ: 16
    }, {
      localX: 7,
      localZ: 20
    }, {
      localX: 13,
      localZ: 20
    }, {
      localX: 20,
      localZ: 20
    }, {
      localX: 19,
      localZ: 12
    }, {
      localX: 19,
      localZ: 10
    }, {
      localX: 18,
      localZ: 4
    }, {
      localX: 14,
      localZ: 6
    }, {
      localX: 13,
      localZ: 14
    }],
    groundingRadius: 2,
    clearingRadiusSquared: 225,
    undergroundYInterval: null,
    yOffset: 0,
    transformationsEnabled: true,
    chestLocations: [],
    spawnerBlockLocations: []
  },
  rockSnowLarge1: {
    schematic: jungleStructures.rockSnowLarge1,
    groundingPoints: [{
      localX: 3,
      localZ: 10
    }, {
      localX: 9,
      localZ: 4
    }, {
      localX: 14,
      localZ: 10
    }, {
      localX: 8,
      localZ: 16
    }, {
      localX: 4,
      localZ: 23
    }, {
      localX: 6,
      localZ: 29
    }, {
      localX: 11,
      localZ: 32
    }, {
      localX: 18,
      localZ: 32
    }, {
      localX: 31,
      localZ: 31
    }, {
      localX: 29,
      localZ: 24
    }, {
      localX: 31,
      localZ: 15
    }, {
      localX: 32,
      localZ: 4
    }, {
      localX: 26,
      localZ: 7
    }, {
      localX: 22,
      localZ: 6
    }],
    groundingRadius: 3,
    clearingRadiusSquared: 361,
    undergroundYInterval: null,
    yOffset: 0,
    transformationsEnabled: true,
    chestLocations: [],
    spawnerBlockLocations: []
  },
  rockSnowLarge2: {
    schematic: jungleStructures.rockSnowLarge2,
    groundingPoints: [{
      localX: 2,
      localZ: 8
    }, {
      localX: 4,
      localZ: 18
    }, {
      localX: 3,
      localZ: 31
    }, {
      localX: 13,
      localZ: 26
    }, {
      localX: 17,
      localZ: 34
    }, {
      localX: 27,
      localZ: 33
    }, {
      localX: 29,
      localZ: 25
    }, {
      localX: 28,
      localZ: 13
    }, {
      localX: 32,
      localZ: 5
    }, {
      localX: 20,
      localZ: 6
    }, {
      localX: 9,
      localZ: 3
    }, {
      localX: 18,
      localZ: 17
    }, {
      localX: 10,
      localZ: 11
    }],
    groundingRadius: 4,
    clearingRadiusSquared: 361,
    undergroundYInterval: null,
    yOffset: 0,
    transformationsEnabled: true,
    chestLocations: [],
    spawnerBlockLocations: []
  },
  rockSnowLarge3: {
    schematic: jungleStructures.rockSnowLarge3,
    groundingPoints: [{
      localX: 3,
      localZ: 4
    }, {
      localX: 3,
      localZ: 9
    }, {
      localX: 10,
      localZ: 6
    }, {
      localX: 6,
      localZ: 19
    }, {
      localX: 15,
      localZ: 29
    }, {
      localX: 13,
      localZ: 24
    }, {
      localX: 19,
      localZ: 23
    }, {
      localX: 27,
      localZ: 27
    }, {
      localX: 32,
      localZ: 23
    }, {
      localX: 35,
      localZ: 17
    }, {
      localX: 29,
      localZ: 6
    }, {
      localX: 25,
      localZ: 3
    }, {
      localX: 18,
      localZ: 12
    }],
    groundingRadius: 3,
    clearingRadiusSquared: 361,
    undergroundYInterval: null,
    yOffset: 0,
    transformationsEnabled: true,
    chestLocations: [],
    spawnerBlockLocations: []
  },
  rockJungleLarge1: {
    schematic: jungleStructures.rockJungleLarge1,
    groundingPoints: [{
      localX: 7,
      localZ: 5
    }, {
      localX: 7,
      localZ: 21
    }, {
      localX: 20,
      localZ: 5
    }, {
      localX: 20,
      localZ: 21
    }],
    groundingRadius: 4,
    clearingRadiusSquared: 289,
    undergroundYInterval: null,
    yOffset: -2,
    transformationsEnabled: true,
    chestLocations: [{
      localX: 10,
      localY: 4,
      localZ: 22,
      qualityDistribution: new WeightedDistribution([{
        value: Rarity.COMMON,
        weight: 1
      }, {
        value: Rarity.UNCOMMON,
        weight: 2
      }, {
        value: Rarity.RARE,
        weight: 1
      }])
    }, {
      localX: 9,
      localY: 4,
      localZ: 13,
      qualityDistribution: new WeightedDistribution([{
        value: Rarity.COMMON,
        weight: 1
      }, {
        value: Rarity.UNCOMMON,
        weight: 2
      }, {
        value: Rarity.RARE,
        weight: 1
      }])
    }, {
      localX: 10,
      localY: 4,
      localZ: 16,
      qualityDistribution: new WeightedDistribution([{
        value: Rarity.COMMON,
        weight: 1
      }, {
        value: Rarity.UNCOMMON,
        weight: 2
      }, {
        value: Rarity.RARE,
        weight: 1
      }])
    }, {
      localX: 22,
      localY: 4,
      localZ: 9,
      qualityDistribution: new WeightedDistribution([{
        value: Rarity.COMMON,
        weight: 1
      }, {
        value: Rarity.UNCOMMON,
        weight: 2
      }, {
        value: Rarity.RARE,
        weight: 1
      }])
    }],
    spawnerBlockLocations: []
  },
  rockJungleLarge2: {
    schematic: jungleStructures.rockJungleLarge2,
    groundingPoints: [{
      localX: 13,
      localZ: 6
    }, {
      localX: 5,
      localZ: 14
    }, {
      localX: 13,
      localZ: 22
    }, {
      localX: 21,
      localZ: 14
    }, {
      localX: 8,
      localZ: 10
    }, {
      localX: 9,
      localZ: 19
    }, {
      localX: 17,
      localZ: 19
    }, {
      localX: 17,
      localZ: 9
    }],
    groundingRadius: 4,
    clearingRadiusSquared: 361,
    undergroundYInterval: null,
    yOffset: 0,
    transformationsEnabled: true,
    chestLocations: [{
      localX: 12,
      localY: 2,
      localZ: 11,
      qualityDistribution: new WeightedDistribution([{
        value: Rarity.LEGENDARY,
        weight: 1
      }])
    }],
    spawnerBlockLocations: []
  },
  rockJungleLarge3: {
    schematic: jungleStructures.rockJungleLarge3,
    groundingPoints: [{
      localX: 6,
      localZ: 14
    }, {
      localX: 8,
      localZ: 18
    }, {
      localX: 14,
      localZ: 20
    }, {
      localX: 17,
      localZ: 18
    }, {
      localX: 20,
      localZ: 15
    }, {
      localX: 17,
      localZ: 10
    }, {
      localX: 12,
      localZ: 7
    }, {
      localX: 8,
      localZ: 8
    }],
    groundingRadius: 4,
    clearingRadiusSquared: 256,
    undergroundYInterval: null,
    yOffset: -1,
    transformationsEnabled: true,
    chestLocations: [],
    spawnerBlockLocations: []
  },
  rockJungleLarge4: {
    schematic: jungleStructures.rockJungleLarge4,
    groundingPoints: [{
      localX: 8,
      localZ: 7
    }, {
      localX: 8,
      localZ: 18
    }, {
      localX: 20,
      localZ: 19
    }, {
      localX: 17,
      localZ: 11
    }, {
      localX: 7,
      localZ: 12
    }, {
      localX: 12,
      localZ: 20
    }, {
      localX: 21,
      localZ: 18
    }, {
      localX: 12,
      localZ: 6
    }],
    groundingRadius: 4,
    clearingRadiusSquared: 289,
    undergroundYInterval: null,
    yOffset: -1,
    transformationsEnabled: true,
    chestLocations: [],
    spawnerBlockLocations: []
  },
  rockJungleLarge5: {
    schematic: jungleStructures.rockJungleLarge5,
    groundingPoints: [{
      localX: 11,
      localZ: 7
    }, {
      localX: 3,
      localZ: 21
    }, {
      localX: 22,
      localZ: 22
    }, {
      localX: 23,
      localZ: 7
    }, {
      localX: 7,
      localZ: 21
    }, {
      localX: 13,
      localZ: 25
    }, {
      localX: 24,
      localZ: 16
    }, {
      localX: 16,
      localZ: 6
    }],
    groundingRadius: 4,
    clearingRadiusSquared: 289,
    undergroundYInterval: null,
    yOffset: 0,
    transformationsEnabled: true,
    chestLocations: [{
      localX: 15,
      localY: 11,
      localZ: 20,
      qualityDistribution: new WeightedDistribution([{
        value: Rarity.UNCOMMON,
        weight: 1
      }, {
        value: Rarity.RARE,
        weight: 2
      }, {
        value: Rarity.EPIC,
        weight: 1
      }])
    }],
    spawnerBlockLocations: []
  },
  rockJungleLarge6: {
    schematic: jungleStructures.rockJungleLarge6,
    groundingPoints: [{
      localX: 11,
      localZ: 9
    }, {
      localX: 8,
      localZ: 21
    }, {
      localX: 18,
      localZ: 21
    }, {
      localX: 18,
      localZ: 7
    }, {
      localX: 15,
      localZ: 5
    }, {
      localX: 7,
      localZ: 17
    }, {
      localX: 11,
      localZ: 24
    }, {
      localX: 22,
      localZ: 13
    }],
    groundingRadius: 4,
    clearingRadiusSquared: 324,
    undergroundYInterval: null,
    yOffset: -3,
    transformationsEnabled: true,
    chestLocations: [{
      localX: 8,
      localY: 8,
      localZ: 14,
      qualityDistribution: new WeightedDistribution([{
        value: Rarity.UNCOMMON,
        weight: 1
      }, {
        value: Rarity.RARE,
        weight: 2
      }, {
        value: Rarity.EPIC,
        weight: 1
      }])
    }],
    spawnerBlockLocations: []
  },
  ruinSnowSmall1: {
    schematic: snowStructures.ruinSnowSmall1,
    groundingPoints: "centre",
    groundingRadius: 4,
    clearingRadiusSquared: 144,
    undergroundYInterval: null,
    yOffset: 0,
    transformationsEnabled: false,
    chestLocations: [{
      localX: 5,
      localY: 0,
      localZ: 4,
      qualityDistribution: new WeightedDistribution([{
        value: Rarity.RARE,
        weight: 2
      }, {
        value: Rarity.EPIC,
        weight: 1
      }])
    }, {
      localX: 6,
      localY: 1,
      localZ: 6,
      qualityDistribution: new WeightedDistribution([{
        value: Rarity.COMMON,
        weight: 1
      }, {
        value: Rarity.UNCOMMON,
        weight: 2
      }, {
        value: Rarity.RARE,
        weight: 1
      }])
    }],
    spawnerBlockLocations: [{
      localX: 6,
      localY: 2,
      localZ: 6,
      mobTypeDistribution: new WeightedDistribution([{
        value: "Frost Zombie",
        weight: 1
      }])
    }]
  },
  ruinSnowSmall2: {
    schematic: snowStructures.ruinSnowSmall2,
    groundingPoints: [{
      localX: 3,
      localZ: 3
    }, {
      localX: 11,
      localZ: 3
    }, {
      localX: 11,
      localZ: 11
    }, {
      localX: 3,
      localZ: 11
    }],
    groundingRadius: 2,
    clearingRadiusSquared: 144,
    undergroundYInterval: null,
    yOffset: 0,
    transformationsEnabled: true,
    chestLocations: [{
      localX: 5,
      localY: 6,
      localZ: 8,
      qualityDistribution: new WeightedDistribution([{
        value: Rarity.COMMON,
        weight: 1
      }, {
        value: Rarity.UNCOMMON,
        weight: 2
      }, {
        value: Rarity.RARE,
        weight: 1
      }])
    }, {
      localX: 7,
      localY: 9,
      localZ: 8,
      qualityDistribution: new WeightedDistribution([{
        value: Rarity.COMMON,
        weight: 1
      }, {
        value: Rarity.UNCOMMON,
        weight: 2
      }, {
        value: Rarity.RARE,
        weight: 1
      }])
    }],
    spawnerBlockLocations: [{
      localX: 2,
      localY: 4,
      localZ: 8,
      mobTypeDistribution: new WeightedDistribution([{
        value: "Frost Golem",
        weight: 1
      }])
    }]
  },
  ruinSnowSmall3: {
    schematic: snowStructures.ruinSnowSmall3,
    groundingPoints: [{
      localX: 3,
      localZ: 3
    }, {
      localX: 9,
      localZ: 3
    }, {
      localX: 9,
      localZ: 8
    }, {
      localX: 3,
      localZ: 8
    }],
    groundingRadius: 3,
    clearingRadiusSquared: 144,
    undergroundYInterval: null,
    yOffset: 0,
    transformationsEnabled: true,
    chestLocations: [{
      localX: 4,
      localY: 3,
      localZ: 3,
      qualityDistribution: new WeightedDistribution([{
        value: Rarity.COMMON,
        weight: 1
      }, {
        value: Rarity.UNCOMMON,
        weight: 2
      }])
    }, {
      localX: 10,
      localY: 7,
      localZ: 5,
      qualityDistribution: new WeightedDistribution([{
        value: Rarity.UNCOMMON,
        weight: 2
      }, {
        value: Rarity.RARE,
        weight: 1
      }])
    }],
    spawnerBlockLocations: [{
      localX: 7,
      localY: 2,
      localZ: 5,
      mobTypeDistribution: new WeightedDistribution([{
        value: "Frost Skeleton",
        weight: 1
      }])
    }]
  },
  ruinSnowSmall4: {
    schematic: snowStructures.ruinSnowSmall4,
    groundingPoints: [{
      localX: 3,
      localZ: 3
    }, {
      localX: 7,
      localZ: 3
    }, {
      localX: 7,
      localZ: 8
    }, {
      localX: 3,
      localZ: 8
    }],
    groundingRadius: 4,
    clearingRadiusSquared: 144,
    undergroundYInterval: null,
    yOffset: 0,
    transformationsEnabled: false,
    chestLocations: [{
      localX: 5,
      localY: 2,
      localZ: 4,
      qualityDistribution: new WeightedDistribution([{
        value: Rarity.COMMON,
        weight: 1
      }, {
        value: Rarity.UNCOMMON,
        weight: 2
      }, {
        value: Rarity.RARE,
        weight: 1
      }])
    }],
    spawnerBlockLocations: [{
      localX: 5,
      localY: 3,
      localZ: 4,
      mobTypeDistribution: new WeightedDistribution([{
        value: "Frost Zombie",
        weight: 1
      }])
    }]
  },
  ruinSnowMedium1: {
    schematic: snowStructures.ruinSnowMedium1,
    groundingPoints: [{
      localX: 2,
      localZ: 2
    }, {
      localX: 2,
      localZ: 8
    }, {
      localX: 2,
      localZ: 14
    }, {
      localX: 2,
      localZ: 20
    }, {
      localX: 2,
      localZ: 26
    }, {
      localX: 10,
      localZ: 2
    }, {
      localX: 10,
      localZ: 8
    }, {
      localX: 10,
      localZ: 14
    }, {
      localX: 10,
      localZ: 20
    }, {
      localX: 10,
      localZ: 26
    }],
    groundingRadius: 2,
    clearingRadiusSquared: 144,
    undergroundYInterval: null,
    yOffset: 0,
    transformationsEnabled: false,
    chestLocations: [{
      localX: 3,
      localY: 4,
      localZ: 5,
      qualityDistribution: new WeightedDistribution([{
        value: Rarity.COMMON,
        weight: 1
      }, {
        value: Rarity.UNCOMMON,
        weight: 2
      }, {
        value: Rarity.RARE,
        weight: 1
      }])
    }, {
      localX: 6,
      localY: 4,
      localZ: 21,
      qualityDistribution: new WeightedDistribution([{
        value: Rarity.COMMON,
        weight: 1
      }, {
        value: Rarity.UNCOMMON,
        weight: 2
      }, {
        value: Rarity.RARE,
        weight: 1
      }])
    }],
    spawnerBlockLocations: [{
      localX: 6,
      localY: 6,
      localZ: 8,
      mobTypeDistribution: new WeightedDistribution([{
        value: "Frost Zombie",
        weight: 1
      }])
    }]
  },
  ruinSnowMedium2: {
    schematic: snowStructures.ruinSnowMedium2,
    groundingPoints: [{
      localX: 5,
      localZ: 5
    }, {
      localX: 5,
      localZ: 11
    }, {
      localX: 21,
      localZ: 4
    }, {
      localX: 21,
      localZ: 12
    }, {
      localX: 28,
      localZ: 11
    }, {
      localX: 28,
      localZ: 4
    }],
    groundingRadius: 3,
    clearingRadiusSquared: 144,
    undergroundYInterval: null,
    yOffset: 0,
    transformationsEnabled: false,
    chestLocations: [{
      localX: 4,
      localY: 6,
      localZ: 12,
      qualityDistribution: new WeightedDistribution([{
        value: Rarity.UNCOMMON,
        weight: 1
      }, {
        value: Rarity.RARE,
        weight: 2
      }, {
        value: Rarity.EPIC,
        weight: 1
      }])
    }, {
      localX: 13,
      localY: 6,
      localZ: 3,
      qualityDistribution: new WeightedDistribution([{
        value: Rarity.UNCOMMON,
        weight: 1
      }, {
        value: Rarity.RARE,
        weight: 2
      }, {
        value: Rarity.EPIC,
        weight: 1
      }])
    }, {
      localX: 17,
      localY: 6,
      localZ: 13,
      qualityDistribution: new WeightedDistribution([{
        value: Rarity.UNCOMMON,
        weight: 1
      }, {
        value: Rarity.RARE,
        weight: 2
      }, {
        value: Rarity.EPIC,
        weight: 1
      }])
    }],
    spawnerBlockLocations: [{
      localX: 15,
      localY: 2,
      localZ: 8,
      mobTypeDistribution: new WeightedDistribution([{
        value: "Frost Zombie",
        weight: 1
      }])
    }]
  },
  ruinSnowLarge1: {
    schematic: snowStructures.ruinSnowLarge1,
    groundingPoints: [{
      localX: 13,
      localZ: 7
    }, {
      localX: 7,
      localZ: 19
    }, {
      localX: 9,
      localZ: 29
    }, {
      localX: 16,
      localZ: 33
    }, {
      localX: 26,
      localZ: 28
    }, {
      localX: 31,
      localZ: 19
    }, {
      localX: 27,
      localZ: 9
    }, {
      localX: 17,
      localZ: 5
    }],
    groundingRadius: 3,
    clearingRadiusSquared: 361,
    undergroundYInterval: null,
    yOffset: 0,
    transformationsEnabled: false,
    chestLocations: [{
      localX: 21,
      localY: 19,
      localZ: 14,
      qualityDistribution: new WeightedDistribution([{
        value: Rarity.EPIC,
        weight: 1
      }])
    }, {
      localX: 21,
      localY: 20,
      localZ: 27,
      qualityDistribution: new WeightedDistribution([{
        value: Rarity.LEGENDARY,
        weight: 1
      }])
    }],
    spawnerBlockLocations: [{
      localX: 21,
      localY: 20,
      localZ: 14,
      mobTypeDistribution: new WeightedDistribution([{
        value: "Draugr Knight",
        weight: 1
      }])
    }]
  },
  ruinSnowLarge2: {
    schematic: snowStructures.ruinSnowLarge2,
    groundingPoints: [{
      localX: 3,
      localZ: 4
    }, {
      localX: 13,
      localZ: 28
    }, {
      localX: 24,
      localZ: 30
    }, {
      localX: 30,
      localZ: 21
    }, {
      localX: 33,
      localZ: 9
    }, {
      localX: 26,
      localZ: 4
    }, {
      localX: 13,
      localZ: 3
    }, {
      localX: 6,
      localZ: 15
    }],
    groundingRadius: 2,
    clearingRadiusSquared: 361,
    undergroundYInterval: null,
    yOffset: 0,
    transformationsEnabled: false,
    chestLocations: [{
      localX: 18,
      localY: 25,
      localZ: 19,
      qualityDistribution: new WeightedDistribution([{
        value: Rarity.EPIC,
        weight: 1
      }])
    }, {
      localX: 19,
      localY: 27,
      localZ: 2,
      qualityDistribution: new WeightedDistribution([{
        value: Rarity.LEGENDARY,
        weight: 1
      }])
    }],
    spawnerBlockLocations: [{
      localX: 16,
      localY: 25,
      localZ: 9,
      mobTypeDistribution: new WeightedDistribution([{
        value: "Draugr Knight",
        weight: 1
      }])
    }]
  },
  ruinStoneSmall1: {
    schematic: snowStructures.ruinStoneSmall1,
    groundingPoints: "centre",
    groundingRadius: 2,
    clearingRadiusSquared: 144,
    undergroundYInterval: null,
    yOffset: 0,
    transformationsEnabled: true,
    chestLocations: [{
      localX: 9,
      localY: 1,
      localZ: 6,
      qualityDistribution: new WeightedDistribution([{
        value: Rarity.COMMON,
        weight: 1
      }, {
        value: Rarity.UNCOMMON,
        weight: 1
      }])
    }, {
      localX: 4,
      localY: 0,
      localZ: 4,
      qualityDistribution: new WeightedDistribution([{
        value: Rarity.COMMON,
        weight: 1
      }, {
        value: Rarity.UNCOMMON,
        weight: 2
      }, {
        value: Rarity.RARE,
        weight: 1
      }])
    }],
    spawnerBlockLocations: [{
      localX: 6,
      localY: 1,
      localZ: 6,
      mobTypeDistribution: new WeightedDistribution([{
        value: "Draugr Zombie",
        weight: 1
      }])
    }]
  },
  ruinStoneSmall2: {
    schematic: snowStructures.ruinStoneSmall2,
    groundingPoints: [{
      localX: 2,
      localZ: 3
    }, {
      localX: 2,
      localZ: 9
    }, {
      localX: 5,
      localZ: 5
    }],
    groundingRadius: 3,
    clearingRadiusSquared: 144,
    undergroundYInterval: null,
    yOffset: 0,
    transformationsEnabled: true,
    chestLocations: [{
      localX: 1,
      localY: 2,
      localZ: 1,
      qualityDistribution: new WeightedDistribution([{
        value: Rarity.COMMON,
        weight: 1
      }, {
        value: Rarity.UNCOMMON,
        weight: 1
      }])
    }, {
      localX: 7,
      localY: 1,
      localZ: 4,
      qualityDistribution: new WeightedDistribution([{
        value: Rarity.COMMON,
        weight: 1
      }, {
        value: Rarity.UNCOMMON,
        weight: 1
      }])
    }, {
      localX: 5,
      localY: 0,
      localZ: 6,
      qualityDistribution: new WeightedDistribution([{
        value: Rarity.COMMON,
        weight: 1
      }, {
        value: Rarity.UNCOMMON,
        weight: 2
      }, {
        value: Rarity.RARE,
        weight: 1
      }])
    }],
    spawnerBlockLocations: [{
      localX: 6,
      localY: 1,
      localZ: 5,
      mobTypeDistribution: new WeightedDistribution([{
        value: "Draugr Zombie",
        weight: 1
      }])
    }]
  },
  ruinStoneSmall3: {
    schematic: snowStructures.ruinStoneSmall3,
    groundingPoints: [{
      localX: 4,
      localZ: 4
    }, {
      localX: 7,
      localZ: 9
    }],
    groundingRadius: 4,
    clearingRadiusSquared: 144,
    undergroundYInterval: null,
    yOffset: 0,
    transformationsEnabled: true,
    chestLocations: [{
      localX: 1,
      localY: 1,
      localZ: 6,
      qualityDistribution: new WeightedDistribution([{
        value: Rarity.COMMON,
        weight: 1
      }, {
        value: Rarity.UNCOMMON,
        weight: 1
      }])
    }, {
      localX: 6,
      localY: 0,
      localZ: 4,
      qualityDistribution: new WeightedDistribution([{
        value: Rarity.COMMON,
        weight: 1
      }, {
        value: Rarity.UNCOMMON,
        weight: 2
      }, {
        value: Rarity.RARE,
        weight: 1
      }])
    }],
    spawnerBlockLocations: [{
      localX: 7,
      localY: 1,
      localZ: 4,
      mobTypeDistribution: new WeightedDistribution([{
        value: "Cave Golem",
        weight: 1
      }])
    }]
  },
  ruinStoneSmall4: {
    schematic: snowStructures.ruinStoneSmall4,
    groundingPoints: "centre",
    groundingRadius: 2,
    clearingRadiusSquared: 144,
    undergroundYInterval: null,
    yOffset: 0,
    transformationsEnabled: true,
    chestLocations: [{
      localX: 5,
      localY: 2,
      localZ: 4,
      qualityDistribution: new WeightedDistribution([{
        value: Rarity.COMMON,
        weight: 1
      }, {
        value: Rarity.UNCOMMON,
        weight: 1
      }])
    }, {
      localX: 2,
      localY: 0,
      localZ: 1,
      qualityDistribution: new WeightedDistribution([{
        value: Rarity.COMMON,
        weight: 1
      }, {
        value: Rarity.UNCOMMON,
        weight: 2
      }, {
        value: Rarity.RARE,
        weight: 1
      }])
    }],
    spawnerBlockLocations: [{
      localX: 1,
      localY: 2,
      localZ: 2,
      mobTypeDistribution: new WeightedDistribution([{
        value: "Draugr Zombie",
        weight: 1
      }])
    }]
  },
  ruinStoneSmall5: {
    schematic: snowStructures.ruinStoneSmall5,
    groundingPoints: "centre",
    groundingRadius: 4,
    clearingRadiusSquared: 144,
    undergroundYInterval: null,
    yOffset: 0,
    transformationsEnabled: false,
    chestLocations: [{
      localX: 2,
      localY: 2,
      localZ: 9,
      qualityDistribution: new WeightedDistribution([{
        value: Rarity.COMMON,
        weight: 1
      }, {
        value: Rarity.UNCOMMON,
        weight: 1
      }])
    }, {
      localX: 6,
      localY: 7,
      localZ: 7,
      qualityDistribution: new WeightedDistribution([{
        value: Rarity.COMMON,
        weight: 1
      }, {
        value: Rarity.UNCOMMON,
        weight: 2
      }, {
        value: Rarity.RARE,
        weight: 1
      }])
    }, {
      localX: 5,
      localY: 1,
      localZ: 6,
      qualityDistribution: new WeightedDistribution([{
        value: Rarity.UNCOMMON,
        weight: 1
      }, {
        value: Rarity.RARE,
        weight: 2
      }, {
        value: Rarity.EPIC,
        weight: 1
      }])
    }],
    spawnerBlockLocations: [{
      localX: 6,
      localY: 7,
      localZ: 5,
      mobTypeDistribution: new WeightedDistribution([{
        value: "Draugr Skeleton",
        weight: 1
      }])
    }]
  },
  ruinStoneSmall6: {
    schematic: snowStructures.ruinStoneSmall6,
    groundingPoints: "centre",
    groundingRadius: 4,
    clearingRadiusSquared: 144,
    undergroundYInterval: null,
    yOffset: 0,
    transformationsEnabled: false,
    chestLocations: [{
      localX: 3,
      localY: 6,
      localZ: 7,
      qualityDistribution: new WeightedDistribution([{
        value: Rarity.COMMON,
        weight: 1
      }, {
        value: Rarity.UNCOMMON,
        weight: 2
      }, {
        value: Rarity.RARE,
        weight: 1
      }])
    }, {
      localX: 5,
      localY: 2,
      localZ: 8,
      qualityDistribution: new WeightedDistribution([{
        value: Rarity.COMMON,
        weight: 1
      }, {
        value: Rarity.UNCOMMON,
        weight: 2
      }, {
        value: Rarity.RARE,
        weight: 1
      }])
    }, {
      localX: 5,
      localY: 1,
      localZ: 7,
      qualityDistribution: new WeightedDistribution([{
        value: Rarity.UNCOMMON,
        weight: 1
      }, {
        value: Rarity.RARE,
        weight: 2
      }, {
        value: Rarity.EPIC,
        weight: 1
      }])
    }],
    spawnerBlockLocations: [{
      localX: 7,
      localY: 6,
      localZ: 5,
      mobTypeDistribution: new WeightedDistribution([{
        value: "Draugr Skeleton",
        weight: 1
      }])
    }]
  },
  ruinStoneMedium1: {
    schematic: snowStructures.ruinStoneMedium1,
    groundingPoints: [{
      localX: 5,
      localZ: 4
    }, {
      localX: 5,
      localZ: 12
    }],
    groundingRadius: 2,
    clearingRadiusSquared: 144,
    undergroundYInterval: null,
    yOffset: 0,
    transformationsEnabled: true,
    chestLocations: [{
      localX: 7,
      localY: 10,
      localZ: 13,
      qualityDistribution: new WeightedDistribution([{
        value: Rarity.UNCOMMON,
        weight: 1
      }, {
        value: Rarity.RARE,
        weight: 1
      }])
    }, {
      localX: 6,
      localY: 2,
      localZ: 5,
      qualityDistribution: new WeightedDistribution([{
        value: Rarity.UNCOMMON,
        weight: 1
      }, {
        value: Rarity.RARE,
        weight: 2
      }, {
        value: Rarity.EPIC,
        weight: 1
      }])
    }],
    spawnerBlockLocations: [{
      localX: 6,
      localY: 9,
      localZ: 13,
      mobTypeDistribution: new WeightedDistribution([{
        value: "Draugr Skeleton",
        weight: 1
      }])
    }]
  },
  ruinStoneMedium2: {
    schematic: snowStructures.ruinStoneMedium2,
    groundingPoints: [{
      localX: 2,
      localZ: 9
    }, {
      localX: 9,
      localZ: 2
    }, {
      localX: 9,
      localZ: 16
    }, {
      localX: 16,
      localZ: 9
    }],
    groundingRadius: 1,
    clearingRadiusSquared: 225,
    undergroundYInterval: null,
    yOffset: 0,
    transformationsEnabled: false,
    chestLocations: [{
      localX: 12,
      localY: 9,
      localZ: 9,
      qualityDistribution: new WeightedDistribution([{
        value: Rarity.UNCOMMON,
        weight: 1
      }, {
        value: Rarity.RARE,
        weight: 1
      }])
    }, {
      localX: 7,
      localY: 0,
      localZ: 16,
      qualityDistribution: new WeightedDistribution([{
        value: Rarity.UNCOMMON,
        weight: 1
      }, {
        value: Rarity.RARE,
        weight: 2
      }, {
        value: Rarity.EPIC,
        weight: 1
      }])
    }],
    spawnerBlockLocations: [{
      localX: 9,
      localY: 0,
      localZ: 9,
      mobTypeDistribution: new WeightedDistribution([{
        value: "Cave Golem",
        weight: 1
      }])
    }, {
      localX: 16,
      localY: 7,
      localZ: 10,
      mobTypeDistribution: new WeightedDistribution([{
        value: "Draugr Skeleton",
        weight: 1
      }])
    }]
  },
  ruinStoneMedium3: {
    schematic: snowStructures.ruinStoneMedium3,
    groundingPoints: [{
      localX: 4,
      localZ: 5
    }, {
      localX: 8,
      localZ: 5
    }, {
      localX: 4,
      localZ: 25
    }, {
      localX: 12,
      localZ: 25
    }],
    groundingRadius: 2,
    clearingRadiusSquared: 289,
    undergroundYInterval: null,
    yOffset: 0,
    transformationsEnabled: false,
    chestLocations: [{
      localX: 13,
      localY: 10,
      localZ: 25,
      qualityDistribution: new WeightedDistribution([{
        value: Rarity.UNCOMMON,
        weight: 1
      }, {
        value: Rarity.RARE,
        weight: 1
      }])
    }, {
      localX: 5,
      localY: 1,
      localZ: 5,
      qualityDistribution: new WeightedDistribution([{
        value: Rarity.UNCOMMON,
        weight: 1
      }, {
        value: Rarity.RARE,
        weight: 2
      }, {
        value: Rarity.EPIC,
        weight: 1
      }])
    }],
    spawnerBlockLocations: [{
      localX: 4,
      localY: 6,
      localZ: 5,
      mobTypeDistribution: new WeightedDistribution([{
        value: "Draugr Skeleton",
        weight: 1
      }])
    }, {
      localX: 4,
      localY: 6,
      localZ: 25,
      mobTypeDistribution: new WeightedDistribution([{
        value: "Cave Golem",
        weight: 1
      }])
    }]
  },
  ruinStoneMedium4: {
    schematic: snowStructures.ruinStoneMedium4,
    groundingPoints: [{
      localX: 3,
      localZ: 2
    }, {
      localX: 3,
      localZ: 19
    }, {
      localX: 15,
      localZ: 10
    }, {
      localX: 15,
      localZ: 19
    }],
    groundingRadius: 2,
    clearingRadiusSquared: 289,
    undergroundYInterval: null,
    yOffset: 0,
    transformationsEnabled: false,
    chestLocations: [{
      localX: 3,
      localY: 6,
      localZ: 2,
      qualityDistribution: new WeightedDistribution([{
        value: Rarity.UNCOMMON,
        weight: 1
      }, {
        value: Rarity.RARE,
        weight: 2
      }])
    }, {
      localX: 3,
      localY: 1,
      localZ: 10,
      qualityDistribution: new WeightedDistribution([{
        value: Rarity.UNCOMMON,
        weight: 1
      }, {
        value: Rarity.RARE,
        weight: 2
      }, {
        value: Rarity.EPIC,
        weight: 1
      }])
    }],
    spawnerBlockLocations: [{
      localX: 3,
      localY: 6,
      localZ: 5,
      mobTypeDistribution: new WeightedDistribution([{
        value: "Draugr Zombie",
        weight: 1
      }])
    }, {
      localX: 15,
      localY: 6,
      localZ: 19,
      mobTypeDistribution: new WeightedDistribution([{
        value: "Draugr Skeleton",
        weight: 1
      }])
    }]
  },
  ruinStoneMedium5: {
    schematic: snowStructures.ruinStoneMedium5,
    groundingPoints: "centre",
    groundingRadius: 4,
    clearingRadiusSquared: 144,
    undergroundYInterval: null,
    yOffset: 0,
    transformationsEnabled: false,
    chestLocations: [{
      localX: 9,
      localY: 13,
      localZ: 10,
      qualityDistribution: new WeightedDistribution([{
        value: Rarity.UNCOMMON,
        weight: 1
      }, {
        value: Rarity.RARE,
        weight: 2
      }, {
        value: Rarity.EPIC,
        weight: 1
      }])
    }, {
      localX: 5,
      localY: 1,
      localZ: 4,
      qualityDistribution: new WeightedDistribution([{
        value: Rarity.UNCOMMON,
        weight: 1
      }, {
        value: Rarity.RARE,
        weight: 2
      }, {
        value: Rarity.EPIC,
        weight: 1
      }])
    }],
    spawnerBlockLocations: [{
      localX: 8,
      localY: 1,
      localZ: 7,
      mobTypeDistribution: new WeightedDistribution([{
        value: "Draugr Zombie",
        weight: 1
      }])
    }, {
      localX: 9,
      localY: 13,
      localZ: 5,
      mobTypeDistribution: new WeightedDistribution([{
        value: "Draugr Skeleton",
        weight: 1
      }])
    }]
  },
  ruinStoneMedium6: {
    schematic: snowStructures.ruinStoneMedium6,
    groundingPoints: [{
      localX: 4,
      localZ: 4
    }, {
      localX: 4,
      localZ: 20
    }, {
      localX: 16,
      localZ: 4
    }, {
      localX: 16,
      localZ: 20
    }, {
      localX: 13,
      localZ: 12
    }],
    groundingRadius: 2,
    clearingRadiusSquared: 324,
    undergroundYInterval: null,
    yOffset: 0,
    transformationsEnabled: false,
    chestLocations: [{
      localX: 4,
      localY: 5,
      localZ: 3,
      qualityDistribution: new WeightedDistribution([{
        value: Rarity.UNCOMMON,
        weight: 1
      }, {
        value: Rarity.RARE,
        weight: 2
      }, {
        value: Rarity.EPIC,
        weight: 1
      }])
    }, {
      localX: 16,
      localY: 3,
      localZ: 20,
      qualityDistribution: new WeightedDistribution([{
        value: Rarity.UNCOMMON,
        weight: 1
      }, {
        value: Rarity.RARE,
        weight: 2
      }, {
        value: Rarity.EPIC,
        weight: 1
      }])
    }, {
      localX: 13,
      localY: 1,
      localZ: 12,
      qualityDistribution: new WeightedDistribution([{
        value: Rarity.EPIC,
        weight: 1
      }])
    }],
    spawnerBlockLocations: [{
      localX: 4,
      localY: 6,
      localZ: 9,
      mobTypeDistribution: new WeightedDistribution([{
        value: "Draugr Skeleton",
        weight: 1
      }])
    }, {
      localX: 13,
      localY: 1,
      localZ: 8,
      mobTypeDistribution: new WeightedDistribution([{
        value: "Draugr Zombie",
        weight: 1
      }])
    }, {
      localX: 13,
      localY: 1,
      localZ: 16,
      mobTypeDistribution: new WeightedDistribution([{
        value: "Cave Golem",
        weight: 1
      }])
    }]
  },
  ruinStoneMedium7: {
    schematic: snowStructures.ruinStoneMedium7,
    groundingPoints: [{
      localX: 8,
      localZ: 5
    }, {
      localX: 5,
      localZ: 4
    }, {
      localX: 4,
      localZ: 14
    }, {
      localX: 12,
      localZ: 12
    }],
    groundingRadius: 3,
    clearingRadiusSquared: 144,
    undergroundYInterval: null,
    yOffset: 0,
    transformationsEnabled: false,
    chestLocations: [{
      localX: 5,
      localY: 7,
      localZ: 8,
      qualityDistribution: new WeightedDistribution([{
        value: Rarity.UNCOMMON,
        weight: 1
      }, {
        value: Rarity.RARE,
        weight: 2
      }, {
        value: Rarity.EPIC,
        weight: 1
      }])
    }, {
      localX: 5,
      localY: 18,
      localZ: 9,
      qualityDistribution: new WeightedDistribution([{
        value: Rarity.RARE,
        weight: 2
      }, {
        value: Rarity.EPIC,
        weight: 1
      }])
    }, {
      localX: 6,
      localY: 1,
      localZ: 5,
      qualityDistribution: new WeightedDistribution([{
        value: Rarity.UNCOMMON,
        weight: 1
      }, {
        value: Rarity.RARE,
        weight: 1
      }])
    }],
    spawnerBlockLocations: [{
      localX: 9,
      localY: 1,
      localZ: 7,
      mobTypeDistribution: new WeightedDistribution([{
        value: "Draugr Zombie",
        weight: 1
      }])
    }, {
      localX: 9,
      localY: 13,
      localZ: 5,
      mobTypeDistribution: new WeightedDistribution([{
        value: "Draugr Skeleton",
        weight: 1
      }])
    }]
  },
  ruinStoneMedium8: {
    schematic: snowStructures.ruinStoneMedium8,
    groundingPoints: [{
      localX: 2,
      localZ: 3
    }, {
      localX: 12,
      localZ: 3
    }],
    groundingRadius: 2,
    clearingRadiusSquared: 100,
    undergroundYInterval: null,
    yOffset: 0,
    transformationsEnabled: false,
    chestLocations: [{
      localX: 7,
      localY: 3,
      localZ: 3,
      qualityDistribution: new WeightedDistribution([{
        value: Rarity.COMMON,
        weight: 1
      }, {
        value: Rarity.UNCOMMON,
        weight: 2
      }])
    }, {
      localX: 6,
      localY: 14,
      localZ: 4,
      qualityDistribution: new WeightedDistribution([{
        value: Rarity.UNCOMMON,
        weight: 1
      }, {
        value: Rarity.RARE,
        weight: 2
      }, {
        value: Rarity.EPIC,
        weight: 1
      }])
    }, {
      localX: 7,
      localY: 2,
      localZ: 2,
      qualityDistribution: new WeightedDistribution([{
        value: Rarity.RARE,
        weight: 1
      }, {
        value: Rarity.EPIC,
        weight: 1
      }])
    }],
    spawnerBlockLocations: [{
      localX: 3,
      localY: 3,
      localZ: 4,
      mobTypeDistribution: new WeightedDistribution([{
        value: "Cave Golem",
        weight: 1
      }])
    }, {
      localX: 11,
      localY: 3,
      localZ: 4,
      mobTypeDistribution: new WeightedDistribution([{
        value: "Draugr Zombie",
        weight: 1
      }])
    }]
  },
  ruinStoneMedium9: {
    schematic: snowStructures.ruinStoneMedium9,
    groundingPoints: [{
      localX: 3,
      localZ: 3
    }, {
      localX: 3,
      localZ: 8
    }, {
      localX: 8,
      localZ: 8
    }],
    groundingRadius: 3,
    clearingRadiusSquared: 144,
    undergroundYInterval: null,
    yOffset: 0,
    transformationsEnabled: true,
    chestLocations: [{
      localX: 1,
      localY: 7,
      localZ: 2,
      qualityDistribution: new WeightedDistribution([{
        value: Rarity.UNCOMMON,
        weight: 1
      }, {
        value: Rarity.RARE,
        weight: 2
      }, {
        value: Rarity.EPIC,
        weight: 1
      }])
    }, {
      localX: 11,
      localY: 2,
      localZ: 11,
      qualityDistribution: new WeightedDistribution([{
        value: Rarity.COMMON,
        weight: 1
      }, {
        value: Rarity.UNCOMMON,
        weight: 1
      }])
    }, {
      localX: 5,
      localY: 0,
      localZ: 1,
      qualityDistribution: new WeightedDistribution([{
        value: Rarity.UNCOMMON,
        weight: 1
      }, {
        value: Rarity.RARE,
        weight: 2
      }, {
        value: Rarity.EPIC,
        weight: 1
      }])
    }],
    spawnerBlockLocations: [{
      localX: 3,
      localY: 2,
      localZ: 3,
      mobTypeDistribution: new WeightedDistribution([{
        value: "Draugr Skeleton",
        weight: 1
      }])
    }, {
      localX: 9,
      localY: 2,
      localZ: 9,
      mobTypeDistribution: new WeightedDistribution([{
        value: "Draugr Zombie",
        weight: 1
      }])
    }]
  },
  ruinStoneMedium10: {
    schematic: snowStructures.ruinStoneMedium10,
    groundingPoints: [{
      localX: 5,
      localZ: 4
    }, {
      localX: 5,
      localZ: 13
    }, {
      localX: 5,
      localZ: 22
    }],
    groundingRadius: 4,
    clearingRadiusSquared: 361,
    undergroundYInterval: null,
    yOffset: 0,
    transformationsEnabled: false,
    chestLocations: [{
      localX: 5,
      localY: 2,
      localZ: 5,
      qualityDistribution: new WeightedDistribution([{
        value: Rarity.COMMON,
        weight: 1
      }, {
        value: Rarity.UNCOMMON,
        weight: 1
      }])
    }, {
      localX: 5,
      localY: 11,
      localZ: 13,
      qualityDistribution: new WeightedDistribution([{
        value: Rarity.UNCOMMON,
        weight: 1
      }, {
        value: Rarity.RARE,
        weight: 2
      }, {
        value: Rarity.EPIC,
        weight: 1
      }])
    }, {
      localX: 6,
      localY: 15,
      localZ: 23,
      qualityDistribution: new WeightedDistribution([{
        value: Rarity.UNCOMMON,
        weight: 1
      }, {
        value: Rarity.RARE,
        weight: 2
      }, {
        value: Rarity.EPIC,
        weight: 1
      }])
    }, {
      localX: 5,
      localY: 19,
      localZ: 23,
      qualityDistribution: new WeightedDistribution([{
        value: Rarity.RARE,
        weight: 1
      }, {
        value: Rarity.EPIC,
        weight: 2
      }, {
        value: Rarity.LEGENDARY,
        weight: 1
      }])
    }],
    spawnerBlockLocations: [{
      localX: 4,
      localY: 15,
      localZ: 23,
      mobTypeDistribution: new WeightedDistribution([{
        value: "Draugr Skeleton",
        weight: 1
      }])
    }, {
      localX: 5,
      localY: 2,
      localZ: 20,
      mobTypeDistribution: new WeightedDistribution([{
        value: "Draugr Zombie",
        weight: 1
      }])
    }, {
      localX: 5,
      localY: 3,
      localZ: 2,
      mobTypeDistribution: new WeightedDistribution([{
        value: "Draugr Zombie",
        weight: 1
      }])
    }]
  },
  ruinStoneMedium11: {
    schematic: snowStructures.ruinStoneMedium11,
    groundingPoints: [{
      localX: 3,
      localZ: 7
    }, {
      localX: 3,
      localZ: 14
    }, {
      localX: 3,
      localZ: 21
    }],
    groundingRadius: 2,
    clearingRadiusSquared: 225,
    undergroundYInterval: null,
    yOffset: 0,
    transformationsEnabled: false,
    chestLocations: [{
      localX: 1,
      localY: 13,
      localZ: 23,
      qualityDistribution: new WeightedDistribution([{
        value: Rarity.UNCOMMON,
        weight: 1
      }, {
        value: Rarity.RARE,
        weight: 2
      }, {
        value: Rarity.EPIC,
        weight: 1
      }])
    }, {
      localX: 2,
      localY: 11,
      localZ: 14,
      qualityDistribution: new WeightedDistribution([{
        value: Rarity.UNCOMMON,
        weight: 1
      }, {
        value: Rarity.RARE,
        weight: 1
      }])
    }, {
      localX: 6,
      localY: 15,
      localZ: 14,
      qualityDistribution: new WeightedDistribution([{
        value: Rarity.UNCOMMON,
        weight: 1
      }, {
        value: Rarity.RARE,
        weight: 2
      }, {
        value: Rarity.EPIC,
        weight: 1
      }])
    }],
    spawnerBlockLocations: [{
      localX: 3,
      localY: 16,
      localZ: 15,
      mobTypeDistribution: new WeightedDistribution([{
        value: "Draugr Skeleton",
        weight: 1
      }])
    }, {
      localX: 4,
      localY: 1,
      localZ: 14,
      mobTypeDistribution: new WeightedDistribution([{
        value: "Cave Golem",
        weight: 1
      }])
    }]
  },
  ruinStoneLarge1: {
    schematic: snowStructures.ruinStoneLarge1,
    groundingPoints: [{
      localX: 6,
      localZ: 6
    }, {
      localX: 6,
      localZ: 19
    }, {
      localX: 19,
      localZ: 6
    }, {
      localX: 19,
      localZ: 19
    }],
    groundingRadius: 4,
    clearingRadiusSquared: 225,
    undergroundYInterval: null,
    yOffset: 0,
    transformationsEnabled: false,
    chestLocations: [{
      localX: 12,
      localY: 2,
      localZ: 12,
      qualityDistribution: new WeightedDistribution([{
        value: Rarity.COMMON,
        weight: 1
      }, {
        value: Rarity.UNCOMMON,
        weight: 2
      }, {
        value: Rarity.RARE,
        weight: 1
      }])
    }, {
      localX: 15,
      localY: 13,
      localZ: 11,
      qualityDistribution: new WeightedDistribution([{
        value: Rarity.UNCOMMON,
        weight: 1
      }, {
        value: Rarity.RARE,
        weight: 2
      }, {
        value: Rarity.EPIC,
        weight: 1
      }])
    }, {
      localX: 6,
      localY: 22,
      localZ: 19,
      qualityDistribution: new WeightedDistribution([{
        value: Rarity.RARE,
        weight: 1
      }, {
        value: Rarity.EPIC,
        weight: 2
      }, {
        value: Rarity.LEGENDARY,
        weight: 1
      }])
    }, {
      localX: 7,
      localY: 0,
      localZ: 18,
      qualityDistribution: new WeightedDistribution([{
        value: Rarity.RARE,
        weight: 1
      }, {
        value: Rarity.EPIC,
        weight: 1
      }])
    }],
    spawnerBlockLocations: [{
      localX: 8,
      localY: 22,
      localZ: 17,
      mobTypeDistribution: new WeightedDistribution([{
        value: "Draugr Skeleton",
        weight: 1
      }])
    }, {
      localX: 14,
      localY: 1,
      localZ: 8,
      mobTypeDistribution: new WeightedDistribution([{
        value: "Draugr Zombie",
        weight: 1
      }])
    }, {
      localX: 16,
      localY: 16,
      localZ: 14,
      mobTypeDistribution: new WeightedDistribution([{
        value: "Cave Golem",
        weight: 1
      }])
    }]
  },
  ruinStoneLarge2: {
    schematic: snowStructures.ruinStoneLarge2,
    groundingPoints: [{
      localX: 6,
      localZ: 7
    }, {
      localX: 4,
      localZ: 26
    }, {
      localX: 27,
      localZ: 31
    }, {
      localX: 26,
      localZ: 13
    }],
    groundingRadius: 4,
    clearingRadiusSquared: 361,
    undergroundYInterval: null,
    yOffset: 1,
    transformationsEnabled: false,
    chestLocations: [{
      localX: 20,
      localY: 7,
      localZ: 11,
      qualityDistribution: new WeightedDistribution([{
        value: Rarity.COMMON,
        weight: 1
      }, {
        value: Rarity.UNCOMMON,
        weight: 2
      }, {
        value: Rarity.RARE,
        weight: 1
      }])
    }, {
      localX: 5,
      localY: 13,
      localZ: 21,
      qualityDistribution: new WeightedDistribution([{
        value: Rarity.COMMON,
        weight: 1
      }, {
        value: Rarity.UNCOMMON,
        weight: 2
      }, {
        value: Rarity.RARE,
        weight: 1
      }])
    }, {
      localX: 27,
      localY: 22,
      localZ: 22,
      qualityDistribution: new WeightedDistribution([{
        value: Rarity.UNCOMMON,
        weight: 1
      }, {
        value: Rarity.RARE,
        weight: 2
      }, {
        value: Rarity.EPIC,
        weight: 1
      }])
    }, {
      localX: 4,
      localY: 23,
      localZ: 30,
      qualityDistribution: new WeightedDistribution([{
        value: Rarity.UNCOMMON,
        weight: 1
      }, {
        value: Rarity.RARE,
        weight: 2
      }, {
        value: Rarity.EPIC,
        weight: 1
      }])
    }, {
      localX: 18,
      localY: 2,
      localZ: 20,
      qualityDistribution: new WeightedDistribution([{
        value: Rarity.EPIC,
        weight: 1
      }, {
        value: Rarity.LEGENDARY,
        weight: 1
      }])
    }, {
      localX: 4,
      localY: 11,
      localZ: 26,
      qualityDistribution: new WeightedDistribution([{
        value: Rarity.RARE,
        weight: 1
      }, {
        value: Rarity.EPIC,
        weight: 1
      }])
    }],
    spawnerBlockLocations: [{
      localX: 4,
      localY: 25,
      localZ: 26,
      mobTypeDistribution: new WeightedDistribution([{
        value: "Draugr Skeleton",
        weight: 1
      }])
    }, {
      localX: 9,
      localY: 16,
      localZ: 24,
      mobTypeDistribution: new WeightedDistribution([{
        value: "Draugr Zombie",
        weight: 1
      }])
    }, {
      localX: 12,
      localY: 2,
      localZ: 26,
      mobTypeDistribution: new WeightedDistribution([{
        value: "Draugr Zombie",
        weight: 1
      }])
    }, {
      localX: 17,
      localY: 7,
      localZ: 8,
      mobTypeDistribution: new WeightedDistribution([{
        value: "Cave Golem",
        weight: 1
      }])
    }]
  },
  ruinStoneLarge3: {
    schematic: snowStructures.ruinStoneLarge3,
    groundingPoints: [{
      localX: 18,
      localZ: 8
    }, {
      localX: 18,
      localZ: 20
    }, {
      localX: 18,
      localZ: 31
    }, {
      localX: 6,
      localZ: 20
    }, {
      localX: 30,
      localZ: 20
    }],
    groundingRadius: 4,
    clearingRadiusSquared: 361,
    undergroundYInterval: null,
    yOffset: 1,
    transformationsEnabled: false,
    chestLocations: [{
      localX: 18,
      localY: 2,
      localZ: 14,
      qualityDistribution: new WeightedDistribution([{
        value: Rarity.COMMON,
        weight: 1
      }, {
        value: Rarity.UNCOMMON,
        weight: 1
      }])
    }, {
      localX: 16,
      localY: 24,
      localZ: 31,
      qualityDistribution: new WeightedDistribution([{
        value: Rarity.EPIC,
        weight: 1
      }, {
        value: Rarity.LEGENDARY,
        weight: 1
      }])
    }, {
      localX: 19,
      localY: 13,
      localZ: 5,
      qualityDistribution: new WeightedDistribution([{
        value: Rarity.UNCOMMON,
        weight: 1
      }, {
        value: Rarity.RARE,
        weight: 2
      }, {
        value: Rarity.EPIC,
        weight: 1
      }])
    }, {
      localX: 4,
      localY: 15,
      localZ: 20,
      qualityDistribution: new WeightedDistribution([{
        value: Rarity.UNCOMMON,
        weight: 1
      }, {
        value: Rarity.RARE,
        weight: 2
      }, {
        value: Rarity.EPIC,
        weight: 1
      }])
    }, {
      localX: 18,
      localY: 1,
      localZ: 22,
      qualityDistribution: new WeightedDistribution([{
        value: Rarity.UNCOMMON,
        weight: 1
      }, {
        value: Rarity.RARE,
        weight: 2
      }, {
        value: Rarity.EPIC,
        weight: 1
      }])
    }, {
      localX: 32,
      localY: 2,
      localZ: 23,
      qualityDistribution: new WeightedDistribution([{
        value: Rarity.UNCOMMON,
        weight: 1
      }, {
        value: Rarity.RARE,
        weight: 2
      }, {
        value: Rarity.EPIC,
        weight: 1
      }])
    }],
    spawnerBlockLocations: [{
      localX: 17,
      localY: 2,
      localZ: 13,
      mobTypeDistribution: new WeightedDistribution([{
        value: "Draugr Zombie",
        weight: 1
      }])
    }, {
      localX: 18,
      localY: 2,
      localZ: 30,
      mobTypeDistribution: new WeightedDistribution([{
        value: "Draugr Zombie",
        weight: 1
      }])
    }, {
      localX: 18,
      localY: 15,
      localZ: 15,
      mobTypeDistribution: new WeightedDistribution([{
        value: "Draugr Skeleton",
        weight: 1
      }])
    }, {
      localX: 18,
      localY: 15,
      localZ: 25,
      mobTypeDistribution: new WeightedDistribution([{
        value: "Draugr Skeleton",
        weight: 1
      }])
    }, {
      localX: 20,
      localY: 24,
      localZ: 31,
      mobTypeDistribution: new WeightedDistribution([{
        value: "Draugr Skeleton",
        weight: 1
      }])
    }]
  },
  dungeonDraugrSmall1: {
    schematic: dungeonStructures.dungeonDraugrSmall1,
    groundingPoints: "centre",
    groundingRadius: 4,
    clearingRadiusSquared: 0,
    undergroundYInterval: {
      minY: -15,
      maxY: -97
    },
    yOffset: -2,
    transformationsEnabled: true,
    chestLocations: [{
      localX: 7,
      localY: 1,
      localZ: 1,
      qualityDistribution: new WeightedDistribution([{
        value: Rarity.COMMON,
        weight: 1
      }, {
        value: Rarity.UNCOMMON,
        weight: 2
      }, {
        value: Rarity.RARE,
        weight: 1
      }])
    }],
    spawnerBlockLocations: [{
      localX: 5,
      localY: 1,
      localZ: 5,
      mobTypeDistribution: new WeightedDistribution([{
        value: "Draugr Zombie",
        weight: 2
      }, {
        value: "Draugr Skeleton",
        weight: 2
      }, {
        value: "Cave Golem",
        weight: 1
      }, {
        value: "Draugr Huntress",
        weight: 1
      }])
    }]
  },
  dungeonDraugrMedium1: {
    schematic: dungeonStructures.dungeonDraugrMedium1,
    groundingPoints: [{
      localX: 2,
      localZ: 2
    }, {
      localX: 2,
      localZ: 24
    }, {
      localX: 24,
      localZ: 2
    }, {
      localX: 24,
      localZ: 24
    }, {
      localX: 13,
      localZ: 13
    }],
    groundingRadius: 2,
    clearingRadiusSquared: 0,
    undergroundYInterval: {
      minY: -40,
      maxY: -97
    },
    yOffset: -2,
    transformationsEnabled: true,
    chestLocations: [{
      localX: 6,
      localY: 1,
      localZ: 8,
      qualityDistribution: new WeightedDistribution([{
        value: Rarity.UNCOMMON,
        weight: 1
      }, {
        value: Rarity.RARE,
        weight: 2
      }, {
        value: Rarity.EPIC,
        weight: 1
      }])
    }, {
      localX: 20,
      localY: 1,
      localZ: 18,
      qualityDistribution: new WeightedDistribution([{
        value: Rarity.UNCOMMON,
        weight: 1
      }, {
        value: Rarity.RARE,
        weight: 2
      }, {
        value: Rarity.EPIC,
        weight: 1
      }])
    }],
    spawnerBlockLocations: [{
      localX: 13,
      localY: 1,
      localZ: 13,
      mobTypeDistribution: new WeightedDistribution([{
        value: "Cave Golem",
        weight: 2
      }, {
        value: "Draugr Huntress",
        weight: 2
      }, {
        value: "Draugr Zombie",
        weight: 1
      }, {
        value: "Draugr Skeleton",
        weight: 1
      }])
    }]
  },
  dungeonDraugrLarge1: {
    schematic: dungeonStructures.dungeonDraugrLarge1,
    groundingPoints: [{
      localX: 2,
      localZ: 2
    }, {
      localX: 2,
      localZ: 37
    }, {
      localX: 18,
      localZ: 2
    }, {
      localX: 18,
      localZ: 37
    }, {
      localX: 10,
      localZ: 20
    }],
    groundingRadius: 2,
    clearingRadiusSquared: 0,
    undergroundYInterval: {
      minY: -60,
      maxY: -95
    },
    yOffset: -4,
    transformationsEnabled: true,
    chestLocations: [{
      localX: 1,
      localY: 4,
      localZ: 30,
      qualityDistribution: new WeightedDistribution([{
        value: Rarity.RARE,
        weight: 2
      }, {
        value: Rarity.EPIC,
        weight: 1
      }, {
        value: Rarity.LEGENDARY,
        weight: 1
      }])
    }, {
      localX: 10,
      localY: 4,
      localZ: 1,
      qualityDistribution: new WeightedDistribution([{
        value: Rarity.RARE,
        weight: 2
      }, {
        value: Rarity.EPIC,
        weight: 1
      }, {
        value: Rarity.LEGENDARY,
        weight: 1
      }])
    }, {
      localX: 19,
      localY: 4,
      localZ: 9,
      qualityDistribution: new WeightedDistribution([{
        value: Rarity.UNCOMMON,
        weight: 1
      }, {
        value: Rarity.RARE,
        weight: 2
      }, {
        value: Rarity.EPIC,
        weight: 1
      }])
    }, {
      localX: 10,
      localY: 4,
      localZ: 38,
      qualityDistribution: new WeightedDistribution([{
        value: Rarity.UNCOMMON,
        weight: 1
      }, {
        value: Rarity.RARE,
        weight: 2
      }, {
        value: Rarity.EPIC,
        weight: 1
      }])
    }],
    spawnerBlockLocations: [{
      localX: 10,
      localY: 4,
      localZ: 9,
      mobTypeDistribution: new WeightedDistribution([{
        value: "Draugr Zombie",
        weight: 2
      }, {
        value: "Draugr Skeleton",
        weight: 2
      }, {
        value: "Cave Golem",
        weight: 1
      }, {
        value: "Draugr Huntress",
        weight: 1
      }])
    }, {
      localX: 10,
      localY: 4,
      localZ: 30,
      mobTypeDistribution: new WeightedDistribution([{
        value: "Cave Golem",
        weight: 2
      }, {
        value: "Draugr Huntress",
        weight: 2
      }, {
        value: "Draugr Zombie",
        weight: 1
      }, {
        value: "Draugr Skeleton",
        weight: 1
      }])
    }]
  },
  dungeonMagmaLarge1: {
    schematic: dungeonStructures.dungeonMagmaLarge1,
    groundingPoints: [{
      localX: 2,
      localZ: 2
    }, {
      localX: 2,
      localZ: 37
    }, {
      localX: 37,
      localZ: 2
    }, {
      localX: 37,
      localZ: 37
    }, {
      localX: 20,
      localZ: 20
    }],
    groundingRadius: 2,
    clearingRadiusSquared: 0,
    undergroundYInterval: {
      minY: -70,
      maxY: -95
    },
    yOffset: -4,
    transformationsEnabled: true,
    chestLocations: [{
      localX: 6,
      localY: 6,
      localZ: 32,
      qualityDistribution: new WeightedDistribution([{
        value: Rarity.UNCOMMON,
        weight: 1
      }, {
        value: Rarity.RARE,
        weight: 1
      }])
    }, {
      localX: 33,
      localY: 6,
      localZ: 7,
      qualityDistribution: new WeightedDistribution([{
        value: Rarity.UNCOMMON,
        weight: 1
      }, {
        value: Rarity.RARE,
        weight: 1
      }])
    }, {
      localX: 19,
      localY: 6,
      localZ: 20,
      qualityDistribution: new WeightedDistribution([{
        value: Rarity.EPIC,
        weight: 2
      }, {
        value: Rarity.LEGENDARY,
        weight: 1
      }])
    }, {
      localX: 20,
      localY: 6,
      localZ: 18,
      qualityDistribution: new WeightedDistribution([{
        value: Rarity.EPIC,
        weight: 2
      }, {
        value: Rarity.LEGENDARY,
        weight: 1
      }])
    }],
    spawnerBlockLocations: [{
      localX: 12,
      localY: 6,
      localZ: 12,
      mobTypeDistribution: new WeightedDistribution([{
        value: "Magma Golem",
        weight: 1
      }])
    }, {
      localX: 12,
      localY: 6,
      localZ: 27,
      mobTypeDistribution: new WeightedDistribution([{
        value: "Magma Golem",
        weight: 1
      }])
    }, {
      localX: 27,
      localY: 6,
      localZ: 12,
      mobTypeDistribution: new WeightedDistribution([{
        value: "Magma Golem",
        weight: 1
      }])
    }, {
      localX: 27,
      localY: 6,
      localZ: 27,
      mobTypeDistribution: new WeightedDistribution([{
        value: "Magma Golem",
        weight: 1
      }])
    }]
  }
};