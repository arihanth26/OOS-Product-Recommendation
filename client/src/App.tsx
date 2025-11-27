import { ProductDetailPage } from "./components/ProductDetailPage";
import { toast } from "sonner@2.0.3";

export default function App() {
  // Out-of-Stock Product
  const oosProduct = {
    id: "prod_ww_001",
    name: "Whole Wheat Bread",
    brand: "ABC",
    image: "https://images.unsplash.com/photo-1761929104590-8c6fdca4188a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcnRpc2FuJTIwd2hvbGUlMjB3aGVhdCUyMGJyZWFkfGVufDF8fHx8MTc2MzkzNTEwMnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    price: 4.35,
    pricePerUnit: "$0.29/oz",
    size: "24 oz (680g)",
    department: "Bakery",
    aisle: "Bread & Bakery",
    isOOS: true,
    rating: 4.5,
    reviewCount: 2847,
    description:
      "Made with 100% stone-ground whole wheat flour for maximum nutrition and flavor. Soft texture perfect for sandwiches, with a hearty whole grain taste. No artificial preservatives, colors, or flavors.",
    ingredients:
      "Stone-ground whole wheat flour, water, cane sugar, wheat gluten, yeast, soybean oil, sea salt, cultured wheat flour, vinegar, grain vinegar, citric acid.",
    nutrition: {
      servingSize: "1 slice (43g)",
      calories: 100,
      fat: "1.5g",
      carbs: "19g",
      protein: "4g",
      fiber: "3g",
      sugar: "3g",
    },
  };

  // AI-Recommended Substitute (Best Match from GMM Cluster #42)
  const recommendedProduct = {
    id: "prod_mg_003",
    name: "Multi-Grain Sandwich Bread — Whole Wheat & Seeds",
    brand: "XYZ",
    image: "https://images.unsplash.com/photo-1693480532308-343b33da48e3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdWx0aWdyYWluJTIwYnJlYWR8ZW58MXx8fHwxNzYzODg5OTE2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    price: 4.29,
    pricePerUnit: "$0.29/oz",
    size: "24 oz",
    rating: 4.7,
    reviewCount: 2212,
    acceptanceScore: 94,
    matchReason:
      "Same whole wheat base with added grains and seeds. 93% ingredient similarity, identical texture profile, same brand family. Customers who bought your item accepted this 94% of the time.",
  };

  // Similar Products
  const similarProducts = [
    {
      id: "sim_001",
      name: "Classic White Sandwich Bread",
      brand: "FreshBake",
      image: "https://images.unsplash.com/photo-1600102186542-82cbd5e7bdb4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aGl0ZSUyMHNhbmR3aWNoJTIwYnJlYWR8ZW58MXx8fHwxNzYzOTM1MTAzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      price: 2.99,
      pricePerUnit: "$0.20/oz",
      rating: 4.3,
      reviewCount: 5621,
    },
    {
      id: "sim_002",
      name: "Honey Wheat Bread",
      brand: "GoldenGrain",
      image: "https://images.unsplash.com/photo-1559572820-1e9545c4fd0d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzbGljZWQlMjBicmVhZCUyMHBhY2thZ2V8ZW58MXx8fHwxNzYzOTM1NDM3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      price: 3.49,
      pricePerUnit: "$0.24/oz",
      rating: 4.6,
      reviewCount: 3912,
    },
    {
      id: "sim_003",
      name: "Sourdough Artisan Loaf",
      brand: "BakersChoice",
      image: "https://images.unsplash.com/photo-1612136435571-c97705feadfa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb3VyZG91Z2glMjBicmVhZCUyMGxvYWZ8ZW58MXx8fHwxNzYzODg4MzUxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      price: 5.99,
      pricePerUnit: "$0.37/oz",
      rating: 4.8,
      reviewCount: 1834,
    },
    {
      id: "sim_004",
      name: "Sprouted Grain Bread",
      brand: "NatureVine",
      image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyeWUlMjBicmVhZHxlbnwxfHx8fDE3NjM5MzUxMDN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      price: 5.49,
      pricePerUnit: "$0.34/oz",
      rating: 4.7,
      reviewCount: 2156,
    },
    {
      id: "sim_005",
      name: "Seeded Whole Grain Bread",
      brand: "FreshBake",
      image: "https://images.unsplash.com/photo-1568471173242-461f0a730452?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmVuY2glMjBiYWd1ZXR0ZXxlbnwxfHx8fDE3NjM4NTgzMTV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      price: 4.49,
      pricePerUnit: "$0.30/oz",
      rating: 4.5,
      reviewCount: 1678,
    },
  ];

  // Frequently Bought Together Products
  const bundleProducts = [
    {
      id: "bundle_001",
      name: "Creamy Peanut Butter",
      brand: "NuttySpread",
      image: "https://images.unsplash.com/photo-1691480208637-6ed63aac6694?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZWFudXQlMjBidXR0ZXIlMjBqYXJ8ZW58MXx8fHwxNzYzOTI5OTk4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      price: 4.99,
    },
    {
      id: "bundle_002",
      name: "Strawberry Preserves",
      brand: "BerryBest",
      image: "https://images.unsplash.com/photo-1741521899993-1cbb155691a3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHJhd2JlcnJ5JTIwamFtJTIwamFyfGVufDF8fHx8MTc2MzkwMzg0MXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      price: 3.79,
    },
    {
      id: "bundle_003",
      name: "Salted Butter - 1lb",
      brand: "CreamyFarms",
      image: "https://images.unsplash.com/photo-1734018959142-cf239ce90c82?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXR0ZXIlMjBzdGljayUyMHBhY2thZ2V8ZW58MXx8fHwxNzYzOTM1NDM3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      price: 5.49,
    },
  ];

  const handleAddToCart = (productId: string) => {
    // Find product name from all sources
    let productName = "Product";
    
    if (productId === recommendedProduct.id) {
      productName = recommendedProduct.name;
    } else if (productId === oosProduct.id) {
      productName = oosProduct.name;
    } else {
      const similar = similarProducts.find(p => p.id === productId);
      if (similar) productName = similar.name;
      
      const bundle = bundleProducts.find(p => p.id === productId);
      if (bundle) productName = bundle.name;
    }

    toast.success("Added to cart", {
      description: productName,
    });
  };

  const handleAddBundleToCart = (productIds: string[]) => {
    toast.success(`Added ${productIds.length} items to cart`, {
      description: "Bundle items added successfully",
    });
  };

  const handleSimilarProductClick = (productId: string) => {
    toast.info("Product details", {
      description: "In a real app, this would navigate to the product page",
    });
  };

  return (
    <ProductDetailPage
      product={oosProduct}
      recommendedProduct={recommendedProduct}
      similarProducts={similarProducts}
      bundleProducts={bundleProducts}
      onAddToCart={handleAddToCart}
      onAddBundleToCart={handleAddBundleToCart}
      onSimilarProductClick={handleSimilarProductClick}
    />
  );
}
