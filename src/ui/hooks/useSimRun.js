// Bridges the sim to React. This is the only place in /src/ui that touches
// mutable sim state directly — components below only read the returned
// snapshot and call the dispatch functions.

import { useEffect, useReducer, useRef } from "react";
import { contentByType } from "../../content/index.js";
import {
  createRegistry,
  createInitialRunState,
  createInitialMetaState,
  tick,
  runOfflineCatchUp,
  exportRunState,
  importRunState,
  exportMetaState,
  importMetaState,
  saveRunToStorage,
  loadRunFromStorage,
  saveMetaToStorage,
  loadMetaFromStorage,
  resolveDeath,
  startCraft,
} from "../../sim/index.js";

const TICK_MS = 1000;

function makeSeed() {
  return typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `seed-${Date.now()}`;
}

export function useSimRun() {
  const registryRef = useRef(null);
  const stateRef = useRef(null);
  const metaRef = useRef(null);
  const offlineSummaryRef = useRef(null);
  const [, forceRender] = useReducer((c) => c + 1, 0);

  if (registryRef.current === null) {
    registryRef.current = createRegistry(contentByType);
    metaRef.current = loadMetaFromStorage() ?? createInitialMetaState();

    const savedRun = loadRunFromStorage();
    if (savedRun) {
      stateRef.current = savedRun;
      const { log, ticksRun } = runOfflineCatchUp(stateRef.current, registryRef.current, { tickMs: TICK_MS });
      if (ticksRun > 0) offlineSummaryRef.current = { ticksRun, log };
    } else {
      stateRef.current = createInitialRunState(makeSeed(), registryRef.current);
    }
  }

  useEffect(() => {
    const interval = setInterval(() => {
      if (!stateRef.current.alive) return;
      tick(stateRef.current, registryRef.current);
      saveRunToStorage(stateRef.current);
      forceRender();
    }, TICK_MS);
    return () => clearInterval(interval);
  }, []);

  function craft(recipeId) {
    startCraft(stateRef.current, registryRef.current, recipeId);
    saveRunToStorage(stateRef.current);
    forceRender();
  }

  function startNewRun(seed = makeSeed()) {
    const { metaState } = resolveDeath(stateRef.current, metaRef.current, stateRef.current.activityLog);
    metaRef.current = metaState;
    saveMetaToStorage(metaRef.current);
    stateRef.current = createInitialRunState(seed, registryRef.current);
    saveRunToStorage(stateRef.current);
    offlineSummaryRef.current = null;
    forceRender();
  }

  function dismissOfflineSummary() {
    offlineSummaryRef.current = null;
    forceRender();
  }

  function exportSave() {
    return { run: exportRunState(stateRef.current), meta: exportMetaState(metaRef.current) };
  }

  function importSave(runString, metaString) {
    stateRef.current = importRunState(runString);
    if (metaString) metaRef.current = importMetaState(metaString);
    saveRunToStorage(stateRef.current);
    saveMetaToStorage(metaRef.current);
    forceRender();
  }

  return {
    state: stateRef.current,
    meta: metaRef.current,
    registry: registryRef.current,
    offlineSummary: offlineSummaryRef.current,
    craft,
    startNewRun,
    dismissOfflineSummary,
    exportSave,
    importSave,
  };
}
