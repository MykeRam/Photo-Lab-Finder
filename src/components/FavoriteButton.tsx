import { HeartIcon } from "./HeartIcon";
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
      aria-label={isFavorite ? savedLabel : defaultLabel}
      title={isFavorite ? savedLabel : defaultLabel}
    >
      <HeartIcon className="favorite-button__icon" filled={isFavorite} />
    </button>
  );
}
