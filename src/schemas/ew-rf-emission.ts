import { z } from "zod";

/**
 * SVC-011 (Phase 3): a single detected RF emission from an EW/SIGINT
 * receiver. No ingest adapter for this feed exists yet (SVC-003, Phase 1,
 * only shipped AIS/ADS-B/IoT) — this schema is the contract fusion-svc's
 * consumer validates against regardless of which service ends up producing
 * it, same as every other topic in this repo. Same Pitfall 1 discipline:
 * sensor_ts is receiver-observed time, kafka_ts is publish time only.
 *
 * RF geolocation from a single receiver is a bearing line, not a fix — an
 * emitter's position is only known once multiple bearings (or a
 * direction-finding array) triangulate it, which is exactly the kind of
 * cross-sensor correlation fusion-svc's EKF/dedup pipeline does downstream.
 * `estimated_position` is therefore optional and, when present, carries a
 * much larger `accuracy_m` than a GPS-derived fix.
 */
export const EwRfEmission = z.object({
  event_id: z.string().uuid(),
  sensor_id: z.string().min(1), // the receiver/array id
  freq_mhz: z.number().positive(),
  bearing_deg: z.number().min(0).max(360).nullable(), // null for an omni receiver with no DF capability
  signal_strength_dbm: z.number(),
  modulation: z.string().nullable(), // e.g. "FM", "PSK" — null when unclassified
  emitter_classification: z.string().nullable(), // best-guess signal library match, e.g. "RadarType.Search"
  sensor_position: z.object({ lat: z.number().min(-90).max(90), lon: z.number().min(-180).max(180) }),
  estimated_position: z
    .object({ lat: z.number().min(-90).max(90), lon: z.number().min(-180).max(180), accuracy_m: z.number().positive() })
    .nullable(),
  sensor_ts: z.string().datetime(),
  kafka_ts: z.string().datetime(),
});
export type EwRfEmission = z.infer<typeof EwRfEmission>;
