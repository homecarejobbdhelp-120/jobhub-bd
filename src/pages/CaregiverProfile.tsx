import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Navbar from "@/components/Navbar";
import { toast } from "sonner";
import { Loader2, User, Activity, ShieldCheck } from "lucide-react";

// ✅ অবতার লিংক
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
  const [activeTab, setActiveTab] = useState('details'); // সাধারণ ট্যাবস

  useEffect(() => {
    getProfile();
  }, []);

  const getProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      setProfile(data || {});
      if (data?.gender === 'Female') setAvatarGender('female');
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
      
      <div className="bg-blue-600 pt-8 pb-16 px-4">
        <div className="container mx-auto max-w-2xl text-white">
            <h1 className="text-2xl font-bold">Edit Profile</h1>
            <p className="opacity-90">Complete your profile without errors</p>
        </div>
      </div>

      <main className="container mx-auto px-4 -mt-10 max-w-2xl">
        
        {/* সাধারণ বাটন ট্যাবস */}
        <div className="grid grid-cols-3 bg-white rounded-xl shadow mb-4 overflow-hidden">
            <button onClick={() => setActiveTab('details')} className={`p-3 font-medium ${activeTab === 'details' ? 'bg-blue-50 text-blue-600' : 'text-gray-600'}`}>Details</button>
            <button onClick={() => setActiveTab('physical')} className={`p-3 font-medium ${activeTab === 'physical' ? 'bg-blue-50 text-blue-600' : 'text-gray-600'}`}>Physical</button>
            <button onClick={() => setActiveTab('verification')} className={`p-3 font-medium ${activeTab === 'verification' ? 'bg-blue-50 text-blue-600' : 'text-gray-600'}`}>Verify</button>
        </div>

        {/* কন্টেন্ট এরিয়া */}
        <div className="bg-white rounded-xl shadow p-6 space-y-6">
            
            {/* === TAB 1: DETAILS === */}
            {activeTab === 'details' && (
                <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4 text-lg font-bold text-gray-800"><User className="w-5 h-5 text-blue-600"/> Personal Info</div>
                    
                    {/* অবতার সেকশন */}
                    <div className="bg-gray-50 p-4 rounded border">
                        <label className="block mb-2 font-semibold">Choose Avatar</label>
                        <div className="flex gap-4 mb-3">
                            <button onClick={() => setAvatarGender('male')} className={`px-3 py-1 rounded ${avatarGender === 'male' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>Male</button>
                            <button onClick={() => setAvatarGender('female')} className={`px-3 py-1 rounded ${avatarGender === 'female' ? 'bg-pink-600 text-white' : 'bg-gray-200'}`}>Female</button>
                        </div>
                        <div className="flex gap-3 overflow-x-auto pb-2">
                            {AVATARS[avatarGender].map((url, i) => (
                                <img key={i} src={url} alt="avatar" 
                                    className={`w-14 h-14 rounded-full cursor-pointer border-2 transition ${profile?.avatar_url === url ? 'border-blue-600 scale-110' : 'border-transparent opacity-70'}`}
                                    onClick={() => setProfile({...profile, avatar_url: url})}
                                />
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Full Name</label>
                        <input className="w-full p-2 border rounded" value={profile?.name || ''} onChange={e => setProfile({...profile, name: e.target.value})} />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium mb-1">Designation</label>
                        <select className="w-full p-2 border rounded bg-white" value={profile?.role || ''} onChange={(e) => setProfile({...profile, role: e.target.value})}>
                            <option value="">Select Role</option>
                            <option value="caregiver">Caregiver</option>
                            <option value="nurse">Nurse</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Bio</label>
                        <textarea className="w-full p-2 border rounded h-24" placeholder="Experience..." value={profile?.bio || ''} onChange={e => setProfile({...profile, bio: e.target.value})} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="block text-sm font-medium">Phone</label><input className="w-full p-2 border rounded" value={profile?.phone || ''} onChange={e => setProfile({...profile, phone: e.target.value})} /></div>
                        <div><label className="block text-sm font-medium">Location</label><input className="w-full p-2 border rounded" value={profile?.location || ''} onChange={e => setProfile({...profile, location: e.target.value})} /></div>
                    </div>
                </div>
            )}

            {/* === TAB 2: PHYSICAL === */}
            {activeTab === 'physical' && (
                <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4 text-lg font-bold text-gray-800"><Activity className="w-5 h-5 text-green-600"/> Physical Info</div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium">Gender</label>
                            <select className="w-full p-2 border rounded bg-white" value={profile?.gender || ''} onChange={(e) => setProfile({...profile, gender: e.target.value})}>
                                <option value="">Select</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                            </select>
                        </div>
                        <div><label className="block text-sm font-medium">Age</label><input type="number" className="w-full p-2 border rounded" value={profile?.age || ''} onChange={e => setProfile({...profile, age: e.target.value})} /></div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="block text-sm font-medium">Height (ft)</label><input className="w-full p-2 border rounded" placeholder="5.6" value={profile?.height_ft || ''} onChange={e => setProfile({...profile, height_ft: e.target.value})} /></div>
                        <div><label className="block text-sm font-medium">Weight (kg)</label><input className="w-full p-2 border rounded" placeholder="62" value={profile?.weight_kg || ''} onChange={e => setProfile({...profile, weight_kg: e.target.value})} /></div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium">Marital Status</label>
                        <select className="w-full p-2 border rounded bg-white" value={profile?.marital_status || ''} onChange={(e) => setProfile({...profile, marital_status: e.target.value})}>
                             <option value="">Select</option>
                             <option value="Single">Single</option>
                             <option value="Married">Married</option>
                        </select>
                    </div>
                </div>
            )}

            {/* === TAB 3: VERIFICATION === */}
            {activeTab === 'verification' && (
                <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4 text-lg font-bold text-gray-800"><ShieldCheck className="w-5 h-5 text-purple-600"/> Verification Docs</div>

                    <div>
                        <label className="block text-sm font-medium">NID Number</label>
                        <input className="w-full p-2 border rounded" value={profile?.nid_number || ''} onChange={e => setProfile({...profile, nid_number: e.target.value})} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="border border-dashed p-4 rounded text-center">
                            <label className="block mb-2 text-sm text-gray-500">NID Front</label>
                            <input type="file" className="text-xs w-full" onChange={(e) => handleFileUpload(e, 'nid_front_url')} disabled={saving} />
                        </div>
                        <div className="border border-dashed p-4 rounded text-center">
                            <label className="block mb-2 text-sm text-gray-500">NID Back</label>
                            <input type="file" className="text-xs w-full" onChange={(e) => handleFileUpload(e, 'nid_back_url')} disabled={saving} />
                        </div>
                    </div>
                </div>
            )}

        </div>

        {/* সেভ বাটন */}
        <div className="mt-6 sticky bottom-4 z-50">
            <button onClick={handleSave} disabled={saving} className="w-full h-12 text-lg font-bold bg-blue-700 text-white hover:bg-blue-800 shadow-lg rounded-xl flex items-center justify-center">
                {saving ? <Loader2 className="animate-spin mr-2"/> : "Save Changes"}
            </button>
        </div>

      </main>
    </div>
  );
};

export default CaregiverProfile;