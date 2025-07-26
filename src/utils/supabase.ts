import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL!
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for better TypeScript support
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          fitness_goal: 'muscle_gain' | 'fat_loss' | 'strength' | 'maintenance'
          experience_level: 'beginner' | 'intermediate' | 'advanced'
          age: number | null
          height_cm: number | null
          target_weight_kg: number | null
          gym_frequency: number
          created_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          fitness_goal?: 'muscle_gain' | 'fat_loss' | 'strength' | 'maintenance'
          experience_level?: 'beginner' | 'intermediate' | 'advanced'
          age?: number | null
          height_cm?: number | null
          target_weight_kg?: number | null
          gym_frequency?: number
        }
        Update: {
          full_name?: string | null
          fitness_goal?: 'muscle_gain' | 'fat_loss' | 'strength' | 'maintenance'
          experience_level?: 'beginner' | 'intermediate' | 'advanced'
          age?: number | null
          height_cm?: number | null
          target_weight_kg?: number | null
          gym_frequency?: number
        }
      }
    }
  }
}
