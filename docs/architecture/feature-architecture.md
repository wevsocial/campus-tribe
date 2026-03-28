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

## Remaining Major Work (still real backlog)
- Stronger survey builder/editor
- Venue conflict detection UI + approval path upgrades
- Student recommendation / onboarding intelligence
- Sports P1 depth (standings, live scores, waivers)
- Admin OS analytics and AI risk tooling
- Enterprise auth (SSO/SAML) + LMS + Helcim
