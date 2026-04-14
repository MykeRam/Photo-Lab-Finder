import "./FavoriteButton.css";

type FavoriteButtonProps = {
  defaultLabel?: string;
  isFavorite: boolean;
  onClick: () => void;
  savedLabel?: string;
};

export function FavoriteButton({
  defaultLabel = "Save",
  isFavorite,
  onClick,
  savedLabel = "Saved",
}: FavoriteButtonProps) {
  return (
    <button
      type="button"
      className={isFavorite ? "favorite-button favorite-button--active" : "favorite-button"}
      onClick={onClick}
      aria-pressed={isFavorite}
    >
      {isFavorite ? savedLabel : defaultLabel}
    </button>
  );
}
