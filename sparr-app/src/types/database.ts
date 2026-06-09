// Auto-generated from Supabase schema — update via `supabase gen types typescript`

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          user_id: string
          username: string
          display_name: string
          avatar_url: string | null
          bio: string | null
          city: string | null
          country: string
          primary_role: 'athlete' | 'coach' | 'gym_owner' | 'organizer' | 'fan' | 'staff' | 'admin' | 'visitor'
          public_visibility: 'public' | 'followers' | 'private'
          verified: boolean
          followers_count: number
          following_count: number
          subscription_tier: 'free' | 'pro' | 'premium'
          onboarding_complete: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
      }

      gyms: {
        Row: {
          id: string
          owner_id: string | null
          name: string
          slug: string
          logo_url: string | null
          banner_url: string | null
          description: string | null
          city: string | null
          country: string
          address: string | null
          disciplines: string[]
          public_visibility: string
          verified: boolean
          member_count: number
          coach_count: number
          subscription_tier: 'basic' | 'pro' | 'elite'
          website: string | null
          instagram: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['gyms']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['gyms']['Insert']>
      }

      events: {
        Row: {
          id: string
          organizer_id: string
          gym_id: string | null
          title: string
          slug: string | null
          type: 'tournament' | 'open_mat' | 'seminar' | 'fight_night' | 'training_camp' | 'sparring_session'
          description: string | null
          rules: string | null
          location: string | null
          city: string | null
          country: string
          banner_url: string | null
          start_date: string
          end_date: string | null
          registration_open: string | null
          registration_close: string | null
          disciplines: string[]
          status: 'draft' | 'published' | 'registration_open' | 'registration_closed' | 'ongoing' | 'completed' | 'cancelled'
          visibility: 'public' | 'private' | 'unlisted'
          max_participants: number | null
          registered_count: number
          entry_fee: number | null
          currency: string
          ticketing_enabled: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['events']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['events']['Insert']>
      }

      training_sessions: {
        Row: {
          id: string
          athlete_id: string
          type: 'sparring' | 'pads' | 'bag' | 'drilling' | 'conditioning' | 'strength' | 'run' | 'recovery' | 'competition'
          sport: string
          title: string
          start_time: string
          end_time: string | null
          duration_seconds: number
          distance_meters: number | null
          avg_pace_sec_per_km: number | null
          avg_speed_kmh: number | null
          intensity: 1 | 2 | 3 | 4 | 5
          calories: number | null
          rounds: number | null
          mood: 'great' | 'good' | 'ok' | 'tired' | 'rough' | null
          notes: string | null
          visibility: 'public' | 'followers' | 'private'
          is_real_checkin: boolean
          hide_route: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['training_sessions']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['training_sessions']['Insert']>
      }

      notifications: {
        Row: {
          id: string
          user_id: string
          type: string
          title: string
          body: string
          target_url: string | null
          is_read: boolean
          priority: 'low' | 'normal' | 'high' | 'urgent'
          actor_id: string | null
          metadata: Json
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['notifications']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['notifications']['Insert']>
      }

      posts: {
        Row: {
          id: string
          author_id: string
          gym_id: string | null
          event_id: string | null
          type: 'post' | 'session_share' | 'real_checkin' | 'achievement' | 'event_result' | 'announcement'
          content: string
          media_urls: string[]
          tags: string[]
          visibility: 'public' | 'followers' | 'private' | 'team'
          likes_count: number
          comments_count: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['posts']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['posts']['Insert']>
      }

      subscriptions: {
        Row: {
          id: string
          user_id: string
          plan: 'free' | 'pro' | 'premium' | 'organizer' | 'gym_pro' | 'gym_elite'
          status: 'active' | 'trialing' | 'past_due' | 'cancelled' | 'paused'
          trial_ends_at: string | null
          current_period_end: string | null
          cancel_at_period_end: boolean
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['subscriptions']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['subscriptions']['Insert']>
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {
      user_role: 'athlete' | 'coach' | 'gym_owner' | 'organizer' | 'fan' | 'staff' | 'admin' | 'visitor'
    }
  }
}
