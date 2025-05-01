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
      profiles: {
        Row: {
          id: string
          updated_at: string | null
          username: string | null
          full_name: string | null
          avatar_url: string | null
          website: string | null
          email: string | null
        }
        Insert: {
          id: string
          updated_at?: string | null
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          website?: string | null
          email?: string | null
        }
        Update: {
          id?: string
          updated_at?: string | null
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          website?: string | null
          email?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      audio_files: {
        Row: {
          id: string
          created_at: string
          user_id: string
          title: string
          description: string | null
          file_path: string
          duration: number | null
          tags: string[] | null
          public: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          title: string
          description?: string | null
          file_path: string
          duration?: number | null
          tags?: string[] | null
          public?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          title?: string
          description?: string | null
          file_path?: string
          duration?: number | null
          tags?: string[] | null
          public?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "audio_files_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
