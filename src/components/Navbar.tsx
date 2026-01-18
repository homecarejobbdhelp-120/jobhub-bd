import { Link, useNavigate, useLocation } from "react-router-dom";
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
  const location = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isEnglish, setIsEnglish] = useState(false);

  const isActive = (path: string) => location.pathname === path;

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
    <nav className="bg-white border-b border-slate-100 sticky top-0 z-50 shadow-sm h-16 flex items-center">
      <div className="container mx-auto px-4 flex justify-between items-center w-full">
        
        {/* LOGO SECTION - Moved Left */}
        <div className="flex items-center gap-2 cursor-pointer shrink-0" onClick={() => navigate("/")}>
          <div className="h-8 w-8 bg-emerald-50 rounded-lg flex items-center justify-center p-1">
             <img src="/logo-new.png" alt="Logo" className="h-full w-full object-contain" />
          </div>
          <span className="text-lg md:text-xl font-black text-slate-800 leading-none tracking-tight">
            HomeCare <span className="text-emerald-600">Job BD</span>
          </span>
        </div>

        {/* RIGHT ACTIONS */}
        <div className="flex items-center gap-3">
          
          {/* LOGIN/SIGNUP - Hidden on Mobile, Visible on Tablet/Desktop */}
          {!user && (
            <div className="hidden md:flex items-center gap-2">
              <Link to="/login" className="text-sm font-bold text-slate-600 hover:text-emerald-600 px-3 py-2">Login</Link>
              <Link to="/signup" className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold px-5 py-2 rounded-full shadow-lg shadow-emerald-100 active:scale-95 transition-transform">Sign Up</Link>
            </div>
          )}

          {/* HAMBURGER MENU - Always Visible */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-slate-800 hover:bg-slate-50 rounded-full h-10 w-10">
                <Menu className="h-6 w-6" />
              </Button>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent align="end" className="w-72 mt-3 p-2 rounded-[1.5rem] shadow-2xl border-slate-100 animate-in slide-in-from-top-2">
              
              {!user ? (
                <>
                  {/* MOBILE LOGIN BUTTONS (Inside Menu) */}
                  <div className="p-2 grid grid-cols-2 gap-2 mb-2 md:hidden">
                     <Button onClick={() => navigate("/login")} variant="outline" className="rounded-xl font-bold border-slate-200">Login</Button>
                     <Button onClick={() => navigate("/signup")} className="rounded-xl font-bold bg-emerald-600 text-white hover:bg-emerald-700">Sign Up</Button>
                  </div>

                  <DropdownMenuItem onClick={() => navigate("/")} className="py-3 px-4 rounded-xl font-medium cursor-pointer">
                    <Home className="mr-3 h-5 w-5 text-slate-400" /> Home
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/training")} className="py-3 px-4 rounded-xl font-medium cursor-pointer">
                    <GraduationCap className="mr-3 h-5 w-5 text-slate-400" /> Training
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/contact")} className="py-3 px-4 rounded-xl font-medium cursor-pointer">
                    <Phone className="mr-3 h-5 w-5 text-slate-400" /> Contact Us
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator className="bg-slate-100 my-2" />
                  
                  {/* LANGUAGE TOGGLE */}
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl mx-1">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-slate-400" />
                      <span className="text-xs font-black text-slate-600 uppercase">Language</span>
                    </div>
                    <div className="flex bg-white p-1 rounded-full border border-slate-200">
                      <button className={`px-3 py-1 text-[10px] rounded-full font-bold transition-all ${!isEnglish ? 'bg-emerald-600 text-white shadow' : 'text-slate-400'}`} onClick={() => setIsEnglish(false)}>BN</button>
                      <button className={`px-3 py-1 text-[10px] rounded-full font-bold transition-all ${isEnglish ? 'bg-emerald-600 text-white shadow' : 'text-slate-400'}`} onClick={() => setIsEnglish(true)}>EN</button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* USER PROFILE HEADER */}
                  <DropdownMenuLabel className="p-4 bg-slate-50 rounded-2xl mb-2 flex items-center gap-3 mx-1">
                    <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-lg border-2 border-white shadow-sm">
                       {profile?.name?.[0] || "U"}
                    </div>
                    <div className="overflow-hidden">
                      <p className="font-bold text-slate-800 truncate text-sm">{profile?.name || "User"}</p>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{userRole}</p>
                    </div>
                  </DropdownMenuLabel>
                  
                  {/* ROLE BASED MENU */}
                  {(userRole === 'caregiver' || userRole === 'nurse') ? (
                    <>
                       {/* Caregivers don't need Home, they need Feed */}
                      <DropdownMenuItem onClick={() => navigate("/feed")} className={`py-3 px-4 rounded-xl font-medium cursor-pointer ${isActive('/feed') ? 'text-emerald-600 bg-emerald-50 font-bold' : ''}`}>
                        <Rss className="mr-3 h-5 w-5" /> Job Feed
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate(`/profile/${user.id}`)} className={`py-3 px-4 rounded-xl font-medium cursor-pointer ${isActive(`/profile/${user.id}`) ? 'text-emerald-600 bg-emerald-50 font-bold' : ''}`}>
                         <UserIcon className="mr-3 h-5 w-5" /> My Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate("/training")} className={`py-3 px-4 rounded-xl font-medium cursor-pointer ${isActive('/training') ? 'text-emerald-600 bg-emerald-50 font-bold' : ''}`}>
                        <GraduationCap className="mr-3 h-5 w-5" /> Training
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <DropdownMenuItem onClick={() => navigate("/")} className="py-3 px-4 rounded-xl font-medium cursor-pointer">
                      <Home className="mr-3 h-5 w-5" /> Home
                    </DropdownMenuItem>
                  )}

                  {userRole === 'employer' && (
                    <DropdownMenuItem onClick={() => navigate("/dashboard/company")} className="py-3 px-4 rounded-xl font-bold text-emerald-600 cursor-pointer bg-emerald-50/50 mb-1">
                      <LayoutDashboard className="mr-3 h-5 w-5" /> Dashboard
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuItem onClick={() => navigate("/settings")} className="py-3 px-4 rounded-xl font-medium cursor-pointer">
                    <Settings className="mr-3 h-5 w-5 text-slate-400" /> Settings
                  </DropdownMenuItem>

                  <DropdownMenuSeparator className="bg-slate-100 my-2" />
                  
                  {/* APP SHARE */}
                  <DropdownMenuItem onClick={() => setShowShareModal(true)} className="py-3 px-4 rounded-xl font-medium cursor-pointer">
                    <Share2 className="mr-3 h-5 w-5 text-slate-400" /> Share App
                  </DropdownMenuItem>
                  
                  {/* LOGOUT */}
                  <DropdownMenuItem onClick={handleSignOut} className="py-3 px-4 rounded-xl font-bold text-red-500 cursor-pointer hover:bg-red-50 mt-1">
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