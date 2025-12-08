import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, Send } from "lucide-react";

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
  onViewDetails,
  onApply,
}: JobCardProps) => {
  return (
    <Card className={`hover:shadow-md transition-shadow ${featured ? "border-primary border" : "border-border"}`}>
      <CardContent className="p-3">
        {/* Header row */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-sm text-foreground truncate">{title}</h3>
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
            onClick={() => onViewDetails(id)} 
            variant="outline" 
            size="sm"
            className={`text-xs h-8 ${hideApply ? "w-full" : "flex-1"}`}
          >
            View Details
          </Button>
          {!hideApply && (
            <Button 
              onClick={() => onApply(id)} 
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
