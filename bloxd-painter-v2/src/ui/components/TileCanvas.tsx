// TileCanvas.tsx
import { useEffect, useRef } from "react";
import { chooseStep, getVisibleWorldRect, type Camera } from "../tiles/viewport";
import { drawTiles } from "../tiles/drawTiles";
import { TileClient } from "../tiles/tileClient";
import type { RenderSettings } from "../tiles/renderSettings";

const MARGIN = 64; // 2チャンクぶん
const MIN_ZOOM = 0.05;
const MAX_ZOOM = 2;

export function TileCanvas({renderSetting}: {renderSetting: RenderSettings}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const clientRef = useRef<TileClient | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const camera: Camera = { camX: canvas.width, camY: 0, zoom: 1 };

    let scheduled = false;
    const schedule = () => {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(() => {
        scheduled = false;
        drawTiles(ctx, client, camera, canvas.width, canvas.height);
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

    // --- パン ---
    let dragging = false;
    let lastX = 0;
    let lastY = 0;

    const onPointerDown = (e: PointerEvent) => {
      if(e.button === 1){
        dragging = true;
        lastX = e.clientX;
        lastY = e.clientY;
        canvas.setPointerCapture(e.pointerId);        
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!dragging) return;
      camera.camX += e.clientX - lastX;
      camera.camY += e.clientY - lastY;
      lastX = e.clientX;
      lastY = e.clientY;
      onCameraChanged();
    };

    const onPointerUp = () => {
      dragging = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rectEl = canvas.getBoundingClientRect();
      const px = e.clientX - rectEl.left;
      const py = e.clientY - rectEl.top;

      if(e.ctrlKey){
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
    canvas.addEventListener("wheel", onWheel, { passive: false });

    onCameraChanged();

    return () => {
      client.dispose();
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("wheel", onWheel);
      clientRef.current = null;
    };
  }, []);

  useEffect(() => {
    clientRef.current?.setRender(renderSetting);
  }, [renderSetting]);
  
  return (
    <canvas ref={canvasRef} width={800} height={600} style={{ touchAction: "none" }} />
  )
}