import { ItemAttributes } from "@/core/types.js";
import { mobNamePrefixDistribution } from "../../utils/randomValues.js";
import { SeededRandom } from "@/noise/SeededRandom.js";

export class MobNameGenerator {
  mobType: string;

  constructor(mobType: string) {
    this.mobType = mobType;
  }

  sample(random: SeededRandom): ItemAttributes{
    const prefix = mobNamePrefixDistribution.sample(random);
    const name = `${prefix} ${this.mobType}`;

    return {
      customDisplayName: name,
      customAttributes: {
        mobSettings: {
          name,
        },
      },
    };
  }
}