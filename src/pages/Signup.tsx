import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";

const Signup = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // User type selection
  const [userType, setUserType] = useState<"caregiver" | "company">("caregiver");
  
  // Form fields
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // Error state
  const [error, setError] = useState("");
  
  // Cloudflare Turnstile
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaError, setCaptchaError] = useState("");
  const turnstileRef = useRef<HTMLDivElement>(null);

  // Cloudflare Turnstile site key (using test key - replace with your actual key in production)
  const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY || "1x00000000000000000000AA";

  // Check if already logged in
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/dashboard");
      }
    };
    checkUser();
  }, [navigate]);

  // Load Turnstile widget
  useEffect(() => {
    const loadTurnstile = () => {
      if (turnstileRef.current && (window as any).turnstile) {
        try {
          (window as any).turnstile.render(turnstileRef.current, {
            sitekey: TURNSTILE_SITE_KEY,
            callback: (token: string) => {
              setCaptchaToken(token);
              setCaptchaError("");
            },
            'error-callback': () => {
              setCaptchaError("CAPTCHA verification failed. Please try again.");
            },
            theme: 'light',
            size: 'normal',
          });
        } catch (error) {
          console.error("Turnstile render error:", error);
        }
      }
    };

    // Wait for Turnstile script to load
    if ((window as any).turnstile) {
      loadTurnstile();
    } else {
      const checkTurnstile = setInterval(() => {
        if ((window as any).turnstile) {
          clearInterval(checkTurnstile);
          loadTurnstile();
        }
      }, 100);

      return () => clearInterval(checkTurnstile);
    }
  }, [TURNSTILE_SITE_KEY]);

  // Email validation
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Handle signup submission
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setCaptchaError("");

    // Validate all fields
    if (userType === "company") {
      if (!companyName.trim()) {
        setError("Please enter your company name.");
        return;
      }
    } else {
      if (!fullName.trim()) {
        setError("Please enter your full name.");
        return;
      }
    }

    // Validate email format
    if (!isValidEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    // Validate password length (minimum 8 characters)
    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    // Check captcha
    if (!captchaToken) {
      setCaptchaError("Please verify you are not a robot.");
      return;
    }

    setLoading(true);

    try {
      const metadata: any = {
        user_type: userType,
      };

      if (userType === "company") {
        metadata.company_name = companyName;
      } else {
        metadata.full_name = fullName;
      }

      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/login`,
          data: metadata,
        },
      });

      if (authError) {
        // Handle specific auth errors
        if (authError.message.includes("User already registered")) {
          setError("Email already registered. Please log in instead.");
        } else {
          setError(authError.message);
        }
        return;
      }

      // Success - show message and redirect
      setSuccess(true);
      toast({
        title: "Success!",
        description: "Account created successfully! Please login to continue.",
      });
      
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err: any) {
      setError("Something went wrong, please try again.");
    } finally {
      setLoading(false);
      // Reset captcha after submission
      if ((window as any).turnstile) {
        (window as any).turnstile.reset();
      }
      setCaptchaToken(null);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto">
        {/* Success Message Banner */}
        {success && (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Account created successfully! Please login to continue.
            </AlertDescription>
          </Alert>
        )}

        {/* Error Message Banner */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Signup Card */}
        <Card className="shadow-lg rounded-2xl bg-background">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl font-bold">
              Create Account
            </CardTitle>
            <CardDescription className="text-base mt-2">
              Join HomeCare Job BD today
            </CardDescription>
          </CardHeader>
            
          <CardContent className="pb-8">
            <form onSubmit={handleSignup} className="space-y-5">
              {/* User Type Toggle */}
              <div className="flex gap-2 p-1 bg-muted rounded-lg">
                <button
                  type="button"
                  onClick={() => setUserType("caregiver")}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    userType === "caregiver" 
                      ? "bg-background shadow-sm text-foreground" 
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Caregiver / Nurse
                </button>
                <button
                  type="button"
                  onClick={() => setUserType("company")}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    userType === "company" 
                      ? "bg-background shadow-sm text-foreground" 
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Company
                </button>
              </div>

              {/* Conditional Name Field */}
              {userType === "company" ? (
                <div className="space-y-2">
                  <Label htmlFor="companyName" className="text-base font-medium">
                    Company Name *
                  </Label>
                  <Input
                    id="companyName"
                    type="text"
                    placeholder="Enter your company name"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    required
                    className="h-11 text-sm"
                    disabled={loading || success}
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-base font-medium">
                    Full Name *
                  </Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="h-11 text-sm"
                    disabled={loading || success}
                  />
                </div>
              )}

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-base font-medium">
                  Email Address *
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11 text-sm"
                  disabled={loading || success}
                />
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-base font-medium">
                  Password *
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  className="h-11 text-sm"
                  disabled={loading || success}
                />
                <p className="text-xs text-muted-foreground">
                  Password must contain at least 8 characters.
                </p>
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-base font-medium">
                  Confirm Password *
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                  className="h-11 text-sm"
                  disabled={loading || success}
                />
              </div>

              {/* Cloudflare Turnstile */}
              <div className="flex flex-col items-center justify-center py-3 w-full">
                <div 
                  ref={turnstileRef} 
                  className="cf-turnstile w-full flex justify-center"
                  style={{ minHeight: '65px' }}
                ></div>
                {captchaError && (
                  <p className="text-destructive text-sm mt-2 text-center">{captchaError}</p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading || success}
                className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-base rounded-xl shadow-md transition-all"
              >
                {loading ? "Creating account..." : success ? "Account Created!" : "Create Account"}
              </Button>
            </form>

            {/* Switch to Login Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-primary hover:text-primary/90 font-medium hover:underline"
                >
                  Log in here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Signup;
