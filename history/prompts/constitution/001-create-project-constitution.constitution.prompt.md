---
id: "001"
title: "Create Project Constitution"
stage: constitution
date: 2026-02-05
surface: agent
model: claude-haiku-4-5-20251001
feature: none
branch: 001-local-file-todo
user: user
command: /sp.constitution
labels: ["governance", "setup", "sdd-workflow"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - .specify/memory/constitution.md
tests:
  - none
---

## Prompt

Agents you control:
1. Architecture Planner Agent → makes big plan & folders
2. Spec Writer Agent → writes markdown specs
3. Frontend Engineer Agent → builds beautiful Next.js frontend (professional, shadcn/ui style, indigo colors, shadows, responsive, lucide icons)
4. Backend Engineer Agent → FastAPI routes + JWT check
5. Database Engineer Agent → SQLModel models + Neon connection
6. Integration Tester Agent → tests login + CRUD + isolation

Rules:
- Monorepo with specs/, frontend/, backend/
- Better Auth + JWT on frontend, verify on backend with same secret
- API: /api/{user_id}/tasks... (ownership enforced)
- UI: premium, clean, modern, dark mode support

Priority: Complete frontend first (auth setup, login/signup pages, task dashboard, beautiful cards/forms/list).

Workflow:
1. Spec Writer → write needed specs
2. Architecture Planner → plan frontend
3. Frontend Engineer → implement files one by one (lib/auth.ts, api/auth/[...all]/route.ts, lib/api.ts, layout, signin/signup, Header, TaskL

## Response snapshot

**Constitution v1.0.0 created successfully**

The Todo Web APP Phase 2 Constitution defines seven core principles:
1. **Agent-Driven Development Workflow** - Strict agent orchestration: Spec Writer → Architecture Planner → Implementation Agents → Integration Tester
2. **Monorepo Structure** - Enforced separation: `specs/`, `frontend/`, `backend/`
3. **Security-First Auth (Non-Negotiable)** - Better Auth + JWT, shared secret, user ownership enforced on all API operations
4. **Frontend Excellence** - Premium UX with shadcn/ui, indigo colors, responsive design, dark mode, lucide icons
5. **Test-First Integration Focus** - Login flows, CRUD ops, user isolation validation required
6. **API Contracts Precede Implementation** - Contracts in `specs/<feature>/contracts/` before coding
7. **Backend Simplicity** - FastAPI thin routers, SQLModel business logic, JWT + ownership on every endpoint

Development standards defined for code quality, performance, and deployment.

Constitution written to: `.specify/memory/constitution.md`

## Outcome

- ✅ Impact: Constitution establishes governance framework; all templates (spec, plan, tasks) aligned; ready for feature development
- 🧪 Tests: Constitutional principles validate against agent workflow; frontend prioritization enforced
- 📁 Files: `.specify/memory/constitution.md` (1 file, 84 lines)
- 🔁 Next prompts: Run `/sp.specify` for first feature spec; then `/sp.plan` for frontend architecture
- 🧠 Reflection: Constitution captured the full agent workflow, security requirements, and UI/UX standards from user input; establishes clear governance for disputes and amendments

## Evaluation notes (flywheel)

- Failure modes observed: none (template well-structured; user provided clear direction)
- Graders run and results (PASS/FAIL): PASS (all placeholders filled; version 1.0.0 set; ratification/amendment dates ISO formatted)
- Prompt variant (if applicable): none (first iteration)
- Next experiment: Monitor constitution compliance during feature development; may need MINOR bump if new principles emerge during planning phase
