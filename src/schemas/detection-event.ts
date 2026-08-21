import { z } from "zod";

/**
 * Raw detection event published by cv-inference-svc onto `processed.tracks`.
 *
 * PITFALL 1 (VEKTOR-PRD.md §17): `sensor_ts` — not `kafka_ts` — is the only
 * field fusion-svc may order events by. Sensors arrive out of order; ordering
 * by Kafka arrival time produces phantom duplicate tracks. This schema exists
 * specifically so that invariant is enforced at the consumer boundary, not
 * left to convention.
 */
export const DetectionEvent = z.object({
  event_id: z.string().uuid(),
  frame_id: z.string(),
  sensor_id: z.string(),
  class: z.string(),
  bbox: z.tuple([z.number(), z.number(), z.number(), z.number()]),
  confidence: z.number().min(0).max(1),
  sensor_ts: z.string().datetime(), // GPS timestamp — NEVER use kafka arrival time
  kafka_ts: z.string().datetime(), // For debugging only; never used for ordering
});
export type DetectionEvent = z.infer<typeof DetectionEvent>;

export const SensorHealth = z.object({
  sensor_id: z.string(),
  status: z.enum(["ONLINE", "OFFLINE", "DEGRADED"]),
  latency_ms: z.number().nonnegative(),
  drop_rate: z.number().min(0).max(1),
  last_heartbeat: z.string().datetime(),
});
export type SensorHealth = z.infer<typeof SensorHealth>;
