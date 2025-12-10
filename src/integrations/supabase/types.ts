export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      artists: {
        Row: {
          created_at: string
          id: string
          name: string
          role: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          role?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          role?: string | null
        }
        Relationships: []
      }
      audio_tracks: {
        Row: {
          approved: boolean | null
          created_at: string
          drive_download_link: string | null
          drive_file_id: string | null
          drive_view_link: string | null
          duration_seconds: number | null
          file_url: string
          id: string
          song_id: string
          uploader_id: string | null
          version_tag: string | null
          voice_part: Database["public"]["Enums"]["voice_part"] | null
        }
        Insert: {
          approved?: boolean | null
          created_at?: string
          drive_download_link?: string | null
          drive_file_id?: string | null
          drive_view_link?: string | null
          duration_seconds?: number | null
          file_url: string
          id?: string
          song_id: string
          uploader_id?: string | null
          version_tag?: string | null
          voice_part?: Database["public"]["Enums"]["voice_part"] | null
        }
        Update: {
          approved?: boolean | null
          created_at?: string
          drive_download_link?: string | null
          drive_file_id?: string | null
          drive_view_link?: string | null
          duration_seconds?: number | null
          file_url?: string
          id?: string
          song_id?: string
          uploader_id?: string | null
          version_tag?: string | null
          voice_part?: Database["public"]["Enums"]["voice_part"] | null
        }
        Relationships: [
          {
            foreignKeyName: "audio_tracks_song_id_fkey"
            columns: ["song_id"]
            isOneToOne: false
            referencedRelation: "songs"
            referencedColumns: ["id"]
          },
        ]
      }
      banners: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          display_order: number
          drive_file_id: string | null
          id: string
          image_url: string | null
          is_active: boolean
          link_url: string | null
          show_text: boolean
          title: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          display_order?: number
          drive_file_id?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          link_url?: string | null
          show_text?: boolean
          title?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          display_order?: number
          drive_file_id?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          link_url?: string | null
          show_text?: boolean
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      celebration_types: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      celebrations: {
        Row: {
          created_at: string
          date_rule: string | null
          description: string | null
          feast_type: string | null
          id: string
          liturgical_rank: Database["public"]["Enums"]["liturgical_rank"]
          liturgical_season: string | null
          name: string
        }
        Insert: {
          created_at?: string
          date_rule?: string | null
          description?: string | null
          feast_type?: string | null
          id?: string
          liturgical_rank?: Database["public"]["Enums"]["liturgical_rank"]
          liturgical_season?: string | null
          name: string
        }
        Update: {
          created_at?: string
          date_rule?: string | null
          description?: string | null
          feast_type?: string | null
          id?: string
          liturgical_rank?: Database["public"]["Enums"]["liturgical_rank"]
          liturgical_season?: string | null
          name?: string
        }
        Relationships: []
      }
      liturgical_hierarchies: {
        Row: {
          created_at: string
          id: string
          name: string
          value: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          value: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          value?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          approval_status: Database["public"]["Enums"]["approval_status"]
          approved_at: string | null
          approved_by: string | null
          avatar_url: string | null
          cpf: string | null
          created_at: string
          display_name: string | null
          email: string | null
          full_name: string | null
          has_stole: boolean | null
          has_vestment: boolean | null
          id: string
          join_date: string | null
          phone: string | null
          preferred_voice: Database["public"]["Enums"]["voice_part"] | null
          rejection_reason: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          approval_status?: Database["public"]["Enums"]["approval_status"]
          approved_at?: string | null
          approved_by?: string | null
          avatar_url?: string | null
          cpf?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          full_name?: string | null
          has_stole?: boolean | null
          has_vestment?: boolean | null
          id: string
          join_date?: string | null
          phone?: string | null
          preferred_voice?: Database["public"]["Enums"]["voice_part"] | null
          rejection_reason?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          approval_status?: Database["public"]["Enums"]["approval_status"]
          approved_at?: string | null
          approved_by?: string | null
          avatar_url?: string | null
          cpf?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          full_name?: string | null
          has_stole?: boolean | null
          has_vestment?: boolean | null
          id?: string
          join_date?: string | null
          phone?: string | null
          preferred_voice?: Database["public"]["Enums"]["voice_part"] | null
          rejection_reason?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      rehearsal_list_songs: {
        Row: {
          id: string
          notes: string | null
          position_order: number
          rehearsal_list_id: string
          song_id: string
        }
        Insert: {
          id?: string
          notes?: string | null
          position_order?: number
          rehearsal_list_id: string
          song_id: string
        }
        Update: {
          id?: string
          notes?: string | null
          position_order?: number
          rehearsal_list_id?: string
          song_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rehearsal_list_songs_rehearsal_list_id_fkey"
            columns: ["rehearsal_list_id"]
            isOneToOne: false
            referencedRelation: "rehearsal_lists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rehearsal_list_songs_song_id_fkey"
            columns: ["song_id"]
            isOneToOne: false
            referencedRelation: "songs"
            referencedColumns: ["id"]
          },
        ]
      }
      rehearsal_lists: {
        Row: {
          created_at: string
          created_by: string | null
          date: string | null
          description: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          date?: string | null
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          date?: string | null
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      scores: {
        Row: {
          approved: boolean | null
          created_at: string
          drive_download_link: string | null
          drive_file_id: string | null
          drive_view_link: string | null
          file_name: string | null
          file_url: string
          id: string
          key_signature: string | null
          page_count: number | null
          song_id: string
          uploader_id: string | null
        }
        Insert: {
          approved?: boolean | null
          created_at?: string
          drive_download_link?: string | null
          drive_file_id?: string | null
          drive_view_link?: string | null
          file_name?: string | null
          file_url: string
          id?: string
          key_signature?: string | null
          page_count?: number | null
          song_id: string
          uploader_id?: string | null
        }
        Update: {
          approved?: boolean | null
          created_at?: string
          drive_download_link?: string | null
          drive_file_id?: string | null
          drive_view_link?: string | null
          file_name?: string | null
          file_url?: string
          id?: string
          key_signature?: string | null
          page_count?: number | null
          song_id?: string
          uploader_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scores_song_id_fkey"
            columns: ["song_id"]
            isOneToOne: false
            referencedRelation: "songs"
            referencedColumns: ["id"]
          },
        ]
      }
      song_artists: {
        Row: {
          artist_id: string
          id: string
          role: string | null
          song_id: string
        }
        Insert: {
          artist_id: string
          id?: string
          role?: string | null
          song_id: string
        }
        Update: {
          artist_id?: string
          id?: string
          role?: string | null
          song_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "song_artists_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "artists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "song_artists_song_id_fkey"
            columns: ["song_id"]
            isOneToOne: false
            referencedRelation: "songs"
            referencedColumns: ["id"]
          },
        ]
      }
      song_celebration: {
        Row: {
          celebration_id: string
          context_notes: string | null
          default_order: number | null
          id: string
          song_id: string
          usage_count: number | null
        }
        Insert: {
          celebration_id: string
          context_notes?: string | null
          default_order?: number | null
          id?: string
          song_id: string
          usage_count?: number | null
        }
        Update: {
          celebration_id?: string
          context_notes?: string | null
          default_order?: number | null
          id?: string
          song_id?: string
          usage_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "song_celebration_celebration_id_fkey"
            columns: ["celebration_id"]
            isOneToOne: false
            referencedRelation: "celebrations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "song_celebration_song_id_fkey"
            columns: ["song_id"]
            isOneToOne: false
            referencedRelation: "songs"
            referencedColumns: ["id"]
          },
        ]
      }
      song_genres: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      song_languages: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      song_tags: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      song_textures: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      songs: {
        Row: {
          arranger: string | null
          composer: string | null
          copyright_info: string | null
          created_at: string
          created_by: string | null
          drive_folder_id: string | null
          genre: string | null
          id: string
          language: string | null
          liturgical_tags: Json | null
          texture: string | null
          title: string
          updated_at: string
          voicing_type: Database["public"]["Enums"]["voicing_type"]
        }
        Insert: {
          arranger?: string | null
          composer?: string | null
          copyright_info?: string | null
          created_at?: string
          created_by?: string | null
          drive_folder_id?: string | null
          genre?: string | null
          id?: string
          language?: string | null
          liturgical_tags?: Json | null
          texture?: string | null
          title: string
          updated_at?: string
          voicing_type?: Database["public"]["Enums"]["voicing_type"]
        }
        Update: {
          arranger?: string | null
          composer?: string | null
          copyright_info?: string | null
          created_at?: string
          created_by?: string | null
          drive_folder_id?: string | null
          genre?: string | null
          id?: string
          language?: string | null
          liturgical_tags?: Json | null
          texture?: string | null
          title?: string
          updated_at?: string
          voicing_type?: Database["public"]["Enums"]["voicing_type"]
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      voice_types: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "member"
      approval_status: "pending" | "approved" | "rejected"
      liturgical_rank: "solemnity" | "feast" | "memorial" | "optional_memorial"
      voice_part: "soprano" | "contralto" | "tenor" | "baixo"
      voicing_type: "unison" | "polyphonic" | "gregorian"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "member"],
      approval_status: ["pending", "approved", "rejected"],
      liturgical_rank: ["solemnity", "feast", "memorial", "optional_memorial"],
      voice_part: ["soprano", "contralto", "tenor", "baixo"],
      voicing_type: ["unison", "polyphonic", "gregorian"],
    },
  },
} as const
