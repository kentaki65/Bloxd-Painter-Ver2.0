import React, { useRef, useEffect } from "react";
import { VoxelWorld } from "../../world/VoxelWorld";
import { renderTopDown, renderTopDownPartial } from "../../render/renderTop";
import { BRUSH_RADIUS, chunkSize, type CameraRef, type MouseRef } from "../../core/types";
import { canvasToWorldX, worldToCanvasX } from "../../core/utils";
import { expandRange, getTileRange } from "../tiles/viewport";
import type { WorldSettings } from "./common/types";

interface Props {
  world: VoxelWorld;
  worldInfo: WorldSettings;
  onPaint: (worldX: number, worldZ: number) => void;
}

function drawScreen(
  world: VoxelWorld,
  ctx: OffscreenCanvasRenderingContext2D,
  originX: number, originZ: number,
  width: number, height: number
) {
  renderTopDown(world, ctx, originX, originZ, width, height);
}

function drawScreenImagePartial(
  ctx: CanvasRenderingContext2D,
  offScreenCanvas: OffscreenCanvas,
  updateX: number, updateZ: number, updateWidth: number, updateHeight: number,
  camera: CameraRef
) {
  const canvasWidth = offScreenCanvas.width;
  const sourceX = worldToCanvasX(updateX + updateWidth - 1, 0, canvasWidth);
  const sourceY = updateZ;

  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(
    offScreenCanvas,
    sourceX, sourceY, updateWidth, updateHeight,
    sourceX * camera.zoom + camera.camX, sourceY * camera.zoom + camera.camY,
    updateWidth * camera.zoom, updateHeight * camera.zoom
  );
}

function redrawCanvas(
  canvasCtx: CanvasRenderingContext2D,
  offScreenCanvas: OffscreenCanvas,
  camera: CameraRef, mouse: MouseRef | null
) {
  canvasCtx.clearRect(0, 0, canvasCtx.canvas.width, canvasCtx.canvas.height);
  canvasCtx.imageSmoothingEnabled = false;
  canvasCtx.drawImage(
    offScreenCanvas,
    camera.camX, camera.camY,
    offScreenCanvas.width * camera.zoom, offScreenCanvas.height * camera.zoom
  );

  drawBrushPreview(canvasCtx, mouse, BRUSH_RADIUS * camera.zoom);
}

function drawBrushPreview(
  ctx: CanvasRenderingContext2D,
  mouseState: MouseRef | null, radius: number // 画面上の半径（ブラシ半径 × zoom）
) {
  if (mouseState) {
    const { x, y } = mouseState;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.stroke();
  }
}

//screenX = wx * zoom + camX;
//screenY = wy * zoom + camY;
//wx = (screenX - camX) / zoom;
//wy = (screenY - camY) / zoom;

export function MapCanvas({ world, worldInfo, onPaint }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const offscreenCanvas = useRef<OffscreenCanvas>(null);
  const isDragging = useRef(false);

  const cameraRef = useRef<CameraRef>({
    camX: 0,
    camY: 0,
    zoom: 1,
    panning: false,
    panStartX: 0,
    panStartY: 0,
  })

  const mouseRef = useRef<MouseRef | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const observer = new ResizeObserver(([entiry]) => {
      const { width, height } = entiry.contentRect;

      canvas.width = width | 0;
      canvas.height = height | 0;

      const canvasCtx = canvas.getContext("2d");
      if (!canvasCtx) return;

      const offScreenCanvas = new OffscreenCanvas(width, height);
      const offScreenCanvasCtx = offScreenCanvas.getContext("2d");
      if (!offScreenCanvasCtx) return;

      offscreenCanvas.current = offScreenCanvas;
      drawScreen(world, offScreenCanvasCtx, 0, 0, width, height);
      redrawCanvas(canvasCtx, offScreenCanvas, cameraRef.current, mouseRef.current)
    });
    observer.observe(canvas);
    return () => observer.disconnect()
  }, [])

  function handlePointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
    const button = e.button;
    if (button === 0) {
      isDragging.current = true;
      paintAt(e);
    }
    if (button === 1) {
      cameraRef.current.panning = true;
      cameraRef.current.panStartX = e.clientX;
      cameraRef.current.panStartY = e.clientY;
    }
  }

  function handlePointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current!;
    const canvasCtx = canvas.getContext("2d")!;
    const offCanvas = offscreenCanvas.current!;

    if (mouseRef.current) {
      const canvas = canvasRef.current!;
      const canvasCtx = canvas.getContext("2d");
      if (!canvasCtx) return;

      const rect = canvas.getBoundingClientRect();
      const canvasX = e.clientX - rect.left;
      const canvasY = e.clientY - rect.top;

      mouseRef.current.x = canvasX;
      mouseRef.current.y = canvasY;
    } else {
      mouseRef.current = {
        x: 0, y: 0
      }
    }

    if (isDragging.current) paintAt(e);

    if (cameraRef.current.panning) {
      const dx = e.clientX - cameraRef.current.panStartX;
      const dy = e.clientY - cameraRef.current.panStartY;

      cameraRef.current.camX += dx;
      cameraRef.current.camY += dy;

      cameraRef.current.panStartX = e.clientX;
      cameraRef.current.panStartY = e.clientY;

      if (offCanvas) {
        redrawCanvas(canvasCtx, offCanvas, cameraRef.current, mouseRef.current);
      }
    }

    redrawCanvas(canvasCtx, offCanvas, cameraRef.current, mouseRef.current);
  }

  function handlePointerUp(e: React.PointerEvent<HTMLCanvasElement>) {
    const button = e.button;
    if (button === 0) isDragging.current = false;
    if (button === 1 && cameraRef.current.panning) {
      cameraRef.current.panning = false;
    }
  }

  function handleWheel(e: React.WheelEvent<HTMLCanvasElement>) {
    if (e.shiftKey) {
      cameraRef.current.zoom += e.deltaY > 0 ? -0.1 : 0.1;
      cameraRef.current.zoom = Math.max(0.1, Math.min(4, cameraRef.current.zoom));
      const canvas = canvasRef.current!;
      const canvasCtx = canvas.getContext("2d")!;
      const offCanvas = offscreenCanvas.current!;

      const rect = { x0: -864, x1: 64, z0: -64, z1: 664 };
      for (const step of [1, 4, 16]) {
        const r = getTileRange(rect, step);
        console.log(step, r, expandRange(r).length);
      }

      if (offCanvas) {
        redrawCanvas(canvasCtx, offCanvas, cameraRef.current, mouseRef.current);
      }
    }
  }

  function paintAt(e: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current!;
    const canvasCtx = canvas.getContext("2d", { willReadFrequently: true });
    if (!canvasCtx) return;

    const rect = canvas.getBoundingClientRect();
    const canvasX = e.clientX - rect.left;
    const canvasY = e.clientY - rect.top;

    const rawCanvasX = Math.floor((canvasX - cameraRef.current.camX) / cameraRef.current.zoom);
    const worldZ = Math.floor((canvasY - cameraRef.current.camY) / cameraRef.current.zoom);
    const worldX = canvasToWorldX(rawCanvasX, 0, canvas.width);

    const worldWidth = worldInfo.chunkX * chunkSize;
    const worldHeight = worldInfo.chunkZ * chunkSize;

    if (worldX < 0 || worldX >= worldWidth || worldZ < 0 || worldZ >= worldHeight) {
      return;
    }

    onPaint(worldX, worldZ);

    const offCanvas = offscreenCanvas.current!;
    const offScreenCanvasCtx = offCanvas.getContext("2d")!;
    const margin = BRUSH_RADIUS + 2;

    renderTopDownPartial(world, offScreenCanvasCtx, 0, 0, worldX - margin, worldZ - margin, margin * 2, margin * 2);
    drawScreenImagePartial(canvasCtx, offCanvas, worldX - margin, worldZ - margin, margin * 2, margin * 2, cameraRef.current)
  }

  return (
    <canvas
      ref={canvasRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onWheel={handleWheel}
    />
  )
}