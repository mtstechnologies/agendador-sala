export interface User {
  id: string
  email: string
  full_name: string
  role: 'user' | 'admin'
  department?: string
}

export interface AuthState {
  user: User | null
  loading: boolean
  error: string | null
}