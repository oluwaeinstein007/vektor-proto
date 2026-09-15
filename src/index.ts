// @vektor/proto — the only place these shapes are allowed to be defined.
// vektor-platform and vektor-ml both consume this package rather than
// hand-rolling their own copies. See README.md and VEKTOR-PRD.md §9.4.

export * from "./schemas/entity.js";
export * from "./schemas/detection-event.js";
export * from "./schemas/video-frame.js";
export * from "./schemas/sensor-feeds.js";
export * from "./schemas/field-telemetry-payload.js";
export * from "./schemas/imagery-ingest.js";
export * from "./schemas/coa.js";
export * from "./schemas/alert.js";
export * from "./schemas/audit.js";
export * from "./schemas/socket-events.js";
export * from "./schemas/ew-rf-emission.js";
export * from "./schemas/blue-force.js";
export * from "./schemas/target-workbench.js";
export * from "./schemas/geofence.js";
export * from "./schemas/logistics.js";
export * from "./schemas/reporting.js";
export * from "./schemas/sensor-registry.js";

// gRPC stubs (LLMServiceClient etc.) are NOT re-exported here — they pull in
// @grpc/grpc-js, which requires Node built-ins (fs) unavailable in a browser
// bundle. This barrel must stay safe for apps/web's client-side code to
// import. Node-only consumers (coa-svc) import from "@vektor/proto/llm".
