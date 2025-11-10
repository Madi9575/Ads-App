import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kloarwhppeijxemxciwm.supabase.co';

const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtsb2Fyd2hwcGVpanhlbXhjaXdtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3MDg3MjUsImV4cCI6MjA3ODI4NDcyNX0.D3VgNkqePubxYmdWrXIoIY6lofFQZ7hpxgog-1QM1-8';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);