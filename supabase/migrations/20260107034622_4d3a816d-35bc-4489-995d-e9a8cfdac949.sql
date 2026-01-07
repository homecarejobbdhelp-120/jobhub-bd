-- Drop the overly permissive INSERT policy on notifications table
-- The SECURITY DEFINER trigger (notify_followers_on_new_job) bypasses RLS anyway
-- This prevents unauthorized direct inserts to the notifications table
DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;