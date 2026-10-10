// tileClient.ts
import type { WorldRect } from "../../core/types";
import type { TileMessage, WorkerResponse } from "../../world/worker/Worker";
import { TileCache } from "./tileCache";
import { buildPalettes, type BiomePalette } from "./tileColor";
import { getTileRange, buildTileRequest } from "./viewport";
import { renderTile, EDGE_E, EDGE_W, EDGE_N, EDGE_S, type Neighbors, type RenderOptions } from "./tileImage";
import { RenderState, type RenderSettings } from "./renderSettings";
import { BlockColorTable } from "./blockColorTable";

export class TileClient {
  readonly cache = new TileCache();
  readonly render = new RenderState();
  private blockColors = new BlockColorTable();
  private surfaceIsWater: boolean[] = [];

  private worker: Worker;
  private onTile: () => void;
  private ready = false;
  private requestId = 0;
  private lastSignature = "";

  private pending: { rect: WorldRect; step: number } | null = null;
  private palettes: BiomePalette[] = []

  private renderOpts(): RenderOptions {
    return {
      palettes: this.palettes,
      blockColors: this.blockColors,
      surfaceIsWater: this.surfaceIsWater,
      settings: this.render.settings,
    };
  }

  private neighborsOf(step: number, tx: number, tz: number): Neighbors {
    const c = this.cache;
    return {
      east: c.has(step, tx + 1, tz) ? c.get(step, tx + 1, tz)!.ground : undefined,
      west: c.has(step, tx - 1, tz) ? c.get(step, tx - 1, tz)!.ground : undefined,
      north: c.has(step, tx, tz - 1) ? c.get(step, tx, tz - 1)!.ground : undefined,
      south: c.has(step, tx, tz + 1) ? c.get(step, tx, tz + 1)!.ground : undefined,
    };
  }

  // 新しいタイルが届いたことで、欠けていた端が埋まる隣を描き直す
  private refreshNeighbor(step: number, tx: number, tz: number, bit: number) {
    if (!this.cache.has(step, tx, tz)) return;
    const t = this.cache.get(step, tx, tz)!;
    if (!(t.missing & bit)) return;
    const r = renderTile(t, this.renderOpts(), this.neighborsOf(step, tx, tz), step, t.image);
    t.missing = r.missing;
    t.renderedVersion = this.render.version; // 追加
  }

  private onTileArrived(res: TileMessage) {
    const { step, tx, tz } = res;
    const r = renderTile(res, this.renderOpts(), this.neighborsOf(step, tx, tz), step); // palettes → renderOpts()
    this.cache.set(step, tx, tz, {
      ground: res.ground, water: res.water, biomeId: res.biomeId,
      groundBlock: res.groundBlock,               // 追加
      image: r.image, missing: r.missing,
      renderedVersion: this.render.version,       // 追加
    });

    // 隣から見て、新しいタイルがある方向のビット
    this.refreshNeighbor(step, tx + 1, tz, EDGE_W); // 東の隣にとって、西側が埋まった
    this.refreshNeighbor(step, tx - 1, tz, EDGE_E);
    this.refreshNeighbor(step, tx, tz - 1, EDGE_S);
    this.refreshNeighbor(step, tx, tz + 1, EDGE_N);
  }

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

  setRender(next: RenderSettings) {
    this.render.set(next);
    this.onTile(); // 再描画を予約
  }

  // 絵が古ければ、その場で描き直して返す
  getImage(step: number, tx: number, tz: number): OffscreenCanvas | null {
    if (!this.cache.has(step, tx, tz)) return null;
    const t = this.cache.get(step, tx, tz)!;
    if (t.renderedVersion !== this.render.version) {
      const r = renderTile(t, this.renderOpts(), this.neighborsOf(step, tx, tz), step, t.image);
      t.missing = r.missing;
      t.renderedVersion = this.render.version;
    }
    return t.image;
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
        this.onTileArrived(res);
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