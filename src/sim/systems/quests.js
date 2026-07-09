// Quest progression isn't one of the six enumerated tick systems (production,
// investigation, crafting, defense, events, combat) — it's a lightweight
// check run after them: a quest's own `requirements` gates when it becomes
// active, and each stage's `requirements` gates when that stage completes.
// New quests are pure data; nothing here references a specific quest id.

import { createLogEntry } from "../core/log.js";
import { evaluateRequirement } from "../content/requirements.js";
import { applyEffects } from "../content/effects.js";

export function runQuestSystem(state, registry) {
  const log = [];
  const ctx = { state, registry, system: "quests" };

  for (const quest of registry.allOfType("quest")) {
    if (state.completedQuests.includes(quest.id)) continue;

    let progress = state.activeQuests.find((q) => q.questId === quest.id);
    if (!progress) {
      if (!evaluateRequirement(quest.requirements, ctx)) continue;
      progress = { questId: quest.id, stageIndex: 0 };
      state.activeQuests.push(progress);
      log.push(createLogEntry("quests", "quest_started", `New quest: ${quest.name}.`, { questId: quest.id }));
    }

    const stage = quest.stages[progress.stageIndex];
    if (!evaluateRequirement(stage.requirements, ctx)) continue;

    if (stage.effects?.length) {
      log.push(...applyEffects(stage.effects, ctx));
    }
    log.push(
      createLogEntry("quests", "quest_stage_completed", `${quest.name}: ${stage.description}`, {
        questId: quest.id,
        stageId: stage.id,
      })
    );

    progress.stageIndex += 1;
    if (progress.stageIndex >= quest.stages.length) {
      state.activeQuests = state.activeQuests.filter((q) => q.questId !== quest.id);
      state.completedQuests.push(quest.id);
      log.push(createLogEntry("quests", "quest_completed", `Completed quest: ${quest.name}.`, { questId: quest.id }));
    }
  }

  return { log };
}
