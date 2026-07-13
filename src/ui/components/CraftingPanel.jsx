import { ProgressBar } from "./ProgressBar.jsx";
import { ticksToHours } from "../../sim/index.js";

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
    <section className="panel">
      <h2>Crafting</h2>
      {registry.allOfType("recipe").map((recipe) => (
        <div key={recipe.id} className="recipe-row">
          <span>
            <strong>{recipe.name}</strong> ({describeRefList(registry, "item", recipe.inputs)} &rarr;{" "}
            {describeRefList(registry, "item", recipe.outputs)})
          </span>
          <button type="button" className="primary" onClick={() => onCraft(recipe.id)}>
            Craft
          </button>
        </div>
      ))}

      <h3>Crafting Queue</h3>
      {state.craftingQueue.map((job, i) => (
        <div key={i} className="job-row">
          <div className="job-row-label">
            <span>{registry.getById("recipe", job.recipeId).name}</span>
            <span>
              {ticksToHours(job.remainingTicks)} hour{ticksToHours(job.remainingTicks) === 1 ? "" : "s"} left
            </span>
          </div>
          <ProgressBar
            value={registry.getById("recipe", job.recipeId).craftTicks - job.remainingTicks}
            max={registry.getById("recipe", job.recipeId).craftTicks}
          />
        </div>
      ))}
      {state.craftingQueue.length === 0 && <p>(idle)</p>}
    </section>
  );
}
