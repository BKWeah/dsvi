export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      activity_logs: {
        Row: {
          action: string
          created_at: string | null
          details: Json | null
          id: string
          ip_address: unknown | null
          school_id: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          school_id?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          school_id?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_logs_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_assignments: {
        Row: {
          admin_user_id: string
          assigned_by: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          school_id: string
        }
        Insert: {
          admin_user_id: string
          assigned_by?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          school_id: string
        }
        Update: {
          admin_user_id?: string
          assigned_by?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          school_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_assignments_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_permissions: {
        Row: {
          admin_user_id: string
          created_at: string | null
          expires_at: string | null
          granted_by: string | null
          id: string
          is_active: boolean | null
          permission_type: string
          resource_id: string | null
        }
        Insert: {
          admin_user_id: string
          created_at?: string | null
          expires_at?: string | null
          granted_by?: string | null
          id?: string
          is_active?: boolean | null
          permission_type: string
          resource_id?: string | null
        }
        Update: {
          admin_user_id?: string
          created_at?: string | null
          expires_at?: string | null
          granted_by?: string | null
          id?: string
          is_active?: boolean | null
          permission_type?: string
          resource_id?: string | null
        }
        Relationships: []
      }
      admin_profiles: {
        Row: {
          admin_level: number
          created_at: string | null
          created_by: string | null
          id: string
          is_active: boolean | null
          notes: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          admin_level: number
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          notes?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          admin_level?: number
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          notes?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      admin_school_assignments: {
        Row: {
          assigned_by: string
          created_at: string | null
          id: string
          permissions: Json | null
          school_admin_id: string
          school_id: string
          updated_at: string | null
        }
        Insert: {
          assigned_by: string
          created_at?: string | null
          id?: string
          permissions?: Json | null
          school_admin_id: string
          school_id: string
          updated_at?: string | null
        }
        Update: {
          assigned_by?: string
          created_at?: string | null
          id?: string
          permissions?: Json | null
          school_admin_id?: string
          school_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_school_assignments_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_school_assignments_school_admin_id_fkey"
            columns: ["school_admin_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_school_assignments_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      automated_messaging: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          is_active: boolean | null
          last_run_at: string | null
          next_run_at: string | null
          template_id: string
          trigger_days_before: number | null
          trigger_type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          last_run_at?: string | null
          next_run_at?: string | null
          template_id: string
          trigger_days_before?: number | null
          trigger_type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          last_run_at?: string | null
          next_run_at?: string | null
          template_id?: string
          trigger_days_before?: number | null
          trigger_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "automated_messaging_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "message_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      email_settings: {
        Row: {
          api_key: string | null
          api_secret: string | null
          created_at: string | null
          created_by: string | null
          from_email: string
          from_name: string
          id: string
          is_active: boolean | null
          provider: string
          reply_to_email: string | null
          smtp_host: string | null
          smtp_password: string | null
          smtp_port: number | null
          smtp_username: string | null
          test_mode: boolean | null
          updated_at: string | null
        }
        Insert: {
          api_key?: string | null
          api_secret?: string | null
          created_at?: string | null
          created_by?: string | null
          from_email: string
          from_name: string
          id?: string
          is_active?: boolean | null
          provider: string
          reply_to_email?: string | null
          smtp_host?: string | null
          smtp_password?: string | null
          smtp_port?: number | null
          smtp_username?: string | null
          test_mode?: boolean | null
          updated_at?: string | null
        }
        Update: {
          api_key?: string | null
          api_secret?: string | null
          created_at?: string | null
          created_by?: string | null
          from_email?: string
          from_name?: string
          id?: string
          is_active?: boolean | null
          provider?: string
          reply_to_email?: string | null
          smtp_host?: string | null
          smtp_password?: string | null
          smtp_port?: number | null
          smtp_username?: string | null
          test_mode?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      message_recipients: {
        Row: {
          bounce_reason: string | null
          clicked_at: string | null
          created_at: string | null
          delivered_at: string | null
          delivery_attempts: number | null
          delivery_status: string | null
          error_message: string | null
          id: string
          last_attempt_at: string | null
          message_id: string
          opened_at: string | null
          recipient_email: string
          recipient_name: string | null
          recipient_type: string | null
          school_id: string | null
          sent_at: string | null
        }
        Insert: {
          bounce_reason?: string | null
          clicked_at?: string | null
          created_at?: string | null
          delivered_at?: string | null
          delivery_attempts?: number | null
          delivery_status?: string | null
          error_message?: string | null
          id?: string
          last_attempt_at?: string | null
          message_id: string
          opened_at?: string | null
          recipient_email: string
          recipient_name?: string | null
          recipient_type?: string | null
          school_id?: string | null
          sent_at?: string | null
        }
        Update: {
          bounce_reason?: string | null
          clicked_at?: string | null
          created_at?: string | null
          delivered_at?: string | null
          delivery_attempts?: number | null
          delivery_status?: string | null
          error_message?: string | null
          id?: string
          last_attempt_at?: string | null
          message_id?: string
          opened_at?: string | null
          recipient_email?: string
          recipient_name?: string | null
          recipient_type?: string | null
          school_id?: string | null
          sent_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "message_recipients_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_recipients_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      message_templates: {
        Row: {
          body: string
          created_at: string | null
          created_by: string | null
          id: string
          is_active: boolean | null
          name: string
          subject: string
          template_type: string
          updated_at: string | null
          variables: Json | null
        }
        Insert: {
          body: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          subject: string
          template_type: string
          updated_at?: string | null
          variables?: Json | null
        }
        Update: {
          body?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          subject?: string
          template_type?: string
          updated_at?: string | null
          variables?: Json | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          body: string
          created_at: string | null
          delivery_id: string | null
          delivery_provider: string | null
          delivery_response: Json | null
          error_message: string | null
          failed_deliveries: number | null
          id: string
          message_type: string | null
          scheduled_at: string | null
          sender_id: string
          sent_at: string | null
          status: string | null
          subject: string
          successful_deliveries: number | null
          template_id: string | null
          total_recipients: number | null
          updated_at: string | null
        }
        Insert: {
          body: string
          created_at?: string | null
          delivery_id?: string | null
          delivery_provider?: string | null
          delivery_response?: Json | null
          error_message?: string | null
          failed_deliveries?: number | null
          id?: string
          message_type?: string | null
          scheduled_at?: string | null
          sender_id: string
          sent_at?: string | null
          status?: string | null
          subject: string
          successful_deliveries?: number | null
          template_id?: string | null
          total_recipients?: number | null
          updated_at?: string | null
        }
        Update: {
          body?: string
          created_at?: string | null
          delivery_id?: string | null
          delivery_provider?: string | null
          delivery_response?: Json | null
          error_message?: string | null
          failed_deliveries?: number | null
          id?: string
          message_type?: string | null
          scheduled_at?: string | null
          sender_id?: string
          sent_at?: string | null
          status?: string | null
          subject?: string
          successful_deliveries?: number | null
          template_id?: string | null
          total_recipients?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "message_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      pages: {
        Row: {
          created_at: string | null
          id: string
          meta_description: string | null
          page_slug: string
          page_type: string | null
          school_id: string | null
          sections: Json | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          meta_description?: string | null
          page_slug: string
          page_type?: string | null
          school_id?: string | null
          sections?: Json | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          meta_description?: string | null
          page_slug?: string
          page_type?: string | null
          school_id?: string | null
          sections?: Json | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pages_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      pending_admin_invitations: {
        Row: {
          admin_level: number
          created_at: string | null
          created_by: string
          email: string
          email_hash: string
          expires_at: string
          id: string
          invite_token: string
          is_used: boolean | null
          name: string
          notes: string | null
          permissions: string[] | null
          school_ids: string[] | null
          signup_link: string | null
          temp_password: string
          used_at: string | null
          used_by: string | null
        }
        Insert: {
          admin_level?: number
          created_at?: string | null
          created_by: string
          email: string
          email_hash: string
          expires_at: string
          id?: string
          invite_token: string
          is_used?: boolean | null
          name: string
          notes?: string | null
          permissions?: string[] | null
          school_ids?: string[] | null
          signup_link?: string | null
          temp_password: string
          used_at?: string | null
          used_by?: string | null
        }
        Update: {
          admin_level?: number
          created_at?: string | null
          created_by?: string
          email?: string
          email_hash?: string
          expires_at?: string
          id?: string
          invite_token?: string
          is_used?: boolean | null
          name?: string
          notes?: string | null
          permissions?: string[] | null
          school_ids?: string[] | null
          signup_link?: string | null
          temp_password?: string
          used_at?: string | null
          used_by?: string | null
        }
        Relationships: []
      }
      project_task_audit: {
        Row: {
          action: string
          id: string
          new_values: Json | null
          old_values: Json | null
          task_id: string
          timestamp: string | null
          user_agent: string | null
        }
        Insert: {
          action: string
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          task_id: string
          timestamp?: string | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          task_id?: string
          timestamp?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      project_tasks: {
        Row: {
          approved: boolean | null
          category: string
          completed: boolean | null
          created_at: string | null
          estimated_hours: number
          id: string
          notes: string | null
          priority: string | null
          sub_category: string
          title: string
          updated_at: string | null
        }
        Insert: {
          approved?: boolean | null
          category: string
          completed?: boolean | null
          created_at?: string | null
          estimated_hours: number
          id: string
          notes?: string | null
          priority?: string | null
          sub_category: string
          title: string
          updated_at?: string | null
        }
        Update: {
          approved?: boolean | null
          category?: string
          completed?: boolean | null
          created_at?: string | null
          estimated_hours?: number
          id?: string
          notes?: string | null
          priority?: string | null
          sub_category?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      school_requests: {
        Row: {
          address: string | null
          admin_notes: string | null
          contact_email: string
          contact_name: string
          created_at: string | null
          id: string
          message: string | null
          phone: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          school_name: string
          school_type: string | null
          status: string | null
          student_count: string | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          address?: string | null
          admin_notes?: string | null
          contact_email: string
          contact_name: string
          created_at?: string | null
          id?: string
          message?: string | null
          phone?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          school_name: string
          school_type?: string | null
          status?: string | null
          student_count?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          address?: string | null
          admin_notes?: string | null
          contact_email?: string
          contact_name?: string
          created_at?: string | null
          id?: string
          message?: string | null
          phone?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          school_name?: string
          school_type?: string | null
          status?: string | null
          student_count?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      schools: {
        Row: {
          admin_user_id: string | null
          auto_renewal: boolean | null
          contact_info: Json | null
          created_at: string | null
          custom_css: string | null
          id: string
          last_reminder_sent: string | null
          logo_url: string | null
          name: string | null
          package_type: string | null
          slug: string
          subscription_end: string | null
          subscription_notes: string | null
          subscription_start: string | null
          subscription_status: string | null
          theme_settings: Json | null
          theme_version: number | null
          updated_at: string | null
        }
        Insert: {
          admin_user_id?: string | null
          auto_renewal?: boolean | null
          contact_info?: Json | null
          created_at?: string | null
          custom_css?: string | null
          id?: string
          last_reminder_sent?: string | null
          logo_url?: string | null
          name?: string | null
          package_type?: string | null
          slug: string
          subscription_end?: string | null
          subscription_notes?: string | null
          subscription_start?: string | null
          subscription_status?: string | null
          theme_settings?: Json | null
          theme_version?: number | null
          updated_at?: string | null
        }
        Update: {
          admin_user_id?: string | null
          auto_renewal?: boolean | null
          contact_info?: Json | null
          created_at?: string | null
          custom_css?: string | null
          id?: string
          last_reminder_sent?: string | null
          logo_url?: string | null
          name?: string | null
          package_type?: string | null
          slug?: string
          subscription_end?: string | null
          subscription_notes?: string | null
          subscription_start?: string | null
          subscription_status?: string | null
          theme_settings?: Json | null
          theme_version?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          name: string | null
          role: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string | null
          role?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string | null
          role?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      assign_school_admin: {
        Args: { p_school_id: string; p_user_id: string }
        Returns: boolean
      }
      assign_school_to_admin: {
        Args: {
          target_user_id: string
          target_school_id: string
          assigned_by_user_id: string
        }
        Returns: Json
      }
      check_dsvi_admins_needing_migration: {
        Args: Record<PropertyKey, never>
        Returns: {
          user_id: string
          email: string
          has_admin_profile: boolean
        }[]
      }
      create_admin_invitation: {
        Args: {
          p_email: string
          p_name: string
          p_created_by: string
          p_permissions?: string[]
          p_school_ids?: string[]
          p_notes?: string
          p_days_valid?: number
        }
        Returns: Json
      }
      create_admin_profile: {
        Args: {
          target_user_id: string
          admin_level: number
          created_by_user_id: string
          notes?: string
        }
        Returns: string
      }
      create_level2_admin_complete: {
        Args: {
          p_user_id: string
          p_email: string
          p_name: string
          p_created_by: string
          p_permissions?: string[]
          p_school_ids?: string[]
          p_notes?: string
        }
        Returns: Json
      }
      get_accessible_schools_for_user: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          name: string
        }[]
      }
      get_admin_level: {
        Args: { user_id: string }
        Returns: number
      }
      get_invitation_by_token: {
        Args: { p_invite_token: string }
        Returns: Json
      }
      get_messaging_stats: {
        Args: Record<PropertyKey, never>
        Returns: {
          total_messages: number
          sent_messages: number
          pending_messages: number
          failed_messages: number
          total_templates: number
          active_templates: number
        }[]
      }
      grant_admin_permission: {
        Args: {
          target_user_id: string
          permission_type: string
          resource_id?: string
          granted_by_user_id?: string
          expires_at?: string
        }
        Returns: Json
      }
      has_admin_permission: {
        Args: { user_id: string; permission_type: string; resource_id?: string }
        Returns: boolean
      }
      list_pending_invitations: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          email: string
          name: string
          invite_token: string
          created_by: string
          created_at: string
          expires_at: string
          is_used: boolean
          days_until_expiry: number
        }[]
      }
      log_activity: {
        Args: {
          p_user_id: string
          p_school_id: string
          p_action: string
          p_details?: Json
        }
        Returns: string
      }
      mark_invitation_used: {
        Args: { p_invite_token: string; p_used_by: string }
        Returns: Json
      }
      migrate_existing_dsvi_admins: {
        Args: Record<PropertyKey, never>
        Returns: {
          user_id: string
          email: string
          migrated: boolean
        }[]
      }
      process_automated_messaging: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      process_level2_admin_signup: {
        Args: { p_user_id: string; p_email: string; p_invite_token: string }
        Returns: Json
      }
      safe_create_admin_profile: {
        Args: {
          p_user_id: string
          p_admin_level: number
          p_created_by: string
          p_notes?: string
        }
        Returns: Json
      }
      upsert_user_profile: {
        Args: {
          p_user_id: string
          p_email: string
          p_role: string
          p_name: string
        }
        Returns: undefined
      }
      validate_message_recipient_access: {
        Args: { school_ids: string[] }
        Returns: boolean
      }
      verify_admin_setup: {
        Args: { p_user_id: string }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
