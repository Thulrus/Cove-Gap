import { computeScore } from "../../sim/index.js";

export function DeathScreen({ state, onStartNewRun }) {
  const result = computeScore(state, state.activityLog);
  return (
    <section className="panel" style={{ maxWidth: 480, margin: "var(--space-6) auto", textAlign: "center" }}>
      <h1 style={{ color: "var(--color-danger)" }}>The town has fallen.</h1>
      <p>{result.summary}</p>
      <div className="town-grid" style={{ justifyContent: "center", margin: "var(--space-4) 0" }}>
        <span className="town-tile">Score: {result.score}</span>
        <span className="town-tile">Ticks survived: {result.breakdown.ticksSurvived}</span>
        <span className="town-tile">Zones discovered: {result.breakdown.zonesDiscovered}</span>
        <span className="town-tile">Quests completed: {result.breakdown.questsCompleted}</span>
      </div>
      <button type="button" className="primary" onClick={() => onStartNewRun()}>
        Start New Run
      </button>
    </section>
  );
}
