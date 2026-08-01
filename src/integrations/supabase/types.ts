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
      profiles: {
        Row: {
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
      reports: {
        Row: {
          created_at: string
          id: string
          reason: string
          reporter_user_id: string
          status: string
          target_id: string
          target_type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          reason: string
          reporter_user_id: string
          status?: string
          target_id: string
          target_type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          reason?: string
          reporter_user_id?: string
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
      seller_subscriptions: {
        Row: {
          created_at: string
          current_period_end: string | null
          id: string
          plan_code: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_period_end?: string | null
          id?: string
          plan_code: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_period_end?: string | null
          id?: string
          plan_code?: string
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_conversation_member: {
        Args: { _conv: string; _user: string }
        Returns: boolean
      }
      is_suspended: { Args: { _user_id: string }; Returns: boolean }
      mark_all_notifications_read: { Args: never; Returns: number }
      mark_notification_read: { Args: { _id: string }; Returns: undefined }
      transition_booking_status: {
        Args: { _booking_id: string; _next: string; _reason: string }
        Returns: undefined
      }
      transition_order_status: {
        Args: { _next: string; _note: string; _order_id: string }
        Returns: undefined
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
