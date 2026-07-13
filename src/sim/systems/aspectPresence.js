// The passive cost of sharing ground with an Aspect — not a raid, just what
// it costs the town to have a discovered zone sit inside something old and
// aware. Only zones with an `aspectRef` pointing at an Aspect that declares
// a `signature.resourceDrain` are affected; new Aspects/zones need no engine
// change here. See cove-gap-design-roadmap.md Phase 2.

import { createLogEntry } from "../core/log.js";

export function runAspectPresenceSystem(state, registry) {
  const log = [];

  for (const zoneId of state.discoveredZones) {
    const zone = registry.getById("zone", zoneId);
    if (!zone.aspectRef) continue;
    const aspect = registry.tryGetById("aspect", zone.aspectRef.id);
    if (!aspect?.signature?.resourceDrain?.length) continue;

    for (const drain of aspect.signature.resourceDrain) {
      const resource = registry.getById("resource", drain.ref.id);
      const before = state.resources[resource.id] ?? 0;
      const after = Math.max(0, before - drain.amountPerTick);
      if (after === before) continue;
      state.resources[resource.id] = after;
      log.push(
        createLogEntry(
          "aspectPresence",
          "resource_drained",
          `${aspect.name}'s presence in ${zone.name} costs the town ${(before - after).toFixed(2)} ${resource.name}.`,
          { aspectId: aspect.id, zoneId: zone.id, resourceId: resource.id, amount: after - before }
        )
      );
    }
  }

  return { log };
}
