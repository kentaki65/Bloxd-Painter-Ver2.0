export class HeightOverrideLayer {
  private map = new Map<string, number>();

  private key(x: number, z: number): string {
    return `${x},${z}`;
  }

  set(x: number, z: number, height: number): void {
    this.map.set(this.key(x, z), height);
  }

  get(x: number, z: number): number | undefined {
    return this.map.get(this.key(x, z));
  }

  has(x: number, z: number): boolean {
    return this.map.has(this.key(x, z));
  }
}