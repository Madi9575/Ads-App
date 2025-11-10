import { createClient } from '@supabase/supabase-js';

// FIX: Use process.env for environment variables to resolve TypeScript errors.
const supabaseUrl = process.env.VITE_SUPABASE_URL;
// FIX: Use process.env for environment variables to resolve TypeScript errors.
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL and Anon Key are required.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);