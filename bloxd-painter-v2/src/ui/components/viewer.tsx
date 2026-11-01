import LeftTools from "./ToolTabs/leftTools";
import RightTools from "./ToolTabs/rightTools";
import type { ToolId } from "./common/types";
import type { BiomeId } from "../../core/types";
import { TileCanvas, type TileCanvasApi } from "./TileCanvas";
import type { RenderSettings } from "../tiles/renderSettings";
import type { BrushOptions } from "./brushOptions";

interface ViewerProps {
  selectedTool: ToolId;
  selectedBiome: BiomeId;

  renderSetting: RenderSettings;
  brushOptions: BrushOptions,
  brushRadius: number;

  onChangeBiome: (newBiome: BiomeId) => void;
  onChangeBrush: (newTool: ToolId) => void;
  onChangeBrushOption: (newOption: BrushOptions) => void;
  onChangeRadius: (newRadius: number) => void;

  canvasApi: React.MutableRefObject<TileCanvasApi | null>
}

export default function Viewer(
  { selectedTool, selectedBiome, renderSetting, brushOptions, brushRadius, canvasApi, onChangeBiome, onChangeBrush, onChangeBrushOption, onChangeRadius }: ViewerProps
) {
  return (
    <div className="viewer">
      <LeftTools
        selectedTool={selectedTool}
        selectedBiome={selectedBiome}
        onChangeBiome={onChangeBiome}
        onChangeBrush={onChangeBrush}
      />
      <TileCanvas
        renderSetting={renderSetting}
        onRadiusChange={onChangeRadius}
        apiRef={canvasApi}
        brush={{
          kind: selectedTool,
          radius: brushRadius,
          biomeId: selectedBiome,
          intensity: brushOptions.intensity,
          filter: {
            minHeight: brushOptions.atOrAbove.enabled ? brushOptions.atOrAbove.value : null,
            maxHeight: brushOptions.atOrBelow.enabled ? brushOptions.atOrBelow.value : null,
            minSlope: brushOptions.slopeAbove.enabled ? brushOptions.slopeAbove.value : null,
            maxSlope: brushOptions.slopeBelow.enabled ? brushOptions.slopeBelow.value : null,
          },
        }}
      />
      <RightTools options={brushOptions} onChange={onChangeBrushOption} />
    </div>
  )
}