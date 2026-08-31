import { z } from "zod";
import { Entity, EntityUpdatedEvent, Position } from "./entity.js";
import { Alert } from "./alert.js";
import { COAOption } from "./coa.js";
import { SensorHealth } from "./detection-event.js";

/**
 * Socket.io event contract — VEKTOR-PRD.md §13.2. Kept here (not hand-typed
 * per-service) so the web dashboard and every backend emitter agree on shape
 * without importing each other.
 */
export const BoundingBox = z.object({
  min_lat: z.number(),
  min_lon: z.number(),
  max_lat: z.number(),
  max_lon: z.number(),
});
export type BoundingBox = z.infer<typeof BoundingBox>;

export const EntityLostEvent = z.object({
  entity_id: z.string().uuid(),
  last_position: Position,
  ts: z.string().datetime(),
});
export type EntityLostEvent = z.infer<typeof EntityLostEvent>;

export const CoaReadyEvent = z.object({
  coa_id: z.string().uuid(),
  situation_id: z.string().uuid(),
  options: z.array(COAOption),
});
export type CoaReadyEvent = z.infer<typeof CoaReadyEvent>;

/**
 * A throttled sample of `{env}.vektor.video.frame` (RTSP/phone-camera
 * frames — see video-frame.ts) for a live dashboard thumbnail, not the raw
 * ~15-30fps Kafka stream. Base64-inlined deliberately, unlike the Kafka
 * topic's raw-bytes-as-value convention: that convention exists because
 * base64-wrapping a full-framerate stream in JSON is pure overhead, but a
 * throttled (~1-2fps) sample over Socket.io/JSON is a different performance
 * regime where inlining is simpler and cheap enough.
 */
export const VideoFrameSocketEvent = z.object({
  sensor_id: z.string(),
  jpeg_base64: z.string(),
  frame_number: z.number().int().nonnegative(),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  captured_at: z.string().datetime(),
});
export type VideoFrameSocketEvent = z.infer<typeof VideoFrameSocketEvent>;

/** Server → client event name -> payload schema map. */
export const ServerToClientEvents = {
  "entity:updated": EntityUpdatedEvent,
  "entity:new": Entity,
  "entity:lost": EntityLostEvent,
  "alert:fired": Alert,
  "coa:ready": CoaReadyEvent,
  "sensor:status": SensorHealth,
  "video:frame": VideoFrameSocketEvent,
} as const;

/** Client → server event name -> payload schema map. */
export const ClientToServerEvents = {
  "subscribe:area": BoundingBox,
  "unsubscribe": z.void(),
} as const;
