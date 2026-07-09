// Loader/registry: validates every entity against the schema at load time
// (fail loud on malformed content), then indexes by id and by tag so systems
// and the requirement/effect evaluators can look entities up cheaply.

import { validateEntity } from "./schema.js";

export class ContentRegistry {
  constructor() {
    this.byType = new Map(); // type -> Map(id -> entity)
    this.tagIndex = new Map(); // type -> Map(tag -> Set(id))
  }

  load(type, entries) {
    if (!this.byType.has(type)) {
      this.byType.set(type, new Map());
      this.tagIndex.set(type, new Map());
    }
    const idMap = this.byType.get(type);
    const tagMap = this.tagIndex.get(type);

    entries.forEach((entry, i) => {
      validateEntity(entry, `content/${type}[${i}]`);
      if (entry.type !== type) {
        throw new Error(
          `content/${type}[${i}] (${entry.id}): declares type "${entry.type}" but was registered under "${type}"`
        );
      }
      if (idMap.has(entry.id)) {
        throw new Error(`Duplicate ${type} id "${entry.id}"`);
      }
      idMap.set(entry.id, entry);
      for (const tag of entry.tags ?? []) {
        if (!tagMap.has(tag)) tagMap.set(tag, new Set());
        tagMap.get(tag).add(entry.id);
      }
    });
  }

  getById(type, id) {
    const entity = this.tryGetById(type, id);
    if (!entity) throw new Error(`Unknown ${type} id "${id}"`);
    return entity;
  }

  tryGetById(type, id) {
    return this.byType.get(type)?.get(id) ?? null;
  }

  allOfType(type) {
    return Array.from(this.byType.get(type)?.values() ?? []);
  }

  byTag(type, tag) {
    const ids = this.tagIndex.get(type)?.get(tag) ?? new Set();
    const idMap = this.byType.get(type);
    return Array.from(ids).map((id) => idMap.get(id));
  }
}

/** Builds a registry from a { type: entity[] } map, e.g. the aggregated /src/content/index.js export. */
export function createRegistry(contentByType) {
  const registry = new ContentRegistry();
  for (const [type, entries] of Object.entries(contentByType)) {
    registry.load(type, entries);
  }
  return registry;
}
