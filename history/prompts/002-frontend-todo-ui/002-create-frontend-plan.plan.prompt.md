---
id: "002"
title: "Create Frontend Implementation Plan"
stage: plan
date: 2026-02-05
surface: agent
model: claude-haiku-4-5-20251001
feature: 002-frontend-todo-ui
branch: 002-frontend-todo-ui
user: user
command: /sp.plan
labels: ["frontend", "planning", "architecture", "implementation"]
links:
  spec: specs/002-frontend-todo-ui/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/002-frontend-todo-ui/plan.md
tests:
  - Constitution Check validation
  - Phase decomposition
  - Dependency analysis
---

## Prompt

You are the project planner for hackathon-todo Phase II frontend.

My sp.specify is already complete. Now create a detailed, step-by-step PLAN for building the entire frontend only.

Goal: Build a beautiful, professional Next.js frontend with Better Auth + JWT, premium shadcn/ui-style UI (indigo primary, rounded-2xl cards, shadows, dark mode, lucide icons, responsive).

Key rules from sp.specify:
- Next.js 16+ App Router, TypeScript, Tailwind CSS
- Better Auth with JWT plugin (catch-all route handler)
- API client in lib/api.ts (attaches Bearer token, handles errors)
- Protected pages: redirect to /signin if not logged in
- Pages: layout, page (dashboard), signin, signup
- Components: Header, TaskForm, TaskCard, TaskList
- UI must be premium: clean spacing, hover effects, focus rings, mobile-first

Output a clear PLAN in this exact structure:

1. Overall Timeline & Phases
2. Detailed Step-by-Step Tasks
3. File Creation Order
4. Dependencies & Prerequisites
5. Success Criteria
6. Potential Risks & Fixes
7. Next Step After This Plan

## Response snapshot

**Plan Created**: `specs/002-frontend-todo-ui/plan.md` (730+ lines, comprehensive)

**Architecture Overview**:
- **5 Implementation Phases**: Setup & Auth → Layout → Auth Pages → Dashboard & Components → Polish & Testing
- **21 Detailed Tasks**: From project init to responsive design verification
- **22 File Creation Order**: Exact implementation sequence (lib/auth.ts → route handlers → components → pages)
- **Constitution Check**: ✅ PASS — All 7 principles satisfied; frontend isolated, auth security-first, shadcn/ui design system enforced

**Technical Stack**:
- Next.js 16+ with App Router
- TypeScript strict mode
- Tailwind CSS with indigo theme + dark mode
- Better Auth + JWT plugin
- lucide-react for icons
- React 19+

**Key Design Decisions**:
1. API client in `lib/api.ts` automatically attaches JWT Bearer token
2. Protected routes via middleware.ts (optional but recommended)
3. Dark mode via Context + localStorage persistence
4. Component-based architecture: reusable TaskForm, TaskCard, TaskList
5. Responsive grid: 1 col (mobile) → 2 cols (tablet) → 3 cols (desktop)

**Success Criteria** (47 checkboxes):
- Functional: signup → login → dashboard → CRUD tasks → logout
- Visual: premium design, indigo primary, dark mode, rounded-2xl cards
- Performance: <2s load, <200ms CRUD, <60ms layout recalc
- Accessibility: semantic HTML, WCAG AA contrast, keyboard nav, aria-labels

**Risks Identified** (10 + mitigations):
1. JWT token not attaching → verify auth headers
2. Session not persisting → check cookie/storage config
3. Dark mode incomplete → ensure dark: variants on all colors
4. CORS errors → backend CORS config needed
5. Form validation failing → add required attributes + server validation
6. Mobile layout breaking → mobile-first approach, 44px buttons
7. Slow task loading → React.memo, pagination
8. Password showing plain text → verify type="password"
9. Logout not clearing session → verify signout API call
10. Missing icons → verify lucide-react imports

**Dependencies**:
- NPM: better-auth, lucide-react, tailwindcss, next, react
- Env vars: BETTER_AUTH_SECRET, NEXT_PUBLIC_API_BASE_URL
- Backend prerequisite: API running at http://localhost:8000, Better Auth configured with same secret

**Next Steps**:
1. Approve plan
2. Frontend Engineer Agent implements files in exact order (lib/auth.ts first)
3. Test each file after creation
4. After all files: integration testing (signup → CRUD → logout)

## Outcome

- ✅ Impact: Complete frontend implementation plan ready for execution; no ambiguity on architecture, component hierarchy, or file order
- 🧪 Tests: Constitution Check passed; all 5 phases decomposed; 21 tasks with dependencies mapped; 10 risks identified with mitigation
- 📁 Files: `specs/002-frontend-todo-ui/plan.md` (730+ lines, fully detailed)
- 🔁 Next prompts: Run `/sp.tasks` to generate task list for issue tracking; then execute `/frontend-engineer-agent` for implementation
- 🧠 Reflection: Plan captures all UI/UX requirements, design system rules, authentication flow, API integration, and deployment readiness; frontend is ready for autonomous implementation

## Evaluation notes (flywheel)

- Failure modes observed: none (spec provided clear direction; plan follows spec exactly)
- Graders run and results (PASS/FAIL): PASS (constitution check passed; all files listed; all dependencies mapped; all risks with mitigations; success criteria comprehensive and measurable)
- Prompt variant (if applicable): none (first iteration)
- Next experiment: During implementation, verify each file passes build step before proceeding to next file; catch errors early
