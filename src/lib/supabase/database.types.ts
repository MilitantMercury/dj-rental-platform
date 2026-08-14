export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

type ProfileRow = { user_id: string; first_name: string; last_name: string; phone: string | null; created_at: string; updated_at: string };
type CustomerProfileRow = { user_id: string; company_name: string | null; tax_code: string | null; vat_number: string | null; address: string | null; created_at: string; updated_at: string };
type StaffProfileRow = { user_id: string; role: "collaborator" | "owner"; display_name: string; active: boolean; created_at: string; updated_at: string };

export type Database = {
  public: {
    Tables: {
      profiles: { Row: ProfileRow; Insert: Omit<ProfileRow, "created_at" | "updated_at"> & { created_at?: string; updated_at?: string }; Update: Partial<Omit<ProfileRow, "user_id">>; Relationships: [] };
      customer_profiles: { Row: CustomerProfileRow; Insert: Omit<CustomerProfileRow, "created_at" | "updated_at"> & { created_at?: string; updated_at?: string }; Update: Partial<Omit<CustomerProfileRow, "user_id">>; Relationships: [] };
      staff_profiles: { Row: StaffProfileRow; Insert: Omit<StaffProfileRow, "created_at" | "updated_at"> & { created_at?: string; updated_at?: string }; Update: Partial<Omit<StaffProfileRow, "user_id">>; Relationships: [] };
    };
    Views: Record<string, never>;
    Functions: { current_staff_role: { Args: Record<PropertyKey, never>; Returns: "collaborator" | "owner" | null } };
    Enums: { staff_role: "collaborator" | "owner" };
    CompositeTypes: Record<string, never>;
  };
};
