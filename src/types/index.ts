export interface Institution {
  id: string;
  name: string;
  domain: string;
  plan: 'starter' | 'growth' | 'enterprise';
  studentCount: number;
  logoUrl?: string;
}

export type UserRole = 'student' | 'student_rep' | 'admin' | 'coach' | 'club_leader' | 'staff' | 'it_director' | 'teacher' | 'parent' | 'athlete';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  institutionId: string;
  avatarUrl?: string;
  bio?: string;
  interests?: string[];
  joinedAt: string;
}

export interface Club {
  id: string;
  name: string;
  category: string;
  description: string;
  memberCount: number;
  leaderId: string;
  institutionId: string;
  coverGradient: string;
  iconBg: string;
  tags: string[];
  isActive: boolean;
  createdAt: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  clubId?: string;
  clubName?: string;
  venueId?: string;
  venueName?: string;
  startTime: string;
  endTime: string;
  category: string;
  capacity: number;
  rsvpCount: number;
  status: 'upcoming' | 'live' | 'past' | 'cancelled';
  coverGradient: string;
  institutionId: string;
}

export interface Venue {
  id: string;
  name: string;
  building: string;
  capacity: number;
  amenities: string[];
  isBookable: boolean;
  institutionId: string;
}

export interface SportsLeague {
  id: string;
  name: string;
  sport: string;
  season: string;
  status: 'active' | 'upcoming' | 'completed';
  institutionId: string;
  startDate: string;
  endDate: string;
}

export interface SportsTeam {
  id: string;
  name: string;
  leagueId: string;
  wins: number;
  losses: number;
  draws: number;
  points: number;
  goalsFor?: number;
  goalsAgainst?: number;
}

export interface SportsGame {
  id: string;
  leagueId: string;
  homeTeamId: string;
  homeTeamName: string;
  awayTeamId: string;
  awayTeamName: string;
  homeScore?: number;
  awayScore?: number;
  scheduledAt: string;
  status: 'scheduled' | 'live' | 'completed';
  venue?: string;
}

export interface WellnessCheckin {
  id: string;
  userId: string;
  date: string;
  mood: number;
  energy: number;
  stress: number;
  notes?: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: 'event' | 'club' | 'sports' | 'wellness' | 'system';
  isRead: boolean;
  createdAt: string;
  link?: string;
}

export interface WeeklyTrendPoint {
  week: string;
  activeUsers: number;
  newSignups: number;
  eventsCreated: number;
}

export interface ClubCategoryData {
  category: string;
  count: number;
  color: string;
}

export interface TopClubData {
  id: string;
  name: string;
  members: number;
  events: number;
  growth: number;
}

export interface AnalyticsData {
  totalStudents: number;
  activeStudents: number;
  atRiskStudents: number;
  totalClubs: number;
  totalEvents: number;
  wellnessAvg: number;
  weeklyTrend: WeeklyTrendPoint[];
  clubsByCategory: ClubCategoryData[];
  topClubs: TopClubData[];
}

export interface BudgetTransaction {
  id: string;
  description: string;
  amount: number;
  type: 'credit' | 'debit';
  date: string;
  category: string;
}
