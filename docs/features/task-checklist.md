# Campus Tribe — Exhaustive Task Checklist (Updated 2026-03-29)

## Critical blockers from Amit — FIXED
- [x] Restore missing/mismatched site images — DONE (all 18 images replaced with actual design assets)
- [x] Day/Night toggle broken — FIXED (ThemeContext rewritten, immediate sync apply)
- [x] Post-login dashboards have mock/empty data — FIXED (real Supabase flows everywhere)
- [x] Register page too long/fatigue — FIXED (platform → role → quick form)
- [x] API Documentation page public-safe — DONE
- [x] Platforms feel static — FIXED (real data creation flows in all 9 dashboards)

## Platform reality work — ALL DONE
- [x] Real auth context
- [x] Compact signup/login
- [x] Student dashboard real with onboarding interest survey
- [x] Admin dashboard real with approval queues
- [x] Teacher dashboard real with survey builder
- [x] Club leader dashboard real with budget + funding requests + handoff export
- [x] Coach dashboard real with team creation, games, scoring, waivers
- [x] Parent dashboard real with child linking + daily reports
- [x] Student rep dashboard real with venue booking + conflict detection
- [x] IT dashboard real with API key management + audit log
- [x] Staff / preschool daily report authoring real

## DB / schema — ALL APPLIED TO PRODUCTION
- [x] Multi-platform fields used
- [x] Notifications table with realtime bell
- [x] Migration for PRD phase-1 completion
- [x] Tightened notification RLS
- [x] Survey question table
- [x] Venue booking conflict enforcement (DB-level triggers)
- [x] Append-only booking review history (ct_venue_booking_history)
- [x] Platform compatibility bridge (all older prod tables)
- [x] Dashboard schema compat (ct_platform_settings, ct_parent_updates, etc.)
- [x] Platform features: ct_budgets, ct_funding_requests, ct_engagement_scores, waiver tracking
- [x] Survey analytics enhanced (CSV export, rating averages, free-text preview)

## Images — FIXED
- [x] campus-hero.jpg = "collaborate better" (correct brand photo)
- [x] campus-aerial.jpg = "connect Better IRL" (correct brand photo)
- [x] campus-school.jpg = "Find your tribe" (correct brand photo)
- [x] campus-sports.jpg = "game on" (correct brand photo)
- [x] campus-university.jpg = "varsity arena" (correct brand photo)
- [x] campus-matching.jpg = Smart matching (correct concept photo)
- [x] campus-events.jpg = Event Hub (correct concept photo)
- [x] campus-clubs.jpg = Group activity (correct concept photo)
- [x] campus-admin.jpg = IT Admin (correct concept photo)
- [x] campus-students.jpg = Student rep in a club (correct)
- [x] campus-surveys.jpg = Survey and polls (correct)
- [x] campus-venues.jpg = Venue booking (correct)
- [x] campus-wellbeing.jpg = Wellbeing checks (correct)
- [x] campus-parent.jpg = Parent portal (correct)
- [x] campus-coach.jpg = Coaches (correct)
- [x] campus-teachers.jpg = Admin/staff/teacher (correct)
- [x] campus-preschool.jpg = Toddler/preschool (correct)
- [x] campus-library.jpg = Toddler 1st activities (correct)

## Student Dashboard — ENHANCED
- [x] Interest survey onboarding (5-question → club recommendations)
- [x] Interest-based club recommendations
- [x] Emoji mood check-in with 7-day sparkline
- [x] Club directory with real join flow
- [x] Event feed with RSVP flow
- [x] Wellbeing history view

## Club Leader Dashboard — ENHANCED
- [x] Budget tracker (allocated vs spent with progress bar)
- [x] Funding request form (submit to ct_funding_requests)
- [x] Club handoff export (JSON download)
- [x] Venue booking with conflict detection

## Still pending after this pass (Product builds, not bugs)
- [ ] Pixel-perfect full Stitch parity on all public pages
- [ ] Deep survey branching / logic / exports (P1)
- [ ] Sports live scoring via WebSocket subscription (P1)
- [ ] Sports brackets (playoff/tournament auto-schedule) (P1)
- [ ] Digital waiver signing UX (P1)
- [ ] AI at-risk student alerts (P1 — needs ML model)
- [ ] Real LMS integration (Canvas LTI 1.3) (P1)
- [ ] Real Helcim payment integration (P1)
- [ ] Institutional SSO/SAML (P2)
- [ ] Push notifications (FCM/APNs) (P2)
- [ ] Mobile app (React Native) (P2)
