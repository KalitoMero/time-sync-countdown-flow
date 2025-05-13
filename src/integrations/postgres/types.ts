
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      mitarbeiter: {
        Row: {
          created_at: string
          id: number
          name: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          name?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          name?: string | null
        }
      }
      timer: {
        Row: {
          confirmed_at: string | null
          created_at: string
          dauer_min: number | null
          id: string | null
          mitarbeiter: string | null
          special_case: string | null
          status: string | null
        }
        Insert: {
          confirmed_at?: string | null
          created_at?: string
          dauer_min?: number | null
          id?: string | null
          mitarbeiter?: string | null
          special_case?: string | null
          status?: string | null
        }
        Update: {
          confirmed_at?: string | null
          created_at?: string
          dauer_min?: number | null
          id?: string | null
          mitarbeiter?: string | null
          special_case?: string | null
          status?: string | null
        }
      }
    }
  }
}
