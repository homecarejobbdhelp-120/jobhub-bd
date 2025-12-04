import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, Globe, Bell, Lock, Share2, LogOut, Eye, EyeOff } from "lucide-react";
import Navbar from "@/components/Navbar";

const Settings = () => {
  const navigate = useNavigate();
  const [language, setLanguage] = useState("en");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    fetchNotificationSettings();
  }, []);

  const fetchNotificationSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("profiles")
        .select("notifications_enabled, push_notifications_enabled")
        .eq("id", user.id)
        .single();

      if (data) {
        setEmailNotifications(data.notifications_enabled ?? true);
        setPushNotifications(data.push_notifications_enabled ?? false);
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    }
  };

  const handleNotificationToggle = async (type: "email" | "push", value: boolean) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const updateField = type === "email" 
        ? { notifications_enabled: value }
        : { push_notifications_enabled: value };

      const { error } = await supabase
        .from("profiles")
        .update(updateField)
        .eq("id", user.id);

      if (error) throw error;

      if (type === "email") {
        setEmailNotifications(value);
      } else {
        setPushNotifications(value);
      }

      toast({
        title: "Settings Updated",
        description: `${type === "email" ? "Email" : "Push"} notifications ${value ? "enabled" : "disabled"}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update settings",
        variant: "destructive",
      });
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters",
        variant: "destructive",
      });
      return;
    }

    setUpdating(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Password updated successfully",
      });
      setNewPassword("");
      setConfirmPassword("");
      setShowPasswordSection(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update password",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleShare = async () => {
    const siteUrl = window.location.origin;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: "HomeCare Job BD",
          text: "Find caregiving jobs in Bangladesh",
          url: siteUrl,
        });
      } catch (error) {
        // User cancelled or share failed
        await navigator.clipboard.writeText(siteUrl);
        toast({
          title: "Link Copied",
          description: "Website URL copied to clipboard",
        });
      }
    } else {
      await navigator.clipboard.writeText(siteUrl);
      toast({
        title: "Link Copied",
        description: "Website URL copied to clipboard",
      });
    }
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await supabase.auth.signOut();
      navigate("/login");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to logout",
        variant: "destructive",
      });
      setLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <h1 className="text-2xl font-bold mb-6">Settings</h1>

        <div className="space-y-4">
          {/* Language */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Language
              </CardTitle>
              <CardDescription>Choose your preferred language</CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="bn">বাংলা (Bangla)</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
              </CardTitle>
              <CardDescription>Manage your notification preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="email-notifications" className="flex-1">
                  Email Notifications
                  <p className="text-sm text-muted-foreground font-normal">
                    Receive job updates via email
                  </p>
                </Label>
                <Switch
                  id="email-notifications"
                  checked={emailNotifications}
                  onCheckedChange={(value) => handleNotificationToggle("email", value)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="push-notifications" className="flex-1">
                  Push Notifications
                  <p className="text-sm text-muted-foreground font-normal">
                    Receive instant notifications
                  </p>
                </Label>
                <Switch
                  id="push-notifications"
                  checked={pushNotifications}
                  onCheckedChange={(value) => handleNotificationToggle("push", value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Security */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Security
              </CardTitle>
              <CardDescription>Manage your account security</CardDescription>
            </CardHeader>
            <CardContent>
              {!showPasswordSection ? (
                <Button
                  variant="outline"
                  onClick={() => setShowPasswordSection(true)}
                  className="w-full"
                >
                  Change Password
                </Button>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <div className="relative">
                      <Input
                        id="new-password"
                        type={showPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <Input
                      id="confirm-password"
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowPasswordSection(false);
                        setNewPassword("");
                        setConfirmPassword("");
                      }}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleChangePassword}
                      disabled={updating || !newPassword || !confirmPassword}
                      className="flex-1"
                    >
                      {updating ? "Updating..." : "Update Password"}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Share */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Share2 className="h-5 w-5" />
                Share Website
              </CardTitle>
              <CardDescription>Share HomeCare Job BD with others</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" onClick={handleShare} className="w-full">
                <Share2 className="mr-2 h-4 w-4" />
                Share Website
              </Button>
            </CardContent>
          </Card>

          {/* Logout */}
          <Card className="border-destructive/50">
            <CardContent className="pt-6">
              <Button
                variant="destructive"
                onClick={handleLogout}
                disabled={loggingOut}
                className="w-full"
              >
                <LogOut className="mr-2 h-4 w-4" />
                {loggingOut ? "Logging out..." : "Logout"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings;
