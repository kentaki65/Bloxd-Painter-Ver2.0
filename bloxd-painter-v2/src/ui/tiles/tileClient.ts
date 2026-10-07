// tileClient.ts
import type { WorldRect } from "../../core/types";
import type { WorkerResponse } from "../../world/worker/Worker";
import { TileCache } from "./tileCache";
import { buildPalettes, type BiomePalette } from "./tileColor";
import { createTileImage } from "./tileImage";
import { getTileRange, buildTileRequest } from "./viewport";

export class TileClient {
  readonly cache = new TileCache();

  private worker: Worker;
  private onTile: () => void;
  private ready = false;
  private requestId = 0;
  private lastSignature = "";
  private pending: { rect: WorldRect; step: number } | null = null;
  private palettes: BiomePalette[] = []

  constructor(seed: string, maxHeight: number, onTile: () => void) {
    this.onTile = onTile;
    this.worker = new Worker(new URL("../../world/worker/Worker.ts", import.meta.url), {
      type: "module",
    });
    this.worker.onmessage = (e: MessageEvent<WorkerResponse>) => this.handle(e.data);
    this.worker.onerror = (e) => console.error("worker error", e);
    this.worker.postMessage({ type: "init", seed, maxHeight });
  }

  update(rect: WorldRect, step: number): void {
    if (!this.ready) {
      this.pending = { rect, step };
      return;
    }
    const r = getTileRange(rect, step);
    const signature = `${r.step},${r.txMin},${r.txMax},${r.tzMin},${r.tzMax}`;
    if (signature === this.lastSignature) return;
    this.lastSignature = signature;

    const tiles = buildTileRequest(rect, step, this.cache);
    this.requestId++;
    this.worker.postMessage({ type: "tileRequest", requestId: this.requestId, tiles });
  }

  dispose(): void {
    this.worker.terminate();
  }

  private handle(res: WorkerResponse): void {
    switch (res.type) {
      case "initReady": {
        this.ready = true;
        this.palettes = buildPalettes(res.biomeSurfaces);

        if (this.pending) {
          const p = this.pending;
          this.pending = null;
          this.update(p.rect, p.step);
        }
        break;
      }
      case "tile": {
        const image = createTileImage(res, this.palettes);
        this.cache.set(res.step, res.tx, res.tz, {
          ground: res.ground,
          water: res.water,
          biomeId: res.biomeId,
          image: image,
        });
        this.onTile();
        break;
      }
      case "error": {
        console.error(res.message, res.requestId);
        break;
      }
    }
  }
}