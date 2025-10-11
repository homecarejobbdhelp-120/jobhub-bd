import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Briefcase, Users, FileText, AlertTriangle, CheckCircle, Clock } from "lucide-react";

const Dashboard = () => {
  // TODO: Get actual user role from auth
  const userRole = ("caregiver" as "caregiver" | "employer" | "admin");

  // Mock data
  const stats = {
    caregiver: {
      applied: 8,
      accepted: 2,
      rejected: 1,
      pending: 5
    },
    employer: {
      jobs: 5,
      applications: 23,
      filled: 2,
      open: 3
    },
    admin: {
      users: 156,
      jobs: 87,
      reports: 12,
      pending_verifications: 8
    }
  };

  const renderCaregiverDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Applied Jobs</CardDescription>
            <CardTitle className="text-3xl">{stats.caregiver.applied}</CardTitle>
          </CardHeader>
          <CardContent>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Accepted</CardDescription>
            <CardTitle className="text-3xl text-green-600">{stats.caregiver.accepted}</CardTitle>
          </CardHeader>
          <CardContent>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Pending</CardDescription>
            <CardTitle className="text-3xl text-yellow-600">{stats.caregiver.pending}</CardTitle>
          </CardHeader>
          <CardContent>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Rejected</CardDescription>
            <CardTitle className="text-3xl text-red-600">{stats.caregiver.rejected}</CardTitle>
          </CardHeader>
          <CardContent>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>My Applications</CardTitle>
          <CardDescription>Track your job applications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex justify-between items-center p-4 border rounded-lg">
                <div>
                  <h3 className="font-semibold">Full-Time Elder Care Assistant</h3>
                  <p className="text-sm text-muted-foreground">Applied 2 days ago</p>
                </div>
                <Badge>Pending</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderEmployerDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Jobs</CardDescription>
            <CardTitle className="text-3xl">{stats.employer.jobs}</CardTitle>
          </CardHeader>
          <CardContent>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Applications</CardDescription>
            <CardTitle className="text-3xl">{stats.employer.applications}</CardTitle>
          </CardHeader>
          <CardContent>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Open Jobs</CardDescription>
            <CardTitle className="text-3xl text-green-600">{stats.employer.open}</CardTitle>
          </CardHeader>
          <CardContent>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Filled Jobs</CardDescription>
            <CardTitle className="text-3xl text-blue-600">{stats.employer.filled}</CardTitle>
          </CardHeader>
          <CardContent>
            <Users className="h-4 w-4 text-blue-600" />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>My Job Posts</CardTitle>
            <CardDescription>Manage your job listings</CardDescription>
          </div>
          <Link to="/post-job">
            <Button>Post New Job</Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex justify-between items-center p-4 border rounded-lg">
                <div>
                  <h3 className="font-semibold">Full-Time Elder Care Assistant</h3>
                  <p className="text-sm text-muted-foreground">8 applications</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">View Applicants</Button>
                  <Button variant="outline" size="sm">Edit</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderAdminDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Users</CardDescription>
            <CardTitle className="text-3xl">{stats.admin.users}</CardTitle>
          </CardHeader>
          <CardContent>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Active Jobs</CardDescription>
            <CardTitle className="text-3xl">{stats.admin.jobs}</CardTitle>
          </CardHeader>
          <CardContent>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Pending Reports</CardDescription>
            <CardTitle className="text-3xl text-yellow-600">{stats.admin.reports}</CardTitle>
          </CardHeader>
          <CardContent>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Pending Verifications</CardDescription>
            <CardTitle className="text-3xl text-blue-600">{stats.admin.pending_verifications}</CardTitle>
          </CardHeader>
          <CardContent>
            <FileText className="h-4 w-4 text-blue-600" />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Reports</CardTitle>
            <CardDescription>Review user and job reports</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex justify-between items-center p-4 border rounded-lg">
                  <div>
                    <h3 className="font-semibold">Report #{i}</h3>
                    <p className="text-sm text-muted-foreground">Submitted 1 day ago</p>
                  </div>
                  <Button variant="outline" size="sm">Review</Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Verification Requests</CardTitle>
            <CardDescription>Caregiver verification pending</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex justify-between items-center p-4 border rounded-lg">
                  <div>
                    <h3 className="font-semibold">John Doe</h3>
                    <p className="text-sm text-muted-foreground">NID & CV submitted</p>
                  </div>
                  <Button variant="outline" size="sm">Review</Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link to="/">
              <h1 className="text-2xl font-bold text-primary">HomeCare Job BD</h1>
            </Link>
            <div className="flex gap-2">
              <Link to="/profile">
                <Button variant="outline">Profile</Button>
              </Link>
              <Button variant="outline">Sign Out</Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's an overview of your activity.
          </p>
        </div>

        {userRole === "caregiver" && renderCaregiverDashboard()}
        {userRole === "employer" && renderEmployerDashboard()}
        {userRole === "admin" && renderAdminDashboard()}
      </div>
    </div>
  );
};

export default Dashboard;
