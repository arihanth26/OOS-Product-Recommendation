import { ArrowLeft, ShoppingCart, Info, Sparkles, TrendingUp, Package } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription } from "./ui/alert";
import { ProductCard } from "./ProductCard";

export interface SubstituteProduct {
  id: string;
  name: string;
  brand: string;
  image: string;
  price: number;
  pricePerUnit: string;
  size: string;
  acceptanceScore: number; // 0-100, from your ranking model
  cluster: string; // GMM cluster label
  rbvDelta: number; // Retained Basket Value difference
  priceDiff: number; // Price difference from OOS product
  matchReason: string; // Why this was recommended
  isInStock: boolean;
}

interface RecommendationTier {
  title: string;
  description: string;
  icon: React.ReactNode;
  products: SubstituteProduct[];
  tierType: "exact" | "cluster" | "similar";
}

interface SubstituteRecommendationsProps {
  oosProductName: string;
  oosProductPrice: number;
  recommendations: RecommendationTier[];
  onBack: () => void;
  onAddToCart: (productId: string) => void;
}

export function SubstituteRecommendations({
  oosProductName,
  oosProductPrice,
  recommendations,
  onBack,
  onAddToCart,
}: SubstituteRecommendationsProps) {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShoppingCart className="size-8 text-emerald-600" />
              <span className="text-emerald-600">FreshCart Grocery</span>
            </div>
            <Button variant="outline" size="sm">
              View Cart (3)
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Button variant="ghost" onClick={onBack} className="mb-6">
          <ArrowLeft className="size-4 mr-2" />
          Back to Product
        </Button>

        {/* Header Section */}
        <div className="mb-8">
          <h1 className="mb-3 text-slate-900">Recommended Substitutes</h1>
          <p className="text-slate-600 mb-4">
            For: <span className="text-slate-900">{oosProductName}</span> (${oosProductPrice.toFixed(2)})
          </p>

          <Alert className="border-blue-200 bg-blue-50">
            <Info className="size-4 text-blue-600" />
            <AlertDescription className="text-blue-900">
              Our AI-powered recommendation system analyzes product attributes, your shopping history, 
              and 200,000+ customer purchase patterns to find the best substitutes. Products are ranked 
              using LambdaMART with GMM clustering features (Cluster K=96, Silhouette=0.73).
            </AlertDescription>
          </Alert>
        </div>

        {/* Metrics Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="p-4 bg-gradient-to-br from-emerald-50 to-white border-emerald-200">
            <div className="flex items-center gap-3">
              <div className="size-12 rounded-full bg-emerald-100 flex items-center justify-center">
                <TrendingUp className="size-6 text-emerald-600" />
              </div>
              <div>
                <div className="text-sm text-slate-600">Acceptance Rate</div>
                <div className="text-slate-900">87.3%</div>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-blue-50 to-white border-blue-200">
            <div className="flex items-center gap-3">
              <div className="size-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Sparkles className="size-6 text-blue-600" />
              </div>
              <div>
                <div className="text-sm text-slate-600">NDCG@5</div>
                <div className="text-slate-900">0.89</div>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-purple-50 to-white border-purple-200">
            <div className="flex items-center gap-3">
              <div className="size-12 rounded-full bg-purple-100 flex items-center justify-center">
                <Package className="size-6 text-purple-600" />
              </div>
              <div>
                <div className="text-sm text-slate-600">Avg RBV Retained</div>
                <div className="text-slate-900">94.2%</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Recommendation Tiers */}
        {recommendations.map((tier, index) => (
          <div key={index} className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <div className={`size-10 rounded-lg flex items-center justify-center ${
                tier.tierType === "exact" 
                  ? "bg-emerald-100 text-emerald-600" 
                  : tier.tierType === "cluster"
                  ? "bg-blue-100 text-blue-600"
                  : "bg-slate-100 text-slate-600"
              }`}>
                {tier.icon}
              </div>
              <div>
                <h2 className="text-slate-900">{tier.title}</h2>
                <p className="text-sm text-slate-600">{tier.description}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tier.products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  oosPrice={oosProductPrice}
                  onAddToCart={onAddToCart}
                />
              ))}
            </div>
          </div>
        ))}

        {/* Footer Info */}
        <Card className="p-6 mt-8 bg-slate-100 border-slate-300">
          <h3 className="mb-3 text-slate-900">How Our Recommendation System Works</h3>
          <div className="space-y-3 text-sm text-slate-700">
            <div className="flex gap-3">
              <div className="size-6 rounded-full bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                1
              </div>
              <div>
                <span>
                  <strong>GMM Clustering:</strong> Products are clustered into 96 groups using Gaussian Mixture Models 
                  with features from TF-IDF text embeddings, nutritional data, and price bands (Silhouette Score: 0.73).
                </span>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="size-6 rounded-full bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                2
              </div>
              <div>
                <span>
                  <strong>K-Partite Graph:</strong> A hierarchical graph connects products (P1) → clusters (P2) → aisles (P3), 
                  enabling efficient candidate retrieval and interpretable fallback paths.
                </span>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="size-6 rounded-full bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                3
              </div>
              <div>
                <span>
                  <strong>LambdaMART Ranking:</strong> A gradient-boosted ranker optimizes acceptance@K using features 
                  from product taxonomy, user history, graph distances, and GMM posterior probabilities.
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
