import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, Clock, Send, Building2 } from "lucide-react";

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
  onViewDetails: (id: string) => void;
  onApply: (id: string) => void;
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
      navigate(`/profile/${employer_id}`);
    }
  };

  return (
    <Card className={`hover:shadow-md transition-shadow ${featured ? "border-primary border" : "border-border"}`}>
      <CardContent className="p-3">
        {/* Header row */}
        <div className="flex items-start justify-between gap-2 mb-2">
          {employer_id && (
            <Avatar 
              className="h-10 w-10 cursor-pointer ring-2 ring-transparent hover:ring-primary transition-all flex-shrink-0"
              onClick={handleCompanyClick}
            >
              <AvatarImage src={avatar_url || undefined} />
              <AvatarFallback className="bg-primary/10 text-primary">
                <Building2 className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
          )}
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-sm text-foreground truncate">{title}</h3>
            {company_name && (
              <span 
                className="text-xs text-muted-foreground hover:text-primary cursor-pointer transition-colors"
                onClick={handleCompanyClick}
              >
                {company_name}
              </span>
            )}
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
              <MapPin className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">{location}</span>
            </div>
          </div>
          {featured && (
            <Badge variant="default" className="text-xs px-1.5 py-0.5 h-5 flex-shrink-0">
              Featured
            </Badge>
          )}
        </div>

        {/* Info row */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
          <span className="font-medium text-primary">
            {salary_negotiable ? "Negotiable" : `৳${salary.toLocaleString()}`}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {shift_type}
          </span>
          <Badge variant="outline" className="text-xs px-1.5 py-0 h-5">
            {job_type}
          </Badge>
        </div>

        {/* Actions row */}
        <div className="flex gap-2">
          <Button 
           onClick={() => navigate("/auth")} 
            variant="outline" 
            size="sm"
            className={`text-xs h-8 ${hideApply ? "w-full" : "flex-1"}`}
          >
            View Details
          </Button>
          {!hideApply && (
            <Button 
              onClick={() => navigate("/auth")} 
              size="sm"
              className="flex-1 text-xs h-8"
            >
              <Send className="mr-1 h-3 w-3" />
              Apply
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default JobCard;
