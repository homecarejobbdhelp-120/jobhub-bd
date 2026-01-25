// src/pages/admin/AdminOverview.tsx
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Briefcase, FileCheck, ShieldAlert } from "lucide-react";

const AdminOverview = () => {
  const [stats, setStats] = useState({ 
    caregivers: 0, 
    companies: 0, 
    activeJobs: 0, 
    pendingVerifications: 0 
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Caregivers & Nurses
      const { count: caregiverCount } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .in("role", ["caregiver", "nurse"]);

      // Companies
      const { count: companyCount } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("role", "employer");

      // Active Jobs
      const { count: jobCount } = await supabase
        .from("jobs")
        .select("*", { count: "exact", head: true })
        .eq("status", "open");

      // Pending Verifications
      const { count: verifyCount } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("verified", false)
        .in("role", ["caregiver", "nurse"]);

      setStats({ 
        caregivers: caregiverCount || 0, 
        companies: companyCount || 0, 
        activeJobs: jobCount || 0, 
        pendingVerifications: verifyCount || 0 
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const statCards = [
    { title: "Caregivers", value: stats.caregivers, icon: Users, color: "text-blue-600", bg: "bg-blue-100" },
    { title: "Companies", value: stats.companies, icon: Briefcase, color: "text-green-600", bg: "bg-green-100" },
    { title: "Active Jobs", value: stats.activeJobs, icon: FileCheck, color: "text-purple-600", bg: "bg-purple-100" },
    { title: "Pending Verifications", value: stats.pendingVerifications, icon: ShieldAlert, color: "text-red-600", bg: "bg-red-100" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">System Overview</h1>
        <p className="text-muted-foreground">Platform statistics and metrics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <div className={`p-2 rounded-lg ${stat.bg}`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminOverview;