// TileCanvas.tsx
import { useEffect, useRef } from "react";
import { chooseStep, getVisibleWorldRect, screenToWorld, type Camera } from "../tiles/viewport";
import { drawTiles } from "../tiles/drawTiles";
import { TileClient } from "../tiles/tileClient";
import type { RenderSettings } from "../tiles/renderSettings";
import type { BiomeEdit, HeightEdit } from "../../world/worker/Worker";

export interface TileCanvasApi {
  undo: () => void;
  redo: () => void;
}

export interface BrushState {
  mode: "height" | "biome" | "none";
  height: number;
  biomeId: number;
  radius: number;
}

const MARGIN = 64; // 2チャンクぶん
const MIN_ZOOM = 0.05;
const MAX_ZOOM = 2;

export function TileCanvas({ renderSetting, brush, apiRef }: { renderSetting: RenderSettings, brush: BrushState, apiRef: React.MutableRefObject<TileCanvasApi | null> }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const clientRef = useRef<TileClient | null>(null);
  const brushRef = useRef(brush);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const camera: Camera = { camX: canvas.width, camY: 0, zoom: 1 };
    let mouse: { px: number; py: number } | null = null;

    const drawCursor = () => {
      const b = brushRef.current;
      if (!mouse || b.mode === "none") return;
      const { x, z } = screenToWorld(camera, mouse.px, mouse.py);
      const cx = camera.camX - (x + 0.5) * camera.zoom;
      const cy = camera.camY + (z + 0.5) * camera.zoom;
      const r = (b.radius + 0.5) * camera.zoom;
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.lineWidth = 3;
      ctx.strokeStyle = "rgba(0,0,0,0.5)";
      ctx.stroke();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = "rgba(255,255,255,0.95)";
      ctx.stroke();
      ctx.restore();
    };

    const toCanvas = (e: { clientX: number; clientY: number }) => {
      const r = canvas.getBoundingClientRect();
      return {
        px: (e.clientX - r.left) * (canvas.width / r.width),
        py: (e.clientY - r.top) * (canvas.height / r.height),
      };
    };

    let scheduled = false;
    const schedule = () => {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(() => {
        scheduled = false;
        drawTiles(ctx, client, camera, canvas.width, canvas.height);
        drawCursor();
      });
    };

    //vast_ridge_755876
    const client = new TileClient("ケンタキの建築鯖1", 5, schedule);
    clientRef.current = client;

    client.setRender(renderSetting);

    // カメラが動いたら、必ずこれを呼ぶ
    const onCameraChanged = () => {
      const rect = getVisibleWorldRect(camera, canvas.width, canvas.height, MARGIN);
      client.update(rect, chooseStep(camera.zoom));
      schedule();
    };

    let strokeId = 0;

    const tryHistory = (kind: "undo" | "redo") => {
      // 塗っている最中や、送信待ちがあるときは、効かせない
      if (painting || queue.length > 0 || client.busy) return;
      if (kind === "undo") client.undo();
      else client.redo();
    };

    if (apiRef) apiRef.current = { undo: () => tryHistory("undo"), redo: () => tryHistory("redo") };

    const onKeyDown = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
      if (!(e.ctrlKey || e.metaKey)) return;
      const k = e.key.toLowerCase();
      const isUndo = k === "z" && !e.shiftKey;
      const isRedo = (k === "z" && e.shiftKey) || k === "y";
      if (!isUndo && !isRedo) return;
      e.preventDefault();
      tryHistory(isUndo ? "undo" : "redo");
    };

    // --- ブラシ ---
    let painting = false;
    let erase = false;
    let last: { x: number; z: number } | null = null;
    const queue: { x: number; z: number }[] = [];
    const painted = new Set<number>(); // このストロークで、送り済みの列
    let flushScheduled = false;

    const keyOf = (x: number, z: number) => (x + 1048576) * 2097152 + (z + 1048576);

    const flushQueue = () => {
      const b = brushRef.current;
      if (queue.length === 0 || b.mode === "none") {
        queue.length = 0;
        flushScheduled = false;
        return;
      }
      // 前の編集が終わるまで待つ(溜まった分は、まとめて送る)
      if (client.busy) {
        requestAnimationFrame(flushQueue);
        return;
      }
      flushScheduled = false;

      const r = b.radius;
      const r2 = r * r;

      const value = erase ? null : b.mode === "height" ? b.height : b.biomeId;
      const height: HeightEdit[] = [];
      const biome: BiomeEdit[] = [];

      let x0 = Infinity, x1 = -Infinity, z0 = Infinity, z1 = -Infinity;

      for (const s of queue) {
        for (let dz = -r; dz <= r; dz++) {
          for (let dx = -r; dx <= r; dx++) {
            if (dx * dx + dz * dz > r2) continue;
            const px = s.x + dx;
            const pz = s.z + dz;
            const key = keyOf(px, pz);
            if (painted.has(key)) continue;
            painted.add(key);
            (b.mode === "height" ? height : biome).push({ x: px, z: pz, value });
            if (px < x0) x0 = px;
            if (px > x1) x1 = px;
            if (pz < z0) z0 = pz;
            if (pz > z1) z1 = pz;
          }
        }
      }
      queue.length = 0;
      if (height.length === 0 && biome.length === 0) return;
      client.edit({ height, biome }, { x0, x1: x1 + 1, z0, z1: z1 + 1 }, strokeId);
    };

    // 前の位置から今の位置まで、隙間なく円を並べる
    const enqueueStroke = (x: number, z: number) => {
      const b = brushRef.current;
      if (last) {
        const dx = x - last.x;
        const dz = z - last.z;
        const n = Math.max(1, Math.ceil(Math.hypot(dx, dz) / Math.max(1, b.radius / 2)));
        for (let i = 1; i <= n; i++) {
          queue.push({ x: Math.round(last.x + (dx * i) / n), z: Math.round(last.z + (dz * i) / n) });
        }
      } else {
        queue.push({ x, z });
      }
      last = { x, z };
      if (!flushScheduled) {
        flushScheduled = true;
        requestAnimationFrame(flushQueue);
      }
    };

    // --- パン ---
    let dragging = false;
    let lastX = 0;
    let lastY = 0;

    const onPointerDown = (e: PointerEvent) => {
      if (e.button === 1) {
        dragging = true;
        lastX = e.clientX;
        lastY = e.clientY;
        canvas.setPointerCapture(e.pointerId);
      } else if (e.button === 0 && brushRef.current.mode !== "none") {
        const { px, py } = toCanvas(e);
        const { x, z } = screenToWorld(camera, px, py);
        painting = true;
        erase = e.shiftKey;
        last = null;
        painted.clear();
        strokeId = client.beginStroke();
        canvas.setPointerCapture(e.pointerId);
        enqueueStroke(x, z);
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      const { px, py } = toCanvas(e);
      mouse = { px, py };
      if (painting) {
        const { x, z } = screenToWorld(camera, px, py);
        enqueueStroke(x, z);
      }
      if (dragging) {
        camera.camX += e.clientX - lastX;
        camera.camY += e.clientY - lastY;
        lastX = e.clientX;
        lastY = e.clientY;
        onCameraChanged();
      } else {
        schedule(); // 円の位置を更新
      }
    };

    const onPointerUp = () => {
      const wasPainting = painting;
      dragging = false;
      painting = false;
      last = null;
      if (wasPainting) client.refreshStale(); // 見えていない段階のタイルを、作り直す
    };

    const onPointerLeave = () => {
      mouse = null;
      schedule();
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rectEl = canvas.getBoundingClientRect();
      const px = e.clientX - rectEl.left;
      const py = e.clientY - rectEl.top;

      if (e.ctrlKey) {
        const factor = e.deltaY < 0 ? 1.1 : 1 / 1.1;
        const next = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, camera.zoom * factor));
        const ratio = next / camera.zoom;

        camera.camX = px + (camera.camX - px) * ratio;
        camera.camY = py + (camera.camY - py) * ratio;
        camera.zoom = next;
        onCameraChanged();
      }
    };

    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("pointerleave", onPointerLeave)
    window.addEventListener("keydown", onKeyDown);
    canvas.addEventListener("wheel", onWheel, { passive: false });

    onCameraChanged();

    const observer = new ResizeObserver(([entiry]) => {
      const { width, height } = entiry.contentRect;

      canvas.width = width | 0;
      canvas.height = height | 0;
      onCameraChanged();
    });

    observer.observe(canvas);

    return () => {
      client.dispose();
      observer.disconnect()
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointerleave", onPointerLeave);
      window.removeEventListener("keydown", onKeyDown);
      canvas.removeEventListener("wheel", onWheel);

      apiRef.current = null
      clientRef.current = null;
    };
  }, []);

  useEffect(() => {
    clientRef.current?.setRender(renderSetting);
  }, [renderSetting]);


  useEffect(() => {
    brushRef.current = brush;
  }, [brush]);

  return (
    <canvas ref={canvasRef} width={800} height={600} style={{ touchAction: "none" }} />
  )
}