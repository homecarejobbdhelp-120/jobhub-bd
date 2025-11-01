import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, LogIn, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface AuthPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultMode?: "login" | "signup";
}

const AuthPopup = ({ open, onOpenChange, defaultMode = "login" }: AuthPopupProps) => {
  const [mode, setMode] = useState<"login" | "signup">(defaultMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string>("");
  const turnstileRef = useRef<HTMLDivElement>(null);
  const turnstileWidgetId = useRef<string | null>(null);
  const navigate = useNavigate();

  // Load Turnstile widget
  useEffect(() => {
    if (!open) return;

    const loadTurnstile = () => {
      if (window.turnstile && turnstileRef.current) {
        turnstileWidgetId.current = window.turnstile.render(turnstileRef.current, {
          sitekey: "0x4AAAAAAB6---qkWG8NYhRuG",
          callback: (token: string) => setTurnstileToken(token),
        }) as any;
      }
    };

    if (window.turnstile) {
      loadTurnstile();
    } else {
      const script = document.createElement("script");
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
      script.async = true;
      script.defer = true;
      script.onload = loadTurnstile;
      document.body.appendChild(script);
    }
  }, [open, mode]);

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setFullName("");
    setTurnstileToken("");
    if (window.turnstile) {
      window.turnstile.reset();
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isValidEmail(email)) {
      toast({ title: "Error", description: "Please enter a valid email address", variant: "destructive" });
      return;
    }

    if (!password) {
      toast({ title: "Error", description: "Please enter your password", variant: "destructive" });
      return;
    }

    if (!turnstileToken) {
      toast({ title: "Error", description: "Please complete the security check", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        const { data: roleData } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", data.user.id)
          .single();

        toast({ title: "Success", description: "Logged in successfully!" });
        onOpenChange(false);
        resetForm();

        if (roleData?.role === "employer") {
          navigate("/company-feed");
        } else if (roleData?.role === "caregiver" || roleData?.role === "nurse") {
          navigate("/feed");
        } else {
          navigate("/dashboard");
        }
      }
    } catch (error: any) {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to login", 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
      if (window.turnstile) {
        window.turnstile.reset();
      }
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim()) {
      toast({ title: "Error", description: "Please enter your full name", variant: "destructive" });
      return;
    }

    if (!isValidEmail(email)) {
      toast({ title: "Error", description: "Please enter a valid email address", variant: "destructive" });
      return;
    }

    if (password.length < 6) {
      toast({ title: "Error", description: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }

    if (password !== confirmPassword) {
      toast({ title: "Error", description: "Passwords do not match", variant: "destructive" });
      return;
    }

    if (!turnstileToken) {
      toast({ title: "Error", description: "Please complete the security check", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName,
            user_type: "caregiver",
          },
        },
      });

      if (error) throw error;

      toast({ 
        title: "Success", 
        description: "Account created successfully! Please check your email to verify your account." 
      });
      onOpenChange(false);
      resetForm();
    } catch (error: any) {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to create account", 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
      if (window.turnstile) {
        window.turnstile.reset();
      }
    }
  };

  const handleModeToggle = () => {
    setMode(mode === "login" ? "signup" : "login");
    resetForm();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      onOpenChange(isOpen);
      if (!isOpen) resetForm();
    }}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-[440px] mx-auto p-6 sm:p-8 rounded-xl z-[100] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-center text-xl sm:text-2xl font-bold">
            {mode === "login" ? "Welcome Back" : "Create Account"}
          </DialogTitle>
          <DialogDescription className="text-center text-sm sm:text-base">
            {mode === "login" 
              ? "Please login to continue" 
              : "Sign up to get started"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={mode === "login" ? handleLogin : handleSignup} className="space-y-4 mt-6">
          {mode === "signup" && (
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Enter your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={loading}
                required
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          {mode === "signup" && (
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
                required
              />
            </div>
          )}

          <div ref={turnstileRef} className="flex justify-center" />

          <Button 
            type="submit"
            className="w-full h-11 sm:h-12 bg-primary text-primary-foreground hover:bg-primary/90 text-base font-semibold"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                {mode === "login" ? "Logging in..." : "Creating account..."}
              </>
            ) : (
              <>
                {mode === "login" ? (
                  <>
                    <LogIn className="mr-2 h-5 w-5" />
                    Login
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-5 w-5" />
                    Sign Up
                  </>
                )}
              </>
            )}
          </Button>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={handleModeToggle}
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
              disabled={loading}
            >
              {mode === "login" 
                ? "Don't have an account? Sign up" 
                : "Already have an account? Login"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AuthPopup;
