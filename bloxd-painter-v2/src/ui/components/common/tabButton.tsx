interface TabButtonProps {
  name: string;
  isActive: boolean;
  onClick: () => void;
}

export default function TabButton({ name, isActive, onClick }: TabButtonProps) {
  return (
    <div className={`tab ${isActive ? "active" : ""}`}>
      <button type="button" onClick={onClick}>{name}</button>
    </div>
  )
}
