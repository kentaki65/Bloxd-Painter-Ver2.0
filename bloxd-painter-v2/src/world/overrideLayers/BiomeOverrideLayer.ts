import type { BiomeId } from "../../core/types";

export class BiomeOverrideLayer {
  // key: "x,z", value: biomeId
  private map = new Map<string, number>();

  private key(x: number, z: number): string {
    return `${x},${z}`;
  }

  set(x: number, z: number, biomeId: BiomeId): void {
    this.map.set(this.key(x, z), biomeId);
  }

  get(x: number, z: number): number | undefined {
    return this.map.get(this.key(x, z));
  }

  clear(x: number, z: number): void {
    this.map.delete(this.key(x, z));
  }

  has(x: number, z: number): boolean {
    return this.map.has(this.key(x, z));
  }
}