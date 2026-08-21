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

/** Server → client event name -> payload schema map. */
export const ServerToClientEvents = {
  "entity:updated": EntityUpdatedEvent,
  "entity:new": Entity,
  "entity:lost": EntityLostEvent,
  "alert:fired": Alert,
  "coa:ready": CoaReadyEvent,
  "sensor:status": SensorHealth,
} as const;

/** Client → server event name -> payload schema map. */
export const ClientToServerEvents = {
  "subscribe:area": BoundingBox,
  "unsubscribe": z.void(),
} as const;
