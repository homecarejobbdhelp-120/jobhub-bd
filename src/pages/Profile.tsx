import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Phone, Mail, Download, Upload, ShieldCheck, AlertCircle, FileText, CheckCircle, Ruler, Briefcase, Lock, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Profile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [profile, setProfile] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // NID States
  const [nidNumber, setNidNumber] = useState("");
  const [nidFront, setNidFront] = useState<File | null>(null);
  const [nidBack, setNidBack] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchProfileData();
  }, [id]);

  const fetchProfileData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUser(user);

    // প্রোফাইল ফেচ করা
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", id)
      .single();

    if (!error) {
      setProfile(data);
    }
    setLoading(false);
  };

  const handleNIDSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nidFront || !nidBack || !nidNumber) {
        toast({ title: "Error", description: "সব তথ্য সঠিক ভাবে দিন", variant: "destructive" });
        return;
    }
    setUploading(true);
    try {
        const frontName = `${id}_front_${Date.now()}`;
        const { data: frontData } = await supabase.storage.from('verification_docs').upload(frontName, nidFront);
        
        const backName = `${id}_back_${Date.now()}`;
        const { data: backData } = await supabase.storage.from('verification_docs').upload(backName, nidBack);

        await supabase.from('profiles').update({
            nid_number: nidNumber,
            nid_front_url: frontData?.path,
            nid_back_url: backData?.path,
            verification_status: 'pending'
        }).eq('id', id);

        toast({ title: "সফল হয়েছে!", description: "ভেরিফিকেশনের জন্য জমা দেওয়া হয়েছে।", className: "bg-emerald-600 text-white" });
        fetchProfileData();
    } catch (error: any) {
        toast({ title: "Upload Failed", description: error.message, variant: "destructive" });
    } finally {
        setUploading(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;

  // ✨ VISITOR BLOCKER LOGIC (লক স্ক্রিন)
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-50 font-sans pb-20">
        <Navbar />
        <div className="container mx-auto px-4 mt-16 max-w-md text-center">
          <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
            <div className="bg-red-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Lock className="h-10 w-10 text-red-500" />
            </div>
            <h2 className="text-2xl font-black text-slate-800 mb-3">প্রোফাইল লক করা আছে</h2>
            <p className="text-slate-500 mb-8 leading-relaxed">
              নিরাপত্তার স্বার্থে কেয়ারগিভারদের তথ্য শুধুমাত্র রেজিস্টার্ড ইউজারদের দেখানো হয়। বিস্তারিত দেখতে লগইন করুন।
            </p>
            <div className="grid gap-3">
              <Button onClick={() => navigate("/login")} className="w-full h-12 text-lg font-bold bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-lg shadow-emerald-100">
                লগইন করুন
              </Button>
              <Button onClick={() => navigate("/signup")} variant="outline" className="w-full h-12 text-lg font-bold rounded-xl border-slate-300 text-slate-600">
                একাউন্ট খুলুন
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ✨ AUTHENTICATED USER VIEW (লগইন করা থাকলে নিচের অংশ দেখবে)
  if (!profile) return <div className="flex justify-center items-center h-screen">Profile not found</div>;
  const isOwner = currentUser?.id === id;

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      <Navbar />

      {/* HEADER SECTION */}
      <div className="bg-[#1e40af] text-white pt-10 pb-20 px-4 shadow-lg">
        <div className="container mx-auto max-w-5xl flex flex-col md:flex-row items-center gap-6">
            <div className="relative">
                <Avatar className="h-32 w-32 md:h-40 md:w-40 border-4 border-white/30 rounded-full shadow-2xl">
                    <AvatarImage src={profile.avatar_url} className="object-cover" />
                    <AvatarFallback className="text-4xl font-bold text-[#1e40af] bg-white">{profile.name?.[0]}</AvatarFallback>
                </Avatar>
                {profile.verified && (
                    <div className="absolute bottom-2 right-2 bg-emerald-500 text-white p-1.5 rounded-full border-2 border-white" title="Verified">
                        <ShieldCheck className="h-5 w-5" />
                    </div>
                )}
            </div>
            
            <div className="text-center md:text-left flex-1">
                <h1 className="text-3xl md:text-4xl font-black mb-2">{profile.name}</h1>
                <p className="text-blue-200 text-lg font-medium mb-4">{profile.role === 'nurse' ? 'Diploma Nurse' : 'Professional Caregiver'}</p>
                
                <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-blue-100 opacity-90">
                    <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {profile.address || "Location N/A"}</span>
                    <span className="flex items-center gap-1"><Phone className="h-4 w-4" /> {isOwner ? profile.phone : "+880 17XX-XXXXXX"}</span>
                </div>
            </div>

            <div className="flex gap-3">
                <Button variant="outline" className="bg-white/10 text-white border-white/20 hover:bg-white/20 hover:text-white backdrop-blur-sm rounded-xl">
                    <Download className="mr-2 h-4 w-4" /> Download CV
                </Button>
                {!isOwner && (
                    <Button className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold shadow-lg rounded-xl">
                       <UserPlus className="mr-2 h-4 w-4" /> Hire Me
                    </Button>
                )}
            </div>
        </div>
      </div>

      {/* TABS SECTION */}
      <div className="container mx-auto max-w-5xl px-4 -mt-10 relative z-10">
        <Tabs defaultValue="resume" className="w-full">
            
            <TabsList className="bg-white p-1 rounded-xl shadow-md border border-slate-100 mb-6 w-full md:w-auto flex justify-start h-auto">
                <TabsTrigger value="resume" className="flex-1 md:flex-none px-6 py-3 font-bold data-[state=active]:bg-[#1e40af] data-[state=active]:text-white rounded-lg">CV / Resume</TabsTrigger>
                <TabsTrigger value="details" className="flex-1 md:flex-none px-6 py-3 font-bold data-[state=active]:bg-[#1e40af] data-[state=active]:text-white rounded-lg">Details</TabsTrigger>
                {isOwner && <TabsTrigger value="verification" className="flex-1 md:flex-none px-6 py-3 font-bold data-[state=active]:bg-[#1e40af] data-[state=active]:text-white rounded-lg">Verification</TabsTrigger>}
            </TabsList>

            <TabsContent value="resume">
                <Card className="border-none shadow-xl rounded-none md:rounded-2xl overflow-hidden">
                    <CardContent className="p-4 md:p-8 bg-white min-h-[600px]">
                        <div className="mb-8 border-b border-slate-100 pb-6">
                            <h3 className="text-lg font-bold text-[#1e40af] mb-3 flex items-center gap-2">
                                <span className="w-2 h-6 bg-[#1e40af] rounded-full"></span> Career Summary
                            </h3>
                            <p className="text-slate-600 leading-relaxed text-sm md:text-base">
                                {profile.bio || "No summary added yet."}
                            </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <div className="mb-8">
                                    <h3 className="text-lg font-bold text-[#1e40af] mb-4 flex items-center gap-2">
                                        <span className="w-2 h-6 bg-[#1e40af] rounded-full"></span> Skills
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {(profile.skills || ["General Care"]).map((skill: string, i: number) => (
                                            <Badge key={i} variant="secondary" className="bg-slate-100 text-slate-700 px-3 py-1 text-sm font-medium">{skill}</Badge>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-[#1e40af] mb-4 flex items-center gap-2">
                                    <span className="w-2 h-6 bg-[#1e40af] rounded-full"></span> Language
                                </h3>
                                <ul className="space-y-2 text-sm text-slate-700 font-medium">
                                    <li>Bengali (Native)</li>
                                    <li>English (Basic)</li>
                                </ul>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="details">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader><CardTitle className="flex items-center gap-2"><Ruler className="h-5 w-5 text-emerald-600"/> Physical Info</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between border-b pb-2"><span>Height</span> <span className="font-bold">{profile.height || "N/A"}</span></div>
                            <div className="flex justify-between border-b pb-2"><span>Weight</span> <span className="font-bold">{profile.weight || "N/A"}</span></div>
                            <div className="flex justify-between border-b pb-2"><span>Age</span> <span className="font-bold">{profile.age || "N/A"} Years</span></div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle className="flex items-center gap-2"><Briefcase className="h-5 w-5 text-emerald-600"/> Work Info</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between border-b pb-2"><span>Salary</span> <span className="font-bold text-emerald-600">৳{profile.expected_salary || "Negotiable"}</span></div>
                            <div className="flex justify-between border-b pb-2"><span>Shift</span> <span className="font-bold">{profile.preferred_shift || "Any"}</span></div>
                        </CardContent>
                    </Card>
                </div>
            </TabsContent>

            {isOwner && (
                <TabsContent value="verification">
                    <Card className={`border-2 ${profile.verified ? "border-emerald-100 bg-emerald-50" : "border-orange-100 bg-white"}`}>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                {profile.verified ? <CheckCircle className="text-emerald-600"/> : <AlertCircle className="text-orange-500"/>}
                                NID Verification
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {profile.verified ? (
                                <div className="text-center py-6 text-emerald-700 font-bold">✅ Verified Account</div>
                            ) : profile.verification_status === 'pending' ? (
                                <div className="text-center py-6 text-orange-600 font-bold bg-orange-50 rounded-xl">⏳ Verification Pending Approval</div>
                            ) : (
                                <form onSubmit={handleNIDSubmit} className="space-y-4">
                                    <div>
                                        <Label>NID Number</Label>
                                        <Input placeholder="NID Number" value={nidNumber} onChange={e => setNidNumber(e.target.value)} required className="bg-white"/>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label>Front Photo</Label>
                                            <Input type="file" onChange={e => setNidFront(e.target.files?.[0] || null)} required className="bg-white"/>
                                        </div>
                                        <div>
                                            <Label>Back Photo</Label>
                                            <Input type="file" onChange={e => setNidBack(e.target.files?.[0] || null)} required className="bg-white"/>
                                        </div>
                                    </div>
                                    <Button disabled={uploading} className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold mt-4">
                                        {uploading ? "Uploading..." : "Submit for Verification"}
                                    </Button>
                                </form>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            )}
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;