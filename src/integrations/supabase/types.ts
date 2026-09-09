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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      admin_actions: {
        Row: {
          action: string
          admin_user_id: string
          created_at: string
          id: string
          note: string | null
          target_id: string | null
          target_type: string
        }
        Insert: {
          action: string
          admin_user_id: string
          created_at?: string
          id?: string
          note?: string | null
          target_id?: string | null
          target_type: string
        }
        Update: {
          action?: string
          admin_user_id?: string
          created_at?: string
          id?: string
          note?: string | null
          target_id?: string | null
          target_type?: string
        }
        Relationships: []
      }
      blocked_users: {
        Row: {
          blocked_user_id: string
          blocker_user_id: string
          created_at: string
        }
        Insert: {
          blocked_user_id: string
          blocker_user_id: string
          created_at?: string
        }
        Update: {
          blocked_user_id?: string
          blocker_user_id?: string
          created_at?: string
        }
        Relationships: []
      }
      booking_status_history: {
        Row: {
          booking_id: string
          changed_by: string | null
          created_at: string
          from_status: string | null
          id: string
          note: string | null
          to_status: string
        }
        Insert: {
          booking_id: string
          changed_by?: string | null
          created_at?: string
          from_status?: string | null
          id?: string
          note?: string | null
          to_status: string
        }
        Update: {
          booking_id?: string
          changed_by?: string | null
          created_at?: string
          from_status?: string | null
          id?: string
          note?: string | null
          to_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "booking_status_history_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          buyer_user_id: string | null
          cancel_reason: string | null
          created_at: string
          decline_reason: string | null
          duration_min: number
          id: string
          listing_id: string
          order_id: string
          scheduled_at: string
          seller_user_id: string | null
          slot_end: string | null
          slot_start: string | null
          status: string
          updated_at: string
        }
        Insert: {
          buyer_user_id?: string | null
          cancel_reason?: string | null
          created_at?: string
          decline_reason?: string | null
          duration_min: number
          id?: string
          listing_id: string
          order_id: string
          scheduled_at: string
          seller_user_id?: string | null
          slot_end?: string | null
          slot_start?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          buyer_user_id?: string | null
          cancel_reason?: string | null
          created_at?: string
          decline_reason?: string | null
          duration_min?: number
          id?: string
          listing_id?: string
          order_id?: string
          scheduled_at?: string
          seller_user_id?: string | null
          slot_end?: string | null
          slot_start?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      boosts: {
        Row: {
          amount_cents: number
          created_at: string
          expires_at: string
          id: string
          kind: string
          listing_id: string
        }
        Insert: {
          amount_cents?: number
          created_at?: string
          expires_at: string
          id?: string
          kind: string
          listing_id: string
        }
        Update: {
          amount_cents?: number
          created_at?: string
          expires_at?: string
          id?: string
          kind?: string
          listing_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "boosts_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      businesses: {
        Row: {
          availability: string | null
          avatar_url: string | null
          bio: string | null
          campus_name: string | null
          cancellation_policy: string | null
          category: string | null
          contact_method: string
          created_at: string
          description: string | null
          fulfillment: string[]
          id: string
          is_active: boolean
          name: string
          onboarding_step: number
          owner_user_id: string
          rules_accepted_at: string | null
          school_id: string | null
          slug: string
          updated_at: string
        }
        Insert: {
          availability?: string | null
          avatar_url?: string | null
          bio?: string | null
          campus_name?: string | null
          cancellation_policy?: string | null
          category?: string | null
          contact_method?: string
          created_at?: string
          description?: string | null
          fulfillment?: string[]
          id?: string
          is_active?: boolean
          name: string
          onboarding_step?: number
          owner_user_id: string
          rules_accepted_at?: string | null
          school_id?: string | null
          slug: string
          updated_at?: string
        }
        Update: {
          availability?: string | null
          avatar_url?: string | null
          bio?: string | null
          campus_name?: string | null
          cancellation_policy?: string | null
          category?: string | null
          contact_method?: string
          created_at?: string
          description?: string | null
          fulfillment?: string[]
          id?: string
          is_active?: boolean
          name?: string
          onboarding_step?: number
          owner_user_id?: string
          rules_accepted_at?: string | null
          school_id?: string | null
          slug?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "businesses_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      campus_events: {
        Row: {
          boost_tier: number
          cancel_reason: string | null
          category: string
          contact_info: string | null
          cover_url: string | null
          created_at: string
          creator_user_id: string
          description: string | null
          ends_at: string | null
          hiring_enabled: boolean
          host_name: string | null
          id: string
          is_featured: boolean
          lat: number | null
          lng: number | null
          location: string
          org_id: string | null
          rsvp_count: number
          school_id: string | null
          starts_at: string
          status: string
          ticket_price_cents: number | null
          ticketing_enabled: boolean
          title: string
          updated_at: string
          vendor_booths_enabled: boolean
          volunteer_recruiting: boolean
        }
        Insert: {
          boost_tier?: number
          cancel_reason?: string | null
          category?: string
          contact_info?: string | null
          cover_url?: string | null
          created_at?: string
          creator_user_id: string
          description?: string | null
          ends_at?: string | null
          hiring_enabled?: boolean
          host_name?: string | null
          id?: string
          is_featured?: boolean
          lat?: number | null
          lng?: number | null
          location?: string
          org_id?: string | null
          rsvp_count?: number
          school_id?: string | null
          starts_at: string
          status?: string
          ticket_price_cents?: number | null
          ticketing_enabled?: boolean
          title: string
          updated_at?: string
          vendor_booths_enabled?: boolean
          volunteer_recruiting?: boolean
        }
        Update: {
          boost_tier?: number
          cancel_reason?: string | null
          category?: string
          contact_info?: string | null
          cover_url?: string | null
          created_at?: string
          creator_user_id?: string
          description?: string | null
          ends_at?: string | null
          hiring_enabled?: boolean
          host_name?: string | null
          id?: string
          is_featured?: boolean
          lat?: number | null
          lng?: number | null
          location?: string
          org_id?: string | null
          rsvp_count?: number
          school_id?: string | null
          starts_at?: string
          status?: string
          ticket_price_cents?: number | null
          ticketing_enabled?: boolean
          title?: string
          updated_at?: string
          vendor_booths_enabled?: boolean
          volunteer_recruiting?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "campus_events_org_fk"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "student_orgs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campus_events_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      campus_floors: {
        Row: {
          accessibility: string | null
          created_at: string
          floor_number: number
          id: string
          label: string | null
          place_id: string
          plan_url: string | null
          rooms: Json
          services: string[]
          updated_at: string
          verification_status: string
        }
        Insert: {
          accessibility?: string | null
          created_at?: string
          floor_number: number
          id?: string
          label?: string | null
          place_id: string
          plan_url?: string | null
          rooms?: Json
          services?: string[]
          updated_at?: string
          verification_status?: string
        }
        Update: {
          accessibility?: string | null
          created_at?: string
          floor_number?: number
          id?: string
          label?: string | null
          place_id?: string
          plan_url?: string | null
          rooms?: Json
          services?: string[]
          updated_at?: string
          verification_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "campus_floors_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "campus_places"
            referencedColumns: ["id"]
          },
        ]
      }
      campus_live_pins: {
        Row: {
          accepting_orders: boolean
          appointment_required: boolean
          business_id: string | null
          campus_id: string | null
          category: string | null
          created_at: string
          event_id: string | null
          expires_at: string
          id: string
          kind: string
          lat: number | null
          listing_id: string | null
          lng: number | null
          moderation_status: string
          note: string | null
          owner_user_id: string
          place_id: string | null
          price_range: string | null
          response_time_min: number | null
          safe_location_label: string
          school_id: string | null
          starts_at: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          accepting_orders?: boolean
          appointment_required?: boolean
          business_id?: string | null
          campus_id?: string | null
          category?: string | null
          created_at?: string
          event_id?: string | null
          expires_at: string
          id?: string
          kind?: string
          lat?: number | null
          listing_id?: string | null
          lng?: number | null
          moderation_status?: string
          note?: string | null
          owner_user_id: string
          place_id?: string | null
          price_range?: string | null
          response_time_min?: number | null
          safe_location_label: string
          school_id?: string | null
          starts_at?: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          accepting_orders?: boolean
          appointment_required?: boolean
          business_id?: string | null
          campus_id?: string | null
          category?: string | null
          created_at?: string
          event_id?: string | null
          expires_at?: string
          id?: string
          kind?: string
          lat?: number | null
          listing_id?: string | null
          lng?: number | null
          moderation_status?: string
          note?: string | null
          owner_user_id?: string
          place_id?: string | null
          price_range?: string | null
          response_time_min?: number | null
          safe_location_label?: string
          school_id?: string | null
          starts_at?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "campus_live_pins_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campus_live_pins_campus_id_fkey"
            columns: ["campus_id"]
            isOneToOne: false
            referencedRelation: "campuses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campus_live_pins_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "campus_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campus_live_pins_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campus_live_pins_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "campus_places"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campus_live_pins_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      campus_places: {
        Row: {
          accessibility: string | null
          address: string | null
          approved_by: string | null
          boundary: Json | null
          campus_id: string
          category: string
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          description: string | null
          entrances: Json
          hours: Json | null
          id: string
          is_published: boolean
          last_verified_at: string | null
          lat: number | null
          lng: number | null
          media: Json
          name: string
          nicknames: string[]
          services: string[]
          subcategory: string | null
          submitted_by: string | null
          updated_at: string
          verification_source: string | null
          verification_status: string
          video_url: string | null
          website: string | null
        }
        Insert: {
          accessibility?: string | null
          address?: string | null
          approved_by?: string | null
          boundary?: Json | null
          campus_id: string
          category?: string
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          description?: string | null
          entrances?: Json
          hours?: Json | null
          id?: string
          is_published?: boolean
          last_verified_at?: string | null
          lat?: number | null
          lng?: number | null
          media?: Json
          name: string
          nicknames?: string[]
          services?: string[]
          subcategory?: string | null
          submitted_by?: string | null
          updated_at?: string
          verification_source?: string | null
          verification_status?: string
          video_url?: string | null
          website?: string | null
        }
        Update: {
          accessibility?: string | null
          address?: string | null
          approved_by?: string | null
          boundary?: Json | null
          campus_id?: string
          category?: string
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          description?: string | null
          entrances?: Json
          hours?: Json | null
          id?: string
          is_published?: boolean
          last_verified_at?: string | null
          lat?: number | null
          lng?: number | null
          media?: Json
          name?: string
          nicknames?: string[]
          services?: string[]
          subcategory?: string | null
          submitted_by?: string | null
          updated_at?: string
          verification_source?: string | null
          verification_status?: string
          video_url?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campus_places_campus_id_fkey"
            columns: ["campus_id"]
            isOneToOne: false
            referencedRelation: "campuses"
            referencedColumns: ["id"]
          },
        ]
      }
      campus_routes: {
        Row: {
          campus_id: string
          created_at: string
          distance_m: number | null
          duration_min: number | null
          from_place_id: string | null
          id: string
          is_accessible: boolean
          path: Json
          route_type: string
          to_place_id: string | null
          updated_at: string
          verification_status: string
        }
        Insert: {
          campus_id: string
          created_at?: string
          distance_m?: number | null
          duration_min?: number | null
          from_place_id?: string | null
          id?: string
          is_accessible?: boolean
          path?: Json
          route_type?: string
          to_place_id?: string | null
          updated_at?: string
          verification_status?: string
        }
        Update: {
          campus_id?: string
          created_at?: string
          distance_m?: number | null
          duration_min?: number | null
          from_place_id?: string | null
          id?: string
          is_accessible?: boolean
          path?: Json
          route_type?: string
          to_place_id?: string | null
          updated_at?: string
          verification_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "campus_routes_campus_id_fkey"
            columns: ["campus_id"]
            isOneToOne: false
            referencedRelation: "campuses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campus_routes_from_place_id_fkey"
            columns: ["from_place_id"]
            isOneToOne: false
            referencedRelation: "campus_places"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campus_routes_to_place_id_fkey"
            columns: ["to_place_id"]
            isOneToOne: false
            referencedRelation: "campus_places"
            referencedColumns: ["id"]
          },
        ]
      }
      campus_tour_stops: {
        Row: {
          created_at: string
          id: string
          note: string | null
          place_id: string
          sort: number
          tour_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          note?: string | null
          place_id: string
          sort?: number
          tour_id: string
        }
        Update: {
          created_at?: string
          id?: string
          note?: string | null
          place_id?: string
          sort?: number
          tour_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "campus_tour_stops_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "campus_places"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campus_tour_stops_tour_id_fkey"
            columns: ["tour_id"]
            isOneToOne: false
            referencedRelation: "campus_tours"
            referencedColumns: ["id"]
          },
        ]
      }
      campus_tours: {
        Row: {
          audience: string
          campus_id: string
          cover_url: string | null
          created_at: string
          description: string | null
          duration_min: number | null
          id: string
          is_published: boolean
          sort: number
          title: string
          updated_at: string
        }
        Insert: {
          audience?: string
          campus_id: string
          cover_url?: string | null
          created_at?: string
          description?: string | null
          duration_min?: number | null
          id?: string
          is_published?: boolean
          sort?: number
          title: string
          updated_at?: string
        }
        Update: {
          audience?: string
          campus_id?: string
          cover_url?: string | null
          created_at?: string
          description?: string | null
          duration_min?: number | null
          id?: string
          is_published?: boolean
          sort?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "campus_tours_campus_id_fkey"
            columns: ["campus_id"]
            isOneToOne: false
            referencedRelation: "campuses"
            referencedColumns: ["id"]
          },
        ]
      }
      campus_zones: {
        Row: {
          created_at: string
          id: string
          kind: string
          name: string
          school_id: string | null
          sort: number
          x: number
          y: number
        }
        Insert: {
          created_at?: string
          id?: string
          kind?: string
          name: string
          school_id?: string | null
          sort?: number
          x?: number
          y?: number
        }
        Update: {
          created_at?: string
          id?: string
          kind?: string
          name?: string
          school_id?: string | null
          sort?: number
          x?: number
          y?: number
        }
        Relationships: [
          {
            foreignKeyName: "campus_zones_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      campuses: {
        Row: {
          boundary: Json | null
          center_lat: number | null
          center_lng: number | null
          city: string | null
          created_at: string
          id: string
          is_hbcu: boolean
          is_published: boolean
          map_style: string
          name: string
          school_id: string | null
          state: string | null
          type: string
          updated_at: string
          verification_status: string
        }
        Insert: {
          boundary?: Json | null
          center_lat?: number | null
          center_lng?: number | null
          city?: string | null
          created_at?: string
          id?: string
          is_hbcu?: boolean
          is_published?: boolean
          map_style?: string
          name: string
          school_id?: string | null
          state?: string | null
          type?: string
          updated_at?: string
          verification_status?: string
        }
        Update: {
          boundary?: Json | null
          center_lat?: number | null
          center_lng?: number | null
          city?: string | null
          created_at?: string
          id?: string
          is_hbcu?: boolean
          is_published?: boolean
          map_style?: string
          name?: string
          school_id?: string | null
          state?: string | null
          type?: string
          updated_at?: string
          verification_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "campuses_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_members: {
        Row: {
          conversation_id: string
          created_at: string
          last_read_at: string
          user_id: string
        }
        Insert: {
          conversation_id: string
          created_at?: string
          last_read_at?: string
          user_id: string
        }
        Update: {
          conversation_id?: string
          created_at?: string
          last_read_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_members_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string
          created_by: string
          id: string
          listing_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          listing_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          listing_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      disputes: {
        Row: {
          created_at: string
          id: string
          opened_by: string
          order_id: string
          reason: string
          resolution_note: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          opened_by: string
          order_id: string
          reason: string
          resolution_note?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          opened_by?: string
          order_id?: string
          reason?: string
          resolution_note?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "disputes_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      drop_claims: {
        Row: {
          created_at: string
          drop_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          drop_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          drop_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "drop_claims_drop_id_fkey"
            columns: ["drop_id"]
            isOneToOne: false
            referencedRelation: "drops"
            referencedColumns: ["id"]
          },
        ]
      }
      drops: {
        Row: {
          body: string
          business_id: string | null
          category: string | null
          created_at: string
          cta: string
          discount_cents: number | null
          discount_percent: number | null
          event_id: string | null
          expires_at: string
          id: string
          image_url: string | null
          is_flash: boolean
          listing_id: string | null
          price_cents: number | null
          quantity_claimed: number
          quantity_limit: number | null
          school_id: string | null
          seller_user_id: string
          zone_name: string | null
        }
        Insert: {
          body: string
          business_id?: string | null
          category?: string | null
          created_at?: string
          cta?: string
          discount_cents?: number | null
          discount_percent?: number | null
          event_id?: string | null
          expires_at?: string
          id?: string
          image_url?: string | null
          is_flash?: boolean
          listing_id?: string | null
          price_cents?: number | null
          quantity_claimed?: number
          quantity_limit?: number | null
          school_id?: string | null
          seller_user_id: string
          zone_name?: string | null
        }
        Update: {
          body?: string
          business_id?: string | null
          category?: string | null
          created_at?: string
          cta?: string
          discount_cents?: number | null
          discount_percent?: number | null
          event_id?: string | null
          expires_at?: string
          id?: string
          image_url?: string | null
          is_flash?: boolean
          listing_id?: string | null
          price_cents?: number | null
          quantity_claimed?: number
          quantity_limit?: number | null
          school_id?: string | null
          seller_user_id?: string
          zone_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "drops_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "drops_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "campus_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "drops_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "drops_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      event_comments: {
        Row: {
          body: string
          created_at: string
          event_id: string
          id: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          event_id: string
          id?: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          event_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_comments_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "campus_events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_recaps: {
        Row: {
          created_at: string
          event_id: string
          id: string
          url: string
          user_id: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          url: string
          user_id: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          url?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_recaps_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "campus_events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_rsvps: {
        Row: {
          created_at: string
          event_id: string
          user_id: string
          visible_to_friends: boolean
        }
        Insert: {
          created_at?: string
          event_id: string
          user_id: string
          visible_to_friends?: boolean
        }
        Update: {
          created_at?: string
          event_id?: string
          user_id?: string
          visible_to_friends?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "event_rsvps_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "campus_events"
            referencedColumns: ["id"]
          },
        ]
      }
      favorites: {
        Row: {
          created_at: string
          listing_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          listing_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          listing_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      home_layout_prefs: {
        Row: {
          hidden_sections: string[]
          section_order: string[]
          updated_at: string
          user_id: string
        }
        Insert: {
          hidden_sections?: string[]
          section_order?: string[]
          updated_at?: string
          user_id: string
        }
        Update: {
          hidden_sections?: string[]
          section_order?: string[]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      listing_images: {
        Row: {
          created_at: string
          id: string
          listing_id: string
          position: number
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          listing_id: string
          position?: number
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          listing_id?: string
          position?: number
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "listing_images_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      listings: {
        Row: {
          availability: string | null
          business_id: string | null
          campus_name: string | null
          cancellation_policy: string | null
          category: string
          created_at: string
          description: string | null
          favorite_count: number
          fulfillment: string[]
          fulfillment_time: string | null
          id: string
          kind: string
          moderation_status: string
          price_cents: number
          price_type: string
          quantity: number | null
          school_id: string | null
          seller_user_id: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          availability?: string | null
          business_id?: string | null
          campus_name?: string | null
          cancellation_policy?: string | null
          category: string
          created_at?: string
          description?: string | null
          favorite_count?: number
          fulfillment?: string[]
          fulfillment_time?: string | null
          id?: string
          kind: string
          moderation_status?: string
          price_cents?: number
          price_type?: string
          quantity?: number | null
          school_id?: string | null
          seller_user_id: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          availability?: string | null
          business_id?: string | null
          campus_name?: string | null
          cancellation_policy?: string | null
          category?: string
          created_at?: string
          description?: string | null
          favorite_count?: number
          fulfillment?: string[]
          fulfillment_time?: string | null
          id?: string
          kind?: string
          moderation_status?: string
          price_cents?: number
          price_type?: string
          quantity?: number | null
          school_id?: string | null
          seller_user_id?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "listings_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listings_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      local_businesses: {
        Row: {
          address: string
          campus_name: string | null
          contact_email: string
          contact_phone: string
          created_at: string
          description: string | null
          id: string
          name: string
          owner_user_id: string
          rep_name: string
          school_id: string | null
          services_needed: string[]
          updated_at: string
          verification_note: string | null
          verification_status: string
          verified_at: string | null
          verified_by: string | null
          website: string | null
        }
        Insert: {
          address: string
          campus_name?: string | null
          contact_email: string
          contact_phone: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
          owner_user_id: string
          rep_name: string
          school_id?: string | null
          services_needed?: string[]
          updated_at?: string
          verification_note?: string | null
          verification_status?: string
          verified_at?: string | null
          verified_by?: string | null
          website?: string | null
        }
        Update: {
          address?: string
          campus_name?: string | null
          contact_email?: string
          contact_phone?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          owner_user_id?: string
          rep_name?: string
          school_id?: string | null
          services_needed?: string[]
          updated_at?: string
          verification_note?: string | null
          verification_status?: string
          verified_at?: string | null
          verified_by?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "local_businesses_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      location_settings: {
        Row: {
          live_business_availability: boolean
          mode: string
          temporary_share_until: string | null
          temporary_share_with: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          live_business_availability?: boolean
          mode?: string
          temporary_share_until?: string | null
          temporary_share_with?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          live_business_availability?: boolean
          mode?: string
          temporary_share_until?: string | null
          temporary_share_with?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          body: string
          conversation_id: string
          created_at: string
          id: string
          sender_user_id: string
        }
        Insert: {
          body: string
          conversation_id: string
          created_at?: string
          id?: string
          sender_user_id: string
        }
        Update: {
          body?: string
          conversation_id?: string
          created_at?: string
          id?: string
          sender_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      moderation_queue: {
        Row: {
          author_user_id: string | null
          category: string
          content_id: string | null
          content_text: string
          content_type: string
          created_at: string
          decision: string
          id: string
          reviewed_at: string | null
          reviewer_note: string | null
          reviewer_user_id: string | null
          status: string
        }
        Insert: {
          author_user_id?: string | null
          category: string
          content_id?: string | null
          content_text: string
          content_type: string
          created_at?: string
          decision?: string
          id?: string
          reviewed_at?: string | null
          reviewer_note?: string | null
          reviewer_user_id?: string | null
          status?: string
        }
        Update: {
          author_user_id?: string | null
          category?: string
          content_id?: string | null
          content_text?: string
          content_type?: string
          created_at?: string
          decision?: string
          id?: string
          reviewed_at?: string | null
          reviewer_note?: string | null
          reviewer_user_id?: string | null
          status?: string
        }
        Relationships: []
      }
      notification_preferences: {
        Row: {
          bookings: boolean
          events: boolean
          favorite_sellers: boolean
          flash_drops: boolean
          marketing: boolean
          max_promos_per_day: number
          messages: boolean
          nearby_availability: boolean
          orders: boolean
          rankings: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          bookings?: boolean
          events?: boolean
          favorite_sellers?: boolean
          flash_drops?: boolean
          marketing?: boolean
          max_promos_per_day?: number
          messages?: boolean
          nearby_availability?: boolean
          orders?: boolean
          rankings?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          bookings?: boolean
          events?: boolean
          favorite_sellers?: boolean
          flash_drops?: boolean
          marketing?: boolean
          max_promos_per_day?: number
          messages?: boolean
          nearby_availability?: boolean
          orders?: boolean
          rankings?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          kind: string
          payload: Json
          read_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          kind: string
          payload?: Json
          read_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          kind?: string
          payload?: Json
          read_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      opportunities: {
        Row: {
          applicant_count: number
          business_id: string
          category: string
          compensation: string
          created_at: string
          deadline: string | null
          description: string
          id: string
          is_remote: boolean
          location: string
          moderation_status: string
          owner_user_id: string
          pay_max_cents: number | null
          pay_min_cents: number | null
          required_skills: string[]
          school_id: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          applicant_count?: number
          business_id: string
          category: string
          compensation: string
          created_at?: string
          deadline?: string | null
          description: string
          id?: string
          is_remote?: boolean
          location: string
          moderation_status?: string
          owner_user_id: string
          pay_max_cents?: number | null
          pay_min_cents?: number | null
          required_skills?: string[]
          school_id?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          applicant_count?: number
          business_id?: string
          category?: string
          compensation?: string
          created_at?: string
          deadline?: string | null
          description?: string
          id?: string
          is_remote?: boolean
          location?: string
          moderation_status?: string
          owner_user_id?: string
          pay_max_cents?: number | null
          pay_min_cents?: number | null
          required_skills?: string[]
          school_id?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "opportunities_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "local_businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunities_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      opportunity_applications: {
        Row: {
          business_user_id: string
          created_at: string
          id: string
          message: string | null
          opportunity_id: string
          status: string
          student_user_id: string
          updated_at: string
        }
        Insert: {
          business_user_id: string
          created_at?: string
          id?: string
          message?: string | null
          opportunity_id: string
          status?: string
          student_user_id: string
          updated_at?: string
        }
        Update: {
          business_user_id?: string
          created_at?: string
          id?: string
          message?: string | null
          opportunity_id?: string
          status?: string
          student_user_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "opportunity_applications_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
        ]
      }
      opportunity_saves: {
        Row: {
          created_at: string
          opportunity_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          opportunity_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          opportunity_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "opportunity_saves_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          listing_id: string | null
          order_id: string
          qty: number
          unit_price_cents: number
        }
        Insert: {
          created_at?: string
          id?: string
          listing_id?: string | null
          order_id: string
          qty?: number
          unit_price_cents: number
        }
        Update: {
          created_at?: string
          id?: string
          listing_id?: string | null
          order_id?: string
          qty?: number
          unit_price_cents?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_status_history: {
        Row: {
          changed_by: string | null
          created_at: string
          from_status: string | null
          id: string
          note: string | null
          order_id: string
          to_status: string
        }
        Insert: {
          changed_by?: string | null
          created_at?: string
          from_status?: string | null
          id?: string
          note?: string | null
          order_id: string
          to_status: string
        }
        Update: {
          changed_by?: string | null
          created_at?: string
          from_status?: string | null
          id?: string
          note?: string | null
          order_id?: string
          to_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_status_history_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          buyer_user_id: string
          cancel_reason: string | null
          cancelled_at: string | null
          cancelled_by: string | null
          client_idempotency_key: string | null
          created_at: string
          fulfillment_method: string | null
          id: string
          kind: string
          listing_id: string | null
          meetup_location: string | null
          note: string | null
          paid_at: string | null
          payment_status: string
          platform_fee_cents: number
          processing_fee_cents: number
          refunded_at: string | null
          seller_user_id: string
          status: string
          stripe_charge_id: string | null
          stripe_checkout_session_id: string | null
          stripe_payment_intent_id: string | null
          stripe_refund_id: string | null
          subtotal_cents: number
          total_cents: number
          updated_at: string
        }
        Insert: {
          buyer_user_id: string
          cancel_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          client_idempotency_key?: string | null
          created_at?: string
          fulfillment_method?: string | null
          id?: string
          kind?: string
          listing_id?: string | null
          meetup_location?: string | null
          note?: string | null
          paid_at?: string | null
          payment_status?: string
          platform_fee_cents?: number
          processing_fee_cents?: number
          refunded_at?: string | null
          seller_user_id: string
          status?: string
          stripe_charge_id?: string | null
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
          stripe_refund_id?: string | null
          subtotal_cents?: number
          total_cents?: number
          updated_at?: string
        }
        Update: {
          buyer_user_id?: string
          cancel_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          client_idempotency_key?: string | null
          created_at?: string
          fulfillment_method?: string | null
          id?: string
          kind?: string
          listing_id?: string | null
          meetup_location?: string | null
          note?: string | null
          paid_at?: string | null
          payment_status?: string
          platform_fee_cents?: number
          processing_fee_cents?: number
          refunded_at?: string | null
          seller_user_id?: string
          status?: string
          stripe_charge_id?: string | null
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
          stripe_refund_id?: string | null
          subtotal_cents?: number
          total_cents?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      org_announcements: {
        Row: {
          author_user_id: string
          body: string
          created_at: string
          id: string
          org_id: string
        }
        Insert: {
          author_user_id: string
          body: string
          created_at?: string
          id?: string
          org_id: string
        }
        Update: {
          author_user_id?: string
          body?: string
          created_at?: string
          id?: string
          org_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "org_announcements_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "student_orgs"
            referencedColumns: ["id"]
          },
        ]
      }
      org_follows: {
        Row: {
          created_at: string
          org_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          org_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          org_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "org_follows_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "student_orgs"
            referencedColumns: ["id"]
          },
        ]
      }
      payout_accounts: {
        Row: {
          charges_enabled: boolean
          created_at: string
          details_submitted: boolean
          external_id: string | null
          id: string
          last_synced_at: string | null
          onboarding_url: string | null
          payouts_enabled: boolean
          provider: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          charges_enabled?: boolean
          created_at?: string
          details_submitted?: boolean
          external_id?: string | null
          id?: string
          last_synced_at?: string | null
          onboarding_url?: string | null
          payouts_enabled?: boolean
          provider: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          charges_enabled?: boolean
          created_at?: string
          details_submitted?: boolean
          external_id?: string | null
          id?: string
          last_synced_at?: string | null
          onboarding_url?: string | null
          payouts_enabled?: boolean
          provider?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      policy_acceptances: {
        Row: {
          accepted_at: string
          id: string
          policy_version: string
          terms_url: string | null
          user_id: string
        }
        Insert: {
          accepted_at?: string
          id?: string
          policy_version: string
          terms_url?: string | null
          user_id: string
        }
        Update: {
          accepted_at?: string
          id?: string
          policy_version?: string
          terms_url?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          account_type: string
          avatar_url: string | null
          bio: string | null
          completed_transactions: number
          created_at: string
          display_name: string | null
          email: string
          full_name: string | null
          graduation_year: number | null
          id: string
          is_hbcu_student: boolean
          is_suspended: boolean
          major: string | null
          onboarding_completed_at: string | null
          open_to_work: boolean
          open_to_work_note: string | null
          rating_avg: number
          rating_count: number
          school_domain: string | null
          school_id: string | null
          school_name: string | null
          status: string
          suspended_at: string | null
          suspended_reason: string | null
          terms_accepted_at: string | null
          updated_at: string
          username: string | null
          verification_status: string
          year: string | null
        }
        Insert: {
          account_type?: string
          avatar_url?: string | null
          bio?: string | null
          completed_transactions?: number
          created_at?: string
          display_name?: string | null
          email: string
          full_name?: string | null
          graduation_year?: number | null
          id: string
          is_hbcu_student?: boolean
          is_suspended?: boolean
          major?: string | null
          onboarding_completed_at?: string | null
          open_to_work?: boolean
          open_to_work_note?: string | null
          rating_avg?: number
          rating_count?: number
          school_domain?: string | null
          school_id?: string | null
          school_name?: string | null
          status?: string
          suspended_at?: string | null
          suspended_reason?: string | null
          terms_accepted_at?: string | null
          updated_at?: string
          username?: string | null
          verification_status?: string
          year?: string | null
        }
        Update: {
          account_type?: string
          avatar_url?: string | null
          bio?: string | null
          completed_transactions?: number
          created_at?: string
          display_name?: string | null
          email?: string
          full_name?: string | null
          graduation_year?: number | null
          id?: string
          is_hbcu_student?: boolean
          is_suspended?: boolean
          major?: string | null
          onboarding_completed_at?: string | null
          open_to_work?: boolean
          open_to_work_note?: string | null
          rating_avg?: number
          rating_count?: number
          school_domain?: string | null
          school_id?: string | null
          school_name?: string | null
          status?: string
          suspended_at?: string | null
          suspended_reason?: string | null
          terms_accepted_at?: string | null
          updated_at?: string
          username?: string | null
          verification_status?: string
          year?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      promo_code_redemptions: {
        Row: {
          code_id: string
          created_at: string
          discount_cents: number
          final_cents: number
          id: string
          original_cents: number
          plan_key: string
          stripe_session_id: string | null
          user_id: string
        }
        Insert: {
          code_id: string
          created_at?: string
          discount_cents: number
          final_cents: number
          id?: string
          original_cents: number
          plan_key: string
          stripe_session_id?: string | null
          user_id: string
        }
        Update: {
          code_id?: string
          created_at?: string
          discount_cents?: number
          final_cents?: number
          id?: string
          original_cents?: number
          plan_key?: string
          stripe_session_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "promo_code_redemptions_code_id_fkey"
            columns: ["code_id"]
            isOneToOne: false
            referencedRelation: "promo_codes"
            referencedColumns: ["id"]
          },
        ]
      }
      promo_codes: {
        Row: {
          applies_to: string
          code: string
          created_at: string
          created_by: string | null
          description: string | null
          discount_percent: number
          expires_at: string | null
          id: string
          is_active: boolean
          max_redemptions: number | null
          per_account_limit: number
          updated_at: string
        }
        Insert: {
          applies_to?: string
          code: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          discount_percent: number
          expires_at?: string | null
          id?: string
          is_active?: boolean
          max_redemptions?: number | null
          per_account_limit?: number
          updated_at?: string
        }
        Update: {
          applies_to?: string
          code?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          discount_percent?: number
          expires_at?: string | null
          id?: string
          is_active?: boolean
          max_redemptions?: number | null
          per_account_limit?: number
          updated_at?: string
        }
        Relationships: []
      }
      public_support_messages: {
        Row: {
          category: string
          created_at: string
          email: string
          id: string
          message: string
          name: string
          status: string
          subject: string
          ticket_code: string | null
        }
        Insert: {
          category?: string
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          status?: string
          subject: string
          ticket_code?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          status?: string
          subject?: string
          ticket_code?: string | null
        }
        Relationships: []
      }
      reports: {
        Row: {
          content_snapshot: string | null
          created_at: string
          details: string | null
          id: string
          moderation_note: string | null
          reason: string
          reason_code: string | null
          reported_user_id: string | null
          reporter_user_id: string
          resolved_at: string | null
          resolved_by: string | null
          status: string
          target_id: string
          target_type: string
          updated_at: string
        }
        Insert: {
          content_snapshot?: string | null
          created_at?: string
          details?: string | null
          id?: string
          moderation_note?: string | null
          reason: string
          reason_code?: string | null
          reported_user_id?: string | null
          reporter_user_id: string
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          target_id: string
          target_type: string
          updated_at?: string
        }
        Update: {
          content_snapshot?: string | null
          created_at?: string
          details?: string | null
          id?: string
          moderation_note?: string | null
          reason?: string
          reason_code?: string | null
          reported_user_id?: string | null
          reporter_user_id?: string
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          target_id?: string
          target_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          body: string | null
          created_at: string
          id: string
          order_id: string
          rating: number
          reviewer_user_id: string
          subject_user_id: string
          updated_at: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          order_id: string
          rating: number
          reviewer_user_id: string
          subject_user_id: string
          updated_at?: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          order_id?: string
          rating?: number
          reviewer_user_id?: string
          subject_user_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_places: {
        Row: {
          created_at: string
          place_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          place_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          place_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_places_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "campus_places"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_searches: {
        Row: {
          created_at: string
          id: string
          label: string
          query: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          label: string
          query: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          label?: string
          query?: string
          user_id?: string
        }
        Relationships: []
      }
      school_access_requests: {
        Row: {
          created_at: string
          id: string
          note: string | null
          requested_domain: string
          requested_school_name: string
          requester_user_id: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          note?: string | null
          requested_domain: string
          requested_school_name: string
          requester_user_id: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          note?: string | null
          requested_domain?: string
          requested_school_name?: string
          requester_user_id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      schools: {
        Row: {
          city: string | null
          created_at: string
          domain: string
          id: string
          is_active: boolean
          name: string
          state: string | null
          type: string
          updated_at: string
        }
        Insert: {
          city?: string | null
          created_at?: string
          domain: string
          id?: string
          is_active?: boolean
          name: string
          state?: string | null
          type?: string
          updated_at?: string
        }
        Update: {
          city?: string | null
          created_at?: string
          domain?: string
          id?: string
          is_active?: boolean
          name?: string
          state?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      search_history: {
        Row: {
          created_at: string
          id: string
          query: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          query: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          query?: string
          user_id?: string
        }
        Relationships: []
      }
      seller_availability: {
        Row: {
          available_until: string | null
          category: string | null
          created_at: string
          id: string
          is_active: boolean
          listing_id: string | null
          note: string | null
          price_from_cents: number | null
          school_id: string | null
          seller_user_id: string
          service_label: string | null
          slots_remaining: number | null
          updated_at: string
          zone_name: string | null
        }
        Insert: {
          available_until?: string | null
          category?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          listing_id?: string | null
          note?: string | null
          price_from_cents?: number | null
          school_id?: string | null
          seller_user_id: string
          service_label?: string | null
          slots_remaining?: number | null
          updated_at?: string
          zone_name?: string | null
        }
        Update: {
          available_until?: string | null
          category?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          listing_id?: string | null
          note?: string | null
          price_from_cents?: number | null
          school_id?: string | null
          seller_user_id?: string
          service_label?: string | null
          slots_remaining?: number | null
          updated_at?: string
          zone_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "seller_availability_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "seller_availability_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      seller_subscriptions: {
        Row: {
          created_at: string
          current_period_end: string | null
          id: string
          plan_code: string
          promo_scope: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_period_end?: string | null
          id?: string
          plan_code: string
          promo_scope?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_period_end?: string | null
          id?: string
          plan_code?: string
          promo_scope?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "seller_subscriptions_plan_code_fkey"
            columns: ["plan_code"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["code"]
          },
        ]
      }
      service_availability: {
        Row: {
          created_at: string
          end_time: string
          id: string
          listing_id: string
          start_time: string
          weekday: number
        }
        Insert: {
          created_at?: string
          end_time: string
          id?: string
          listing_id: string
          start_time: string
          weekday: number
        }
        Update: {
          created_at?: string
          end_time?: string
          id?: string
          listing_id?: string
          start_time?: string
          weekday?: number
        }
        Relationships: [
          {
            foreignKeyName: "service_availability_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      service_availability_slots: {
        Row: {
          booking_id: string | null
          created_at: string
          id: string
          is_booked: boolean
          listing_id: string
          seller_user_id: string
          slot_end: string
          slot_start: string
        }
        Insert: {
          booking_id?: string | null
          created_at?: string
          id?: string
          is_booked?: boolean
          listing_id: string
          seller_user_id: string
          slot_end: string
          slot_start: string
        }
        Update: {
          booking_id?: string | null
          created_at?: string
          id?: string
          is_booked?: boolean
          listing_id?: string
          seller_user_id?: string
          slot_end?: string
          slot_start?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_availability_slots_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      student_orgs: {
        Row: {
          avatar_url: string | null
          bio: string | null
          category: string
          contact_email: string | null
          created_at: string
          follower_count: number
          id: string
          instagram: string | null
          is_verified: boolean
          name: string
          owner_user_id: string
          school_id: string | null
          slug: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          category?: string
          contact_email?: string | null
          created_at?: string
          follower_count?: number
          id?: string
          instagram?: string | null
          is_verified?: boolean
          name: string
          owner_user_id: string
          school_id?: string | null
          slug: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          category?: string
          contact_email?: string | null
          created_at?: string
          follower_count?: number
          id?: string
          instagram?: string | null
          is_verified?: boolean
          name?: string
          owner_user_id?: string
          school_id?: string | null
          slug?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_orgs_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_plans: {
        Row: {
          code: string
          created_at: string
          features: Json
          is_active: boolean
          name: string
          price_cents: number
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          features?: Json
          is_active?: boolean
          name: string
          price_cents?: number
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          features?: Json
          is_active?: boolean
          name?: string
          price_cents?: number
          updated_at?: string
        }
        Relationships: []
      }
      support_requests: {
        Row: {
          admin_note: string | null
          category: string
          created_at: string
          description: string
          id: string
          related_listing_id: string | null
          related_order_id: string | null
          status: string
          subject: string
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_note?: string | null
          category: string
          created_at?: string
          description: string
          id?: string
          related_listing_id?: string | null
          related_order_id?: string | null
          status?: string
          subject: string
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_note?: string | null
          category?: string
          created_at?: string
          description?: string
          id?: string
          related_listing_id?: string | null
          related_order_id?: string | null
          status?: string
          subject?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_requests_related_listing_id_fkey"
            columns: ["related_listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_requests_related_order_id_fkey"
            columns: ["related_order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
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
          role: Database["public"]["Enums"]["app_role"]
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
      webhook_events: {
        Row: {
          event_id: string
          event_type: string
          id: string
          payload: Json
          processed: boolean
          processed_at: string | null
          processing_error: string | null
          provider: string
          received_at: string
        }
        Insert: {
          event_id: string
          event_type: string
          id?: string
          payload: Json
          processed?: boolean
          processed_at?: string | null
          processing_error?: string | null
          provider?: string
          received_at?: string
        }
        Update: {
          event_id?: string
          event_type?: string
          id?: string
          payload?: Json
          processed?: boolean
          processed_at?: string | null
          processing_error?: string | null
          provider?: string
          received_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      moderation_reports: {
        Row: {
          content_id: string | null
          content_snapshot: string | null
          content_type: string | null
          created_at: string | null
          details: string | null
          id: string | null
          reason: string | null
          reason_code: string | null
          reported_user_id: string | null
          reporter_user_id: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          content_id?: string | null
          content_snapshot?: string | null
          content_type?: string | null
          created_at?: string | null
          details?: string | null
          id?: string | null
          reason?: string | null
          reason_code?: string | null
          reported_user_id?: string | null
          reporter_user_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          content_id?: string | null
          content_snapshot?: string | null
          content_type?: string | null
          created_at?: string | null
          details?: string | null
          id?: string | null
          reason?: string | null
          reason_code?: string | null
          reported_user_id?: string | null
          reporter_user_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      public_profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          completed_transactions: number | null
          created_at: string | null
          display_name: string | null
          graduation_year: number | null
          id: string | null
          is_hbcu_student: boolean | null
          major: string | null
          rating_avg: number | null
          rating_count: number | null
          school_name: string | null
          status: string | null
          username: string | null
          verification_status: string | null
          year: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          completed_transactions?: number | null
          created_at?: string | null
          display_name?: never
          graduation_year?: number | null
          id?: string | null
          is_hbcu_student?: boolean | null
          major?: string | null
          rating_avg?: number | null
          rating_count?: number | null
          school_name?: string | null
          status?: string | null
          username?: string | null
          verification_status?: string | null
          year?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          completed_transactions?: number | null
          created_at?: string | null
          display_name?: never
          graduation_year?: number | null
          id?: string | null
          is_hbcu_student?: boolean | null
          major?: string | null
          rating_avg?: number | null
          rating_count?: number | null
          school_name?: string | null
          status?: string | null
          username?: string | null
          verification_status?: string | null
          year?: string | null
        }
        Relationships: []
      }
      reviews_verified: {
        Row: {
          body: string | null
          created_at: string | null
          id: string | null
          listing_id: string | null
          order_id: string | null
          order_kind: string | null
          rating: number | null
          reviewer_user_id: string | null
          subject_user_id: string | null
          updated_at: string | null
          verification_kind: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      admin_perform: {
        Args: {
          _action: string
          _note: string
          _target_id: string
          _target_type: string
        }
        Returns: undefined
      }
      admin_user_directory: {
        Args: never
        Returns: {
          completed_transactions: number
          created_at: string
          display_name: string
          email: string
          id: string
          is_suspended: boolean
          rating_avg: number
          rating_count: number
          school_name: string
          username: string
          verification_status: string
        }[]
      }
      campus_activity_summary: {
        Args: { _school_id: string }
        Returns: {
          available_count: number
          drop_count: number
          event_count: number
          total: number
          zone_name: string
        }[]
      }
      campus_rankings: {
        Args: {
          _category?: string
          _days?: number
          _limit?: number
          _school_id?: string
        }
        Returns: {
          avatar_url: string
          completed_orders: number
          completed_transactions: number
          display_name: string
          member_since: string
          rating_avg: number
          rating_count: number
          school_id: string
          school_name: string
          top_category: string
          user_id: string
          username: string
          verification_status: string
        }[]
      }
      claim_flash_drop: {
        Args: { _drop_id: string }
        Returns: {
          claimed: boolean
          reason: string
          remaining: number
        }[]
      }
      conversation_has_block: {
        Args: { _conversation_id: string; _uid: string }
        Returns: boolean
      }
      create_booking_secure: {
        Args: { _note: string; _slot_id: string }
        Returns: string
      }
      create_order_secure: {
        Args: {
          _fulfillment_method: string
          _listing_id: string
          _meetup_location: string
          _note: string
          _qty: number
        }
        Returns: string
      }
      featured_promotions: {
        Args: { _viewer_school_id?: string }
        Returns: {
          campus: string
          category: string
          description: string
          id: string
          image_url: string
          kind: string
          name: string
          starts_at: string
          tier: string
          username: string
          verified: boolean
        }[]
      }
      get_public_local_businesses: {
        Args: { _ids: string[] }
        Returns: {
          campus_name: string
          description: string
          id: string
          name: string
          school_id: string
          services_needed: string[]
          verification_status: string
          website: string
        }[]
      }
      get_public_profiles: {
        Args: { _ids: string[] }
        Returns: {
          avatar_url: string
          display_name: string
          id: string
          username: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_blocked_between: { Args: { _a: string; _b: string }; Returns: boolean }
      is_conversation_member: {
        Args: { _conv: string; _user: string }
        Returns: boolean
      }
      is_suspended: { Args: { _user_id: string }; Returns: boolean }
      is_verified_local_business: {
        Args: { _user_id: string }
        Returns: boolean
      }
      mark_all_notifications_read: { Args: never; Returns: number }
      mark_notification_read: { Args: { _id: string }; Returns: undefined }
      seller_plan_ranks: {
        Args: { _seller_ids: string[] }
        Returns: {
          plan_code: string
          user_id: string
        }[]
      }
      transition_booking_status: {
        Args: { _booking_id: string; _next: string; _reason: string }
        Returns: undefined
      }
      transition_order_status: {
        Args: { _next: string; _note: string; _order_id: string }
        Returns: undefined
      }
      validate_promo_code: {
        Args: { _code: string; _user_id: string }
        Returns: Json
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
