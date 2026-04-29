import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string;
          email: string;
          has_paid: boolean;
          created_at: string;
        };
        Insert: {
          id: string;
          name: string;
          email: string;
          has_paid?: boolean;
        };
        Update: {
          name?: string;
          has_paid?: boolean;
        };
      };
      medical_profiles: {
        Row: {
          id: string;
          user_id: string;
          conditions: any[];
          medications: string;
          notes: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          conditions?: any[];
          medications?: string;
          notes?: string;
        };
        Update: {
          conditions?: any[];
          medications?: string;
          notes?: string;
        };
      };
      pip_answers: {
        Row: {
          id: string;
          user_id: string;
          question_id: string;
          answer: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          question_id: string;
          answer: string;
        };
        Update: {
          answer?: string;
        };
      };
      diary_entries: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          content: string;
          mood: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          date: string;
          content: string;
          mood?: string;
        };
        Update: {
          content?: string;
          mood?: string;
        };
      };
    };
  };
};