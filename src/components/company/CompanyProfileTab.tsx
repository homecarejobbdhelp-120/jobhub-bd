import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Building2, Mail, Phone, MapPin, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Profile {
  company_name: string;
  email: string;
  phone: string;
  location: string;
}

const CompanyProfileTab = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile>({
    company_name: "",
    email: "",
    phone: "",
    location: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;

      if (data) {
        setProfile({
          company_name: data.company_name || "",
          email: data.email || "",
          phone: data.phone || "",
          location: data.location || "",
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("profiles")
        .update({
          company_name: profile.company_name,
          phone: profile.phone,
          location: profile.location,
        })
        .eq("id", user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="pb-20">
      <Card className="mb-4">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Building2 className="h-8 w-8 text-primary" />
            </div>
            <div>
              <CardTitle>{profile.company_name || "Company Name"}</CardTitle>
              <CardDescription>Employer Account</CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="text-lg">Company Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="company_name">Company Name</Label>
            <div className="relative">
              <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="company_name"
                value={profile.company_name}
                onChange={(e) => setProfile({ ...profile, company_name: e.target.value })}
                className="pl-9"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                value={profile.email}
                disabled
                className="pl-9 bg-muted"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="phone"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                className="pl-9"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="location"
                value={profile.location}
                onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                className="pl-9"
              />
            </div>
          </div>

          <Button 
            onClick={handleSave} 
            disabled={saving}
            className="w-full"
          >
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </CardContent>
      </Card>

      <Button 
        variant="outline" 
        className="w-full"
        onClick={handleLogout}
      >
        <LogOut className="mr-2 h-4 w-4" />
        Logout
      </Button>
    </div>
  );
};

export default CompanyProfileTab;
