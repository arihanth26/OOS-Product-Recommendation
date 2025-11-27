import { ShoppingCart, Star, MapPin, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./ui/button";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { OOSRecommendationTile, RecommendedProduct } from "./OOSRecommendationTile";
import { SimilarProducts, SimilarProduct } from "./SimilarProducts";
import { FrequentlyBoughtTogether, BundleProduct } from "./FrequentlyBoughtTogether";
import { InfoHoverCard, InfoCardContent } from "./InfoHoverCard";
import { VisualizationCTA } from "./VisualizationCTA";
import { useState } from "react";

interface Product {
  id: string;
  name: string;
  brand: string;
  image: string;
  price: number;
  pricePerUnit: string;
  size: string;
  department: string;
  aisle: string;
  isOOS: boolean;
  rating: number;
  reviewCount: number;
  description: string;
  ingredients: string;
  nutrition: {
    servingSize: string;
    calories: number;
    fat: string;
    carbs: string;
    protein: string;
    fiber: string;
    sugar: string;
  };
}

interface ProductDetailPageProps {
  product: Product;
  recommendedProduct?: RecommendedProduct;
  similarProducts: SimilarProduct[];
  bundleProducts: BundleProduct[];
  onAddToCart: (productId: string) => void;
  onAddBundleToCart: (productIds: string[]) => void;
  onSimilarProductClick: (productId: string) => void;
}

export function ProductDetailPage({
  product,
  recommendedProduct,
  similarProducts,
  bundleProducts,
  onAddToCart,
  onAddBundleToCart,
  onSimilarProductClick,
}: ProductDetailPageProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  
  // Multiple product images
  const productImages = [
    "https://images.unsplash.com/photo-1622809705750-81b0934c2ca5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxicmVhZCUyMHBhY2thZ2UlMjBsYWJlbCUyMGdyb2Nlcnl8ZW58MXx8fHwxNjczOTM2NDA4fDA&ixlib=rb-4.1.0&q=80&w=1080",
    "https://images.unsplash.com/photo-1706600132274-7fd0912f2fb3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aGVhdCUyMGJyZWFkJTIwbG9hZiUyMHBhY2thZ2luZ3xlbnwxfHx8fDE3NjM5MzY0MDl8MA&ixlib=rb-4.1.0&q=80&w=1080",
    "https://images.unsplash.com/photo-1551276929-3f75211e0986?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzbGljZWQlMjBicmVhZCUyMGNsb3NldXB8ZW58MXx8fHwxNjczOTM2NDEwfDA&ixlib=rb-4.1.0&q=80&w=1080",
    "https://images.unsplash.com/photo-1693480532368-de842fb9dcf4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxicmVhZCUyMG51dHJpdGlvbiUyMGxhYmVsfGVufDF8fHx8MTc2MzkzNjQwOXww&ixlib=rb-4.1.0&q=80&w=1080",
  ];

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: 'Amazon Ember, Inter, Helvetica, sans-serif' }}>
      {/* Amazon-style Header */}
      <header className="bg-[#131921] text-white sticky top-0 z-10">
        <div className="px-2 md:px-4 py-2">
          <div className="flex items-center gap-2 md:gap-4">
            {/* Logo */}
            <div className="flex items-center gap-1 md:gap-2">
              <ShoppingCart className="size-6 md:size-8 text-white" />
              <span className="text-lg md:text-2xl">FreshMart</span>
            </div>
            
            {/* Deliver to */}
            <div className="hidden md:flex items-center gap-1 text-sm hover:border border-white px-2 py-1 cursor-pointer">
              <MapPin className="size-4" />
              <div>
                <div className="text-xs text-slate-400">Deliver to</div>
                <div>Atlanta 30353</div>
              </div>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-2xl">
              <div className="flex">
                <input
                  type="text"
                  placeholder="Search"
                  className="flex-1 px-2 md:px-4 py-1.5 md:py-2 rounded-l text-slate-900 text-sm md:text-base"
                />
                <button className="bg-[#febd69] px-2 md:px-4 py-1.5 md:py-2 rounded-r hover:bg-[#f3a847]">
                  <Search className="size-4 md:size-5 text-slate-900" />
                </button>
              </div>
            </div>

            {/* Right Nav - Cart icon on mobile */}
            <div className="flex items-center gap-2 md:gap-6">
              <div className="hidden lg:flex items-center gap-6">
                <div className="text-sm hover:border border-white px-2 py-1 cursor-pointer">
                  <div className="text-xs">Hello, sign in</div>
                  <div>Account & Lists</div>
                </div>
                <div className="text-sm hover:border border-white px-2 py-1 cursor-pointer">
                  <div className="text-xs">Returns</div>
                  <div>& Orders</div>
                </div>
              </div>
              <div className="flex items-center gap-1 hover:border border-white px-1 md:px-2 py-1 cursor-pointer">
                <ShoppingCart className="size-6 md:size-8" />
                <span className="text-base md:text-lg">3</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-[1480px] mx-auto px-4 py-4">
        {/* Breadcrumb */}
        <div className="text-xs mb-4" style={{ color: '#565959' }}>
          <span className="cursor-pointer hover:underline" style={{ color: '#007185' }}>Home</span>
          <span className="mx-1">›</span>
          <span className="cursor-pointer hover:underline" style={{ color: '#007185' }}>{product.department}</span>
          <span className="mx-1">›</span>
          <span className="cursor-pointer hover:underline" style={{ color: '#007185' }}>{product.aisle}</span>
          <span className="mx-1">›</span>
          <span>{product.name}</span>
        </div>

        {/* Main Product Grid: 12-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-6">
          {/* Mobile: Thumbnails as horizontal strip below image */}
          <div className="lg:hidden order-2">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {productImages.map((image, index) => (
                <button
                  key={index}
                  className={`flex-shrink-0 w-[60px] h-[60px] border ${
                    index === selectedImage ? "border-[#007185] border-2" : "border-transparent hover:border-[#D5D9D9]"
                  } bg-white flex items-center justify-center overflow-hidden`}
                  onClick={() => setSelectedImage(index)}
                >
                  <ImageWithFallback
                    src={image}
                    alt={`${product.name} view ${index + 1}`}
                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Desktop: Thumbnail Strip - Spans 1 column */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="flex flex-col gap-2">
              {productImages.map((image, index) => (
                <button
                  key={index}
                  className={`w-[60px] h-[60px] border ${
                    index === selectedImage ? "border-[#007185] border-2" : "border-transparent hover:border-[#D5D9D9]"
                  } bg-white flex items-center justify-center overflow-hidden`}
                  onClick={() => setSelectedImage(index)}
                >
                  <ImageWithFallback
                    src={image}
                    alt={`${product.name} view ${index + 1}`}
                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Main Product Image - Mobile full width, Desktop 4 columns */}
          <div className="order-1 lg:order-none lg:col-span-4">
            <div className="bg-white flex items-center justify-center mx-auto" style={{ maxWidth: '400px', height: '300px', overflow: 'hidden' }}>
              <ImageWithFallback
                src={productImages[selectedImage]}
                alt={product.name}
                style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
              />
            </div>
          </div>

          {/* Product Info - Mobile full width, Desktop 4 columns */}
          <div className="order-3 lg:order-none lg:col-span-4">
            {/* Product Title */}
            <h1 className="mb-2" style={{ fontSize: '18px', fontWeight: 'bold', color: '#0F1111', lineHeight: '1.4' }}>
              {product.brand} {product.name} - {product.size}
            </h1>
            
            {/* Store Link */}
            <div className="mb-3">
              <a href="#" className="hover:underline" style={{ fontSize: '13px', color: '#007185' }}>
                Visit the {product.brand} Store
              </a>
            </div>
            
            {/* Ratings Row */}
            <div className="flex items-center gap-2 mb-3">
              <span style={{ fontSize: '14px', color: '#0F1111', fontWeight: 'bold' }}>{product.rating}</span>
              <div className="flex items-center">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`size-4 ${
                      i < Math.floor(product.rating)
                        ? "fill-[#ffa41c] text-[#ffa41c]"
                        : "text-[#D5D9D9]"
                    }`}
                  />
                ))}
              </div>
              <a href="#" className="hover:underline" style={{ fontSize: '13px', color: '#007185' }}>
                {product.reviewCount?.toLocaleString() || '0'} ratings
              </a>
            </div>

            {/* Best Seller Badge */}
            <div className="mb-3">
              <span className="bg-[#c45500] text-white px-2 py-0.5" style={{ fontSize: '12px' }}>
                #1 Best Seller
              </span>
              <span className="ml-2" style={{ fontSize: '13px', color: '#565959' }}>in {product.aisle}</span>
            </div>

            {/* Divider */}
            <div className="border-t border-[#D5D9D9] my-3"></div>

            {/* Price */}
            <div className="mb-3">
              <div className="flex items-baseline gap-1">
                <span style={{ fontSize: '18px', color: '#0F1111' }}>$</span>
                <span style={{ fontSize: '28px', fontWeight: 'bold', color: '#0F1111', letterSpacing: '-0.5px' }}>
                  {product.price.toFixed(2)}
                </span>
                <span style={{ fontSize: '14px', color: '#565959', marginLeft: '6px' }}>
                  ({product.pricePerUnit})
                </span>
              </div>
            </div>

            {/* Subscription Tag */}
            {!product.isOOS && (
              <div className="mb-4">
                <span style={{ fontSize: '12px', color: '#CC0C39', backgroundColor: '#FFF7E0', padding: '4px 8px', borderRadius: '4px', fontWeight: '600' }}>
                  Subscribe & Save eligible
                </span>
              </div>
            )}

            {/* Size */}
            <div className="mb-4">
              <span style={{ fontSize: '14px', color: '#565959' }}>Size: </span>
              <span style={{ fontSize: '14px', color: '#0F1111', fontWeight: 'bold' }}>{product.size}</span>
            </div>

            {/* About This Item */}
            <div className="mt-6">
              <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#0F1111', marginBottom: '16px' }}>
                About this item
              </h2>
              <ul className="space-y-2">
                <li className="flex gap-2" style={{ fontSize: '14px', color: '#0F1111', lineHeight: '1.6' }}>
                  <span>●</span>
                  <span>24 oz loaf of soft whole wheat sandwich bread</span>
                </li>
                <li className="flex gap-2" style={{ fontSize: '14px', color: '#0F1111', lineHeight: '1.6' }}>
                  <span>●</span>
                  <span>Made with 100% whole wheat flour as the first ingredient</span>
                </li>
                <li className="flex gap-2" style={{ fontSize: '14px', color: '#0F1111', lineHeight: '1.6' }}>
                  <span>●</span>
                  <span>Contains 3g of fiber per slice to support digestive health</span>
                </li>
                <li className="flex gap-2" style={{ fontSize: '14px', color: '#0F1111', lineHeight: '1.6' }}>
                  <span>●</span>
                  <span>No artificial flavors, colors, or high fructose corn syrup</span>
                </li>
                <li className="flex gap-2" style={{ fontSize: '14px', color: '#0F1111', lineHeight: '1.6' }}>
                  <span>●</span>
                  <span>Perfect for sandwiches, toast, or as a wholesome snack</span>
                </li>
                <li className="flex gap-2" style={{ fontSize: '14px', color: '#0F1111', lineHeight: '1.6' }}>
                  <span>●</span>
                  <span>Resealable packaging helps keep bread fresh</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Buy Box - Mobile full width, Desktop 2 columns */}
          <div className="order-4 lg:order-none lg:col-span-2">
            <div className="border border-[#D5D9D9] bg-white p-4 sticky top-20">
              {/* Price in Buy Box */}
              <div className="mb-2">
                <div className="flex items-baseline gap-1">
                  <span style={{ fontSize: '15px', color: '#0F1111' }}>$</span>
                  <span style={{ fontSize: '19px', fontWeight: 'bold', color: '#0F1111' }}>
                    {Math.floor(product.price)}
                  </span>
                  <span style={{ fontSize: '19px', fontWeight: 'bold', color: '#0F1111' }}>
                    {(product.price % 1).toFixed(2).substring(1)}
                  </span>
                </div>
              </div>

              {product.isOOS ? (
                <>
                  {/* OOS Message */}
                  <div className="mb-4 flex items-center gap-2" style={{ fontSize: '14px', color: '#CC0C39', fontWeight: '600' }}>
                    <span>Currently unavailable.</span>
                    <InfoHoverCard label="Why is this unavailable?">
                      <InfoCardContent
                        title="This item is out of stock"
                        body="You reached this page after researching a very specific item (e.g., seeded whole-wheat, 24 oz). When it's unavailable, shoppers typically leave to hunt for a close match, wasting time and risking an abandoned order."
                        callout="We surface a near-identical substitute right on this page to keep your basket intact."
                        footer="Availability updates continuously as stores restock."
                        bullets={["Same size/price band", "Same style/texture", "Same brand family"]}
                      />
                    </InfoHoverCard>
                  </div>
                  
                  {/* Delivery Info */}
                  <div className="mb-3" style={{ fontSize: '13px', color: '#565959' }}>
                    <div className="mb-1" style={{ color: '#007185', fontWeight: '600' }}>$12.99 scheduled delivery</div>
                    <div style={{ color: '#CC0C39', fontWeight: '600' }}>Overnight 4 AM - 8 AM</div>
                  </div>
                  
                  {/* Location */}
                  <div className="flex items-start gap-1 mb-4" style={{ fontSize: '13px' }}>
                    <MapPin className="size-4 flex-shrink-0 mt-0.5" style={{ color: '#007185' }} />
                    <span className="cursor-pointer hover:underline" style={{ color: '#007185' }}>
                      Deliver to Atlanta 30353
                    </span>
                  </div>
                  
                  {/* Quantity - Disabled */}
                  <div className="mb-3">
                    <select
                      className="w-full border border-[#D5D9D9] px-3 cursor-not-allowed"
                      style={{ height: '32px', fontSize: '14px', backgroundColor: '#F0F2F2', color: '#565959' }}
                      disabled
                    >
                      <option>Quantity: 1</option>
                    </select>
                  </div>
                  
                  {/* Add to Cart - Disabled */}
                  <Button
                    className="w-full mb-2"
                    style={{
                      height: '40px',
                      backgroundColor: '#F0F2F2',
                      color: '#565959',
                      fontSize: '15px',
                      borderRadius: '8px',
                      cursor: 'not-allowed',
                      border: '1px solid #D5D9D9',
                      fontWeight: 'bold'
                    }}
                    disabled
                  >
                    Add to Cart
                  </Button>
                  
                  {/* Buy Now - Disabled */}
                  <Button
                    className="w-full mb-3"
                    style={{
                      height: '40px',
                      backgroundColor: '#F0F2F2',
                      color: '#565959',
                      fontSize: '15px',
                      fontWeight: 'bold',
                      borderRadius: '8px',
                      cursor: 'not-allowed',
                      border: '1px solid #D5D9D9'
                    }}
                    disabled
                  >
                    Buy Now
                  </Button>
                </>
              ) : (
                <>
                  {/* Delivery Info */}
                  <div className="mb-3" style={{ fontSize: '13px', color: '#565959' }}>
                    <div className="mb-1">FREE delivery <span style={{ fontWeight: 'bold', color: '#0F1111' }}>Tomorrow</span></div>
                    <div>Order within <span style={{ color: '#007600', fontWeight: '600' }}>5 hrs 38 mins</span></div>
                  </div>
                  
                  {/* Location */}
                  <div className="flex items-start gap-1 mb-3" style={{ fontSize: '13px' }}>
                    <MapPin className="size-4 flex-shrink-0 mt-0.5" style={{ color: '#007185' }} />
                    <span className="cursor-pointer hover:underline" style={{ color: '#007185' }}>
                      Deliver to Atlanta 30353
                    </span>
                  </div>
                  
                  {/* In Stock */}
                  <div className="mb-4" style={{ fontSize: '14px', color: '#007600', fontWeight: 'bold' }}>
                    In Stock
                  </div>
                  
                  {/* Quantity */}
                  <div className="mb-3">
                    <select
                      className="w-full border border-[#D5D9D9] px-3 bg-white"
                      style={{ height: '32px', fontSize: '14px', color: '#0F1111' }}
                    >
                      <option>Quantity: 1</option>
                      <option>Quantity: 2</option>
                      <option>Quantity: 3</option>
                      <option>Quantity: 4</option>
                      <option>Quantity: 5</option>
                    </select>
                  </div>
                  
                  {/* Add to Cart */}
                  <Button
                    className="w-full mb-2 hover:bg-[#F7CA00]"
                    style={{
                      height: '40px',
                      backgroundColor: '#FFD814',
                      color: '#0F1111',
                      fontSize: '15px',
                      borderRadius: '8px',
                      fontWeight: 'bold',
                      border: 'none'
                    }}
                    onClick={() => onAddToCart(product.id)}
                  >
                    Add to Cart
                  </Button>
                  
                  {/* Buy Now */}
                  <Button
                    className="w-full mb-3 hover:bg-[#E77600]"
                    style={{
                      height: '40px',
                      backgroundColor: '#FA8900',
                      color: 'white',
                      fontSize: '15px',
                      fontWeight: 'bold',
                      borderRadius: '8px',
                      border: 'none'
                    }}
                  >
                    Buy Now
                  </Button>
                </>
              )}

              {/* Secure Transaction */}
              <div className="border-t border-[#D5D9D9] pt-3 mt-3">
                <a href="#" className="hover:underline" style={{ fontSize: '13px', color: '#007185' }}>
                  Secure transaction
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* AI-Powered Substitute Recommendation - Only when OOS */}
        {product.isOOS && recommendedProduct && (
          <div className="mb-6 rounded-xl overflow-hidden shadow-md border border-[#E0E0E0] relative bg-gradient-to-br from-[#F8FBFF] to-[#FFFFFF]">
            {/* Header with AI Badge */}
            <div className="bg-[#F7F7F7] p-3 md:p-4 relative border-b border-[#D5D9D9]">
              {/* AI Badge */}
              <div className="absolute top-2 right-2 bg-[#232F3E] text-white px-2 py-0.5 md:px-2.5 md:py-1 rounded flex items-center gap-1" style={{ fontSize: '10px', fontWeight: 'bold' }}>
                <svg className="size-3 md:size-3.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" fill="currentColor"/>
                </svg>
                <span className="hidden sm:inline">AI POWERED</span>
                <span className="sm:hidden">AI</span>
              </div>
              
              <div className="max-w-[1200px] pr-16 md:pr-24">
                <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-3 mb-1">
                  <h2 className="flex items-center gap-2" style={{ fontSize: '18px', fontWeight: 'bold', color: '#0F1111', lineHeight: '1.4' }}>
                    <span className="hidden sm:inline">Best Replacement for your product that is currently out of stock</span>
                    <span className="sm:hidden">Best Replacement</span>
                    <InfoHoverCard 
                      label="How we picked this replacement"
                      headerContent={
                        <VisualizationCTA 
                          onOpenVisualization={() => {
                            alert('Opening visualization panel...\n\nThis would open an interactive D3.js visualization showing:\n• k-Partite Graph structure\n• GMM clusters\n• Product substitution network\n• LambdaMART ranking features');
                          }}
                        />
                      }
                      tabs={[
                        {
                          label: "Overview",
                          content: (
                            <InfoCardContent
                              title="How we chose this substitute"
                              body="We compute product similarity using a layered graph of the catalog and shopper behavior. The engine looks at ingredients, nutrition, size/pack, text descriptions, aisle context, and what similar shoppers picked in the same situation."
                              callout="Our AI ranks near-equivalents that keep your basket value about the same while maintaining product quality and characteristics."
                              bullets={["Ingredient matching", "Nutritional similarity", "Size/price equivalence", "Customer preferences"]}
                            />
                          )
                        },
                        {
                          label: "Technical View",
                          content: (
                            <InfoCardContent
                              title="CS 7641 Project: Algorithm Pipeline"
                              body="Our recommendation system uses a sophisticated multi-stage approach that combines graph theory, unsupervised learning, and learning-to-rank algorithms to identify optimal product substitutes:"
                              showcase={[
                                { label: "k-Partite Graph", description: "Constructs a layered graph structure separating near-duplicates (partition 1), GMM clusters (partition 2), and product categories/aisles (partition 3)" },
                                { label: "GMM Clustering", description: "Uses Gaussian Mixture Models to build soft substitute families based on product features and shopping patterns" },
                                { label: "LLM-Prior GMM", description: "Enhances clustering stability by incorporating domain knowledge through language model priors" },
                                { label: "LightGBM Ranker", description: "Employs gradient boosted decision trees to rank candidate substitutes using features like text similarity, nutritional profiles, and purchase history" }
                              ]}
                              metrics={["NDCG↑ (ranking quality)", "MRR↑ (top result relevance)", "RBV preserved (basket value)", "Coverage↑ (catalog coverage)", "Calibrated (confidence scores)"]}
                            />
                          )
                        }
                      ]}
                    />
                  </h2>
                </div>
                <p style={{ fontSize: '12px', color: '#565959' }}>
                  <span className="hidden sm:inline">We compared similar products and picked the best replacement for your product.</span>
                  <span className="sm:hidden">AI-selected best match</span>
                </p>
              </div>
            </div>

            {/* Content Area */}
            <div className="bg-white p-3 md:p-4">
              <div className="flex flex-col md:flex-row gap-4 items-start">
                {/* Left: Product Image */}
                <div className="flex-shrink-0 w-full md:w-auto mx-auto md:mx-0">
                  <div className="bg-white border border-[#D5D9D9] rounded-lg p-3 flex items-center justify-center mb-2" style={{ width: '200px', height: '200px' }}>
                    <ImageWithFallback
                      src={recommendedProduct.image}
                      alt={recommendedProduct.name}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                  
                  {/* Reassurance chips below image - Single row on desktop, stacked on mobile */}
                  <div className="flex flex-col md:flex-row md:flex-nowrap gap-1 md:gap-0.5" style={{ width: '200px' }}>
                    <span className="inline-flex items-center justify-center bg-[#F3F3F3] text-[#0F1111] px-1 py-0.5 rounded border border-[#D5D9D9] flex-1" style={{ fontSize: '9px', fontWeight: '600', whiteSpace: 'nowrap' }}>
                      <svg className="size-2.5 mr-0.5 text-[#C45500] flex-shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Highly similar
                    </span>
                    <span className="inline-flex items-center justify-center bg-[#F3F3F3] text-[#0F1111] px-1 py-0.5 rounded border border-[#D5D9D9] flex-1" style={{ fontSize: '9px', fontWeight: '600', whiteSpace: 'nowrap' }}>
                      <svg className="size-2.5 mr-0.5 text-[#C45500] flex-shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M13 7H11V13H17V11H13V7Z" fill="currentColor"/>
                        <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z" fill="currentColor"/>
                      </svg>
                      <span className="hidden md:inline">Popular</span>
                      <span className="md:hidden">Popular pick</span>
                    </span>
                    <span className="inline-flex items-center justify-center bg-[#F3F3F3] text-[#0F1111] px-1 py-0.5 rounded border border-[#D5D9D9] flex-1" style={{ fontSize: '9px', fontWeight: '600', whiteSpace: 'nowrap' }}>
                      <svg className="size-2.5 mr-0.5 text-[#C45500] flex-shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span className="hidden md:inline">$ Match</span>
                      <span className="md:hidden">Same price</span>
                    </span>
                  </div>
                </div>

                {/* Right: Product Details */}
                <div className="flex-1 min-w-0">
                  {/* Product Name and Rating combined */}
                  <div className="mb-2 md:mb-3">
                    <h3 className="mb-1" style={{ fontSize: '15px', fontWeight: 'bold', color: '#0F1111', lineHeight: '1.3' }}>
                      <span className="md:hidden">{recommendedProduct.brand} {recommendedProduct.name}</span>
                      <span className="hidden md:inline">{recommendedProduct.brand} {recommendedProduct.name} - {recommendedProduct.size}</span>
                    </h3>
                    <div className="flex items-center gap-1 md:gap-1.5 flex-wrap">
                      <span style={{ fontSize: '13px', color: '#0F1111', fontWeight: 'bold' }}>{recommendedProduct.rating}</span>
                      <div className="flex items-center">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`size-3 md:size-3.5 ${
                              i < Math.floor(recommendedProduct.rating)
                                ? "fill-[#ffa41c] text-[#ffa41c]"
                                : "text-[#D5D9D9]"
                            }`}
                          />
                        ))}
                      </div>
                      <span style={{ fontSize: '11px', color: '#565959' }}>
                        ({recommendedProduct.reviewCount?.toLocaleString() || '0'})
                      </span>
                    </div>
                  </div>

                  {/* Match Reason with Icon */}
                  <div className="mb-2 md:mb-3 bg-[#F7F9FA] border-l-4 border-[#C45500] p-2 md:p-3 rounded">
                    <div className="flex items-start gap-1.5 md:gap-2">
                      <div className="bg-[#C45500] rounded-full p-0.5 md:p-1 flex-shrink-0">
                        <svg className="size-3 md:size-4 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <div className="flex-1">
                        <div style={{ fontSize: '12px', color: '#0F1111', fontWeight: 'bold', marginBottom: '4px' }}>
                          Why this match?
                        </div>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-2 md:gap-x-3 gap-y-0.5 md:gap-y-1">
                          <li className="flex gap-1" style={{ fontSize: '11px', color: '#0F1111', lineHeight: '1.4' }}>
                            <span className="text-[#C45500] mt-0.5 text-xs">✓</span>
                            <span>Same loaf style and brand family</span>
                          </li>
                          <li className="flex gap-1" style={{ fontSize: '11px', color: '#0F1111', lineHeight: '1.4' }}>
                            <span className="text-[#C45500] mt-0.5 text-xs">✓</span>
                            <span>Ingredients are very similar (93%)</span>
                          </li>
                          <li className="flex gap-1" style={{ fontSize: '11px', color: '#0F1111', lineHeight: '1.4' }}>
                            <span className="text-[#C45500] mt-0.5 text-xs">✓</span>
                            <span>Comparable texture and slice size</span>
                          </li>
                          <li className="flex gap-1" style={{ fontSize: '11px', color: '#0F1111', lineHeight: '1.4' }}>
                            <span className="text-[#C45500] mt-0.5 text-xs">✓</span>
                            <span>Chosen by shoppers in this situation most often</span>
                          </li>
                          <li className="flex gap-1" style={{ fontSize: '11px', color: '#0F1111', lineHeight: '1.4' }}>
                            <span className="text-[#C45500] mt-0.5 text-xs">✓</span>
                            <span>Price is in the same range as your original</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Price and Stock Row - Combined */}
                  <div className="mb-2 md:mb-3 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                    <div className="flex items-baseline gap-1">
                      <span style={{ fontSize: '14px', color: '#0F1111' }}>$</span>
                      <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#0F1111', letterSpacing: '-0.5px' }}>
                        {recommendedProduct.price.toFixed(2)}
                      </span>
                      <span className="inline-flex items-center gap-0.5 bg-[#F3F3F3] text-[#0F1111] px-1.5 py-0.5 rounded border border-[#D5D9D9] ml-1" style={{ fontSize: '10px', fontWeight: '600' }}>
                        <svg className="size-2.5 text-[#C45500]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        same price
                      </span>
                    </div>
                    <div className="inline-flex items-center gap-1" style={{ fontSize: '12px', fontWeight: 'bold', color: '#007600' }}>
                      In Stock — Ready to ship
                    </div>
                  </div>

                  {/* CTAs and Info Combined */}
                  <div className="flex flex-col sm:flex-row gap-1.5 md:gap-2 mb-2">
                    <Button
                      className="flex-1 sm:flex-none hover:bg-[#F7CA00] transition-all"
                      style={{
                        height: '32px',
                        backgroundColor: '#FFD814',
                        color: '#0F1111',
                        fontSize: '13px',
                        fontWeight: 'bold',
                        borderRadius: '8px',
                        border: 'none',
                        paddingLeft: '16px',
                        paddingRight: '16px',
                        minWidth: '120px'
                      }}
                      onClick={() => onAddToCart(recommendedProduct.id)}
                    >
                      Add to Cart
                    </Button>
                    
                    <Button
                      className="flex-1 sm:flex-none hover:bg-[#FA8900] transition-all"
                      style={{
                        height: '32px',
                        backgroundColor: '#FFA41C',
                        color: '#0F1111',
                        fontSize: '13px',
                        fontWeight: 'bold',
                        borderRadius: '8px',
                        border: 'none',
                        paddingLeft: '16px',
                        paddingRight: '16px',
                        minWidth: '120px'
                      }}
                    >
                      View Details
                    </Button>
                  </div>

                  {/* Compact Info Footer */}
                  <div className="flex items-start gap-1.5 bg-[#F7F7F7] p-1.5 md:p-2 rounded border border-[#D5D9D9]" style={{ fontSize: '10px', color: '#565959', lineHeight: '1.4' }}>
                    <svg className="size-3 flex-shrink-0 mt-0.5 text-[#565959]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                      <path d="M12 16V12M12 8H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    <span>
                      <span className="hidden sm:inline">You can swap this anytime. Similarity is based on ingredients, size, and shopper choices.</span>
                      <span className="sm:hidden">Can swap anytime. Based on ingredients & shopper choices.</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Frequently Bought Together */}
        {!product.isOOS && bundleProducts.length > 0 && (
          <div className="mb-6">
            <FrequentlyBoughtTogether
              mainProduct={{
                id: product.id,
                name: product.name,
                brand: product.brand,
                image: product.image,
                price: product.price,
                isMainProduct: true,
              }}
              bundleProducts={bundleProducts}
              onAddAllToCart={onAddBundleToCart}
            />
          </div>
        )}

        {/* Product Details */}
        <div className="mb-6 bg-white border border-[#D5D9D9] p-4 md:p-6 rounded-lg">
          <h2 className="mb-4" style={{ fontSize: '16px', fontWeight: 'bold', color: '#0F1111' }}>
            Product information
          </h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="mb-2" style={{ fontSize: '13px', fontWeight: 'bold', color: '#0F1111' }}>
                Ingredients
              </h3>
              <div style={{ fontSize: '13px', color: '#0F1111', lineHeight: '1.5' }}>{product.ingredients}</div>
            </div>

            <div>
              <h3 className="mb-3" style={{ fontSize: '13px', fontWeight: 'bold', color: '#0F1111' }}>
                Nutrition Facts
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3" style={{ fontSize: '13px' }}>
                <div className="bg-[#F7F8F8] p-3 rounded">
                  <div style={{ fontSize: '11px', color: '#565959', marginBottom: '4px' }}>Serving Size</div>
                  <div style={{ color: '#0F1111', fontWeight: '500' }}>{product.nutrition.servingSize}</div>
                </div>
                <div className="bg-[#F7F8F8] p-3 rounded">
                  <div style={{ fontSize: '11px', color: '#565959', marginBottom: '4px' }}>Calories</div>
                  <div style={{ color: '#0F1111', fontWeight: '500' }}>{product.nutrition.calories}</div>
                </div>
                <div className="bg-[#F7F8F8] p-3 rounded">
                  <div style={{ fontSize: '11px', color: '#565959', marginBottom: '4px' }}>Total Fat</div>
                  <div style={{ color: '#0F1111', fontWeight: '500' }}>{product.nutrition.fat}</div>
                </div>
                <div className="bg-[#F7F8F8] p-3 rounded">
                  <div style={{ fontSize: '11px', color: '#565959', marginBottom: '4px' }}>Protein</div>
                  <div style={{ color: '#0F1111', fontWeight: '500' }}>{product.nutrition.protein}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Similar Items Carousel */}
        <div className="mb-6 relative">
          <div className="flex items-center justify-between mb-3 md:mb-4 px-1">
            <h2 className="flex items-center gap-2" style={{ fontSize: '16px', fontWeight: 'bold', color: '#0F1111' }}>
              Similar items
              <InfoHoverCard label="About Similar Items">
                <InfoCardContent
                  title="What are Similar Items?"
                  body="Similar Items show variations of the same product — different flavors, sizes, brands, or package quantities. While this variety offers flexibility, research shows that too many options can create 'choice paralysis,' where customers feel overwhelmed and may abandon their purchase entirely."
                  highlight={product.isOOS 
                    ? "⚡ Smart Recommendations: When your selected product is out of stock, we place our AI-recommended 'Best Replacement' at the top of this section. This single, intelligent recommendation cuts through the noise and helps you quickly find the closest match without scanning through dozens of similar options." 
                    : "These variations let you customize your choice based on flavor preferences, quantity needs, or brand loyalty. You can browse through all options to find exactly what you're looking for."}
                  callout="Our system uses machine learning to understand which features matter most to shoppers when their first choice isn't available — prioritizing matches on ingredients, nutritional profile, size, and historical purchase patterns."
                  bullets={["Same product category (e.g., all bread)", "Flavor variations (whole wheat, multigrain, white)", "Size differences (16oz, 20oz, 24oz)", "Brand alternatives", "Package types (single loaf, twin pack)"]}
                  footer="Traditional e-commerce shows you everything. We intelligently surface the best match first when it matters most — saving users time and reducing decision fatigue and reducing cart abandonment."
                />
              </InfoHoverCard>
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  const container = document.getElementById('similar-scroll');
                  if (container) container.scrollLeft -= 300;
                }}
                className="bg-white border border-[#D5D9D9] rounded p-2 hover:bg-[#F7F7F7] transition-colors"
                aria-label="Scroll left"
              >
                <ChevronLeft className="size-4 text-[#0F1111]" />
              </button>
              <button
                onClick={() => {
                  const container = document.getElementById('similar-scroll');
                  if (container) container.scrollLeft += 300;
                }}
                className="bg-white border border-[#D5D9D9] rounded p-2 hover:bg-[#F7F7F7] transition-colors"
                aria-label="Scroll right"
              >
                <ChevronRight className="size-4 text-[#0F1111]" />
              </button>
            </div>
          </div>
          
          <div id="similar-scroll" className="flex gap-3 md:gap-4 overflow-x-auto pb-4 px-1 -mx-1 scroll-smooth hide-scrollbar">
            {similarProducts.map((item) => (
              <div
                key={item.id}
                className="flex-shrink-0 cursor-pointer hover:shadow-md transition-shadow border border-[#D5D9D9] rounded p-2 bg-white"
                style={{ width: '140px' }}
                onClick={() => onSimilarProductClick(item.id)}
              >
                {/* Image Frame */}
                <div className="mb-2 bg-white flex items-center justify-center" style={{ width: '124px', height: '124px' }}>
                  <ImageWithFallback
                    src={item.image}
                    alt={item.name}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
                
                {/* Product Name */}
                <div className="mb-1" style={{ fontSize: '12px', color: '#0F1111', lineHeight: '16px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {item.brand} {item.name}
                </div>
                
                {/* Price */}
                <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#0F1111' }}>
                  ${item.price.toFixed(2)}
                </div>
                
                {/* Ratings */}
                <div className="flex items-center gap-1 mt-1">
                  <div className="flex items-center">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`size-[10px] ${
                          i < Math.floor(item.rating)
                            ? "fill-[#ffa41c] text-[#ffa41c]"
                            : "text-[#D5D9D9]"
                        }`}
                      />
                    ))}
                  </div>
                  <span style={{ fontSize: '10px', color: '#007185' }}>
                    ({item.reviewCount})
                  </span>
                </div>
              </div>
            ))}
            
            {/* Additional Similar Items */}
            <div className="flex-shrink-0 cursor-pointer hover:shadow-md transition-shadow border border-[#D5D9D9] rounded p-2 bg-white" style={{ width: '140px' }}>
              <div className="mb-2 bg-white flex items-center justify-center" style={{ width: '124px', height: '124px' }}>
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1626423642268-24cc183cbacb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aG9sZSUyMGdyYWluJTIwYnJlYWR8ZW58MXx8fHwxNzY0MTc1MTAxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="Whole Grain Bread"
                  className="max-w-full max-h-full object-contain"
                />
              </div>
              <div className="mb-1" style={{ fontSize: '12px', color: '#0F1111', lineHeight: '16px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                ABC 100% Whole Grain Bread
              </div>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#0F1111' }}>$4.79</div>
              <div className="flex items-center gap-1 mt-1">
                <div className="flex items-center">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`size-[10px] ${i < 4 ? "fill-[#ffa41c] text-[#ffa41c]" : "text-[#D5D9D9]"}`} />
                  ))}
                </div>
                <span style={{ fontSize: '10px', color: '#007185' }}>(1,832)</span>
              </div>
            </div>

            <div className="flex-shrink-0 cursor-pointer hover:shadow-md transition-shadow border border-[#D5D9D9] rounded p-2 bg-white" style={{ width: '140px' }}>
              <div className="mb-2 bg-white flex items-center justify-center" style={{ width: '124px', height: '124px' }}>
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1624323210664-3659370c9346?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyeWUlMjBicmVhZCUyMGxvYWZ8ZW58MXx8fHwxNzY0MjY3Mjg2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="Rye Bread"
                  className="max-w-full max-h-full object-contain"
                />
              </div>
              <div className="mb-1" style={{ fontSize: '12px', color: '#0F1111', lineHeight: '16px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                ABC Artisan Rye Bread
              </div>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#0F1111' }}>$5.29</div>
              <div className="flex items-center gap-1 mt-1">
                <div className="flex items-center">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`size-[10px] ${i < 4 ? "fill-[#ffa41c] text-[#ffa41c]" : "text-[#D5D9D9]"}`} />
                  ))}
                </div>
                <span style={{ fontSize: '10px', color: '#007185' }}>(2,114)</span>
              </div>
            </div>

            <div className="flex-shrink-0 cursor-pointer hover:shadow-md transition-shadow border border-[#D5D9D9] rounded p-2 bg-white" style={{ width: '140px' }}>
              <div className="mb-2 bg-white flex items-center justify-center" style={{ width: '124px', height: '124px' }}>
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1597604391235-a7429b4b350c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb3VyZG91Z2glMjBicmVhZHxlbnwxfHx8fDE3NjQyMzc5MjF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="Sourdough Bread"
                  className="max-w-full max-h-full object-contain"
                />
              </div>
              <div className="mb-1" style={{ fontSize: '12px', color: '#0F1111', lineHeight: '16px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                ABC Classic Sourdough Bread
              </div>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#0F1111' }}>$5.49</div>
              <div className="flex items-center gap-1 mt-1">
                <div className="flex items-center">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`size-[10px] ${i < 5 ? "fill-[#ffa41c] text-[#ffa41c]" : "text-[#D5D9D9]"}`} />
                  ))}
                </div>
                <span style={{ fontSize: '10px', color: '#007185' }}>(3,567)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Frequently Bought Together Carousel */}
        <div className="mb-6 relative">
          <div className="flex items-center justify-between mb-3 md:mb-4 px-1">
            <h2 className="flex items-center gap-2" style={{ fontSize: '16px', fontWeight: 'bold', color: '#0F1111' }}>
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
            <div className="flex gap-2">
              <button
                onClick={() => {
                  const container = document.getElementById('frequent-scroll');
                  if (container) container.scrollLeft -= 300;
                }}
                className="bg-white border border-[#D5D9D9] rounded p-2 hover:bg-[#F7F7F7] transition-colors"
                aria-label="Scroll left"
              >
                <ChevronLeft className="size-4 text-[#0F1111]" />
              </button>
              <button
                onClick={() => {
                  const container = document.getElementById('frequent-scroll');
                  if (container) container.scrollLeft += 300;
                }}
                className="bg-white border border-[#D5D9D9] rounded p-2 hover:bg-[#F7F7F7] transition-colors"
                aria-label="Scroll right"
              >
                <ChevronRight className="size-4 text-[#0F1111]" />
              </button>
            </div>
          </div>
          
          <div id="frequent-scroll" className="flex gap-3 md:gap-4 overflow-x-auto pb-4 px-1 -mx-1 scroll-smooth hide-scrollbar">
            {/* Butter */}
            <div className="flex-shrink-0 cursor-pointer hover:shadow-md transition-shadow border border-[#D5D9D9] rounded p-2 bg-white" style={{ width: '140px' }}>
              <div className="mb-2 bg-white flex items-center justify-center" style={{ width: '124px', height: '124px' }}>
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1757857755423-3412736d1236?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXR0ZXIlMjBwYWNrYWdlJTIwcHJvZHVjdHxlbnwxfHx8fDE3NjQyNjcxMzR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="Unsalted Butter"
                  className="max-w-full max-h-full object-contain"
                />
              </div>
              <div className="mb-1" style={{ fontSize: '12px', color: '#0F1111', lineHeight: '16px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                ABC Organic Unsalted Butter
              </div>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#0F1111' }}>$5.99</div>
              <div className="flex items-center gap-1 mt-1">
                <div className="flex items-center">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`size-[10px] ${i < 4 ? "fill-[#ffa41c] text-[#ffa41c]" : "text-[#D5D9D9]"}`} />
                  ))}
                </div>
                <span style={{ fontSize: '10px', color: '#007185' }}>(2,847)</span>
              </div>
            </div>

            {/* Strawberry Jam */}
            <div className="flex-shrink-0 cursor-pointer hover:shadow-md transition-shadow border border-[#D5D9D9] rounded p-2 bg-white" style={{ width: '140px' }}>
              <div className="mb-2 bg-white flex items-center justify-center" style={{ width: '124px', height: '124px' }}>
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1741521899993-1cbb155691a3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHJhd2JlcnJ5JTIwamFtJTIwamFyfGVufDF8fHx8MTc2NDE0OTI2MHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="Strawberry Jam"
                  className="max-w-full max-h-full object-contain"
                />
              </div>
              <div className="mb-1" style={{ fontSize: '12px', color: '#0F1111', lineHeight: '16px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                ABC Strawberry Preserve Jam
              </div>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#0F1111' }}>$4.49</div>
              <div className="flex items-center gap-1 mt-1">
                <div className="flex items-center">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`size-[10px] ${i < 5 ? "fill-[#ffa41c] text-[#ffa41c]" : "text-[#D5D9D9]"}`} />
                  ))}
                </div>
                <span style={{ fontSize: '10px', color: '#007185' }}>(3,291)</span>
              </div>
            </div>

            {/* Peanut Butter */}
            <div className="flex-shrink-0 cursor-pointer hover:shadow-md transition-shadow border border-[#D5D9D9] rounded p-2 bg-white" style={{ width: '140px' }}>
              <div className="mb-2 bg-white flex items-center justify-center" style={{ width: '124px', height: '124px' }}>
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1691480208637-6ed63aac6694?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZWFudXQlMjBidXR0ZXIlMjBqYXJ8ZW58MXx8fHwxNzY0MjI2MTcxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="Peanut Butter"
                  className="max-w-full max-h-full object-contain"
                />
              </div>
              <div className="mb-1" style={{ fontSize: '12px', color: '#0F1111', lineHeight: '16px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                ABC Creamy Peanut Butter Spread
              </div>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#0F1111' }}>$6.29</div>
              <div className="flex items-center gap-1 mt-1">
                <div className="flex items-center">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`size-[10px] ${i < 5 ? "fill-[#ffa41c] text-[#ffa41c]" : "text-[#D5D9D9]"}`} />
                  ))}
                </div>
                <span style={{ fontSize: '10px', color: '#007185' }}>(4,156)</span>
              </div>
            </div>

            {/* Oats */}
            <div className="flex-shrink-0 cursor-pointer hover:shadow-md transition-shadow border border-[#D5D9D9] rounded p-2 bg-white" style={{ width: '140px' }}>
              <div className="mb-2 bg-white flex items-center justify-center" style={{ width: '124px', height: '124px' }}>
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1640768029804-49525db1e827?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvYXRzJTIwcGFja2FnZSUyMGNlcmVhbHxlbnwxfHx8fDE3NjQyNjcxMzV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="Steel Cut Oats"
                  className="max-w-full max-h-full object-contain"
                />
              </div>
              <div className="mb-1" style={{ fontSize: '12px', color: '#0F1111', lineHeight: '16px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                ABC Organic Steel Cut Oats
              </div>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#0F1111' }}>$3.99</div>
              <div className="flex items-center gap-1 mt-1">
                <div className="flex items-center">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`size-[10px] ${i < 4 ? "fill-[#ffa41c] text-[#ffa41c]" : "text-[#D5D9D9]"}`} />
                  ))}
                </div>
                <span style={{ fontSize: '10px', color: '#007185' }}>(1,923)</span>
              </div>
            </div>

            {/* Honey */}
            <div className="flex-shrink-0 cursor-pointer hover:shadow-md transition-shadow border border-[#D5D9D9] rounded p-2 bg-white" style={{ width: '140px' }}>
              <div className="mb-2 bg-white flex items-center justify-center" style={{ width: '124px', height: '124px' }}>
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1587049352851-8d4e89133924?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob25leSUyMGphcnxlbnwxfHx8fDE3NjQxNzY4MjJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="Organic Honey"
                  className="max-w-full max-h-full object-contain"
                />
              </div>
              <div className="mb-1" style={{ fontSize: '12px', color: '#0F1111', lineHeight: '16px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                ABC Pure Organic Honey
              </div>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#0F1111' }}>$7.99</div>
              <div className="flex items-center gap-1 mt-1">
                <div className="flex items-center">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`size-[10px] ${i < 5 ? "fill-[#ffa41c] text-[#ffa41c]" : "text-[#D5D9D9]"}`} />
                  ))}
                </div>
                <span style={{ fontSize: '10px', color: '#007185' }}>(2,567)</span>
              </div>
            </div>

            {/* Cream Cheese */}
            <div className="flex-shrink-0 cursor-pointer hover:shadow-md transition-shadow border border-[#D5D9D9] rounded p-2 bg-white" style={{ width: '140px' }}>
              <div className="mb-2 bg-white flex items-center justify-center" style={{ width: '124px', height: '124px' }}>
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1573810655264-8d1e50f1592d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjcmVhbSUyMGNoZWVzZXxlbnwxfHx8fDE3NjQyNDUxNDV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="Cream Cheese"
                  className="max-w-full max-h-full object-contain"
                />
              </div>
              <div className="mb-1" style={{ fontSize: '12px', color: '#0F1111', lineHeight: '16px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                ABC Whipped Cream Cheese
              </div>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#0F1111' }}>$4.99</div>
              <div className="flex items-center gap-1 mt-1">
                <div className="flex items-center">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`size-[10px] ${i < 4 ? "fill-[#ffa41c] text-[#ffa41c]" : "text-[#D5D9D9]"}`} />
                  ))}
                </div>
                <span style={{ fontSize: '10px', color: '#007185' }}>(3,145)</span>
              </div>
            </div>

            {/* Almond Butter */}
            <div className="flex-shrink-0 cursor-pointer hover:shadow-md transition-shadow border border-[#D5D9D9] rounded p-2 bg-white" style={{ width: '140px' }}>
              <div className="mb-2 bg-white flex items-center justify-center" style={{ width: '124px', height: '124px' }}>
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1615110250484-e8c3b151b957?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbG1vbmQlMjBidXR0ZXJ8ZW58MXx8fHwxNzY0MjY3NzE5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="Almond Butter"
                  className="max-w-full max-h-full object-contain"
                />
              </div>
              <div className="mb-1" style={{ fontSize: '12px', color: '#0F1111', lineHeight: '16px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                ABC Roasted Almond Butter
              </div>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#0F1111' }}>$8.49</div>
              <div className="flex items-center gap-1 mt-1">
                <div className="flex items-center">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`size-[10px] ${i < 4 ? "fill-[#ffa41c] text-[#ffa41c]" : "text-[#D5D9D9]"}`} />
                  ))}
                </div>
                <span style={{ fontSize: '10px', color: '#007185' }}>(1,789)</span>
              </div>
            </div>

            {/* Avocado Spread */}
            <div className="flex-shrink-0 cursor-pointer hover:shadow-md transition-shadow border border-[#D5D9D9] rounded p-2 bg-white" style={{ width: '140px' }}>
              <div className="mb-2 bg-white flex items-center justify-center" style={{ width: '124px', height: '124px' }}>
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1607678819770-ddf5302ea7a2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhdm9jYWRvJTIwc3ByZWFkfGVufDF8fHx8MTc2NDI2NzcyMHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="Avocado Spread"
                  className="max-w-full max-h-full object-contain"
                />
              </div>
              <div className="mb-1" style={{ fontSize: '12px', color: '#0F1111', lineHeight: '16px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                ABC Smashed Avocado Spread
              </div>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#0F1111' }}>$5.79</div>
              <div className="flex items-center gap-1 mt-1">
                <div className="flex items-center">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`size-[10px] ${i < 4 ? "fill-[#ffa41c] text-[#ffa41c]" : "text-[#D5D9D9]"}`} />
                  ))}
                </div>
                <span style={{ fontSize: '10px', color: '#007185' }}>(2,234)</span>
              </div>
            </div>

            {/* Granola */}
            <div className="flex-shrink-0 cursor-pointer hover:shadow-md transition-shadow border border-[#D5D9D9] rounded p-2 bg-white" style={{ width: '140px' }}>
              <div className="mb-2 bg-white flex items-center justify-center" style={{ width: '124px', height: '124px' }}>
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1618258022300-ac769be6e840?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncmFub2xhJTIwY2VyZWFsfGVufDF8fHx8MTc2NDI0Njk5OXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="Honey Granola"
                  className="max-w-full max-h-full object-contain"
                />
              </div>
              <div className="mb-1" style={{ fontSize: '12px', color: '#0F1111', lineHeight: '16px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                ABC Honey Almond Granola
              </div>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#0F1111' }}>$6.99</div>
              <div className="flex items-center gap-1 mt-1">
                <div className="flex items-center">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`size-[10px] ${i < 5 ? "fill-[#ffa41c] text-[#ffa41c]" : "text-[#D5D9D9]"}`} />
                  ))}
                </div>
                <span style={{ fontSize: '10px', color: '#007185' }}>(2,891)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}