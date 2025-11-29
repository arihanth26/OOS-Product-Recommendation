import { ShoppingCart, TrendingUp, ArrowUp, ArrowDown, Minus } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { SubstituteProduct } from "./SubstituteRecommendations";

interface ProductCardProps {
  product: SubstituteProduct;
  oosPrice: number;
  onAddToCart: (productId: string) => void;
}

export function ProductCard({ product, oosPrice, onAddToCart }: ProductCardProps) {
  const priceDiffPercent = ((product.price - oosPrice) / oosPrice) * 100;
  const isPriceHigher = product.price > oosPrice;
  const isPriceLower = product.price < oosPrice;

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      {/* Image */}
      <div className="aspect-square relative bg-white">
        <ImageWithFallback
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover"
        />
        
        {/* Acceptance Score Badge */}
        <div className="absolute top-3 left-3">
          <Badge className="bg-emerald-600 text-white">
            <TrendingUp className="size-3 mr-1" />
            {product.acceptanceScore}% Match
          </Badge>
        </div>

        {/* Cluster Badge */}
        <div className="absolute top-3 right-3">
          <Badge variant="secondary" className="bg-white/90 text-slate-900">
            {product.cluster}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Brand & Name */}
        <div className="text-xs text-slate-600 mb-1">{product.brand}</div>
        <h3 className="text-slate-900 mb-2 line-clamp-2 min-h-[2.5rem]">
          {product.name}
        </h3>

        {/* Match Reason */}
        <div className="text-xs text-slate-600 mb-3 flex items-start gap-1">
          <span className="text-blue-600 flex-shrink-0">✓</span>
          <span className="line-clamp-2">{product.matchReason}</span>
        </div>

        {/* Acceptance Score Progress */}
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-slate-600">Acceptance Score</span>
            <span className="text-emerald-600">{product.acceptanceScore}/100</span>
          </div>
          <Progress value={product.acceptanceScore} className="h-2" />
        </div>

        {/* Price Comparison */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-slate-900">${product.price.toFixed(2)}</div>
            <div className="text-xs text-slate-500">{product.pricePerUnit}</div>
          </div>
          
          {/* Price Difference Indicator */}
          <div className={`flex items-center gap-1 text-xs ${
            isPriceHigher 
              ? "text-red-600" 
              : isPriceLower 
              ? "text-emerald-600" 
              : "text-slate-600"
          }`}>
            {isPriceHigher && <ArrowUp className="size-3" />}
            {isPriceLower && <ArrowDown className="size-3" />}
            {!isPriceHigher && !isPriceLower && <Minus className="size-3" />}
            <span>
              {isPriceHigher && "+"}
              {Math.abs(priceDiffPercent).toFixed(1)}%
            </span>
          </div>
        </div>

        {/* RBV Delta */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-600">RBV Impact</span>
            <span className={
              product.rbvDelta >= 0 
                ? "text-emerald-600" 
                : "text-amber-600"
            }>
              {product.rbvDelta >= 0 ? "+" : ""}${Math.abs(product.rbvDelta).toFixed(2)}
            </span>
          </div>
        </div>

        {/* Add to Cart Button */}
        <Button
          className="w-full bg-emerald-600 hover:bg-emerald-700"
          onClick={() => onAddToCart(product.id)}
        >
          <ShoppingCart className="size-4 mr-2" />
          Add to Cart
        </Button>

        {/* Size */}
        <div className="text-xs text-slate-500 text-center mt-2">
          {product.size}
        </div>
      </div>
    </Card>
  );
}
