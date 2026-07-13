import { describeDayPhase, sunArcProgress, moonArcProgress } from "../../sim/index.js";

// Renders the sun or moon sliding along an arc to show time of day, in place
// of a raw tick counter — the player sees "Day 14 — Dusk", never a tick number.
export function DayNightIndicator({ tick }) {
  const { label } = describeDayPhase(tick);
  const sunProgress = sunArcProgress(tick);
  const moonProgress = moonArcProgress(tick);
  const progress = sunProgress ?? moonProgress;
  const isNight = sunProgress === null;

  const angle = Math.PI * (1 - progress);
  const x = 50 - 46 * Math.cos(angle);
  const y = 54 - 46 * Math.sin(angle);

  return (
    <div className="day-night-indicator">
      <svg viewBox="0 0 100 60" className="day-night-arc" aria-hidden="true">
        <path d="M 4 54 A 46 46 0 0 1 96 54" />
        <circle cx={x} cy={y} r={isNight ? 4.5 : 6} className={isNight ? "moon" : "sun"} />
      </svg>
      <p className="dashboard-stat-value day-night-label">{label}</p>
    </div>
  );
}
