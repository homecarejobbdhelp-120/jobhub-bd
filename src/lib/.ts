import { createClient } from '@supabase/supabase-js'

// ✅ সঠিক URL (3টি 'j' এবং শেষে 'x' আছে)
const supabaseUrl = 'https://lcjjjnrzlqiewuwxavkw.supabase.co'
// আপনার 'anon' key টি নিচে বসান (আগের ফাইল থেকে কপি করে বা হার্ডকোড করে)
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY 

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
})