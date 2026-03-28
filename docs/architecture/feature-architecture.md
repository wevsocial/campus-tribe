# Campus Tribe — Feature Architecture (PRD-Aligned)

## Product Modes
Campus Tribe now operates as a single codebase with three institution modes:
- University / College
- School / K-12
- Preschool / Early Years

The institution mode is derived from `ct_institutions.institution_type` and copied to the user profile as `platform_type` / `institution_type` for routing, role gating, onboarding, and dashboard UX.

## Authentication Model
Short-form signup is intentionally compact:
- platform_type
- role
- full_name
- email
- password
- institution_name or invite/access code

Flow:
1. Supabase Auth creates the user session.
2. Campus Tribe creates or resolves the institution.
3. `ct_users` row is created with role + institution binding.
4. The user is routed to the role-specific workspace.
5. Progressive onboarding happens after login via empty states and creation flows.

## Real Workspaces
### Real today
- Student
- Student Rep
- Teacher
- Admin
- Club Leader
- Coach
- Parent
- IT Director
- Staff / Preschool Staff

### P0 workflow coverage
- Student hub: clubs, events, RSVP, wellbeing
- Club OS: club creation, approvals, member-facing operations, announcements scaffold
- Venue booking: venue inventory + booking requests
- Surveys: survey shell creation + response model scaffolding
- Parent/preschool: child linking + daily reports

## Platform Routing
- `student` → `/dashboard/student`
- `student_rep` → `/dashboard/student-rep`
- `teacher` → `/dashboard/teacher`
- `admin` → `/dashboard/admin`
- `staff` → `/dashboard/staff`
- `club_leader` → `/dashboard/club`
- `coach` → `/dashboard/coach`
- `it_director` → `/dashboard/it`
- `parent` → `/dashboard/parent`

## API Surface
Two layers exist now:
1. Public-safe API review page under `Resources -> API Documentation`
2. Full logged-in IT admin API review area in the IT workspace

The public page avoids exposing proprietary internal details while still presenting the integration story. The IT workspace provides the operational view (API keys, endpoint families, audit activity, integration queueing).

## Front-End Architecture
- React 19 + TypeScript + Vite
- Tailwind + custom design tokens
- Supabase Auth + DB + Realtime
- Public assets served from `static/assets` into the Vite public pipeline

## Theme System
The day/night toggle is centralized in `ThemeContext`, which now:
- reads local preference first
- falls back to OS preference
- sets the `dark` class on `<html>`
- sets `color-scheme`
- persists preference to local storage

## Sprint v1 upgrades now shipped
- Venue booking request flow now includes venue selection, client-side overlap detection against existing bookings, and visible approval notes/status on club leader and admin/staff surfaces.
- Venue review surfaces now scope requests to the current institution and expose overlap scan counts/history to help staff/admin make approval decisions safely.
- Admin and staff workspaces can now approve/reject pending venue bookings with notes.
- Coach workspace now supports team creation, game scheduling, schedule editing, score entry, derived standings, and a minimal athlete roster flow backed by `ct_teams`, `ct_games`, and `ct_athletes`.
- Sports authenticated flows were tightened to load only the coach's teams, related games, and related athletes instead of broad global reads.
- Teacher workspace now includes a real survey builder on `ct_surveys` + `ct_survey_questions`, publish/draft controls, respondent submit flow, and creator-side results summaries from `ct_survey_responses`.
- Survey loaders were tightened to pull only relevant surveys/questions/responses for the signed-in institution and selected audience path.
- Parent/staff workflows now include richer daily reports, parent-child linking helpers, and a simple parent/teacher update trail using `ct_parent_updates`.
- Admin workspace now includes LMS + Helcim settings/review scaffolding backed by `ct_platform_settings`.
- Auth pages now expose Google OAuth via Supabase when the provider is configured.

## Remaining Major Work (still real backlog)
- Server-enforced venue conflict prevention (currently UI-detected + human approval workflow)
- Branching / conditional surveys and richer analytics exports
- Student recommendation / onboarding intelligence
- Sports P1 depth beyond v1 standings/rosters (live feeds, brackets, waivers)
- Admin OS analytics and AI risk tooling
- Enterprise auth (SSO/SAML) and full LMS / Helcim implementations
