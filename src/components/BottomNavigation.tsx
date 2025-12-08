import { Home, MessageSquare, User, Briefcase, PlusCircle } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

interface BottomNavigationProps {
  role: "caregiver" | "employer";
}

const BottomNavigation = ({ role }: BottomNavigationProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const caregiverTabs = [
    { icon: Home, label: "Feed", path: "/dashboard/caregiver?tab=feed" },
    { icon: MessageSquare, label: "Messages", path: "/dashboard/caregiver?tab=messages" },
    { icon: User, label: "Profile", path: "/dashboard/caregiver?tab=profile" },
  ];

  const employerTabs = [
    { icon: Briefcase, label: "My Jobs", path: "/dashboard/company?tab=jobs" },
    { icon: PlusCircle, label: "Post Job", path: "/dashboard/company?tab=post" },
    { icon: User, label: "Profile", path: "/dashboard/company?tab=profile" },
  ];

  const tabs = role === "caregiver" ? caregiverTabs : employerTabs;

  const isActive = (path: string) => {
    return location.pathname + location.search === path;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-40 safe-area-inset-bottom">
      <div className="max-w-lg mx-auto">
        <div className="flex justify-around items-center h-12">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = isActive(tab.path);
            return (
              <button
                key={tab.path}
                onClick={() => navigate(tab.path)}
                className={cn(
                  "flex flex-col items-center justify-center flex-1 h-full transition-colors py-1",
                  active
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="text-[10px] font-medium mt-0.5">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default BottomNavigation;
