type BaseInputProps =
  | {
      type: "text"
      id: string
      value: string
      onChange: (value: string) => void
      placeholder?: string;
      disabled?: boolean;
    }
  | {
      type: "number"
      id: string
      value: number
      onChange: (value: number) => void
      min?: number
      max?: number
      disabled?: boolean;
    }
  | {
      type: "checkbox"
      id: string
      checked: boolean
      onChange: (checked: boolean) => void
      disabled?: boolean
    }

export default function BaseInput(props: BaseInputProps) {
  switch (props.type) {
    case "text":
      return (
        <input
          id={props.id}
          type="text"
          value={props.value}
          disabled={props.disabled}
          placeholder={props.placeholder}
          onChange={(e) => props.onChange(e.target.value)}
        />
      )

    case "number":
      return (
        <input
          id={props.id}
          type="number"
          value={props.value}
          disabled={props.disabled}
          min={props.min}
          max={props.max}
          onChange={(e) => props.onChange(Number(e.target.value))}
        />
      )

    case "checkbox":
      return (
        <input
          id={props.id}
          type="checkbox"
          disabled={props.disabled}
          checked={props.checked}
          onChange={(e) => props.onChange(e.target.checked)}
        />
      )
  }
}