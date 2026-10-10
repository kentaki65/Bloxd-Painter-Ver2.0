import { useState } from "react";
import Modal from "./common/modal";
import type { ModalProps } from "./common/types";
import type { RenderSettings } from "../tiles/renderSettings";
import BaseInput from "./common/input";

type SettingModalProps = Omit<ModalProps, "onConfirm"> & {
  onUpdate: (newSetting: RenderSettings) => void;
}

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

export default function SettingModal({ isOpen, onClose, onUpdate }: SettingModalProps) {
  const [renderSetting, setRenderSetting] = useState<RenderSettings>({
    mode: "biome",
    shading: true,
    contours: true,
    countorsOverride: {
      contourInterval: null,
      contorsIntervalOverride: false
    }
  })

  onUpdate(renderSetting);

  return isOpen && (
    <Modal isOpen={isOpen} onClose={onClose}>
      <CountorSetting
        isShow={renderSetting.contours}
        value={renderSetting.countorsOverride.contourInterval ?? 10}
        isOverride={renderSetting.countorsOverride.contorsIntervalOverride}
        onOverrideChange={(enabled) =>
          setRenderSetting(prev => ({
            ...prev,
            countorsOverride: {
              ...prev.countorsOverride,
              contorsIntervalOverride: enabled,
              contourInterval: enabled
                ? prev.countorsOverride.contourInterval ?? 10
                : prev.countorsOverride.contourInterval,
            },
          }))
        }
        onShow={() =>
          setRenderSetting(prev => ({
            ...prev,
            contours: !prev.contours,
          }))
        }
        onChange={(newValue) =>
          setRenderSetting(prev => ({
            ...prev,
            countorsOverride: {
              ...prev.countorsOverride,
              contourInterval: newValue,
            },
          }))
        }
      />

      <ShadowSetting
        isShow={renderSetting.shading}
        onShow={() => setRenderSetting(prev => ({ ...prev, shading: !prev.shading }))}
      />

      <div className="modalButtons">
        <button type="button" onClick={onClose}>Cancel</button>
      </div>
    </Modal>
  )
}