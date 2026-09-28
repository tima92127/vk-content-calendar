import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vqhwewoqsmdvbtraamsg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxaHdld29xc21kdmJ0cmFhbXNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA2MDA3MTksImV4cCI6MjEwNjE3NjcxOX0.QzHVPYhT1YLMhCW-1fkgMnaLHUNqJO3sMBlhbGBaT34';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});
