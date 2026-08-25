import { z } from "zod";

/**
 * SVC-017 — REQ-1.7: VEKTOR's own synced copy of an upstream ERP's
 * inventory row, kept current via Debezium CDC (logistics-svc's
 * cdc/inventoryConsumer.ts is the only writer). Field names deliberately
 * mirror the ERP source table 1:1 — there is no ontology mapping step here
 * the way fusion-svc's Entity mapper does for sensor domains, since an
 * inventory row has no equivalent "canonical shape" to normalize toward.
 */
export const InventoryItem = z.object({
  item_id: z.string().uuid(),
  sku: z.string(),
  name: z.string(),
  category: z.string(),
  quantity: z.number(),
  reorder_threshold: z.number(),
  location: z.string(),
  updated_at: z.string().datetime(),
});
export type InventoryItem = z.infer<typeof InventoryItem>;

/**
 * SVC-018 — REQ-6.1/6.3: a linear-regression depletion forecast, recomputed
 * every 15 minutes from `inventory_history`'s CDC-derived quantity
 * time-series. `hours_to_stockout` is null when the regression's slope
 * isn't declining (flat or replenishing stock has no stock-out to project).
 */
export const InventoryForecast = z.object({
  item_id: z.string().uuid(),
  quantity: z.number(),
  depletion_rate_per_hour: z.number(),
  hours_to_stockout: z.number().nullable(),
  low_stock: z.boolean(),
  forecast_at: z.string().datetime(),
});
export type InventoryForecast = z.infer<typeof InventoryForecast>;

/**
 * SVC-019 — REQ-6.2: route optimization avoiding flagged hazard edges. A
 * request/result pair against logistics-svc's dedicated pgRouting-backed
 * road network (a separate Postgres instance from the rest of VEKTOR's
 * data — see logistics-svc/README.md — pgRouting isn't installed on the
 * main PostGIS instance).
 */
export const LatLon = z.object({ lat: z.number(), lon: z.number() });
export type LatLon = z.infer<typeof LatLon>;

export const RouteRequest = z.object({
  start: LatLon,
  end: LatLon,
});
export type RouteRequest = z.infer<typeof RouteRequest>;

export const RouteResult = z.object({
  path: z.array(LatLon),
  distance_m: z.number(),
  avoided_edge_ids: z.array(z.number()),
});
export type RouteResult = z.infer<typeof RouteResult>;
