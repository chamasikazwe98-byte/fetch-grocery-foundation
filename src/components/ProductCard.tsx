import { Plus, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface ProductCardProps {
  name: string;
  price: number;
  originalPrice?: number;
  unit: string;
  image: string;
  badge?: string;
}

const ProductCard = ({ name, price, originalPrice, unit, image, badge }: ProductCardProps) => {
  const [isLiked, setIsLiked] = useState(false);

  return (
    <div className="group relative rounded-2xl bg-card p-4 shadow-soft transition-all duration-300 hover:shadow-card">
      {/* Badge */}
      {badge && (
        <span className="absolute left-3 top-3 z-10 rounded-full gradient-accent px-3 py-1 text-xs font-bold text-accent-foreground">
          {badge}
        </span>
      )}

      {/* Wishlist button */}
      <button
        onClick={() => setIsLiked(!isLiked)}
        className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-card/80 backdrop-blur transition-all hover:bg-card"
      >
        <Heart
          className={`h-4 w-4 transition-colors ${
            isLiked ? "fill-destructive text-destructive" : "text-muted-foreground"
          }`}
        />
      </button>

      {/* Image */}
      <div className="mb-4 aspect-square overflow-hidden rounded-xl bg-secondary/50">
        <img
          src={image}
          alt={name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      {/* Content */}
      <div className="space-y-2">
        <h3 className="font-semibold text-foreground line-clamp-2">{name}</h3>
        <p className="text-sm text-muted-foreground">{unit}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-foreground">${price.toFixed(2)}</span>
            {originalPrice && (
              <span className="text-sm text-muted-foreground line-through">
                ${originalPrice.toFixed(2)}
              </span>
            )}
          </div>
          <Button variant="hero" size="icon" className="h-9 w-9 rounded-xl">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
