import { productionRate } from "../lib/productionRate.js";
import { ProgressBar } from "./ProgressBar.jsx";
import { DayNightIndicator } from "./DayNightIndicator.jsx";
import { TICKS_PER_HOUR } from "../../sim/index.js";

export function DashboardStrip({ state, registry }) {
  const healthPct = state.town.health / state.town.maxHealth;
  const healthVariant = healthPct < 0.3 ? "danger" : healthPct < 0.6 ? "warn" : undefined;

  return (
    <div className="dashboard-strip">
      <div className="panel">
        <p className="dashboard-stat-label">Town Health</p>
        <ProgressBar
          value={state.town.health}
          max={state.town.maxHealth}
          rightLabel={`${state.town.health} / ${state.town.maxHealth}`}
          variant={healthVariant}
        />
      </div>

      <div className="panel">
        <p className="dashboard-stat-label">Defense</p>
        <p className="dashboard-stat-value">{state.town.defense}</p>
      </div>

      <div className="panel">
        <p className="dashboard-stat-label">Time</p>
        <DayNightIndicator tick={state.tick} />
      </div>

      <div className="panel">
        <p className="dashboard-stat-label">Resources</p>
        <div className="resource-ticker">
          {registry.allOfType("resource").map((resource) => {
            const rate = productionRate(state, registry, resource.id);
            const hourlyRate = Math.round(rate * TICKS_PER_HOUR * 100) / 100;
            const amount = Math.floor((state.resources[resource.id] ?? 0) * 100) / 100;
            return (
              <span key={resource.id} className="resource-ticker-item">
                {resource.name}: {amount}
                {hourlyRate !== 0 && (
                  <span className={`resource-ticker-rate ${hourlyRate > 0 ? "positive" : "negative"}`}>
                    {" "}
                    ({hourlyRate > 0 ? "+" : ""}
                    {hourlyRate}/hr)
                  </span>
                )}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
