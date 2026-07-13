import { formatDuration } from "../../sim/index.js";

export function OfflineSummaryBanner({ summary, onDismiss }) {
  if (!summary) return null;
  return (
    <section className="panel" style={{ marginBottom: "var(--space-4)" }}>
      <h2>While you were away…</h2>
      <p>{formatDuration(summary.ticksRun)} passed.</p>
      <ul className="activity-log" style={{ maxHeight: "40vh" }}>
        {summary.log.slice(-20).map((entry, i) => (
          <li key={i}>
            <span className="tag">[{entry.system}]</span> {entry.message}
          </li>
        ))}
      </ul>
      <button type="button" className="primary" onClick={onDismiss}>
        Dismiss
      </button>
    </section>
  );
}
