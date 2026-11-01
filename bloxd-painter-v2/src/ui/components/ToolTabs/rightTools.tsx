import { useState } from "react";
import TabButton from "../common/tabButton";
import type { RightTabTypes, TabProp } from "../common/types";
import BaseInput from "../common/input";

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

function SettingRange(
  { name, id, min, max, step, value, onChange }:
    { name: string; id: string; min: number; max: number; step: number; value: number; onChange: (value: number) => void; }
) {
  return (
    <div className="setting-group">
      <label htmlFor={id}>{name}</label>
      <BaseInput
        type="range"
        id={id}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={onChange}
      />
    </div>
  );
}

function SettingToggleNumber(
  { name, id, min, max, value, onChange }:
    { name: string; id: string; min: number; max: number; value: RangeOption; onChange: (next: RangeOption) => void; }
) {
  return (
    <div className="setting-group">
      <label htmlFor={id}>
        <BaseInput
          type="checkbox"
          id={id}
          checked={value.enabled}
          onChange={(enabled) => onChange({ ...value, enabled })}
        />
        {name}
      </label>

      <BaseInput
        type="number"
        id={`${id}-value`}
        min={min}
        max={max}
        value={value.value}
        onChange={(nextValue) => onChange({ ...value, value: nextValue })}
      />
    </div>
  );
}

function OptionsTab({ name, options, onChange }: TabProp & { options: BrushOptions; onChange: (o: BrushOptions) => void }) {
  return (
    <>
      <div className="toolName">{name}</div>
      <div className="columnWrap">
        <div className="toolContent">
          <div className="settingWrapper">
            <SettingRange
              name="intensity" id="intensity"
              max={0.1} min={0.025} step={0.001}
              value={options.intensity}
              onChange={(newValue) => {
                onChange({
                  ...options,
                  intensity: newValue
                })
              }}
            />

            <SettingToggleNumber
              name="atOrAbove"
              id="atOrAbove"
              min={0} max={255} 
              value={options.atOrAbove}
              onChange={(newValue) => {
                onChange({
                  ...options,
                  atOrAbove: { ...newValue }
                })
              }}
            />

            <SettingToggleNumber
              name="atOrBelow"
              id="atOrBelow"
              min={0} max={255} value={options.atOrBelow}
              onChange={(newValue) => {
                onChange({
                  ...options,
                  atOrBelow: { ...newValue }
                })
              }}
            />

            <SettingToggleNumber
              name="slopeAbove"
              id="slopeAbove"
              min={0} max={90} value={options.slopeAbove}
              onChange={(newValue) => {
                onChange({
                  ...options,
                  slopeAbove: { ...newValue }
                })
              }}
            />

            <SettingToggleNumber
              name="slopeBelow"
              id="slopeBelow"
              min={0} max={90} value={options.slopeBelow}
              onChange={(newValue) => {
                onChange({
                  ...options,
                  slopeBelow: { ...newValue }
                })
              }}
            />
          </div>
        </div>
      </div>
    </>
  )
}

export default function RightTools({ options, onChange }: { options: BrushOptions; onChange: (o: BrushOptions) => void }) {
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
          {selectedTab === "options" && <OptionsTab name="options" options={options} onChange={onChange} />}
        </div>
      </div>
    </div>
  )
}