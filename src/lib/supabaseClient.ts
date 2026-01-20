import { createClient } from '@supabase/supabase-js'

// ✅ আপনার নতুন প্রজেক্টের সঠিক URL
const supabaseUrl = 'https://mnkaokfilxfisizotink.supabase.co'

// ✅ আপনার নতুন চাবি (কোটেশন সহ ঠিক করে দিয়েছি)
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ua2Fva2ZpbHhmaXNpem90aW5rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg5MDkxNTYsImV4cCI6MjA4NDQ4NTE1Nn0.Ayr1QscmdJwfbIbrZYsQEt_Y2BKaHF0AIREFm8TX2JQ'

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
})