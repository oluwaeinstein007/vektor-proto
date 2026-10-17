import { z } from "zod";
import { EntityAffiliation, EntityStatus, Position, Kinematics } from "./entity.js";

/**
 * NW-018 — historical playback and pattern-of-life. UC-2.2 ("query
 * historical track data for a specific entity") is an Analyst's core
 * workflow and had no API and no UI.
 *
 * Why a new contract rather than reusing `Entity`: the `entities` table is
 * current-state only — one row per entity, `last_updated` overwritten in
 * place — so "where was this entity at 14:12" is not answerable from it at
 * all. The durable `{env}.vektor.entities.upserted` topic (Phase 6) holds
 * the full sequence, but Kafka answers "replay this partition", not "this
 * entity, between these two times", which is the question both UC-2.2 and a
 * map time-slider actually ask. Something has to project that topic into a
 * time-indexed store; these are the shapes it reads back.
 *
 * Two distinct queries, deliberately not one:
 *   - EntityHistoryQuery  — one entity, a time range. The track line.
 *   - EntitySnapshotQuery — all entities, one instant. The time-slider scrub.
 * They have different cardinality (one entity × many times vs. many
 * entities × one time) and want different indexes, so collapsing them into
 * one endpoint would make both slower.
 */

/**
 * One observed position of one entity at one instant. Deliberately NOT a
 * full `Entity`: a track of 10,000 points does not need 10,000 copies of
 * the metadata, source_sensors array and classification string, and sending
 * them is the difference between a responsive scrub and a 40MB response.
 */
export const EntityHistoryPoint = z.object({
  ts: z.string().datetime(),
  lat: z.number().min(-90).max(90),
  lon: z.number().min(-180).max(180),
  alt_m: z.number(),
  speed_kmh: z.number().nonnegative(),
  heading_deg: z.number().min(0).max(360),
  confidence: z.number().min(0).max(1),
});
export type EntityHistoryPoint = z.infer<typeof EntityHistoryPoint>;

export const EntityHistoryQuery = z.object({
  from: z.string().datetime(),
  to: z.string().datetime(),
  /**
   * Server-side decimation target. An entity updating at 10Hz for 24h is
   * ~864,000 points; a map track line is legible at about 2,000 and a
   * browser is not happy past about 50,000. The server MUST reduce to at
   * most this many points rather than streaming everything and letting the
   * client cope — see `simplify_tolerance_m` for how.
   */
  max_points: z.number().int().positive().max(50_000).default(2_000),
  /**
   * Douglas-Peucker tolerance in metres (PostGIS `ST_SimplifyPreserveTopology`
   * does this in the query). Shape-preserving decimation, not uniform
   * time-sampling: a vehicle parked for an hour and then turning sharply
   * should keep the turn and collapse the parking, which uniform sampling
   * gets exactly backwards. When unset the server picks a tolerance that
   * meets `max_points`.
   */
  simplify_tolerance_m: z.number().positive().optional(),
});
export type EntityHistoryQuery = z.infer<typeof EntityHistoryQuery>;

export const EntityHistoryResponse = z.object({
  entity_id: z.string().uuid(),
  classification: z.string(),
  affiliation: EntityAffiliation,
  status: EntityStatus,
  from: z.string().datetime(),
  to: z.string().datetime(),
  points: z.array(EntityHistoryPoint),
  /** Points before decimation, so the UI can say "2,000 of 864,312 shown". */
  total_points: z.number().int().nonnegative(),
  /** True when `points.length < total_points`. Never hide this from the operator. */
  decimated: z.boolean(),
});
export type EntityHistoryResponse = z.infer<typeof EntityHistoryResponse>;

/**
 * The time-slider's scrub query: every entity's last known state at or
 * before `ts`. "At or before" rather than "nearest" is deliberate — a
 * playback that interpolates toward positions the system had not yet
 * observed is showing the operator something that never happened.
 */
export const EntitySnapshotQuery = z.object({
  ts: z.string().datetime(),
  /** [west, south, east, north]. Same ordering as API-002's AOI subscribe. */
  bbox: z.tuple([z.number(), z.number(), z.number(), z.number()]).optional(),
  /**
   * How far back a last-known position may be and still be shown. Without
   * this, scrubbing to 03:00 renders every entity ever seen, including ones
   * last detected days earlier, as though they were present.
   */
  max_staleness_s: z.number().int().positive().default(300),
});
export type EntitySnapshotQuery = z.infer<typeof EntitySnapshotQuery>;

export const EntitySnapshotEntry = z.object({
  entity_id: z.string().uuid(),
  classification: z.string(),
  affiliation: EntityAffiliation,
  status: EntityStatus,
  confidence: z.number().min(0).max(1),
  position: Position,
  kinematics: Kinematics,
  /** When this state was actually observed — always <= the queried `ts`. */
  observed_at: z.string().datetime(),
  /** `ts - observed_at`, in seconds. The UI fades a track as this grows. */
  staleness_s: z.number().nonnegative(),
});
export type EntitySnapshotEntry = z.infer<typeof EntitySnapshotEntry>;

export const EntitySnapshotResponse = z.object({
  ts: z.string().datetime(),
  entities: z.array(EntitySnapshotEntry),
});
export type EntitySnapshotResponse = z.infer<typeof EntitySnapshotResponse>;

/**
 * The bounds of what history actually exists, so the time-slider can render
 * a real track rather than guessing its own extent. A slider whose range is
 * "now minus 24h" on a deployment with 20 minutes of data is a UI that
 * spends 95% of its travel showing nothing.
 */
export const HistoryCoverageResponse = z.object({
  earliest: z.string().datetime().nullable(),
  latest: z.string().datetime().nullable(),
  entity_count: z.number().int().nonnegative(),
  point_count: z.number().int().nonnegative(),
});
export type HistoryCoverageResponse = z.infer<typeof HistoryCoverageResponse>;

/**
 * Pattern-of-life, scoped deliberately narrowly: where an entity spends
 * time, not a behavioural model. A dwell is a period during which the
 * entity stayed within `radius_m` of one place for at least some minimum
 * duration — enough to answer "this vessel returns to the same berth every
 * night", which is the question analysts actually ask first, without
 * claiming to infer intent.
 */
export const DwellCluster = z.object({
  lat: z.number().min(-90).max(90),
  lon: z.number().min(-180).max(180),
  radius_m: z.number().positive(),
  /** Each separate occasion the entity was here. */
  visits: z.number().int().positive(),
  total_dwell_s: z.number().nonnegative(),
  first_seen: z.string().datetime(),
  last_seen: z.string().datetime(),
  /**
   * Local-time hours (0-23) in which visits began. The cheapest honest
   * version of "when does this happen" — a histogram the analyst reads,
   * not a periodicity claim the system makes.
   */
  arrival_hours: z.array(z.number().int().min(0).max(23)),
});
export type DwellCluster = z.infer<typeof DwellCluster>;

export const PatternOfLifeQuery = z.object({
  from: z.string().datetime(),
  to: z.string().datetime(),
  /** Points within this distance of each other are the same place. */
  cluster_radius_m: z.number().positive().default(150),
  /** Shorter stops are transit, not dwell. */
  min_dwell_s: z.number().int().positive().default(300),
});
export type PatternOfLifeQuery = z.infer<typeof PatternOfLifeQuery>;

export const PatternOfLifeResponse = z.object({
  entity_id: z.string().uuid(),
  from: z.string().datetime(),
  to: z.string().datetime(),
  clusters: z.array(DwellCluster),
  /** Time inside any cluster vs. the queried window — a transit/dwell split. */
  dwell_fraction: z.number().min(0).max(1),
});
export type PatternOfLifeResponse = z.infer<typeof PatternOfLifeResponse>;
