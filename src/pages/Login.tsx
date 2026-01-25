// Login.tsx - শুধু রিডাইরেক্ট অংশ (সম্পূর্ণ ফাইল আগের মতো থাকবে, শুধু handleLogin ফাংশনটি আপডেট করুন)
const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast.error("Login failed", {
        description: error.message,
      });
      setLoading(false);
      return;
    }

    toast.success("Login successful", {
      description: "Welcome back! Redirecting to your dashboard...",
    });

    // ✅ সেশন পাওয়ার পর প্রোফাইল চেক করুন
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .single();

    // ২ সেকেন্ড পরে রিডাইরেক্ট
    setTimeout(() => {
      if (profile?.role === "admin") {
        navigate("/admin");
      } else if (profile?.role === "company" || profile?.role === "employer") {
        navigate("/dashboard/company");
      } else if (profile?.role === "caregiver" || profile?.role === "nurse") {
        navigate("/dashboard/caregiver");
      } else {
        // যদি রোল না থাকে, তাহলে ড্যাশবোর্ডে পাঠান
        navigate("/dashboard");
      }
    }, 1500);

  } catch (error) {
    console.error("Login error:", error);
    toast.error("An unexpected error occurred");
  } finally {
    setLoading(false);
  }
};