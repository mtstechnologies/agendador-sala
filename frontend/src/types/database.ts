export interface Database {
  public: {
    Tables: {
      rooms: {
        Row: {
          id: string
          name: string
          capacity: number
          resources: string[]
          bloco: string
          department: string
          operating_hours: {
            start: string
            end: string
          } | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          capacity: number
          resources?: string[]
          bloco: string
          department: string
          operating_hours?: {
            start: string
            end: string
          } | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          capacity?: number
          resources?: string[]
          bloco?: string
          department?: string
          operating_hours?: {
            start: string
            end: string
          } | null
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

// Room em camelCase para alinhar com o backend (Prisma/Express)
export interface Room {
  id: string
  name: string
  capacity: number
  resources: string[]
  bloco: string
  department: string
  // O backend usa Json?; aqui tipamos como um intervalo opcional ou null se usado
  operatingHours: { start: string; end: string } | null
  isActive: boolean
}
export type Reservation = Database['public']['Tables']['reservations']['Row']
export type UserProfile = Database['public']['Tables']['user_profiles']['Row']

export type ReservationWithRoomAndUser = {
  id: string;
  roomId: string;
  userId: string;
  title: string;
  description?: string | null;
  startTime: string;
  endTime: string;
  status: string;
  updatedAt: string;
  room: {
    id: string;
    name: string;
    capacity: number;
    resources: string[];
    // outros campos se necessário
  };
  user: {
    id: string;
    fullName: string;
    email: string;
    role: string;
    department?: string | null;
    // outros campos se necessário
  };
}