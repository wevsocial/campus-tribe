export type ApiCategory = {
  id: string;
  title: string;
  audience: string;
  summary: string;
  endpoints: { method: 'GET' | 'POST' | 'PUT' | 'DELETE'; path: string; description: string; scope: string }[];
};

export const apiReference: ApiCategory[] = [
  {
    id: 'auth',
    title: 'Authentication & Identity',
    audience: 'IT admins, super users, institutional integrators',
    summary: 'Institutional authentication, JWT issuance, SSO/SAML handoff, and scoped machine access.',
    endpoints: [
      { method: 'POST', path: '/v1/auth/login', description: 'Authenticate a user and issue a short-lived access token.', scope: 'public client / SSO handoff' },
      { method: 'POST', path: '/v1/auth/refresh', description: 'Refresh an access token with an approved refresh token.', scope: 'authenticated client' },
      { method: 'POST', path: '/v1/auth/sso/init', description: 'Start an institutional SSO flow with mapped campus attributes.', scope: 'institution admin' },
      { method: 'GET', path: '/v1/auth/metadata', description: 'Retrieve SAML metadata and integration hints for an institution.', scope: 'institution admin' },
    ],
  },
  {
    id: 'students',
    title: 'Students & Engagement',
    audience: 'Student affairs, advisors, analytics teams',
    summary: 'Unified student profiles, engagement timelines, risk indicators, and cohort views.',
    endpoints: [
      { method: 'GET', path: '/v1/students', description: 'List students by institution, cohort, program, and engagement segment.', scope: 'admin / advisor' },
      { method: 'GET', path: '/v1/students/{id}', description: 'Retrieve a single student profile with academic + co-curricular context.', scope: 'admin / advisor / self' },
      { method: 'GET', path: '/v1/students/{id}/engagement', description: 'Fetch event, club, survey, sports, and wellbeing engagement history.', scope: 'admin / advisor' },
      { method: 'GET', path: '/v1/students/at-risk', description: 'Return students above configured risk thresholds.', scope: 'admin / advisor' },
    ],
  },
  {
    id: 'clubs',
    title: 'Clubs & Organizations',
    audience: 'Student leaders, admins, faculty advisors',
    summary: 'Club creation, approvals, roster management, announcements, and funding workflows.',
    endpoints: [
      { method: 'GET', path: '/v1/clubs', description: 'List clubs by institution with category, member count, and status.', scope: 'authenticated' },
      { method: 'POST', path: '/v1/clubs', description: 'Register a new club and trigger an approval flow.', scope: 'student leader' },
      { method: 'GET', path: '/v1/clubs/{id}/members', description: 'Load member roster with roles and join state.', scope: 'club leader / admin' },
      { method: 'POST', path: '/v1/clubs/{id}/announcements', description: 'Notify all club members or followers.', scope: 'club leader' },
    ],
  },
  {
    id: 'events',
    title: 'Events, RSVPs & Check-ins',
    audience: 'Student life, clubs, recreation, event operators',
    summary: 'Institutional event feeds, RSVP state, reminders, live attendance, and check-in capture.',
    endpoints: [
      { method: 'GET', path: '/v1/events', description: 'Browse events personalized by institution and interests.', scope: 'authenticated' },
      { method: 'POST', path: '/v1/events', description: 'Create a new campus event with venue, capacity, and category.', scope: 'club leader / admin / student rep' },
      { method: 'POST', path: '/v1/events/{id}/rsvp', description: 'Create or update a student RSVP.', scope: 'student' },
      { method: 'GET', path: '/v1/events/{id}/attendance', description: 'Review live attendance totals and attendee roster.', scope: 'event owner / admin' },
    ],
  },
  {
    id: 'venues',
    title: 'Venue & Facility Booking',
    audience: 'Facilities, student reps, clubs, faculty, admins',
    summary: 'Venue inventory, availability, booking requests, approval workflows, and utilization analytics.',
    endpoints: [
      { method: 'GET', path: '/v1/venues', description: 'List venues with capacity, amenities, and current availability.', scope: 'authenticated' },
      { method: 'GET', path: '/v1/venues/{id}/availability', description: 'Return bookable windows for a venue.', scope: 'authenticated' },
      { method: 'POST', path: '/v1/venues/{id}/bookings', description: 'Submit a booking request with dates, purpose, and attendance needs.', scope: 'student / faculty / club leader / student rep' },
      { method: 'GET', path: '/v1/venues/utilization', description: 'Inspect venue usage by building and time block.', scope: 'admin / facilities' },
    ],
  },
  {
    id: 'surveys',
    title: 'Surveys, Polls & Wellbeing',
    audience: 'Faculty, coaches, admins, wellness teams',
    summary: 'Survey creation, anonymous wellbeing checks, response collection, and export-ready summaries.',
    endpoints: [
      { method: 'POST', path: '/v1/surveys', description: 'Create a survey or poll with audience targeting and anonymity settings.', scope: 'admin / faculty / coach / club leader' },
      { method: 'POST', path: '/v1/surveys/{id}/respond', description: 'Submit a survey response with one-response-per-user controls.', scope: 'authenticated' },
      { method: 'GET', path: '/v1/surveys/{id}/results', description: 'Review live response data and aggregate charts.', scope: 'survey owner / admin' },
      { method: 'GET', path: '/v1/surveys/{id}/export', description: 'Export anonymized responses for institutional review.', scope: 'survey owner / admin' },
    ],
  },
  {
    id: 'integrations',
    title: 'Admin, API Keys & Webhooks',
    audience: 'IT directors, platform engineers, institutional integration teams',
    summary: 'Machine-to-machine integration contracts, webhook events, API keys, and operational audit access.',
    endpoints: [
      { method: 'GET', path: '/v1/analytics/engagement', description: 'Load aggregate KPIs such as MAU, attendance, and participation.', scope: 'admin' },
      { method: 'POST', path: '/v1/notifications/broadcast', description: 'Broadcast institutional messages to selected audiences.', scope: 'admin' },
      { method: 'GET', path: '/v1/audit-log', description: 'Review FERPA-sensitive access and mutation activity.', scope: 'admin / IT' },
      { method: 'POST', path: '/v1/webhooks', description: 'Register signed webhooks for downstream institutional systems.', scope: 'IT admin' },
    ],
  },
];

export const publicApiReviewHighlights = [
  'REST + webhook-first integration surface for institutional systems',
  'JWT, SSO/SAML, and scoped API-key access patterns',
  'Student, club, event, venue, survey, analytics, and notification domains',
  'Full endpoint catalog, API keys, and integration review available to logged-in IT admins',
  'Sensitive internal implementation details remain private until institutional access is approved',
];
