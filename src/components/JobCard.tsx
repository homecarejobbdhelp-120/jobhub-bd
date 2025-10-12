import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, DollarSign, Clock } from "lucide-react";

interface JobCardProps {
  id: string;
  title: string;
  location: string;
  salary: number;
  salary_negotiable: boolean;
  job_type: string;
  shift_type: string;
  featured?: boolean;
  onViewDetails: (id: string) => void;
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
  onViewDetails,
}: JobCardProps) => {
  return (
    <Card className={`hover:shadow-lg transition ${featured ? "border-primary border-2" : ""}`}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            <CardDescription className="flex items-center gap-1 mt-1">
              <MapPin className="h-3 w-3" />
              {location}
            </CardDescription>
          </div>
          {featured && <Badge variant="default">Featured</Badge>}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm">
          <DollarSign className="h-4 w-4 text-primary" />
          <span>
            {salary_negotiable ? "Negotiable" : `৳${salary.toLocaleString()}`}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Clock className="h-4 w-4 text-primary" />
          <span>{shift_type}</span>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline">{job_type}</Badge>
        </div>
        <Button onClick={() => onViewDetails(id)} className="w-full">
          View Details
        </Button>
      </CardContent>
    </Card>
  );
};

export default JobCard;
