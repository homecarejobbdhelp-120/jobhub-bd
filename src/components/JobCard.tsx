import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, Clock, Send, Building2, Eye } from "lucide-react";

interface JobCardProps {
  id: string;
  title: string;
  location: string;
  salary: number;
  salary_negotiable: boolean;
  job_type: string;
  shift_type: string;
  featured?: boolean;
  hideApply?: boolean;
  company_name?: string;
  employer_id?: string;
  avatar_url?: string | null;
  onViewDetails?: (id: string) => void; // Made optional to prevent crash
  onApply?: (id: string) => void;      // Made optional
}

const JobCard = ({
  id,
  title,
  location,
  salary,
  salary_negotiable,
  job_type,
  shift_type,
  featured,
  hideApply = false,
  company_name,
  employer_id,
  avatar_url,
  onViewDetails,
  onApply,
}: JobCardProps) => {
  const navigate = useNavigate();

  const handleCompanyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (employer_id) {
      navigate(`/company/${employer_id}`); // Fixed route to match App.tsx
    }
  };

  return (
    <Card className={`hover:shadow-lg transition-shadow bg-white rounded-2xl overflow-hidden border ${featured ? "border-emerald-500/30 shadow-emerald-50" : "border-slate-100"}`}>
      <CardContent className="p-5">
        
        {/* Header: Logo + Title */}
        <div className="flex items-start gap-4 mb-3">
          <div onClick={handleCompanyClick} className="cursor-pointer shrink-0">
             <Avatar className="h-12 w-12 rounded-xl ring-1 ring-slate-100">
              <AvatarImage src={avatar_url || undefined} className="object-cover"/>
              <AvatarFallback className="bg-emerald-50 text-emerald-600 rounded-xl">
                <Building2 className="h-6 w-6" />
              </AvatarFallback>
            </Avatar>
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-slate-800 text-base leading-tight truncate">{title}</h3>
            <p 
              onClick={handleCompanyClick} 
              className="text-sm text-slate-500 mt-1 hover:text-emerald-600 cursor-pointer font-medium truncate"
            >
              {company_name || "Unknown Company"}
            </p>
          </div>

          {featured && (
            <Badge className="bg-blue-50 text-blue-600 hover:bg-blue-100 border-none px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider shrink-0">
              Featured
            </Badge>
          )}
        </div>

        {/* Info Row */}
        <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-slate-500 mb-5 pl-16 md:pl-0">
           <div className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 text-slate-400" />
              {location}
           </div>
           <div className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-slate-400" />
              {shift_type}
           </div>
           <Badge variant="outline" className="text-[10px] text-slate-500 border-slate-200 bg-slate-50">
             {job_type}
           </Badge>
        </div>

        {/* Action Buttons (UI/UX Fixed) */}
        <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-50">
           <div className="text-emerald-600 font-black text-lg">
             {salary_negotiable ? "Negotiable" : `৳${salary.toLocaleString()}`}
           </div>

           <div className="flex gap-2">
             {/* View Details Button */}
             <Button 
                onClick={(e) => {
                    e.stopPropagation();
                    if(onViewDetails) onViewDetails(id);
                    else navigate(`/jobs/${id}`); // Fallback
                }}
                variant="ghost" 
                size="sm" 
                className="text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 h-9 px-3 rounded-xl font-bold"
             >
                <Eye className="h-4 w-4 mr-1 md:mr-2" /> 
                <span className="hidden md:inline">View</span>
             </Button>

             {/* Apply Button */}
             {!hideApply && (
                <Button 
                    onClick={(e) => {
                        e.stopPropagation();
                        if(onApply) onApply(id);
                    }}
                    size="sm" 
                    className="bg-emerald-600 hover:bg-emerald-700 text-white h-9 px-4 rounded-xl font-bold shadow-md shadow-emerald-100"
                >
                    Apply Now <Send className="ml-2 h-3 w-3" />
                </Button>
             )}
           </div>
        </div>

      </CardContent>
    </Card>
  );
};

export default JobCard;