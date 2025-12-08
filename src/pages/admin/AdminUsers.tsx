import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Trash2, Loader2, Pencil, MoreHorizontal, Shield } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface UserWithRole {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  location: string | null;
  role: string;
  created_at: string;
}

const AdminUsers = () => {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<UserWithRole | null>(null);
  const [roleUser, setRoleUser] = useState<UserWithRole | null>(null);
  const [newRole, setNewRole] = useState<string>("");
  const [saving, setSaving] = useState(false);

  const fetchUsers = async () => {
    try {
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, name, email, phone, location, created_at");

      if (profilesError) throw profilesError;

      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id, role");

      if (rolesError) throw rolesError;

      const usersWithRoles = profiles?.map((profile) => {
        const userRole = roles?.find((r) => r.user_id === profile.id);
        return {
          ...profile,
          role: userRole?.role || "unknown",
        };
      }) || [];

      setUsers(usersWithRoles);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDeleteUser = async (userId: string) => {
    setDeleting(userId);
    try {
      await supabase.from("user_roles").delete().eq("user_id", userId);
      const { error } = await supabase.from("profiles").delete().eq("id", userId);
      
      if (error) throw error;

      toast({
        title: "User Deleted",
        description: "User has been removed successfully",
      });
      
      setUsers(users.filter((u) => u.id !== userId));
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete user",
        variant: "destructive",
      });
    } finally {
      setDeleting(null);
    }
  };

  const handleEditUser = async () => {
    if (!editingUser) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          name: editingUser.name,
          email: editingUser.email,
          phone: editingUser.phone,
          location: editingUser.location,
        })
        .eq("id", editingUser.id);

      if (error) throw error;

      toast({
        title: "User Updated",
        description: "User profile has been updated successfully",
      });

      setUsers(users.map((u) => (u.id === editingUser.id ? editingUser : u)));
      setEditingUser(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update user",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateRole = async () => {
    if (!roleUser || !newRole) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from("user_roles")
        .update({ role: newRole as "admin" | "employer" | "caregiver" | "nurse" })
        .eq("user_id", roleUser.id);

      if (error) throw error;

      toast({
        title: "Role Updated",
        description: `User role changed to ${newRole}`,
      });

      setUsers(users.map((u) => (u.id === roleUser.id ? { ...u, role: newRole } : u)));
      setRoleUser(null);
      setNewRole("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update role",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const getRoleBadge = (role: string) => {
    const variants: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
      admin: "destructive",
      employer: "default",
      caregiver: "secondary",
      nurse: "outline",
    };
    const labels: Record<string, string> = {
      admin: "Admin",
      employer: "Company",
      caregiver: "Caregiver",
      nurse: "Nurse",
    };
    return <Badge variant={variants[role] || "outline"}>{labels[role] || role}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">User Management</h1>
        <p className="text-muted-foreground">Manage all registered users</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Users ({users.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : users.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">No users found</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{getRoleBadge(user.role)}</TableCell>
                      <TableCell>
                        {user.created_at 
                          ? format(new Date(user.created_at), "MMM d, yyyy")
                          : "N/A"}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setEditingUser(user)}>
                              <Pencil className="w-4 h-4 mr-2" />
                              Edit Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => { setRoleUser(user); setNewRole(user.role); }}>
                              <Shield className="w-4 h-4 mr-2" />
                              Change Role
                            </DropdownMenuItem>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem 
                                  className="text-destructive focus:text-destructive"
                                  onSelect={(e) => e.preventDefault()}
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete User
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete User?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will permanently delete {user.name}'s account and all associated data. This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    onClick={() => handleDeleteUser(user.id)}
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit User Modal */}
      <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User Profile</DialogTitle>
            <DialogDescription>
              Modify the user's profile details
            </DialogDescription>
          </DialogHeader>
          {editingUser && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={editingUser.phone || ""}
                  onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={editingUser.location || ""}
                  onChange={(e) => setEditingUser({ ...editingUser, location: e.target.value })}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingUser(null)}>
              Cancel
            </Button>
            <Button onClick={handleEditUser} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Role Modal */}
      <Dialog open={!!roleUser} onOpenChange={(open) => !open && setRoleUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change User Role</DialogTitle>
            <DialogDescription>
              Update the role for {roleUser?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="role">Select Role</Label>
              <Select value={newRole} onValueChange={setNewRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="caregiver">Caregiver</SelectItem>
                  <SelectItem value="nurse">Nurse</SelectItem>
                  <SelectItem value="employer">Company/Employer</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRoleUser(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateRole} disabled={saving || !newRole}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Update Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUsers;
