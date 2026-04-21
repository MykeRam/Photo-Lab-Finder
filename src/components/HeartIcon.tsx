type HeartIconProps = {
  className?: string;
  filled?: boolean;
};

export function HeartIcon({ className, filled = true }: HeartIconProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke={filled ? "none" : "currentColor"}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.8}
      focusable="false"
    >
      <path d="M12 20.35 10.67 19.13C5.4 14.35 2 11.26 2 7.65 2 4.82 4.24 2.5 7.05 2.5c1.58 0 3.1.73 3.95 1.92.85-1.19 2.37-1.92 3.95-1.92 2.81 0 5.05 2.32 5.05 5.15 0 3.61-3.4 6.7-8.67 11.48L12 20.35z" />
    </svg>
  );
}
