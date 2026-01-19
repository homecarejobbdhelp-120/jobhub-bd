import { createClient } from '@supabase/supabase-js'

// ✅ সঠিক URL (৩টি 'j' সহ - আপনার আসল প্রজেক্ট)
const supabaseUrl = 'https://lcjjjnrzlqiewuwxavkw.supabase.co'

// ✅ সঠিক Key (আপনার দেওয়া ৩টি 'j' প্রজেক্টের চাবি)
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxjampqbnJ6bHFpZXd1d3hhdmt3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxOTYxNjksImV4cCI6MjA3NTc3MjE2OX0.rj6tGiXU37a_rnBpqYR9FCjDubb3nOHDcpTSLCSaZaU'

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
})