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
