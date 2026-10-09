import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qvmuuvjufsnubsimuqub.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2bXV1dmp1ZnNudWJzaW11cXViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA0NDAzOTMsImV4cCI6MjEwNjAxNjM5M30.VV4mi29nYiisDAScnconErQV438_k_cn1CuKX90vUxw';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
