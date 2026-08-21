import { z } from "zod";

/**
 * Structured COA output — every LLM response (edge node-llama-cpp or cloud
 * llm-cloud-svc via gRPC) is parsed against this schema before it is allowed
 * to touch application logic. See PITFALL 4: this is the guard against
 * prompt-injected / malformed LLM output reaching the Target Workbench.
 */
export const COAOption = z.object({
  rank: z.number().int().min(1),
  title: z.string().min(1),
  rationale: z.string(),
  confidence: z.number().min(0).max(1),
  required_assets: z.array(z.string()),
  estimated_duration_min: z.number().nonnegative(),
  context_factors: z.array(z.string()), // REQ-4.5 — reasoning transparency
});
export type COAOption = z.infer<typeof COAOption>;

export const COA = z.object({
  coa_id: z.string().uuid(),
  situation_id: z.string().uuid(),
  generated_at: z.string().datetime(),
  options: z.array(COAOption).min(1),
  selected_option: z.number().int().nullable(),
  commander_notes: z.string().nullable(),
  status: z.enum(["PENDING", "APPROVED", "REJECTED"]),
});
export type COA = z.infer<typeof COA>;
