export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

type ProfileRow = { user_id: string; first_name: string; last_name: string; phone: string | null; created_at: string; updated_at: string };
type CustomerProfileRow = { user_id: string; company_name: string | null; tax_code: string | null; vat_number: string | null; address: string | null; created_at: string; updated_at: string };
type StaffProfileRow = { user_id: string; role: "collaborator" | "owner"; display_name: string; active: boolean; created_at: string; updated_at: string };
type CategoryRow = { id: string; parent_id: string | null; name: string; slug: string; description: string | null; image_path: string | null; sort_order: number; active: boolean; created_at: string; updated_at: string };
type ProductRow = { id: string; category_id: string | null; name: string; slug: string; description: string; specifications: Json; included_accessories: string; reference_price_cents: number | null; active: boolean; created_at: string; updated_at: string };
type ServiceRow = { id: string; category_id: string | null; name: string; slug: string; description: string; reference_price_cents: number | null; conditions: string; active: boolean; created_at: string; updated_at: string };
type ProductImageRow = { id: string; product_id: string; storage_path: string; alt_text: string; sort_order: number; created_at: string };
type RequestRow = { id: string; request_code: string; customer_user_id: string; status: "received" | "in_review" | "rejected" | "cancelled"; event_type: string; event_date: string; event_end_date: string; venue_name: string; venue_address: string; logistics_mode: "pickup" | "delivery"; customer_notes: string; privacy_accepted_at: string; created_at: string; updated_at: string };
type TableShape<Row> = { Row: Row; Insert: Omit<Row, "id" | "created_at" | "updated_at"> & { id?: string; created_at?: string; updated_at?: string }; Update: Partial<Omit<Row, "id">>; Relationships: [] };

export type Database = {
  public: {
    Tables: {
      profiles: { Row: ProfileRow; Insert: Omit<ProfileRow, "created_at" | "updated_at"> & { created_at?: string; updated_at?: string }; Update: Partial<Omit<ProfileRow, "user_id">>; Relationships: [] };
      customer_profiles: { Row: CustomerProfileRow; Insert: Omit<CustomerProfileRow, "created_at" | "updated_at"> & { created_at?: string; updated_at?: string }; Update: Partial<Omit<CustomerProfileRow, "user_id">>; Relationships: [] };
      staff_profiles: { Row: StaffProfileRow; Insert: Omit<StaffProfileRow, "created_at" | "updated_at"> & { created_at?: string; updated_at?: string }; Update: Partial<Omit<StaffProfileRow, "user_id">>; Relationships: [] };
      categories: TableShape<CategoryRow>;
      products: TableShape<ProductRow>;
      services: TableShape<ServiceRow>;
      product_images: TableShape<ProductImageRow>;
      requests: TableShape<RequestRow>;
    };
    Views: Record<string, never>;
    Functions: { current_staff_role: { Args: Record<PropertyKey, never>; Returns: "collaborator" | "owner" | null } };
    Enums: { staff_role: "collaborator" | "owner" };
    CompositeTypes: Record<string, never>;
  };
};
