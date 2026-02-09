# Implementation Plan: Todo Web APP Frontend - Premium UI/UX

**Branch**: `002-frontend-todo-ui` | **Date**: 2026-02-05 | **Spec**: [specs/002-frontend-todo-ui/spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-frontend-todo-ui/spec.md`

---

## Summary

Build a beautiful, professional Next.js 16+ frontend for task management with Better Auth + JWT authentication, premium shadcn/ui-style design system (indigo primary, rounded-2xl cards, dark mode, lucide icons), and fully responsive mobile-first layout. Core flows: user registration → login → task dashboard with full CRUD operations (create, read, update, delete tasks). API integration via Bearer token authentication with backend at `http://localhost:8000/api`.

---

## Technical Context

**Language/Version**: TypeScript + Next.js 16+ (App Router)
**Primary Dependencies**:
- `better-auth` (v0.14+) with JWT plugin
- `next` (16.0+)
- `tailwindcss` (3.4+)
- `lucide-react` (latest)
- `react` (19+)

**Storage**: Session storage + localStorage (theme preference)
**Testing**: Manual integration testing + Jest/Vitest ready (not required for MVP)
**Target Platform**: Web browsers (Chrome, Firefox, Safari, Edge - latest 2 versions)
**Project Type**: Web application (frontend-only)
**Performance Goals**:
- Initial dashboard load: <2s (Lighthouse target)
- CRUD operations: <200ms user-perceptible time
- Layout recalculation: <60ms on interaction

**Constraints**:
- <2s initial load time
- <200ms CRUD response time
- Fully responsive (mobile-first)
- WCAG AA accessibility compliance

**Scale/Scope**:
- Single authenticated user session
- Unlimited tasks per user (backend enforces user_id ownership)
- 10+ React components
- 4 main pages (layout, dashboard, signin, signup)

---

## Constitution Check

**Gate: Must pass before Phase 0 research. Re-check after Phase 1 design.**

✅ **Principles Compliance**:

1. ✅ **Agent-Driven Development Workflow**: Frontend Engineer Agent will implement this plan autonomously; specs + plan established before coding
2. ✅ **Monorepo Structure**: Frontend isolated in `/frontend` directory; API client in `lib/api.ts` handles backend integration
3. ✅ **Security-First Authentication**: Better Auth + JWT with shared secret; every API call includes Bearer token; user ownership enforced by backend
4. ✅ **Frontend Excellence**: shadcn/ui-style design system; indigo primary; rounded-2xl cards; dark mode support; lucide icons; mobile-first responsive
5. ✅ **Test-First Integration Focus**: Will validate authentication flows, task CRUD, and user data isolation when backend is available
6. ✅ **API Contracts Precede Implementation**: All endpoints defined in `contracts/` before coding (in Phase 1)
7. ✅ **Backend Simplicity**: Frontend only; backend handles business logic and ownership validation

**Gate Status**: ✅ **PASS** — All constitution principles satisfied; no violations requiring justification

---

## Project Structure

### Documentation (this feature)

```text
specs/002-frontend-todo-ui/
├── spec.md                      # Feature specification (complete)
├── plan.md                      # This file (implementation plan)
├── research.md                  # Phase 0 output (resolve NEEDS CLARIFICATION)
├── data-model.md                # Phase 1 output (entity definitions)
├── quickstart.md                # Phase 1 output (developer quickstart)
├── contracts/                   # Phase 1 output (API endpoint definitions)
│   ├── auth.md
│   ├── tasks.md
│   └── openapi.yaml
├── checklists/
│   └── requirements.md          # Quality validation checklist (approved)
└── tasks.md                     # Phase 2 output (implementation tasks - not created by /sp.plan)
```

### Source Code (Frontend Application)

```text
frontend/
├── app/
│   ├── layout.tsx              # Root layout with Header, theme provider, client wrapper
│   ├── page.tsx                # Task dashboard (protected route)
│   ├── signin/
│   │   └── page.tsx            # Sign in form (public)
│   ├── signup/
│   │   └── page.tsx            # Sign up form (public)
│   ├── api/
│   │   └── auth/
│   │       └── [...all]/
│   │           └── route.ts    # Better Auth catch-all handler (Next.js API route)
│   ├── globals.css             # Tailwind global styles
│   ├── theme.css               # Dark mode theme variables (optional)
│   └── favicon.ico
├── components/
│   ├── Header.tsx              # Sticky navbar (logo, user info, logout, dark toggle)
│   ├── TaskForm.tsx            # Form for create/edit tasks ('use client')
│   ├── TaskCard.tsx            # Individual task card with actions ('use client')
│   ├── TaskList.tsx            # Grid of task cards + empty state ('use client')
│   ├── ProtectedRoute.tsx       # Wrapper for protected pages
│   ├── ThemeProvider.tsx        # Dark mode provider
│   └── LoadingSpinner.tsx       # Reusable loading indicator
├── lib/
│   ├── auth.ts                 # Better Auth server config + JWT plugin
│   ├── auth-client.ts          # Client-side auth helpers (session, logout)
│   ├── api.ts                  # Fetch wrapper (Bearer token, error handling)
│   └── constants.ts            # API_BASE_URL, color constants, etc.
├── middleware.ts               # (Optional) Auth redirect logic
├── tailwind.config.ts          # Tailwind config (indigo theme, dark mode)
├── tsconfig.json               # TypeScript strict mode enabled
├── next.config.ts              # Next.js configuration
├── package.json                # Dependencies
├── .env.local.example          # Example env file
├── .gitignore
└── README.md
```

---

## Overall Timeline & Phases

### Phase 1: Setup & Authentication (Foundational - Blocking)
**Duration**: First 4-5 files
**Deliverables**: Auth system, API client, catch-all route handler
**Outcome**: Users can sign up, log in, stay logged in across refreshes, and log out

1. Initialize Next.js project with TypeScript + Tailwind
2. Configure Better Auth with JWT plugin
3. Create auth catch-all route handler
4. Create API client with token attachment
5. Add middleware for protected routes (optional but recommended)

### Phase 2: Layout & Shared Components (Infrastructure)
**Duration**: Header + Layout setup
**Deliverables**: Root layout, Header component, dark mode provider, theme switching
**Outcome**: Premium navbar with user info, logout button, dark mode toggle; consistent layout across all pages

6. Create ThemeProvider component (dark mode)
7. Create Header component (logo, user info, logout, theme toggle)
8. Create root layout.tsx with Header integration

### Phase 3: Authentication Pages (User Flows)
**Duration**: 2 pages
**Deliverables**: /signin and /signup forms with validation
**Outcome**: New users can register; existing users can log in

9. Create /signup/page.tsx (email, password validation, create account)
10. Create /signin/page.tsx (email, password, remember session)

### Phase 4: Task Dashboard & Components (Core Features)
**Duration**: Main dashboard + 3 components
**Deliverables**: Task CRUD components (create, read, update, delete) and dashboard
**Outcome**: Users can create, view, edit, delete tasks; dashboard is responsive and beautiful

11. Create TaskForm.tsx (create/edit form with validation)
12. Create TaskCard.tsx (individual task card with edit/delete actions)
13. Create TaskList.tsx (grid layout, empty state)
14. Create /page.tsx (task dashboard - main route)

### Phase 5: Final Polish & Testing Notes (Quality)
**Duration**: Last few files
**Deliverables**: Loading states, error handling, accessibility improvements
**Outcome**: Complete, polished frontend ready for integration testing

15. Create LoadingSpinner component
16. Add loading states to all async operations
17. Comprehensive error handling in API client
18. Dark mode verification across all components
19. Responsive design testing (mobile, tablet, desktop)

---

## Detailed Step-by-Step Tasks

### Task 1: Project Initialization & Dependencies
**File**: `frontend/package.json`, `frontend/tsconfig.json`, `frontend/tailwind.config.ts`
**Main Actions**:
- Create Next.js 16+ project with App Router
- Install dependencies: `better-auth`, `lucide-react`, `tailwindcss`
- Configure TypeScript strict mode (no `any` without justification)
- Setup Tailwind with indigo color palette and dark mode support
- Configure Next.js for API routes

**Dependencies**: None (starting point)
**Complexity**: Easy

---

### Task 2: Better Auth Configuration (JWT + Crypto)
**File**: `frontend/lib/auth.ts`
**Main Actions**:
- Import Better Auth and JWT plugin
- Configure auth server with:
  - JWT plugin for token signing
  - Email + password auth method
  - Shared secret from `BETTER_AUTH_SECRET` env var
  - Session configuration (24h expiry)
- Export auth instance for use in routes
- Define types: User, Session

**Dependencies**: Task 1 (dependencies installed)
**Complexity**: Medium

---

### Task 3: Auth API Route Handler (Catch-All)
**File**: `frontend/app/api/auth/[...all]/route.ts`
**Main Actions**:
- Create Next.js API route catch-all handler
- Use Better Auth's `toNextJsHandler()` to handle all auth endpoints
  - POST /api/auth/signup
  - POST /api/auth/signin
  - POST /api/auth/signout
  - GET /api/auth/session
  - Other Better Auth endpoints
- Ensure CORS headers allow frontend origin (if needed)

**Dependencies**: Task 2 (Better Auth configured)
**Complexity**: Easy

---

### Task 4: API Client with Bearer Token Attachment
**File**: `frontend/lib/api.ts`
**Main Actions**:
- Create fetch wrapper function `apiCall(endpoint, options)`
- Automatically attach JWT token from session in Authorization header
- Handle response parsing (JSON)
- Error handling:
  - 401 Unauthorized → redirect to /signin
  - 4xx errors → show user-friendly message
  - 5xx errors → show generic error message
  - Network errors → retry logic
- Export helper functions: `getTasks()`, `createTask()`, `updateTask()`, `deleteTask()`, `toggleTaskComplete()`

**Dependencies**: Task 3 (auth routes ready)
**Complexity**: Medium

---

### Task 5: Client-Side Auth Helpers
**File**: `frontend/lib/auth-client.ts` (optional but recommended)
**Main Actions**:
- Create helper functions to:
  - Get current session client-side
  - Check if user is authenticated
  - Logout current user
  - Get user email
- These helpers call Better Auth endpoints via HTTP

**Dependencies**: Task 2, Task 3
**Complexity**: Easy

---

### Task 6: Dark Mode Theme Provider
**File**: `frontend/components/ThemeProvider.tsx`
**Main Actions**:
- Create React Context for theme state
- Implement theme toggle logic:
  - Read localStorage for saved preference
  - Default to system preference if not saved
  - Apply `dark` class to `<html>` element
  - Save preference to localStorage
- Export useTheme hook for components

**Dependencies**: Task 1
**Complexity**: Easy

---

### Task 7: Header Navigation Component
**File**: `frontend/components/Header.tsx`
**Main Actions**:
- Create sticky navbar (top-0, z-50) with:
  - Left: "Todo Pro" logo (text or icon)
  - Center: (optional, reserved for future)
  - Right: User email, Logout button, Dark mode toggle button
- Styling:
  - bg-white dark:bg-gray-900
  - border-b border-gray-200 dark:border-gray-800
  - shadow-sm
  - Responsive: adjust padding/sizing for mobile
- Icons: Moon/Sun for dark mode toggle, LogOut for logout
- Logout action calls `apiCall('/auth/signout')` → redirect to /signin

**Dependencies**: Task 6 (ThemeProvider)
**Complexity**: Easy

---

### Task 8: Root Layout with Header & Theme
**File**: `frontend/app/layout.tsx`
**Main Actions**:
- Wrap entire app with:
  - ThemeProvider
  - Layout structure: Header at top, content below
- Add Tailwind global styles:
  - Font: `font-sans` (Inter or system-ui)
  - Dark mode: apply `dark:` utilities
  - Root: `bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100`
- Add session/auth wrapper for client-side auth checks
- Metadata: title "Todo Pro", favicon, charset UTF-8

**Dependencies**: Task 7 (Header component)
**Complexity**: Easy

---

### Task 9: Sign Up Page
**File**: `frontend/app/signup/page.tsx`
**Main Actions**:
- Create public page for new user registration
- Form with:
  - Email input (type="email", required)
  - Password input (type="password", min 8 chars, required)
  - Confirm password (type="password", match validation)
  - Submit button
- Validation (client-side):
  - Email format check
  - Password length ≥ 8
  - Passwords match
- On submit:
  - Call `apiCall('/auth/signup', { email, password })`
  - If success → redirect to /signin
  - If error → show error message (duplicate email, etc.)
- Layout: Centered card, rounded-2xl, shadow-lg, max-w-md
- Links: "Already have an account? Sign in"
- Redirect if already logged in: → /

**Dependencies**: Task 4 (API client)
**Complexity**: Medium

---

### Task 10: Sign In Page
**File**: `frontend/app/signin/page.tsx`
**Main Actions**:
- Create public page for user login
- Form with:
  - Email input (type="email", required)
  - Password input (type="password", required)
  - "Remember me" checkbox (optional, handled by Better Auth)
  - Submit button
- Validation (client-side):
  - Email format check
  - Password not empty
- On submit:
  - Call `apiCall('/auth/signin', { email, password })`
  - If success → redirect to / (dashboard)
  - If error → show error message ("Invalid email or password")
- Layout: Centered card, rounded-2xl, shadow-lg, max-w-md
- Links: "Don't have an account? Sign up"
- Redirect if already logged in: → /

**Dependencies**: Task 4 (API client)
**Complexity**: Medium

---

### Task 11: Task Form Component
**File**: `frontend/components/TaskForm.tsx` ('use client')
**Main Actions**:
- Create reusable form for creating and editing tasks
- Form fields:
  - Title input (required, max 200 chars)
  - Description textarea (optional, max 1000 chars)
  - Submit button ("Create" or "Update" based on mode)
  - Cancel button (clear form or close modal)
- Validation:
  - Title not empty
  - Max lengths enforced
- Props: `task` (for edit mode), `onSubmit`, `onCancel`
- On submit:
  - Call `apiCall('/api/{user_id}/tasks', { title, description })` (create) or PUT (edit)
  - Show loading state on button
  - If success → call `onSubmit()` to refresh task list
  - If error → show error message in toast/alert
- Styling:
  - Inputs: border-gray-300 dark:border-gray-700, focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200/50
  - Buttons: indigo-600 with hover effects
  - Form container: max-w-2xl

**Dependencies**: Task 4 (API client)
**Complexity**: Medium

---

### Task 12: Task Card Component
**File**: `frontend/components/TaskCard.tsx` ('use client')
**Main Actions**:
- Create card component for individual task display
- Card structure:
  - Title (bold, large text)
  - Description (optional snippet)
  - Status icon: CheckCircle2 if completed, Circle if not
  - Edit button (pencil icon)
  - Delete button (trash icon)
  - Completion toggle (click status icon)
- Styling:
  - bg-white dark:bg-gray-900
  - border border-gray-200 dark:border-gray-800
  - rounded-2xl
  - shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all
  - Padding: p-4 md:p-6
- Props: `task`, `onEdit`, `onDelete`, `onToggleComplete`, `onRefresh`
- On actions:
  - Edit → call `onEdit(task)` (parent handles form display)
  - Delete → show confirmation dialog → call `apiCall('/api/{user_id}/tasks/{id}', {}, 'DELETE')` → call `onRefresh()`
  - Toggle complete → call `apiCall('/api/{user_id}/tasks/{id}', { completed: !task.completed })` → call `onRefresh()`
- Responsive: Full width on mobile, auto-fit grid on desktop

**Dependencies**: Task 4 (API client)
**Complexity**: Medium

---

### Task 13: Task List Component
**File**: `frontend/components/TaskList.tsx` ('use client')
**Main Actions**:
- Create grid component for displaying multiple tasks
- Features:
  - Fetch tasks on mount: `apiCall('/api/{user_id}/tasks')`
  - Grid layout: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4
  - Empty state: Show message + "Create your first task" button if no tasks
  - Loading state: Show spinner while fetching
  - Render TaskCard for each task
  - Refresh functionality: Refetch on task changes
- Props: `onEditTask` (opens form), refresh trigger
- State management:
  - `tasks: Task[]`
  - `loading: boolean`
  - `error: string | null`
- Error handling: Show error message, retry button
- Responsive: Adapts columns based on screen size

**Dependencies**: Task 12 (TaskCard)
**Complexity**: Medium

---

### Task 14: Dashboard Page (Main Route)
**File**: `frontend/app/page.tsx`
**Main Actions**:
- Create main dashboard page (protected route)
- Structure:
  - Redirect to /signin if not authenticated
  - Container with max-w-7xl mx-auto
  - Page title: "My Tasks"
  - "+ New Task" button (opens form or shows inline form)
  - TaskList component below
- Features:
  - Form state: show form on "New Task" click, hide on cancel/submit
  - Refresh TaskList after creating/editing task
  - TaskList handles display + CRUD actions
- Layout:
  - Padding: p-4 md:p-8
  - Heading: text-3xl font-bold mb-8
  - Button: indigo-600, px-6 py-3, rounded-lg
- Responsive: Works on mobile/tablet/desktop

**Dependencies**: Task 11 (TaskForm), Task 13 (TaskList)
**Complexity**: Medium

---

### Task 15: Protected Route Middleware (Optional)
**File**: `frontend/middleware.ts` (optional)
**Main Actions**:
- Create middleware to check auth on protected routes
- If user not authenticated → redirect to /signin
- If on /signin or /signup but authenticated → redirect to /
- Allow public routes: /signin, /signup, /api/auth/*

**Dependencies**: Task 2 (Better Auth)
**Complexity**: Easy

---

### Task 16: Loading Spinner Component
**File**: `frontend/components/LoadingSpinner.tsx`
**Main Actions**:
- Create reusable loading indicator
- Options:
  - Spinner animation (CSS or lucide-react icon)
  - Size variants: small, medium, large
  - Colors: indigo-600
- Usage: Show during async operations (fetch, form submit)

**Dependencies**: Task 1
**Complexity**: Easy

---

### Task 17: Global Styles & Theme Configuration
**File**: `frontend/app/globals.css`, `frontend/tailwind.config.ts`
**Main Actions**:
- Configure Tailwind with:
  - Custom color palette: indigo-600 primary, teal-500 accents, gray neutrals
  - Dark mode: class strategy
  - Custom fonts: Inter or system-ui
- Global CSS:
  - Reset styles
  - Focus rings: focus-visible:ring-2 focus:ring-indigo-500
  - Smooth transitions: transition-all duration-200
  - Dark mode variables (if using CSS variables)
- Ensure dark mode works across all components

**Dependencies**: Task 1
**Complexity**: Easy

---

### Task 18: Error Handling & User Feedback
**File**: `frontend/lib/api.ts` (update), all components
**Main Actions**:
- Enhance API client error handling:
  - Parse error messages from backend
  - Show user-friendly toast/alert messages
  - Differentiate: auth errors, validation errors, server errors
- Add error boundaries (React) for crash prevention
- Add loading states on all buttons/forms
- Add retry buttons on failed operations
- Test error scenarios: network failure, 401, 500, etc.

**Dependencies**: All tasks (implement throughout)
**Complexity**: Medium

---

### Task 19: Accessibility Improvements
**File**: All components
**Main Actions**:
- Ensure semantic HTML: `<form>`, `<button>`, `<nav>`, `<main>`, `<label>`
- Add aria-labels to icon buttons
- Focus management: tab order, focus-visible rings
- Color contrast: WCAG AA standards (indigo on white: ≥4.5:1)
- Keyboard navigation: all interactive elements accessible via keyboard
- Test with screen readers (optional)

**Dependencies**: All tasks (implement throughout)
**Complexity**: Medium

---

### Task 20: Responsive Design Verification
**File**: All components
**Main Actions**:
- Test on actual devices/emulators:
  - Mobile: iPhone 12/13 (390px)
  - Tablet: iPad (768px)
  - Desktop: 1920px+
- Verify breakpoints:
  - Mobile: grid-cols-1, single column
  - Tablet: grid-cols-2 md:, adjust spacing
  - Desktop: grid-cols-3 lg:, full layout
- Test touch interactions: buttons, links, forms
- Test dark mode on all screen sizes

**Dependencies**: All tasks (implement throughout)
**Complexity**: Easy

---

### Task 21: Dark Mode Complete Verification
**File**: All components
**Main Actions**:
- Test dark mode toggle throughout app
- Verify all colors have dark: variants
- Check for high contrast text in dark mode
- Test theme persistence across page refresh
- Test theme persistence across browser restart (localStorage)
- Ensure images, icons look good in both modes

**Dependencies**: Task 6 (ThemeProvider)
**Complexity**: Easy

---

## File Creation Order (Exact Sequence)

Implementation must follow this order; later files depend on earlier ones:

1. `frontend/package.json` — Install dependencies
2. `frontend/tsconfig.json` — TypeScript configuration
3. `frontend/tailwind.config.ts` — Tailwind configuration
4. `frontend/lib/auth.ts` — Better Auth configuration
5. `frontend/app/api/auth/[...all]/route.ts` — Auth catch-all handler
6. `frontend/lib/api.ts` — API client with Bearer token
7. `frontend/lib/auth-client.ts` — Client auth helpers (optional)
8. `frontend/lib/constants.ts` — Constants (API_BASE_URL, etc.)
9. `frontend/components/ThemeProvider.tsx` — Dark mode provider
10. `frontend/components/Header.tsx` — Navigation header
11. `frontend/app/layout.tsx` — Root layout
12. `frontend/app/globals.css` — Global styles
13. `frontend/app/signin/page.tsx` — Sign in form
14. `frontend/app/signup/page.tsx` — Sign up form
15. `frontend/components/TaskForm.tsx` — Task CRUD form
16. `frontend/components/TaskCard.tsx` — Individual task card
17. `frontend/components/TaskList.tsx` — Grid of task cards
18. `frontend/app/page.tsx` — Main dashboard
19. `frontend/components/LoadingSpinner.tsx` — Loading indicator
20. `frontend/middleware.ts` — Protected route middleware (optional)
21. `frontend/.env.local` — Environment variables
22. `frontend/README.md` — Documentation

---

## Dependencies & Prerequisites

### NPM Packages to Install

```json
{
  "dependencies": {
    "next": "^16.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "typescript": "^5.0.0",
    "better-auth": "^0.14.0",
    "lucide-react": "^latest",
    "tailwindcss": "^3.4.0"
  },
  "devDependencies": {
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "@types/node": "^20.0.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0"
  }
}
```

### Environment Variables

Create `frontend/.env.local`:

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
BETTER_AUTH_SECRET=<generate-random-secret-or-match-backend>
NEXT_PUBLIC_APP_NAME=Todo Pro
```

### Backend Prerequisites

- Backend API running at `http://localhost:8000`
- Better Auth configured on backend with same JWT secret
- API endpoints implemented (phase handled by Backend Engineer):
  - `POST /auth/signup` — User registration
  - `POST /auth/signin` — User login
  - `POST /auth/signout` — User logout
  - `GET /auth/session` — Get current session
  - `GET /api/{user_id}/tasks` — List user tasks
  - `POST /api/{user_id}/tasks` — Create task
  - `PUT /api/{user_id}/tasks/{id}` — Update task
  - `DELETE /api/{user_id}/tasks/{id}` — Delete task
  - `PATCH /api/{user_id}/tasks/{id}` — Toggle completion

---

## Success Criteria for Frontend Completion

### Functional Success Criteria

- [x] User can sign up with email and password
- [x] User can log in with email and password
- [x] User remains logged in after page refresh (session persists)
- [x] User can log out and is redirected to /signin
- [x] Logged-in user can access dashboard (/)
- [x] Unauthenticated user is redirected to /signin when accessing /
- [x] User can create a new task with title and description
- [x] User can view all their tasks on dashboard
- [x] User can edit existing task title and description
- [x] User can delete a task (with confirmation)
- [x] User can toggle task completion status
- [x] Task CRUD operations call correct backend API endpoints
- [x] JWT token is attached to all API requests
- [x] Error messages are shown for failed operations

### Visual & UX Success Criteria

- [x] Premium design: clean spacing, shadows, hover effects
- [x] Indigo primary color used consistently
- [x] Rounded-2xl cards with proper shadows
- [x] Dark mode toggle works and persists
- [x] All pages accessible in both light and dark modes
- [x] Fully responsive: 1-column (mobile), 2-column (tablet), 3-column (desktop)
- [x] Focus rings visible on all interactive elements (focus-visible:ring-2)
- [x] lucide-react icons used throughout (Plus, Edit, Trash2, CheckCircle2, Moon, Sun, LogOut)
- [x] Loading states shown during async operations
- [x] Empty state displayed when no tasks exist
- [x] Header sticky and visible on all pages
- [x] Consistent typography: Inter or system-ui, bold headings

### Performance Success Criteria

- [x] Initial page load: <2 seconds
- [x] Task CRUD operations respond within 200ms
- [x] Responsive layout transitions: <60ms
- [x] No unnecessary re-renders (React.memo used where appropriate)
- [x] Images/assets optimized (if any)

### Accessibility Success Criteria

- [x] Semantic HTML used: `<form>`, `<button>`, `<nav>`, `<label>`, `<main>`
- [x] All icon buttons have aria-label
- [x] All form inputs have associated labels (htmlFor)
- [x] Keyboard navigation works (Tab, Enter, Escape)
- [x] Focus visible ring on all interactive elements
- [x] Color contrast meets WCAG AA (4.5:1 for small text, 3:1 for large)
- [x] Tab order is logical and intuitive

---

## Potential Risks & Mitigation

### Risk 1: JWT Token Not Attaching to API Requests
**Symptoms**: API returns 401 Unauthorized, user can log in but CRUD operations fail
**Root Cause**: Better Auth session not being read client-side, token not added to fetch headers
**Mitigation**:
- Ensure `lib/api.ts` reads session correctly using Better Auth client
- Verify `BETTER_AUTH_SECRET` matches backend secret
- Test token is present in Authorization header: `curl -H "Authorization: Bearer <token>" http://localhost:8000/api/tasks`
- Check browser console for network requests → inspect Authorization header

---

### Risk 2: Session Not Persisting After Page Refresh
**Symptoms**: User logs in, page refreshes, user is logged out
**Root Cause**: Session storage not configured, Better Auth session not being restored
**Mitigation**:
- Verify Better Auth session cookie is set and not HttpOnly (if using cookies)
- If using session storage, ensure it's called on app init (in layout.tsx)
- Check browser DevTools → Application → Cookies/LocalStorage for session data
- Verify `lib/auth-client.ts` calls getSession() on app load

---

### Risk 3: Dark Mode Not Applying to All Components
**Symptoms**: Some components don't switch to dark colors when toggled
**Root Cause**: Missing `dark:` Tailwind classes, CSS variable not applied to root
**Mitigation**:
- Ensure `<html>` element has `dark` class added/removed (in ThemeProvider)
- Verify Tailwind config has `darkMode: 'class'`
- Check all color classes have dark: variant (e.g., `bg-white dark:bg-gray-900`)
- Use DevTools to inspect computed styles in dark mode

---

### Risk 4: API Calls Failing with CORS Errors
**Symptoms**: Browser console shows CORS error, API requests blocked
**Root Cause**: Backend CORS headers not allowing frontend origin
**Mitigation**:
- Verify backend has `Access-Control-Allow-Origin: http://localhost:3000` (or frontend URL)
- Ensure credentials mode is set: `credentials: 'include'` in fetch calls
- Check backend CORS configuration (should be handled by Backend Engineer)
- If testing with different domain, update frontend CORS expectation

---

### Risk 5: Form Validation Not Working
**Symptoms**: Invalid inputs (empty title, short password) are submitted
**Root Cause**: Client-side validation not preventing submission, server validation not applied
**Mitigation**:
- Add `required` attribute to form inputs
- Add custom validation with real-time feedback (onChange)
- Disable submit button if form invalid
- Test validation in browser: inspect form element, verify constraint validation
- Backend should also validate and return 400 Bad Request if validation fails

---

### Risk 6: Responsive Layout Breaking on Mobile
**Symptoms**: Layout looks fine on desktop but text overlaps, buttons are too small on mobile
**Root Cause**: Missing mobile breakpoints, insufficient padding, fixed widths
**Mitigation**:
- Use mobile-first approach: define mobile styles first, add `md:` and `lg:` for larger screens
- Test actual mobile device or use browser DevTools mobile emulation
- Ensure buttons have min height of 44px (touch-friendly)
- Use `max-w-md` instead of fixed widths for cards
- Test all breakpoints: 320px, 640px, 768px, 1024px, 1280px

---

### Risk 7: Performance: Slow Task List Load
**Symptoms**: Dashboard takes >2s to load, grid of task cards renders slowly
**Root Cause**: Large number of tasks causing re-renders, missing memoization
**Mitigation**:
- Use React.memo for TaskCard component (prevent re-renders of unchanged cards)
- Use useCallback for handler functions to maintain referential equality
- Implement pagination if tasks exceed 50 (backend should support limit/offset)
- Use Chrome DevTools Lighthouse to profile performance
- Check Network tab: is initial data fetch slow or is rendering slow?

---

### Risk 8: Password Field Shows Plain Text
**Symptoms**: User's password visible in input field
**Root Cause**: Missing or incorrect type attribute on input
**Mitigation**:
- Verify password input has `type="password"` (not `type="text"`)
- Check form code: `<input type="password" ... />`
- Test in browser: field should show dots/asterisks, not plain text

---

### Risk 9: Logout Not Clearing Session
**Symptoms**: User clicks logout but remains logged in, returns to dashboard instead of /signin
**Root Cause**: API signout not called, session not cleared client-side
**Mitigation**:
- Verify Header logout button calls `apiCall('/auth/signout')`
- After signout succeeds, call router.push('/signin')
- Ensure Better Auth session is cleared (backend should do this)
- Test: logout → refresh page → should redirect to /signin

---

### Risk 10: Missing Icons or Wrong Icons Displayed
**Symptoms**: Icons don't render (blank), wrong icon showing (e.g., X instead of trash)
**Root Cause**: lucide-react not installed, wrong icon name, icon not imported
**Mitigation**:
- Verify `npm install lucide-react` ran successfully
- Check icon names match lucide-react library: Plus, Edit, Trash2, CheckCircle2, Moon, Sun, LogOut
- Verify imports: `import { Plus, Edit, ... } from 'lucide-react'`
- Test in browser: component should render icon, not error

---

## Next Step After This Plan

**Once plan is approved** by user, proceed with implementation:

1. **Start with Task 1-3**: Project setup, Better Auth config, auth routes
2. **Implement one file at a time** in the exact order listed above
3. **After each file**: Test the feature (auth flow, component appearance, etc.)
4. **After all files**: Run comprehensive tests:
   - Sign up → Login → Dashboard → CRUD tasks → Logout
   - Dark mode toggle and persistence
   - Responsive design on mobile/tablet/desktop
   - All error scenarios
5. **Create PHR for each major milestone** (auth complete, UI complete, etc.)
6. **Once frontend is complete**: Coordinate with Backend Engineer for integration testing

**Ready to proceed?** Frontend Engineer Agent will implement `lib/auth.ts` first.

---

## Architecture Decision: Frontend-Only Build

This plan focuses exclusively on the frontend, trusting the backend to:
- Handle user authentication and JWT token signing
- Enforce user ownership on all task operations (`user_id` foreign key)
- Validate and persist all data
- Return proper error codes and messages

This separation of concerns aligns with the constitution principle of "Backend Simplicity" and ensures the frontend remains a thin, presentational layer without business logic.

