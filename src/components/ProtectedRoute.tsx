import { ReactNode, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { Loader2 } from "lucide-react";

export type AllowedRole = "admin" | "employer" | "caregiver" | "nurse";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: AllowedRole[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    let mounted = true;

    const check = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          if (mounted) navigate("/login", { replace: true });
          return;
        }

        // If no specific roles required, just check auth
        if (!allowedRoles || allowedRoles.length === 0) {
          if (mounted) {
            setAuthorized(true);
            setChecking(false);
          }
          return;
        }

        // Check user role
        const { data: roleData, error } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", session.user.id)
          .maybeSingle();

        if (error) {
          console.error("Error fetching role:", error);
          if (mounted) navigate("/", { replace: true });
          return;
        }

        const role = roleData?.role as AllowedRole | undefined;
        
        // Allow access if user has required role
        const hasAccess = role && allowedRoles.includes(role);
        
        if (!hasAccess) {
          console.log("User role not authorized:", role, "Required:", allowedRoles);
          if (mounted) navigate("/", { replace: true });
          return;
        }

        if (mounted) {
          setAuthorized(true);
          setChecking(false);
        }
      } catch (error) {
        console.error("Error in protected route:", error);
        if (mounted) navigate("/", { replace: true });
      }
    };

    check();
    return () => { mounted = false; };
  }, [navigate, allowedRoles]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (!authorized) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
