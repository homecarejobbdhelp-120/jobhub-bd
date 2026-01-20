import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { User, MapPin, Phone } from "lucide-react";

const CaregiverProfile = () => {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    getProfile();
  }, []);

  const getProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      setProfile(data);
    }
    setLoading(false);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase
      .from('profiles')
      .update({
        name: profile.name,
        phone: profile.phone,
        location: profile.location,
        role: profile.role // রোল আপডেট হবে
      })
      .eq('id', profile.id);

    if (error) toast.error("Update failed");
    else toast.success("Profile updated!");
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Navbar />
      <main className="container mx-auto px-4 py-8 max-w-md">
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-green-600"/> Edit Profile
                </CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleUpdate} className="space-y-4">
                    <div>
                        <Label>Name</Label>
                        <Input value={profile?.name || ''} onChange={e => setProfile({...profile, name: e.target.value})} />
                    </div>
                    <div>
                        <Label>Designation (Your Role)</Label>
                        <Select 
                          value={profile?.role === 'employer' ? 'caregiver' : profile?.role} 
                          onValueChange={(val) => setProfile({...profile, role: val})}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select Role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="caregiver">Caregiver (কেয়ারগিভার)</SelectItem>
                            <SelectItem value="nurse">Nurse (নার্স)</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-gray-500">This helps companies identify you.</p>
                    </div>
                    <div>
                        <Label>Phone</Label>
                        <Input value={profile?.phone || ''} onChange={e => setProfile({...profile, phone: e.target.value})} />
                    </div>
                    <div>
                        <Label>Location</Label>
                        <Input value={profile?.location || ''} onChange={e => setProfile({...profile, location: e.target.value})} />
                    </div>
                    <Button type="submit" className="w-full bg-green-600">Save Changes</Button>
                </form>
            </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default CaregiverProfile;