import { useState } from "react";
import Modal from "./common/modal";
import type { WorldSettings } from "./common/types";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (settings: WorldSettings) => void;
}

interface InputFieldBase {
  name: string;
  id: string;
}

interface InputTextField extends InputFieldBase {
  type: "text";
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
}

interface InputNumberField extends InputFieldBase {
  type: "number";
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
}

type InputFields = InputTextField | InputNumberField;

function InputField(props: InputFields) {
  if (props.type === "text") {
    return (
      <div className="field">
        <label htmlFor={props.id}>{props.name}</label>
        <input
          type="text"
          id={props.id}
          value={props.value}
          placeholder={props.placeholder}
          onChange={(e) => props.onChange(e.target.value)}
        />
      </div>
    )
  }

  return (
    <div className="field">
      <label htmlFor={props.id}>{props.name}</label>
      <input
        type="number"
        id={props.id}
        value={props.value}
        min={props.min}
        max={props.max}
        onChange={(e) => props.onChange(Number(e.target.value))}
      />
    </div>
  )
}

export default function CreateWorldModal({ isOpen, onClose, onConfirm }: ModalProps) {
  const [settings, setSettings] = useState<WorldSettings>({
    fileName: "schem",
    seed: "1",
    chunkX: 4,
    chunkZ: 4,
    chunkY: 64,
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="modalTitle">Create World</div>

      <InputField
        type="text"
        name="File name"
        id="newFileName"
        onChange={(newValue) => setSettings(prev => ({ ...prev, fileName: newValue }))}
        value={settings.fileName}
        placeholder="File name"
      />
      
      <InputField
        type="text"
        name="LobbyName(seed)"
        id="seedInput"
        onChange={(newValue) => setSettings(prev => ({ ...prev, seed: newValue }))}
        value={settings.seed}
        placeholder="1"
      />

      <InputField
        type="number"
        name="Width (chunks)"
        id="newChunkX"
        onChange={(newValue) => setSettings(prev => ({ ...prev, chunkX: newValue }))}
        value={settings.chunkX}
        min={1} max={24}
      />

      <InputField
        type="number"
        name="depth (chunks)"
        id="newChunkZ"
        onChange={(newValue) => setSettings(prev => ({ ...prev, chunkZ: newValue }))}
        value={settings.chunkZ}
        min={1} max={24}
      />

      <InputField
        type="number"
        name="height (chunks)"
        id="newChunkY"
        onChange={(newValue) => setSettings(prev => ({ ...prev, chunkY: newValue }))}
        value={settings.chunkY}
        min={64} max={128}
      />

      <div className="modalButtons">
        <button type="button" onClick={() => onConfirm(settings)}>Create</button>
        <button type="button" onClick={onClose}>Cancel</button>
      </div>
    </Modal>
  )
}