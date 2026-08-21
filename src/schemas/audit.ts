import { z } from "zod";

/**
 * Append-only audit record — REQ-8.3. audit-svc is the only writer; every
 * other service treats this as insert-only, never update/delete.
 */
export const AuditEntry = z.object({
  audit_id: z.string().uuid(),
  actor_user_id: z.string(),
  actor_role: z.string(),
  action: z.string(), // e.g. "coa.approve", "sensor.register", "model.upload"
  resource_type: z.string(),
  resource_id: z.string().nullable(),
  metadata: z.record(z.string(), z.unknown()).default({}),
  ts: z.string().datetime(),
});
export type AuditEntry = z.infer<typeof AuditEntry>;

/**
 * The seven VEKTOR-PRD.md §5.1 user types. Six are RBAC roles a Keycloak JWT
 * carries; the seventh (Systems Integrator) is deliberately absent here —
 * see REQ-8.5 — because it authenticates via a scoped API key, never a role.
 */
export const RbacRole = z.enum([
  "SuperAdmin",
  "Commander",
  "Analyst",
  "Logistics Officer",
  "Field Operator",
  "Viewer",
]);
export type RbacRole = z.infer<typeof RbacRole>;
