import type { ColorMode, RenderSettings } from "../../tiles/renderSettings";
import BaseInput from "../common/input";
import Modal from "../common/modal";
import type { ModalProps } from "../common/types";

type SettingModalProps = Omit<ModalProps, "onConfirm"> & {
  settings: RenderSettings;
  onChange: (next: RenderSettings) => void;
};

interface RenderSettingProp<T> {
  isShow: boolean; value?: T;
  onShow: () => void; onChange?: (newValue: T) => void;
}

interface ContourSettingProp extends RenderSettingProp<number> {
  isOverride: boolean;
  onOverrideChange: (enabled: boolean) => void;
}

function CountorSetting(
  { isShow, value, onShow, onChange: onChange, isOverride, onOverrideChange }: ContourSettingProp
) {
  return (
    <div className="settingContent">
      <div className="labelNameWrapper">
        <label htmlFor="switch_countor">
          <BaseInput
            type="checkbox"
            id="switch_countor"
            checked={isShow}
            onChange={onShow}
          />
          Countor Lines
        </label>
      </div>
      <div className="SettingContentWrapper">
        <label htmlFor="override_contour">
          <BaseInput
            type="checkbox"
            id="override_contour"
            checked={isOverride ?? false}
            onChange={onOverrideChange}
          />
          Custom interval
        </label>
        <div className={isOverride ? "" : "disabledInput"}>
          Separator:
          <span>
            <BaseInput
              type="number"
              id="countorDistance"
              min={0}
              value={value!}
              disabled={!isOverride}
              onChange={onChange!}
            />
          </span>
          . blocks
        </div>

      </div>
    </div>
  )
}

function ShadowSetting(
  { isShow, onShow }: RenderSettingProp<boolean>
) {
  return (
    <div className="settingContent">
      <div className="labelNameWrapper">
        <label htmlFor="switch_shadow">
          <BaseInput
            type="checkbox"
            id="switch_shadow"
            checked={isShow}
            onChange={onShow}
          />
          Shadow
        </label>
      </div>
    </div>
  )
}

function RenderTypeSetting(
  { isShow, onChange }: RenderSettingProp<ColorMode>
) {
  return (
    <div className="settingContent">
      <div className="labelNameWrapper">
        <label htmlFor="switch_rendertype">
          <BaseInput
            type="checkbox"
            id="switch_rendertype"
            checked={isShow}
            onChange={(enabled) =>
              onChange?.(enabled ? "block" : "biome")
            }
          />
          Block mode
        </label>
      </div>
    </div>
  );
}

function ModifyBiomeHeight(
  { isShow, onShow }: RenderSettingProp<boolean>
) {
  return (
    <div className="settingContent">
      <div className="labelNameWrapper">
        <label htmlFor="switch_preserve_terrain_height">
          <BaseInput
            type="checkbox"
            id="switch_preserve_terrain_height"
            checked={isShow}
            onChange={onShow}
          />
          Preserve Terrain Height
        </label>
      </div>
    </div>
  )

}

export default function SettingModal({ isOpen, onClose, settings, onChange }: SettingModalProps) {
  const update = (patch: Partial<RenderSettings>) => onChange({ ...settings, ...patch });
  const updateContour = (patch: Partial<RenderSettings["countorsOverride"]>) => update({ countorsOverride: { ...settings.countorsOverride, ...patch } });
  if (!isOpen) return null;

  const interval = settings.countorsOverride.countorsInterval;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <CountorSetting
        isShow={settings.contours}
        value={interval ?? 10}
        isOverride={settings.countorsOverride.countorsIntervalOverride}
        onShow={() => update({ contours: !settings.contours })}
        onOverrideChange={(enabled) =>
          updateContour({
            countorsIntervalOverride: enabled,
            countorsInterval: enabled ? (interval ?? 10) : interval,
          })
        }
        onChange={(newValue) => updateContour({ countorsInterval: newValue })}
      />

      <ShadowSetting
        isShow={settings.shading}
        onShow={() => update({ shading: !settings.shading })}
      />

      <RenderTypeSetting
        isShow={settings.mode === "block"}
        onShow={() => { }}
        onChange={(mode) => update({ mode })}
      />

      <ModifyBiomeHeight
        isShow={settings.modifyHeight}
        onShow={() => update({ modifyHeight: !settings.modifyHeight})}
      />
      
      <div className="modalButtons">
        <button type="button" onClick={onClose}>Close</button>
      </div>
    </Modal>
  );
}