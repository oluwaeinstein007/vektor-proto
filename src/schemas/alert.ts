import { z } from "zod";

export const AlertSeverity = z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]);
export type AlertSeverity = z.infer<typeof AlertSeverity>;

export const AlertType = z.enum(["GEOFENCE", "ANOMALY", "ESCALATION", "SENSOR_HEALTH"]);
export type AlertType = z.infer<typeof AlertType>;

export const Alert = z.object({
  alert_id: z.string().uuid(),
  type: AlertType,
  entity_id: z.string().uuid().nullable(),
  severity: AlertSeverity,
  message: z.string(),
  status: z.enum(["OPEN", "ACKNOWLEDGED", "ESCALATED", "DISMISSED"]),
  ts: z.string().datetime(),
});
export type Alert = z.infer<typeof Alert>;
