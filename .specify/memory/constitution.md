# Todo Web APP Phase 2 Constitution

## Core Principles

### I. Agent-Driven Development Workflow
Every feature development follows a strict agent orchestration pattern: Spec Writer → Architecture Planner → Implementation Agents (Frontend, Backend, Database) → Integration Tester. No deviations permitted. Each agent operates autonomously within its domain; hand-offs are explicit and tracked via specs and plans.

### II. Monorepo with Clear Separation of Concerns
Project structure must enforce strict boundaries: `specs/` for all design artifacts, `frontend/` for Next.js 16+ application, `backend/` for FastAPI services, shared configuration at root. No cross-cutting code leakage; each layer is independently deployable and testable.

### III. Security-First Authentication (Non-Negotiable)
Better Auth + JWT tokens on frontend; JWT verification required on every backend endpoint. Shared secret between frontend and backend (environment-secured). User ownership enforced on all API operations: `/api/{user_id}/tasks` pattern mandatory. No cross-user data leakage permitted—failures in isolation are critical bugs.

### IV. Frontend Excellence (Premium UX Standard)
UI must be professional, clean, and modern using shadcn/ui components with indigo color scheme and consistent shadow effects. Responsive design required (mobile-first). Lucide icons throughout. Dark mode support mandatory. Login/signup flows and task dashboard must deliver pixel-perfect experience first; backend can iterate in parallel.

### V. Test-First with Integration Focus (Non-Negotiable)
New features require integration tests validating: login flows, CRUD operations on tasks, user data isolation (no cross-user leakage). Unit tests for complex business logic. End-to-end testing via Integration Tester Agent mandatory before feature completion. No feature is "done" without passing isolation audits.

### VI. API Contracts Precede Implementation
Every backend endpoint must be defined in `specs/<feature>/contracts/` before coding. Contracts specify: request/response shapes, error codes, ownership validation rules, and authentication requirements. Architects review contracts; developers implement to spec—not ad-hoc.

### VII. Backend Simplicity (YAGNI + Minimal Coupling)
FastAPI endpoints are thin routers; business logic lives in SQLModel models and service functions. No middleware bloat. Every endpoint enforces JWT auth and user ownership. Errors are declarative; no silent failures. Dependencies are explicit and minimized.

## Development Standards

### Code Quality Gates

- **TypeScript/Next.js Frontend**: Strict mode enabled; no `any` types without justification; Tailwind CSS for styling (no inline styles).
- **Python/FastAPI Backend**: Type hints mandatory; SQLModel models define data contracts; Pydantic for validation at boundaries.
- **Database (SQLModel + Neon)**: Migrations tracked in version control; schema enforces ownership via `user_id` foreign keys; indexes on frequently queried columns.

### Performance & Constraints

- Frontend: Load in <2s (Lighthouse target); responsive layout <60ms on interaction.
- Backend: API responses <200ms p95; support concurrent user operations without data races.
- Database: Queries must use indexed columns; N+1 queries prohibited.

### Deployment & Operational Readiness

- All services deployed via standard CI/CD (GitHub Actions recommended).
- Environment secrets stored in `.env.local` (never in repo).
- Rollback strategy: feature flags for risky changes; canary deployments for production.

## Governance

**This Constitution is the source of truth.** All feature specifications, implementation plans, and code reviews must verify compliance.

- **Amendments**: Require explicit user approval; version bump documented (MAJOR.MINOR.PATCH).
- **Compliance Reviews**: Integration Tester agent performs isolation audits on all data-access features before merge.
- **Dispute Resolution**: Architectural decisions conflicting with principles require user intervention; no workarounds permitted.
- **Versioning Policy**: MAJOR = breaking principle changes; MINOR = new principle/section added; PATCH = clarifications/typos.

**Version**: 1.0.0 | **Ratified**: 2026-02-05 | **Last Amended**: 2026-02-05

---

## Sync Impact Report

<!-- Constitution Creation Report -->

**Version Change**: N/A → 1.0.0 (initial creation)

**New Sections**:
- Core Principles I–VII (agent workflow, monorepo structure, auth security, frontend UX, testing discipline, API contracts, backend simplicity)
- Development Standards (code quality, performance, deployment)
- Governance (amendment process, compliance, versioning)

**Templates Updated**:
- ✅ `spec-template.md` — Aligns with constitution user story prioritization (P1/P2/P3 matching agent workflow)
- ✅ `plan-template.md` — Constitution Check gate integrated; frontend prioritized per Principle IV
- ✅ `tasks-template.md` — Task organization reflects agent separation (Foundation → User Stories → Integration)
- ⚠️ `phr-template.prompt.md` — No changes required; routing logic already supports constitution stage

**Deferred Items**: None.

**Follow-up Actions**:
1. Create initial feature specs under `specs/<feature-name>/` using spec-template.md
2. Run `/sp.plan` for frontend architecture planning
3. Begin frontend implementation via Frontend Engineer Agent
4. Parallel backend planning; stagger implementation to prioritize frontend completion first

---
