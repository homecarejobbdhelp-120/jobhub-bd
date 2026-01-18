import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { Menu, User as UserIcon, Share2, Phone, Globe, GraduationCap, Home, LogOut, Briefcase, Settings, LayoutDashboard, Rss } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ShareModal from "./ShareModal";

const Navbar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  
  // ✨ Language State: Default is Bengali (BN)
  const [isEnglish, setIsEnglish] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
        fetchUserRole(session.user.id);
      }
    });
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
        fetchUserRole(session.user.id);
      } else {
        setProfile(null);
        setUserRole(null);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase.from("profiles").select("*").eq("id", userId).single();
    if (data) setProfile(data);
  };

  const fetchUserRole = async (userId: string) => {
    const { data } = await supabase.from("user_roles").select("role").eq("user_id", userId).single();
    if (data) setUserRole(data.role);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <nav className="bg-white border-b border-slate-100 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 h-16 flex justify-between items-center">
        
        {/* LEFT SIDE: LOGO & BRAND */}
        <div className="flex items-center gap-2 cursor-pointer shrink-0" onClick={() => navigate("/")}>
          <div className="bg-white p-1 rounded-md border border-slate-100 shadow-sm">
            <img src="/logo-new.png" alt="Logo" className="h-9 w-auto" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg md:text-xl font-black text-slate-800 leading-none whitespace-nowrap">
              HomeCare <span className="text-emerald-600">Job BD</span>
            </span>
          </div>
        </div>

        {/* RIGHT SIDE: ACTIONS & MENU */}
        <div className="flex items-center gap-1 md:gap-3">
          
          {!user && (
            <div className="flex items-center gap-1 md:gap-2 mr-1">
              <Link to="/login" className="text-sm font-bold text-slate-600 hover:text-emerald-600 px-2 md:px-4 py-2 transition-colors">Login</Link>
              <Link to="/signup" className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs md:text-sm font-bold px-3 md:px-5 py-2 rounded-full shadow-lg shadow-emerald-100 transition-all active:scale-95">Sign Up</Link>
            </div>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-slate-800 hover:bg-slate-50 rounded-full h-10 w-10">
                <Menu className="h-7 w-7" />
              </Button>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent align="end" className="w-72 mt-2 p-2 rounded-3xl shadow-2xl border-slate-100 animate-in slide-in-from-top-2">
              
              {!user ? (
                <>
                  <DropdownMenuItem onClick={() => navigate("/")} className="py-3 rounded-xl cursor-pointer">
                    <Home className="mr-3 h-5 w-5 text-slate-400" /> Home
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/signup")} className="py-3 rounded-xl cursor-pointer text-emerald-600 font-bold">
                    <UserIcon className="mr-3 h-5 w-5" /> Registration
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/training")} className="py-3 rounded-xl cursor-pointer">
                    <GraduationCap className="mr-3 h-5 w-5 text-slate-400" /> Training
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  
                  {/* Visitor Language Toggle */}
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl mx-1 my-1">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-slate-400" />
                      <span className="text-xs font-black text-slate-700 uppercase tracking-tighter">Language</span>
                    </div>
                    <div className="flex bg-white p-1 rounded-full border border-slate-200">
                      <button className={`px-4 py-1.5 text-[10px] rounded-full font-black transition-all ${!isEnglish ? 'bg-emerald-600 text-white shadow-md scale-105' : 'text-slate-400'}`} onClick={() => setIsEnglish(false)}>BN</button>
                      <button className={`px-4 py-1.5 text-[10px] rounded-full font-black transition-all ${isEnglish ? 'bg-emerald-600 text-white shadow-md scale-105' : 'text-slate-400'}`} onClick={() => setIsEnglish(true)}>EN</button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <DropdownMenuLabel className="p-4 bg-slate-50 rounded-2xl mb-2 flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-xl border-2 border-white shadow-sm">
                       {profile?.name?.[0] || "U"}
                    </div>
                    <div className="overflow-hidden">
                      <p className="font-bold text-slate-800 truncate">{profile?.name || "User"}</p>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{userRole}</p>
                    </div>
                  </DropdownMenuLabel>
                  
                  <DropdownMenuItem onClick={() => navigate("/")} className="py-3 rounded-xl cursor-pointer">
                    <Home className="mr-3 h-5 w-5 text-slate-400" /> Home
                  </DropdownMenuItem>

                  {/* CAREGIVER SPECIFIC */}
                  {(userRole === 'caregiver' || userRole === 'nurse') && (
                    <>
                      <DropdownMenuItem onClick={() => navigate(`/profile/${user.id}`)} className="py-3 rounded-xl cursor-pointer">
                        <UserIcon className="mr-3 h-5 w-5 text-slate-400" /> My Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate("/feed")} className="py-3 rounded-xl cursor-pointer">
                        <Rss className="mr-3 h-5 w-5 text-slate-400" /> Job Feed
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate("/training")} className="py-3 rounded-xl cursor-pointer font-bold text-emerald-600">
                        <GraduationCap className="mr-3 h-5 w-5" /> Training
                      </DropdownMenuItem>
                    </>
                  )}

                  {/* EMPLOYER SPECIFIC */}
                  {userRole === 'employer' && (
                    <DropdownMenuItem onClick={() => navigate("/dashboard/company")} className="py-3 rounded-xl cursor-pointer font-bold text-emerald-600">
                      <LayoutDashboard className="mr-3 h-5 w-5" /> Dashboard & Post Job
                    </DropdownMenuItem>
                  )}

                  {/* ✨ AUTHENTICATED USER LANGUAGE SLIDE TOGGLE */}
                  <div className="flex items-center justify-between p-3 bg-emerald-50/50 rounded-2xl mx-1 my-2 border border-emerald-100">
                    <div className="flex items-center gap-2 pl-1">
                      <Globe className="h-4 w-4 text-emerald-600" />
                      <span className="text-xs font-black text-emerald-900 uppercase tracking-tighter">ভাষা / Lang</span>
                    </div>
                    <div className="flex bg-white p-1 rounded-full border border-emerald-100 shadow-inner">
                      <button 
                        className={`px-4 py-1.5 text-[10px] rounded-full font-black transition-all duration-300 ${!isEnglish ? 'bg-emerald-600 text-white shadow-lg scale-105' : 'text-slate-400 hover:text-emerald-600'}`} 
                        onClick={() => setIsEnglish(false)}
                      >
                        বাংলা
                      </button>
                      <button 
                        className={`px-4 py-1.5 text-[10px] rounded-full font-black transition-all duration-300 ${isEnglish ? 'bg-emerald-600 text-white shadow-lg scale-105' : 'text-slate-400 hover:text-emerald-600'}`} 
                        onClick={() => setIsEnglish(true)}
                      >
                        EN
                      </button>
                    </div>
                  </div>

                  <DropdownMenuItem onClick={() => navigate("/settings")} className="py-3 rounded-xl cursor-pointer">
                    <Settings className="mr-3 h-5 w-5 text-slate-400" /> Settings
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setShowShareModal(true)} className="py-3 rounded-xl cursor-pointer">
                    <Share2 className="mr-3 h-5 w-5 text-slate-400" /> Share App
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSignOut} className="py-3 rounded-xl text-red-600 font-bold cursor-pointer hover:bg-red-50">
                    <LogOut className="mr-3 h-5 w-5" /> Logout
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <ShareModal open={showShareModal} onOpenChange={setShowShareModal} />
    </nav>
  );
};

export default Navbar;