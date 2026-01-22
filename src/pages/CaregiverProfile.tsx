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
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Loader2, CheckCircle, User, Activity, ShieldCheck, Camera, Star, AlertTriangle } from "lucide-react";

// স্কিল লিস্ট
const SKILLS_LIST = [
  "BP Check", "Diabetes Check", "Insulin Push", "Dementia Care", 
  "Stroke Care", "NG Tube Feeding", "Catheter Care", "Wound Dressing", 
  "Nebulization", "Oxygen Support", "Baby Care", "Elderly Care", 
  "Mobility Support", "Medicine Management", "Cooking", "Night Shift"
];

// ব্যক্তিগত গুণাবলী
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
        if (data.attributes) setSelectedAttributes(data.attributes);
        if (data.gender === 'Female') setAvatarGender('female');
        else setAvatarGender('male');
      }
    }
    setLoading(false);
  };

  const calculateCompletion = () => {
    if (!profile) return;
    let score = 0;
    if (profile.nid_number && profile.nid_front_url) score += 40;
    if (profile.name && profile.phone && profile.role) score += 20;
    if (selectedSkills.length >= 3) score += 10;
    if (selectedAttributes.length >= 2) score += 10;
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
      
      const newProfile = { ...profile, [column]: publicUrl };
      setProfile(newProfile); // সাথে সাথে প্রিভিউ দেখাবে
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
    
    // NID Check (Warning Only)
    const isVerified = profile.nid_number && profile.nid_front_url && profile.nid_back_url;
    
    setSaving(true);
    const updates = { 
        ...profile, 
        skills: selectedSkills,
        attributes: selectedAttributes,
        is_verified: isVerified // ডাটাবেসে ভেরিফাইড স্ট্যাটাস সেভ হবে
    };
    
    const { error } = await supabase.from('profiles').update(updates).eq('id', profile.id);
    
    if (error) {
        toast.error("সেভ করা যায়নি!");
    } else {
        if (!isVerified) {
            toast.warning("প্রোফাইল সেভ হয়েছে, কিন্তু NID না দেওয়ায় ভেরিফাইড হয়নি। আপনি জবে অ্যাপ্লাই করতে পারবেন না।");
        } else {
            toast.success("অভিনন্দন! আপনার প্রোফাইল ১০০% ভেরিফাইড।");
        }
    }
    setSaving(false);
  };

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <Navbar />
      
      {/* Header Progress */}
      <div className="bg-blue-900 pt-6 pb-16 px-4 text-white">
        <div className="container mx-auto max-w-2xl">
            <div className="flex justify-between items-center mb-2">
                <h1 className="text-xl font-bold">প্রোফাইল সেটআপ</h1>
                <Badge className={`${completion >= 90 ? 'bg-green-500' : 'bg-orange-500'} text-black`}>
                    {completion}% Complete
                </Badge>
            </div>
            <div className="w-full bg-blue-800 rounded-full h-2.5 mb-2">
                <div className="bg-green-400 h-2.5 rounded-full transition-all duration-500" style={{ width: `${completion}%` }}></div>
            </div>
            {completion < 90 && <p className="text-xs text-orange-200 flex items-center gap-1"><AlertTriangle className="w-3 h-3"/> NID ভেরিফিকেশন ছাড়া জবে অ্যাপ্লাই করা যাবে না</p>}
        </div>
      </div>

      <main className="container mx-auto px-4 -mt-10 max-w-2xl space-y-6">
        
        {/* === SECTION 1: PERSONAL INFO === */}
        <Card className="shadow-lg border-t-4 border-t-blue-600">
            <CardHeader><CardTitle className="flex items-center gap-2 text-blue-800"><User className="w-5 h-5"/> ব্যক্তিগত তথ্য</CardTitle></CardHeader>
            <CardContent className="space-y-5">
                
                {/* Gender & Role */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label>লিঙ্গ (Gender) *</Label>
                        <Select value={profile?.gender} onValueChange={(val) => {
                            setProfile({...profile, gender: val});
                            setAvatarGender(val === 'Female' ? 'female' : 'male');
                            // মেয়ে হলে ডিফল্ট ফিমেল অবতার সেট হবে
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

                {/* Avatar Selection (Instant Update) */}
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-center">
                    <Label className="mb-3 block text-sm font-bold text-blue-900">প্রোফাইল ছবি সিলেক্ট করুন</Label>
                    
                    {/* Selected Large Preview */}
                    <div className="flex justify-center mb-4">
                        <img 
                            src={profile?.avatar_url || AVATARS[avatarGender][0]} 
                            alt="Selected Profile" 
                            className="w-24 h-24 rounded-full border-4 border-white shadow-md object-cover"
                        />
                    </div>

                    <div className="flex justify-center gap-3 overflow-x-auto py-2">
                        {AVATARS[avatarGender].map((url, i) => (
                            <img key={i} src={url} alt="avatar" onClick={() => setProfile({...profile, avatar_url: url})}
                                className={`w-12 h-12 rounded-full cursor-pointer border-2 transition-all ${profile.avatar_url === url ? 'border-green-600 scale-110 ring-2 ring-green-200' : 'border-transparent opacity-60 hover:opacity-100'}`}
                            />
                        ))}
                    </div>
                    
                    {profile?.gender === 'Male' && (
                        <div className="mt-3">
                            <p className="text-xs text-gray-400 mb-1">অথবা নিজের ছবি দিন</p>
                            <Input className="bg-white h-8 text-xs" type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'avatar_url', 'avatars-public')} />
                        </div>
                    )}
                </div>

                <div className="space-y-1"><Label>পুরো নাম</Label><Input value={profile?.name || ''} onChange={e => setProfile({...profile, name: e.target.value})} /></div>
                
                <div className="space-y-1">
                    <Label>নিজের সম্পর্কে (Bio)</Label>
                    <Textarea className="h-20" placeholder="আমি একজন অভিজ্ঞ কেয়ারগিভার..." value={profile?.bio || ''} onChange={e => setProfile({...profile, bio: e.target.value})} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div><Label>মোবাইল</Label><Input value={profile?.phone || ''} onChange={e => setProfile({...profile, phone: e.target.value})} /></div>
                    <div><Label>বর্তমান ঠিকানা</Label><Input value={profile?.location || ''} onChange={e => setProfile({...profile, location: e.target.value})} /></div>
                </div>
            </CardContent>
        </Card>

        {/* === SECTION 2: SKILLS & ATTRIBUTES === */}
        <Card className="shadow-lg">
            <CardHeader><CardTitle className="flex items-center gap-2 text-green-700"><Activity className="w-5 h-5"/> দক্ষতা ও গুণাবলী</CardTitle></CardHeader>
            <CardContent className="space-y-6">
                <div>
                    <Label className="mb-2 block text-gray-600">কাজের দক্ষতা (Skills)</Label>
                    <div className="flex flex-wrap gap-2">
                        {SKILLS_LIST.map((skill) => (
                            <Badge key={skill} variant={selectedSkills.includes(skill) ? "default" : "outline"}
                                className={`cursor-pointer px-3 py-2 ${selectedSkills.includes(skill) ? 'bg-green-600 hover:bg-green-700' : 'hover:bg-gray-100'}`}
                                onClick={() => toggleSelection(selectedSkills, setSelectedSkills, skill)}
                            >
                                {selectedSkills.includes(skill) && <CheckCircle className="w-3 h-3 mr-1 inline"/>}{skill}
                            </Badge>
                        ))}
                    </div>
                </div>

                <div>
                    <Label className="mb-2 block text-gray-600">ব্যক্তিগত গুণাবলী (Attributes)</Label>
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
                </div>
            </CardContent>
        </Card>

        {/* === SECTION 3: PHYSICAL INFO === */}
        <Card className="shadow-lg">
             <CardHeader><CardTitle className="flex items-center gap-2 text-gray-700"><User className="w-5 h-5"/> শারীরিক তথ্য</CardTitle></CardHeader>
            <CardContent className="space-y-4">
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

        {/* === SECTION 4: VERIFICATION (IMPORTANT) === */}
        <Card className="border-red-200 bg-red-50/30 shadow-lg">
            <CardHeader><CardTitle className="flex items-center gap-2 text-red-600"><ShieldCheck className="w-5 h-5"/> ভেরিফিকেশন ও ডকুমেন্টস</CardTitle></CardHeader>
            <CardContent className="space-y-6">
                
                {/* NID Section */}
                <div className="space-y-4 bg-white p-4 rounded-xl border border-red-100 shadow-sm">
                    <div className="flex justify-between items-center">
                        <Label className="font-bold text-red-700">১. জাতীয় পরিচয়পত্র (NID)</Label>
                        {!profile?.nid_number && <Badge variant="outline" className="text-red-500 border-red-200">Not Verified</Badge>}
                        {profile?.nid_number && <Badge className="bg-green-600">Uploaded</Badge>}
                    </div>
                    
                    <Input placeholder="NID নাম্বার (জবে অ্যাপ্লাই করতে লাগবে)" value={profile?.nid_number || ''} onChange={e => setProfile({...profile, nid_number: e.target.value})} />
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                            <Label className="text-xs mb-1 block">সামনের ছবি</Label>
                            <div className="border-2 border-dashed border-gray-300 p-2 rounded-lg bg-gray-50 relative h-24 flex items-center justify-center cursor-pointer hover:bg-gray-100 transition">
                                <Camera className={`w-6 h-6 ${profile?.nid_front_url ? 'text-green-600' : 'text-gray-400'}`}/>
                                <span className="absolute bottom-1 text-[10px] text-gray-500">{profile?.nid_front_url ? "Changed" : "Upload"}</span>
                                <input type="file" accept="image/*" capture="environment" className="absolute inset-0 opacity-0 w-full h-full cursor-pointer" onChange={(e) => handleFileUpload(e, 'nid_front_url')} />
                            </div>
                        </div>
                        <div className="text-center">
                            <Label className="text-xs mb-1 block">পেছনের ছবি</Label>
                            <div className="border-2 border-dashed border-gray-300 p-2 rounded-lg bg-gray-50 relative h-24 flex items-center justify-center cursor-pointer hover:bg-gray-100 transition">
                                <Camera className={`w-6 h-6 ${profile?.nid_back_url ? 'text-green-600' : 'text-gray-400'}`}/>
                                <span className="absolute bottom-1 text-[10px] text-gray-500">{profile?.nid_back_url ? "Changed" : "Upload"}</span>
                                <input type="file" accept="image/*" capture="environment" className="absolute inset-0 opacity-0 w-full h-full cursor-pointer" onChange={(e) => handleFileUpload(e, 'nid_back_url')} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* CV Section */}
                <div className="bg-white p-4 rounded-xl border border-gray-200">
                    <Label className="font-bold block mb-2">২. সিভি (CV) <span className="text-red-500">*</span></Label>
                    <Input type="file" accept=".pdf,.doc" onChange={(e) => handleFileUpload(e, 'cv_url', 'cvs')} />
                    <p className="text-xs text-gray-500 mt-1">ইন্টারভিউ কল পাওয়ার জন্য সিভি জরুরি।</p>
                </div>

                {/* Certificate Section */}
                <div className="bg-white p-4 rounded-xl border border-gray-200">
                    <Label className="font-bold block mb-2">৩. সার্টিফিকেট (Optional)</Label>
                    <Input type="file" accept="image/*,.pdf" onChange={(e) => handleFileUpload(e, 'certificate_url')} />
                    
                    <div className="mt-3 bg-yellow-50 p-3 rounded border border-yellow-200">
                        <p className="text-xs text-yellow-800 mb-2 font-semibold">সার্টিফিকেট নেই?</p>
                        <Button variant="outline" size="sm" onClick={() => navigate('/training')} className="w-full border-yellow-600 text-yellow-700 h-8 text-xs hover:bg-yellow-100">
                            RPL ট্রেনিং নিয়ে সার্টিফিকেট নিন
                        </Button>
                    </div>
                </div>

            </CardContent>
        </Card>

        {/* Declaration & Save */}
        <div className="bg-white p-4 rounded-xl shadow-lg border sticky bottom-4 z-50">
            <div className="flex items-start space-x-2 mb-4">
                <Checkbox id="terms" checked={declaration} onCheckedChange={(c) => setDeclaration(c as boolean)} className="mt-1" />
                <label htmlFor="terms" className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-700">
                    আমি শপথ করছি যে, প্রোফাইলে দেওয়া সকল তথ্য ১০০% সত্য। আমি জানি যে <span className="text-red-600 font-bold">NID ভেরিফিকেশন ছাড়া আমি কোনো জবে অ্যাপ্লাই করতে পারব না।</span>
                </label>
            </div>
            
            <Button onClick={handleSave} disabled={saving || !declaration} className="w-full h-12 text-lg font-bold bg-blue-900 hover:bg-blue-800 rounded-lg shadow-xl">
                {saving ? <Loader2 className="animate-spin mr-2"/> : "Save Profile"}
            </Button>
        </div>

      </main>
    </div>
  );
};

export default CaregiverProfile;