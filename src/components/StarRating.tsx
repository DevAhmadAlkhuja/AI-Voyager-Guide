import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  onRate?: (rating: number) => void;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
}

const StarRating = ({ rating, onRate, size = "md", interactive = false }: StarRatingProps) => {
  const [hovered, setHovered] = useState(0);

  const sizeClass = { sm: "w-3.5 h-3.5", md: "w-5 h-5", lg: "w-6 h-6" }[size];

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => onRate?.(star)}
          onMouseEnter={() => interactive && setHovered(star)}
          onMouseLeave={() => interactive && setHovered(0)}
          className={cn("transition-colors", interactive ? "cursor-pointer" : "cursor-default")}
        >
          <Star
            className={cn(
              sizeClass,
              (hovered || rating) >= star ? "text-coral fill-coral" : "text-muted-foreground/30"
            )}
          />
        </button>
      ))}
    </div>
  );
};

export default StarRating;
