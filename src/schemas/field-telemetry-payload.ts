import { z } from "zod";

/**
 * The shape a field-pwa phone client writes into IotTelemetryEvent.payload
 * (sensor-feeds.ts) — the phone-sourced counterpart to that same file's
 * MavlinkTelemetryPayload, both discriminated by payload.device_class so
 * fusion-svc's fromIot() can recognize either without a new Kafka topic or
 * a new fusion domain. lat/lon come from the browser's Geolocation API,
 * heading/pitch/roll from DeviceOrientationEvent — all nullable because a
 * phone can report a GPS fix before its compass/gyro has calibrated (or
 * vice versa), and a partial reading is still worth publishing.
 */
export const FieldPhoneTelemetryPayload = z.object({
  device_class: z.literal("phone"),
  lat: z.number().min(-90).max(90),
  lon: z.number().min(-180).max(180),
  alt_m: z.number(),
  gps_accuracy_m: z.number().nonnegative().nullable(),
  heading_deg: z.number().min(0).max(360).nullable(),
  pitch_deg: z.number().min(-90).max(90).nullable(),
  roll_deg: z.number().min(-180).max(180).nullable(),
  battery_pct: z.number().min(0).max(100).nullable(),
});
export type FieldPhoneTelemetryPayload = z.infer<typeof FieldPhoneTelemetryPayload>;
