import { z } from "zod";

/**
 * Header metadata published alongside every raw video frame on
 * `{env}.vektor.video.frame` (VEKTOR-PRD.md §9.7, REQ-1.1).
 *
 * The frame bytes themselves are NOT part of this schema — they're the raw
 * Kafka message value (a JPEG-encoded Buffer), not JSON. Base64-wrapping a
 * ~30fps 1080p stream inside a JSON envelope would be pure overhead; kafkajs
 * already supports a Buffer message value alongside string/Buffer headers,
 * so this schema validates only the header side of that split.
 *
 * PITFALL 1 (§17) applies here same as DetectionEvent: `sensor_ts` is the
 * NTP/PTP-synced capture time (REQ-1.4), never the Kafka publish time —
 * every downstream consumer must order by this field, not arrival order.
 */
export const VideoFrameMetadata = z.object({
  event_id: z.string().uuid(),
  sensor_id: z.string().min(1),
  frame_id: z.string(),
  frame_number: z.number().int().nonnegative(),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  codec: z.string(),
  sensor_ts: z.string().datetime(), // capture time — NEVER use kafka arrival time
  kafka_ts: z.string().datetime(), // for debugging only; never used for ordering
});
export type VideoFrameMetadata = z.infer<typeof VideoFrameMetadata>;
