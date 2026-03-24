export type UserRole = 'student' | 'staff' | 'coach' | 'admin' | 'it_director' | 'club_leader'

export interface CTUser {
  id: string
  email: string
  full_name: string
  role: UserRole
  institution_id?: string
  avatar_url?: string
  created_at: string
}

export interface CTInstitution {
  id: string
  name: string
  domain: string
  logo_url?: string
  plan: 'starter' | 'growth' | 'enterprise'
  student_count: number
  created_at: string
}

export interface CTClub {
  id: string
  institution_id: string
  name: string
  description: string
  category: string
  logo_url?: string
  banner_url?: string
  member_count: number
  is_active: boolean
  is_approved: boolean
  leader_id: string
  created_at: string
}

export interface CTClubMembership {
  id: string
  club_id: string
  user_id: string
  role: 'member' | 'officer' | 'leader'
  joined_at: string
}

export interface CTEvent {
  id: string
  institution_id: string
  club_id?: string
  title: string
  description: string
  start_time: string
  end_time: string
  venue_id?: string
  location: string
  max_capacity?: number
  rsvp_count: number
  image_url?: string
  tags: string[]
  created_by: string
  created_at: string
}

export interface CTEventRSVP {
  id: string
  event_id: string
  user_id: string
  status: 'going' | 'maybe' | 'not_going'
  created_at: string
}

export interface CTVenue {
  id: string
  institution_id: string
  name: string
  capacity: number
  location: string
  amenities: string[]
  image_url?: string
  is_available: boolean
}

export interface CTVenueBooking {
  id: string
  venue_id: string
  booked_by: string
  event_id?: string
  start_time: string
  end_time: string
  purpose: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
}

export interface CTSportsLeague {
  id: string
  institution_id: string
  name: string
  sport: string
  season: string
  status: 'registration' | 'active' | 'completed'
  created_by: string
}

export interface CTSportsTeam {
  id: string
  league_id: string
  name: string
  wins: number
  losses: number
  ties: number
  points: number
}

export interface CTSportsGame {
  id: string
  league_id: string
  home_team_id: string
  away_team_id: string
  home_score?: number
  away_score?: number
  scheduled_at: string
  venue_id?: string
  status: 'scheduled' | 'live' | 'completed'
}

export interface CTWellnessCheckin {
  id: string
  user_id: string
  mood: 1 | 2 | 3 | 4 | 5
  notes?: string
  created_at: string
}

export interface CTNotification {
  id: string
  user_id: string
  title: string
  message: string
  type: 'event' | 'club' | 'sports' | 'wellness' | 'system'
  is_read: boolean
  created_at: string
}
