import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Building2, Briefcase, Flag } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

interface Stats {
  totalCaregivers: number;
  totalCompanies: number;
  activeJobs: number;
  totalReports: number;
}

const AdminOverview = () => {
  const [stats, setStats] = useState<Stats>({
    totalCaregivers: 0,
    totalCompanies: 0,
    activeJobs: 0,
    totalReports: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch caregiver count
        const { count: caregiverCount } = await supabase
          .from("user_roles")
          .select("*", { count: "exact", head: true })
          .in("role", ["caregiver", "nurse"]);

        // Fetch employer count
        const { count: companyCount } = await supabase
          .from("user_roles")
          .select("*", { count: "exact", head: true })
          .eq("role", "employer");

        // Fetch active jobs count
        const { count: jobsCount } = await supabase
          .from("jobs")
          .select("*", { count: "exact", head: true })
          .eq("status", "open");

        // Fetch reports count
        const { count: reportsCount } = await supabase
          .from("reports")
          .select("*", { count: "exact", head: true });

        setStats({
          totalCaregivers: caregiverCount || 0,
          totalCompanies: companyCount || 0,
          activeJobs: jobsCount || 0,
          totalReports: reportsCount || 0,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      title: "Total Caregivers",
      value: stats.totalCaregivers,
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      title: "Total Companies",
      value: stats.totalCompanies,
      icon: Building2,
      color: "text-green-600",
      bg: "bg-green-100",
    },
    {
      title: "Active Jobs",
      value: stats.activeJobs,
      icon: Briefcase,
      color: "text-purple-600",
      bg: "bg-purple-100",
    },
    {
      title: "Total Reports",
      value: stats.totalReports,
      icon: Flag,
      color: "text-red-600",
      bg: "bg-red-100",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard Overview</h1>
        <p className="text-muted-foreground">Welcome to the admin panel</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bg}`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {loading ? "..." : stat.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-muted-foreground">
          <p>• Manage users in the <strong>Users</strong> tab</p>
          <p>• Moderate job posts in the <strong>Jobs</strong> tab</p>
          <p>• Review reports in the <strong>Reports</strong> tab</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminOverview;
