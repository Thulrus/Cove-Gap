export function ActivityLog({ state }) {
  const entries = state.activityLog.slice(-30).reverse();
  return (
    <section>
      <h2>Activity</h2>
      <ul className="activity-log">
        {entries.map((entry, i) => (
          <li key={i}>
            <span className="tag">[{entry.system}]</span> {entry.message}
          </li>
        ))}
        {entries.length === 0 && <li>Nothing has happened yet.</li>}
      </ul>
    </section>
  );
}
