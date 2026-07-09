import { computeScore } from "../../sim/index.js";

export function DeathScreen({ state, onStartNewRun }) {
  const result = computeScore(state, state.activityLog);
  return (
    <section>
      <h1>The town has fallen.</h1>
      <p>{result.summary}</p>
      <ul>
        <li>Score: {result.score}</li>
        <li>Ticks survived: {result.breakdown.ticksSurvived}</li>
        <li>Zones discovered: {result.breakdown.zonesDiscovered}</li>
        <li>Quests completed: {result.breakdown.questsCompleted}</li>
      </ul>
      <button type="button" onClick={() => onStartNewRun()}>
        Start New Run
      </button>
    </section>
  );
}
