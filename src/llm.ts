// Hand-written wrapper around the ts-proto generated ./generated/llm.js —
// re-exports the generated client/server types AND the @grpc/grpc-js
// runtime values (credentials, Server, ServerCredentials) needed to
// actually construct them. Every consumer (coa-svc, this package's own
// tests) MUST get `credentials`/`Server`/`ServerCredentials` from here,
// never from a direct `@grpc/grpc-js` import.
//
// Why: vektor-proto is consumed via a `link:` filesystem symlink (§9.4),
// not a normal pnpm workspace dependency, so it carries its OWN separate
// node_modules/@grpc/grpc-js instance — even at the identical version
// number, a consumer's own @grpc/grpc-js import resolves to a DIFFERENT
// module instance. grpc-js's ChannelCredentials/ServerCredentials classes
// do a real `instanceof` check internally, so passing a credentials object
// built from the wrong instance throws "Channel credentials must be a
// ChannelCredentials object" at the call site that constructs the client.
// Found 2026-08-24 building coa-svc's gRPC client (ML-010) — the first
// consumer in this project to construct real gRPC runtime objects across
// this boundary (every prior cross-repo usage was Zod schemas, which have
// no instanceof-sensitive class identity).
export * from "./generated/llm.js";
export { credentials, Server, ServerCredentials } from "@grpc/grpc-js";
