# Kinetic Academy — Current Implementation Notes

## Source of Truth
The user-provided PRD and the Stitch direction remain the visual north star.

## Applied updates in this pass
- Restored all missing public image assets into `static/assets`
- Kept the Kinetic Academy palette anchored around:
  - Primary: `#0047AB`
  - Secondary: `#FF7F50`
  - Tertiary: `#00A86B`
- Preserved Lexend / Inter / Plus Jakarta Sans stack
- Fixed day/night toggle to apply globally and persist reliably
- Maintained rounded cards / pills / editorial gradients
- Reduced obvious public-page image/content mismatches on school and preschool routes by aligning imagery to the correct institution story
- Kept new workflow-heavy dashboard panels visually consistent with the existing rounded container system instead of introducing a second admin UI language

## Practical note
The codebase still contains some legacy border-based utility components that predate the stricter no-line interpretation. Those were not fully rewritten in this pass because the priority was restoring product functionality and critical blockers. The next refinement pass should remove remaining outline-heavy UI from generic cards/forms.

## Public image asset map
Images restored from:
`/Users/trojanvsmac/Downloads/WevSocial WIP/Campus Tribe/Website revamp/1. Final`

Mapped into:
- `static/assets/campus-hero.jpg`
- `static/assets/campus-students.jpg`
- `static/assets/campus-clubs.jpg`
- `static/assets/campus-sports.jpg`
- `static/assets/campus-admin.jpg`
- `static/assets/campus-teachers.jpg`
- `static/assets/campus-events.jpg`
- `static/assets/campus-parent.jpg`
- `static/assets/campus-preschool.jpg`
- `static/assets/campus-coach.jpg`
- `static/assets/campus-surveys.jpg`
- `static/assets/campus-venues.jpg`
- `static/assets/campus-wellbeing.jpg`
- `static/assets/campus-library.jpg`
- `static/assets/campus-aerial.jpg`
- `static/assets/campus-university.jpg`
- `static/assets/campus-school.jpg`
- `static/assets/campus-matching.jpg`
