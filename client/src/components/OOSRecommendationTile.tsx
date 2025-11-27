import { Sparkles, ShoppingCart, ArrowRight, TrendingUp } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ImageWithFallback } from "./figma/ImageWithFallback";

export interface RecommendedProduct {
  id: string;
  name: string;
  brand: string;
  image: string;
  price: number;
  pricePerUnit: string;
  size: string;
  acceptanceScore: number;
  matchReason: string;
}

interface OOSRecommendationTileProps {
  oosProductName: string;
  recommendedProduct: RecommendedProduct;
  onAddToCart: (productId: string) => void;
}

export function OOSRecommendationTile({
  oosProductName,
  recommendedProduct,
  onAddToCart,
}: OOSRecommendationTileProps) {
  return (
    <Card className="overflow-hidden border-2 border-orange-400 shadow-lg">
      <div className="bg-gradient-to-r from-orange-50 to-amber-50 px-6 py-4 border-b border-orange-200">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl mb-1 text-slate-900">
              Intelligent Substitute Recommendation
            </h2>
            <p className="text-sm text-slate-600">
              Our ML system found the best alternative for you
            </p>
          </div>
          <Badge className="bg-orange-500 text-white">
            AI Powered
          </Badge>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-[220px,1fr,auto] gap-6 items-start">
          {/* Product Image */}
          <div className="flex flex-col items-center">
            <div className="w-[200px] h-[200px] mb-3 bg-white rounded border overflow-hidden flex items-center justify-center">
              <ImageWithFallback
                src={recommendedProduct.image}
                alt={recommendedProduct.name}
                className="max-w-full max-h-full object-contain p-3"
              />
            </div>
            <div className="text-xs text-slate-600 mb-1">
              {recommendedProduct.brand}
            </div>
            <div className="text-sm text-slate-900 mb-2 line-clamp-2 min-h-[2.5rem]">
              {recommendedProduct.name}
            </div>

            <div className="mb-3">
              <div className="text-slate-900 mb-1">
                ${recommendedProduct.price.toFixed(2)}
              </div>
              <div className="text-xs text-slate-500">
                {recommendedProduct.pricePerUnit} • {recommendedProduct.size}
              </div>
            </div>

            <div className="bg-emerald-50 rounded p-2 mb-3">
              <div className="text-xs text-emerald-900">
                <span className="font-medium">Why this? </span>
                {recommendedProduct.matchReason}
              </div>
            </div>

            <Button
              className="w-full bg-orange-600 hover:bg-orange-700"
              onClick={() => onAddToCart(recommendedProduct.id)}
            >
              <ShoppingCart className="size-4 mr-2" />
              Add to Cart
            </Button>
          </div>

          {/* Original OOS Product */}
          <div className="bg-white/60 rounded-lg p-4 border border-orange-200">
            <div className="text-xs text-slate-600 mb-2">Currently Unavailable</div>
            <div className="text-sm text-slate-900 line-clamp-2 mb-2">
              {oosProductName}
            </div>
            <Badge variant="destructive" className="text-xs">
              Out of Stock
            </Badge>
          </div>

          {/* Arrow */}
          <div className="hidden md:flex items-center justify-center">
            <ArrowRight className="size-8 text-orange-600" />
          </div>

          {/* Recommended Product */}
          <div className="bg-white rounded-lg border-2 border-orange-300 shadow-sm hover:shadow-md transition-shadow">
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <Badge className="bg-orange-600 text-white text-xs">
                  <TrendingUp className="size-3 mr-1" />
                  {recommendedProduct.acceptanceScore}% Match
                </Badge>
                <div className="text-xs text-slate-600">Recommended</div>
              </div>

              <div className="aspect-square mb-3 bg-white rounded overflow-hidden">
                <ImageWithFallback
                  src={recommendedProduct.image}
                  alt={recommendedProduct.name}
                  className="w-full h-full object-contain p-4"
                />
              </div>

              <div className="text-xs text-slate-600 mb-1">
                {recommendedProduct.brand}
              </div>
              <div className="text-sm text-slate-900 mb-2 line-clamp-2 min-h-[2.5rem]">
                {recommendedProduct.name}
              </div>

              <div className="mb-3">
                <div className="text-slate-900 mb-1">
                  ${recommendedProduct.price.toFixed(2)}
                </div>
                <div className="text-xs text-slate-500">
                  {recommendedProduct.pricePerUnit} • {recommendedProduct.size}
                </div>
              </div>

              <div className="bg-emerald-50 rounded p-2 mb-3">
                <div className="text-xs text-emerald-900">
                  <span className="font-medium">Why this? </span>
                  {recommendedProduct.matchReason}
                </div>
              </div>

              <Button
                className="w-full bg-orange-600 hover:bg-orange-700"
                onClick={() => onAddToCart(recommendedProduct.id)}
              >
                <ShoppingCart className="size-4 mr-2" />
                Add to Cart
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-orange-200">
        <div className="text-xs text-orange-800 text-center">
          Our recommendation system uses GMM clustering (K=96, Silhouette=0.73) and LambdaMART ranking 
          to find the best substitute based on ingredients, nutrition, price, and purchase patterns.
        </div>
      </div>
    </Card>
  );
}