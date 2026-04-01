import { createClient } from '@supabase/supabase-js';

// Hardcoded Supabase credentials provided by the user
const supabaseUrl = 'https://ztfvppwdtqlvxxftglft.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0ZnZwcHdkdHFsdnh4ZnRnbGZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUwMTA4OTAsImV4cCI6MjA5MDU4Njg5MH0.2Gz_wP2V69ysJoT6-NnU7Mp8Zvsnf-AygjyXzsKLyKo';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
