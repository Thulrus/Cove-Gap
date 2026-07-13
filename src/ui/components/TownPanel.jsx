export function TownPanel({ state, registry }) {
  const facilities = state.builtFacilities.map((id) => registry.getById("facility", id));
  const defenses = state.builtDefenses.map((id) => registry.getById("defense", id));
  const zones = state.discoveredZones.map((id) => registry.getById("zone", id));

  return (
    <section className="panel">
      <h2>Cove Gap</h2>
      <div className="town-grid">
        {facilities.map((f) => (
          <span key={f.id} className="town-tile" title={f.description}>
            🏚️ {f.name}
          </span>
        ))}
        {defenses.map((d) => (
          <span key={d.id} className="town-tile" title={d.description}>
            🛡️ {d.name}
          </span>
        ))}
        {zones.map((z) => (
          <span key={z.id} className="town-tile" title={z.description}>
            🌲 {z.name}
          </span>
        ))}
        {facilities.length === 0 && defenses.length === 0 && zones.length === 0 && <span>(just a fenced town square, so far)</span>}
      </div>
      <p className="dashboard-stat-label" style={{ marginTop: "var(--space-3)" }}>
        Seed: {state.seed}
      </p>
    </section>
  );
}
