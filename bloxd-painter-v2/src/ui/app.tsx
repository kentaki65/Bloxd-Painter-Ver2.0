import { useRef, useState } from "react";

import MenuBar from "./components/menuBar";
import UnderBar from "./components/undetbar";
import Viewer from "./components/viewer";
import CreateWorldModal from "./components/modals/overlayModal";
import SettingModal from "./components/modals/settingModal";

import { type BiomeId, BRUSH_RADIUS } from "../core/types";
import type { ToolId, WorldSettings } from "./components/common/types";
import {
  DEFAULT_SETTINGS,
  type RenderSettings,
} from "./tiles/renderSettings";
import type { TileCanvasApi } from "./components/TileCanvas";
import { defaultBrushOptions, type BrushOptions } from "./components/brushOptions";
import { buildEncodedSchem, downloadSchems, writeEncodedSchem } from "../world/worker/export/exportSchem";
import { ExportModal } from "./components/modals/exportModal";

const CHUNK_Y_START = -2;

export function App() {
  const canvasApi = useRef<TileCanvasApi | null>(null);
  const worldInfo = useRef<WorldSettings>({
    fileName: "idk",
    seed: "vast_ridge_755876",
    chunkX: 10,
    chunkZ: 10,
    chunkY: 10,
  })

  const [settings, setSettings] = useState<RenderSettings>(DEFAULT_SETTINGS);

  const [brushMode, setBrushMode] = useState<ToolId>("height");
  const [brushOptions, setBrushOptions] = useState(defaultBrushOptions);
  const [brushRadius, setBrushRadius] = useState(BRUSH_RADIUS);

  const brushKind =
    brushMode === "biome" || brushMode === "height" || brushMode === "flatten" || brushMode === "smooth"
      ? brushMode
      : "none";

  const [biomeType, setBiomeType] = useState<BiomeId>(6);

  const [isCreateWorldModalOpen, setCreateWorldModalOpen] = useState(false);
  const [isSettingModalOpen, setSettingModalOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);

  const handleBrushOptionChange = (newValue: BrushOptions) => setBrushOptions(newValue);


  async function runExportFlow(
    name: string,
    margin: number,
    onProgress: (done: number, total: number) => void,
  ) {
    const api = canvasApi.current;
    if (!api) throw new Error("キャンバスが準備できていません");
    const chunks = await api.exportChunks(
      { margin, yChunkStart: CHUNK_Y_START, yChunkCount: worldInfo.current.chunkY },
      onProgress,
    );
    const json = buildEncodedSchem(name, chunks);
    if (!json) throw new Error("書き出す内容がありません(すべて空気でした)");
    const result = writeEncodedSchem(json);
    await downloadSchems(name, result);
    return result.offsets;
  }

  return (
    <div className="screen">
      <MenuBar
        onOpenCreateWorld={() => setCreateWorldModalOpen(true)}
        onOpenRenderSetting={() => setSettingModalOpen(true)}
        onOpenExport={() => setExportOpen(true)}
      />

      <Viewer
        renderSetting={settings}
        onChangeBiome={setBiomeType}
        onChangeBrush={setBrushMode}
        onChangeBrushOption={handleBrushOptionChange}
        onChangeRadius={setBrushRadius}
        brushRadius={brushRadius}
        brushOptions={brushOptions}
        selectedTool={brushKind}
        selectedBiome={biomeType}
        canvasApi={canvasApi}
      />

      <UnderBar
        location={[1, 2, 3]}
        height={2}
        slope={2}
        biome={biomeType}
        radius={brushRadius}
        zoom={20}
      />

      <CreateWorldModal
        isOpen={isCreateWorldModalOpen}
        onConfirm={() => setCreateWorldModalOpen(false)}
        onClose={() => setCreateWorldModalOpen(false)}
      />

      <SettingModal
        isOpen={isSettingModalOpen}
        onClose={() => setSettingModalOpen(false)}
        settings={settings}
        onChange={setSettings}
      />

      <ExportModal
        fetchInfo={() => canvasApi.current!.exportInfo()}
        yChunkStart={CHUNK_Y_START}
        yChunkCount={worldInfo.current.chunkY}
        defaultName="schem"
        onExport={runExportFlow}
        isOpen={exportOpen}
        onClose={() => setExportOpen(false)}
      />
      
    </div>
  );
}