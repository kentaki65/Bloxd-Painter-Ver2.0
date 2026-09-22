//uH

export class CoordinateGeneratorCache<T> {
  generator: any;
  cache: Map<number, Map<number, T>>;

  constructor(generator: any) {
    this.generator = generator;
    this.cache = new Map();
  }

  getOrGenerate(x: number, y: number): T {
    let xCache = this.cache.get(x);

    if (xCache !== undefined) {
      const cached = xCache.get(y);

      if (cached !== undefined) {
        return cached;
      }
    } else {
      xCache = new Map();
      this.cache.set(x, xCache);
    }

    const result = this.generator.generate(x, y);
    xCache.set(y, result);
    return result;
  }
}