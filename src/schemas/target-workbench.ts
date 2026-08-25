import { z } from "zod";
import { Entity } from "./entity.js";

/**
 * SVC-012 — REQ-4.1: "Rank active entities in Target Workbench by
 * threat/priority score ... algorithm documented and auditable." `factors`
 * is what makes it auditable: every component the scoring engine summed to
 * reach `threat_score`, not just the final number.
 */
export const ThreatFactor = z.object({
  name: z.string(),
  weight: z.number(),
  value: z.number(), // the raw 0-1 normalized input this factor scored
  contribution: z.number(), // weight * value, what actually got added to the total
});
export type ThreatFactor = z.infer<typeof ThreatFactor>;

export const RankedEntity = z.object({
  entity: Entity,
  threat_score: z.number().min(0).max(1),
  factors: z.array(ThreatFactor),
});
export type RankedEntity = z.infer<typeof RankedEntity>;
