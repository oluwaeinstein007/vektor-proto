import { z } from "zod";

/**
 * SVC-003 adapters (REQ-1.5): AIS, ADS-B, and MQTT IoT telemetry, each
 * normalized to its own canonical event before publishing. Same Pitfall 1
 * discipline as DetectionEvent/VideoFrameMetadata — sensor_ts is the
 * feed-reported/observed time, kafka_ts is publish time for debugging only.
 */

/** Class A position report (ITU-R M.1371 message types 1/2/3) from an AIS receiver. */
export const AisPositionReport = z.object({
  event_id: z.string().uuid(),
  sensor_id: z.string().min(1), // the receiver/feed id, not the vessel
  mmsi: z.string().regex(/^\d{9}$/, "MMSI is a 9-digit numeric string"),
  message_type: z.number().int().min(1).max(3),
  nav_status: z.number().int().min(0).max(15),
  lat: z.number().min(-90).max(90),
  lon: z.number().min(-180).max(180),
  speed_knots: z.number().nonnegative().nullable(), // null when unavailable (1023 raw)
  course_deg: z.number().min(0).max(360).nullable(), // null when unavailable (3600 raw)
  heading_deg: z.number().min(0).max(359).nullable(), // null when unavailable (511 raw)
  sensor_ts: z.string().datetime(),
  kafka_ts: z.string().datetime(),
});
export type AisPositionReport = z.infer<typeof AisPositionReport>;

/** Airborne position/velocity, normalized from an SBS-1 (BaseStation) feed. */
export const AdsbPositionReport = z.object({
  event_id: z.string().uuid(),
  sensor_id: z.string().min(1),
  icao24: z.string().regex(/^[0-9A-F]{6}$/, "ICAO24 is a 6-hex-digit aircraft address"),
  callsign: z.string().nullable(),
  altitude_ft: z.number().nullable(),
  ground_speed_kts: z.number().nonnegative().nullable(),
  track_deg: z.number().min(0).max(360).nullable(),
  lat: z.number().min(-90).max(90).nullable(),
  lon: z.number().min(-180).max(180).nullable(),
  vertical_rate_fpm: z.number().nullable(),
  squawk: z.string().nullable(),
  on_ground: z.boolean(),
  sensor_ts: z.string().datetime(),
  kafka_ts: z.string().datetime(),
});
export type AdsbPositionReport = z.infer<typeof AdsbPositionReport>;

/** One MQTT publish from an IoT sensor, republished onto Kafka verbatim. */
export const IotTelemetryEvent = z.object({
  event_id: z.string().uuid(),
  sensor_id: z.string().min(1),
  mqtt_topic: z.string().min(1),
  payload: z.record(z.string(), z.unknown()),
  sensor_ts: z.string().datetime(),
  kafka_ts: z.string().datetime(),
});
export type IotTelemetryEvent = z.infer<typeof IotTelemetryEvent>;
