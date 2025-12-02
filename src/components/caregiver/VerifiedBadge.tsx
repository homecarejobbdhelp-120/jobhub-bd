import { BadgeCheck } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface VerifiedBadgeProps {
  isVerified: boolean;
  className?: string;
}

const VerifiedBadge = ({ isVerified, className }: VerifiedBadgeProps) => {
  if (!isVerified) return null;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <BadgeCheck 
            className={`h-5 w-5 text-blue-500 fill-blue-500 ${className}`} 
          />
        </TooltipTrigger>
        <TooltipContent>
          <p>Verified Caregiver</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default VerifiedBadge;
