import { z } from "zod";

/**
 * Tracked detection event published by cv-inference-svc onto
 * `{env}.vektor.detection.tracked` — one entry per DeepSORT-tracked object
 * per processed frame (ML-002/003/004), not a raw pre-tracking detection:
 * `track_id` only exists once the detection has gone through the tracker
 * (§9.7's data flow puts DeepSORT between raw YOLO output and this topic).
 *
 * `velocity_px_per_frame`/`heading_deg` (ML-005) are the tracker's own
 * Kalman-filter state — image-space pixel velocity per processed frame,
 * not real-world geodetic velocity. Converting that into an actual
 * speed/heading requires knowing the camera's real-world geometry, which
 * this service doesn't have; that correlation happens once fusion-svc's
 * EKF (SVC-008, Phase 3) fuses this track with a real position.
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
  track_id: z.string().uuid(), // DeepSORT-assigned persistent ID (REQ-2.4)
  class: z.string(),
  bbox: z.tuple([z.number(), z.number(), z.number(), z.number()]),
  confidence: z.number().min(0).max(1),
  velocity_px_per_frame: z.object({ vx: z.number(), vy: z.number() }), // ML-005
  heading_deg: z.number().min(0).max(360), // ML-005
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
