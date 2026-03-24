import { supabase } from '../supabase'
import type { CTUser, CTClub, CTEvent, CTNotification, UserRole } from '../../types'

// Auth
export const authApi = {
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  },
  async signUp(email: string, password: string, fullName: string, role: UserRole) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, role } }
    })
    if (error) throw error
    return data
  },
  async signOut() {
    await supabase.auth.signOut()
  },
  async getSession() {
    const { data } = await supabase.auth.getSession()
    return data.session
  }
}

// Users
export const usersApi = {
  async getProfile(userId: string): Promise<CTUser | null> {
    const { data } = await supabase
      .from('ct_users')
      .select('*')
      .eq('id', userId)
      .single()
    return data
  },
  async updateProfile(userId: string, updates: Partial<CTUser>) {
    const { data, error } = await supabase
      .from('ct_users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()
    if (error) throw error
    return data
  }
}

// Clubs
export const clubsApi = {
  async list(institutionId: string, filters?: { category?: string; search?: string }) {
    let query = supabase
      .from('ct_clubs')
      .select('*')
      .eq('institution_id', institutionId)
      .eq('is_approved', true)
    if (filters?.category) query = query.eq('category', filters.category)
    if (filters?.search) query = query.ilike('name', `%${filters.search}%`)
    const { data } = await query
    return data as CTClub[]
  },
  async get(id: string): Promise<CTClub | null> {
    const { data } = await supabase.from('ct_clubs').select('*').eq('id', id).single()
    return data
  },
  async create(club: Partial<CTClub>) {
    const { data, error } = await supabase.from('ct_clubs').insert(club).select().single()
    if (error) throw error
    return data
  },
  async update(id: string, updates: Partial<CTClub>) {
    const { data, error } = await supabase.from('ct_clubs').update(updates).eq('id', id).select().single()
    if (error) throw error
    return data
  },
  async getMembers(clubId: string) {
    const { data } = await supabase
      .from('ct_club_memberships')
      .select('*, ct_users(*)')
      .eq('club_id', clubId)
    return data
  },
  async join(clubId: string, userId: string) {
    const { data, error } = await supabase
      .from('ct_club_memberships')
      .insert({ club_id: clubId, user_id: userId, role: 'member' })
      .select()
      .single()
    if (error) throw error
    return data
  }
}

// Events
export const eventsApi = {
  async list(institutionId: string) {
    const { data } = await supabase
      .from('ct_events')
      .select('*')
      .eq('institution_id', institutionId)
      .order('start_time', { ascending: true })
    return data as CTEvent[]
  },
  async get(id: string): Promise<CTEvent | null> {
    const { data } = await supabase.from('ct_events').select('*').eq('id', id).single()
    return data
  },
  async create(event: Partial<CTEvent>) {
    const { data, error } = await supabase.from('ct_events').insert(event).select().single()
    if (error) throw error
    return data
  },
  async rsvp(eventId: string, userId: string, status: 'going' | 'maybe' | 'not_going') {
    const { data, error } = await supabase
      .from('ct_event_rsvps')
      .upsert({ event_id: eventId, user_id: userId, status }, { onConflict: 'event_id,user_id' })
      .select()
      .single()
    if (error) throw error
    return data
  }
}

// Notifications
export const notificationsApi = {
  async list(userId: string): Promise<CTNotification[]> {
    const { data } = await supabase
      .from('ct_notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20)
    return (data || []) as CTNotification[]
  },
  async markRead(id: string) {
    await supabase.from('ct_notifications').update({ is_read: true }).eq('id', id)
  }
}

// Analytics
export const analyticsApi = {
  async getStats(institutionId: string) {
    const [clubs, events, users] = await Promise.all([
      supabase.from('ct_clubs').select('id', { count: 'exact' }).eq('institution_id', institutionId),
      supabase.from('ct_events').select('id', { count: 'exact' }).eq('institution_id', institutionId),
      supabase.from('ct_users').select('id', { count: 'exact' }).eq('institution_id', institutionId),
    ])
    return {
      clubs: clubs.count || 0,
      events: events.count || 0,
      users: users.count || 0,
    }
  }
}
