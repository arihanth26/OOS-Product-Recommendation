import { Plus, ShoppingCart } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { InfoHoverCard, InfoCardContent } from "./InfoHoverCard";
import { useState } from "react";

export interface BundleProduct {
  id: string;
  name: string;
  brand: string;
  image: string;
  price: number;
  isMainProduct?: boolean;
}

interface FrequentlyBoughtTogetherProps {
  mainProduct: BundleProduct;
  bundleProducts: BundleProduct[];
  onAddAllToCart: (productIds: string[]) => void;
  onProductNavigate?: (productId: string) => void; // optional navigation callback
}

export function FrequentlyBoughtTogether({
  mainProduct,
  bundleProducts,
  onAddAllToCart,
  onProductNavigate,
}: FrequentlyBoughtTogetherProps) {
  const [selectedProducts, setSelectedProducts] = useState<string[]>([
    mainProduct.id,
    ...bundleProducts.map(p => p.id),
  ]);

  const toggleProduct = (productId: string) => {
    if (productId === mainProduct.id) return; // Can't deselect main product
    setSelectedProducts((prev: string[]) =>
      prev.includes(productId)
        ? prev.filter((id: string) => id !== productId)
        : [...prev, productId]
    );
  };

  const allProducts = [mainProduct, ...bundleProducts];
  const totalPrice = allProducts
    .filter(p => selectedProducts.includes(p.id))
    .reduce((sum, p) => sum + p.price, 0);

  return (
    <div className="py-8">
      <h2 className="mb-6 text-slate-900 flex items-center gap-2">
        Frequently bought together
        <InfoHoverCard label="About Frequently Bought Together">
          <InfoCardContent
            title="What are Frequently Bought Together items?"
            body="Frequently Bought Together suggests complementary products that enhance your main purchase — NOT replacements. These recommendations help you discover items that pair well together, creating a complete shopping experience. Think of them as the supporting cast that makes your main product shine."
            highlight="🍞 For bread, this might include: butter, spreads, preserves, jams, honey, peanut butter, or breakfast essentials like eggs and bacon. These items complete your meal, not substitute for the bread itself."
            callout="Key distinction: Unlike 'Similar Items' or 'Best Replacement' which offer alternatives to your product, these items are meant to be purchased together with your main selection."
            bullets={[
              "Complementary products (not substitutes)",
              "Cross-category suggestions (e.g., bread → butter)",
              "Based on actual shopping baskets",
              "Increases cart value and convenience",
              "Time-saving meal planning"
            ]}
            footer="These recommendations use collaborative filtering on millions of shopping sessions to identify which products are frequently purchased together. The system learns natural product pairings from real customer behavior, not pre-defined rules."
          />
        </InfoHoverCard>
      </h2>
      
      <Card className="p-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Products Grid */}
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-4">
              {allProducts.map((product, index) => (
                <div
                  key={product.id}
                  className="flex items-center gap-4"
                  onClick={() => {
                    if (onProductNavigate && !product.isMainProduct) onProductNavigate(product.id);
                  }}
                  role={onProductNavigate && !product.isMainProduct ? 'button' : undefined}
                  tabIndex={onProductNavigate && !product.isMainProduct ? 0 : undefined}
                >
                  {index > 0 && (
                    <Plus className="size-5 text-slate-400 flex-shrink-0" />
                  )}
                  
                  <div className="flex flex-col items-center gap-2">
                    <div className="relative">
                      <div className="w-32 h-32 border rounded-lg overflow-hidden bg-white p-2">
                        <ImageWithFallback
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      
                      {/* Checkbox overlay */}
                      <div className="absolute -top-2 -right-2">
                        <div className="bg-white rounded-full p-1 shadow-md">
                          <Checkbox
                            checked={selectedProducts.includes(product.id)}
                            onCheckedChange={() => toggleProduct(product.id)}
                            disabled={product.isMainProduct}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-center max-w-[128px]">
                      <div className="text-xs text-slate-600 mb-1 line-clamp-1">
                        {product.brand}
                      </div>
                      <div className="text-sm text-slate-900 line-clamp-2 mb-1">
                        {product.name}
                      </div>
                      <div className="text-slate-900">
                        ${product.price.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Add to Cart Section */}
          <div className="lg:border-l lg:pl-6 flex flex-col justify-center gap-4 min-w-[200px]">
            <div>
              <div className="text-sm text-slate-600 mb-1">
                Total for {selectedProducts.length} {selectedProducts.length === 1 ? 'item' : 'items'}:
              </div>
              <div className="text-2xl text-slate-900">
                ${totalPrice.toFixed(2)}
              </div>
            </div>
            
            <Button
              className="w-full bg-emerald-600 hover:bg-emerald-700"
              onClick={() => onAddAllToCart(selectedProducts)}
            >
              <ShoppingCart className="size-4 mr-2" />
              Add {selectedProducts.length} to Cart
            </Button>
            
            <div className="text-xs text-slate-500 text-center">
              Select items above to customize bundle
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}