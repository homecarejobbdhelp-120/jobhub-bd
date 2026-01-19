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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { MapPin, Phone, Mail, Download, Edit2, Save, X, CheckCircle, AlertCircle, Upload, ShieldCheck, Briefcase, User, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// ডিফল্ট অ্যাভাটার লিস্ট
const MALE_AVATARS = [
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Bob",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Jack",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Edward",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Christopher"
];

const FEMALE_AVATARS = [
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Pepper",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Molly",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Callie",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Lilly",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Cookie"
];

const AVAILABLE_SKILLS = ["BP Check", "Elderly Care", "Baby Care", "NG Tube", "Diabetes/Insulin", "Physiotherapy", "Wound Dressing"];

const Profile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Profile Data State
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
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
    role: ""
  });

  // NID Files
  const [nidFront, setNidFront] = useState<File | null>(null);
  const [nidBack, setNidBack] = useState<File | null>(null);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUser(user);

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", id)
      .single();

    if (data) {
      setFormData({
        name: data.name || "",
        phone: data.phone || "",
        address: data.address || "",
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
        role: data.role || "caregiver"
      });
    }
    setLoading(false);
  };

  const isOwner = currentUser?.id === id;

  // Toggle Skills
  const toggleSkill = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill) 
        ? prev.skills.filter(s => s !== skill) 
        : [...prev.skills, skill]
    }));
  };

  // Handle Save
  const handleSave = async () => {
    setSaving(true);
    try {
      // 1. Upload NID if provided
      let updates: any = { ...formData };
      
      if (nidFront && nidBack && formData.nid_number) {
          const fName = `${id}_front_${Date.now()}`;
          const bName = `${id}_back_${Date.now()}`;
          
          const { data: fData } = await supabase.storage.from('verification_docs').upload(fName, nidFront);
          const { data: bData } = await supabase.storage.from('verification_docs').upload(bName, nidBack);
          
          if (fData) updates.nid_front_url = fData.path;
          if (bData) updates.nid_back_url = bData.path;
          updates.verification_status = 'pending';
      }

      // 2. Update Profile
      const { error } = await supabase.from("profiles").update(updates).eq("id", id);
      
      if (error) throw error;
      
      toast({ title: "Profile Updated Successfully!", className: "bg-emerald-600 text-white" });
      setIsEditing(false);
      
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  // Avatar Selection Logic
  const currentAvatars = formData.gender === "female" ? FEMALE_AVATARS : MALE_AVATARS;

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      <Navbar />

      {/* --- HEADER SECTION --- */}
      <div className="bg-[#1e40af] pt-12 pb-24 px-4 shadow-xl relative overflow-hidden">
        {/* Decorative Circle */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-16 -mt-16"></div>
        
        <div className="container mx-auto max-w-3xl text-center relative z-10">
            <div className="relative inline-block mb-4">
                <Avatar className="h-32 w-32 md:h-40 md:w-40 border-4 border-white/30 rounded-full shadow-2xl bg-white">
                    <AvatarImage src={formData.avatar_url} className="object-cover" />
                    <AvatarFallback className="text-4xl font-bold text-blue-800">{formData.name?.[0]}</AvatarFallback>
                </Avatar>
                {/* Verified Badge */}
                {formData.verified && (
                    <div className="absolute bottom-2 right-2 bg-emerald-500 text-white p-1.5 rounded-full border-2 border-white shadow-sm" title="Verified">
                        <ShieldCheck className="h-5 w-5" />
                    </div>
                )}
            </div>

            {isEditing ? (
                 /* EDIT MODE: Name Input */
                 <div className="max-w-xs mx-auto space-y-2 mb-4">
                    <Input 
                        value={formData.name} 
                        onChange={e => setFormData({...formData, name: e.target.value})} 
                        className="bg-white/10 text-white border-white/30 text-center placeholder:text-blue-200" 
                        placeholder="Full Name"
                    />
                    <Input 
                        value={formData.address} 
                        onChange={e => setFormData({...formData, address: e.target.value})} 
                        className="bg-white/10 text-white border-white/30 text-center placeholder:text-blue-200" 
                        placeholder="Location (e.g. Dhaka)"
                    />
                 </div>
            ) : (
                /* VIEW MODE: Name Display */
                <>
                    <h1 className="text-3xl font-black text-white mb-1">{formData.name}</h1>
                    <p className="text-blue-200 text-lg font-medium mb-1 capitalize">{formData.role} • {formData.address || "Location N/A"}</p>
                    <p className="text-blue-300 text-sm">{formData.phone}</p>
                </>
            )}

            {/* ACTION BUTTONS */}
            <div className="mt-6 flex justify-center gap-4">
                {isOwner ? (
                    isEditing ? (
                        <>
                            <Button onClick={() => setIsEditing(false)} variant="ghost" className="text-white hover:bg-white/10">
                                <X className="mr-2 h-4 w-4"/> Cancel
                            </Button>
                            <Button onClick={handleSave} disabled={saving} className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-8 shadow-lg">
                                {saving ? "Saving..." : <><Save className="mr-2 h-4 w-4"/> Save Changes</>}
                            </Button>
                        </>
                    ) : (
                        <Button onClick={() => setIsEditing(true)} className="bg-white text-blue-900 hover:bg-blue-50 font-bold px-6 shadow-lg">
                            <Edit2 className="mr-2 h-4 w-4"/> Edit Profile
                        </Button>
                    )
                ) : (
                    <Button className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-8 shadow-lg">
                        <Download className="mr-2 h-4 w-4"/> Download CV
                    </Button>
                )}
            </div>
        </div>
      </div>

      {/* --- MAIN CONTENT (Single Column Layout) --- */}
      <div className="container mx-auto max-w-2xl px-4 -mt-10 relative z-20 space-y-6">

        {/* 1. CAREER SUMMARY */}
        <Card className="shadow-lg border-slate-100">
            <CardHeader className="pb-2 border-b border-slate-50">
                <CardTitle className="flex items-center gap-2 text-slate-800"><FileText className="h-5 w-5 text-blue-600"/> Career Summary</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
                {isEditing ? (
                    <Textarea 
                        value={formData.bio} 
                        onChange={e => setFormData({...formData, bio: e.target.value})} 
                        placeholder="Write a short summary about your experience..." 
                        className="min-h-[100px] bg-slate-50"
                    />
                ) : (
                    <p className="text-slate-600 leading-relaxed">
                        {formData.bio || "No summary added yet. Click edit to add details."}
                    </p>
                )}
            </CardContent>
        </Card>

        {/* 2. PERSONAL INFORMATION (Edit Mode shows Inputs) */}
        <Card className="shadow-lg border-slate-100">
            <CardHeader className="pb-2 border-b border-slate-50">
                <CardTitle className="flex items-center gap-2 text-slate-800"><User className="h-5 w-5 text-blue-600"/> Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
                
                {isEditing && (
                    /* Avatar Selector in Edit Mode */
                    <div className="mb-6 p-4 bg-slate-50 rounded-xl">
                        <Label className="mb-2 block font-bold text-slate-700">Choose Avatar</Label>
                        
                        <RadioGroup defaultValue={formData.gender} onValueChange={(val) => setFormData({...formData, gender: val})} className="flex gap-4 mb-3">
                            <div className="flex items-center space-x-2"><RadioGroupItem value="male" id="m"/><Label htmlFor="m">Male</Label></div>
                            <div className="flex items-center space-x-2"><RadioGroupItem value="female" id="f"/><Label htmlFor="f">Female</Label></div>
                        </RadioGroup>

                        <div className="flex gap-3 overflow-x-auto py-2">
                            {currentAvatars.map((img, i) => (
                                <img 
                                    key={i} 
                                    src={img} 
                                    onClick={() => setFormData({...formData, avatar_url: img})}
                                    className={`h-14 w-14 rounded-full border-2 cursor-pointer transition-all ${formData.avatar_url === img ? 'border-emerald-500 scale-110' : 'border-transparent'}`}
                                />
                            ))}
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <Label className="text-xs text-slate-400 font-bold uppercase">Age</Label>
                        {isEditing ? <Input value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} /> : <p className="font-bold text-slate-700">{formData.age} Years</p>}
                    </div>
                    <div className="space-y-1">
                        <Label className="text-xs text-slate-400 font-bold uppercase">Gender</Label>
                        <p className="font-bold text-slate-700 capitalize">{formData.gender}</p>
                    </div>
                    <div className="space-y-1">
                        <Label className="text-xs text-slate-400 font-bold uppercase">Height</Label>
                        {isEditing ? <Input value={formData.height} onChange={e => setFormData({...formData, height: e.target.value})} /> : <p className="font-bold text-slate-700">{formData.height}</p>}
                    </div>
                    <div className="space-y-1">
                        <Label className="text-xs text-slate-400 font-bold uppercase">Weight</Label>
                        {isEditing ? <Input value={formData.weight} onChange={e => setFormData({...formData, weight: e.target.value})} /> : <p className="font-bold text-slate-700">{formData.weight}</p>}
                    </div>
                </div>
            </CardContent>
        </Card>

        {/* 3. WORK PREFERENCES & SKILLS */}
        <Card className="shadow-lg border-slate-100">
            <CardHeader className="pb-2 border-b border-slate-50">
                <CardTitle className="flex items-center gap-2 text-slate-800"><Briefcase className="h-5 w-5 text-blue-600"/> Work Details</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-6">
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <Label className="text-xs text-slate-400 font-bold uppercase">Expected Salary</Label>
                        {isEditing ? <Input value={formData.expected_salary} onChange={e => setFormData({...formData, expected_salary: e.target.value})} /> : <p className="font-bold text-emerald-600 text-lg">৳{formData.expected_salary}</p>}
                    </div>
                    <div className="space-y-1">
                        <Label className="text-xs text-slate-400 font-bold uppercase">Preferred Shift</Label>
                        {isEditing ? (
                            <Select onValueChange={(val) => setFormData({...formData, preferred_shift: val})} defaultValue={formData.preferred_shift}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent><SelectItem value="Any">Any</SelectItem><SelectItem value="Day">Day</SelectItem><SelectItem value="Night">Night</SelectItem><SelectItem value="24h">24h</SelectItem></SelectContent>
                            </Select>
                        ) : <p className="font-bold text-slate-700">{formData.preferred_shift}</p>}
                    </div>
                 </div>

                 <div className="space-y-2">
                    <Label className="text-xs text-slate-400 font-bold uppercase block">Skills</Label>
                    <div className="flex flex-wrap gap-2">
                        {isEditing ? (
                            AVAILABLE_SKILLS.map(skill => (
                                <Badge 
                                    key={skill} 
                                    variant={formData.skills.includes(skill) ? "default" : "outline"}
                                    onClick={() => toggleSkill(skill)}
                                    className={`cursor-pointer px-3 py-1 ${formData.skills.includes(skill) ? "bg-emerald-600" : "hover:bg-slate-100"}`}
                                >
                                    {formData.skills.includes(skill) && <CheckCircle className="w-3 h-3 mr-1"/>} {skill}
                                </Badge>
                            ))
                        ) : (
                            formData.skills.length > 0 ? formData.skills.map(s => <Badge key={s} variant="secondary" className="bg-slate-100 text-slate-700">{s}</Badge>) : <p className="text-sm text-slate-400">No skills added</p>
                        )}
                    </div>
                 </div>
            </CardContent>
        </Card>

        {/* 4. VERIFICATION (Only Visible to Owner) */}
        {isOwner && (
            <Card className={`shadow-lg border-2 ${formData.verified ? "border-emerald-100 bg-emerald-50/50" : "border-orange-100"}`}>
                <CardHeader className="pb-2 border-b border-slate-50/50">
                    <CardTitle className="flex items-center gap-2 text-slate-800">
                        {formData.verified ? <ShieldCheck className="h-5 w-5 text-emerald-600"/> : <AlertCircle className="h-5 w-5 text-orange-500"/>} 
                        Verification Status
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                    {formData.verified ? (
                        <div className="text-center py-4 text-emerald-700 font-bold">✅ Your Account is Verified</div>
                    ) : formData.verification_status === 'pending' ? (
                        <div className="text-center py-4 text-orange-600 font-bold">⏳ Verification Pending Approval</div>
                    ) : (
                        isEditing ? (
                            <div className="space-y-4">
                                <p className="text-sm text-slate-500 mb-2">To get verified, please upload your NID details.</p>
                                <div className="space-y-2">
                                    <Label>NID Number</Label>
                                    <Input value={formData.nid_number} onChange={e => setFormData({...formData, nid_number: e.target.value})} placeholder="Enter NID Number" />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="border border-dashed border-slate-300 rounded-lg p-3 text-center bg-white">
                                        <p className="text-xs text-slate-400 mb-2">Front Side</p>
                                        <Input type="file" onChange={e => setNidFront(e.target.files?.[0] || null)} className="h-8 text-xs" />
                                    </div>
                                    <div className="border border-dashed border-slate-300 rounded-lg p-3 text-center bg-white">
                                        <p className="text-xs text-slate-400 mb-2">Back Side</p>
                                        <Input type="file" onChange={e => setNidBack(e.target.files?.[0] || null)} className="h-8 text-xs" />
                                    </div>
                                </div>
                            </div>
                        ) : (
                           <div className="text-center py-4 text-slate-500">
                               Your profile is not verified. Click <span className="font-bold text-blue-600">Edit Profile</span> to submit NID.
                           </div>
                        )
                    )}
                </CardContent>
            </Card>
        )}

        {/* BOTTOM ACTION (Mobile) */}
        {isOwner && isEditing && (
            <div className="fixed bottom-0 left-0 w-full bg-white border-t p-4 z-50 md:hidden">
                 <Button onClick={handleSave} disabled={saving} className="w-full bg-emerald-600 text-white font-bold h-12 rounded-xl shadow-lg">
                    {saving ? "Saving..." : "Save Changes"}
                 </Button>
            </div>
        )}

      </div>
    </div>
  );
};

export default Profile;