import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, User, LogOut, Heart, Home, Plus } from "lucide-react"; // কাস্টম লোগোর জন্য আইকন
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50 w-full border-b border-gray-100 font-sans h-16 md:h-20 flex items-center">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center w-full">
          
          {/* === বাম পাশ: কাস্টম ব্র্যান্ড লোগো === */}
          <div className="flex items-center flex-shrink-0">
            <Link to="/" className="flex items-center gap-3 group">
              
              {/* --- লোগো আইকন (মিনিংফুল ডিজাইন) --- */}
              <div className="relative w-10 h-10 md:w-12 md:h-12 flex items-center justify-center">
                 
                 {/* ১. ঘর (Home) - নীল (সুরক্ষা) */}
                 <Home className="w-full h-full text-blue-900 absolute z-10" strokeWidth={2} />
                 
                 {/* ২. হার্ট (Care) - ঘরের ঠিক মাঝখানে সবুজ হার্ট */}
                 <div className="absolute z-20 top-[40%] bg-white rounded-full p-[1px]">
                    <Heart className="w-4 h-4 md:w-5 md:h-5 text-green-600 fill-green-600" />
                 </div>

                 {/* ৩. প্লাস (+) - মেডিকেল সাইন (উপরে ডানদিকে) */}
                 <div className="absolute top-0 right-0 z-30 bg-white rounded-full border border-blue-100">
                    <Plus className="w-3 h-3 md:w-4 md:h-4 text-green-600 stroke-[4px]" />
                 </div>
              </div>
              
              {/* --- টেক্সট লোগো --- */}
              <div className="flex flex-col justify-center -space-y-1">
                <div className="flex items-center text-lg md:text-2xl font-extrabold tracking-tight">
                  <span className="text-blue-900">HomeCare</span>
                  <span className="text-green-600 ml-1">JobBD</span>
                </div>
                <span className="text-[9px] md:text-[10px] font-bold text-gray-400 tracking-[0.2em] uppercase pl-0.5">
                  Medical & Care
                </span>
              </div>
            </Link>
          </div>

          {/* === ডান পাশ: লগইন বাটন (মোবাইল ফ্রেন্ডলি) === */}
          <div className="flex items-center justify-end gap-3 flex-1 md:flex-none">
            
            {/* ১. মোবাইল ভিউ: সিরিয়াল বাটন (Login & Create) */}
            <div className="md:hidden flex flex-col items-end gap-1 mr-1">
                {!user ? (
                    <>
                        <Link to="/login">
                            <span className="block text-[10px] font-bold px-3 py-1 border border-blue-600 text-blue-700 rounded-md bg-blue-50 leading-none active:scale-95 transition-transform text-center w-[85px]">
                                Login
                            </span>
                        </Link>
                        <Link to="/login">
                            <span className="block text-[10px] font-bold px-3 py-1 bg-green-600 text-white rounded-md leading-none active:scale-95 transition-transform text-center w-[85px] border border-green-700 shadow-sm">
                                Create Account
                            </span>
                        </Link>
                    </>
                ) : (
                    <Link to="/profile" className="bg-blue-100 p-2 rounded-full text-blue-900 border border-blue-200">
                        <User className="w-5 h-5" />
                    </Link>
                )}
            </div>

            {/* ২. ডেস্কটপ মেনু */}
            <div className="hidden md:flex items-center space-x-8">
                <Link to="/" className="text-gray-600 hover:text-blue-900 font-semibold transition text-sm uppercase">Home</Link>
                <Link to="/jobs" className="text-gray-600 hover:text-blue-900 font-semibold transition text-sm uppercase">Jobs</Link>
                <Link to="/training" className="text-gray-600 hover:text-blue-900 font-semibold transition text-sm uppercase">Training</Link>
                
                {user ? (
                <div className="flex items-center gap-4 ml-4 pl-4 border-l border-gray-200">
                    <Link to="/profile">
                    <Button variant="outline" className="flex items-center gap-2 border-blue-200 text-blue-900 hover:bg-blue-50 rounded-full px-4">
                        <User className="w-4 h-4" /> Profile
                    </Button>
                    </Link>
                    <Button onClick={handleLogout} variant="ghost" className="text-red-500 hover:bg-red-50 hover:text-red-700 rounded-full px-3">
                    <LogOut className="w-4 h-4" />
                    </Button>
                </div>
                ) : (
                <Link to="/login">
                    <Button className="bg-blue-900 hover:bg-blue-800 text-white font-bold px-8 py-2 rounded-full shadow-lg">
                    Login / Join
                    </Button>
                </Link>
                )}
            </div>

            {/* ৩. মোবাইল হ্যামবার্গার */}
            <button onClick={() => setIsOpen(!isOpen)} className="md:hidden text-gray-600 hover:text-blue-900 p-1 rounded-md hover:bg-gray-100 transition border border-gray-200">
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* মোবাইল ড্রপডাউন */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-xl absolute top-16 left-0 w-full animate-in slide-in-from-top-2 z-40">
          <div className="px-4 pt-2 pb-6 space-y-2">
            <Link to="/" className="block px-4 py-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-blue-50 border-b border-gray-50" onClick={() => setIsOpen(false)}>Home</Link>
            <Link to="/jobs" className="block px-4 py-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-blue-50 border-b border-gray-50" onClick={() => setIsOpen(false)}>All Jobs</Link>
            <Link to="/training" className="block px-4 py-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-blue-50 border-b border-gray-50" onClick={() => setIsOpen(false)}>Training</Link>
            
            {user && (
              <div className="mt-2 pt-2">
                <button onClick={() => { handleLogout(); setIsOpen(false); }} className="flex items-center gap-2 w-full text-left px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50">
                  <LogOut className="w-4 h-4"/> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;