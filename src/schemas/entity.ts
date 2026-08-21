import { z } from "zod";

/**
 * Canonical Entity schema — VEKTOR-PRD.md Epic 3.
 * Every service that reads or writes an entity imports this, never a
 * hand-rolled shape. Adding a field here is the only way to add it anywhere.
 */
export const EntityStatus = z.enum(["ACTIVE", "LOST", "ARCHIVED", "CONFLICTED"]);
export type EntityStatus = z.infer<typeof EntityStatus>;

export const EntityAffiliation = z.enum(["UNKNOWN", "FRIENDLY", "HOSTILE", "NEUTRAL"]);
export type EntityAffiliation = z.infer<typeof EntityAffiliation>;

export const Position = z.object({
  lat: z.number().min(-90).max(90),
  lon: z.number().min(-180).max(180),
  alt_m: z.number(),
  mgrs: z.string(),
  accuracy_m: z.number().nonnegative(),
});
export type Position = z.infer<typeof Position>;

export const TrajectoryPoint = z.object({
  lat: z.number(),
  lon: z.number(),
  ts: z.string().datetime(),
});
export type TrajectoryPoint = z.infer<typeof TrajectoryPoint>;

export const Kinematics = z.object({
  speed_kmh: z.number().nonnegative(),
  heading_deg: z.number().min(0).max(360),
  trajectory: z.array(TrajectoryPoint),
});
export type Kinematics = z.infer<typeof Kinematics>;

export const EntityMetadata = z.object({
  tags: z.array(z.string()),
  analyst_notes: z.string(),
  no_strike: z.boolean(),
});
export type EntityMetadata = z.infer<typeof EntityMetadata>;

export const Entity = z.object({
  entity_id: z.string().uuid(),
  classification: z.string(), // e.g. "GroundVehicle.Tracked" — see PRD Epic 1 class tree
  confidence: z.number().min(0).max(1),
  status: EntityStatus,
  affiliation: EntityAffiliation,
  source_sensors: z.array(z.string()),
  position: Position,
  kinematics: Kinematics,
  metadata: EntityMetadata,
  first_detected: z.string().datetime(),
  last_updated: z.string().datetime(),
});
export type Entity = z.infer<typeof Entity>;

export const EntityUpdatedEvent = z.object({
  entity_id: z.string().uuid(),
  changed_fields: z.array(z.string()),
  entity: Entity,
});
export type EntityUpdatedEvent = z.infer<typeof EntityUpdatedEvent>;
