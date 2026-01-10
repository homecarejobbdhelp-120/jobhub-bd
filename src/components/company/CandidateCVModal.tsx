import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Check,
  X,
  Phone,
  Mail,
  MapPin,
  User,
  Briefcase,
  Award,
  FileText,
  Download,
  ExternalLink,
  Calendar,
  Heart,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ApplicantProfile {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  verified_percentage: number | null;
  avatar_url: string | null;
  location: string | null;
  age: number | null;
  gender: string | null;
  skills: string[] | null;
  expected_salary_min: number | null;
  expected_salary_max: number | null;
  marital_status?: string | null;
  shift_preferences?: string[] | null;
  cv_url?: string | null;
  certificate_url?: string | null;
}

interface Application {
  id: string;
  status: string;
  created_at: string;
  caregiver_id: string;
  job_id: string;
  message: string | null;
  cv_url: string | null;
  expected_salary: number | null;
}

interface CandidateCVModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  applicant: ApplicantProfile | null;
  application: Application | null;
  jobTitle: string;
  onShortlist: () => void;
  onReject: () => void;
  isPending: boolean;
}

const CandidateCVModal = ({
  open,
  onOpenChange,
  applicant,
  application,
  jobTitle,
  onShortlist,
  onReject,
  isPending,
}: CandidateCVModalProps) => {
  const [activeTab, setActiveTab] = useState("generated");

  if (!applicant) return null;

  const applicantName = applicant.name || "Unknown Applicant";
  const applicantInitial = applicantName.charAt(0).toUpperCase();
  
  // CV URL from application or profile
  const uploadedCvUrl = application?.cv_url || applicant.cv_url;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="p-4 pb-0">
          <DialogTitle className="text-xl font-bold">Candidate Profile</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
          <div className="px-4">
            <TabsList className="w-full grid grid-cols-2">
              <TabsTrigger value="generated" className="gap-2">
                <FileText className="h-4 w-4" />
                HomeCare CV
              </TabsTrigger>
              <TabsTrigger value="uploaded" className="gap-2">
                <Download className="h-4 w-4" />
                Uploaded CV
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-y-auto">
            {/* Tab 1: Generated CV */}
            <TabsContent value="generated" className="m-0 h-full">
              <div className="p-4">
                {/* CV Document Style Container */}
                <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                  {/* CV Header */}
                  <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6 border-b">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-20 w-20 ring-4 ring-white shadow-lg">
                        <AvatarImage src={applicant.avatar_url || undefined} alt={applicantName} />
                        <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                          {applicantInitial}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h2 className="text-2xl font-bold text-gray-900">{applicantName}</h2>
                          {applicant.verified_percentage && applicant.verified_percentage >= 80 && (
                            <Badge className="bg-green-500">
                              <Shield className="h-3 w-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                        </div>
                        <p className="text-muted-foreground font-medium mb-3">
                          Caregiver / Healthcare Professional
                        </p>
                        
                        {/* Contact Info Row */}
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                          {applicant.phone && (
                            <span className="flex items-center gap-1.5">
                              <Phone className="h-4 w-4 text-primary" />
                              {applicant.phone}
                            </span>
                          )}
                          {applicant.email && (
                            <span className="flex items-center gap-1.5">
                              <Mail className="h-4 w-4 text-primary" />
                              {applicant.email}
                            </span>
                          )}
                          {applicant.location && (
                            <span className="flex items-center gap-1.5">
                              <MapPin className="h-4 w-4 text-primary" />
                              {applicant.location}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* CV Body */}
                  <div className="p-6 space-y-6">
                    {/* Personal Information Section */}
                    <section>
                      <h3 className="text-lg font-semibold text-gray-900 border-b-2 border-primary/30 pb-2 mb-4 flex items-center gap-2">
                        <User className="h-5 w-5 text-primary" />
                        Personal Information
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {applicant.age && (
                          <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-xs text-muted-foreground uppercase tracking-wide">Age</p>
                            <p className="font-semibold text-gray-900">{applicant.age} years</p>
                          </div>
                        )}
                        {applicant.gender && (
                          <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-xs text-muted-foreground uppercase tracking-wide">Gender</p>
                            <p className="font-semibold text-gray-900 capitalize">{applicant.gender}</p>
                          </div>
                        )}
                        {applicant.marital_status && (
                          <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-xs text-muted-foreground uppercase tracking-wide">Marital Status</p>
                            <p className="font-semibold text-gray-900 capitalize">{applicant.marital_status}</p>
                          </div>
                        )}
                        {applicant.location && (
                          <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-xs text-muted-foreground uppercase tracking-wide">Location</p>
                            <p className="font-semibold text-gray-900">{applicant.location}</p>
                          </div>
                        )}
                      </div>
                    </section>

                    {/* Career Summary / Application Message */}
                    {application?.message && (
                      <section>
                        <h3 className="text-lg font-semibold text-gray-900 border-b-2 border-primary/30 pb-2 mb-4 flex items-center gap-2">
                          <Briefcase className="h-5 w-5 text-primary" />
                          Career Summary
                        </h3>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <p className="text-gray-700 leading-relaxed">{application.message}</p>
                        </div>
                      </section>
                    )}

                    {/* Skills Section */}
                    {applicant.skills && applicant.skills.length > 0 && (
                      <section>
                        <h3 className="text-lg font-semibold text-gray-900 border-b-2 border-primary/30 pb-2 mb-4 flex items-center gap-2">
                          <Award className="h-5 w-5 text-primary" />
                          Skills & Expertise
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {applicant.skills.map((skill, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="px-3 py-1.5 text-sm bg-primary/10 text-primary hover:bg-primary/20"
                            >
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </section>
                    )}

                    {/* Work Preferences */}
                    <section>
                      <h3 className="text-lg font-semibold text-gray-900 border-b-2 border-primary/30 pb-2 mb-4 flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-primary" />
                        Work Preferences
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Shift Preferences */}
                        {applicant.shift_preferences && applicant.shift_preferences.length > 0 && (
                          <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Preferred Shifts</p>
                            <div className="flex flex-wrap gap-1">
                              {applicant.shift_preferences.map((shift, i) => (
                                <Badge key={i} variant="outline" className="text-xs">
                                  {shift}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Expected Salary */}
                        <div className="bg-gray-50 rounded-lg p-4">
                          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Expected Salary</p>
                          <p className="font-bold text-lg text-green-600">
                            ৳{(application?.expected_salary || applicant.expected_salary_min || 0).toLocaleString()}
                            {applicant.expected_salary_max && (
                              <span> - ৳{applicant.expected_salary_max.toLocaleString()}</span>
                            )}
                            <span className="text-sm font-normal text-gray-500"> /month</span>
                          </p>
                        </div>
                      </div>
                    </section>

                    {/* Applied For */}
                    <section>
                      <h3 className="text-lg font-semibold text-gray-900 border-b-2 border-primary/30 pb-2 mb-4 flex items-center gap-2">
                        <Heart className="h-5 w-5 text-primary" />
                        Application Details
                      </h3>
                      <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wide">Applied For</p>
                            <p className="font-semibold text-gray-900">{jobTitle}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground uppercase tracking-wide">Applied On</p>
                            <p className="font-medium text-gray-700">
                              {application?.created_at
                                ? new Date(application.created_at).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                  })
                                : "N/A"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </section>

                    {/* Verification Status */}
                    {applicant.verified_percentage && applicant.verified_percentage > 0 && (
                      <section>
                        <h3 className="text-lg font-semibold text-gray-900 border-b-2 border-primary/30 pb-2 mb-4 flex items-center gap-2">
                          <Shield className="h-5 w-5 text-primary" />
                          Verification Status
                        </h3>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Profile Verification</span>
                            <span className="text-sm font-bold text-green-600">{applicant.verified_percentage}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div
                              className="bg-green-500 h-3 rounded-full transition-all"
                              style={{ width: `${applicant.verified_percentage}%` }}
                            />
                          </div>
                        </div>
                      </section>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Tab 2: Uploaded CV */}
            <TabsContent value="uploaded" className="m-0 h-full">
              <div className="p-4">
                <div className="bg-white border border-gray-200 rounded-lg shadow-sm min-h-[400px] flex flex-col">
                  {uploadedCvUrl ? (
                    <>
                      <div className="p-4 border-b flex items-center justify-between bg-gray-50">
                        <div className="flex items-center gap-2">
                          <FileText className="h-5 w-5 text-primary" />
                          <span className="font-medium">Uploaded Resume</span>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                          <a href={uploadedCvUrl} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Open in New Tab
                          </a>
                        </Button>
                      </div>
                      <div className="flex-1 p-2">
                        {uploadedCvUrl.toLowerCase().endsWith(".pdf") ? (
                          <iframe
                            src={uploadedCvUrl}
                            className="w-full h-[500px] border rounded"
                            title="Uploaded CV"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-[400px]">
                            <img
                              src={uploadedCvUrl}
                              alt="Uploaded CV"
                              className="max-h-full max-w-full object-contain rounded"
                            />
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                        <FileText className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <h4 className="text-lg font-semibold text-gray-700 mb-2">No CV Uploaded</h4>
                      <p className="text-muted-foreground max-w-sm">
                        This candidate has not uploaded a resume. Please refer to the generated HomeCare CV for their profile information.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </div>

          {/* Footer Actions */}
          {isPending && (
            <div className="border-t p-4 bg-gray-50 flex gap-3">
              <Button
                className="flex-1 bg-green-600 hover:bg-green-700"
                onClick={() => {
                  onShortlist();
                  onOpenChange(false);
                }}
              >
                <Check className="mr-2 h-4 w-4" />
                Shortlist Candidate
              </Button>
              <Button
                variant="outline"
                className="flex-1 border-destructive text-destructive hover:bg-destructive/10"
                onClick={() => {
                  onReject();
                  onOpenChange(false);
                }}
              >
                <X className="mr-2 h-4 w-4" />
                Reject Application
              </Button>
            </div>
          )}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default CandidateCVModal;
