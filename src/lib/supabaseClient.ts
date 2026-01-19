import { createClient } from '@supabase/supabase-js'

// ✅ আপনার লাইভ ড্যাশবোর্ড অনুযায়ী সঠিক URL (২টি 'j')
const supabaseUrl = 'https://lcjjnrzlqiewuwxavkw.supabase.co'

// ⚠️ এখানে আপনার Supabase Dashboard > Settings > API থেকে কপি করা 'anon' key বসান
// (দয়া করে আপনার নোটপ্যাডে বা আগে থেকে কপি করা পুরানো কি বসাবেন না, নতুন করে কপি করুন)
const supabaseKey = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxjampqbnJ6bHFpZXd1d3hhdmt3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxOTYxNjksImV4cCI6MjA3NTc3MjE2OX0.rj6tGiXU37a_rnBpqYR9FCjDubb3nOHDcpTSLCSaZaU 

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
})