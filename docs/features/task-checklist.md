# Campus Tribe — Exhaustive Task Checklist (Current Pass)

## Critical blockers from Amit
- [x] Restore missing site images
- [x] Use Stitch / PRD direction as implementation guardrail
- [x] Remove About -> Leadership Team section
- [x] Fix day/night toggle
- [x] Add public-safe API documentation page
- [x] Keep full API/admin access inside logged-in IT workspace

## Platform reality work
- [x] Real auth context
- [x] Compact signup/login
- [x] Student dashboard real
- [x] Admin dashboard real
- [x] Teacher dashboard real
- [x] Club leader dashboard real
- [x] Coach dashboard real
- [x] Parent dashboard real
- [x] Student rep dashboard real
- [x] IT dashboard real
- [x] Staff / preschool daily report authoring real

## DB / schema / security work
- [x] Existing multi-platform fields used
- [x] Notifications table used with realtime bell
- [x] Added migration for PRD phase-1 completion
- [x] Tightened notification RLS away from fully-open policy
- [x] Added survey question table scaffold
- [x] Added missing content columns where needed

## Documentation
- [x] Architecture note added
- [x] Design-system note added
- [x] Feature checklist added

## Sprint v1 shipped in this pass
- [x] Venue selection + overlap detection before booking submit
- [x] Venue approval/reject flow for admin/staff with notes/status visibility
- [x] Venue overlap scan/history surfaced in club leader, admin, and staff booking views
- [x] Venue review queries scoped back to the current institution
- [x] Sports game creation + score updates + derived standings UI
- [x] Coach game schedule editing/status notes
- [x] Minimal athlete/roster flow in coach workspace
- [x] Sports authenticated reads scoped to coach-owned teams and related games/athletes
- [x] Real survey builder using ct_surveys + ct_survey_questions + ct_survey_responses
- [x] Question types: text, single choice, multi choice, rating, yes/no
- [x] Survey draft/publish flow
- [x] Respondent submit flow + creator results summary
- [x] Survey question/response reads tightened to relevant survey sets
- [x] Richer daily reports for preschool/school staff
- [x] Parent-child linking helpers for staff and parents
- [x] Parent/teacher communication trail scaffolding
- [x] LMS + Helcim admin review/settings scaffolding
- [x] Google sign-in/sign-up button wiring through Supabase OAuth
- [x] Public page image mismatch cleanup on school/preschool routes

## Still pending after this pass
- [ ] Pixel-perfect full Stitch parity on all public pages
- [ ] Server-enforced venue conflict prevention at DB level
- [ ] Deep survey branching / logic / exports
- [ ] Sports live scoring, brackets, waivers
- [ ] AI risk analytics / admin OS P1 depth
- [ ] Real LMS integrations
- [ ] Real Helcim integration
- [ ] Institutional SSO/SAML
