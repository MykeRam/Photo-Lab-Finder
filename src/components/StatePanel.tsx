type StatePanelProps = {
  body: string;
  title: string;
};

export function StatePanel({ body, title }: StatePanelProps) {
  return (
    <div className="state-panel">
      <div className="state-panel__content">
        <strong>{title}</strong>
        <p>{body}</p>
      </div>
    </div>
  );
}
