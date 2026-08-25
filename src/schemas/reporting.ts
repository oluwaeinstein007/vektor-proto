import { z } from "zod";

/**
 * SVC-020 — REQ-7.1: "Auto-generate PDF/PPTX situation reports ... within
 * 30s." `status` starts PENDING at request time and becomes COMPLETE/FAILED
 * once generation finishes — the same request/poll shape as coa-svc's COA
 * generation, since both are slower-than-a-single-request operations.
 */
export const ReportFormat = z.enum(["PDF", "PPTX"]);
export type ReportFormat = z.infer<typeof ReportFormat>;

export const ReportStatus = z.enum(["PENDING", "COMPLETE", "FAILED"]);
export type ReportStatus = z.infer<typeof ReportStatus>;

export const Report = z.object({
  report_id: z.string().uuid(),
  format: ReportFormat,
  status: ReportStatus,
  requested_at: z.string().datetime(),
  completed_at: z.string().datetime().nullable(),
});
export type Report = z.infer<typeof Report>;

/**
 * SVC-020 — REQ-7.2: "Scheduled report dispatch ... delivered on configured
 * cron schedule." A real cron expression (cron-parser), not a fixed
 * interval — see reporting-svc/src/schedule.
 */
export const ReportSchedule = z.object({
  schedule_id: z.string().uuid(),
  cron_expr: z.string(),
  format: ReportFormat,
  recipients: z.array(z.string().email()),
  active: z.boolean(),
  last_run_at: z.string().datetime().nullable(),
});
export type ReportSchedule = z.infer<typeof ReportSchedule>;
