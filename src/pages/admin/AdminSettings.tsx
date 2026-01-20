import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const AdminSettings = () => {
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    allow_registrations: true,
    maintenance_mode: false,
  });

  useEffect(() => {
    // এখানে আমরা ফেচ করার লজিক লিখব (যদি ডাটাবেসে সেটিংস টেবিল থাকে)
    // আপাতত লোকাল স্টেটে দেখাচ্ছি
  }, []);

  const handleSave = async () => {
    setLoading(true);
    // Simulating database save
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // আপনি যদি site_settings টেবিল ব্যবহার করতে চান, তবে এখানে upsert কোড বসবে
    // const { error } = await supabase.from('site_settings').upsert(...)
    
    toast.success("Settings saved successfully!");
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-6">Platform Settings</h1>
        <Card>
            <CardHeader>
              <CardTitle>General Configuration</CardTitle>
              <CardDescription>Manage how the platform behaves</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Allow New Registrations</p>
                  <p className="text-sm text-muted-foreground">Toggle user signups</p>
                </div>
                <Switch 
                  checked={settings.allow_registrations} 
                  onCheckedChange={(v) => setSettings({...settings, allow_registrations: v})} 
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Maintenance Mode</p>
                  <p className="text-sm text-muted-foreground">Disable site for non-admins</p>
                </div>
                <Switch 
                  checked={settings.maintenance_mode} 
                  onCheckedChange={(v) => setSettings({...settings, maintenance_mode: v})} 
                />
              </div>
              <Button onClick={handleSave} disabled={loading} className="mt-4">
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AdminSettings;