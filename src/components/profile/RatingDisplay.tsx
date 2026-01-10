import { Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface RatingDisplayProps {
  averageRating: number | null;
  reviewCount: number;
}

const RatingDisplay = ({ averageRating, reviewCount }: RatingDisplayProps) => {
  if (averageRating === null) {
    return null;
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-5 w-5 ${
              star <= rating
                ? "text-amber-500 fill-amber-500"
                : star <= rating + 0.5
                ? "text-amber-500 fill-amber-200"
                : "text-muted-foreground"
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <Card className="mb-6">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Star className="h-5 w-5 text-amber-500" />
          Ratings & Reviews
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <div className="text-4xl font-bold text-amber-500">{averageRating}</div>
          <div>
            {renderStars(averageRating)}
            <p className="text-sm text-muted-foreground mt-1">
              Based on {reviewCount} review{reviewCount !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RatingDisplay;
