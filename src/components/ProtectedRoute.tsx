import { ReactNode, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";

export type AllowedRole = "admin" | "employer" | "caregiver" | "nurse";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: AllowedRole[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let mounted = true;

    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login");
        return;
      }
      if (allowedRoles && allowedRoles.length > 0) {
        const { data: roleData } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", session.user.id)
          .maybeSingle();
        const role = roleData?.role as AllowedRole | undefined;
        if (!role || !allowedRoles.includes(role)) {
          navigate("/");
          return;
        }
      }
      if (mounted) setChecking(false);
    };

    check();
    return () => { mounted = false; };
  }, [navigate, allowedRoles]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Checking access…</p>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
