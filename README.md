# vektor-proto

Source-of-truth contracts for [VEKTOR](../vektor-docs/VEKTOR-PRD.md). Two kinds of contract live here, and every other repo consumes generated/exported artifacts from this one instead of hand-rolling its own copy:

1. **Zod schemas** (`src/schemas/`) — the primary contract for almost everything: `Entity`, `DetectionEvent`, `COA`, `Alert`, `AuditEntry`, Socket.io event payloads. Published as the `@vektor/proto` npm package and consumed by every `vektor-platform` service.
2. **`proto/llm.proto`** — the *only* protocol allowed to cross the TypeScript↔Python boundary (VEKTOR-PRD.md §9.3–§9.4). `coa-svc` (vektor-platform) and `llm-cloud-svc` (vektor-ml) both generate stubs from this file rather than either side vendoring its own copy.

## Why this is its own repo

See VEKTOR-PRD.md §9.4 and Pitfall 3 (§17). Short version: when contracts lived inside the TS monorepo, the Python team either edited TS files without review context or the contract silently drifted. This repo makes a breaking change to the boundary an explicit PR that both the platform and ML teams must approve before either side can bump its dependency version.

## Local development

`vektor-platform` and `vektor-ml` are separate repos and, until this package is published to a real npm/PyPI registry, consume it directly from the filesystem:

- TS side: `vektor-platform/packages/shared/package.json` depends on `"@vektor/proto": "link:../../../vektor-proto"` — build this repo (`pnpm build`) before installing in `vektor-platform`.
- Python side: `vektor-ml` installs this with `pip install -e ../vektor-proto/python` after running `pnpm codegen:py` here.

In production, both consume versioned, published packages instead (§9.8 CI/CD topology) — the filesystem link is a local-dev-only shim.

## Commands

```bash
pnpm install
pnpm codegen      # generates src/generated/ (TS) and python/vektor_proto/*_pb2*.py from proto/llm.proto
pnpm build        # tsc -> dist/
pnpm lint         # typecheck only
```

`codegen:py` requires the `python-grpc-tools-protoc` and `protol` executables on `PATH` (installed by `pip install grpcio-tools protoletariat` — see `python/pyproject.toml`'s `dev` extra). The `protol` step exists because `grpc_tools.protoc`'s gRPC plugin emits a plain `import llm_pb2`, which only resolves when the generated file is imported from the top level of `sys.path` — inside a package (`vektor_proto.llm_pb2_grpc`) that import breaks. `protol` rewrites it to the package-relative `from . import llm_pb2`. This is a long-standing upstream grpc_tools limitation (grpc/grpc#9575), not something specific to this repo — every consumer of grpc_tools that nests generated code in a package hits it.

**Version coupling to watch:** the generated `*_pb2_grpc.py` embeds a `GRPC_GENERATED_VERSION` check and raises `RuntimeError` at import time if the installed `grpcio` runtime is older than whatever `grpcio-tools` version produced it. `python/pyproject.toml`'s `grpcio` floor must stay >= the `grpcio-tools` version used for the last `codegen:py` run — bumping `grpcio-tools` in `dev` without bumping the `grpcio` runtime floor to match will break every consumer's import, not just this repo's build.

## Repo access

Requires one `vektor-platform` approver **and** one `vektor-ml` approver on every PR (VEKTOR-PRD.md §9.9) — this is the one repo where cross-team review is structurally required, not just requested.
