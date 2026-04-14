import "./LocationButton.css";

type LocationButtonProps = {
  active: boolean;
  disabled?: boolean;
  label: string;
  onClick: () => void;
};

export function LocationButton({ active, disabled = false, label, onClick }: LocationButtonProps) {
  return (
    <button
      type="button"
      className={active ? "location-button location-button--active" : "location-button"}
      onClick={onClick}
      disabled={disabled}
    >
      {label}
    </button>
  );
}
