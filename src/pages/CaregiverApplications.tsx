import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Navbar from "@/components/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const CaregiverApplications = () => {
  const [applications, setApplications] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('applications')
          .select('*, jobs(title, company_name)')
          .eq('caregiver_id', user.id);
        setApplications(data || []);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Navbar />
      <main className="container mx-auto px-4 py-6 max-w-md">
        <h1 className="text-xl font-bold mb-4">My Applications</h1>
        {applications.length === 0 ? <p>No applications found.</p> : (
            <div className="space-y-3">
                {applications.map((app) => (
                    <Card key={app.id}>
                        <CardContent className="p-4">
                            <h3 className="font-bold">{app.jobs?.title}</h3>
                            <p className="text-sm text-gray-600">{app.jobs?.company_name}</p>
                            <Badge className="mt-2">{app.status}</Badge>
                        </CardContent>
                    </Card>
                ))}
            </div>
        )}
      </main>
    </div>
  );
};

export default CaregiverApplications;