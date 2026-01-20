import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Trash2, ShieldCheck, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

const AdminUsers = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    // ✅ user_roles টেবিল বাদ দিয়ে সরাসরি profiles টেবিল থেকে ডাটা আনা হচ্ছে
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) toast.error("Error fetching users");
    else setUsers(data || []);
    setLoading(false);
  };

  const handleVerifyUser = async (userId: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('profiles')
      .update({ verified: !currentStatus })
      .eq('id', userId);
    
    if (error) toast.error("Failed to update status");
    else {
      toast.success(currentStatus ? "User Unverified" : "User Verified Successfully");
      fetchUsers();
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if(!confirm("Are you sure? This will delete the user permanently.")) return;
    const { error } = await supabase.from('profiles').delete().eq('id', userId); // profile ডিলিট হলে auth user-ও ডিলিট হবে (যদি trigger থাকে)
    if (error) toast.error("Failed to delete user");
    else {
      toast.success("User deleted");
      fetchUsers();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <h1 className="text-3xl font-bold mb-6">User Management</h1>
        <Card>
            <CardHeader><CardTitle>All Users ({users.length})</CardTitle></CardHeader>
            <CardContent>
                {loading ? <p>Loading...</p> : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b text-left">
                                    <th className="py-3 px-4">Name</th>
                                    <th className="py-3 px-4">Role</th>
                                    <th className="py-3 px-4">Status</th>
                                    <th className="py-3 px-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user) => (
                                    <tr key={user.id} className="border-b hover:bg-gray-50">
                                        <td className="py-3 px-4">
                                          <div className="font-medium">{user.name || "No Name"}</div>
                                          <div className="text-xs text-gray-500">{user.email}</div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <Badge variant={user.role === 'admin' ? "destructive" : "outline"}>
                                              {user.role || 'user'}
                                            </Badge>
                                        </td>
                                        <td className="py-3 px-4">
                                          {user.verified ? (
                                            <Badge className="bg-green-500 hover:bg-green-600">Verified</Badge>
                                          ) : (
                                            <Badge variant="secondary">Unverified</Badge>
                                          )}
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            <DropdownMenu>
                                              <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4"/></Button>
                                              </DropdownMenuTrigger>
                                              <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => handleVerifyUser(user.id, user.verified)}>
                                                  {user.verified ? <><ShieldAlert className="mr-2 h-4 w-4"/> Unverify User</> : <><ShieldCheck className="mr-2 h-4 w-4"/> Verify User</>}
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteUser(user.id)}>
                                                  <Trash2 className="mr-2 h-4 w-4"/> Delete User
                                                </DropdownMenuItem>
                                              </DropdownMenuContent>
                                            </DropdownMenu>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AdminUsers;