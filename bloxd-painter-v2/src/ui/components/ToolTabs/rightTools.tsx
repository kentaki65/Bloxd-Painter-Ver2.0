import { useState } from "react";
import TabButton from "../common/tabButton";
import type { RightTabTypes, TabProp } from "../common/types";

function BrushesTab({ name }: TabProp) {
  return (
    <>
      <div className="toolName2">{name}</div>
      <div className="columnWrap">
        <div className="toolContent">

        </div>
      </div>
    </>
  )
}

//もっと分割できそう
function OptionsTab({ name }: TabProp) {
  return (
    <>
      <div className="toolName2">{name}</div>
      <div className="columnWrap">
        <div className="toolContent">
          <div className="settingWrapper">
            <div className="setting-group">
              <label htmlFor="intensity">intensity:</label>
              <input type="range" id="intensity" min="0.025" max="0.1" step="0.001" />
            </div>
            <div className="setting-group">
              <label htmlFor="atOrAboveEnabled">at or above:</label>
              <input type="checkbox" id="atOrAboveEnabled" />
              <input type="number" id="orAboveRangeInput" min="0" max="255" value="0" />
            </div>

            <div className="setting-group">
              <label htmlFor="atOrBelowEnabled">at or below:</label>
              <input type="checkbox" id="atOrBelowEnabled" />
              <input type="number" id="atOrBelowRangeInput" min="0" max="255" value="0" />
            </div>

            <div className="setting-group">
              <label htmlFor="slopeAboveInput">slope at or above (degrees):</label>
              <input type="checkbox" id="slopeAboveEnabled" />
              <input type="number" id="slopeAboveInput" min="0" max="90" value="0" />
            </div>

            <div className="setting-group">
              <label htmlFor="slopeBelowEnabled">slope at or below (degrees):</label>
              <input type="checkbox" id="slopeBelowEnabled" />
              <input type="number" id="slopeBelowInput" min="0" max="90" value="90" />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default function RightTools() {
  const [selectedTab, setTab] = useState<RightTabTypes>("brushes");
  const handleChangeTab = (newTab: RightTabTypes) => setTab(newTab);

  return (
    <div className="toolsColumn-right">
      <div className="toolBox">
        <div className="toolTabs">
          <TabButton
            name="brushes"
            isActive={selectedTab === "brushes"}
            onClick={() => handleChangeTab("brushes")}
          />
          <TabButton
            name="options"
            isActive={selectedTab === "options"}
            onClick={() => handleChangeTab("options")}
          />
        </div>
        <div className="toolColumn">
          {selectedTab === "brushes" && <BrushesTab name="brushes" />}
          {selectedTab === "options" && <OptionsTab name="options" />}
        </div>
      </div>
    </div>
  )
}