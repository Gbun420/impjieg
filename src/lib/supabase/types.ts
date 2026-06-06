export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      employers: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          slug: string;
          description: string | null;
          website: string | null;
          logo_url: string | null;
          cover_image_url: string | null;
          location: string | null;
          company_size: string | null;
          industry: string | null;
          culture_summary: string | null;
          hiring_process: string | null;
          workplace_highlights: string[];
          response_time_days: number | null;
          is_verified: boolean | null;
          email_notifications: boolean | null;
          whatsapp_notifications: boolean | null;
          whatsapp_number: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          slug: string;
          description?: string | null;
          website?: string | null;
          logo_url?: string | null;
          cover_image_url?: string | null;
          location?: string | null;
          company_size?: string | null;
          industry?: string | null;
          culture_summary?: string | null;
          hiring_process?: string | null;
          workplace_highlights?: string[];
          response_time_days?: number | null;
          is_verified?: boolean | null;
          email_notifications?: boolean | null;
          whatsapp_notifications?: boolean | null;
          whatsapp_number?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          website?: string | null;
          logo_url?: string | null;
          cover_image_url?: string | null;
          location?: string | null;
          company_size?: string | null;
          industry?: string | null;
          culture_summary?: string | null;
          hiring_process?: string | null;
          workplace_highlights?: string[];
          response_time_days?: number | null;
          is_verified?: boolean | null;
          email_notifications?: boolean | null;
          whatsapp_notifications?: boolean | null;
          whatsapp_number?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      jobs: {
        Row: {
          id: string;
          employer_id: string;
          title: string;
          slug: string;
          description: string;
          location: string;
          sector: string;
          job_type: string;
          seniority: string | null;
          remote_type: string | null;
          salary_min: number | null;
          salary_max: number | null;
          skills: string[];
          benefits: string[];
          visa_friendly: boolean;
          is_featured: boolean;
          status: string;
          expires_at: string | null;
          application_email: string | null;
          application_url: string | null;
          views: number;
          applications_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          employer_id: string;
          title: string;
          slug: string;
          description: string;
          location: string;
          sector: string;
          job_type: string;
          seniority?: string | null;
          remote_type?: string | null;
          salary_min?: number | null;
          salary_max?: number | null;
          skills?: string[];
          benefits?: string[];
          visa_friendly?: boolean;
          is_featured?: boolean;
          status?: string;
          expires_at?: string | null;
          application_email?: string | null;
          application_url?: string | null;
          views?: number;
          applications_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          employer_id?: string;
          title?: string;
          slug?: string;
          description?: string;
          location?: string;
          sector?: string;
          job_type?: string;
          seniority?: string | null;
          remote_type?: string | null;
          salary_min?: number | null;
          salary_max?: number | null;
          skills?: string[];
          benefits?: string[];
          visa_friendly?: boolean;
          is_featured?: boolean;
          status?: string;
          expires_at?: string | null;
          application_email?: string | null;
          application_url?: string | null;
          views?: number;
          applications_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      job_sources: {
        Row: {
          id: string;
          name: string;
          type: "xml_feed" | "rss_feed" | "api" | "html_scraper" | "ats_feed" | "manual_csv";
          base_url: string | null;
          feed_url: string | null;
          enabled: boolean;
          priority: number;
          active_jobs_limit: number;
          default_status: "confirmed" | "needs_confirmation" | "rejected";
          default_category_id: string | null;
          default_company_id: string | null;
          employer_assignment_mode: "manual_company" | "extract_from_post" | "source_company";
          posting_date_mode: "original_date" | "import_date";
          expiry_days: number;
          crawl_frequency_minutes: number;
          respect_robots_txt: boolean;
          rate_limit_per_hour: number;
          timeout_seconds: number;
          retry_count: number;
          user_agent: string | null;
          last_run_at: string | null;
          last_success_at: string | null;
          last_error_at: string | null;
          health_status: "healthy" | "degraded" | "offline" | "unknown";
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          type: "xml_feed" | "rss_feed" | "api" | "html_scraper" | "ats_feed" | "manual_csv";
          base_url?: string | null;
          feed_url?: string | null;
          enabled?: boolean;
          priority?: number;
          active_jobs_limit?: number;
          default_status?: "confirmed" | "needs_confirmation" | "rejected";
          default_category_id?: string | null;
          default_company_id?: string | null;
          employer_assignment_mode?: "manual_company" | "extract_from_post" | "source_company";
          posting_date_mode?: "original_date" | "import_date";
          expiry_days?: number;
          crawl_frequency_minutes?: number;
          respect_robots_txt?: boolean;
          rate_limit_per_hour?: number;
          timeout_seconds?: number;
          retry_count?: number;
          user_agent?: string | null;
          last_run_at?: string | null;
          last_success_at?: string | null;
          last_error_at?: string | null;
          health_status?: "healthy" | "degraded" | "offline" | "unknown";
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          type?: "xml_feed" | "rss_feed" | "api" | "html_scraper" | "ats_feed" | "manual_csv";
          base_url?: string | null;
          feed_url?: string | null;
          enabled?: boolean;
          priority?: number;
          active_jobs_limit?: number;
          default_status?: "confirmed" | "needs_confirmation" | "rejected";
          default_category_id?: string | null;
          default_company_id?: string | null;
          employer_assignment_mode?: "manual_company" | "extract_from_post" | "source_company";
          posting_date_mode?: "original_date" | "import_date";
          expiry_days?: number;
          crawl_frequency_minutes?: number;
          respect_robots_txt?: boolean;
          rate_limit_per_hour?: number;
          timeout_seconds?: number;
          retry_count?: number;
          user_agent?: string | null;
          last_run_at?: string | null;
          last_success_at?: string | null;
          last_error_at?: string | null;
          health_status?: "healthy" | "degraded" | "offline" | "unknown";
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      job_source_runs: {
        Row: {
          id: string;
          source_id: string;
          status: "queued" | "running" | "succeeded" | "failed" | "partial";
          fetched_count: number;
          imported_count: number;
          updated_count: number;
          duplicate_count: number;
          rejected_count: number;
          error_count: number;
          error_messages: Json;
          runtime_ms: number | null;
          started_at: string | null;
          finished_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          source_id: string;
          status?: "queued" | "running" | "succeeded" | "failed" | "partial";
          fetched_count?: number;
          imported_count?: number;
          updated_count?: number;
          duplicate_count?: number;
          rejected_count?: number;
          error_count?: number;
          error_messages?: Json;
          runtime_ms?: number | null;
          started_at?: string | null;
          finished_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          source_id?: string;
          status?: "queued" | "running" | "succeeded" | "failed" | "partial";
          fetched_count?: number;
          imported_count?: number;
          updated_count?: number;
          duplicate_count?: number;
          rejected_count?: number;
          error_count?: number;
          error_messages?: Json;
          runtime_ms?: number | null;
          started_at?: string | null;
          finished_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      job_source_errors: {
        Row: {
          id: string;
          source_id: string;
          run_id: string | null;
          source_url: string | null;
          raw_title: string | null;
          raw_company: string | null;
          raw_payload: Json | null;
          validation_error: string | null;
          stack_trace: string | null;
          resolved_at: string | null;
          resolved_by: string | null;
          resolution_note: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          source_id: string;
          run_id?: string | null;
          source_url?: string | null;
          raw_title?: string | null;
          raw_company?: string | null;
          raw_payload?: Json | null;
          validation_error?: string | null;
          stack_trace?: string | null;
          resolved_at?: string | null;
          resolved_by?: string | null;
          resolution_note?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          source_id?: string;
          run_id?: string | null;
          source_url?: string | null;
          raw_title?: string | null;
          raw_company?: string | null;
          raw_payload?: Json | null;
          validation_error?: string | null;
          stack_trace?: string | null;
          resolved_at?: string | null;
          resolved_by?: string | null;
          resolution_note?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      job_import_snapshots: {
        Row: {
          id: string;
          source_id: string;
          job_id: string | null;
          external_id: string | null;
          canonical_url: string | null;
          apply_url: string | null;
          content_hash: string | null;
          fuzzy_hash: string | null;
          raw_payload: Json | null;
          normalized_job: Json | null;
          status: "needs_review" | "approved" | "rejected" | "duplicate" | "error" | "expired";
          imported_at: string | null;
          last_seen_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          source_id: string;
          job_id?: string | null;
          external_id?: string | null;
          canonical_url?: string | null;
          apply_url?: string | null;
          content_hash?: string | null;
          fuzzy_hash?: string | null;
          raw_payload?: Json | null;
          normalized_job?: Json | null;
          status?: "needs_review" | "approved" | "rejected" | "duplicate" | "error" | "expired";
          imported_at?: string | null;
          last_seen_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          source_id?: string;
          job_id?: string | null;
          external_id?: string | null;
          canonical_url?: string | null;
          apply_url?: string | null;
          content_hash?: string | null;
          fuzzy_hash?: string | null;
          raw_payload?: Json | null;
          normalized_job?: Json | null;
          status?: "needs_review" | "approved" | "rejected" | "duplicate" | "error" | "expired";
          imported_at?: string | null;
          last_seen_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      job_duplicates: {
        Row: {
          id: string;
          job_id: string;
          duplicate_job_id: string;
          match_type: string;
          confidence: number | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          job_id: string;
          duplicate_job_id: string;
          match_type: string;
          confidence?: number | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          job_id?: string;
          duplicate_job_id?: string;
          match_type?: string;
          confidence?: number | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      applications: {
         Row: {
           id: string;
           job_id: string;
           employer_id: string;
           candidate_name: string;
           candidate_email: string;
           candidate_phone: string | null;
           candidate_cv_url: string | null;
           cover_letter: string | null;
           status: string;
           recruiter_notes: string | null;
           scorecard_data: Json | null;
           created_at: string;
           updated_at: string;
         };
         Insert: {
           id?: string;
           job_id: string;
           employer_id: string;
           candidate_name: string;
           candidate_email: string;
           candidate_phone?: string | null;
           candidate_cv_url?: string | null;
           cover_letter?: string | null;
           status?: string;
           recruiter_notes?: string | null;
           scorecard_data?: Json | null;
           created_at?: string;
           updated_at?: string;
         };
         Update: {
           id?: string;
           job_id?: string;
           employer_id?: string;
           candidate_name?: string;
           candidate_email?: string;
           candidate_phone?: string | null;
           candidate_cv_url?: string | null;
           cover_letter?: string | null;
           status?: string;
           recruiter_notes?: string | null;
           scorecard_data?: Json | null;
           created_at?: string;
           updated_at?: string;
         };
       };
      payments: {
        Row: {
          id: string;
          employer_id: string;
          job_id: string | null;
          amount: number;
          currency: string;
          status: string;
          stripe_payment_intent_id: string | null;
          stripe_checkout_session_id: string | null;
          listing_type: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          employer_id: string;
          job_id?: string | null;
          amount: number;
          currency?: string;
          status?: string;
          stripe_payment_intent_id?: string | null;
          stripe_checkout_session_id?: string | null;
          listing_type: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          employer_id?: string;
          job_id?: string | null;
          amount?: number;
          currency?: string;
          status?: string;
          stripe_payment_intent_id?: string | null;
          stripe_checkout_session_id?: string | null;
          listing_type?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      job_alerts: {
        Row: {
          id: string;
          email: string;
          sectors: string[];
          job_type: string | null;
          remote_type: string | null;
          salary_min: number | null;
          notification_method: string;
          whatsapp_number: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          sectors?: string[];
          job_type?: string | null;
          remote_type?: string | null;
          salary_min?: number | null;
          notification_method?: string;
          whatsapp_number?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          sectors?: string[];
          job_type?: string | null;
          remote_type?: string | null;
          salary_min?: number | null;
          notification_method?: string;
          whatsapp_number?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
       saved_jobs: {
         Row: {
           id: string;
           user_id: string;
           job_id: string;
           created_at: string | null;
         };
         Insert: {
           id?: string;
           user_id: string;
           job_id: string;
           created_at?: string | null;
         };
         Update: {
           id?: string;
           user_id?: string;
           job_id?: string;
           created_at?: string | null;
         };
       };
       subscriptions: {
         Row: {
           id: string;
           employer_id: string;
           plan_type: "basic" | "professional" | "enterprise";
           billing_cycle: "monthly" | "annual";
           status: "active" | "canceled" | "past_due" | "trialing";
           current_period_end: string | null;
           trial_end: string | null;
           job_credits_used: number;
           job_credits_reset_date: string | null;
           created_at: string;
           updated_at: string;
         };
         Insert: {
           id?: string;
           employer_id: string;
           plan_type?: "basic" | "professional" | "enterprise";
           billing_cycle?: "monthly" | "annual";
           status?: "active" | "canceled" | "past_due" | "trialing";
           current_period_end?: string | null;
           trial_end?: string | null;
           job_credits_used?: number;
           job_credits_reset_date?: string | null;
           created_at?: string;
           updated_at?: string;
         };
         Update: {
           id?: string;
           employer_id?: string;
           plan_type?: "basic" | "professional" | "enterprise";
           billing_cycle?: "monthly" | "annual";
           status?: "active" | "canceled" | "past_due" | "trialing";
           current_period_end?: string | null;
           trial_end?: string | null;
           job_credits_used?: number;
           job_credits_reset_date?: string | null;
           created_at?: string;
           updated_at?: string;
         };
       };
       subscription_job_credits: {
         Row: {
           id: string;
           subscription_id: string;
           job_id: string | null;
           credit_type: "standard" | "featured";
           used_at: string;
         };
         Insert: {
           id?: string;
           subscription_id: string;
           job_id?: string | null;
           credit_type?: "standard" | "featured";
           used_at?: string;
         };
         Update: {
           id?: string;
           subscription_id?: string;
           job_id?: string | null;
           credit_type?: "standard" | "featured";
           used_at?: string;
         };
       };
       credit_packs: {
         Row: {
           id: string;
           employer_id: string;
           pack_type: "starter" | "standard" | "premium";
           credits_purchased: number;
           credits_remaining: number;
           purchased_at: string;
           expires_at: string | null;
         };
         Insert: {
           id?: string;
           employer_id: string;
           pack_type?: "starter" | "standard" | "premium";
           credits_purchased?: number;
           credits_remaining?: number;
           purchased_at?: string;
           expires_at?: string | null;
         };
         Update: {
           id?: string;
           employer_id?: string;
           pack_type?: "starter" | "standard" | "premium";
           credits_purchased?: number;
           credits_remaining?: number;
           purchased_at?: string;
           expires_at?: string | null;
         };
       };
       promotion_bundles: {
         Row: {
           id: string;
           employer_id: string;
           job_id: string;
           bundle_type: "featuredBoost" | "socialPromotion" | "emailBlast";
           purchased_at: string;
           expires_at: string | null;
         };
         Insert: {
           id?: string;
           employer_id: string;
           job_id?: string;
           bundle_type?: "featuredBoost" | "socialPromotion" | "emailBlast";
           purchased_at?: string;
           expires_at?: string | null;
         };
         Update: {
           id?: string;
           employer_id?: string;
           job_id?: string;
           bundle_type?: "featuredBoost" | "socialPromotion" | "emailBlast";
           purchased_at?: string;
           expires_at?: string | null;
         };
       };
       screening_services: {
         Row: {
           id: string;
           employer_id: string;
           application_id: string;
           service_type: "backgroundCheck" | "skillsAssessment" | "referenceCheck";
           status: "pending" | "completed" | "failed";
           result: Json | null;
           purchased_at: string;
           completed_at: string | null;
         };
         Insert: {
           id?: string;
           employer_id: string;
           application_id?: string;
           service_type?: "backgroundCheck" | "skillsAssessment" | "referenceCheck";
           status?: "pending" | "completed" | "failed";
           result?: Json | null;
           purchased_at?: string;
           completed_at?: string | null;
         };
         Update: {
           id?: string;
           employer_id?: string;
           application_id?: string;
           service_type?: "backgroundCheck" | "skillsAssessment" | "referenceCheck";
           status?: "pending" | "completed" | "failed";
           result?: Json | null;
           purchased_at?: string;
           completed_at?: string | null;
         };
       };
       admin_commercial_grants: {
         Row: {
           id: string;
           employer_id: string;
           granted_by: string;
           grant_type:
             | "free_trial"
             | "plan_access"
             | "job_credit"
             | "featured_credit"
             | "boost_credit"
             | "ai_screening_credit"
             | "percent_discount"
             | "fixed_discount"
             | "custom_entitlement";
           product_id: string | null;
           entitlement_key: string | null;
           plan_key: string | null;
           credits_total: number | null;
           credits_used: number;
           discount_percent: number | null;
           discount_amount_cents: number | null;
           currency: string | null;
           starts_at: string;
           expires_at: string | null;
           status: "active" | "expired" | "revoked" | "consumed";
           reason: string;
           internal_notes: string | null;
           revoked_at: string | null;
           revoked_by: string | null;
           revoke_reason: string | null;
           metadata: Json;
           created_at: string;
           updated_at: string;
         };
         Insert: {
           id?: string;
           employer_id: string;
           granted_by: string;
           grant_type:
             | "free_trial"
             | "plan_access"
             | "job_credit"
             | "featured_credit"
             | "boost_credit"
             | "ai_screening_credit"
             | "percent_discount"
             | "fixed_discount"
             | "custom_entitlement";
           product_id?: string | null;
           entitlement_key?: string | null;
           plan_key?: string | null;
           credits_total?: number | null;
           credits_used?: number;
           discount_percent?: number | null;
           discount_amount_cents?: number | null;
           currency?: string | null;
           starts_at?: string;
           expires_at?: string | null;
           status?: "active" | "expired" | "revoked" | "consumed";
           reason: string;
           internal_notes?: string | null;
           revoked_at?: string | null;
           revoked_by?: string | null;
           revoke_reason?: string | null;
           metadata?: Json;
           created_at?: string;
           updated_at?: string;
         };
         Update: {
           id?: string;
           employer_id?: string;
           granted_by?: string;
           grant_type?:
             | "free_trial"
             | "plan_access"
             | "job_credit"
             | "featured_credit"
             | "boost_credit"
             | "ai_screening_credit"
             | "percent_discount"
             | "fixed_discount"
             | "custom_entitlement";
           product_id?: string | null;
           entitlement_key?: string | null;
           plan_key?: string | null;
           credits_total?: number | null;
           credits_used?: number;
           discount_percent?: number | null;
           discount_amount_cents?: number | null;
           currency?: string | null;
           starts_at?: string;
           expires_at?: string | null;
           status?: "active" | "expired" | "revoked" | "consumed";
           reason?: string;
           internal_notes?: string | null;
           revoked_at?: string | null;
           revoked_by?: string | null;
           revoke_reason?: string | null;
           metadata?: Json;
           created_at?: string;
           updated_at?: string;
         };
       };
       admin_commercial_grant_audit_logs: {
         Row: {
           id: string;
           grant_id: string | null;
           employer_id: string;
           actor_id: string | null;
           action:
             | "grant_created"
             | "grant_updated"
             | "grant_revoked"
             | "grant_expired"
             | "grant_consumed"
             | "credit_used"
             | "discount_applied";
           metadata: Json;
           created_at: string;
         };
         Insert: {
           id?: string;
           grant_id?: string | null;
           employer_id: string;
           actor_id?: string | null;
           action:
             | "grant_created"
             | "grant_updated"
             | "grant_revoked"
             | "grant_expired"
             | "grant_consumed"
             | "credit_used"
             | "discount_applied";
           metadata?: Json;
           created_at?: string;
         };
         Update: {
           id?: string;
           grant_id?: string | null;
           employer_id?: string;
           actor_id?: string | null;
           action?:
             | "grant_created"
             | "grant_updated"
             | "grant_revoked"
             | "grant_expired"
             | "grant_consumed"
             | "credit_used"
             | "discount_applied";
           metadata?: Json;
           created_at?: string;
         };
       };
       candidate_profiles: {
        Row: {
          id: string;
          user_id: string;
          full_name: string | null;
          headline: string | null;
          bio: string | null;
          phone: string | null;
          location: string | null;
          website: string | null;
          linkedin_url: string | null;
          skills: string[];
          experience_years: number | null;
          desired_salary_min: number | null;
          desired_salary_max: number | null;
          job_types: string[];
          sectors: string[];
          remote_preference: string | null;
          is_open_to_work: boolean | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          full_name?: string | null;
          headline?: string | null;
          bio?: string | null;
          phone?: string | null;
          location?: string | null;
          website?: string | null;
          linkedin_url?: string | null;
          skills?: string[];
          experience_years?: number | null;
          desired_salary_min?: number | null;
          desired_salary_max?: number | null;
          job_types?: string[];
          sectors?: string[];
          remote_preference?: string | null;
          is_open_to_work?: boolean | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          full_name?: string | null;
          headline?: string | null;
          bio?: string | null;
          phone?: string | null;
          location?: string | null;
          website?: string | null;
          linkedin_url?: string | null;
          skills?: string[];
          experience_years?: number | null;
          desired_salary_min?: number | null;
          desired_salary_max?: number | null;
          job_types?: string[];
          sectors?: string[];
          remote_preference?: string | null;
          is_open_to_work?: boolean | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      candidate_cvs: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          file_url: string;
          file_type: string | null;
          is_primary: boolean | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          file_url: string;
          file_type?: string | null;
          is_primary?: boolean | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          file_url?: string;
          file_type?: string | null;
          is_primary?: boolean | null;
          created_at?: string;
        };
      };
      candidate_applications: {
        Row: {
          id: string;
          user_id: string;
          job_id: string;
          application_id: string | null;
          status: string;
          notes: string | null;
          applied_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          job_id: string;
          application_id?: string | null;
          status?: string;
          notes?: string | null;
          applied_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          job_id?: string;
          application_id?: string | null;
          status?: string;
          notes?: string | null;
          applied_at?: string;
          updated_at?: string;
        };
      };
      candidate_alerts: {
        Row: {
          id: string;
          user_id: string;
          name: string | null;
          sectors: string[];
          job_types: string[];
          locations: string[];
          salary_min: number | null;
          remote_type: string | null;
          frequency: string | null;
          is_active: boolean | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name?: string | null;
          sectors?: string[];
          job_types?: string[];
          locations?: string[];
          salary_min?: number | null;
          remote_type?: string | null;
          frequency?: string | null;
          is_active?: boolean | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string | null;
          sectors?: string[];
          job_types?: string[];
          locations?: string[];
          salary_min?: number | null;
          remote_type?: string | null;
          frequency?: string | null;
          is_active?: boolean | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}

export type Employer = Database["public"]["Tables"]["employers"]["Row"];
export type Job = Database["public"]["Tables"]["jobs"]["Row"];
export type Application = Database["public"]["Tables"]["applications"]["Row"];
export type Payment = Database["public"]["Tables"]["payments"]["Row"];
export type JobAlert = Database["public"]["Tables"]["job_alerts"]["Row"];
export type SavedJob = Database["public"]["Tables"]["saved_jobs"]["Row"];
export type CandidateProfile = Database["public"]["Tables"]["candidate_profiles"]["Row"];
export type CandidateCv = Database["public"]["Tables"]["candidate_cvs"]["Row"];
export type CandidateApplication = Database["public"]["Tables"]["candidate_applications"]["Row"];
export type CandidateAlert = Database["public"]["Tables"]["candidate_alerts"]["Row"];

export type JobWithEmployer = Job & {
  employers: Pick<
    Employer,
    "id" | "name" | "slug" | "logo_url" | "location" | "website" | "is_verified"
  >;
};
