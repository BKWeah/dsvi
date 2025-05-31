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
      automated_messaging: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean | null
          last_run_at: string | null
          next_run_at: string | null
          template_id: string
          trigger_days_before: number | null
          trigger_type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          last_run_at?: string | null
          next_run_at?: string | null
          template_id: string
          trigger_days_before?: number | null
          trigger_type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          last_run_at?: string | null
          next_run_at?: string | null
          template_id?: string
          trigger_days_before?: number | null
          trigger_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "automated_messaging_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
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
          created_at: string
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
          updated_at: string
        }
        Insert: {
          api_key?: string | null
          api_secret?: string | null
          created_at?: string
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
          updated_at?: string
        }
        Update: {
          api_key?: string | null
          api_secret?: string | null
          created_at?: string
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
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_settings_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      message_recipients: {
        Row: {
          bounce_reason: string | null
          clicked_at: string | null
          created_at: string
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
          created_at?: string
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
          created_at?: string
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
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean | null
          name: string
          subject: string
          template_type: string
          updated_at: string
          variables: Json | null
        }
        Insert: {
          body: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          subject: string
          template_type: string
          updated_at?: string
          variables?: Json | null
        }
        Update: {
          body?: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          subject?: string
          template_type?: string
          updated_at?: string
          variables?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "message_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          body: string
          created_at: string
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
          updated_at: string
        }
        Insert: {
          body: string
          created_at?: string
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
          updated_at?: string
        }
        Update: {
          body?: string
          created_at?: string
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
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
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
          created_at: string
          id: string
          meta_description: string | null
          page_slug: string
          page_type: string | null
          school_id: string
          sections: Json
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          meta_description?: string | null
          page_slug: string
          page_type?: string | null
          school_id: string
          sections?: Json
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          meta_description?: string | null
          page_slug?: string
          page_type?: string | null
          school_id?: string
          sections?: Json
          title?: string
          updated_at?: string
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
      project_tasks: {
        Row: {
          id: string
          title: string
          estimated_hours: number
          category: string
          sub_category: string
          completed: boolean
          approved: boolean
          notes: string
          priority: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          title: string
          estimated_hours: number
          category: string
          sub_category: string
          completed?: boolean
          approved?: boolean
          notes?: string
          priority?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          estimated_hours?: number
          category?: string
          sub_category?: string
          completed?: boolean
          approved?: boolean
          notes?: string
          priority?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      school_requests: {
        Row: {
          admin_notes: string | null
          address: string | null
          contact_email: string
          contact_name: string
          created_at: string
          id: string
          message: string | null
          phone: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          school_name: string
          school_type: string | null
          status: string
          student_count: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          admin_notes?: string | null
          address?: string | null
          contact_email: string
          contact_name: string
          created_at?: string
          id?: string
          message?: string | null
          phone?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          school_name: string
          school_type?: string | null
          status?: string
          student_count?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          admin_notes?: string | null
          address?: string | null
          contact_email?: string
          contact_name?: string
          created_at?: string
          id?: string
          message?: string | null
          phone?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          school_name?: string
          school_type?: string | null
          status?: string
          student_count?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "school_requests_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      schools: {
        Row: {
          admin_user_id: string | null
          auto_renewal: boolean | null
          contact_info: Json | null
          created_at: string
          custom_css: string | null
          id: string
          last_reminder_sent: string | null
          logo_url: string | null
          name: string
          package_type: string | null
          payment_status: string | null
          slug: string
          subscription_end: string | null
          subscription_notes: string | null
          subscription_start: string | null
          subscription_status: string | null
          theme_settings: Json | null
          theme_version: number | null
          updated_at: string
        }
        Insert: {
          admin_user_id?: string | null
          auto_renewal?: boolean | null
          contact_info?: Json | null
          created_at?: string
          custom_css?: string | null
          id?: string
          last_reminder_sent?: string | null
          logo_url?: string | null
          name: string
          package_type?: string | null
          payment_status?: string | null
          slug: string
          subscription_end?: string | null
          subscription_notes?: string | null
          subscription_start?: string | null
          subscription_status?: string | null
          theme_settings?: Json | null
          theme_version?: number | null
          updated_at?: string
        }
        Update: {
          admin_user_id?: string | null
          auto_renewal?: boolean | null
          contact_info?: Json | null
          created_at?: string
          custom_css?: string | null
          id?: string
          last_reminder_sent?: string | null
          logo_url?: string | null
          name?: string
          package_type?: string | null
          payment_status?: string | null
          slug?: string
          subscription_end?: string | null
          subscription_notes?: string | null
          subscription_start?: string | null
          subscription_status?: string | null
          theme_settings?: Json | null
          theme_version?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      subscription_history: {
        Row: {
          action: string
          amount: number | null
          created_at: string
          created_by: string | null
          id: string
          new_end_date: string | null
          new_package: string | null
          notes: string | null
          payment_method: string | null
          previous_end_date: string | null
          previous_package: string | null
          school_id: string
        }
        Insert: {
          action: string
          amount?: number | null
          created_at?: string
          created_by?: string | null
          id?: string
          new_end_date?: string | null
          new_package?: string | null
          notes?: string | null
          payment_method?: string | null
          previous_end_date?: string | null
          previous_package?: string | null
          school_id: string
        }
        Update: {
          action?: string
          amount?: number | null
          created_at?: string
          created_by?: string | null
          id?: string
          new_end_date?: string | null
          new_package?: string | null
          notes?: string | null
          payment_method?: string | null
          previous_end_date?: string | null
          previous_package?: string | null
          school_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscription_history_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscription_history_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_reminders: {
        Row: {
          delivery_method: string | null
          id: string
          message_content: string | null
          reminder_type: string
          school_id: string
          sent_at: string
          sent_by: string | null
        }
        Insert: {
          delivery_method?: string | null
          id?: string
          message_content?: string | null
          reminder_type: string
          school_id: string
          sent_at?: string
          sent_by?: string | null
        }
        Update: {
          delivery_method?: string | null
          id?: string
          message_content?: string | null
          reminder_type?: string
          school_id?: string
          sent_at?: string
          sent_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscription_reminders_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscription_reminders_sent_by_fkey"
            columns: ["sent_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_messaging_stats: {
        Args: {}
        Returns: {
          total_messages: number
          sent_messages: number
          pending_messages: number
          failed_messages: number
          total_templates: number
          active_templates: number
        }[]
      }
      get_subscription_stats: {
        Args: {}
        Returns: {
          total_schools: number
          active_subscriptions: number
          expiring_subscriptions: number
          inactive_subscriptions: number
          standard_packages: number
          advanced_packages: number
        }[]
      }
      process_automated_messaging: {
        Args: {}
        Returns: number
      }
      upsert_user_profile: {
        Args: {
          p_user_id: string;
          p_email: string;
          p_role: string;
          p_name: string;
        };
        Returns: void; // Assuming it doesn't return a specific value that's used
      };
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
