# ADR 0001: Monorepo Baseline

- Date: 2026-02-21
- Status: Accepted

## Context
The project starts with empty app/package directories and needs a baseline for AI-driven parallel implementation.

## Decision
- Use Bun Workspaces as the only monorepo runtime/tooling baseline.
- Keep backend in 3 layers (`schemas/usecase/infrastructure`) and add schema split (`domain/api/openapi`).
- Adopt Next.js + kumo-oriented UI structure for frontend.

## Consequences
- Low initial complexity, with room to add build orchestration later.
- API contract and shared types become the integration boundary for parallel agents.
