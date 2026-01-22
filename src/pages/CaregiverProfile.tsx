import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Loader2, CheckCircle, User, Activity, ShieldCheck, Camera, FileText, Stethoscope, Star } from "lucide-react";

// স্কিল লিস্ট
const SKILLS_LIST = [
  "BP Check", "Diabetes Check", "Insulin Push", "Dementia Care", 
  "Stroke Care", "NG Tube Feeding", "Catheter Care", "Wound Dressing", 
  "Nebulization", "Oxygen Support", "Baby Care", "Elderly Care", 
  "Mobility Support", "Medicine Management", "Cooking", "Night Shift"
];

// ব্যক্তিগত গুণাবলী (Attributes)
const ATTRIBUTES_LIST = [
  "Namaji (নামাজি)", "Non-Smoker (ধূমপান মুক্ত)", "Punctual (সময়ানুবর্তী)", 
  "Honest (সৎ)", "Hardworking (পরিশ্রমী)", "Polite (ভদ্র)", 
  "Clean (পরিষ্কার-পরিচ্ছন্ন)", "Calm (শান্ত স্বভাব)", "Religious (ধার্মিক)", "Trustworthy (বিশ্বস্ত)"
];

const AVATARS = {
  male: ["https://mnkaokfilxfisizotink.supabase.co/storage/v1/object/public/avatars-public/male-1.png", "https://mnkaokfilxfisizotink.supabase.co/storage/v1/object/public/avatars-public/male-2.png", "https://mnkaokfilxfisizotink.supabase.co/storage/v1/object/public/avatars-public/male-3.png"],
  female: ["https://mnkaokfilxfisizotink.supabase.co/storage/v1/object/public/avatars-public/female-1.png", "https://mnkaokfilxfisizotink.supabase.co/storage/v1/object/public/avatars-public/female-2.png", "https://mnkaokfilxfisizotink.supabase.co/storage/v1/object/public/avatars-public/female-3.png"]
};

const CaregiverProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [avatarGender, setAvatarGender] = useState<'male' | 'female'>('male');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedAttributes, setSelectedAttributes] = useState<string[]>([]);
  const [completion, setCompletion] = useState(0);
  const [declaration, setDeclaration] = useState(false);

  useEffect(() => {
    getProfile();
  }, []);

  useEffect(() => {
    calculateCompletion();
  }, [profile, selectedSkills, selectedAttributes]);

  const getProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (data) {
        setProfile(data);
        if (data.skills) setSelectedSkills(data.skills);
        if (data.attributes) setSelectedAttributes(data.attributes); // নতুস ফিল্ড
        if (data.gender === 'Female') setAvatarGender('female');
        else setAvatarGender('male');
      }
    }
    setLoading(false);
  };

  // প্রোফাইল কমপ্লিশন লজিক
  const calculateCompletion = () => {
    if (!profile) return;
    let score = 0;
    
    // NID হলো মেইন (৪০%)
    if (profile.nid_number && profile.nid_front_url && profile.nid_back_url) score += 40;
    
    // বেসিক তথ্য (২০%)
    if (profile.name && profile.phone && profile.role && profile.gender) score += 20;
    
    // স্কিলস ও গুণাবলী (২০%)
    if (selectedSkills.length >= 3) score += 10;
    if (selectedAttributes.length >= 2) score += 10;
    
    // সিভি ও অভিজ্ঞতা (২০%)
    if (profile.cv_url) score += 10;
    if (profile.experience_desc) score += 10;

    setCompletion(score);
  };

  const handleFileUpload = async (event: any, column: string, bucket: string = 'verification_docs') => {
    try {
      setSaving(true);
      const file = event.target.files[0];
      if (!file) return;

      const fileExt = file.name.split('.').pop();
      const fileName = `${profile.id}/${Math.random()}.${fileExt}`;
      const { error } = await supabase.storage.from(bucket).upload(fileName, file);
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(fileName);
      
      setProfile({ ...profile, [column]: publicUrl });
      await supabase.from('profiles').update({ [column]: publicUrl }).eq('id', profile.id);
      toast.success("আপলোড সফল হয়েছে!");
    } catch (error) {
      toast.error("আপলোড ব্যর্থ হয়েছে");
    } finally {
      setSaving(false);
    }
  };

  const toggleSelection = (list: string[], setList: any, item: string) => {
    if (list.includes(item)) setList(list.filter(i => i !== item));
    else setList([...list, item]);
  };

  const handleSave = async () => {
    if (!declaration) {
        toast.error("অনুগ্রহ করে শপথ বক্সে টিক দিন!");
        return;
    }
    if (!profile.nid_number || !profile.nid_front_url) {
        toast.error("NID তথ্য দেওয়া বাধ্যতামূলক!");
        return;
    }
    if (!profile.cv_url) {
        toast.error("CV আপলোড করা বাধ্যতামূলক!");
        return;
    }

    setSaving(true);
    const updates = { 
        ...profile, 
        skills: selectedSkills,
        attributes: selectedAttributes 
    };
    
    const { error } = await supabase.from('profiles').update(updates).eq('id', profile.id);
    if (error) toast.error("সেভ করা যায়নি!");
    else toast.success("প্রোফাইল আপডেট হয়েছে!");
    setSaving(false);
  };

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <Navbar />
      
      {/* Header with Progress Bar */}
      <div className="bg-blue-900 pt-6 pb-16 px-4 text-white">
        <div className="container mx-auto max-w-2xl">
            <div className="flex justify-between items-center mb-2">
                <h1 className="text-xl font-bold">প্রোফাইল সেটআপ</h1>
                <Badge className={`${completion === 100 ? 'bg-green-500' : 'bg-yellow-500'} text-black`}>
                    {completion}% Complete
                </Badge>
            </div>
            {/* Progress Bar */}
            <div className="w-full bg-blue-800 rounded-full h-2.5 mb-2">
                <div className="bg-green-400 h-2.5 rounded-full transition-all duration-500" style={{ width: `${completion}%` }}></div>
            </div>
            <p className="text-xs opacity-80">{completion < 100 ? "NID এবং সব তথ্য দিলে ১০০% হবে" : "চমৎকার! আপনার প্রোফাইল ১০০% সম্পূর্ণ"}</p>
        </div>
      </div>

      <main className="container mx-auto px-4 -mt-10 max-w-2xl">
        <Tabs defaultValue="details" className="w-full">
          
          <TabsList className="grid w-full grid-cols-4 mb-4 h-12 shadow bg-white rounded-xl p-1">
            <TabsTrigger value="details" className="text-xs">ব্যক্তিগত</TabsTrigger>
            <TabsTrigger value="skills" className="text-xs">দক্ষতা</TabsTrigger>
            <TabsTrigger value="physical" className="text-xs">শারীরিক</TabsTrigger>
            <TabsTrigger value="verification" className="text-xs font-bold text-red-600">NID*</TabsTrigger>
          </TabsList>

          {/* === TAB 1: PERSONAL === */}
          <TabsContent value="details">
            <Card>
                <CardHeader><CardTitle className="flex items-center gap-2 text-blue-800"><User className="w-5 h-5"/> ব্যক্তিগত তথ্য</CardTitle></CardHeader>
                <CardContent className="space-y-5">
                    
                    {/* Gender & Avatar */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>লিঙ্গ (Gender) *</Label>
                            <Select value={profile?.gender} onValueChange={(val) => {
                                setProfile({...profile, gender: val});
                                setAvatarGender(val === 'Female' ? 'female' : 'male');
                                if(val === 'Female' && !profile.avatar_url?.includes('avatars-public')) {
                                    setProfile(prev => ({...prev, avatar_url: AVATARS.female[0]}));
                                }
                            }}>
                                <SelectTrigger><SelectValue placeholder="সিলেক্ট" /></SelectTrigger>
                                <SelectContent><SelectItem value="Male">পুরুষ</SelectItem><SelectItem value="Female">মহিলা</SelectItem></SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>পেশা (Role)</Label>
                            <Select value={profile?.role} onValueChange={(val) => setProfile({...profile, role: val})}>
                                <SelectTrigger><SelectValue placeholder="সিলেক্ট" /></SelectTrigger>
                                <SelectContent><SelectItem value="caregiver">Caregiver</SelectItem><SelectItem value="nurse">Nurse</SelectItem></SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Avatar Selection */}
                    <div className="bg-blue-50 p-3 rounded border border-blue-100">
                        <Label className="mb-2 block text-xs font-bold text-blue-900">প্রোফাইল ছবি</Label>
                        {profile?.gender === 'Male' && (
                           <Input className="mb-2 bg-white" type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'avatar_url', 'avatars-public')} />
                        )}
                        <div className="flex gap-3 overflow-x-auto">
                            {AVATARS[avatarGender].map((url, i) => (
                                <img key={i} src={url} alt="avatar" onClick={() => setProfile({...profile, avatar_url: url})}
                                    className={`w-12 h-12 rounded-full cursor-pointer border-2 ${profile.avatar_url === url ? 'border-green-600 scale-110' : 'border-transparent opacity-60'}`}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="space-y-1"><Label>পুরো নাম</Label><Input value={profile?.name || ''} onChange={e => setProfile({...profile, name: e.target.value})} /></div>
                    
                    {/* Experience Box (New) */}
                    <div className="space-y-1">
                        <Label className="flex justify-between">কাজের অভিজ্ঞতা (Experience) <span className="text-gray-400 text-xs">Optional</span></Label>
                        <Textarea 
                            className="h-24" 
                            placeholder="আপনার কাজের অভিজ্ঞতা সম্পর্কে লিখুন... (যেমন: আমি ৩ বছর ধরে ডায়াবেটিস রোগীর সেবা করছি)" 
                            value={profile?.experience_desc || ''} 
                            onChange={e => setProfile({...profile, experience_desc: e.target.value})} 
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div><Label>মোবাইল</Label><Input value={profile?.phone || ''} onChange={e => setProfile({...profile, phone: e.target.value})} /></div>
                        <div><Label>ঠিকানা</Label><Input value={profile?.location || ''} onChange={e => setProfile({...profile, location: e.target.value})} /></div>
                    </div>
                </CardContent>
            </Card>
          </TabsContent>

          {/* === TAB 2: SKILLS & ATTRIBUTES (UPDATED) === */}
          <TabsContent value="skills" className="space-y-4">
            <Card>
                <CardHeader><CardTitle className="flex items-center gap-2 text-blue-800"><Stethoscope className="w-5 h-5"/> কাজের দক্ষতা (Skills)</CardTitle></CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-2">
                        {SKILLS_LIST.map((skill) => (
                            <Badge key={skill} variant={selectedSkills.includes(skill) ? "default" : "outline"}
                                className={`cursor-pointer px-3 py-2 ${selectedSkills.includes(skill) ? 'bg-green-600' : 'hover:bg-gray-100'}`}
                                onClick={() => toggleSelection(selectedSkills, setSelectedSkills, skill)}
                            >
                                {selectedSkills.includes(skill) && <CheckCircle className="w-3 h-3 mr-1 inline"/>}{skill}
                            </Badge>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* New Attributes Section */}
            <Card>
                <CardHeader><CardTitle className="flex items-center gap-2 text-purple-800"><Star className="w-5 h-5"/> ব্যক্তিগত গুণাবলী (Attributes)</CardTitle></CardHeader>
                <CardContent>
                    <p className="text-xs text-gray-500 mb-3">আপনার মধ্যে যে গুণগুলো আছে, সেগুলো সিলেক্ট করুন (ভিজিটররা এটি দেখবে):</p>
                    <div className="flex flex-wrap gap-2">
                        {ATTRIBUTES_LIST.map((attr) => (
                            <Badge key={attr} variant="outline"
                                className={`cursor-pointer px-3 py-2 border-purple-200 ${selectedAttributes.includes(attr) ? 'bg-purple-100 text-purple-800 border-purple-500 font-bold' : 'text-gray-600 hover:bg-gray-50'}`}
                                onClick={() => toggleSelection(selectedAttributes, setSelectedAttributes, attr)}
                            >
                                {selectedAttributes.includes(attr) ? "✅ " : "+ "}{attr}
                            </Badge>
                        ))}
                    </div>
                </CardContent>
            </Card>
          </TabsContent>

          {/* === TAB 3: PHYSICAL === */}
          <TabsContent value="physical">
            <Card>
                <CardContent className="space-y-4 pt-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div><Label>বয়স</Label><Input type="number" value={profile?.age || ''} onChange={e => setProfile({...profile, age: e.target.value})} /></div>
                        <div><Label>বৈবাহিক অবস্থা</Label>
                            <Select value={profile?.marital_status} onValueChange={(val) => setProfile({...profile, marital_status: val})}>
                                <SelectTrigger><SelectValue placeholder="সিলেক্ট" /></SelectTrigger>
                                <SelectContent><SelectItem value="Single">অবিবাহিত</SelectItem><SelectItem value="Married">বিবাহিত</SelectItem></SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><Label>উচ্চতা (ফুট)</Label><Input placeholder="5.6" value={profile?.height_ft || ''} onChange={e => setProfile({...profile, height_ft: e.target.value})} /></div>
                        <div><Label>ওজন (কেজি)</Label><Input placeholder="62" value={profile?.weight_kg || ''} onChange={e => setProfile({...profile, weight_kg: e.target.value})} /></div>
                    </div>
                </CardContent>
            </Card>
          </TabsContent>

          {/* === TAB 4: VERIFICATION === */}
          <TabsContent value="verification">
            <Card className="border-red-200 bg-red-50/50">
                <CardHeader><CardTitle className="flex items-center gap-2 text-red-600"><ShieldCheck className="w-5 h-5"/> ভেরিফিকেশন (বাধ্যতামূলক)</CardTitle></CardHeader>
                <CardContent className="space-y-6">
                    
                    {/* NID Section (Unchanged UI) */}
                    <div className="space-y-4 bg-white p-4 rounded-xl border border-red-100 shadow-sm">
                        <Label className="font-bold text-red-700">১. জাতীয় পরিচয়পত্র (NID) *</Label>
                        <Input placeholder="NID নাম্বার" value={profile?.nid_number || ''} onChange={e => setProfile({...profile, nid_number: e.target.value})} />
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div className="text-center">
                                <Label className="text-xs mb-1 block">সামনের ছবি</Label>
                                <div className="border-2 border-dashed border-gray-300 p-2 rounded-lg bg-gray-50 relative h-24 flex items-center justify-center">
                                    <Camera className={`w-6 h-6 ${profile?.nid_front_url ? 'text-green-600' : 'text-gray-400'}`}/>
                                    <input type="file" accept="image/*" capture="environment" className="absolute inset-0 opacity-0 w-full h-full" onChange={(e) => handleFileUpload(e, 'nid_front_url')} />
                                </div>
                            </div>
                            <div className="text-center">
                                <Label className="text-xs mb-1 block">পেছনের ছবি</Label>
                                <div className="border-2 border-dashed border-gray-300 p-2 rounded-lg bg-gray-50 relative h-24 flex items-center justify-center">
                                    <Camera className={`w-6 h-6 ${profile?.nid_back_url ? 'text-green-600' : 'text-gray-400'}`}/>
                                    <input type="file" accept="image/*" capture="environment" className="absolute inset-0 opacity-0 w-full h-full" onChange={(e) => handleFileUpload(e, 'nid_back_url')} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* CV Section */}
                    <div className="bg-white p-4 rounded-xl border border-gray-200">
                        <Label className="font-bold block mb-2">২. সিভি (CV) *</Label>
                        <Input type="file" accept=".pdf,.doc" onChange={(e) => handleFileUpload(e, 'cv_url', 'cvs')} />
                    </div>

                    {/* Certificate Section (No 'Optional' text, but logic optional) */}
                    <div className="bg-white p-4 rounded-xl border border-gray-200">
                        <Label className="font-bold block mb-2">৩. সার্টিফিকেট / ট্রেনিং ডকুমেন্টস</Label>
                        <Input type="file" accept="image/*,.pdf" onChange={(e) => handleFileUpload(e, 'certificate_url')} />
                        
                        {/* RPL Button */}
                        <div className="mt-3 bg-yellow-50 p-3 rounded border border-yellow-200">
                            <p className="text-xs text-yellow-800 mb-2 font-semibold">সার্টিফিকেট নেই?</p>
                            <Button variant="outline" size="sm" onClick={() => navigate('/training')} className="w-full border-yellow-600 text-yellow-700 h-8 text-xs">
                                ৩ দিনের RPL ট্রেনিং নিয়ে সার্টিফিকেট নিন
                            </Button>
                        </div>
                    </div>

                </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Declaration & Save */}
        <div className="mt-8 bg-white p-4 rounded-xl shadow-lg border sticky bottom-4 z-50">
            <div className="flex items-center space-x-2 mb-4">
                <Checkbox id="terms" checked={declaration} onCheckedChange={(c) => setDeclaration(c as boolean)} />
                <label htmlFor="terms" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-700">
                    আমি শপথ করছি যে, প্রোফাইলে দেওয়া সকল তথ্য ১০০% সত্য এবং সঠিক।
                </label>
            </div>
            
            <Button onClick={handleSave} disabled={saving || !declaration} className="w-full h-12 text-lg font-bold bg-blue-900 hover:bg-blue-800 rounded-lg">
                {saving ? <Loader2 className="animate-spin mr-2"/> : "Save & Complete Profile"}
            </Button>
        </div>

      </main>
    </div>
  );
};

export default CaregiverProfile;