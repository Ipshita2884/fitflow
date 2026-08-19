# FitFlow — Fitness & Zumba Management Platform
## Architecture Package (Phase 0)

> This document is the single source of truth before any implementation begins. It covers: folder structure, ERD, Prisma schema summary, REST API contract, WebSocket event contract, frontend route map, design system, and the build roadmap.

---

## A. High-Level Architecture

```
┌─────────────────────┐        HTTPS/REST         ┌──────────────────────┐
│   Next.js 14 (App    │ ─────────────────────────▶│  Express API Server   │
│   Router) — Frontend │◀───────────────────────── │  (TypeScript)         │
│                       │        WSS/Socket.IO      │                       │
│  - React + TS         │◀──────────────────────────▶│ - Controllers        │
│  - Tailwind + shadcn  │                            │ - Services            │
│  - Zustand (client    │                            │ - Repositories (Prisma)│
│    state)             │                            │ - Socket.IO gateway   │
│  - React Query for    │                            │ - BullMQ workers      │
│    server cache        │                            │                       │
└─────────────────────┘                            └──────────┬────────────┘
                                                                │
                                        ┌───────────────────────┼───────────────────────┐
                                        ▼                       ▼                       ▼
                                ┌───────────────┐      ┌────────────────┐      ┌────────────────┐
                                │  PostgreSQL    │      │  Redis          │      │  Cloudinary     │
                                │  (Prisma ORM)  │      │  (cache, pub/sub,│      │  (media storage)│
                                │                │      │  BullMQ queues) │      │                 │
                                └───────────────┘      └────────────────┘      └────────────────┘
```

**Why this split:** Next.js handles SSR for the public/marketing pages (SEO on the trainer landing page matters) and client-side rendering for authenticated dashboards. A separate Express API keeps REST + WebSocket concerns (auth, RBAC, real-time gateway) independent of the rendering layer, so the API can later serve a mobile app without change. Redis is shared between Socket.IO (adapter, for horizontal scaling) and BullMQ (report generation, email jobs, milestone-detection jobs).

---

## B. Monorepo Folder Structure

```
fitflow/
├── apps/
│   ├── web/                          # Next.js frontend
│   │   ├── app/
│   │   │   ├── (marketing)/          # public landing, SEO'd
│   │   │   │   ├── page.tsx
│   │   │   │   ├── trainer/[slug]/page.tsx
│   │   │   ├── (auth)/
│   │   │   │   ├── login/page.tsx
│   │   │   │   ├── signup/page.tsx
│   │   │   │   ├── forgot-password/page.tsx
│   │   │   │   ├── reset-password/[token]/page.tsx
│   │   │   │   ├── verify-email/[token]/page.tsx
│   │   │   ├── (trainer)/
│   │   │   │   ├── dashboard/page.tsx
│   │   │   │   ├── clients/page.tsx
│   │   │   │   ├── clients/[id]/page.tsx
│   │   │   │   ├── sessions/page.tsx
│   │   │   │   ├── sessions/builder/page.tsx
│   │   │   │   ├── attendance/page.tsx
│   │   │   │   ├── messages/page.tsx
│   │   │   │   ├── reports/page.tsx
│   │   │   │   ├── profile/page.tsx
│   │   │   │   ├── reviews/page.tsx
│   │   │   ├── (client)/
│   │   │   │   ├── dashboard/page.tsx
│   │   │   │   ├── sessions/page.tsx
│   │   │   │   ├── progress/page.tsx
│   │   │   │   ├── goals/page.tsx
│   │   │   │   ├── calories/page.tsx
│   │   │   │   ├── messages/page.tsx
│   │   │   │   ├── trainer/page.tsx
│   │   │   ├── layout.tsx
│   │   │   ├── globals.css
│   │   ├── components/
│   │   │   ├── ui/                   # shadcn primitives (button, card, dialog…)
│   │   │   ├── charts/               # Recharts wrappers (WeightTrend, CalorieRing…)
│   │   │   ├── chat/                 # MessageThread, TypingIndicator, ConversationList
│   │   │   ├── sessions/             # SessionBuilder, SessionCard, BookingDrawer
│   │   │   ├── layout/               # Sidebar, Topbar, MobileNav
│   │   │   ├── states/               # LoadingState, EmptyState, ErrorState
│   │   ├── lib/
│   │   │   ├── api/                  # typed fetch client per resource
│   │   │   ├── socket.ts             # Socket.IO client singleton
│   │   │   ├── stores/               # Zustand stores (ui, chat, notifications)
│   │   │   ├── validators/           # Zod schemas shared w/ RHF
│   │   ├── design-system/
│   │   │   ├── tokens.ts
│   │   │   ├── tailwind.config.ts
│   │   ├── middleware.ts             # route protection by role
│   │
│   └── api/                          # Express backend
│       ├── src/
│       │   ├── modules/
│       │   │   ├── auth/             # controller, service, routes, validators
│       │   │   ├── trainers/
│       │   │   ├── clients/
│       │   │   ├── sessions/
│       │   │   ├── bookings/
│       │   │   ├── attendance/
│       │   │   ├── progress/
│       │   │   ├── calories/
│       │   │   ├── goals/
│       │   │   ├── workouts/
│       │   │   ├── notifications/
│       │   │   ├── conversations/
│       │   │   ├── messages/
│       │   │   ├── reviews/
│       │   │   ├── certifications/
│       │   │   ├── reports/
│       │   ├── realtime/
│       │   │   ├── socket-server.ts
│       │   │   ├── handlers/         # message, presence, session, notification handlers
│       │   │   ├── auth-middleware.ts # verifies JWT on socket handshake
│       │   ├── jobs/                 # BullMQ queues + workers
│       │   │   ├── milestone-detector.job.ts
│       │   │   ├── session-reminder.job.ts
│       │   │   ├── pdf-report.job.ts
│       │   │   ├── email.job.ts
│       │   ├── middleware/
│       │   │   ├── auth.middleware.ts
│       │   │   ├── rbac.middleware.ts
│       │   │   ├── validate.middleware.ts (Zod)
│       │   │   ├── error.middleware.ts
│       │   │   ├── rate-limit.middleware.ts
│       │   ├── lib/
│       │   │   ├── prisma.ts
│       │   │   ├── redis.ts
│       │   │   ├── cloudinary.ts
│       │   │   ├── mailer.ts
│       │   ├── config/
│       │   ├── app.ts
│       │   ├── server.ts
│       ├── prisma/
│       │   ├── schema.prisma
│       │   ├── migrations/
│       │   ├── seed.ts
│
├── packages/
│   ├── shared-types/                 # DTOs + Zod schemas shared FE/BE
│   ├── config/                       # eslint, tsconfig, prettier presets
│
├── docker-compose.yml                # postgres, redis, api, web
├── turbo.json
└── package.json
```

Each backend module follows **routes → controller → service → repository(Prisma)**, so business logic never lives in route files, and services are unit-testable without an HTTP layer.

---

## C. Database ER Diagram (textual)

```
User ──1:1── TrainerProfile ──1:N── Certification
  │                │──1:N── Achievement
  │                │──1:N── TrainerAvailability
  │                │──1:N── Session
  │
  ├──1:1── ClientProfile ──1:N── BodyMeasurement
  │                │──1:N── FitnessAssessment
  │                │──1:N── FitnessGoal ──1:N── GoalMilestone
  │                │──1:N── WorkoutPlan ──1:N── Workout ──1:N── SessionExercise
  │                │──1:N── SessionBooking ──N:1── Session
  │                │──1:N── Attendance ──N:1── Session
  │                │──1:N── CalorieLog
  │                │──1:N── ProgressLog
  │                │──1:N── Report
  │                │──1:N── Review ──N:1── TrainerProfile
  │                │──1:N── Membership
  │
  ├──1:N── Notification
  ├──N:M── Conversation (via ConversationParticipant) ──1:N── Message ──1:N── MessageReadReceipt

Session ──1:N── SessionExercise ──N:1── Exercise
Session ──1:N── SessionBooking
Session ──1:N── Attendance
```

Key relational decisions:
- `User` is the auth root (email, password hash, role, verification state). `TrainerProfile`/`ClientProfile` are 1:1 extensions — keeps auth concerns separate from domain profile data.
- `SessionBooking` and `Attendance` are separate: a booking is an intent to attend; attendance is the recorded outcome. This lets a client book and later be marked "no-show" without conflating the two.
- `FitnessGoal` → `GoalMilestone` is a 1:N so a single goal (72kg → 65kg) can have ordered checkpoints, each independently completable.
- `Conversation`/`ConversationParticipant` is a join model rather than a hardcoded trainer↔client FK, so group threads (e.g., a future "session Q&A" thread) are possible without a schema change.

---

## D. Prisma Schema

See the attached `schema.prisma` — fully normalized, UUID primary keys, indexes on all foreign keys and frequently-filtered columns (`clientId+date`, `sessionId+status`, etc.), unique constraints on `email`, `(conversationId,userId)`, and `(trainerId, clientId)` pairing.

---

## E. REST API Specification (summary)

All routes are prefixed `/api/v1`. All authenticated routes require `Authorization: Bearer <JWT>`. Role gates are enforced via `rbac.middleware.ts`.

| Resource | Method & Path | Role | Notes |
|---|---|---|---|
| Auth | `POST /auth/signup` | Public | creates User + role-specific profile |
| | `POST /auth/login` | Public | returns access + refresh token (httpOnly cookie) |
| | `POST /auth/refresh` | Public | rotates refresh token |
| | `POST /auth/logout` | Authenticated | invalidates refresh token |
| | `POST /auth/forgot-password` | Public | |
| | `POST /auth/reset-password` | Public | |
| | `GET /auth/verify-email/:token` | Public | |
| Trainers | `GET /trainers/:slug` | Public | public profile |
| | `PATCH /trainers/me` | Trainer | |
| | `POST /trainers/me/certifications` | Trainer | status defaults to `UPLOADED` |
| | `PATCH /certifications/:id/verify` | Admin | only path that can set `VERIFIED` |
| Clients | `GET /clients` | Trainer | search/filter/sort, paginated |
| | `GET /clients/:id` | Trainer, or Client (self) | |
| | `POST /clients/:id/assessments` | Trainer | |
| | `POST /clients/:id/measurements` | Trainer or Client(self) | |
| Sessions | `GET /sessions` | Authenticated | filtered by role (trainer sees own, client sees bookable) |
| | `POST /sessions` | Trainer | Session Builder payload |
| | `PATCH /sessions/:id` | Trainer (owner) | emits `session:updated` |
| | `DELETE /sessions/:id` | Trainer (owner) | soft-cancel, emits `session:cancelled` |
| Bookings | `POST /bookings` | Client | capacity-checked transactionally |
| | `PATCH /bookings/:id/cancel` | Client (owner) or Trainer | |
| Attendance | `POST /attendance` | Trainer | bulk mark for a session |
| | `GET /attendance/summary` | Trainer or Client(self) | daily/weekly/monthly/yearly aggregates |
| Progress | `POST /progress/logs` | Client | |
| | `GET /progress/:clientId` | Trainer or Client(self) | range query params |
| Calories | `POST /calories/logs` | Client | |
| | `GET /calories/target` | Client | derived from BMR/TDEE calc, labeled "estimate" |
| Goals | `POST /goals` | Client or Trainer(for client) | |
| | `POST /goals/:id/milestones` | Trainer | |
| | `PATCH /milestones/:id/complete` | System/Trainer | triggers `goal:milestone_reached` |
| Workouts | `POST /workout-plans` | Trainer | weekly/monthly/custom |
| Notifications | `GET /notifications` | Authenticated | paginated, unread count header |
| | `PATCH /notifications/:id/read` | Authenticated | |
| Conversations | `GET /conversations` | Authenticated | |
| | `POST /conversations` | Authenticated | trainer↔client only, enforced server-side |
| Messages | `GET /conversations/:id/messages` | Participant only | cursor-paginated |
| | `POST /conversations/:id/messages` | Participant only | also emits via socket |
| Reviews | `POST /reviews` | Client | one per trainer per client |
| | `PATCH /reviews/:id/feature` | Trainer(owner) | |
| Reports | `GET /reports/:clientId/pdf` | Trainer or Client(self) | queued via BullMQ, returns job id then signed URL |

Every list endpoint supports `page`, `limit`, `sort`, `filter[...]`. Every mutating endpoint validates via Zod schemas shared from `packages/shared-types`, so frontend forms and backend validation can never drift apart.

---

## F. WebSocket Event Contract

Namespace: `/realtime`. Auth via JWT passed in the Socket.IO handshake `auth` field; a client can only join rooms it's authorized for (`user:{userId}`, `conversation:{conversationId}` only if a participant, `trainer:{trainerId}` only if owner or an active client of that trainer).

| Direction | Event | Payload (shape) | Purpose |
|---|---|---|---|
| C→S | `client:send_message` | `{conversationId, text, tempId}` | send message; server persists then broadcasts |
| S→C | `server:new_message` | `{message}` | delivered to all participants |
| S→C | `message:delivered` | `{messageId, tempId}` | ack to sender |
| C→S / S→C | `message:read` | `{conversationId, messageId, readerId}` | read receipt |
| C→S | `user:typing` / `user:stop_typing` | `{conversationId}` | typing indicator, throttled client-side |
| S→C | `user:online` / `user:offline` | `{userId, lastSeenAt}` | presence, backed by Redis TTL keys |
| S→C | `session:created` / `session:updated` / `session:cancelled` | `{session}` | pushed to clients who follow that trainer |
| S→C | `session:booking_updated` | `{sessionId, seatsBooked, seatsTotal}` | live capacity counter |
| S→C | `progress:updated` | `{clientId, metric}` | pushed to trainer viewing that client's profile |
| S→C | `goal:milestone_reached` | `{clientId, goalId, milestone}` | triggers notification + confetti-style UI moment |
| S→C | `notification:new` | `{notification}` | in-app + badge count bump |
| C→S | `notification:read` | `{notificationId}` | |

Server-side authorization check runs on **every** event, not just at connection time — room membership is re-verified against the DB/Redis cache before broadcasting, so a stale token or removed client relationship can't leak data.

---

## G. Frontend Route Map

```
/                              marketing landing
/trainer/[slug]                public trainer profile
/login /signup
/forgot-password /reset-password/[token]
/verify-email/[token]

/trainer/dashboard
/trainer/clients
/trainer/clients/[id]
/trainer/sessions
/trainer/sessions/builder
/trainer/attendance
/trainer/messages
/trainer/reports
/trainer/reviews
/trainer/profile

/client/dashboard
/client/sessions
/client/progress
/client/goals
/client/calories
/client/messages
/client/trainer            (their own trainer's profile + booking)
```

`middleware.ts` reads the JWT, checks role, and redirects `/trainer/*` away from clients and vice versa — RBAC is enforced again server-side on every API call, the frontend guard is UX only, never the security boundary.

---

## H. Design System

**Palette (minimal, used deliberately, not decoratively):**

| Token | Hex | Use |
|---|---|---|
| `--ink-950` | `#0B0D0F` | primary text, dark surfaces |
| `--ink-700` | `#2B2F33` | secondary dark surface |
| `--slate-500` | `#6B7280` | secondary text |
| `--slate-200` | `#E4E6E8` | borders, dividers |
| `--paper` | `#FAFAF9` | app background |
| `--surface` | `#FFFFFF` | card surfaces |
| `--accent` | `#C6F135` | one accent — primary actions, active states, key data points only |
| `--accent-ink` | `#171D08` | text on accent |
| `--positive` | `#3FAE6A` | progress-positive states (muted, not neon) |
| `--warning` | `#D98C2B` | attention-required flags |

Rule: the accent color appears on **at most one element per screen region** — a primary CTA, the active nav item, or the highlighted data series in a chart. Never as a background wash.

**Typography:**
- Display/headings: **Space Grotesk** (geometric, energetic without being loud — used only at 20px+)
- Body/UI: **Inter** (neutral, highly legible at small sizes for dense dashboard data)
- Numeric/data (weights, calories, percentages): Inter with tabular-nums, slightly larger weight for scanability

**Spacing/radius/shadow tokens:** 4px base spacing scale (4/8/12/16/24/32/48/64), radius scale (8px inputs, 12px cards, 20px modals), shadows kept extremely subtle (`0 1px 2px rgba(11,13,15,0.04)`, `0 8px 24px rgba(11,13,15,0.06)`) — no drop-shadow-as-decoration.

A live preview of these tokens applied to a real dashboard slice is attached (`design-system-preview.html`).

---

## I. Development Roadmap

Matches the phases in the brief. Each phase produces working, demoable code — not scaffolding alone.

1. **Architecture + setup** *(this document + schema + design tokens)* ✅
2. Auth + RBAC (signup/login/JWT/refresh/roles/middleware)
3. Trainer profile + certifications (with Uploaded/Pending/Verified states)
4. Client management (list, filters, full client profile)
5. Sessions + Session Builder + booking + capacity
6. Attendance (marking + aggregates + decline detection)
7. Progress tracking (logs + charts, daily/weekly/monthly/yearly)
8. Calories + goals/milestones
9. Real-time chat (Socket.IO, presence, typing, receipts)
10. Real-time notifications (in-app + persisted + live)
11. Reports (PDF export via BullMQ)
12. AI features (trainer copilot, progress summaries, client assistant — draft-only, human-approved)
13. Business features (memberships/payments — schema-ready now, UI later)
14. Testing, security hardening, deployment

**Recommendation:** build phases 2–4 next as one connected slice (you can't demo client management without auth), then 5–6 (sessions/booking/attendance) as the next slice, then 7–8 (progress/calories/goals), then 9–10 (real-time) as its own focused phase since Socket.IO infra is a bigger lift.
