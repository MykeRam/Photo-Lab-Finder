type HeartIconProps = {
  className?: string;
};

export function HeartIcon({ className }: HeartIconProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      focusable="false"
    >
      <path d="M12 21.35 10.55 20.03C5.4 15.37 2 12.28 2 8.5 2 5.41 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.41 22 8.5c0 3.78-3.4 6.87-8.55 11.53L12 21.35z" />
    </svg>
  );
}
