import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { User, Mail, Phone, MapPin, LogOut, Upload, FileText, Award, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import AvatarPicker from "./AvatarPicker";
import VerifiedBadge from "./VerifiedBadge";
import { calculateProfileCompletion } from "@/lib/profileCompletion";

interface Profile {
  name: string;
  email: string;
  phone: string;
  location: string;
  verified_percentage: number;
  avatar_url: string | null;
  gender: string | null;
  age: number | null;
  nid_number: string | null;
  height_ft: number | null;
  height_cm: number | null;
  weight_kg: number | null;
  marital_status: string | null;
  shift_preferences: string[];
  skills: string[];
  cv_url: string | null;
  certificate_url: string | null;
}

const SHIFT_OPTIONS = [
  { value: "12h", label: "12 Hours" },
  { value: "24h", label: "24 Hours" },
  { value: "day", label: "Day Shift" },
  { value: "night", label: "Night Shift" },
];

const SKILL_OPTIONS = [
  { value: "bp_check", label: "BP Check" },
  { value: "diabetes_insulin", label: "Diabetes/Insulin" },
  { value: "ng_tube", label: "NG Tube" },
  { value: "physiotherapy", label: "Physiotherapy" },
  { value: "elderly_care", label: "Elderly Care" },
  { value: "baby_care", label: "Baby Care" },
];

const ProfileTab = () => {
  const navigate = useNavigate();
  const cvInputRef = useRef<HTMLInputElement>(null);
  const certInputRef = useRef<HTMLInputElement>(null);
  
  const [profile, setProfile] = useState<Profile>({
    name: "",
    email: "",
    phone: "",
    location: "",
    verified_percentage: 0,
    avatar_url: null,
    gender: null,
    age: null,
    nid_number: null,
    height_ft: null,
    height_cm: null,
    weight_kg: null,
    marital_status: null,
    shift_preferences: [],
    skills: [],
    cv_url: null,
    certificate_url: null,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingCV, setUploadingCV] = useState(false);
  const [uploadingCert, setUploadingCert] = useState(false);
  const [userId, setUserId] = useState<string>("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;

      if (data) {
        setProfile({
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
          location: data.location || "",
          verified_percentage: data.verified_percentage || 0,
          avatar_url: data.avatar_url || null,
          gender: data.gender || null,
          age: data.age || null,
          nid_number: data.nid_number || null,
          height_ft: data.height_ft || null,
          height_cm: data.height_cm || null,
          weight_kg: data.weight_kg || null,
          marital_status: data.marital_status || null,
          shift_preferences: data.shift_preferences || [],
          skills: data.skills || [],
          cv_url: data.cv_url || null,
          certificate_url: data.certificate_url || null,
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

      // Calculate completion percentage
      const completion = calculateProfileCompletion(profile);

      const { error } = await supabase
        .from("profiles")
        .update({
          name: profile.name,
          phone: profile.phone,
          location: profile.location,
          avatar_url: profile.avatar_url,
          gender: profile.gender,
          age: profile.age,
          nid_number: profile.nid_number,
          height_ft: profile.height_ft,
          height_cm: profile.height_cm,
          weight_kg: profile.weight_kg,
          marital_status: profile.marital_status,
          shift_preferences: profile.shift_preferences,
          skills: profile.skills,
          cv_url: profile.cv_url,
          certificate_url: profile.certificate_url,
          verified_percentage: completion.percentage,
        })
        .eq("id", user.id);

      if (error) throw error;

      setProfile(prev => ({ ...prev, verified_percentage: completion.percentage }));

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

  const handleFileUpload = async (
    file: File, 
    bucket: 'cvs' | 'certificates', 
    field: 'cv_url' | 'certificate_url'
  ) => {
    const setUploading = bucket === 'cvs' ? setUploadingCV : setUploadingCert;
    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

      setProfile(prev => ({ ...prev, [field]: publicUrl }));

      toast({
        title: "Success",
        description: `${bucket === 'cvs' ? 'CV' : 'Certificate'} uploaded successfully`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to upload file",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleShiftToggle = (value: string) => {
    setProfile(prev => ({
      ...prev,
      shift_preferences: prev.shift_preferences.includes(value)
        ? prev.shift_preferences.filter(s => s !== value)
        : [...prev.shift_preferences, value],
    }));
  };

  const handleSkillToggle = (value: string) => {
    setProfile(prev => ({
      ...prev,
      skills: prev.skills.includes(value)
        ? prev.skills.filter(s => s !== value)
        : [...prev.skills, value],
    }));
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const completion = calculateProfileCompletion(profile);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="pb-20 space-y-4">
      {/* Profile Header Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <AvatarPicker
              gender={profile.gender}
              currentAvatar={profile.avatar_url}
              onSelect={(url) => setProfile(prev => ({ ...prev, avatar_url: url }))}
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <CardTitle>{profile.name || "Your Name"}</CardTitle>
                <VerifiedBadge isVerified={completion.isVerified} />
              </div>
              <CardDescription className="mt-1">
                Profile Completion: {completion.percentage}%
              </CardDescription>
              <Progress value={completion.percentage} className="h-2 mt-2" />
              {completion.missingFields.length > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  Missing: {completion.missingFields.join(", ")}
                </p>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name *</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="name"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="pl-9"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input id="email" value={profile.email} disabled className="pl-9 bg-muted" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number *</Label>
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
            <Label htmlFor="location">Location *</Label>
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Gender *</Label>
              <Select
                value={profile.gender || ""}
                onValueChange={(value) => setProfile({ ...profile, gender: value, avatar_url: null })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="age">Age *</Label>
              <Input
                id="age"
                type="number"
                min={18}
                max={100}
                value={profile.age || ""}
                onChange={(e) => setProfile({ ...profile, age: e.target.value ? parseInt(e.target.value) : null })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="nid">NID Number (Optional)</Label>
            <Input
              id="nid"
              value={profile.nid_number || ""}
              onChange={(e) => setProfile({ ...profile, nid_number: e.target.value })}
              placeholder="Enter NID number"
            />
          </div>
        </CardContent>
      </Card>

      {/* Physical Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Physical Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="height">Height (ft)</Label>
              <Input
                id="height"
                type="number"
                step="0.1"
                min={3}
                max={8}
                value={profile.height_ft || ""}
                onChange={(e) => setProfile({ ...profile, height_ft: e.target.value ? parseFloat(e.target.value) : null })}
                placeholder="e.g., 5.6"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input
                id="weight"
                type="number"
                min={30}
                max={200}
                value={profile.weight_kg || ""}
                onChange={(e) => setProfile({ ...profile, weight_kg: e.target.value ? parseFloat(e.target.value) : null })}
                placeholder="e.g., 65"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Marital Status</Label>
            <Select
              value={profile.marital_status || ""}
              onValueChange={(value) => setProfile({ ...profile, marital_status: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="single">Single</SelectItem>
                <SelectItem value="married">Married</SelectItem>
                <SelectItem value="separated">Separated</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Shift Preferences</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {SHIFT_OPTIONS.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`shift-${option.value}`}
                  checked={profile.shift_preferences.includes(option.value)}
                  onCheckedChange={() => handleShiftToggle(option.value)}
                />
                <Label htmlFor={`shift-${option.value}`} className="text-sm font-normal cursor-pointer">
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Medical Skills */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Medical Skills</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {SKILL_OPTIONS.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`skill-${option.value}`}
                  checked={profile.skills.includes(option.value)}
                  onCheckedChange={() => handleSkillToggle(option.value)}
                />
                <Label htmlFor={`skill-${option.value}`} className="text-sm font-normal cursor-pointer">
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Documents */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Documents</CardTitle>
          <CardDescription>Upload your CV and certificate for verification</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* CV Upload */}
          <div className="space-y-2">
            <Label>CV/Resume (PDF)</Label>
            <input
              ref={cvInputRef}
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(file, 'cvs', 'cv_url');
              }}
            />
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => cvInputRef.current?.click()}
              disabled={uploadingCV}
            >
              {uploadingCV ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <FileText className="mr-2 h-4 w-4" />
              )}
              {profile.cv_url ? "CV Uploaded ✓" : "Upload CV"}
            </Button>
            {profile.cv_url && (
              <a 
                href={profile.cv_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline"
              >
                View uploaded CV
              </a>
            )}
          </div>

          {/* Certificate Upload */}
          <div className="space-y-2">
            <Label>Certificate (JPG/PNG) *</Label>
            <input
              ref={certInputRef}
              type="file"
              accept=".jpg,.jpeg,.png"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(file, 'certificates', 'certificate_url');
              }}
            />
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => certInputRef.current?.click()}
              disabled={uploadingCert}
            >
              {uploadingCert ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Award className="mr-2 h-4 w-4" />
              )}
              {profile.certificate_url ? "Certificate Uploaded ✓" : "Upload Certificate"}
            </Button>
            {profile.certificate_url && (
              <a 
                href={profile.certificate_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline"
              >
                View uploaded certificate
              </a>
            )}
            <p className="text-xs text-muted-foreground">
              Upload a certificate to get the verified badge
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <Button onClick={handleSave} disabled={saving} className="w-full">
        {saving ? "Saving..." : "Save Changes"}
      </Button>

      {/* Logout Button */}
      <Button variant="outline" className="w-full" onClick={handleLogout}>
        <LogOut className="mr-2 h-4 w-4" />
        Logout
      </Button>
    </div>
  );
};

export default ProfileTab;
