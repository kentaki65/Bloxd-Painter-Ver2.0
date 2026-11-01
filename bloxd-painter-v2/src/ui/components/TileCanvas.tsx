// TileCanvas.tsx
import { useEffect, useRef } from "react";
import { chooseStep, getVisibleWorldRect, screenToWorld, type Camera } from "../tiles/viewport";
import { drawTiles } from "../tiles/drawTiles";
import { TileClient } from "../tiles/tileClient";
import type { RenderSettings } from "../tiles/renderSettings";
import type { BrushFilter, BrushOp } from "../../world/worker/brushOps";
import type { ExportInfoResponse } from "../../world/worker/export/exportSchem";

export interface TileCanvasApi {
  undo: () => void;
  redo: () => void;
  exportInfo: () => Promise<ExportInfoResponse>;
  exportChunks: TileClient["exportChunks"];
}

export interface BrushState {
  kind: "biome" | "height" | "flatten" | "smooth" | "none";
  radius: number;
  biomeId: number;
  intensity: number;
  filter: BrushFilter;
}

const HEIGHT_PER_INTENSITY = 40; // raise/lower: 1回あたり、中心で intensity×40 ブロック
const BLEND_PER_INTENSITY = 10;  // flatten/smooth: 1回あたり、混ぜる割合 intensity×10(最大1)
const TICK_MS = 50;

const MIN_RADIUS = 1;
const MAX_RADIUS = 100; // 大きいと重くなるので、調整してください

const MARGIN = 64; // 2チャンクぶん
const MIN_ZOOM = 0.05;
const MAX_ZOOM = 5;

function resolveOp(b: BrushState, button: number, shift: boolean): { op: BrushOp; amount: number; value: number } | null {
  switch (b.kind) {
    case "biome":
      return button === 2
        ? { op: "biomeReset", amount: 0, value: 0 }
        : { op: "biome", amount: 0, value: b.biomeId };
    case "height":
      if (button === 0 && shift) return { op: "resetHeight", amount: 0, value: 0 };
      return { op: button === 2 ? "lower" : "raise", amount: b.intensity * HEIGHT_PER_INTENSITY, value: 0 };
    case "flatten":
    case "smooth":
      if (button !== 0) return null;
      return { op: b.kind, amount: Math.min(1, b.intensity * BLEND_PER_INTENSITY), value: 0 };
    default:
      return null;
  }
}

const idempotent = (op: BrushOp) => op === "biome" || op === "biomeReset" || op === "resetHeight" || op === "set";

export function TileCanvas(
  { renderSetting, brush, apiRef, onRadiusChange }:
    { renderSetting: RenderSettings, brush: BrushState, apiRef: React.MutableRefObject<TileCanvasApi | null>, onRadiusChange?: (radius: number) => void }) {
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
      if (!mouse || b.kind === "none") return;
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

    const tryHistory = (kind: "undo" | "redo") => {
      if (painting || client.busy) return;
      if (kind === "undo") client.undo();
      else client.redo();
    };

    if (apiRef) {
      apiRef.current = {
        undo: () => tryHistory("undo"),
        redo: () => tryHistory("redo"),
        exportInfo: () => client.exportInfo(),
        exportChunks: (o, p) => client.exportChunks(o, p),
      };
    }

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
    let cur: { op: BrushOp; amount: number; value: number } | null = null;
    let strokeId = 0;
    let lastStamp: { x: number; z: number } | null = null;
    let lastTick = 0;
    let rafBrush = 0;

    const tick = () => {
      const b = brushRef.current;
      if (!painting || !cur || !mouse || b.kind === "none") return;

      const here = screenToWorld(camera, mouse.px, mouse.py);
      const stamps: { x: number; z: number }[] = [];
      if (!lastStamp) {
        stamps.push(here);
      } else {
        const dx = here.x - lastStamp.x;
        const dz = here.z - lastStamp.z;
        if (dx === 0 && dz === 0) {
          if (!idempotent(cur.op)) stamps.push(here); // 止めて押し続けると、繰り返し効く
        } else {
          const n = Math.max(1, Math.ceil(Math.hypot(dx, dz) / Math.max(1, b.radius / 2)));
          for (let i = 1; i <= n; i++) {
            stamps.push({ x: Math.round(lastStamp.x + (dx * i) / n), z: Math.round(lastStamp.z + (dz * i) / n) });
          }
        }
      }
      if (stamps.length === 0) return;
      lastStamp = here;

      let x0 = Infinity, x1 = -Infinity, z0 = Infinity, z1 = -Infinity;
      for (const s of stamps) {
        if (s.x < x0) x0 = s.x;
        if (s.x > x1) x1 = s.x;
        if (s.z < z0) z0 = s.z;
        if (s.z > z1) z1 = s.z;
      }
      const r = b.radius;
      client.brush(
        { op: cur.op, stamps, radius: r, amount: cur.amount, value: cur.value, filter: b.filter },
        { x0: x0 - r, x1: x1 + r + 1, z0: z0 - r, z1: z1 + r + 1 },
        strokeId,
      );
    };

    const brushLoop = (now: number) => {
      if (!painting) return;
      rafBrush = requestAnimationFrame(brushLoop);
      if (now - lastTick < TICK_MS || client.busy) return; // 前の編集が終わるまで待つ
      lastTick = now;
      tick();
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
        return;
      }
      if ((e.button === 0 || e.button === 2) && brushRef.current.kind !== "none") {
        const op = resolveOp(brushRef.current, e.button, e.shiftKey);
        if (!op) return;
        const { px, py } = toCanvas(e);
        mouse = { px, py };
        painting = true;
        cur = op;
        lastStamp = null;
        strokeId = client.beginStroke();
        canvas.setPointerCapture(e.pointerId);
        tick();
        lastTick = performance.now();
        rafBrush = requestAnimationFrame(brushLoop);
      }
    };

    const onPointerUp = () => {
      const was = painting;
      if (was) tick(); // 最後の位置まで当てる
      dragging = false;
      painting = false;
      cur = null;
      lastStamp = null;
      cancelAnimationFrame(rafBrush);
      if (was) client.refreshStale();
    };

    const onContextMenu = (e: Event) => e.preventDefault();

    const onPointerMove = (e: PointerEvent) => {
      const { px, py } = toCanvas(e);
      mouse = { px, py };

      if (dragging) {
        camera.camX += e.clientX - lastX;
        camera.camY += e.clientY - lastY;
        lastX = e.clientX;
        lastY = e.clientY;
        onCameraChanged();
      } else {
        schedule();
      }
    };

    const onPointerLeave = () => {
      mouse = null;
      schedule();
    };

    let wheelAcc = 0;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const { px, py } = toCanvas(e);

      if (e.ctrlKey) {
        const factor = e.deltaY < 0 ? 1.1 : 1 / 1.1;
        const next = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, camera.zoom * factor));
        const ratio = next / camera.zoom;
        camera.camX = px + (camera.camX - px) * ratio;
        camera.camY = py + (camera.camY - py) * ratio;
        camera.zoom = next;
        onCameraChanged();
        return;
      }

      // ホイールでブラシの大きさ
      const b = brushRef.current;
      if (b.kind === "none") return;
      wheelAcc += e.deltaY;
      if (Math.abs(wheelAcc) < 40) return;
      const dir = wheelAcc < 0 ? 1 : -1; // 上に回すと大きく
      wheelAcc = 0;
      const step = Math.max(1, Math.round(b.radius * 0.1)); // 大きいほど、刻みも大きく
      const next = Math.min(MAX_RADIUS, Math.max(MIN_RADIUS, b.radius + dir * step));
      if (next === b.radius) return;
      brushRef.current = { ...b, radius: next }; // 円をすぐ更新するため
      onRadiusRef.current?.(next);
      schedule();
    };

    canvas.addEventListener("contextmenu", onContextMenu)
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
      canvas.removeEventListener("contextmenu", onContextMenu);
      window.removeEventListener("keydown", onKeyDown);
      canvas.removeEventListener("wheel", onWheel);

      apiRef.current = null
      clientRef.current = null;
    };
  }, []);

  useEffect(() => {
    clientRef.current?.setRender(renderSetting);
  }, [renderSetting]);

  const onRadiusRef = useRef(onRadiusChange);
  useEffect(() => {
    onRadiusRef.current = onRadiusChange;
  }, [onRadiusChange]);

  useEffect(() => {
    brushRef.current = brush;
  }, [brush]);

  return (
    <canvas ref={canvasRef} width={800} height={600} style={{ touchAction: "none" }} />
  )
}