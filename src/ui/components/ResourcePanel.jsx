export function ResourcePanel({ state, registry }) {
  const items = Object.entries(state.inventory);
  return (
    <section className="panel">
      <h2>Inventory</h2>
      <div className="town-grid">
        {items.map(([itemId, count]) => (
          <span key={itemId} className="town-tile">
            {registry.getById("item", itemId).name}: {count}
          </span>
        ))}
        {items.length === 0 && <span>(empty)</span>}
      </div>
    </section>
  );
}
