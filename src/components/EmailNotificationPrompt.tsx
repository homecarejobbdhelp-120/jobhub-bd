import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";
import { Mail } from "lucide-react";

const EmailNotificationPrompt = () => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const checkNotificationPreference = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Check user role - only show to caregivers/nurses
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (roleData?.role !== "caregiver" && roleData?.role !== "nurse") {
        return;
      }

      // Check if notifications_enabled is null or false
      const { data: profile } = await supabase
        .from("profiles")
        .select("notifications_enabled")
        .eq("id", session.user.id)
        .maybeSingle();

      // Only show prompt if notifications_enabled is null (never set)
      if (profile && profile.notifications_enabled === null) {
        // Small delay for better UX
        setTimeout(() => setOpen(true), 1500);
      }
    };

    checkNotificationPreference();
  }, []);

  const handleEnableNotifications = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { error } = await supabase
        .from("profiles")
        .update({ notifications_enabled: true })
        .eq("id", session.user.id);

      if (error) throw error;

      toast({
        title: "Email Notifications Enabled",
        description: "You'll receive email alerts for new job postings.",
      });
      setOpen(false);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLater = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // Set to false so we don't prompt again
        await supabase
          .from("profiles")
          .update({ notifications_enabled: false })
          .eq("id", session.user.id);
      }
    } catch (error) {
      console.error("Error updating notification preference:", error);
    }
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-primary/10 p-3 rounded-full">
              <Mail className="h-6 w-6 text-primary" />
            </div>
            <DialogTitle>Enable Email Notifications?</DialogTitle>
          </div>
          <DialogDescription className="text-base">
            Get notified via email when new caregiving jobs are posted that match your profile. Never miss an opportunity!
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex gap-2 sm:gap-2 mt-4">
          <Button variant="outline" onClick={handleLater} disabled={loading}>
            Later
          </Button>
          <Button onClick={handleEnableNotifications} disabled={loading}>
            {loading ? "Enabling..." : "Yes, Enable"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EmailNotificationPrompt;
