export function CodexPanel({ state, registry }) {
  const entries = state.discoveredLore.map((id) => registry.getById("lore", id));

  return (
    <section className="panel">
      <h2>Codex</h2>
      {entries.length === 0 && <p>(nothing recorded yet)</p>}
      {entries.map((entry) => (
        <div key={entry.id} style={{ marginBottom: "var(--space-3)" }}>
          <h3 style={{ marginBottom: "var(--space-1)" }}>{entry.name}</h3>
          <p>{entry.text}</p>
        </div>
      ))}
    </section>
  );
}
