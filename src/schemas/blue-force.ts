import { z } from "zod";

/**
 * SVC-010 (Phase 3, REQ-3.3): friendly-asset registry + no-strike zone
 * engine. No feed in the PRD publishes friendly-asset positions
 * automatically (unlike hostile/unknown tracks, which arrive via
 * CV/AIS/ADS-B/EW), so this is an operator-managed registry — fusion-svc
 * exposes REST CRUD for it, same as geospatial-svc does for entities.
 *
 * A registered asset auto-generates a NoStrikeZone buffered around its
 * current position (source "BLUE_FORCE_BUFFER", linked by source_asset_id)
 * that fusion-svc keeps in sync on every position update — this is what
 * REQ-3.3's "zones render within 1s of position update" actually means at
 * the data layer. An analyst can additionally draw a "MANUAL" zone with no
 * backing asset (e.g. a no-strike zone around a hospital).
 */
export const BlueForceAsset = z.object({
  asset_id: z.string().uuid(),
  callsign: z.string().min(1),
  classification: z.string(), // e.g. "GroundVehicle.Friendly"
  position: z.object({ lat: z.number().min(-90).max(90), lon: z.number().min(-180).max(180), alt_m: z.number() }),
  buffer_radius_m: z.number().positive(),
  last_updated: z.string().datetime(),
});
export type BlueForceAsset = z.infer<typeof BlueForceAsset>;

export const NoStrikeZoneSource = z.enum(["MANUAL", "BLUE_FORCE_BUFFER"]);
export type NoStrikeZoneSource = z.infer<typeof NoStrikeZoneSource>;

export const NoStrikeZone = z.object({
  zone_id: z.string().uuid(),
  name: z.string().min(1),
  source: NoStrikeZoneSource,
  source_asset_id: z.string().uuid().nullable(), // set iff source === "BLUE_FORCE_BUFFER"
  // GeoJSON Polygon ring: [[lon, lat], ...], first === last point.
  polygon: z.array(z.tuple([z.number(), z.number()])).min(4),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});
export type NoStrikeZone = z.infer<typeof NoStrikeZone>;
