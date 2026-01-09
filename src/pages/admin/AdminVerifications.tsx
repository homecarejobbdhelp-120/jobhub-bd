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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, Eye, CheckCircle, Shield, User, IdCard, AlertCircle, XCircle } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface PendingUser {
  id: string;
  name: string;
  email: string;
  nid_number: string;
  nid_front_url: string | null;
  nid_back_url: string | null;
  created_at: string;
}

const AdminVerifications = () => {
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<PendingUser | null>(null);
  const [frontImageUrl, setFrontImageUrl] = useState<string | null>(null);
  const [backImageUrl, setBackImageUrl] = useState<string | null>(null);
  const [loadingImages, setLoadingImages] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const fetchPendingVerifications = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, name, email, nid_number, nid_front_url, nid_back_url, created_at")
        .not("nid_number", "is", null)
        .eq("verified", false)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setPendingUsers(data || []);
    } catch (error) {
      console.error("Error fetching pending verifications:", error);
      toast({
        title: "Error",
        description: "Failed to fetch pending verifications",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingVerifications();
  }, []);

  const loadSignedUrls = async (user: PendingUser) => {
    setLoadingImages(true);
    setFrontImageUrl(null);
    setBackImageUrl(null);

    try {
      if (user.nid_front_url) {
        const { data: frontData, error: frontError } = await supabase.storage
          .from("identity-docs")
          .createSignedUrl(user.nid_front_url, 3600); // 1 hour expiry

        if (!frontError && frontData) {
          setFrontImageUrl(frontData.signedUrl);
        }
      }

      if (user.nid_back_url) {
        const { data: backData, error: backError } = await supabase.storage
          .from("identity-docs")
          .createSignedUrl(user.nid_back_url, 3600);

        if (!backError && backData) {
          setBackImageUrl(backData.signedUrl);
        }
      }
    } catch (error) {
      console.error("Error loading signed URLs:", error);
    } finally {
      setLoadingImages(false);
    }
  };

  const handleViewUser = async (user: PendingUser) => {
    setSelectedUser(user);
    setShowRejectForm(false);
    setRejectReason("");
    await loadSignedUrls(user);
  };

  const sendVerificationEmail = async (email: string, name: string, status: "approved" | "rejected", reason?: string) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-verification-email`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, name, status, reason }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Email send error:", errorData);
        // Don't throw - email failure shouldn't block verification
      }
    } catch (error) {
      console.error("Failed to send verification email:", error);
      // Don't throw - email failure shouldn't block verification
    }
  };

  const handleApproveVerification = async () => {
    if (!selectedUser) return;

    setVerifying(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          verified: true,
          verified_percentage: 100,
        })
        .eq("id", selectedUser.id);

      if (error) throw error;

      // Send approval email
      await sendVerificationEmail(selectedUser.email, selectedUser.name, "approved");

      toast({
        title: "User Verified",
        description: `${selectedUser.name} has been verified successfully and notified via email`,
      });

      // Remove from pending list
      setPendingUsers(pendingUsers.filter((u) => u.id !== selectedUser.id));
      setSelectedUser(null);
      setShowRejectForm(false);
      setRejectReason("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to verify user",
        variant: "destructive",
      });
    } finally {
      setVerifying(false);
    }
  };

  const handleRejectVerification = async () => {
    if (!selectedUser || !rejectReason.trim()) {
      toast({
        title: "Reason Required",
        description: "Please provide a reason for rejection",
        variant: "destructive",
      });
      return;
    }

    setRejecting(true);
    try {
      // Clear NID data and reset verification status
      const { error } = await supabase
        .from("profiles")
        .update({
          nid_number: null,
          nid_front_url: null,
          nid_back_url: null,
          verified_percentage: 0,
        })
        .eq("id", selectedUser.id);

      if (error) throw error;

      // Send rejection email
      await sendVerificationEmail(selectedUser.email, selectedUser.name, "rejected", rejectReason.trim());

      toast({
        title: "Verification Rejected",
        description: `${selectedUser.name} has been notified about the rejection`,
      });

      // Remove from pending list
      setPendingUsers(pendingUsers.filter((u) => u.id !== selectedUser.id));
      setSelectedUser(null);
      setShowRejectForm(false);
      setRejectReason("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to reject verification",
        variant: "destructive",
      });
    } finally {
      setRejecting(false);
    }
  };

  const handleCloseDialog = () => {
    setSelectedUser(null);
    setShowRejectForm(false);
    setRejectReason("");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Shield className="w-6 h-6 text-primary" />
          Pending Verifications
        </h1>
        <p className="text-muted-foreground">Review and approve user identity verifications</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Pending Reviews ({pendingUsers.length})</span>
            {pendingUsers.length > 0 && (
              <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                {pendingUsers.length} awaiting review
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : pendingUsers.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <p className="text-lg font-medium">All caught up!</p>
              <p className="text-muted-foreground">No pending verifications at this time</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>NID Number</TableHead>
                    <TableHead>Documents</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="text-sm bg-muted px-2 py-1 rounded">
                          {user.nid_number}
                        </code>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {user.nid_front_url && (
                            <Badge variant="outline" className="text-xs">Front</Badge>
                          )}
                          {user.nid_back_url && (
                            <Badge variant="outline" className="text-xs">Back</Badge>
                          )}
                          {!user.nid_front_url && !user.nid_back_url && (
                            <span className="text-xs text-muted-foreground">No documents</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {format(new Date(user.created_at), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewUser(user)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Review
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog open={!!selectedUser} onOpenChange={(open) => !open && handleCloseDialog()}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <IdCard className="w-5 h-5 text-primary" />
              Review Verification
            </DialogTitle>
            <DialogDescription>
              Review the submitted identity documents for {selectedUser?.name}
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-6">
              {/* User Info */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Full Name</p>
                  <p className="font-medium">{selectedUser.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{selectedUser.email}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">NID Number</p>
                  <code className="text-lg font-mono bg-background px-3 py-1 rounded border">
                    {selectedUser.nid_number}
                  </code>
                </div>
              </div>

              {/* Document Images */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Front Side */}
                <div className="space-y-2">
                  <p className="font-medium text-sm">NID Front Side</p>
                  {loadingImages ? (
                    <div className="aspect-[3/2] bg-muted rounded-lg flex items-center justify-center">
                      <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : frontImageUrl ? (
                    <img
                      src={frontImageUrl}
                      alt="NID Front"
                      className="w-full aspect-[3/2] object-cover rounded-lg border"
                    />
                  ) : (
                    <div className="aspect-[3/2] bg-muted rounded-lg flex items-center justify-center">
                      <div className="text-center text-muted-foreground">
                        <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                        <p className="text-sm">Not uploaded</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Back Side */}
                <div className="space-y-2">
                  <p className="font-medium text-sm">NID Back Side</p>
                  {loadingImages ? (
                    <div className="aspect-[3/2] bg-muted rounded-lg flex items-center justify-center">
                      <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : backImageUrl ? (
                    <img
                      src={backImageUrl}
                      alt="NID Back"
                      className="w-full aspect-[3/2] object-cover rounded-lg border"
                    />
                  ) : (
                    <div className="aspect-[3/2] bg-muted rounded-lg flex items-center justify-center">
                      <div className="text-center text-muted-foreground">
                        <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                        <p className="text-sm">Not uploaded</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Rejection Form */}
              {showRejectForm && (
                <div className="space-y-3 p-4 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-200 dark:border-red-900">
                  <p className="font-medium text-sm text-red-700 dark:text-red-400">
                    Reason for Rejection
                  </p>
                  <Textarea
                    placeholder="Please provide a clear reason for rejecting this verification (e.g., documents are blurry, information doesn't match, etc.)"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    className="min-h-[100px] border-red-200 dark:border-red-800"
                    maxLength={500}
                  />
                  <p className="text-xs text-muted-foreground text-right">
                    {rejectReason.length}/500 characters
                  </p>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancel
            </Button>
            {!showRejectForm ? (
              <>
                <Button
                  variant="destructive"
                  onClick={() => setShowRejectForm(true)}
                  disabled={verifying}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject
                </Button>
                <Button
                  onClick={handleApproveVerification}
                  disabled={verifying}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {verifying ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve
                    </>
                  )}
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowRejectForm(false);
                    setRejectReason("");
                  }}
                  disabled={rejecting}
                >
                  Back
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleRejectVerification}
                  disabled={rejecting || !rejectReason.trim()}
                >
                  {rejecting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Rejecting...
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 mr-2" />
                      Confirm Rejection
                    </>
                  )}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminVerifications;
