import { useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingBag, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: "sneakers" | "joggers";
  isNew?: boolean;
  isBestSeller?: boolean;
}

const ProductCard = ({
  id,
  name,
  price,
  originalPrice,
  image,
  category,
  isNew,
  isBestSeller,
}: ProductCardProps) => {
  const [isLiked, setIsLiked] = useState(false);
  const discount = originalPrice
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;

  return (
    <div className="group card-hover">
      <div className="relative bg-card rounded-lg overflow-hidden">
        {/* Image */}
        <Link to={`/product/${id}`} className="block aspect-square overflow-hidden">
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        </Link>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {isNew && (
            <span className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
              NEW
            </span>
          )}
          {isBestSeller && (
            <span className="bg-surface-dark text-surface-dark-foreground text-xs font-semibold px-3 py-1 rounded-full">
              BEST SELLER
            </span>
          )}
          {discount > 0 && (
            <span className="bg-destructive text-destructive-foreground text-xs font-semibold px-3 py-1 rounded-full">
              -{discount}%
            </span>
          )}
        </div>

        {/* Quick Actions */}
        <div className="absolute top-3 right-3">
          <button
            onClick={() => setIsLiked(!isLiked)}
            className={`p-2 rounded-full transition-all ${isLiked
              ? "bg-primary text-primary-foreground"
              : "bg-background/90 backdrop-blur-sm hover:bg-primary hover:text-primary-foreground"
              }`}
          >
            <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
          </button>
        </div>

        {/* Add to Cart - Shows on Hover */}
        <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <Button variant="dark" className="w-full" size="sm">
            <ShoppingBag className="w-4 h-4 mr-2" />
            Add to Cart
          </Button>
        </div>
      </div>

      {/* Product Info */}
      <div className="pt-4 space-y-2">
        <p className="text-xs text-muted-foreground uppercase tracking-wide">
          {category}
        </p>
        <Link to={`/product/${id}`}>
          <h3 className="font-semibold text-foreground hover:text-primary transition-colors line-clamp-1">
            {name}
          </h3>
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-foreground">
            Rs. {price.toLocaleString()}
          </span>
          {originalPrice && (
            <span className="text-sm text-muted-foreground line-through">
              Rs. {originalPrice.toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
