import { z } from "zod";

/**
 * REQ-1.8 / Epic 8's "Register a new sensor source" (`POST /api/v1/sensors`,
 * UC-5.1) — the one REST endpoint from the original requirements table that
 * was never actually built. An operator-managed registry, same shape as
 * SVC-010's blue-force asset registry (fusion-svc/src/blueforce): nothing
 * auto-populates it, no adapter reports its own installed position.
 *
 * This is what lets `sensor:status` (below) carry a real position +
 * coverage radius instead of being legend-only — the "Sensor Coverage" map
 * layer was a no-op from Phase 1 through this point for exactly the reason
 * this schema didn't exist yet.
 */
export const SensorType = z.enum(["RTSP", "AIS", "ADSB", "MQTT", "GEOTIFF", "FIELD", "OTHER"]);
export type SensorType = z.infer<typeof SensorType>;

export const SensorRegistration = z.object({
  sensor_id: z.string().min(1),
  sensor_type: SensorType,
  label: z.string().min(1),
  position: z.object({ lat: z.number().min(-90).max(90), lon: z.number().min(-180).max(180) }),
  coverage_radius_m: z.number().positive(),
  registered_at: z.string().datetime(),
});
export type SensorRegistration = z.infer<typeof SensorRegistration>;
