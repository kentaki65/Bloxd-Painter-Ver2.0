// tileClient.ts
import type { WorldRect } from "../../core/types";
import type { BiomeEdit, HeightEdit, TileMessage, TilePatchMessage, WorkerResponse } from "../../world/worker/Worker";
import { TileCache } from "./tileCache";
import { buildPalettes, type BiomePalette } from "./tileColor";
import { getTileRange, buildTileRequest, STEPS, tileWorldRect, rectsOverlap } from "./viewport";
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
  private palettes: BiomePalette[] = [];

  private editEpoch = 0;
  private pendingEdits: { epoch: number; rect: WorldRect }[] = [];
  private lastRect: WorldRect | null = null;
  private lastStep = 1;

  private rerender = new Map<string, { step: number; tx: number; tz: number }>();
  private needReissue = false;

  get busy(): boolean {
    return this.pendingEdits.length > 0;
  }

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
  private refreshNeighbor(step: number, tx: number, tz: number, bit: number, force: boolean) {
    if (!this.cache.has(step, tx, tz)) return;
    const t = this.cache.get(step, tx, tz)!;
    if (!force && !(t.missing & bit)) return;
    const r = renderTile(t, this.renderOpts(), this.neighborsOf(step, tx, tz), step, t.image);
    t.missing = r.missing;
    t.renderedVersion = this.render.version;
  }

  private onPatchArrived(p: TilePatchMessage) {
    if (!this.cache.has(p.step, p.tx, p.tz)) return;
    const t = this.cache.get(p.step, p.tx, p.tz)!;
    for (let i = 0; i < p.indices.length; i++) {
      const k = p.indices[i];
      t.ground[k] = p.ground[i];
      t.water[k] = p.water[i];
      t.biomeId[k] = p.biomeId[i];
      if (t.groundBlock) t.groundBlock[k] = p.groundBlock[i];
    }
    t.epoch = Math.max(t.epoch, p.epoch);

    for (const [dx, dz] of [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const tx = p.tx + dx, tz = p.tz + dz;
      this.rerender.set(`${p.step},${tx},${tz}`, { step: p.step, tx, tz });
    }
  }

  private onTileArrived(res: TileMessage) {
    const { step, tx, tz } = res;
    const replaced = this.cache.has(step, tx, tz);

    // 編集の前に作られたタイルが、編集のあとで届いたら、古い印を付ける
    let dirtyEpoch = 0;
    const tr = tileWorldRect(step, tx, tz);
    for (const e of this.pendingEdits) {
      if (e.epoch > res.epoch && rectsOverlap(e.rect, tr)) dirtyEpoch = Math.max(dirtyEpoch, e.epoch);
    }
    if (dirtyEpoch > 0) this.needReissue = true;

    const r = renderTile(res, this.renderOpts(), this.neighborsOf(step, tx, tz), step);
    this.cache.set(step, tx, tz, {
      ground: res.ground, water: res.water, biomeId: res.biomeId,
      groundBlock: res.groundBlock,
      image: r.image, missing: r.missing,
      renderedVersion: this.render.version,
      epoch: res.epoch, dirtyEpoch,
    });

    this.refreshNeighbor(step, tx + 1, tz, EDGE_W, replaced);
    this.refreshNeighbor(step, tx - 1, tz, EDGE_E, replaced);
    this.refreshNeighbor(step, tx, tz - 1, EDGE_S, replaced);
    this.refreshNeighbor(step, tx, tz + 1, EDGE_N, replaced);
  }

  // 範囲に重なる、キャッシュ済みのタイルに、古い印を付ける(捨てない。古い絵は出し続ける)
  private markDirty(rect: WorldRect, epoch: number) {
    const marked: { step: number; tx: number; tz: number }[] = [];
    for (const step of STEPS) {
      const r = getTileRange(rect, step);
      for (let tz = r.tzMin; tz <= r.tzMax; tz++) {
        for (let tx = r.txMin; tx <= r.txMax; tx++) {
          if (!this.cache.has(step, tx, tz)) continue;
          const t = this.cache.get(step, tx, tz)!;
          t.dirtyEpoch = Math.max(t.dirtyEpoch, epoch);
          marked.push({ step, tx, tz });
        }
      }
    }
    return marked;
  }

  private flushRerender() {
    for (const c of this.rerender.values()) this.refreshNeighbor(c.step, c.tx, c.tz, 0, true);
    this.rerender.clear();
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
      case "tilePatch": {
        this.onPatchArrived(res);
        break;
      }
      case "editApplied": {
        this.pendingEdits = this.pendingEdits.filter((e) => e.epoch > res.epoch);
        this.flushRerender();
        if (this.needReissue && this.pendingEdits.length === 0) {
          this.needReissue = false;
          this.lastSignature = "";
          if (this.lastRect) this.update(this.lastRect, this.lastStep);
        }
        this.onTile();
        break;
      }
      case "error": {
        console.error(res.message, res.requestId);
        break;
      }
    }
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

  edit(edits: { height?: HeightEdit[]; biome?: BiomeEdit[] }, rect: WorldRect) {
    if (!this.ready) return;
    const epoch = ++this.editEpoch;
    this.pendingEdits.push({ epoch, rect });
    const marked = this.markDirty(rect, epoch);
    const targets = marked.filter((t) => t.step === this.lastStep);
    this.worker.postMessage({
      type: "edit",
      epoch,
      height: edits.height ?? [],
      biome: edits.biome ?? [],
      rect,
      targets,
    });
  }

  update(rect: WorldRect, step: number): void {
    if (!this.ready) {
      this.pending = { rect, step };
      return;
    }
    this.lastRect = rect; this.lastStep = step;
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

  setBiomeAffectsHeight(value: boolean) {
    if (!this.ready) return;
    const epoch = ++this.editEpoch;
    // 全範囲が変わる編集として扱う(届いた古いタイルは、古い印が付く)
    this.pendingEdits.push({
      epoch,
      rect: { x0: -Infinity, x1: Infinity, z0: -Infinity, z1: Infinity },
    });
    this.cache.clear();
    this.worker.postMessage({ type: "setOptions", epoch, biomeAffectsHeight: value });
    this.lastSignature = "";
    if (this.lastRect) this.update(this.lastRect, this.lastStep);
    this.onTile();
  }
  
  refreshStale() {
    this.lastSignature = "";
    if (this.lastRect) this.update(this.lastRect, this.lastStep);
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
}