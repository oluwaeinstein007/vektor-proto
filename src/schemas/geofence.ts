import { z } from "zod";
import { EntityAffiliation, Position } from "./entity.js";
import { AlertSeverity } from "./alert.js";

/**
 * SVC-014 — REQ-5.1: geofence rule engine. `trigger` decides whether a zone
 * fires on entry, exit, or both; `affiliation_filter: null` means "any
 * affiliation" rather than requiring an explicit wildcard value.
 */
export const GeofenceTrigger = z.enum(["ENTRY", "EXIT", "BOTH"]);
export type GeofenceTrigger = z.infer<typeof GeofenceTrigger>;

export const AlertChannel = z.enum(["IN_APP", "EMAIL", "SMS", "WEBHOOK"]);
export type AlertChannel = z.infer<typeof AlertChannel>;

export const NotifyConfig = z.object({
  emails: z.array(z.string().email()),
  phones: z.array(z.string()),
  webhook_urls: z.array(z.string().url()),
});
export type NotifyConfig = z.infer<typeof NotifyConfig>;

export const GeofenceZone = z.object({
  zone_id: z.string().uuid(),
  name: z.string(),
  trigger: GeofenceTrigger,
  severity: AlertSeverity,
  affiliation_filter: EntityAffiliation.nullable(),
  channels: z.array(AlertChannel),
  notify: NotifyConfig,
  active: z.boolean(),
  created_at: z.string().datetime(),
});
export type GeofenceZone = z.infer<typeof GeofenceZone>;

/**
 * SVC-014/015 — the BullMQ job payload fusion-svc enqueues (queue name
 * below) after every entity upsert; alert-svc's worker is the only
 * consumer. Kept minimal — just enough for geofence + anomaly checks
 * without alert-svc needing its own copy of the fusion pipeline's state.
 */
export const GeofenceCheckJob = z.object({
  entity_id: z.string().uuid(),
  affiliation: EntityAffiliation,
  position: Position,
  speed_kmh: z.number().nonnegative(),
  heading_deg: z.number().min(0).max(360),
  ts: z.string().datetime(),
});
export type GeofenceCheckJob = z.infer<typeof GeofenceCheckJob>;

export const GEOFENCE_CHECK_QUEUE = "geofence-check";
