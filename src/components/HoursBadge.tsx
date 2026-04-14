import "./HoursBadge.css";

type HoursBadgeProps = {
  text: string;
};

export function HoursBadge({ text }: HoursBadgeProps) {
  return <span className="hours-badge">{text}</span>;
}
