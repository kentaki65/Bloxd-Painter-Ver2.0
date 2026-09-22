//TI
export class SeededRandom {
  a: number;
  
  constructor(seed: string) {
    let hash = 2166136261;
    for (let i = 0; i < seed.length; i++) {
      hash = Math.imul(
        hash ^ seed.charCodeAt(i),
        16777619
      );
    }
    this.a = hash;
  }

  next(): number {
    let state = this.a += 1831565813;
    state = Math.imul(state ^ state >>> 15, state | 1);
    state ^= state + Math.imul(state ^ state >>> 7, state | 61);
    return ((state ^ state >>> 14) >>> 0) / 4294967296;
  }
}