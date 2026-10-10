import { useRef, useState } from "react";

import MenuBar from "./components/menuBar";
import UnderBar from "./components/undetbar";
import Viewer from "./components/viewer";
import CreateWorldModal from "./components/overlayModal";
import SettingModal from "./components/settingModal";

import { type BiomeId, BRUSH_RADIUS } from "../core/types";
import type { ToolId, } from "./components/common/types";
import { DEFAULT_SETTINGS, type RenderSettings } from "./tiles/renderSettings";

//renderSettingをappで管理する

export function App() {
  const [settings, setSettings] = useState<RenderSettings>(DEFAULT_SETTINGS);

  const [brushMode, setBrushMode] = useState<ToolId>("height");
  const [biomeType, setBiomeType] = useState<BiomeId>(6);

  const [isCreateWorldModalOpen, setCreateWorldModalOpen] = useState(false);
  const [isSettingModalOpen, setSettingModalOpen] = useState(true);

  return (
    <div className="screen">
      <MenuBar onOpenCreateWorld={() => setCreateWorldModalOpen(true)} onOpenRenderSetting={() => setSettingModalOpen(true)}/>
    
      <Viewer
        renderSettings={settings}
        onChangeBiome={(newBiome) => {}} 
        onChangeBrush={(newTool) => {}}
        selectedTool={brushMode}
        selectedBiome={biomeType}
      />

      <UnderBar location={[1, 2, 3]} height={2} slope={2} biome={biomeType} radius={BRUSH_RADIUS} zoom={20} />

      <CreateWorldModal
        isOpen={isCreateWorldModalOpen}
        onConfirm={() => {
          setCreateWorldModalOpen(false)
        }}
        onClose={() => setCreateWorldModalOpen(false)}
      />

      <SettingModal 
        isOpen={isSettingModalOpen} 
        onClose={() => setSettingModalOpen(false)} 
        onUpdate={(newSetting) => {
          setSettings(newSetting);
        }} 
      />
    </div>
  )
}