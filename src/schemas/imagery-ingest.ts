import { z } from "zod";

/**
 * SVC-002 (REQ-1.2): published once a GeoTIFF/SAR file has been parsed and
 * georeferenced — not the imagery itself, just the normalized metadata
 * envelope. Archival storage (MinIO, §12.4 retention policy) is a separate,
 * later concern; this event doesn't carry a storage key because this pass
 * doesn't implement the upload path — same scope boundary SVC-001 draws
 * around raw frame archival.
 */
export const GeoTiffIngestedEvent = z.object({
  event_id: z.string().uuid(),
  sensor_id: z.string().min(1), // the satellite/SAR platform or feed id
  file_name: z.string().min(1),
  bbox: z.object({
    min_lon: z.number().min(-180).max(180),
    min_lat: z.number().min(-90).max(90),
    max_lon: z.number().min(-180).max(180),
    max_lat: z.number().min(-90).max(90),
  }),
  width_px: z.number().int().positive(),
  height_px: z.number().int().positive(),
  band_count: z.number().int().positive(),
  crs_epsg: z.number().int().nullable(), // null if the file has no resolvable EPSG code
  sensor_ts: z.string().datetime(),
  kafka_ts: z.string().datetime(),
});
export type GeoTiffIngestedEvent = z.infer<typeof GeoTiffIngestedEvent>;
