import { MapPin, Clock, Star, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";

interface JobCardProps {
  title: string;
  company?: string;
  location: string;
  salary: string;
  type: string;
  posted: string;
  description?: string;
  isVerified?: boolean;
}

const JobCard = ({ 
  title, 
  company = "Verified HomeCare", 
  location, 
  salary, 
  type, 
  posted, 
  description = "Looking for an experienced caregiver for patient care. Responsibilities include daily assistance and medication management.",
  isVerified = true 
}: JobCardProps) => {
  const navigate = useNavigate();

  // বাটনে ক্লিক করলে লগইন পেজে নিয়ে যাবে
  const handleAction = () => {
    navigate("/login");
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 border border-gray-100 bg-white rounded-2xl overflow-hidden p-5 flex flex-col h-full relative">
      
      {/* টপ ব্যাজ সেকশন */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex gap-2">
          {isVerified && (
            <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100 gap-1 px-2 py-1">
              <Star className="w-3 h-3 fill-current" /> Verified
            </Badge>
          )}
          <Badge variant="outline" className="text-gray-500 border-gray-200">{type}</Badge>
        </div>
        <span className="text-xs text-gray-400 font-medium">{posted}</span>
      </div>

      {/* টাইটেল এবং কোম্পানি */}
      <div className="mb-4">
        <h3 className="text-xl font-bold text-gray-900 leading-tight group-hover:text-blue-600 transition-colors mb-1">
          {title}
        </h3>
        <p className="text-sm text-gray-500 font-medium flex items-center gap-1">
          {company}
        </p>
      </div>

      {/* বর্ণনা (ছোট) */}
      <p className="text-sm text-gray-600 mb-6 line-clamp-2 leading-relaxed">
        {description}
      </p>

      {/* ইনফো গ্রিড (লোকেশন ও সময়) */}
      <div className="flex items-center gap-4 text-sm text-gray-500 mb-6 bg-gray-50 p-3 rounded-lg">
        <div className="flex items-center gap-1.5">
          <MapPin className="w-4 h-4 text-gray-400" />
          <span className="truncate max-w-[100px]">{location}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-gray-400" />
          <span>8hr Shift</span>
        </div>
      </div>

      <div className="mt-auto">
        {/* স্যালারি */}
        <div className="mb-4 flex items-baseline gap-1">
          <span className="text-2xl font-extrabold text-green-600">৳{salary}</span>
          <span className="text-xs text-gray-400 font-medium">/month</span>
        </div>

        {/* বাটন (লগইন রিডাইরেক্ট) */}
        <div className="grid grid-cols-2 gap-3">
          <Button 
            onClick={handleAction} 
            variant="outline" 
            className="w-full border-gray-200 text-gray-700 hover:bg-gray-50 font-bold"
          >
            View Details
          </Button>
          <Button 
            onClick={handleAction} 
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold shadow-md shadow-green-100"
          >
            Apply Now
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default JobCard;