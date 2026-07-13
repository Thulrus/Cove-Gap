export function ProgressBar({ value, max, label, rightLabel, variant }) {
  const pct = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0;
  return (
    <div className="progress-bar">
      {(label || rightLabel) && (
        <div className="progress-bar-labels">
          <span>{label}</span>
          <span>{rightLabel}</span>
        </div>
      )}
      <div className="progress-bar-track">
        <div
          className={`progress-bar-fill${variant ? ` ${variant}` : ""}`}
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
        />
      </div>
    </div>
  );
}
