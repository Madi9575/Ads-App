import { createClient } from '@supabase/supabase-js';

// NOTE: The environment variables were not set, causing a crash.
// These are placeholder values. For the application to fully work with authentication
// and data persistence, you must replace these with your own Supabase project URL and anon key.
const supabaseUrl = 'https://placeholderproject.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVycHJvamVjdCIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzAwMDAwMDAwLCJleHAiOjE4MDAwMDAwMDB9.placeholder_signature_for_init';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL and Anon Key are required.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);