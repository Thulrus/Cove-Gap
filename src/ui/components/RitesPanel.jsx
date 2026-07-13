function describeCost(registry, cost) {
  return cost.map((c) => `${c.amount}x ${registry.getById("resource", c.ref.id).name}`).join(", ");
}

export function RitesPanel({ registry, onPerformRite }) {
  return (
    <section className="panel">
      <h2>Rites</h2>
      {registry.allOfType("rite").map((rite) => (
        <div key={rite.id} className="recipe-row">
          <span>
            <strong>{rite.name}</strong> — {rite.description}
            <br />
            <em>{rite.misunderstanding}</em>
            <br />
            Cost: {describeCost(registry, rite.cost ?? [])}
          </span>
          <button type="button" className="primary" onClick={() => onPerformRite(rite.id)}>
            Perform
          </button>
        </div>
      ))}
      {registry.allOfType("rite").length === 0 && <p>(the Brotherhood has no rites recorded yet)</p>}
    </section>
  );
}
