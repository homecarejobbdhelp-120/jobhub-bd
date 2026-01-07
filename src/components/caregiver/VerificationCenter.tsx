import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";
import { Shield, Upload, Loader2, CheckCircle2, Clock, AlertTriangle } from "lucide-react";

interface VerificationCenterProps {
  userId: string;
  nidNumber: string | null;
  nidFrontUrl: string | null;
  nidBackUrl: string | null;
  verified: boolean;
  onUpdate: (data: { 
    nid_number?: string; 
    nid_front_url?: string; 
    nid_back_url?: string;
  }) => void;
}

const VerificationCenter = ({ 
  userId, 
  nidNumber, 
  nidFrontUrl, 
  nidBackUrl, 
  verified,
  onUpdate 
}: VerificationCenterProps) => {
  const [nid, setNid] = useState(nidNumber || "");
  const [frontUrl, setFrontUrl] = useState(nidFrontUrl || "");
  const [backUrl, setBackUrl] = useState(nidBackUrl || "");
  const [uploadingFront, setUploadingFront] = useState(false);
  const [uploadingBack, setUploadingBack] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const frontInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);

  const isPendingReview = nidNumber && (nidFrontUrl || nidBackUrl) && !verified;
  const isSubmitted = !!nidNumber && (!!nidFrontUrl || !!nidBackUrl);

  const uploadFile = async (file: File, side: 'front' | 'back') => {
    const setUploading = side === 'front' ? setUploadingFront : setUploadingBack;
    const setUrl = side === 'front' ? setFrontUrl : setBackUrl;
    
    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/nid-${side}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('identity-docs')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // For private buckets, we need to create a signed URL or store the path
      // We'll store the path and fetch signed URLs when viewing
      const filePath = fileName;
      setUrl(filePath);

      toast({
        title: "Success",
        description: `NID ${side} side uploaded successfully`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to upload file",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmitVerification = async () => {
    if (!nid.trim()) {
      toast({
        title: "Error",
        description: "Please enter your NID number",
        variant: "destructive",
      });
      return;
    }

    if (!frontUrl && !backUrl) {
      toast({
        title: "Error",
        description: "Please upload at least one side of your NID",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          nid_number: nid,
          nid_front_url: frontUrl || null,
          nid_back_url: backUrl || null,
        })
        .eq('id', userId);

      if (error) throw error;

      onUpdate({
        nid_number: nid,
        nid_front_url: frontUrl || undefined,
        nid_back_url: backUrl || undefined,
      });

      toast({
        title: "Verification Submitted",
        description: "Your documents are now pending admin review",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit verification",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="border-2 border-dashed border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">Identity Verification Center</CardTitle>
          </div>
          {verified && (
            <Badge className="bg-green-500 hover:bg-green-600">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Verified
            </Badge>
          )}
          {isPendingReview && (
            <Badge variant="secondary" className="bg-amber-100 text-amber-800 hover:bg-amber-100">
              <Clock className="w-3 h-3 mr-1" />
              Pending Review
            </Badge>
          )}
        </div>
        <CardDescription>
          Submit your National ID for verification to gain a verified badge and access premium features
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Security Notice */}
        <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
          <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-muted-foreground">
            <p className="font-medium text-foreground mb-1">Your documents are secure</p>
            <p>Your identity documents are stored securely and can only be accessed by you and verified administrators for review purposes.</p>
          </div>
        </div>

        {/* NID Number Input */}
        <div className="space-y-2">
          <Label htmlFor="nid-number">NID Number *</Label>
          <Input
            id="nid-number"
            value={nid}
            onChange={(e) => setNid(e.target.value)}
            placeholder="Enter your National ID number"
            disabled={verified}
          />
        </div>

        {/* Upload Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Front Side */}
          <div className="space-y-2">
            <Label>NID Front Side</Label>
            <div 
              className={`
                relative border-2 border-dashed rounded-lg p-4 text-center
                ${frontUrl ? 'border-green-300 bg-green-50' : 'border-muted-foreground/25 hover:border-primary/50'}
                ${verified ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}
              `}
              onClick={() => !verified && !uploadingFront && frontInputRef.current?.click()}
            >
              <input
                ref={frontInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                disabled={verified}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) uploadFile(file, 'front');
                }}
              />
              {uploadingFront ? (
                <div className="flex flex-col items-center gap-2 py-4">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <span className="text-sm text-muted-foreground">Uploading...</span>
                </div>
              ) : frontUrl ? (
                <div className="flex flex-col items-center gap-2 py-2">
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                  <span className="text-sm text-green-700 font-medium">Front uploaded</span>
                  {!verified && (
                    <span className="text-xs text-muted-foreground">Click to replace</span>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 py-4">
                  <Upload className="w-8 h-8 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Click to upload front side</span>
                </div>
              )}
            </div>
          </div>

          {/* Back Side */}
          <div className="space-y-2">
            <Label>NID Back Side</Label>
            <div 
              className={`
                relative border-2 border-dashed rounded-lg p-4 text-center
                ${backUrl ? 'border-green-300 bg-green-50' : 'border-muted-foreground/25 hover:border-primary/50'}
                ${verified ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}
              `}
              onClick={() => !verified && !uploadingBack && backInputRef.current?.click()}
            >
              <input
                ref={backInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                disabled={verified}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) uploadFile(file, 'back');
                }}
              />
              {uploadingBack ? (
                <div className="flex flex-col items-center gap-2 py-4">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <span className="text-sm text-muted-foreground">Uploading...</span>
                </div>
              ) : backUrl ? (
                <div className="flex flex-col items-center gap-2 py-2">
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                  <span className="text-sm text-green-700 font-medium">Back uploaded</span>
                  {!verified && (
                    <span className="text-xs text-muted-foreground">Click to replace</span>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 py-4">
                  <Upload className="w-8 h-8 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Click to upload back side</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        {!verified && (
          <Button 
            onClick={handleSubmitVerification} 
            disabled={submitting || (!nid.trim() && !frontUrl && !backUrl)}
            className="w-full"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : isSubmitted ? (
              'Update Verification Documents'
            ) : (
              'Submit for Verification'
            )}
          </Button>
        )}

        {verified && (
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <CheckCircle2 className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <p className="text-green-700 font-medium">Your identity has been verified!</p>
            <p className="text-sm text-green-600">You now have access to all premium features.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VerificationCenter;
