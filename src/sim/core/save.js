// Save/load: JSON -> base64 export string, with a version field and a
// migration hook now so future format changes don't need a rewrite later.

import { RUN_STATE_VERSION, META_STATE_VERSION, STARTING_WORKERS } from "./state.js";

function toBase64(str) {
  const bytes = new TextEncoder().encode(str);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function fromBase64(base64) {
  const binary = atob(base64);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function migrateRunState(data) {
  if (data.version === 1) {
    // v2 added the worker-placement layer: workers/facilities/construction/missions.
    data = {
      ...data,
      version: 2,
      workers: { total: STARTING_WORKERS, assignments: {} },
      builtFacilities: [],
      constructionQueue: [],
      activeMissions: [],
      nextMissionInstanceId: 1,
    };
  }
  if (data.version === 2) {
    // v3 added the doom/awareness system.
    data = { ...data, version: 3, doom: 0, peakDoom: 0 };
  }
  if (data.version === 3) {
    // v4 added lore/codex discovery tracking.
    data = { ...data, version: 4, discoveredLore: [] };
  }
  if (data.version === RUN_STATE_VERSION) return data;
  throw new Error(`Cannot load run save: unknown version "${data.version}"`);
}

function migrateMetaState(data) {
  if (data.version === META_STATE_VERSION) return data;
  throw new Error(`Cannot load meta save: unknown version "${data.version}"`);
}

export function exportRunState(state) {
  return toBase64(JSON.stringify(state));
}

export function importRunState(base64String) {
  const data = JSON.parse(fromBase64(base64String));
  return migrateRunState(data);
}

export function exportMetaState(state) {
  return toBase64(JSON.stringify(state));
}

export function importMetaState(base64String) {
  const data = JSON.parse(fromBase64(base64String));
  return migrateMetaState(data);
}

const RUN_STORAGE_KEY = "cove-gap:run";
const META_STORAGE_KEY = "cove-gap:meta";

export function saveRunToStorage(state) {
  localStorage.setItem(RUN_STORAGE_KEY, exportRunState(state));
}

export function loadRunFromStorage() {
  const raw = localStorage.getItem(RUN_STORAGE_KEY);
  return raw ? importRunState(raw) : null;
}

export function clearRunFromStorage() {
  localStorage.removeItem(RUN_STORAGE_KEY);
}

export function saveMetaToStorage(state) {
  localStorage.setItem(META_STORAGE_KEY, exportMetaState(state));
}

export function loadMetaFromStorage() {
  const raw = localStorage.getItem(META_STORAGE_KEY);
  return raw ? importMetaState(raw) : null;
}
