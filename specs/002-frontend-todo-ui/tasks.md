---
description: "Task list for todo web app frontend implementation - Next.js 16+ with Better Auth + JWT, premium UI/UX"
---

# Tasks: Todo Web APP Frontend - Premium UI/UX

**Input**: Design documents from `/specs/002-frontend-todo-ui/`
**Prerequisites**: spec.md ✅, plan.md ✅
**Organization**: Tasks grouped by user story to enable independent implementation and testing
**Execution Strategy**: Sequential foundation → Parallel user stories (P1 core features first, P2/P3 additive)

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3) — omitted for Setup/Foundational phases
- Include exact file paths in descriptions

---

## Path Conventions

**Web app structure**: `frontend/` at repository root
**Paths shown below**:
- `frontend/` prefix used in descriptions (remove if executing from within frontend/)
- All paths are relative to `frontend/` directory

---

## Phase 1: Setup & Infrastructure

**Purpose**: Initialize project, install dependencies, configure tools
**Outcome**: Project ready to build auth system

- [ ] T001 Initialize Next.js 16+ project with TypeScript and App Router in `frontend/` directory
- [ ] T002 [P] Install npm dependencies: better-auth, lucide-react, tailwindcss, react, typescript in `frontend/package.json`
- [ ] T003 [P] Configure TypeScript strict mode in `frontend/tsconfig.json` (no `any` without justification)
- [ ] T004 [P] Setup Tailwind CSS with indigo color palette and dark mode (class strategy) in `frontend/tailwind.config.ts`
- [ ] T005 Create global styles with reset, focus rings, transitions in `frontend/app/globals.css`
- [ ] T006 Configure Next.js for API routes and routing in `frontend/next.config.ts`
- [ ] T007 Create `.env.local` with `NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api` and `BETTER_AUTH_SECRET`
- [ ] T008 [P] Create `frontend/.gitignore` with Next.js defaults and local env files

---

## Phase 2: Foundational (Auth Infrastructure - Blocking Prerequisites)

**Purpose**: Setup authentication framework that enables all user stories
**Outcome**: Auth system ready; users can sign up and log in; API calls attach JWT tokens

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T009 Setup Better Auth server config with JWT plugin in `frontend/lib/auth.ts` (BETTER_AUTH_SECRET, email+password auth, 24h expiry)
- [ ] T010 Create Next.js API catch-all route handler for Better Auth in `frontend/app/api/auth/[...all]/route.ts` (toNextJsHandler)
- [ ] T011 Create API client fetch wrapper with Bearer token attachment in `frontend/lib/api.ts` (getToken, Authorization header, error handling 401/4xx/5xx)
- [ ] T012 [P] Create client-side auth helpers (getSession, isAuthenticated, logout) in `frontend/lib/auth-client.ts`
- [ ] T013 [P] Create constants file with API_BASE_URL, color palette, app name in `frontend/lib/constants.ts`
- [ ] T014 Create Dark Mode Context + useTheme hook in `frontend/components/ThemeProvider.tsx` (localStorage persistence)
- [ ] T015 Create Header navigation component (logo, user info, logout, dark toggle) in `frontend/components/Header.tsx`
- [ ] T016 Create root layout with Header, ThemeProvider, and Tailwind setup in `frontend/app/layout.tsx`
- [ ] T017 [P] Create LoadingSpinner reusable component in `frontend/components/LoadingSpinner.tsx`
- [ ] T018 [P] Create ProtectedRoute wrapper for authenticated-only pages in `frontend/components/ProtectedRoute.tsx`
- [ ] T019 (Optional) Create middleware for protected route redirects in `frontend/middleware.ts` (check auth on protected routes)

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - User Registration & Account Setup (Priority: P1) 🎯 MVP

**Goal**: New users can sign up with email and password, receive validation feedback

**Independent Test**:
1. New user enters email and password in /signup form
2. Validation passes (email format, password ≥8 chars)
3. Form submits successfully
4. User is redirected to /signin
5. User can log in with created credentials

---

- [ ] T020 [US1] Create signup form page with email/password fields and validation in `frontend/app/signup/page.tsx`
  - Email input with format validation
  - Password input with min 8 chars validation
  - Confirm password with match validation
  - Submit button (disabled while loading)
  - Error display for duplicate email
  - Link to signin page
  - Redirect to / if already logged in

- [ ] T021 [US1] Add form submission logic to signup page: call `apiCall('/auth/signup', { email, password })` and redirect on success

- [ ] T022 [US1] Add error handling and user feedback (toast/alert) for signup failures in `frontend/app/signup/page.tsx`

---

## Phase 4: User Story 2 - User Authentication & Session Management (Priority: P1) 🎯 MVP

**Goal**: Users can log in and maintain sessions across page refreshes and logout

**Independent Test**:
1. User enters valid credentials on /signin
2. User is authenticated and redirected to /
3. Page refresh - user remains logged in
4. User clicks logout
5. Session is cleared and user redirected to /signin

---

- [ ] T023 [US2] Create signin form page with email/password fields in `frontend/app/signin/page.tsx`
  - Email and password inputs
  - Remember me checkbox (optional)
  - Submit button (disabled while loading)
  - Error display for invalid credentials
  - Link to signup page
  - Redirect to / if already logged in

- [ ] T024 [US2] Add signin form submission logic: call `apiCall('/auth/signin', { email, password })` and redirect to / on success in `frontend/app/signin/page.tsx`

- [ ] T025 [US2] Verify session persists across page refresh: getSession() called in layout on mount in `frontend/app/layout.tsx`

- [ ] T026 [US2] Add logout functionality to Header component: call `apiCall('/auth/signout')` and redirect to /signin in `frontend/components/Header.tsx`

- [ ] T027 [US2] Add error handling for signin failures and session expiry in `frontend/app/signin/page.tsx` and `frontend/lib/api.ts`

---

## Phase 5: User Story 3 - Task Dashboard Display (Priority: P1) 🎯 MVP

**Goal**: Logged-in users see all their tasks on a beautiful, responsive dashboard

**Independent Test**:
1. User logs in
2. Dashboard loads and displays all user's tasks
3. Tasks rendered as cards with title, description, status
4. Layout responsive: 1 col mobile, 2-3 cols desktop
5. Empty state shown if no tasks

---

- [ ] T028 [P] [US3] Create TaskCard component displaying individual task in `frontend/components/TaskCard.tsx` ('use client')
  - Display title (bold), description (snippet), status icon
  - Edit and Delete buttons (icon buttons with aria-labels)
  - Status checkbox (for toggle completion - cosmetic only for US3)
  - Styling: rounded-2xl, shadow-lg, hover effects, indigo accent
  - Props: task, onEdit, onDelete, onToggleComplete, onRefresh

- [ ] T029 [P] [US3] Create TaskList component with grid layout in `frontend/components/TaskList.tsx` ('use client')
  - Fetch tasks on mount: `getTasks()` via API client
  - Grid layout: grid-cols-1 md:grid-cols-2 lg:grid-cols-3
  - Render TaskCard for each task
  - Empty state: show message + "Create first task" button
  - Loading state: show spinner while fetching
  - Error state: show error message + retry button
  - Responsive gap and padding

- [ ] T030 [US3] Create dashboard page at `frontend/app/page.tsx` (main route)
  - Protected route (redirect to /signin if not authenticated)
  - Page title: "My Tasks"
  - Render TaskList component
  - Add "+ New Task" button (state for showing form - handled by US4)
  - Layout: max-w-7xl, centered, responsive padding

- [ ] T031 [US3] Add responsive design verification: test dashboard layout on mobile (390px), tablet (768px), desktop (1920px) in `frontend/components/TaskList.tsx` and `frontend/app/page.tsx`

---

## Phase 6: User Story 4 - Create New Task (Priority: P1) 🎯 MVP

**Goal**: Users can create new tasks with title and optional description

**Independent Test**:
1. User clicks "+ New Task" on dashboard
2. Task form appears
3. User enters title and description
4. Form submits successfully
5. New task appears on dashboard immediately
6. Form clears or hides

---

- [ ] T032 [P] [US4] Create TaskForm component for create/edit in `frontend/components/TaskForm.tsx` ('use client')
  - Title input (required, max 200 chars)
  - Description textarea (optional, max 1000 chars)
  - Submit button ("Create" or "Update" based on mode)
  - Cancel button
  - Client-side validation (title required, max lengths)
  - Props: task (for edit mode), onSubmit, onCancel, isLoading
  - Loading state on submit button

- [ ] T033 [US4] Add form submission logic to TaskForm: call `apiCall('/api/{user_id}/tasks', { title, description })` and call `onSubmit()` on success in `frontend/components/TaskForm.tsx`

- [ ] T034 [US4] Update dashboard page to show/hide TaskForm when "+ New Task" clicked in `frontend/app/page.tsx`
  - State: showForm (boolean)
  - Form appears when button clicked, disappears on submit/cancel
  - Refresh TaskList after form submit
  - Form is positioned above or inline with TaskList

- [ ] T035 [US4] Add error handling and user feedback for create task failures in `frontend/components/TaskForm.tsx` (show error message, allow retry)

- [ ] T036 [US4] Add loading states to form: disable submit button during request, show spinner in `frontend/components/TaskForm.tsx`

---

## Phase 7: User Story 5 - Edit Existing Task (Priority: P2)

**Goal**: Users can modify task title and description

**Independent Test**:
1. User clicks edit icon on task card
2. Task form populates with current values
3. User modifies title/description
4. Form submits successfully
5. Task card updates on dashboard
6. Changes persist on page refresh

---

- [ ] T037 [P] [US5] Update dashboard page to support edit mode: pass selected task to TaskForm in `frontend/app/page.tsx`
  - State: selectedTask (which task being edited)
  - State: editMode (true when editing)
  - When edit button clicked on TaskCard, set selectedTask and editMode=true
  - Form displays for editing

- [ ] T038 [US5] Update TaskForm to handle edit mode: prepopulate fields when task prop provided in `frontend/components/TaskForm.tsx`
  - If task prop: populate title and description with current values
  - Submit button shows "Update" instead of "Create"
  - Call PUT endpoint instead of POST

- [ ] T039 [US5] Add edit form submission logic: call `apiCall('/api/{user_id}/tasks/{id}', { title, description }, 'PUT')` in `frontend/components/TaskForm.tsx`

- [ ] T040 [US5] Add validation to prevent empty title on edit in `frontend/components/TaskForm.tsx`

- [ ] T041 [US5] Add error handling and retry for edit failures in `frontend/components/TaskForm.tsx`

---

## Phase 8: User Story 6 - Delete Task (Priority: P2)

**Goal**: Users can delete tasks with confirmation to prevent accidents

**Independent Test**:
1. User clicks delete icon on task card
2. Confirmation dialog appears
3. User clicks "Delete" to confirm
4. Task is deleted and removed from dashboard
5. Task is gone on page refresh

---

- [ ] T042 [P] [US6] Add delete confirmation logic to TaskCard component in `frontend/components/TaskCard.tsx`
  - Show confirmation dialog/modal when delete button clicked
  - Dialog has "Delete" and "Cancel" buttons
  - On confirm: call `onDelete(task.id)` from parent

- [ ] T043 [US6] Add delete handler to dashboard page in `frontend/app/page.tsx`
  - When delete confirmed: call `apiCall('/api/{user_id}/tasks/{id}', {}, 'DELETE')`
  - Show loading state during delete
  - Refresh TaskList after successful delete
  - Show error message if delete fails

- [ ] T044 [US6] Add error handling for delete failures in `frontend/app/page.tsx` (retry button, error message)

---

## Phase 9: User Story 7 - Toggle Task Completion Status (Priority: P2)

**Goal**: Users can mark tasks complete/incomplete with visual feedback

**Independent Test**:
1. User clicks completion checkbox on task
2. Task status toggles (complete ↔ incomplete)
3. Visual indicator updates (checkmark icon, color change)
4. Status persists on page refresh

---

- [ ] T045 [P] [US7] Add completion toggle handler to TaskCard component in `frontend/components/TaskCard.tsx`
  - When status checkbox/icon clicked: call `onToggleComplete(task.id)`
  - Show CheckCircle2 icon if completed, Circle icon if not
  - Add visual styling (strikethrough, color change) for completed tasks

- [ ] T046 [US7] Add toggle handler to dashboard page in `frontend/app/page.tsx`
  - When toggle confirmed: call `apiCall('/api/{user_id}/tasks/{id}', { completed: !task.completed }, 'PATCH')`
  - Show loading state during toggle
  - Refresh TaskList after successful toggle
  - Show error message if toggle fails

- [ ] T047 [US7] Add visual styling for completed tasks: strikethrough text, muted colors in `frontend/components/TaskCard.tsx` (dark mode support)

- [ ] T048 [US7] Add error handling and retry for toggle completion failures in `frontend/app/page.tsx`

---

## Phase 10: User Story 8 - Dark Mode Toggle (Priority: P3)

**Goal**: Users can switch between light and dark themes with preference persistence

**Independent Test**:
1. User clicks dark mode toggle in Header
2. Entire UI switches to dark colors
3. Page refresh - dark mode still active
4. All colors follow dark scheme (gray-950 backgrounds, light text)

---

- [ ] T049 [P] [US8] Verify dark mode toggle in Header component: Moon/Sun icon buttons in `frontend/components/Header.tsx`
  - onClick calls useTheme().toggleTheme()
  - Shows Moon icon in light mode, Sun icon in dark mode
  - Accessible with aria-label

- [ ] T050 [US8] Verify theme persistence in ThemeProvider: save to localStorage on toggle in `frontend/components/ThemeProvider.tsx`
  - On mount: read localStorage for saved preference
  - Default to system preference if not saved
  - Toggle: update state, save to localStorage, apply dark class to <html>

- [ ] T051 [US8] Verify all components have dark mode support: check all colors have dark: variants in `frontend/components/TaskCard.tsx`, `frontend/components/TaskForm.tsx`, `frontend/components/Header.tsx`, etc.

- [ ] T052 [US8] Verify dark mode colors follow spec: indigo primary, gray-950 backgrounds, gray-100 text in dark mode in all components

- [ ] T053 [US8] Test dark mode contrast: verify WCAG AA compliance (4.5:1 for small text) in light and dark modes

---

## Phase 11: Polish & Cross-Cutting Concerns

**Purpose**: Enhance UX, improve accessibility, verify performance and responsiveness
**Outcome**: Production-ready frontend with consistent polish and accessibility

- [ ] T054 [P] Add focus-visible rings to all interactive elements: buttons, inputs, links across all components (focus-visible:ring-2 focus:ring-indigo-500)

- [ ] T055 [P] Add aria-labels to all icon buttons (edit, delete, logout, theme toggle) across Header, TaskCard, other components

- [ ] T056 [P] Ensure semantic HTML throughout: form elements, button vs links, nav vs div for navigation headers in all components

- [ ] T057 [P] Verify keyboard navigation: Tab order logical, Enter submits forms, Escape cancels modals in all pages and components

- [ ] T058 Add loading states to all async operations: form submissions, task fetches, API calls show spinner or disabled state in TaskForm, TaskList, pages

- [ ] T059 Add retry buttons on all failed operations: failed task fetches, failed CRUD operations show error message + retry button

- [ ] T060 Add debounce/disable-while-pending to form submit buttons: prevent duplicate submissions in TaskForm, signin, signup

- [ ] T061 Implement empty state for dashboard: show message + "Create first task" button when user has no tasks in TaskList and page.tsx

- [ ] T062 Verify responsive design on all breakpoints:
  - Mobile (390px): 1 column, full-width cards, readable text
  - Tablet (768px): 2 columns, adequate padding
  - Desktop (1920px): 3 columns, max-width container
  - Test on actual devices or browser DevTools emulation

- [ ] T063 Verify mobile-friendly interactions: buttons 44px+ height, touch-friendly spacing, no hover-only functionality

- [ ] T064 Test form validation end-to-end: required fields, min/max lengths, email format, real-time feedback

- [ ] T065 Test error scenarios: network failures, 401 unauthorized, 500 server error, invalid form data - all show user-friendly messages

- [ ] T066 Verify performance: Lighthouse audit shows <2s load time, <200ms CRUD response perceived time, <60ms layout shifts

- [ ] T067 Review and optimize component re-renders: use React.memo for TaskCard, useCallback for handlers, prevent unnecessary re-renders

- [ ] T068 Verify color contrast across all text: Indigo on white ≥4.5:1, gray text on white ≥4.5:1, dark mode text contrast ≥4.5:1 (WCAG AA)

- [ ] T069 Add meta tags and SEO basics: title, description, favicon in layout.tsx

- [ ] T070 [P] Create README.md with setup instructions, development workflow, deployment notes

---

## Dependencies & Execution Order

```
Phase 1 (Setup) → Foundation
    ↓
Phase 2 (Auth Infrastructure) → BLOCKING (all stories depend on this)
    ↓
├─→ Phase 3 (US1: Signup) ──→ Phase 4 (US2: Login) → can run sequentially or parallel
├─→ Phase 5 (US3: Dashboard) → Phase 6 (US4: Create) → sequential (Create builds on Dashboard)
├─→ Phase 7 (US5: Edit) → can run parallel with Phase 6
├─→ Phase 8 (US6: Delete) → can run parallel with Phase 6/7
├─→ Phase 9 (US7: Toggle) → can run parallel with Phase 6/7/8
└─→ Phase 10 (US8: Dark Mode) → can run anytime after Phase 2 (independent)
    ↓
Phase 11 (Polish & Verification) → Final quality pass
```

### Parallel Execution Opportunities

**After Phase 2 (Auth Infrastructure)**:
- **Tasks T020-T027** can run in parallel:
  - T020-T022 (Signup)
  - T023-T027 (Signin)
  - These are independent — different files, different flows

**After Phase 5 (Dashboard)**:
- **Tasks T032-T048** can run mostly in parallel:
  - T032-T036 (Create Task) — builds on Dashboard
  - T037-T041 (Edit Task) — can run parallel to Create
  - T042-T044 (Delete Task) — can run parallel to Create/Edit
  - T045-T048 (Toggle Complete) — can run parallel to all above
- **Constraint**: These all depend on Dashboard (Phase 5) being complete

**Throughout**:
- **Tasks T054-T070** (Polish) can run in parallel on separate files — focus rings, accessibility, etc.

---

## Implementation Strategy: MVP-First Incremental Delivery

### MVP Scope (Production-Ready, Week 1)

Implement in order to deliver working product:

1. **Phase 1**: Setup (T001-T008)
2. **Phase 2**: Auth Foundation (T009-T019)
3. **Phase 3**: Signup (T020-T022)
4. **Phase 4**: Login (T023-T027)
5. **Phase 5**: Dashboard (T028-T031)
6. **Phase 6**: Create Task (T032-T036)
7. **Phase 11**: Core Polish (T054-T059, T064-T065)

**MVP Result**: Users can sign up → log in → see/create tasks → logout. Basic UI polish.

### Phase 2 Enhancements (Secondary Features, Week 2)

Add to MVP once core is stable:

8. **Phase 7**: Edit Task (T037-T041)
9. **Phase 8**: Delete Task (T042-T044)
10. **Phase 9**: Toggle Complete (T045-T048)
11. **Phase 10**: Dark Mode (T049-T053)
12. **Phase 11**: Advanced Polish (T060-T070)

**Full Product**: Complete CRUD, dark mode, premium UX, accessibility.

---

## Success Criteria for Implementation

### Core Functionality
- ✅ User signs up with email/password validation
- ✅ User logs in and is redirected to dashboard
- ✅ User remains logged in after page refresh
- ✅ User can see all their tasks on dashboard
- ✅ User can create new task with title + description
- ✅ User can edit existing task
- ✅ User can delete task with confirmation
- ✅ User can toggle task completion status
- ✅ User can toggle dark mode
- ✅ User can log out

### Visual & UX
- ✅ Premium design with clean spacing and shadows
- ✅ Indigo primary color used consistently
- ✅ Rounded-2xl cards with shadow-lg and hover effects
- ✅ Dark mode fully implemented with gray-950/gray-100 palette
- ✅ Fully responsive: 1 col (mobile) → 2 cols (tablet) → 3 cols (desktop)
- ✅ All focus rings visible (accessibility)
- ✅ lucide-react icons used throughout
- ✅ Loading states shown during async operations
- ✅ Empty state shown when no tasks
- ✅ Header sticky and visible on all pages

### Technical
- ✅ TypeScript strict mode, no `any` types without justification
- ✅ Better Auth + JWT authentication working
- ✅ JWT token attached to all API requests
- ✅ API errors handled with user-friendly messages
- ✅ Session persists across page refresh
- ✅ Keyboard navigation fully functional
- ✅ WCAG AA color contrast verified
- ✅ Semantic HTML used throughout
- ✅ <2s Lighthouse load time
- ✅ <200ms CRUD operations perceived time

---

## Testing Checklist (End-to-End Workflow)

Once all tasks complete, verify full user journey:

1. **Signup Flow**
   - [ ] Navigate to `/signup`
   - [ ] Enter valid email and password (≥8 chars)
   - [ ] Submit → redirected to `/signin`
   - [ ] User can log in with created credentials

2. **Login Flow**
   - [ ] Navigate to `/signin`
   - [ ] Enter valid credentials → redirected to `/`
   - [ ] Refresh page → user still logged in
   - [ ] Navigate away and back → session persists

3. **Dashboard & Task Creation**
   - [ ] Dashboard displays "My Tasks" heading
   - [ ] No tasks → empty state shown
   - [ ] Click "+ New Task" → form appears
   - [ ] Enter title and description → submit
   - [ ] Task appears on dashboard immediately
   - [ ] Refresh page → task persists

4. **Task CRUD**
   - [ ] Click edit icon → form populates with current values
   - [ ] Modify title/description → submit
   - [ ] Task updates on dashboard
   - [ ] Click delete icon → confirmation appears
   - [ ] Confirm → task removed
   - [ ] Toggle completion → status changes

5. **Dark Mode**
   - [ ] Click theme toggle in header → UI switches to dark
   - [ ] Refresh page → dark mode persists
   - [ ] All colors follow dark scheme

6. **Logout**
   - [ ] Click logout button → redirected to `/signin`
   - [ ] Try to access `/` → redirected to `/signin`
   - [ ] Session cleared

7. **Accessibility**
   - [ ] Tab through all elements → logical order
   - [ ] Enter on buttons → activates action
   - [ ] Focus rings visible on all interactive elements
   - [ ] No color-only information (text + icons)

8. **Responsiveness**
   - [ ] Mobile (390px): 1 column, readable, touch-friendly
   - [ ] Tablet (768px): 2 columns, proper spacing
   - [ ] Desktop (1920px): 3 columns, centered max-width

9. **Error Handling**
   - [ ] Signup with duplicate email → error shown
   - [ ] Login with wrong password → error shown
   - [ ] Submit form without title → validation error
   - [ ] Network error → user-friendly message + retry

10. **Performance**
    - [ ] Lighthouse: load time <2s
    - [ ] Lighthouse: no accessibility violations
    - [ ] CRUD operations: <200ms perceived time
    - [ ] Interactions: <60ms response time

