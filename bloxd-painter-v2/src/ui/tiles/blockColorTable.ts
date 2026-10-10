import type { RGB } from "./tileColor";
import { getColor } from "../../render/blockColors"; // tileColor.ts と同じ import に合わせてください

function parse(hex: string): RGB {
  // "transparent" などは、目立つマゼンタにする(見落とさないため)
  if (!/^#[0-9a-fA-F]{6}$/.test(hex)) return [255, 0, 255];
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ];
}

export class BlockColorTable {
  private cache = new Map<number, RGB>();

  get(id: number): RGB {
    let c = this.cache.get(id);
    if (!c) {
      c = parse(getColor(id));
      this.cache.set(id, c);
    }
    return c;
  }
}