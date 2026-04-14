import "./EmptyState.css";

type EmptyStateProps = {
  body: string;
  title: string;
};

export function EmptyState({ body, title }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <div className="empty-state__content">
        <strong>{title}</strong>
        <p>{body}</p>
      </div>
    </div>
  );
}
