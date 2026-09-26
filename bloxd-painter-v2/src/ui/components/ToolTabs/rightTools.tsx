import { useState } from "react";
import TabButton from "../common/tabButton";
import type { RightTabTypes, TabProp } from "../common/types";

interface RangeOption {
  enabled: boolean;
  value: number;
}

interface BrushOptions {
  intensity: number;
  atOrAbove: RangeOption;
  atOrBelow: RangeOption;
  slopeAbove: RangeOption;
  slopeBelow: RangeOption;
}

function BrushesTab({ name }: TabProp) {
  return (
    <>
      <div className="toolName">{name}</div>
      <div className="columnWrap">
        <div className="toolContent">

        </div>
      </div>
    </>
  )
}

function SettingRange({ name, id, max, min, step, value, onChange }: {
  name: string, id: string, min: number, max: number, step: number, value: number, onChange: (value: number) => void
}) {
  return (
    <div className="setting-group">
      <label htmlFor={id}>{name}</label>
      <input
        type="range"
        id={id}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => { onChange(Number(e.target.value)) }}
      />
    </div>
  )
}

//name,id,min,max,value,onChange
function SettingToggleNumber({ name, id, min, max, value, onChange }: {
  name: string; id: string; min: number; max: number;
  value: RangeOption;
  onChange: (next: RangeOption) => void;
}) {
  return (
    <div className="setting-group">
      <label htmlFor={id}>{name}</label>
      <input
        type="checkbox"
        id={id}
        checked={value.enabled}
        onChange={(event) => onChange({ ...value, enabled: event.target.checked })}
      />
      <input
        type="number"
        min={min}
        max={max}
        value={value.value}
        onChange={(event) => onChange({ ...value, value: Number(event.target.value) })}
      />
    </div>
  )
}

//もっと分割できそう
function OptionsTab({ name }: TabProp) {
  const [brushOptions, setBrushOption] = useState<BrushOptions>({
    intensity: 0.025,
    atOrAbove: {
      enabled: false,
      value: 0
    },
    atOrBelow: {
      enabled: false,
      value: 255 //ワールドの最大高さ
    },
    slopeAbove: {
      enabled: false,
      value: 0,
    },
    slopeBelow: {
      enabled: false,
      value: 90
    }
  })
  return (
    <>
      <div className="toolName">{name}</div>
      <div className="columnWrap">
        <div className="toolContent">
          <div className="settingWrapper">
            <SettingRange
              name="intensity" id="intensity"
              max={0.1} min={0.025} step={0.001}
              value={brushOptions.intensity}
              onChange={(newValue) => {
                setBrushOption(prev => ({
                  ...prev,
                  intensity: newValue
                }))
              }}
            />

            <SettingToggleNumber
              name="atOrAbove"
              id="atOrAbove"
              min={0} max={255} value={brushOptions.atOrAbove}
              onChange={(newValue) => {
                setBrushOption(prev => ({
                  ...prev,
                  atOrAbove: { ...newValue }
                }))
              }}
            />

            <SettingToggleNumber
              name="atOrBelow"
              id="atOrBelow"
              min={0} max={255} value={brushOptions.atOrBelow}
              onChange={(newValue) => {
                setBrushOption(prev => ({
                  ...prev,
                  atOrBelow: { ...newValue }
                }))
              }}
            />

            <SettingToggleNumber
              name="slopeAbove"
              id="slopeAbove"
              min={0} max={255} value={brushOptions.slopeAbove}
              onChange={(newValue) => {
                setBrushOption(prev => ({
                  ...prev,
                  slopeAbove: { ...newValue }
                }))
              }}
            />

            <SettingToggleNumber
              name="slopeBelow"
              id="slopeBelow"
              min={0} max={255} value={brushOptions.slopeBelow}
              onChange={(newValue) => {
                setBrushOption(prev => ({
                  ...prev,
                  slopeBelow: { ...newValue }
                }))
              }}
            />
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