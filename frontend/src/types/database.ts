export interface Database {
  public: {
    Tables: {
      rooms: {
        Row: {
          id: string
          name: string
          capacity: number
          resources: string[]
          operating_hours: {
            start: string
            end: string
          }
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          capacity: number
          resources?: string[]
          operating_hours?: {
            start: string
            end: string
          }
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          capacity?: number
          resources?: string[]
          operating_hours?: {
            start: string
            end: string
          }
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      reservations: {
        Row: {
          id: string
          room_id: string
          user_id: string
          title: string
          description: string | null
          start_time: string
          end_time: string
          status: 'pending' | 'approved' | 'rejected' | 'cancelled'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          room_id: string
          user_id: string
          title: string
          description?: string | null
          start_time: string
          end_time: string
          status?: 'pending' | 'approved' | 'rejected' | 'cancelled'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          room_id?: string
          user_id?: string
          title?: string
          description?: string | null
          start_time?: string
          end_time?: string
          status?: 'pending' | 'approved' | 'rejected' | 'cancelled'
          created_at?: string
          updated_at?: string
        }
      }
      user_profiles: {
        Row: {
          id: string
          full_name: string
          email: string
          role: 'user' | 'admin'
          department: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name: string
          email: string
          role?: 'user' | 'admin'
          department?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          email?: string
          role?: 'user' | 'admin'
          department?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

export type Room = Database['public']['Tables']['rooms']['Row']
export type Reservation = Database['public']['Tables']['reservations']['Row']
export type UserProfile = Database['public']['Tables']['user_profiles']['Row']

export type ReservationWithRoom = Reservation & {
  rooms: Room
}

export type ReservationWithDetails = Reservation & {
  rooms: Room
  user_profiles: UserProfile
}