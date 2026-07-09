export function OfflineSummaryBanner({ summary, onDismiss }) {
  if (!summary) return null;
  return (
    <section>
      <h2>While you were away…</h2>
      <p>{summary.ticksRun} tick(s) passed.</p>
      <ul className="activity-log">
        {summary.log.slice(-20).map((entry, i) => (
          <li key={i}>
            <span className="tag">[{entry.system}]</span> {entry.message}
          </li>
        ))}
      </ul>
      <button type="button" onClick={onDismiss}>
        Dismiss
      </button>
    </section>
  );
}
