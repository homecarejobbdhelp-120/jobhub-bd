import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, CheckCircle, User, Activity, ShieldCheck } from "lucide-react";

// ✅ আপনার সুপাবেজ থেকে নেওয়া আসল অবতার লিংক
const AVATARS = {
  male: [
    "https://mnkaokfilxfisizotink.supabase.co/storage/v1/object/public/avatars-public/male-1.png",
    "https://mnkaokfilxfisizotink.supabase.co/storage/v1/object/public/avatars-public/male-2.png",
    "https://mnkaokfilxfisizotink.supabase.co/storage/v1/object/public/avatars-public/male-3.png",
    "https://mnkaokfilxfisizotink.supabase.co/storage/v1/object/public/avatars-public/male-4.png",
    "https://mnkaokfilxfisizotink.supabase.co/storage/v1/object/public/avatars-public/male-5.png",
  ],
  female: [
    "https://mnkaokfilxfisizotink.supabase.co/storage/v1/object/public/avatars-public/female-1.png",
    "https://mnkaokfilxfisizotink.supabase.co/storage/v1/object/public/avatars-public/female-2.png",
    "https://mnkaokfilxfisizotink.supabase.co/storage/v1/object/public/avatars-public/female-3.png",
    "https://mnkaokfilxfisizotink.supabase.co/storage/v1/object/public/avatars-public/female-4.png",
    "https://mnkaokfilxfisizotink.supabase.co/storage/v1/object/public/avatars-public/female-5.png",
  ]
};

const CaregiverProfile = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [avatarGender, setAvatarGender] = useState<'male' | 'female'>('male');

  useEffect(() => {
    getProfile();
  }, []);

  const getProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      setProfile(data);
      if (data.gender === 'Female') setAvatarGender('female');
    }
    setLoading(false);
  };

  const handleFileUpload = async (event: any, column: string) => {
    try {
      setSaving(true);
      const file = event.target.files[0];
      if (!file) return;

      const fileExt = file.name.split('.').pop();
      const fileName = `${profile.id}/${Math.random()}.${fileExt}`;
      
      const { error } = await supabase.storage.from('verification_docs').upload(fileName, file);
      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage.from('verification_docs').getPublicUrl(fileName);
      
      await supabase.from('profiles').update({ [column]: publicUrl }).eq('id', profile.id);
      setProfile({ ...profile, [column]: publicUrl });
      toast.success("ফাইল আপলোড সফল হয়েছে!");
    } catch (error) {
      toast.error("আপলোড ব্যর্থ হয়েছে");
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase.from('profiles').update(profile).eq('id', profile.id);
    if (error) toast.error("সেভ করা যায়নি!");
    else toast.success("প্রোফাইল আপডেট হয়েছে!");
    setSaving(false);
  };

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Navbar />
      
      {/* Header Banner */}
      <div className="bg-blue-600 pt-8 pb-16 px-4">
        <div className="container mx-auto max-w-2xl text-white">
            <h1 className="text-2xl font-bold">Edit Profile</h1>
            <p className="opacity-90">Complete your profile to get better jobs</p>
        </div>
      </div>

      <main className="container mx-auto px-4 -mt-10 max-w-2xl">
        <Tabs defaultValue="details" className="w-full">
          
          <TabsList className="grid w-full grid-cols-3 mb-4 h-12 shadow-md bg-white rounded-xl">
            <TabsTrigger value="details" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600">Details</TabsTrigger>
            <TabsTrigger value="physical" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600">Physical Info</TabsTrigger>
            <TabsTrigger value="verification" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600">Verification</TabsTrigger>
          </TabsList>

          {/* === TAB 1: BASIC DETAILS === */}
          <TabsContent value="details" className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle className