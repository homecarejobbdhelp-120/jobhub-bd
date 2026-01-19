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
import { MapPin, Download, Edit2, Save, Upload, ShieldCheck, Briefcase, User, FileText, BadgeCheck, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// ✨ আপনার প্রজেক্ট লিংক বসিয়ে দেওয়া হয়েছে
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

  // Calculate Profile Completion
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

  // Generate Supabase Avatar URLs (male-1 to male-5)
  const getAvatars = (gender: string) => {
    return Array.from({ length: 5 }, (_, i) => 
      `${PROJECT_URL}/storage/v1/object/public/Avatars/${gender}-${i + 1}.png`
    );
  };

  const currentAvatars = getAvatars(formData.gender);

  // Show "Blue Badge" only if Verified AND 100% Complete
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
                
                {/* 100% Verified Blue Badge */}
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
                        <MapPin className="h-3 w-3"/> {formData.current_address || "Address N/A"}
                    </p>
                </>
            )}

            {/* Action Buttons */}
            <div className="mt-6 flex justify-center gap-4">
                {isOwner ? (
                    !isEditing && (
                        <Button onClick={()