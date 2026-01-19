import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Download, Edit2, Save, Upload, ShieldCheck, Briefcase, User, FileText, BadgeCheck, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// আপনার সুপাবেজ প্রজেক্টের URL
const PROJECT_URL = "https://lcjjjnrzlqiewuwravkw.supabase.co"; 

const CARE_SKILLS = [
  "BP Check", "Diabetes/Insulin", "NG Tube", "Catheter Care", 
  "Wound Dressing", "Baby Care", "Elderly Care", "Physiotherapy", 
  "Stroke Patient Care", "Dementia Care", "Oxygen Cylinder", "Nebulizer"
];

const Profile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [completion, setCompletion] = useState(0);

  // Profile Data
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    current_address: "",
    permanent_address: "",
    gender: "male",
    avatar_url: "",
    bio: "",
    expected_salary: "",
    preferred_shift: "Any",
    height: "",
    weight: "",
    age: "",
    skills: [] as string[],
    nid_number: "",
    verified: false,
    verification_status: "",
    role: "",
    cv_url: "",
    certificate_url: ""
  });

  // Files
  const [nidFront, setNidFront] = useState<File | null>(null);
  const [nidBack, setNidBack] = useState<File | null>(null);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [certFile, setCertFile] = useState<File | null>(null);

  useEffect(() => {
    fetchData();
  }, [id]);

  useEffect(() => {
    let score = 0;
    if (formData.name) score += 10;
    if (formData.phone) score += 10;
    if (formData.bio) score += 10;
    if (formData.skills.length > 0) score += 10;
    if (formData.current_address) score += 10;
    if (formData.permanent_address) score += 10;
    if (formData.expected_salary) score += 10;
    if (formData.cv_url) score += 10;
    if (formData.nid_number) score += 10;
    if (formData.verified) score += 10;
    setCompletion(score);
  }, [formData]);

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUser(user);

    const { data } = await supabase.from("profiles").select("*").eq("id", id).single();

    if (data) {
      setFormData({
        name: data.name || "",
        phone: data.phone || "",
        current_address: data.current_address || "",
        permanent_address: data.permanent_address || "",
        gender: data.gender || "male",
        avatar_url: data.avatar_url || "",
        bio: data.bio || "",
        expected_salary: data.expected_salary || "",
        preferred_shift: data.preferred_shift || "Any",
        height: data.height || "",
        weight: data.weight || "",
        age: data.age || "",
        skills: data.skills || [],
        nid_number: data.nid_number || "",
        verified: data.verified || false,
        verification_status: data.verification_status || "unverified",
        role: data.role || "caregiver",
        cv_url: data.cv_url || "",
        certificate_url: data.certificate_url || ""
      });
    }
    setLoading(false);
  };

  const isOwner = currentUser?.id === id;

  const handleSave = async () => {
    setSaving(true);
    try {
      let updates: any = { ...formData };
      
      // Upload CV
      if (cvFile) {
        const cvName = `${id}_cv_${Date.now()}.pdf`;
        const { data } = await supabase.storage.from('verification_docs').upload(cvName, cvFile);
        if (data) updates.cv_url = data.path;
      }

      // Upload Certificate
      if (certFile) {
        const certName = `${id}_cert_${Date.now()}`;
        const { data } = await supabase.storage.from('verification_docs').upload(certName, certFile);
        if (data) updates.certificate_url = data.path;
      }

      // Upload NID
      if (nidFront && nidBack && formData.nid_number) {
          const fName = `${id}_front_${Date.now()}`;
          const bName = `${id}_back_${Date.now()}`;
          const { data: fData } = await supabase.storage.from('verification_docs').upload(fName, nidFront);
          const { data: bData } = await supabase.storage.from('verification_docs').upload(bName, nidBack);
          
          if (fData) updates.nid_front_url = fData.path;
          if (bData) updates.nid_back_url = bData.path;
          updates.verification_status = 'pending';
      }

      const { error } = await supabase.from("profiles").update(updates).eq("id", id);
      if (error) throw error;
      
      toast({ title: "Profile Updated!", className: "bg-emerald-600 text-white" });
      setIsEditing(false);
      
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  // Generate Supabase Avatar URLs
  const getAvatars = (gender: string) => {
    return Array.from({ length: 5 }, (_, i) => 
      `${PROJECT_URL}/storage/v1/object/public/Avatars/${gender}-${i + 1}.png`
    );
  };

  const currentAvatars = getAvatars(formData.gender);
  const showBlueBadge = formData.verified && completion === 100;

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-24">
      <Navbar />

      {/* --- HEADER --- */}
      <div className="bg-[#1e40af] pt-12 pb-24 px-4 shadow-xl relative overflow-hidden">
        <div className="container mx-auto max-w-3xl text-center relative z-10">
            <div className="relative inline-block mb-4">
                <Avatar className="h-32 w-32 md:h-40 md:w-40 border-4 border-white/30 rounded-full shadow-2xl bg-white">
                    <AvatarImage src={formData.avatar_url} className="object-cover" />
                    <AvatarFallback className="text-4xl font-bold text-blue-800">{formData.name?.[0]}</AvatarFallback>
                </Avatar>
                
                {showBlueBadge && (
                    <div className="absolute bottom-2 right-2 bg-blue-500 text-white p-1.5 rounded-full border-2 border-white shadow-sm" title="Top Rated Caregiver">
                        <BadgeCheck className="h-6 w-6 fill-blue-500 text-white" />
                    </div>
                )}
            </div>

            {isEditing ? (
                 <div className="max-w-xs mx-auto space-y-2 mb-4">
                    <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="bg-white/10 text-white border-white/30 text-center" placeholder="Full Name"/>
                 </div>
            ) : (
                <>
                    <h1 className="text-3xl font-black text-white mb-1 flex items-center justify-center gap-2">
                        {formData.name} 
                        <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full text-white font-normal">{completion}%</span>
                    </h1>
                    <p className="text-blue-200 text-lg font-medium mb-1 capitalize">{formData.role}</p>
                    <p className="text-blue-300 text-sm flex items-center justify-center gap-1">
                        <MapPin className="h-3 w-3"/> {formData.current_address || "Location N/A"}
                    </p>
                </>
            )}

            {/* Action Buttons */}
            <div className="mt-6 flex justify-center gap-4">
                {isOwner ? (
                    !isEditing && (
                        <Button onClick={() => setIsEditing(true)} className="bg-white text-blue-900 hover:bg-blue-50 font-bold px-6 shadow-lg rounded-full">
                            <Edit2 className="mr-2 h-4 w-4"/> Edit Profile
                        </Button>
                    )
                ) : (
                    <Button className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-8 shadow-lg rounded-full">
                        <Download className="mr-2 h-4 w-4"/> Download CV
                    </Button>
                )}
            </div>
        </div>
      </div>

      {/* --- CONTENT --- */}
      <div className="container mx-auto max-w-2xl px-4 -mt-10 relative z-20 space-y-6">

        {/* 1. CAREER SUMMARY */}
        <Card className="shadow-lg border-slate-100">
            <CardHeader className="pb-2 border-b border-slate-50"><CardTitle className="text-slate-800 flex items-center gap-2"><FileText className="h-5 w-5 text-blue-600"/> Career Summary</CardTitle></CardHeader>
            <CardContent className="pt-4">
                {isEditing ? (
                    <Textarea value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} placeholder="Write about yourself..." className="min-h-[100px] bg-slate-50"/>
                ) : (
                    <p className="text-slate-600 leading-relaxed">{formData.bio || "No summary added."}</p>
                )}
            </CardContent>
        </Card>

        {/* 2. PERSONAL INFO */}
        <Card className="shadow-lg border-slate-100">
            <CardHeader className="pb-2 border-b border-slate-50"><CardTitle className="text-slate-800 flex items-center gap-2"><User className="h-5 w-5 text-blue-600"/> Personal Information</CardTitle></CardHeader>
            <CardContent className="pt-4 space-y-4">
                {isEditing && (
                    <div className="mb-6 p-4 bg-slate-50 rounded-xl">
                        <Label className="mb-2 block font-bold">Choose Avatar</Label>
                        <div className="flex gap-4 mb-3">
                            <div onClick={() => setFormData({...formData, gender: 'male'})} className={`cursor-pointer px-4 py-2 rounded-lg border font-bold ${formData.gender === 'male' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-slate-200'}`}>Male</div>
                            <div onClick={() => setFormData({...formData, gender: 'female'})} className={`cursor-pointer px-4 py-2 rounded-lg border font-bold ${formData.gender === 'female' ? 'bg-pink-600 text-white border-pink-600' : 'bg-white border-slate-200'}`}>Female</div>
                        </div>
                        <div className="flex gap-3 overflow-x-auto py-2">
                            {currentAvatars.map((img, i) => (
                                <img key={i} src={img} onClick={() => setFormData({...formData, avatar_url: img})}
                                    className={`h-14 w-14 rounded-full border-2 cursor-pointer ${formData.avatar_url === img ? 'border-emerald-500 scale-110' : 'border-transparent'}`}
                                />
                            ))}
                        </div>
                    </div>
                )}
                
                {/* Addresses */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <Label className="text-xs text-slate-400 font-bold uppercase">Current Address</Label>
                        {isEditing ? <Input value={formData.current_address} onChange={e => setFormData({...formData, current_address: e.target.value})} /> : <p className="font-bold text-slate-700">{formData.current_address}</p>}
                    </div>
                    <div className="space-y-1">
                        <Label className="text-xs text-slate-400 font-bold uppercase">Permanent Address</Label>
                        {isEditing ? <Input value={formData.permanent_address} onChange={e => setFormData({...formData, permanent_address: e.target.value})} /> : <p className="font-bold text-slate-700">{formData.permanent_address}</p>}
                    </div>
                </div>

                {/* Vitals */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1"><Label className="text-xs text-slate-400 font-bold uppercase">Age</Label>{isEditing ? <Input value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} /> : <p className="font-bold text-slate-700">{formData.age} Years</p>}</div>
                    <div className="space-y-1"><Label className="text-xs text-slate-400 font-bold uppercase">Phone</Label>{isEditing ? <Input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} /> : <p className="font-bold text-slate-700">{formData.phone}</p>}</div>
                </div>
            </CardContent>
        </Card>

        {/* 3. SKILLS */}
        <Card className="shadow-lg border-slate-100">
            <CardHeader className="pb-2 border-b border-slate-50"><CardTitle className="text-slate-800 flex items-center gap-2"><Briefcase className="h-5 w-5 text-blue-600"/> Medical Skills</CardTitle></CardHeader>
            <CardContent className="pt-4">
                <div className="flex flex-wrap gap-2">
                    {isEditing ? CARE_SKILLS.map(skill => (
                        <Badge key={skill} variant={formData.skills.includes(skill) ? "default" : "outline"}
                            onClick={() => {
                                setFormData(prev => ({...prev, skills: prev.skills.includes(skill) ? prev.skills.filter(s=>s!==skill) : [...prev.skills, skill] }))
                            }}
                            className={`cursor-pointer px-3 py-1 ${formData.skills.includes(skill) ? "bg-emerald-600" : "hover:bg-slate-100"}`}>
                            {skill}
                        </Badge>
                    )) : (
                        formData.skills.length > 0 ? formData.skills.map(s => <Badge key={s} variant="secondary" className="bg-slate-100 text-slate-700">{s}</Badge>) : "No skills added"
                    )}
                </div>
            </CardContent>
        </Card>

        {/* 4. DOCUMENTS & VERIFICATION */}
        {isOwner && isEditing && (
            <Card className="shadow-lg border-slate-100">
                <CardHeader className="pb-2 border-b border-slate-50"><CardTitle className="text-slate-800 flex items-center gap-2"><Upload className="h-5 w-5 text-blue-600"/> Documents & NID</CardTitle></CardHeader>
                <CardContent className="pt-4 space-y-6">
                    
                    {/* CV Upload */}
                    <div className="space-y-2">
                        <Label>Upload CV (PDF) *Required</Label>
                        <Input type="file" accept=".pdf" onChange={e => setCvFile(e.target.files?.[0] || null)} />
                    </div>

                    {/* Certificate Upload */}
                    <div className="space-y-2">
                        <Label>Certificate (Optional)</Label>
                        <Input type="file" accept="image/*,.pdf" onChange={e => setCertFile(e.target.files?.[0] || null)} />
                    </div>

                    <div className="h-px bg-slate-200 my-4"></div>

                    {/* NID Verification */}
                    {!formData.verified && (
                        <div className="space-y-4">
                            <Label className="text-orange-600 font-bold">NID Verification</Label>
                            <Input value={formData.nid_number} onChange={e => setFormData({...formData, nid_number: e.target.value})} placeholder="NID Number" />
                            <div className="grid grid-cols-2 gap-4">
                                <div><Label>Front Photo</Label><Input type="file" onChange={e => setNidFront(e.target.files?.[0] || null)} /></div>
                                <div><Label>Back Photo</Label><Input type="file" onChange={e => setNidBack(e.target.files?.[0] || null)} /></div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        )}

        {/* 5. FIXED SAVE BUTTON (Only in Edit Mode) */}
        {isEditing && (
            <div className="fixed bottom-0 left-0 w-full bg-white border-t p-4 z-50 flex justify-center shadow-[0_-5px_20px_rgba(0,0,0,0.1)]">
                 <div className="container max-w-2xl flex gap-3">
                    <Button onClick={() => setIsEditing(false)} variant="outline" className="flex-1 rounded-xl h-12 font-bold border-slate-300">Cancel</Button>
                    <Button onClick={handleSave} disabled={saving} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-12 rounded-xl shadow-lg">
                        {saving ? "Saving..." : "Save Changes"}
                    </Button>
                 </div>
            </div>
        )}

      </div>
    </div>
  );
};

export default Profile;