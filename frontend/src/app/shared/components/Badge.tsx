type BadgeProps = {
  label: string;
  color: string;
};

export function Badge({ label, color }: BadgeProps) {
  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 10px',
      borderRadius: 20,
      fontSize: 12,
      fontWeight: 600,
      background: `${color}18`,
      color,
      border: `1px solid ${color}40`,
    }}>
      {label}
    </span>
  );
}
