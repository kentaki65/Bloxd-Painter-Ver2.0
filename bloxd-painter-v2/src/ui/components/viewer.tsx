import LeftTools from "./ToolTabs/leftTools";
import RightTools from "./ToolTabs/rightTools";
import type { ToolId } from "./common/types";
import { BRUSH_RADIUS, type BiomeId } from "../../core/types";
import { TileCanvas } from "./TileCanvas";
import type { RenderSettings } from "../tiles/renderSettings";

interface ViewerProps {
  selectedTool: ToolId;
  selectedBiome: BiomeId;

  renderSettings: RenderSettings;

  onChangeBiome: (newBiome: BiomeId) => void;
  onChangeBrush: (newTool: ToolId) => void;
}

export default function Viewer({ selectedTool, selectedBiome, renderSettings, onChangeBiome, onChangeBrush }: ViewerProps) {
  console.log(selectedTool)
  return (
    <div className="viewer">
      <LeftTools
        selectedTool={selectedTool}
        selectedBiome={selectedBiome}
        onChangeBiome={onChangeBiome}
        onChangeBrush={onChangeBrush}
      />
      <TileCanvas
        renderSetting={renderSettings}
        brush={{
          mode: selectedTool === "height" || selectedTool === "biome" ? selectedTool : "none",
          height: 15,
          biomeId: selectedBiome,
          radius: BRUSH_RADIUS,
        }}
      />
      <RightTools />
    </div>
  )
}