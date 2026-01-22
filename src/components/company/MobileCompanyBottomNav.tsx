import { Home, Briefcase, PlusCircle, Users, Menu } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileCompanyBottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const MobileCompanyBottomNav = ({ activeTab, onTabChange }: MobileCompanyBottomNavProps) => {
  const navItems = [
    { id: "home", label: "Home", icon: Home },
    { id: "jobs", label: "My Jobs", icon: Briefcase },
    { id: "post", label: "Post Job", icon: PlusCircle, isSpecial: true }, // Special Highlight
    { id: "applicants", label: "Applicants", icon: Users },
    { id: "menu", label: "Menu", icon: Menu },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 h-16 px-2 flex justify-between items-center z-50 md:hidden shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        
        // Post Job বাটনটি একটু স্পেশাল হবে (মাঝখানে এবং বড়)
        if (item.isSpecial) {
            return (
                <button
                    key={item.id}
                    onClick={() => onTabChange(item.id)}
                    className="relative -top-5"
                >
                    <div className={cn(
                        "w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 border-4 border-gray-50",
                        isActive ? "bg-blue-700 scale-110" : "bg-blue-600 hover:bg-blue-700"
                    )}>
                        <PlusCircle className="w-8 h-8 text-white" />
                    </div>
                    <span className="block text-[10px] font-bold text-blue-900 text-center mt-1">Post</span>
                </button>
            )
        }

        return (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={cn(
              "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors duration-200",
              isActive ? "text-blue-700" : "text-gray-400 hover:text-gray-600"
            )}
          >
            <Icon 
              className={cn(
                "w-6 h-6 transition-all duration-200",
                isActive ? "fill-current scale-110" : "scale-100"
              )} 
              strokeWidth={isActive ? 2.5 : 2}
            />
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default MobileCompanyBottomNav;