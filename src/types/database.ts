export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

type AppRole = "super_admin" | "hoa_admin" | "board_member" | "community_manager" | "inspector" | "read_only";
type ViolationStatus =
  | "draft"
  | "open"
  | "under_review"
  | "notice_sent"
  | "warning_sent"
  | "hearing_scheduled"
  | "appealed"
  | "fine_pending"
  | "resolved"
  | "closed";
type TenantRow = { id: string; organization_id: string; created_at: string; updated_at: string };
type TenantInsert = { id?: string; organization_id: string; created_at?: string; updated_at?: string };
type TenantUpdate = Partial<TenantInsert>;

export type Database = {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string;
          name: string;
          slug: string;
          plan: string;
          branding: Json;
          contact_email: string | null;
          contact_phone: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          plan?: string;
          branding?: Json;
          contact_email?: string | null;
          contact_phone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["organizations"]["Insert"]>;
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          email: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          email?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: [];
      };
      memberships: {
        Row: {
          id: string;
          organization_id: string;
          user_id: string;
          role: AppRole;
          status: "invited" | "active" | "suspended";
          invited_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          user_id: string;
          role?: AppRole;
          status?: "invited" | "active" | "suspended";
          invited_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["memberships"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "memberships_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          }
        ];
      };
      residents: {
        Row: TenantRow & {
          first_name: string;
          last_name: string;
          email: string | null;
          phone: string | null;
          notes: string | null;
        };
        Insert: TenantInsert & {
          first_name: string;
          last_name: string;
          email?: string | null;
          phone?: string | null;
          notes?: string | null;
        };
        Update: TenantUpdate & Partial<Omit<Database["public"]["Tables"]["residents"]["Insert"], keyof TenantInsert>>;
        Relationships: [];
      };
      properties: {
        Row: TenantRow & {
          address: string;
          parcel_number: string | null;
          section: string | null;
          status: string;
          latitude: number | null;
          longitude: number | null;
        };
        Insert: TenantInsert & {
          address: string;
          parcel_number?: string | null;
          section?: string | null;
          status?: string;
          latitude?: number | null;
          longitude?: number | null;
        };
        Update: TenantUpdate & Partial<Omit<Database["public"]["Tables"]["properties"]["Insert"], keyof TenantInsert>>;
        Relationships: [];
      };
      property_owners: {
        Row: { id: string; organization_id: string; property_id: string; resident_id: string; owner_type: string; start_date: string | null; end_date: string | null; created_at: string };
        Insert: { id?: string; organization_id: string; property_id: string; resident_id: string; owner_type?: string; start_date?: string | null; end_date?: string | null; created_at?: string };
        Update: Partial<Database["public"]["Tables"]["property_owners"]["Insert"]>;
        Relationships: [];
      };
      violation_categories: {
        Row: { id: string; organization_id: string; name: string; default_severity: string; created_at: string };
        Insert: { id?: string; organization_id: string; name: string; default_severity?: string; created_at?: string };
        Update: Partial<Database["public"]["Tables"]["violation_categories"]["Insert"]>;
        Relationships: [];
      };
      violations: {
        Row: TenantRow & {
          property_id: string;
          resident_id: string | null;
          category_id: string | null;
          description: string;
          status: ViolationStatus;
          severity: "low" | "medium" | "high" | "critical";
          due_date: string | null;
          resolved_at: string | null;
          created_by: string | null;
        };
        Insert: TenantInsert & {
          property_id: string;
          resident_id?: string | null;
          category_id?: string | null;
          description: string;
          status?: ViolationStatus;
          severity?: "low" | "medium" | "high" | "critical";
          due_date?: string | null;
          resolved_at?: string | null;
          created_by?: string | null;
        };
        Update: TenantUpdate & Partial<Omit<Database["public"]["Tables"]["violations"]["Insert"], keyof TenantInsert>>;
        Relationships: [];
      };
      violation_photos: {
        Row: { id: string; organization_id: string; violation_id: string; storage_path: string; caption: string | null; created_by: string | null; created_at: string };
        Insert: { id?: string; organization_id: string; violation_id: string; storage_path: string; caption?: string | null; created_by?: string | null; created_at?: string };
        Update: Partial<Database["public"]["Tables"]["violation_photos"]["Insert"]>;
        Relationships: [];
      };
      violation_comments: {
        Row: { id: string; organization_id: string; violation_id: string; body: string; created_by: string | null; created_at: string };
        Insert: { id?: string; organization_id: string; violation_id: string; body: string; created_by?: string | null; created_at?: string };
        Update: Partial<Database["public"]["Tables"]["violation_comments"]["Insert"]>;
        Relationships: [];
      };
      violation_notices: {
        Row: {
          id: string;
          organization_id: string;
          violation_id: string;
          notice_type: string;
          delivery_method: string;
          delivery_status: string;
          subject: string;
          body: string;
          sent_at: string | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          violation_id: string;
          notice_type?: string;
          delivery_method?: string;
          delivery_status?: string;
          subject: string;
          body: string;
          sent_at?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["violation_notices"]["Insert"]>;
        Relationships: [];
      };
      violation_hearings: {
        Row: {
          id: string;
          organization_id: string;
          violation_id: string;
          scheduled_at: string;
          location: string | null;
          status: string;
          outcome_notes: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          violation_id: string;
          scheduled_at: string;
          location?: string | null;
          status?: string;
          outcome_notes?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["violation_hearings"]["Insert"]>;
        Relationships: [];
      };
      violation_status_history: {
        Row: {
          id: string;
          organization_id: string;
          violation_id: string;
          from_status: string | null;
          to_status: string;
          notes: string | null;
          changed_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          violation_id: string;
          from_status?: string | null;
          to_status: string;
          notes?: string | null;
          changed_by?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["violation_status_history"]["Insert"]>;
        Relationships: [];
      };
      architectural_requests: {
        Row: TenantRow & { property_id: string; resident_id: string | null; title: string; description: string | null; status: "submitted" | "under_review" | "board_review" | "approved" | "rejected"; decision_notes: string | null; decided_at: string | null };
        Insert: TenantInsert & { property_id: string; resident_id?: string | null; title: string; description?: string | null; status?: "submitted" | "under_review" | "board_review" | "approved" | "rejected"; decision_notes?: string | null; decided_at?: string | null };
        Update: TenantUpdate & Partial<Omit<Database["public"]["Tables"]["architectural_requests"]["Insert"], keyof TenantInsert>>;
        Relationships: [];
      };
      architectural_request_files: {
        Row: { id: string; organization_id: string; request_id: string; storage_path: string; file_name: string; created_at: string };
        Insert: { id?: string; organization_id: string; request_id: string; storage_path: string; file_name: string; created_at?: string };
        Update: Partial<Database["public"]["Tables"]["architectural_request_files"]["Insert"]>;
        Relationships: [];
      };
      inspection_templates: {
        Row: { id: string; organization_id: string; name: string; checklist: Json; created_at: string };
        Insert: { id?: string; organization_id: string; name: string; checklist?: Json; created_at?: string };
        Update: Partial<Database["public"]["Tables"]["inspection_templates"]["Insert"]>;
        Relationships: [];
      };
      inspections: {
        Row: TenantRow & { template_id: string | null; title: string; scheduled_for: string | null; assigned_to: string | null; status: "scheduled" | "in_progress" | "completed" | "canceled" };
        Insert: TenantInsert & { template_id?: string | null; title: string; scheduled_for?: string | null; assigned_to?: string | null; status?: "scheduled" | "in_progress" | "completed" | "canceled" };
        Update: TenantUpdate & Partial<Omit<Database["public"]["Tables"]["inspections"]["Insert"], keyof TenantInsert>>;
        Relationships: [];
      };
      inspection_reports: {
        Row: { id: string; organization_id: string; inspection_id: string; findings: Json; notes: string | null; recommendations: string | null; created_at: string };
        Insert: { id?: string; organization_id: string; inspection_id: string; findings?: Json; notes?: string | null; recommendations?: string | null; created_at?: string };
        Update: Partial<Database["public"]["Tables"]["inspection_reports"]["Insert"]>;
        Relationships: [];
      };
      documents: {
        Row: TenantRow & { name: string; category: string; visibility: string };
        Insert: TenantInsert & { name: string; category: string; visibility?: string };
        Update: TenantUpdate & Partial<Omit<Database["public"]["Tables"]["documents"]["Insert"], keyof TenantInsert>>;
        Relationships: [];
      };
      document_versions: {
        Row: { id: string; organization_id: string; document_id: string; version_label: string; storage_path: string; uploaded_by: string | null; created_at: string };
        Insert: { id?: string; organization_id: string; document_id: string; version_label: string; storage_path: string; uploaded_by?: string | null; created_at?: string };
        Update: Partial<Database["public"]["Tables"]["document_versions"]["Insert"]>;
        Relationships: [];
      };
      announcements: {
        Row: { id: string; organization_id: string; title: string; body: string; audience: string; published_at: string | null; created_by: string | null; created_at: string };
        Insert: { id?: string; organization_id: string; title: string; body: string; audience?: string; published_at?: string | null; created_by?: string | null; created_at?: string };
        Update: Partial<Database["public"]["Tables"]["announcements"]["Insert"]>;
        Relationships: [];
      };
      notifications: {
        Row: { id: string; organization_id: string; user_id: string; title: string; body: string | null; read_at: string | null; created_at: string };
        Insert: { id?: string; organization_id: string; user_id: string; title: string; body?: string | null; read_at?: string | null; created_at?: string };
        Update: Partial<Database["public"]["Tables"]["notifications"]["Insert"]>;
        Relationships: [];
      };
      activity_logs: {
        Row: { id: string; organization_id: string; actor_id: string | null; action: string; target_table: string | null; target_id: string | null; metadata: Json; created_at: string };
        Insert: { id?: string; organization_id: string; actor_id?: string | null; action: string; target_table?: string | null; target_id?: string | null; metadata?: Json; created_at?: string };
        Update: never;
        Relationships: [];
      };
      notification_preferences: {
        Row: {
          id: string;
          organization_id: string;
          user_id: string;
          email_enabled: boolean;
          in_app_enabled: boolean;
          digest_frequency: "immediate" | "daily" | "weekly" | "off";
          channels: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          user_id: string;
          email_enabled?: boolean;
          in_app_enabled?: boolean;
          digest_frequency?: "immediate" | "daily" | "weekly" | "off";
          channels?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["notification_preferences"]["Insert"]>;
        Relationships: [];
      };
      vendors: {
        Row: { id: string; organization_id: string; name: string; category: string | null; email: string | null; phone: string | null; notes: string | null; status: string };
        Insert: { id?: string; organization_id: string; name: string; category?: string | null; email?: string | null; phone?: string | null; notes?: string | null; status?: string };
        Update: Partial<Database["public"]["Tables"]["vendors"]["Insert"]>;
        Relationships: [];
      };
      board_meetings: {
        Row: TenantRow & {
          title: string;
          meeting_type: string;
          scheduled_at: string;
          location: string | null;
          status: string;
          agenda_summary: string | null;
          minutes_summary: string | null;
        };
        Insert: TenantInsert & {
          title: string;
          meeting_type?: string;
          scheduled_at: string;
          location?: string | null;
          status?: string;
          agenda_summary?: string | null;
          minutes_summary?: string | null;
        };
        Update: TenantUpdate & Partial<Omit<Database["public"]["Tables"]["board_meetings"]["Insert"], keyof TenantInsert>>;
        Relationships: [];
      };
      meeting_agenda_items: {
        Row: { id: string; organization_id: string; meeting_id: string; sort_order: number; title: string; description: string | null; presenter: string | null; duration_minutes: number | null };
        Insert: { id?: string; organization_id: string; meeting_id: string; sort_order?: number; title: string; description?: string | null; presenter?: string | null; duration_minutes?: number | null };
        Update: Partial<Database["public"]["Tables"]["meeting_agenda_items"]["Insert"]>;
        Relationships: [];
      };
      fines: {
        Row: { id: string; organization_id: string; violation_id: string | null; property_id: string; resident_id: string | null; amount_cents: number; description: string; status: "issued" | "paid" | "waived" | "overdue"; due_date: string | null; issued_at: string; paid_at: string | null; created_by: string | null };
        Insert: { id?: string; organization_id: string; violation_id?: string | null; property_id: string; resident_id?: string | null; amount_cents: number; description: string; status?: "issued" | "paid" | "waived" | "overdue"; due_date?: string | null; issued_at?: string; paid_at?: string | null; created_by?: string | null };
        Update: Partial<Database["public"]["Tables"]["fines"]["Insert"]>;
        Relationships: [];
      };
      fine_payments: {
        Row: { id: string; organization_id: string; fine_id: string; amount_cents: number; payment_method: string; reference_number: string | null; recorded_by: string | null; created_at: string };
        Insert: { id?: string; organization_id: string; fine_id: string; amount_cents: number; payment_method: string; reference_number?: string | null; recorded_by?: string | null; created_at?: string };
        Update: Partial<Database["public"]["Tables"]["fine_payments"]["Insert"]>;
        Relationships: [];
      };
      work_orders: {
        Row: {
          id: string;
          organization_id: string;
          property_id: string | null;
          title: string;
          description: string | null;
          category: string;
          priority: string;
          status: "open" | "assigned" | "in_progress" | "completed" | "canceled";
          assigned_to: string | null;
          vendor_id: string | null;
          due_date: string | null;
          completed_at: string | null;
          created_by: string | null;
        };
        Insert: {
          id?: string;
          organization_id: string;
          property_id?: string | null;
          title: string;
          description?: string | null;
          category?: string;
          priority?: string;
          status?: "open" | "assigned" | "in_progress" | "completed" | "canceled";
          assigned_to?: string | null;
          vendor_id?: string | null;
          due_date?: string | null;
          completed_at?: string | null;
          created_by?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["work_orders"]["Insert"]>;
        Relationships: [];
      };
      work_order_comments: {
        Row: { id: string; organization_id: string; work_order_id: string; body: string; created_by: string | null; created_at: string };
        Insert: { id?: string; organization_id: string; work_order_id: string; body: string; created_by?: string | null; created_at?: string };
        Update: Partial<Database["public"]["Tables"]["work_order_comments"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      create_organization: {
        Args: { org_name: string; org_slug: string };
        Returns: string;
      };
    };
    Enums: {
      app_role: AppRole;
    };
    CompositeTypes: Record<string, never>;
  };
};
