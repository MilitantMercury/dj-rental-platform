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
    PostgrestVersion: "14.15"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
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
  public: {
    Tables: {
      audit_logs: {
        Row: { action: string; actor_id: string | null; after_data: Json | null; before_data: Json | null; created_at: string; entity_id: string; entity_type: string; id: string }
        Insert: { action: string; actor_id?: string | null; after_data?: Json | null; before_data?: Json | null; created_at?: string; entity_id: string; entity_type: string; id?: string }
        Update: { action?: string; actor_id?: string | null; after_data?: Json | null; before_data?: Json | null; created_at?: string; entity_id?: string; entity_type?: string; id?: string }
        Relationships: [{ foreignKeyName: "audit_logs_actor_id_fkey"; columns: ["actor_id"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["user_id"] }]
      }
      app_settings: {
        Row: { created_at: string; id: boolean; operational_margin_days: number; option_duration_hours: number; timezone: string; updated_at: string }
        Insert: { created_at?: string; id?: boolean; operational_margin_days?: number; option_duration_hours?: number; timezone?: string; updated_at?: string }
        Update: { created_at?: string; id?: boolean; operational_margin_days?: number; option_duration_hours?: number; timezone?: string; updated_at?: string }
        Relationships: []
      }
      cart_items: {
        Row: {
          cart_id: string
          created_at: string
          id: string
          item_type: string
          product_id: string | null
          quantity: number
          service_id: string | null
        }
        Insert: {
          cart_id: string
          created_at?: string
          id?: string
          item_type: string
          product_id?: string | null
          quantity?: number
          service_id?: string | null
        }
        Update: {
          cart_id?: string
          created_at?: string
          id?: string
          item_type?: string
          product_id?: string | null
          quantity?: number
          service_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_cart_id_fkey"
            columns: ["cart_id"]
            isOneToOne: false
            referencedRelation: "carts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      carts: {
        Row: {
          created_at: string
          customer_user_id: string
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_user_id: string
          id?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_user_id?: string
          id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "carts_customer_user_id_fkey"
            columns: ["customer_user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      categories: {
        Row: {
          active: boolean
          created_at: string
          description: string | null
          id: string
          image_alt: string
          image_path: string | null
          name: string
          parent_id: string | null
          published_at: string | null
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          description?: string | null
          id?: string
          image_alt?: string
          image_path?: string | null
          name: string
          parent_id?: string | null
          published_at?: string | null
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          description?: string | null
          id?: string
          image_alt?: string
          image_path?: string | null
          name?: string
          parent_id?: string | null
          published_at?: string | null
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_profiles: {
        Row: {
          address: string | null
          address_city: string | null
          address_country: string
          address_number: string | null
          address_postal_code: string | null
          address_province: string | null
          address_street: string | null
          company_name: string | null
          created_at: string
          customer_type: string
          pec: string | null
          recipient_code: string | null
          tax_code: string | null
          updated_at: string
          user_id: string
          vat_number: string | null
        }
        Insert: {
          address?: string | null
          address_city?: string | null
          address_country?: string
          address_number?: string | null
          address_postal_code?: string | null
          address_province?: string | null
          address_street?: string | null
          company_name?: string | null
          created_at?: string
          customer_type?: string
          pec?: string | null
          recipient_code?: string | null
          tax_code?: string | null
          updated_at?: string
          user_id: string
          vat_number?: string | null
        }
        Update: {
          address?: string | null
          address_city?: string | null
          address_country?: string
          address_number?: string | null
          address_postal_code?: string | null
          address_province?: string | null
          address_street?: string | null
          company_name?: string | null
          created_at?: string
          customer_type?: string
          pec?: string | null
          recipient_code?: string | null
          tax_code?: string | null
          updated_at?: string
          user_id?: string
          vat_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      event_types: {
        Row: {
          active: boolean
          created_at: string
          description: string
          id: string
          name: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          description?: string
          id?: string
          name: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          description?: string
          id?: string
          name?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      product_images: {
        Row: {
          alt_text: string
          created_at: string
          id: string
          product_id: string
          sort_order: number
          storage_path: string
        }
        Insert: {
          alt_text?: string
          created_at?: string
          id?: string
          product_id: string
          sort_order?: number
          storage_path: string
        }
        Update: {
          alt_text?: string
          created_at?: string
          id?: string
          product_id?: string
          sort_order?: number
          storage_path?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      external_supplies: {
        Row: { created_at: string; id: string; internal_notes: string; product_id: string; quantity: number; request_id: string; status: string; supplier_name: string; updated_at: string }
        Insert: { created_at?: string; id?: string; internal_notes?: string; product_id: string; quantity: number; request_id: string; status?: string; supplier_name: string; updated_at?: string }
        Update: { created_at?: string; id?: string; internal_notes?: string; product_id?: string; quantity?: number; request_id?: string; status?: string; supplier_name?: string; updated_at?: string }
        Relationships: [
          { foreignKeyName: "external_supplies_product_id_fkey"; columns: ["product_id"]; isOneToOne: false; referencedRelation: "products"; referencedColumns: ["id"] },
          { foreignKeyName: "external_supplies_request_id_fkey"; columns: ["request_id"]; isOneToOne: false; referencedRelation: "requests"; referencedColumns: ["id"] },
        ]
      }
      financial_records: {
        Row: { amount_cents: number; created_at: string; id: string; internal_notes: string; payment_method: string; record_type: string; recorded_by: string; recorded_on: string; request_id: string; updated_at: string }
        Insert: { amount_cents: number; created_at?: string; id?: string; internal_notes?: string; payment_method?: string; record_type: string; recorded_by: string; recorded_on?: string; request_id: string; updated_at?: string }
        Update: { amount_cents?: number; created_at?: string; id?: string; internal_notes?: string; payment_method?: string; record_type?: string; recorded_by?: string; recorded_on?: string; request_id?: string; updated_at?: string }
        Relationships: [
          { foreignKeyName: "financial_records_recorded_by_fkey"; columns: ["recorded_by"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["user_id"] },
          { foreignKeyName: "financial_records_request_id_fkey"; columns: ["request_id"]; isOneToOne: false; referencedRelation: "requests"; referencedColumns: ["id"] },
        ]
      }
      preparation_lists: {
        Row: { completed_at: string | null; completed_by: string | null; created_at: string; id: string; request_id: string; started_at: string; started_by: string; status: string; updated_at: string }
        Insert: { completed_at?: string | null; completed_by?: string | null; created_at?: string; id?: string; request_id: string; started_at?: string; started_by: string; status?: string; updated_at?: string }
        Update: { completed_at?: string | null; completed_by?: string | null; created_at?: string; id?: string; request_id?: string; started_at?: string; started_by?: string; status?: string; updated_at?: string }
        Relationships: [
          { foreignKeyName: "preparation_lists_request_id_fkey"; columns: ["request_id"]; isOneToOne: true; referencedRelation: "requests"; referencedColumns: ["id"] },
        ]
      }
      transport_containers: {
        Row: { container_type: string; created_at: string; created_by: string; description: string; id: string; notes: string; quantity: number; request_id: string; updated_at: string; updated_by: string | null }
        Insert: { container_type: string; created_at?: string; created_by: string; description?: string; id?: string; notes?: string; quantity: number; request_id: string; updated_at?: string; updated_by?: string | null }
        Update: { container_type?: string; created_at?: string; created_by?: string; description?: string; id?: string; notes?: string; quantity?: number; request_id?: string; updated_at?: string; updated_by?: string | null }
        Relationships: [
          { foreignKeyName: "transport_containers_request_id_fkey"; columns: ["request_id"]; isOneToOne: false; referencedRelation: "requests"; referencedColumns: ["id"] },
        ]
      }
      preparation_items: {
        Row: { created_at: string; delivered_quantity: number; description: string; expected_quantity: number; id: string; notes: string; preparation_list_id: string; prepared_quantity: number; returned_quantity: number; source_request_item_id: string; status: string; updated_at: string; updated_by: string | null }
        Insert: { created_at?: string; delivered_quantity?: number; description: string; expected_quantity: number; id?: string; notes?: string; preparation_list_id: string; prepared_quantity?: number; returned_quantity?: number; source_request_item_id: string; status?: string; updated_at?: string; updated_by?: string | null }
        Update: { created_at?: string; delivered_quantity?: number; description?: string; expected_quantity?: number; id?: string; notes?: string; preparation_list_id?: string; prepared_quantity?: number; returned_quantity?: number; source_request_item_id?: string; status?: string; updated_at?: string; updated_by?: string | null }
        Relationships: [
          { foreignKeyName: "preparation_items_preparation_list_id_fkey"; columns: ["preparation_list_id"]; isOneToOne: false; referencedRelation: "preparation_lists"; referencedColumns: ["id"] },
          { foreignKeyName: "preparation_items_source_request_item_id_fkey"; columns: ["source_request_item_id"]; isOneToOne: true; referencedRelation: "request_items"; referencedColumns: ["id"] },
        ]
      }
      request_assignments: {
        Row: { assigned_by: string; created_at: string; id: string; operational_role: string; request_id: string; staff_user_id: string; updated_at: string }
        Insert: { assigned_by: string; created_at?: string; id?: string; operational_role?: string; request_id: string; staff_user_id: string; updated_at?: string }
        Update: { assigned_by?: string; created_at?: string; id?: string; operational_role?: string; request_id?: string; staff_user_id?: string; updated_at?: string }
        Relationships: [
          { foreignKeyName: "request_assignments_request_id_fkey"; columns: ["request_id"]; isOneToOne: false; referencedRelation: "requests"; referencedColumns: ["id"] },
        ]
      }
      request_attachments: {
        Row: { author_id: string; category: string; created_at: string; file_name: string; id: string; mime_type: string; request_id: string; size_bytes: number; storage_path: string }
        Insert: { author_id: string; category: string; created_at?: string; file_name: string; id?: string; mime_type: string; request_id: string; size_bytes: number; storage_path: string }
        Update: { author_id?: string; category?: string; created_at?: string; file_name?: string; id?: string; mime_type?: string; request_id?: string; size_bytes?: number; storage_path?: string }
        Relationships: [{ foreignKeyName: "request_attachments_request_id_fkey"; columns: ["request_id"]; isOneToOne: false; referencedRelation: "requests"; referencedColumns: ["id"] }]
      }
      inventory_stock: {
        Row: {
          created_at: string
          product_id: string
          total_quantity: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          product_id: string
          total_quantity?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          product_id?: string
          total_quantity?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_stock_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: true
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_unavailability: {
        Row: { created_at: string; end_date: string | null; id: string; notes: string; product_id: string; quantity: number; reason: string; start_date: string | null; updated_at: string }
        Insert: { created_at?: string; end_date?: string | null; id?: string; notes?: string; product_id: string; quantity: number; reason?: string; start_date?: string | null; updated_at?: string }
        Update: { created_at?: string; end_date?: string | null; id?: string; notes?: string; product_id?: string; quantity?: number; reason?: string; start_date?: string | null; updated_at?: string }
        Relationships: [
          { foreignKeyName: "inventory_unavailability_product_id_fkey"; columns: ["product_id"]; isOneToOne: false; referencedRelation: "products"; referencedColumns: ["id"] },
        ]
      }
      products: {
        Row: {
          active: boolean
          category_id: string | null
          created_at: string
          description: string
          id: string
          included_accessories: string
          name: string
          published_at: string | null
          reference_price_cents: number | null
          slug: string
          sort_order: number
          specifications: Json
          updated_at: string
        }
        Insert: {
          active?: boolean
          category_id?: string | null
          created_at?: string
          description?: string
          id?: string
          included_accessories?: string
          name: string
          published_at?: string | null
          reference_price_cents?: number | null
          slug: string
          sort_order?: number
          specifications?: Json
          updated_at?: string
        }
        Update: {
          active?: boolean
          category_id?: string | null
          created_at?: string
          description?: string
          id?: string
          included_accessories?: string
          name?: string
          published_at?: string | null
          reference_price_cents?: number | null
          slug?: string
          sort_order?: number
          specifications?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          first_name: string
          last_name: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          first_name?: string
          last_name?: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          first_name?: string
          last_name?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      quote_items: {
        Row: {
          description: string
          id: string
          quantity: number
          revision_id: string
          source_request_item_id: string | null
          sort_order: number
          total_cents: number
          unit_price_cents: number
        }
        Insert: {
          description: string
          id?: string
          quantity?: number
          revision_id: string
          source_request_item_id?: string | null
          sort_order?: number
          total_cents?: number
          unit_price_cents?: number
        }
        Update: {
          description?: string
          id?: string
          quantity?: number
          revision_id?: string
          source_request_item_id?: string | null
          sort_order?: number
          total_cents?: number
          unit_price_cents?: number
        }
        Relationships: [
          {
            foreignKeyName: "quote_items_revision_id_fkey"
            columns: ["revision_id"]
            isOneToOne: false
            referencedRelation: "quote_revisions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quote_items_source_request_item_id_fkey"
            columns: ["source_request_item_id"]
            isOneToOne: false
            referencedRelation: "request_items"
            referencedColumns: ["id"]
          },
        ]
      }
      quote_responses: {
        Row: {
          comment: string
          created_at: string
          customer_user_id: string
          id: string
          outcome: string
          revision_id: string
        }
        Insert: {
          comment?: string
          created_at?: string
          customer_user_id: string
          id?: string
          outcome: string
          revision_id: string
        }
        Update: {
          comment?: string
          created_at?: string
          customer_user_id?: string
          id?: string
          outcome?: string
          revision_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quote_responses_customer_user_id_fkey"
            columns: ["customer_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "quote_responses_revision_id_fkey"
            columns: ["revision_id"]
            isOneToOne: false
            referencedRelation: "quote_revisions"
            referencedColumns: ["id"]
          },
        ]
      }
      quote_revisions: {
        Row: {
          conditions: string
          created_at: string
          currency: string
          deposit_cents: number
          discount_cents: number
          id: string
          published_at: string | null
          quote_id: string
          revision_number: number
          status: string
          subtotal_cents: number
          total_cents: number
        }
        Insert: {
          conditions?: string
          created_at?: string
          currency?: string
          deposit_cents?: number
          discount_cents?: number
          id?: string
          published_at?: string | null
          quote_id: string
          revision_number: number
          status?: string
          subtotal_cents?: number
          total_cents?: number
        }
        Update: {
          conditions?: string
          created_at?: string
          currency?: string
          deposit_cents?: number
          discount_cents?: number
          id?: string
          published_at?: string | null
          quote_id?: string
          revision_number?: number
          status?: string
          subtotal_cents?: number
          total_cents?: number
        }
        Relationships: [
          {
            foreignKeyName: "quote_revisions_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      quotes: {
        Row: {
          created_at: string
          current_revision_id: string | null
          id: string
          request_id: string
        }
        Insert: {
          created_at?: string
          current_revision_id?: string | null
          id?: string
          request_id: string
        }
        Update: {
          created_at?: string
          current_revision_id?: string | null
          id?: string
          request_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quotes_current_revision_fk"
            columns: ["current_revision_id"]
            isOneToOne: false
            referencedRelation: "quote_revisions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: true
            referencedRelation: "requests"
            referencedColumns: ["id"]
          },
        ]
      }
      request_internal_notes: {
        Row: {
          author_id: string
          body: string
          created_at: string
          id: string
          request_id: string
        }
        Insert: {
          author_id: string
          body: string
          created_at?: string
          id?: string
          request_id: string
        }
        Update: {
          author_id?: string
          body?: string
          created_at?: string
          id?: string
          request_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "request_internal_notes_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "request_internal_notes_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "requests"
            referencedColumns: ["id"]
          },
        ]
      }
      request_items: {
        Row: {
          catalog_snapshot: Json
          created_at: string
          description: string
          id: string
          item_id: string
          item_type: string
          quantity: number
          request_id: string
        }
        Insert: {
          catalog_snapshot?: Json
          created_at?: string
          description: string
          id?: string
          item_id: string
          item_type: string
          quantity?: number
          request_id: string
        }
        Update: {
          catalog_snapshot?: Json
          created_at?: string
          description?: string
          id?: string
          item_id?: string
          item_type?: string
          quantity?: number
          request_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "request_items_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "requests"
            referencedColumns: ["id"]
          },
        ]
      }
      request_status_history: {
        Row: {
          changed_by: string
          created_at: string
          id: string
          new_status: string
          note: string
          previous_status: string | null
          request_id: string
        }
        Insert: {
          changed_by: string
          created_at?: string
          id?: string
          new_status: string
          note?: string
          previous_status?: string | null
          request_id: string
        }
        Update: {
          changed_by?: string
          created_at?: string
          id?: string
          new_status?: string
          note?: string
          previous_status?: string | null
          request_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "request_status_history_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "request_status_history_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "requests"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string
          created_at: string
          event_key: string
          href: string
          id: string
          kind: string
          read_at: string | null
          recipient_user_id: string
          title: string
          updated_at: string
        }
        Insert: {
          body: string
          created_at?: string
          event_key: string
          href: string
          id?: string
          kind: string
          read_at?: string | null
          recipient_user_id: string
          title: string
          updated_at?: string
        }
        Update: {
          body?: string
          created_at?: string
          event_key?: string
          href?: string
          id?: string
          kind?: string
          read_at?: string | null
          recipient_user_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_recipient_user_id_fkey"
            columns: ["recipient_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      requests: {
        Row: {
          created_at: string
          customer_email: string
          customer_notes: string
          customer_user_id: string
          delivery_responsibility: string
          event_date: string
          event_end_date: string
          event_end_at: string
          event_start_at: string
          event_type: string
          id: string
          logistics_mode: string
          pickup_responsibility: string
          privacy_accepted_at: string
          request_code: string
          status: string
          updated_at: string
          venue_address: string
          venue_city: string | null
          venue_country: string
          venue_number: string | null
          venue_postal_code: string | null
          venue_province: string | null
          venue_street: string | null
          venue_name: string
        }
        Insert: {
          created_at?: string
          customer_email?: string
          customer_notes?: string
          customer_user_id: string
          delivery_responsibility?: string
          event_date: string
          event_end_date: string
          event_end_at: string
          event_start_at: string
          event_type: string
          id?: string
          logistics_mode: string
          pickup_responsibility?: string
          privacy_accepted_at: string
          request_code?: string
          status?: string
          updated_at?: string
          venue_address: string
          venue_city?: string | null
          venue_country?: string
          venue_number?: string | null
          venue_postal_code?: string | null
          venue_province?: string | null
          venue_street?: string | null
          venue_name: string
        }
        Update: {
          created_at?: string
          customer_email?: string
          customer_notes?: string
          customer_user_id?: string
          delivery_responsibility?: string
          event_date?: string
          event_end_date?: string
          event_end_at?: string
          event_start_at?: string
          event_type?: string
          id?: string
          logistics_mode?: string
          pickup_responsibility?: string
          privacy_accepted_at?: string
          request_code?: string
          status?: string
          updated_at?: string
          venue_address?: string
          venue_city?: string | null
          venue_country?: string
          venue_number?: string | null
          venue_postal_code?: string | null
          venue_province?: string | null
          venue_street?: string | null
          venue_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "requests_customer_user_id_fkey"
            columns: ["customer_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      services: {
        Row: {
          active: boolean
          category_id: string | null
          conditions: string
          created_at: string
          description: string
          id: string
          image_alt: string
          image_path: string | null
          name: string
          published_at: string | null
          reference_price_cents: number | null
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          category_id?: string | null
          conditions?: string
          created_at?: string
          description?: string
          id?: string
          image_alt?: string
          image_path?: string | null
          name: string
          published_at?: string | null
          reference_price_cents?: number | null
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          category_id?: string | null
          conditions?: string
          created_at?: string
          description?: string
          id?: string
          image_alt?: string
          image_path?: string | null
          name?: string
          published_at?: string | null
          reference_price_cents?: number | null
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "services_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_profiles: {
        Row: {
          active: boolean
          created_at: string
          display_name: string
          role: Database["public"]["Enums"]["staff_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          display_name: string
          role: Database["public"]["Enums"]["staff_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          active?: boolean
          created_at?: string
          display_name?: string
          role?: Database["public"]["Enums"]["staff_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      submit_quote_request: {
        Args: {
          p_customer_notes: string
          p_delivery_responsibility: string
          p_event_end_at: string
          p_event_start_at: string
          p_event_type: string
          p_pickup_responsibility: string
          p_privacy_accepted: boolean
          p_venue_city: string
          p_venue_country: string
          p_venue_name: string
          p_venue_number: string
          p_venue_postal_code: string
          p_venue_province: string
          p_venue_street: string
        }
        Returns: string
      }
      move_catalog_item: {
        Args: { direction: number; target_id: string; target_type: string }
        Returns: undefined
      }
      reorder_product_images: {
        Args: { ordered_image_ids: string[]; target_product_id: string }
        Returns: undefined
      }
      confirm_request_if_available: {
        Args: {
          p_deposit_internal_notes?: string
          p_deposit_payment_method?: string
          p_deposit_recorded_on?: string | null
          p_note?: string
          p_register_deposit?: boolean
          p_request_id: string
        }
        Returns: Json
      }
      place_request_on_option: {
        Args: { p_note?: string; p_request_id: string }
        Returns: string
      }
      current_staff_role: {
        Args: never
        Returns: Database["public"]["Enums"]["staff_role"]
      }
      expire_due_options: {
        Args: never
        Returns: number
      }
      get_request_financial_summary: {
        Args: { p_request_id: string }
        Returns: {
          cash_collected_cents: number
          deposit_to_return_cents: number
          quote_total_cents: number
          rental_collected_cents: number
          rental_outstanding_cents: number
        }[]
      }
      start_preparation_list: {
        Args: { p_note?: string; p_request_id: string }
        Returns: string
      }
      register_request_delivery: {
        Args: { p_note?: string; p_request_id: string }
        Returns: Json
      }
      register_request_return: {
        Args: { p_note?: string; p_request_id: string }
        Returns: Json
      }
      close_request: {
        Args: { p_note?: string; p_request_id: string }
        Returns: Json
      }
      publish_quote_revision: {
        Args: {
          p_conditions: string
          p_deposit_cents: number
          p_discount_cents: number
          p_revision_id: string
        }
        Returns: undefined
      }
      respond_to_current_quote: {
        Args: { p_comment?: string; p_outcome: string; p_revision_id: string }
        Returns: undefined
      }
    }
    Enums: {
      staff_role: "collaborator" | "owner"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      staff_role: ["collaborator", "owner"],
    },
  },
} as const
