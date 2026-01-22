import { User, Home, Briefcase, Bell, BookOpen, Share2, Settings, LogOut, ChevronRight } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";

const CaregiverMenu = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const menuItems = [
    { icon: User, label: "Profile", path: "/profile" },
    { icon: Home, label: "Home", action: () => {} }, // Already on dashboard
    { icon: Briefcase, label: "My Jobs (Applications)", action: () => {} },
    { icon: Bell, label: "Notifications", path: "/notifications" },
    { icon: BookOpen, label: "Training", path: "/training" },
    { icon: Share2, label: "Share App", action: () => { navigator.share({ title: 'HomeCare Job BD', url: window.location.href }) } },
    { icon: Settings, label: "Settings", path: "/settings" },
  ];

  return (
    <div className="pb-20 bg-gray-50 min-h-screen">
      {/* Profile Card Section (Shomvob Style) */}
      <div className="bg-white p-4 mb-4 shadow-sm">
        <div className="bg-green-50 rounded-xl p-4 flex items-center gap-4 border border-green-100 relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-green-100 rounded-bl-full -mr-4 -mt-4 opacity-50"></div>

            <Avatar className="w-16 h-16 border-2 border-white shadow-md z-10">
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            
            <div className="z-10">
              <h2 className="text-lg font-bold text-gray-800">Md. Asadullah</h2>
              <p className="text-sm text-gray-500">+880 1308-2063...</p>
              <div className="mt-1 flex items-center gap-1">
                 <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold">Profile Incomplete</span>
                 <span className="text-xs text-blue-600 underline cursor-pointer">Complete Now</span>
              </div>
            </div>
        </div>
      </div>

      {/* Menu List */}
      <div className="bg-white shadow-sm mx-4 rounded-xl overflow-hidden">
        {menuItems.map((item, index) => (
          <div 
            key={index} 
            onClick={() => item.path ? navigate(item.path) : item.action?.()}
            className="flex items-center justify-between p-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                <item.icon className="w-5 h-5" />
              </div>
              <span className="font-medium text-gray-700">{item.label}</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-300" />
          </div>
        ))}

        {/* Logout Button */}
        <div 
          onClick={handleLogout}
          className="flex items-center gap-4 p-4 hover:bg-red-50 cursor-pointer transition-colors text-red-600 border-t border-gray-100"
        >
          <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
            <LogOut className="w-5 h-5" />
          </div>
          <span className="font-medium">Logout</span>
        </div>
      </div>

      <div className="text-center mt-8 text-xs text-gray-400">
        Version 1.0.0
      </div>
    </div>
  );
};

export default CaregiverMenu;