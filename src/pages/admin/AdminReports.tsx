import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Check, X, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface Report {
  id: string;
  reason: string;
  status: string | null;
  created_at: string | null;
  reporter_id: string;
  reported_user_id: string | null;
  job_id: string | null;
  reporter?: { name: string; email: string };
  reported_user?: { name: string; email: string };
}

const AdminReports = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchReports = async () => {
    try {
      const { data, error } = await supabase
        .from("reports")
        .select(`
          id, reason, status, created_at, reporter_id, reported_user_id, job_id,
          reporter:profiles!reports_reporter_id_fkey(name, email),
          reported_user:profiles!reports_reported_user_id_fkey(name, email)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setReports((data as unknown as Report[]) || []);
    } catch (error) {
      console.error("Error fetching reports:", error);
      toast({
        title: "Error",
        description: "Failed to fetch reports",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleUpdateStatus = async (reportId: string, status: "resolved" | "dismissed") => {
    setUpdating(reportId);
    try {
      const { error } = await supabase
        .from("reports")
        .update({ status })
        .eq("id", reportId);
      
      if (error) throw error;

      toast({
        title: "Report Updated",
        description: `Report has been marked as ${status}`,
      });
      
      setReports(reports.map((r) => 
        r.id === reportId ? { ...r, status } : r
      ));
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update report",
        variant: "destructive",
      });
    } finally {
      setUpdating(null);
    }
  };

  const getStatusBadge = (status: string | null) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: "outline",
      resolved: "default",
      dismissed: "secondary",
    };
    const colors: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
      resolved: "bg-green-100 text-green-800 border-green-300",
      dismissed: "bg-gray-100 text-gray-800 border-gray-300",
    };
    return (
      <Badge variant="outline" className={colors[status || "pending"]}>
        {status || "pending"}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Report Management</h1>
        <p className="text-muted-foreground">Review and manage user reports</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Reports ({reports.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : reports.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">No reports found</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Reporter</TableHead>
                    <TableHead>Reported User</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{report.reporter?.name || "Unknown"}</p>
                          <p className="text-xs text-muted-foreground">{report.reporter?.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{report.reported_user?.name || "N/A"}</p>
                          <p className="text-xs text-muted-foreground">{report.reported_user?.email}</p>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">{report.reason}</TableCell>
                      <TableCell>{getStatusBadge(report.status)}</TableCell>
                      <TableCell>
                        {report.created_at 
                          ? format(new Date(report.created_at), "MMM d, yyyy")
                          : "N/A"}
                      </TableCell>
                      <TableCell className="text-right">
                        {report.status === "pending" && (
                          <div className="flex gap-1 justify-end">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="text-green-600 hover:text-green-700 hover:bg-green-100"
                              disabled={updating === report.id}
                              onClick={() => handleUpdateStatus(report.id, "resolved")}
                              title="Resolve"
                            >
                              {updating === report.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Check className="w-4 h-4" />
                              )}
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="text-gray-600 hover:text-gray-700 hover:bg-gray-100"
                              disabled={updating === report.id}
                              onClick={() => handleUpdateStatus(report.id, "dismissed")}
                              title="Dismiss"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminReports;
