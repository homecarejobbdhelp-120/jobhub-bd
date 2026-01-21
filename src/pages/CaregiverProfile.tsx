import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Navbar from "@/components/Navbar";
import { toast } from "sonner";
import { Loader2, User, Activity, ShieldCheck, Camera, CheckCircle2 } from "lucide-react";

// ✅ ফিক্সড অবতার লিংক
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
  const [completion, setCompletion] = useState(0);

  useEffect(() => {
    getProfile();
  }, []);

  // প্রোফাইল লোড এবং পার্সেন্টেজ হিসাব
  useEffect(() => {
    if (profile) calculateCompletion();
  }, [profile]);

  const calculateCompletion = () => {
    if (!profile) return;
    let filled = 0;
    const fields = ['name', 'phone', 'location', 'role', 'bio', 'gender', 'age', 'height_ft', 'weight_kg', 'marital_status', 'nid_number'];
    fields.forEach(f => {
        if (profile[f] && profile[f].toString().length > 0) filled++;
    });
    // ছবি বা ডকুমেন্ট থাকলে এক্সট্রা পয়েন্ট
    if (profile.avatar_url) filled++;
    if (profile.nid_front_url) filled++;
    
    const total = fields.length + 2; 
    setCompletion(Math.round((filled / total) * 100));
  };

  const getProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (data) {
          setProfile(data);
          if (data.gender === 'Female') setAvatarGender('female');
      }
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
      
      const updatedProfile = { ...profile, [column]: publicUrl };
      await supabase.from('profiles').update({ [column]: publicUrl }).eq('id', profile.id);
      setProfile(updatedProfile);
      
      toast.success("আপলোড সফল হয়েছে!");
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

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-blue-600" /></div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <Navbar />
      
      {/* === Header Section === */}
      <div className="bg-blue-600 pt-6 pb-20 px-4 rounded-b-[2rem] shadow-lg">
        <div className="container mx-auto max-w-2xl text-white text-center">
            <h1 className="text-2xl font-bold mb-1">Edit Profile</h1>
            {/* ✅ আপডেটেড সাবটাইটেল */}
            <p className="text-blue-100 text-sm mb-6">Complete your profile & get a verified badge</p>
            
            {/* Progress Bar */}
            <div className="bg-blue-800/50 p-4 rounded-xl backdrop-blur-sm border border-blue-400/30">
                <div className="flex justify-between text-sm font-semibold mb-2">
                    <span>Profile Completion</span>
                    <span>{completion}%</span>
                </div>
                <div className="w-full bg-blue-900/50 rounded-full h-2.5 overflow-hidden">
                    <div className="bg-green-400 h-2.5 rounded-full transition-all duration-1000" style={{ width: `${completion}%` }}></div>
                </div>
                {completion === 100 && <p className="text-xs text-green-300 mt-2 flex items-center justify-center gap-1"><CheckCircle2 className="w-3 h-3"/> Great job! Your profile is ready.</p>}
            </div>
        </div>
      </div>

      <main className="container mx-auto px-4 -mt-12 max-w-2xl space-y-6">
        
        {/* === SECTION 1: BASIC INFO === */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center gap-2 mb-6 pb-2 border-b border-gray-100">
                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><User className="w-5 h-5"/></div>
                <h2 className="text-lg font-bold text-gray-800">Basic Information</h2>
            </div>

            {/* Avatar Selector */}
            <div className="mb-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div className="flex justify-between items-center mb-4">
                    <label className="font-semibold text-gray-700">Profile Picture</label>
                    <div className="flex gap-2 text-xs">
                        <button onClick={() => setAvatarGender('male')} className={`px-3 py-1 rounded-full border ${avatarGender === 'male' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600'}`}>Male</button>
                        <button onClick={() => setAvatarGender('female')} className={`px-3 py-1 rounded-full border ${avatarGender === 'female' ? 'bg-pink-500 text-white border-pink-500' : 'bg-white text-gray-600'}`}>Female</button>
                    </div>
                </div>
                
                {/* Current Selected Avatar Preview */}
                <div className="flex flex-col items-center mb-4">
                    <div className="w-24 h-24 rounded-full border-4 border-white shadow-md overflow-hidden bg-gray-200">
                        {profile?.avatar_url ? (
                            <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400"><User className="w-10 h-10"/></div>
                        )}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Selected Avatar</p>
                </div>

                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide justify-center">
                    {AVATARS[avatarGender].map((url, i) => (
                        <img key={i} src={url} alt="option" 
                            className={`w-12 h-12 rounded-full cursor-pointer border-2 transition-all ${profile?.avatar_url === url ? 'border-blue-600 scale-110 ring-2 ring-blue-100' : 'border-transparent opacity-60 hover:opacity-100'}`}
                            onClick={() => setProfile({...profile, avatar_url: url})}
                        />
                    ))}
                </div>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition" value={profile?.name || ''} onChange={e => setProfile({...profile, name: e.target.value})} placeholder="e.g. Asadullah" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                        <input className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={profile?.phone || ''} onChange={e => setProfile({...profile, phone: e.target.value})} placeholder="017..." />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                        <input className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={profile?.location || ''} onChange={e => setProfile({...profile, location: e.target.value})} placeholder="Dhaka" />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Professional Role</label>
                    <select className="w-full p-3 border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none" value={profile?.role || ''} onChange={(e) => setProfile({...profile, role: e.target.value})}>
                        <option value="">Select Role</option>
                        <option value="caregiver">Caregiver</option>
                        <option value="nurse">Nurse</option>
                        <option value="physiotherapist">Physiotherapist</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">About You (Bio)</label>
                    <textarea className="w-full p-3 border border-gray-200 rounded-lg h-24 focus:ring-2 focus:ring-blue-500 outline-none resize-none" placeholder="Describe your experience and skills..." value={profile?.bio || ''} onChange={e => setProfile({...profile, bio: e.target.value})} />
                </div>
            </div>
        </div>

        {/* === SECTION 2: PHYSICAL INFO === */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center gap-2 mb-6 pb-2 border-b border-gray-100">
                <div className="p-2 bg-green-100 text-green-600 rounded-lg"><Activity className="w-5 h-5"/></div>
                <h2 className="text-lg font-bold text-gray-800">Physical Information</h2>
            </div>
            
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                        <select className="w-full p-3 border border-gray-200 rounded-lg bg-white" value={profile?.gender || ''} onChange={(e) => setProfile({...profile, gender: e.target.value})}>
                            <option value="">Select</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                        <input type="number" className="w-full p-3 border border-gray-200 rounded-lg" value={profile?.age || ''} onChange={e => setProfile({...profile, age: e.target.value})} />
                    </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Height (ft)</label>
                        <input className="w-full p-3 border border-gray-200 rounded-lg" placeholder="5.6" value={profile?.height_ft || ''} onChange={e => setProfile({...profile, height_ft: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
                        <input className="w-full p-3 border border-gray-200 rounded-lg" placeholder="62" value={profile?.weight_kg || ''} onChange={e => setProfile({...profile, weight_kg: e.target.value})} />
                    </div>
                </div>
                
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Marital Status</label>
                    <select className="w-full p-3 border border-gray-200 rounded-lg bg-white" value={profile?.marital_status || ''} onChange={(e) => setProfile({...profile, marital_status: e.target.value})}>
                            <option value="">Select</option>
                            <option value="Single">Single</option>
                            <option value="Married">Married</option>
                    </select>
                </div>
            </div>
        </div>

        {/* === SECTION 3: VERIFICATION === */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center gap-2 mb-6 pb-2 border-b border-gray-100">
                <div className="p-2 bg-purple-100 text-purple-600 rounded-lg"><ShieldCheck className="w-5 h-5"/></div>
                <h2 className="text-lg font-bold text-gray-800">Verification Documents</h2>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">NID Number (Optional)</label>
                    <input className="w-full p-3 border border-gray-200 rounded-lg" placeholder="Enter NID number" value={profile?.nid_number || ''} onChange={e => setProfile({...profile, nid_number: e.target.value})} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="border-2 border-dashed border-gray-200 p-4 rounded-xl text-center hover:bg-gray-50 transition relative">
                        {profile?.nid_front_url && <div className="absolute top-2 right-2 text-green-500"><CheckCircle2 className="w-4 h-4"/></div>}
                        <label className="block mb-2 text-sm font-medium text-gray-600">NID Front</label>
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2 text-gray-400">
                             <Camera className="w-5 h-5"/>
                        </div>
                        <input type="file" className="text-xs w-full text-transparent file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" onChange={(e) => handleFileUpload(e, 'nid_front_url')} disabled={saving} />
                    </div>

                    <div className="border-2 border-dashed border-gray-200 p-4 rounded-xl text-center hover:bg-gray-50 transition relative">
                         {profile?.nid_back_url && <div className="absolute top-2 right-2 text-green-500"><CheckCircle2 className="w-4 h-4"/></div>}
                        <label className="block mb-2 text-sm font-medium text-gray-600">NID Back</label>
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2 text-gray-400">
                             <Camera className="w-5 h-5"/>
                        </div>
                        <input type="file" className="text-xs w-full text-transparent file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" onChange={(e) => handleFileUpload(e, 'nid_back_url')} disabled={saving} />
                    </div>
                </div>
            </div>
        </div>

        {/* === STICKY SAVE BUTTON === */}
        <div className="sticky bottom-4 z-50">
            <button onClick={handleSave} disabled={saving} className="w-full h-14 text-lg font-bold bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-xl shadow-blue-200 rounded-2xl flex items-center justify-center transition-all active:scale-95">
                {saving ? <Loader2 className="animate-spin mr-2"/> : "Save All Changes"}
            </button>
        </div>

      </main>
    </div>
  );
};

export default CaregiverProfile;