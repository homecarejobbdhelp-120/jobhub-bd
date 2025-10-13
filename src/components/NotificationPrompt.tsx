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
import { Bell } from "lucide-react";

const NotificationPrompt = () => {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check if user has already been prompted
    const hasBeenPrompted = localStorage.getItem("notification-prompted");
    
    if (!hasBeenPrompted && "Notification" in window) {
      // Show prompt after a short delay for better UX
      setTimeout(() => {
        setOpen(true);
      }, 2000);
    }
  }, []);

  const handleEnableNotifications = async () => {
    if (!("Notification" in window)) {
      toast({
        title: "Not supported",
        description: "Your browser doesn't support notifications",
        variant: "destructive",
      });
      setOpen(false);
      localStorage.setItem("notification-prompted", "true");
      return;
    }

    const permission = await Notification.requestPermission();
    
    if (permission === "granted") {
      toast({
        title: "✅ Notifications enabled!",
        description: "You'll now receive updates from HomeCareJobBD.",
      });
    } else {
      toast({
        title: "Notifications disabled",
        description: "You can enable them later from the menu",
      });
    }
    
    setOpen(false);
    localStorage.setItem("notification-prompted", "true");
  };

  const handleDismiss = () => {
    setOpen(false);
    localStorage.setItem("notification-prompted", "true");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-primary/10 p-3 rounded-full">
              <Bell className="h-6 w-6 text-primary" />
            </div>
            <DialogTitle>Stay Updated</DialogTitle>
          </div>
          <DialogDescription>
            Enable notifications to receive instant updates about new job postings, application status, and important announcements from HomeCareJobBD.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex gap-2 sm:gap-2">
          <Button variant="outline" onClick={handleDismiss}>
            Not Now
          </Button>
          <Button onClick={handleEnableNotifications}>
            Enable Notifications
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NotificationPrompt;
