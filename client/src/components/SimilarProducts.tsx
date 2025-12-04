import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Star } from "lucide-react";

export interface SimilarProduct {
  id: string;
  name: string;
  brand: string;
  image: string;
  price: number;
  pricePerUnit: string;
  rating: number;
  reviewCount: number;
}

interface SimilarProductsProps {
  products: SimilarProduct[];
  onProductClick: (productId: string) => void;
}

export function SimilarProducts({ products, onProductClick }: SimilarProductsProps) {
  return (
    <div className="py-8">
      <h2 className="mb-6 text-slate-900">Similar items you might like</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {products.map((product) => (
          <Card
            key={product.id}
            className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => onProductClick(product.id)}
          >
            <div className="aspect-square bg-white relative p-4">
              <ImageWithFallback
                src={product.image}
                alt={product.name}
                className="w-full h-full object-contain"
              />
            </div>
            
            <div className="p-3">
              <div className="text-xs text-slate-600 mb-1 line-clamp-1">
                {product.brand}
              </div>
              <div className="text-sm text-slate-900 mb-2 line-clamp-2 min-h-[2.5rem]">
                {product.name}
              </div>
              
              <div className="flex items-center gap-1 mb-2">
                <div className="flex items-center">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`size-3 ${
                        i < Math.floor(product.rating)
                          ? "fill-amber-400 text-amber-400"
                          : "text-slate-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs text-slate-600">
                  ({product.reviewCount})
                </span>
              </div>
              
              <div className="text-slate-900 mb-1">
                ${product.price.toFixed(2)}
              </div>
              <div className="text-xs text-slate-500">
                {product.pricePerUnit}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}