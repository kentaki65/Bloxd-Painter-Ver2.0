import { PrefabFrequency } from "@/core/types.js";

export const ruinStonePrefabFrequencies: PrefabFrequency[] = [{
  prefabName: "ruinStoneSmall1",
  frequency: 0.15
}, {
  prefabName: "ruinStoneSmall2",
  frequency: 0.15
}, {
  prefabName: "ruinStoneSmall3",
  frequency: 0.15
}, {
  prefabName: "ruinStoneSmall4",
  frequency: 0.15
}, {
  prefabName: "ruinStoneMedium1",
  frequency: 0.15
}, {
  prefabName: "ruinStoneSmall5",
  frequency: 0.15
}, {
  prefabName: "ruinStoneSmall6",
  frequency: 0.15
}, {
  prefabName: "ruinStoneMedium2",
  frequency: 0.15
}, {
  prefabName: "ruinStoneMedium3",
  frequency: 0.15
}, {
  prefabName: "ruinStoneMedium4",
  frequency: 0.15
}, {
  prefabName: "ruinStoneMedium5",
  frequency: 0.15
}, {
  prefabName: "ruinStoneMedium6",
  frequency: 0.15
}, {
  prefabName: "ruinStoneMedium7",
  frequency: 0.15
}, {
  prefabName: "ruinStoneMedium8",
  frequency: 0.15
}, {
  prefabName: "ruinStoneMedium9",
  frequency: 0.15
}, {
  prefabName: "ruinStoneMedium10",
  frequency: 0.15
}, {
  prefabName: "ruinStoneMedium11",
  frequency: 0.15
}, {
  prefabName: "ruinStoneLarge1",
  frequency: 0.15
}, {
  prefabName: "ruinStoneLarge2",
  frequency: 0.15
}, {
  prefabName: "ruinStoneLarge3",
  frequency: 0.15
}];

export const mapleTreePrefabFrequencies: PrefabFrequency[] = [{
  prefabName: "treeMapleLarge1",
  frequency: 1
}, {
  prefabName: "treeMapleLarge2",
  frequency: 1.5
}];

export const dungeonPrefabFrequencies: PrefabFrequency[] = [{
  prefabName: "dungeonDraugrSmall1",
  frequency: 45
}, {
  prefabName: "dungeonDraugrMedium1",
  frequency: 10
}, {
  prefabName: "dungeonDraugrLarge1",
  frequency: 10
}, {
  prefabName: "dungeonMagmaLarge1",
  frequency: 25
}];

export const prefabGroupsFrequencies = {
  ruins: [{
    prefabName: "ruinStoneSmall1",
    frequency: 0.3
  }, {
    prefabName: "ruinStoneSmall2",
    frequency: 0.3
  }, {
    prefabName: "ruinStoneSmall3",
    frequency: 0.3
  }, {
    prefabName: "ruinStoneSmall4",
    frequency: 0.3
  }, {
    prefabName: "ruinStoneMedium1",
    frequency: 0.3
  }, {
    prefabName: "ruinStoneSmall5",
    frequency: 0.3
  }, {
    prefabName: "ruinStoneSmall6",
    frequency: 0.3
  }, {
    prefabName: "ruinStoneMedium2",
    frequency: 0.3
  }, {
    prefabName: "ruinStoneMedium3",
    frequency: 0.3
  }, {
    prefabName: "ruinStoneMedium4",
    frequency: 0.3
  }, {
    prefabName: "ruinStoneMedium5",
    frequency: 0.3
  }, {
    prefabName: "ruinStoneMedium6",
    frequency: 0.3
  }, {
    prefabName: "ruinStoneMedium7",
    frequency: 0.3
  }, {
    prefabName: "ruinStoneMedium8",
    frequency: 0.3
  }, {
    prefabName: "ruinStoneMedium9",
    frequency: 0.3
  }, {
    prefabName: "ruinStoneMedium10",
    frequency: 0.3
  }, {
    prefabName: "ruinStoneMedium11",
    frequency: 0.3
  }, {
    prefabName: "ruinStoneLarge1",
    frequency: 0.3
  }, {
    prefabName: "ruinStoneLarge2",
    frequency: 0.3
  }, {
    prefabName: "ruinStoneLarge3",
    frequency: 0.3
  }],
  trees: [{
    prefabName: "treeMapleLarge1",
    frequency: 2
  }, {
    prefabName: "treeMapleLarge2",
    frequency: 3
  }]
};

export const forestPrefabsFrequencies = {
  ruins: prefabGroupsFrequencies.ruins,
  trees: [
    { prefabName: "treePineLarge1", frequency: 5 },
    { prefabName: "treePineLarge2", frequency: 5 }
  ]
};