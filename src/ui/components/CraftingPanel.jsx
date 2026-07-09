function describeRefList(registry, type, refs) {
  return refs
    .map((ref) => {
      const count = ref.count ?? 1;
      const label = ref.id ? registry.getById(type, ref.id).name : `any "${ref.tag}"`;
      return `${count}x ${label}`;
    })
    .join(", ");
}

export function CraftingPanel({ state, registry, onCraft }) {
  return (
    <section>
      <h2>Crafting</h2>
      <ul>
        {registry.allOfType("recipe").map((recipe) => (
          <li key={recipe.id}>
            <strong>{recipe.name}</strong> ({describeRefList(registry, "item", recipe.inputs)} &rarr;{" "}
            {describeRefList(registry, "item", recipe.outputs)})
            <button type="button" onClick={() => onCraft(recipe.id)}>
              Craft
            </button>
          </li>
        ))}
      </ul>

      <h3>Crafting Queue</h3>
      <ul>
        {state.craftingQueue.map((job, i) => (
          <li key={i}>
            {registry.getById("recipe", job.recipeId).name} — {job.remainingTicks} tick(s) left
          </li>
        ))}
        {state.craftingQueue.length === 0 && <li>(idle)</li>}
      </ul>
    </section>
  );
}
