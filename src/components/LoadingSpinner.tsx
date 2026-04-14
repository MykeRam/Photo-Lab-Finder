import "./LoadingSpinner.css";

type LoadingSpinnerProps = {
  label: string;
};

export function LoadingSpinner({ label }: LoadingSpinnerProps) {
  return (
    <div className="loading-spinner" role="status" aria-live="polite">
      <div className="loading-spinner__content">
        <div className="loading-spinner__ring" aria-hidden="true" />
        <p>{label}</p>
      </div>
    </div>
  );
}
