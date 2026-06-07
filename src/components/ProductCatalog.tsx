import { 
  Search, SlidersHorizontal, ShoppingCart, Tag, Flame, Clock, 
  ChevronLeft, ChevronRight, Star, ShieldCheck, Heart, Info, 
  Truck, ArrowRight, UserCheck, MessageSquare, ThumbsUp, Sparkles, Check, ShoppingBag
} from "lucide-react";
import React, { useState, useMemo, useEffect } from "react";
import { safeStorage } from "../utils/safeStorage";
import { Product } from "../types";

interface ProductCatalogProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
  onLogHistory: (productId: string, actionType: 'view' | 'cart' | 'purchase') => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onChangeRole?: (role: 'customer' | 'vendor' | 'admin') => void;
}

// IN-APP INITIAL PRODUCT REVIEWS LIST
interface Review {
  id: string;
  productId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

const DEFAULT_REVIEWS: Review[] = [
  {
    id: "rev-1",
    productId: "prod-1",
    userName: "Musieba A.",
    rating: 5,
    comment: "The walnut finish looks incredible under my TV! Exceptional spatial acoustic waves and very deep bass.",
    date: "2026-05-28"
  },
  {
    id: "rev-2",
    productId: "prod-1",
    userName: "Wambua M.",
    rating: 4,
    comment: "Excellent design, solid premium weight. Fits perfectly on my floating shelf.",
    date: "2026-05-30"
  },
  {
    id: "rev-3",
    productId: "prod-2",
    userName: "Jane Kamau",
    rating: 5,
    comment: "Stunning light flows! My home workspace vibe completely transformed. Highly recommended.",
    date: "2026-05-29"
  },
  {
    id: "rev-4",
    productId: "prod-3",
    userName: "Kevin T.",
    rating: 5,
    comment: "Hands down the best keyboard for coders. The split layout solved my joint fatigue completely.",
    date: "2026-06-01"
  },
  {
    id: "rev-5",
    productId: "prod-4",
    userName: "Asha S.",
    rating: 4,
    comment: "Perfect XL desk coverage. Low friction mouse tracking works exactly as specified.",
    date: "2026-05-27"
  }
];

// Carousel promotion banners
const PROMO_CAROUSEL_SLIDES = [
  {
    id: 1,
    badge: "Mombasa & Nairobi Mega Event",
    title: "Mali Safi Clearance Sale - Up to 40% Off!",
    description: "Equip your workspace and living coordinates with patented spatial audio system soundbars and bespoke mechanical hardware.",
    gradient: "from-neutral-900 via-orange-950 to-orange-900",
    illustration: "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&auto=format&fit=crop&q=80",
    actionText: "Shop Living Event"
  },
  {
    id: 2,
    badge: "Kenyan Workspace Architecture",
    title: "Architect Grade Ergonomics System",
    description: "Premium materials engineered for focus. Split aircraft layouts with gold swappable keyboard switches and textured mouse mats.",
    gradient: "from-emerald-950 via-neutral-950 to-neutral-900",
    illustration: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80",
    actionText: "Discover Workspace Gear"
  },
  {
    id: 3,
    badge: "Wantalian Comfort Guarantee",
    title: "Vivid Ambience lighting Panels",
    description: "Touch intelligent modular LED grids which flow colors automatically according to ambient acoustic vibrations. Next-day dispatch.",
    gradient: "from-purple-950 via-blue-950 to-neutral-900",
    illustration: "https://images.unsplash.com/photo-1507646227500-4d389b0012be?w=800&auto=format&fit=crop&q=80",
    actionText: "Browse Atmosphere Guides"
  }
];

export default function ProductCatalog({
  products,
  onAddToCart,
  onLogHistory,
  searchTerm,
  onSearchChange,
  onChangeRole
}: ProductCatalogProps) {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [activeSlide, setActiveSlide] = useState(0);

  // States for Price Range slider
  const [maxPriceFilter, setMaxPriceFilter] = useState<number>(1000);
  const [priceSliderTouched, setPriceSliderTouched] = useState<boolean>(false);

  // Determine actual min/max bounds based on product prices
  const { minBound, maxBound } = useMemo(() => {
    if (products.length === 0) return { minBound: 0, maxBound: 1000 };
    const prices = products.map((p) => p.price);
    return {
      minBound: Math.floor(Math.min(...prices)),
      maxBound: Math.ceil(Math.max(...prices))
    };
  }, [products]);

  // Adjust maxPriceFilter when products load for the first time
  useEffect(() => {
    if (!priceSliderTouched && maxBound > 0) {
      setMaxPriceFilter(maxBound);
    }
  }, [maxBound, priceSliderTouched]);
  
  // Flash Sales Countdown timer (hours: minutes: seconds)
  const [countdownTime, setCountdownTime] = useState({
    hours: 3,
    minutes: 42,
    seconds: 15
  });

  // Product reviews management state
  const [reviews, setReviews] = useState<Review[]>(() => {
    try {
      const saved = safeStorage.getItem("wantalian_reviews_db");
      return saved ? JSON.parse(saved) : DEFAULT_REVIEWS;
    } catch {
      return DEFAULT_REVIEWS;
    }
  });

  // New review submission state
  const [newReviewAuthor, setNewReviewAuthor] = useState("");
  const [newReviewComment, setNewReviewComment] = useState("");
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [reviewSuccessMsg, setReviewSuccessMsg] = useState("");

  // Product Selection for Quick View detailed Product Modal
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [detailModalTab, setDetailModalTab] = useState<'specs' | 'shipping' | 'reviews'>('specs');

  // Load unique categories
  const categories = useMemo(() => {
    const list = new Set(products.map((p) => p.category));
    return ["All", ...Array.from(list)];
  }, [products]);

  // Rotates promo slide automatically
  useEffect(() => {
    const slideTimer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % PROMO_CAROUSEL_SLIDES.length);
    }, 5000);
    return () => clearInterval(slideTimer);
  }, []);

  // Sync Flash sale ticks
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdownTime((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else {
          return { hours: 4, minutes: 0, seconds: 0 }; // reset to 4 hrs
        }
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Filter products based on search term, category selection & price range
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory = selectedCategory === "All" || p.category === selectedCategory;
      const matchesSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPrice = p.price <= maxPriceFilter;
      return matchesCategory && matchesSearch && matchesPrice;
    });
  }, [products, selectedCategory, searchTerm, maxPriceFilter]);

  // Dynamically compute average ratings based on reviews database
  const getProductRatingDetails = (productId: string, originalRating: number) => {
    const itemReviews = reviews.filter((r) => r.productId === productId);
    if (itemReviews.length === 0) {
      return {
        avgRating: originalRating || 4.5,
        totalReviews: itemReviews.length + 12 // add standard starting offset
      };
    }
    const sum = itemReviews.reduce((acc, r) => acc + r.rating, 0);
    const avg = sum / itemReviews.length;
    return {
      avgRating: parseFloat(avg.toFixed(1)),
      totalReviews: itemReviews.length
    };
  };

  const handleAddToCartWithLogging = (product: Product) => {
    onAddToCart(product);
    onLogHistory(product.id, "cart");
  };

  const handleOpenQuickView = (product: Product) => {
    setSelectedProduct(product);
    onLogHistory(product.id, "view");
    setDetailModalTab('specs');
    // Clear submission form states
    setNewReviewAuthor("");
    setNewReviewComment("");
    setNewReviewRating(5);
    setReviewSuccessMsg("");
  };

  const handlePostReview = (e: React.FormEvent, productId: string) => {
    e.preventDefault();
    if (!newReviewAuthor.trim() || !newReviewComment.trim()) return;

    const added: Review = {
      id: `rev-${Date.now()}`,
      productId,
      userName: newReviewAuthor.trim(),
      rating: newReviewRating,
      comment: newReviewComment.trim(),
      date: new Date().toISOString().split('T')[0]
    };

    const nextReviews = [added, ...reviews];
    setReviews(nextReviews);
    safeStorage.setItem("wantalian_reviews_db", JSON.stringify(nextReviews));

    // Reset Form
    setNewReviewAuthor("");
    setNewReviewComment("");
    setNewReviewRating(5);
    setReviewSuccessMsg("Your customer review was added successfully! Rating updated.");
    setTimeout(() => setReviewSuccessMsg(""), 4500);
  };

  return (
    <div className="space-y-10" id="marketplace-homepage">
      
      {/* SECTION 1: MASTER LAYOUT GRID (LEFT SIDEBAR + CAROUSEL + RIGHT MARKETING AD) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* LEFT SYBAR NAVIGATION */}
        <div className="hidden lg:flex flex-col bg-white border border-gray-250 rounded-2xl p-4 shadow-xs space-y-1 divide-y divide-gray-100 h-full justify-between">
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-orange-500 mb-3 px-2 flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-orange-500" />
              <span>SHOP DEPARTMENTS</span>
            </h3>
            <nav className="space-y-1 pb-4">
              <button
                onClick={() => setSelectedCategory("All")}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${
                  selectedCategory === "All"
                    ? "bg-orange-50 text-orange-600 font-black border-l-4 border-l-orange-500"
                    : "text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900"
                }`}
              >
                <span className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-orange-500 shrink-0" />
                  <span>All Collections</span>
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
              </button>

              {categories.filter(c => c !== "All").map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${
                    selectedCategory === cat
                      ? "bg-orange-50 text-orange-600 font-black border-l-4 border-l-orange-500"
                      : "text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900"
                  }`}
                >
                  <span className="flex items-center gap-2 max-w-[130px] truncate">
                    <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{cat} Room Guides</span>
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                </button>
              ))}
            </nav>
          </div>

          <div className="pt-4 border-t border-gray-100 space-y-2">
            <span className="text-[10px] uppercase font-mono font-bold text-gray-400 block px-2">YOUR VALUE ASSURANCE</span>
            <div className="flex items-start gap-2 p-2 bg-emerald-50/40 border border-emerald-100/50 rounded-xl">
              <ShieldCheck className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
              <div className="text-[11px] text-emerald-800 leading-snug">
                <p className="font-bold">Mali Safi Seal</p>
                <p className="text-gray-500 text-[10px]">100% original systems direct from verified artisans.</p>
              </div>
            </div>
          </div>
        </div>

        {/* CENTER INTERACTIVE PROMOTIONS CAROUSEL */}
        <div className="lg:col-span-2 relative overflow-hidden bg-neutral-900 rounded-3xl group shadow-lg min-h-[300px] flex flex-col justify-end p-6 sm:p-10 text-white">
          
          {PROMO_CAROUSEL_SLIDES.map((slide, sIdx) => {
            const isActive = sIdx === activeSlide;
            return (
              <div
                key={slide.id}
                className={`absolute inset-0 bg-gradient-to-t ${slide.gradient} leading-normal flex flex-col md:flex-row items-center justify-between p-6 sm:p-10 gap-6 transition-all duration-1000 transform ${
                  isActive ? "opacity-100 scale-100 translate-x-0 z-10" : "opacity-0 scale-95 translate-x-full pointer-events-none z-0"
                }`}
              >
                <div className="space-y-4 max-w-sm text-left">
                  <span className="text-[10px] font-mono tracking-widest bg-orange-500 text-white px-2.5 py-1 rounded-sm font-bold uppercase">
                    {slide.badge}
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-none text-white leading-tight">
                    {slide.title}
                  </h2>
                  <p className="text-xs text-neutral-300 leading-relaxed font-medium">
                    {slide.description}
                  </p>
                  <button
                    onClick={() => setSelectedCategory("All")}
                    className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-bold text-xs transition-transform flex items-center gap-1.5 shadow-md cursor-pointer"
                  >
                    <span>{slide.actionText}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="hidden sm:block w-36 h-36 md:w-44 md:h-44 rounded-2xl overflow-hidden border border-white/10 shadow-xl bg-neutral-800 shrink-0">
                  <img
                    src={slide.illustration}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    alt={slide.title}
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>
            );
          })}

          {/* Navigation Arrows */}
          <button
            onClick={() => setActiveSlide((prev) => (prev - 1 + PROMO_CAROUSEL_SLIDES.length) % PROMO_CAROUSEL_SLIDES.length)}
            className="absolute left-3 top-1/2 -track-y-1/2 z-20 p-2 text-white/70 hover:text-white bg-black/30 hover:bg-black/50 rounded-full transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => setActiveSlide((prev) => (prev + 1) % PROMO_CAROUSEL_SLIDES.length)}
            className="absolute right-3 top-1/2 -track-y-1/2 z-20 p-2 text-white/70 hover:text-white bg-black/30 hover:bg-black/50 rounded-full transition-colors cursor-pointer"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Pagination Indicators */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
            {PROMO_CAROUSEL_SLIDES.map((_, dotIdx) => (
              <button
                key={dotIdx}
                onClick={() => setActiveSlide(dotIdx)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${dotIdx === activeSlide ? "bg-orange-500 w-6" : "bg-white/40"}`}
              />
            ))}
          </div>
        </div>

        {/* RIGHT PROMO CARD AND ASSURANCE */}
        <div className="flex flex-col gap-4">
          <div className="bg-gradient-to-tr from-orange-500 to-amber-600 rounded-3xl p-5 text-white flex flex-col justify-between flex-1 relative overflow-hidden shadow-md">
            <div className="space-y-1.5 relative z-10 text-left">
              <span className="text-[9px] font-mono font-bold bg-white/20 px-2 py-0.5 rounded-full">SECURE M-PESA PAYBILL</span>
              <h3 className="text-sm font-black tracking-tight text-white leading-tight uppercase">PAY SECURELY WITH PAYBILL</h3>
              <div className="space-y-1 pt-1.5">
                <p className="text-sm text-orange-100 leading-none">Business No (Paybill): <strong className="text-base text-white font-mono tracking-wider bg-white/10 px-1.5 py-0.5 rounded font-black">247 247</strong></p>
                <p className="text-sm text-orange-100 leading-none">Account Number: <strong className="text-base text-white font-mono tracking-wider bg-white/10 px-1.5 py-0.5 rounded font-black">628766</strong></p>
              </div>
              <p className="text-[10px] text-orange-500 bg-white px-2 py-1.5 rounded-xl font-bold mt-2 text-center shadow-md animate-pulse">
                Verify and record instant setup delivery!
              </p>
            </div>
            
            <div className="pt-3 border-t border-white/20 relative z-10 flex items-center justify-between text-xs font-bold text-white">
              <span>View Guide</span>
              <Info className="w-4 h-4 text-orange-200" />
            </div>

            {/* Background elements */}
            <div className="absolute -bottom-10 -right-10 w-28 h-28 bg-white/10 rounded-full blur-xl" />
          </div>

          <div className="bg-white border border-gray-250 rounded-3xl p-5 shadow-xs flex items-center gap-3.5">
            <div className="p-3 bg-orange-50 text-orange-500 rounded-2xl shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div className="text-left space-y-0.5">
              <h4 className="text-xs font-extrabold text-neutral-900 uppercase tracking-wide">Instant Deliveries</h4>
              <p className="text-[11px] text-gray-500 leading-snug">Order today and receive priority transit directly into your estate by tomorrow morning.</p>
            </div>
          </div>
        </div>

      </div>

      {/* SECTION 2: FLASH SALES TICK COUNTER ROW */}
      <div className="p-5 sm:px-6 bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 text-white rounded-3xl shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 bg-white/20 rounded-2xl">
            <Flame className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <h3 className="text-base font-black uppercase tracking-wider flex items-center gap-1.5 leading-none">
              <span>Flash Sales Deals</span>
              <span className="text-[10px] bg-white text-orange-600 px-1.5 py-0.2 rounded font-black font-mono animate-bounce">MEGA LIMITS</span>
            </h3>
            <p className="text-xs text-orange-50 leading-tight">Lowest price tags guaranteed across Kenya. Limited units pending!</p>
          </div>
        </div>

        {/* TIME STICK TICKER */}
        <div className="flex items-center gap-2.5 bg-neutral-950/20 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20 self-start md:self-auto">
          <Clock className="w-4 h-4 text-orange-100" />
          <span className="text-[10px] font-mono font-bold tracking-widest text-orange-100 uppercase">Ends In:</span>
          <div className="flex items-center gap-1.5 text-xs font-mono font-black text-white p-0.5">
            <span className="bg-neutral-950 text-orange-400 font-extrabold px-2 py-1 rounded min-w-[28px] text-center">
              {String(countdownTime.hours).padStart(2, "0")}
            </span>
            <span>:</span>
            <span className="bg-neutral-950 text-orange-400 font-extrabold px-2 py-1 rounded min-w-[28px] text-center">
              {String(countdownTime.minutes).padStart(2, "0")}
            </span>
            <span>:</span>
            <span className="bg-neutral-950 text-orange-400 font-extrabold px-2 py-1 rounded min-w-[28px] text-center animate-pulse">
              {String(countdownTime.seconds).padStart(2, "0")}
            </span>
          </div>
        </div>
      </div>

      {/* SECTION 3: CATALOG FILTER CONTROLS */}
      <div className="p-5 bg-white border border-gray-200 rounded-3xl shadow-xs space-y-4 text-left">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-black tracking-tight text-neutral-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-orange-500" />
              <span>Explore Direct Marketplace Catalog</span>
            </h2>
            <p className="text-xs text-gray-500">
              Filtered currently by: <strong className="text-orange-500">{selectedCategory}</strong> • Price up to <strong className="text-orange-500">KSh {maxPriceFilter.toLocaleString()}</strong> • Found <strong className="text-emerald-600">{filteredProducts.length}</strong> modules
            </p>
          </div>

          {/* Quick instructions for user */}
          <div className="text-[11px] bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded-xl border border-emerald-100/50 flex items-center gap-1.5 font-medium max-w-sm self-start md:self-auto">
            <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Click any product card to view specifications & post customer reviews!</span>
          </div>
        </div>

        {/* 2-column Layout for Categories and Price Filter Slider */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2 items-center">
          {/* Categories select Column */}
          <div className="md:col-span-2 space-y-2">
            <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest">
              <SlidersHorizontal className="w-3.5 h-3.5 text-orange-500" />
              <span>Filter Category:</span>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-thin">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-2 text-xs font-extrabold rounded-xl cursor-pointer transition-all shrink-0 ${
                    selectedCategory === cat
                      ? "bg-orange-500 text-white shadow-md font-black"
                      : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                  }`}
                >
                  {cat === "All" ? "⭐ All Masterpieces" : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Slider Column */}
          <div className="bg-neutral-50 px-4 py-3 rounded-2xl border border-gray-150 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-neutral-800">
              <span className="flex items-center gap-1 text-[10px] uppercase font-mono tracking-wider text-gray-500">
                <Tag className="w-3.5 h-3.5 text-emerald-600" />
                Price limit:
              </span>
              <span className="bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full font-mono text-[11px] font-black">
                Max: KSh {maxPriceFilter.toLocaleString()}
              </span>
            </div>
            <div className="relative">
              <input
                type="range"
                min={minBound}
                max={maxBound || 1000}
                step={Math.ceil((maxBound - minBound) / 40) || 1}
                value={maxPriceFilter}
                onChange={(e) => {
                  setMaxPriceFilter(Number(e.target.value));
                  setPriceSliderTouched(true);
                }}
                className="w-full accent-orange-500 h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-[9px] font-mono font-bold text-gray-400 pt-1">
                <span>Min: KSh {minBound.toLocaleString()}</span>
                <span>Active: KSh {maxPriceFilter.toLocaleString()}</span>
                <span>Max: KSh {maxBound.toLocaleString()}</span>
              </div>
            </div>

            {/* Manual Price Keyboard Entry Field */}
            <div className="flex items-center gap-2 pt-2 border-t border-gray-200/60 justify-between">
              <label htmlFor="manualPriceEntry" className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-tight">
                Enter price manually:
              </label>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-mono font-black text-gray-400">KSh</span>
                <input
                  id="manualPriceEntry"
                  type="number"
                  min="0"
                  placeholder="e.g. 50000"
                  value={maxPriceFilter || ""}
                  onChange={(e) => {
                    const val = e.target.value === "" ? 0 : Number(e.target.value);
                    if (!isNaN(val)) {
                      setMaxPriceFilter(val);
                      setPriceSliderTouched(true);
                    }
                  }}
                  className="w-24 px-2.5 py-1 text-xs font-black font-mono text-neutral-800 border border-gray-200 rounded-lg focus:outline-hidden focus:border-orange-500 focus:bg-white bg-white/70 text-right shadow-3xs"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 4: PRODUCT TILES GRID */}
      {products.length === 0 ? (
        <div className="text-center py-20 bg-linear-to-b from-orange-50/10 to-neutral-50/20 border border-dashed border-orange-200/80 rounded-3xl p-8 max-w-2xl mx-auto space-y-6">
          <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto shadow-xs">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-black text-neutral-900 tracking-tight">Active Catalog is Empty!</h3>
            <p className="text-xs text-neutral-600 max-w-md mx-auto leading-relaxed">
              We have cleared the preloaded demo items. Be the first to establish active listings on Wantalian Hub! Anyone is welcome to list their items for sale.
            </p>
          </div>
          
          <div className="bg-white/80 p-4 rounded-2xl border border-gray-155 max-w-md mx-auto text-left flex items-start gap-3 shadow-3xs">
            <Sparkles className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5 animate-pulse" />
            <div className="text-[11px] text-neutral-600 leading-normal space-y-1">
              <span className="font-extrabold text-neutral-900 uppercase tracking-wide block">How to upload:</span>
              <p>1. Open your account dropdown in the header and switch to <strong className="text-orange-600">Vendor Portal</strong>.</p>
              <p>2. Fill in the product form, title, stock, and unit price in KSh.</p>
              <p>3. Upload from your device gallery OR select from our high-resolution curated stock image galleries!</p>
            </div>
          </div>

          {onChangeRole && (
            <button
              onClick={() => onChangeRole("vendor")}
              className="px-6 py-2.5 bg-neutral-950 hover:bg-neutral-850 text-white font-extrabold text-xs tracking-wider rounded-xl transition-all shadow-md active:scale-95 cursor-pointer uppercase flex items-center gap-2 mx-auto"
            >
              <Sparkles className="w-4 h-4 text-orange-400" />
              <span>Go to Vendor Portal to Upload Items</span>
            </button>
          )}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-16 bg-white border border-gray-200 rounded-3xl animate-fade-in">
          <Tag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-base font-bold text-gray-900">No products found matching filters</p>
          <p className="text-xs text-gray-400 mt-1">Try changing search descriptors or category tags!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((p) => {
            const isOutOfStock = p.stock === 0;
            const originalPrice = p.originalPrice && p.originalPrice > p.price ? p.originalPrice : p.price / 0.75;
            const discountPct = Math.round(((originalPrice - p.price) / originalPrice) * 100);

            // Extract live compiled ratings
            const { avgRating, totalReviews } = getProductRatingDetails(p.id, p.rating);

            return (
              <div
                key={p.id}
                onClick={() => handleOpenQuickView(p)}
                className="group relative bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xs hover:shadow-md hover:border-orange-200 transition-all cursor-pointer flex flex-col justify-between text-left"
              >
                {/* IMAGE FRAME */}
                <div className="relative aspect-square w-full overflow-hidden bg-neutral-50 border-b border-gray-100">
                  <img
                    src={p.image}
                    alt={p.name}
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  
                  {/* CATEGORY & DISCOUNT BADGES */}
                  <span className="absolute top-2.5 left-2.5 px-2 py-0.5 text-[8px] font-mono font-black tracking-wider uppercase bg-neutral-900/90 backdrop-blur-md text-white rounded-md shadow-xs">
                    {p.category}
                  </span>

                  {discountPct > 0 && (
                    <span className="absolute top-2.5 right-2.5 px-2 py-0.5 text-[10px] font-sans font-black text-white bg-orange-500 rounded-md shadow-sm">
                      -{discountPct}%
                    </span>
                  )}

                  {/* BOTTOM BRAND EMBLEM ("Wantalian Express" Equivalent to Jumia Express) */}
                  {(p.isExpress || p.stock >= 10) && (
                    <span className="absolute bottom-2.5 left-2.5 px-2 py-0.5 text-[8.5px] font-sans font-black tracking-wider uppercase bg-emerald-600 text-white rounded-md shadow-xs flex items-center gap-0.5 animate-pulse">
                      ⚡ Wantalian Express
                    </span>
                  )}
                </div>

                {/* CONTENT AREA */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3.5">
                  <div className="space-y-1">
                    {/* Brand Name Indicator */}
                    <p className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest leading-none">
                      {p.brand || "W-OFFICIAL"}
                    </p>
                    <h3 className="text-xs font-black text-neutral-850 tracking-tight leading-snug group-hover:text-orange-500 transition-colors uppercase line-clamp-1">
                      {p.name}
                    </h3>

                    {/* STARS RATINGS RENDER */}
                    <div className="flex items-center gap-1 pt-0.5">
                      <div className="flex items-center text-amber-500">
                        {Array.from({ length: 5 }).map((_, rStarIdx) => (
                           <Star
                             key={rStarIdx}
                             className={`w-3 h-3 ${rStarIdx < Math.round(avgRating) ? "fill-amber-500" : "text-gray-200"}`}
                           />
                        ))}
                      </div>
                      <span className="text-[10px] font-bold text-neutral-700">({totalReviews})</span>
                    </div>

                    <p className="text-[11px] text-gray-500 leading-normal line-clamp-2 pt-1 font-medium">
                      {p.description}
                    </p>
                  </div>

                  {/* PRICE & FOOTER MODULE */}
                  <div className="space-y-2 pt-2 border-t border-gray-150">
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm font-black text-neutral-900 font-mono">
                        KSh {p.price.toLocaleString()}
                      </span>
                      {discountPct > 0 && (
                        <span className="text-[10px] text-gray-300 line-through font-mono font-bold">
                          KSh {originalPrice.toLocaleString()}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      {/* Stock level tag */}
                      {p.stock === 0 ? (
                        <span className="text-[10px] text-red-500 font-black tracking-wider uppercase">Sold out</span>
                      ) : p.stock <= 5 ? (
                        <span className="text-[9px] bg-red-50 text-red-600 font-black tracking-wider uppercase px-1.5 py-0.2 rounded-sm anim-pulse">Only {p.stock} units!</span>
                      ) : (
                        <span className="text-[9.5px] text-emerald-600 font-bold font-mono">In Stock: {p.stock}</span>
                      )}

                      {/* ADD BUTTON */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!isOutOfStock) {
                            handleAddToCartWithLogging(p);
                          }
                        }}
                        disabled={isOutOfStock}
                        className={`px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors cursor-pointer text-xs font-bold ${
                          isOutOfStock
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-orange-500 hover:bg-orange-600 text-white shadow-xs"
                        }`}
                        title="Add direct to Shopping Bag"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        <span>Add</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* SECTION 5: DETAILED INTERACTIVE PRODUCT DRAWER / MODAL */}
      {selectedProduct && (() => {
        const { avgRating, totalReviews } = getProductRatingDetails(selectedProduct.id, selectedProduct.rating);
        const specReviews = reviews.filter(r => r.productId === selectedProduct.id);
        const isOutOfStock = selectedProduct.stock === 0;

        return (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl overflow-hidden max-h-[90vh] flex flex-col md:flex-row text-left animate-scale-up">
              
              {/* IMAGE FRAME (LEFT) */}
              <div className="w-full md:w-1/2 bg-neutral-50 p-6 flex flex-col justify-between relative border-r">
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="absolute top-4 left-4 z-10 p-2 bg-white/80 hover:bg-white text-neutral-800 rounded-full shadow-md md:hidden cursor-pointer"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <div className="aspect-square w-full rounded-2xl overflow-hidden border bg-white flex items-center justify-center">
                  <img
                    src={selectedProduct.image}
                    alt={selectedProduct.name}
                    className="max-h-full object-cover w-full h-full"
                    referrerPolicy="no-referrer"
                  />
                </div>

                <div className="hidden md:flex items-center gap-2 p-3 bg-white/85 border rounded-2xl shadow-inner-sm mt-4">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <div className="text-[10px] text-gray-500">
                    <p className="font-bold text-neutral-800">7-Day Free Swap Guarantee</p>
                    <p>Free pickup return if anything changes from expectations.</p>
                  </div>
                </div>
              </div>

              {/* SPEC SHEET & INTERACTIVE REVIEWS (RIGHT) */}
              <div className="w-full md:w-1/2 flex flex-col h-full overflow-y-auto max-h-[90vh] p-6 space-y-4">
                
                {/* HEAD & CLOSE ACTION */}
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-gray-400 block tracking-widest uppercase">
                      {selectedProduct.brand || "W-OFFICIAL"} • {selectedProduct.category} COLLECTION
                    </span>
                    <h2 className="text-xl font-black text-neutral-900 uppercase">
                      {selectedProduct.name}
                    </h2>
                  </div>
                  <button
                    onClick={() => setSelectedProduct(null)}
                    className="p-1.5 hover:bg-neutral-100 rounded-full text-neutral-500 transition-colors hidden md:block cursor-pointer"
                  >
                    Close (Esc)
                  </button>
                </div>

                {/* RATINGS HEADER */}
                <div className="flex items-center gap-2.5 pb-2 border-b border-gray-100">
                  <div className="flex items-center text-amber-500">
                    {Array.from({ length: 5 }).map((_, sIdx) => (
                      <Star
                        key={sIdx}
                        className={`w-4 h-4 ${sIdx < Math.round(avgRating) ? "fill-amber-500 text-amber-500" : "text-gray-200"}`}
                      />
                    ))}
                  </div>
                  <span className="text-xs font-black text-neutral-700">
                    {avgRating} out of 5 stars ({totalReviews} custom reviews)
                  </span>
                </div>

                {/* PRICING SHEET */}
                {(() => {
                  const quickOriginalPrice = selectedProduct.originalPrice && selectedProduct.originalPrice > selectedProduct.price
                    ? selectedProduct.originalPrice
                    : selectedProduct.price / 0.75;
                  const quickDiscountPct = Math.round(((quickOriginalPrice - selectedProduct.price) / quickOriginalPrice) * 100);

                  return (
                    <div className="bg-neutral-50 p-4 rounded-2xl border flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-mono font-semibold text-gray-400 uppercase">SPECIAL PRICE AVAILABLE</p>
                        <div className="flex items-baseline gap-2.5">
                          <span className="text-2xl font-black text-neutral-900 font-mono">
                            KSh {selectedProduct.price.toLocaleString()}
                          </span>
                          {quickDiscountPct > 0 && (
                            <span className="text-sm text-gray-300 line-through font-mono font-bold">
                              KSh {quickOriginalPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                          )}
                        </div>
                      </div>
                      {quickDiscountPct > 0 && (
                        <span className="text-[10px] text-orange-600 bg-orange-100/60 px-2 py-1 rounded-md font-black font-mono">
                          {quickDiscountPct}% OFF MARKDOWN SAVE
                        </span>
                      )}
                    </div>
                  );
                })()}

                {/* NAVIGATION TABS (Overview, Delivery, Reviews) */}
                <div className="flex border-b text-xs font-bold divide-x">
                  <button
                    onClick={() => setDetailModalTab('specs')}
                    className={`flex-1 py-2 text-center transition-colors cursor-pointer ${
                      detailModalTab === 'specs' ? "bg-orange-500 text-white font-black" : "bg-neutral-50 text-neutral-600 hover:bg-neutral-100"
                    }`}
                  >
                    Specs & Info
                  </button>
                  <button
                    onClick={() => setDetailModalTab('shipping')}
                    className={`flex-1 py-2 text-center transition-colors cursor-pointer ${
                      detailModalTab === 'shipping' ? "bg-orange-500 text-white font-black" : "bg-neutral-50 text-neutral-600 hover:bg-neutral-100"
                    }`}
                  >
                    Delivery timelines
                  </button>
                  <button
                    onClick={() => setDetailModalTab('reviews')}
                    className={`flex-1 py-2 text-center transition-colors cursor-pointer flex items-center justify-center gap-1 ${
                      detailModalTab === 'reviews' ? "bg-orange-500 text-white font-black" : "bg-neutral-50 text-neutral-600 hover:bg-neutral-100"
                    }`}
                  >
                    <span>Reviews Feed</span>
                    <span className="bg-white/30 text-neutral-800 text-[10px] px-1.5 rounded-full font-black">
                      {specReviews.length}
                    </span>
                  </button>
                </div>

                {/* TAB CONTENT CARDS */}
                <div className="min-h-[160px] max-h-[300px] overflow-y-auto pr-1">
                  {detailModalTab === 'specs' && (
                    <div className="space-y-3 font-medium text-xs leading-relaxed text-gray-700">
                      <p className="font-semibold text-gray-900">{selectedProduct.description}</p>
                      <ul className="space-y-1 bg-neutral-50 p-3.5 rounded-xl border list-disc list-inside">
                        <li><span className="font-bold">Originality:</span> 100% genuine Wantalian system</li>
                        <li><span className="font-bold">Dispatch score:</span> 24 hours dispatch time</li>
                        <li><span className="font-bold">Stock Count:</span> {selectedProduct.stock} modules left at our hubs</li>
                        <li><span className="font-bold">Merchant score:</span> Silver artisan status (Apt-level guarantee)</li>
                      </ul>
                    </div>
                  )}

                  {detailModalTab === 'shipping' && (
                    <div className="space-y-3 text-xs leading-relaxed text-gray-600">
                      <p className="font-semibold text-gray-900">Standard Delivery timelines:</p>
                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <Truck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-neutral-800 block">Nairobi Metro Hub Delivery</span>
                            <span className="text-gray-500">Delivered within 24 hours. Free if checkout is done with priority M-Pesa.</span>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <Info className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-neutral-800 block">Rest of Kenyan Counties (Mombasa, Kisumu, etc.)</span>
                            <span className="text-gray-500">Delivered within 2-3 business days. Safe tracking coordinates published to your email feed.</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {detailModalTab === 'reviews' && (
                    <div className="space-y-4">
                      {/* SUBMIT NEW COMMENT REVIEW */}
                      <form onSubmit={(e) => handlePostReview(e, selectedProduct.id)} className="border p-4 rounded-2xl bg-neutral-50/50 space-y-3">
                        <p className="text-xs font-black text-gray-800 uppercase tracking-wide">Write and Post a Customer Review</p>
                        
                        {reviewSuccessMsg && (
                          <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-800 text-[11px] font-medium border border-emerald-100 flex items-center gap-1">
                            <Check className="w-4 h-4" />
                            <span>{reviewSuccessMsg}</span>
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1 text-left">
                            <label className="text-[10px] uppercase font-mono tracking-wider text-gray-400 block font-semibold">Your Name</label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. Kiprono S."
                              value={newReviewAuthor}
                              onChange={(e) => setNewReviewAuthor(e.target.value)}
                              className="w-full px-2.5 py-1.5 text-xs text-gray-700 bg-white border rounded-lg focus:outline-none"
                            />
                          </div>

                          <div className="space-y-1 text-left">
                            <label className="text-[10px] uppercase font-mono tracking-wider text-gray-400 block font-semibold">Select score</label>
                            <select
                              value={newReviewRating}
                              onChange={(e) => setNewReviewRating(Number(e.target.value))}
                              className="w-full px-2.5 py-1.5 text-xs text-gray-700 bg-white border rounded-lg focus:outline-none cursor-pointer"
                            >
                              <option value="5">⭐⭐⭐⭐⭐ 5 Stars</option>
                              <option value="4">⭐⭐⭐⭐ 4 Stars</option>
                              <option value="3">⭐⭐⭐ 3 Stars</option>
                              <option value="2">⭐⭐ 2 Stars</option>
                              <option value="1">⭐ 1 Star</option>
                            </select>
                          </div>
                        </div>

                        <div className="space-y-1 text-left">
                          <label className="text-[10px] uppercase font-mono tracking-wider text-gray-400 block font-semibold">Commentary details</label>
                          <textarea
                            required
                            rows={2}
                            placeholder="Share detailed feedback on design, quality, or value..."
                            value={newReviewComment}
                            onChange={(e) => setNewReviewComment(e.target.value)}
                            className="w-full px-2.5 py-1.5 text-xs text-gray-700 bg-white border rounded-lg focus:outline-none resize-none"
                          />
                        </div>

                        <button
                          type="submit"
                          className="w-full py-2 bg-orange-500 hover:bg-orange-600 font-bold text-xs text-white rounded-lg transition-colors cursor-pointer"
                        >
                          SUBMIT REVIEW REFERENCE
                        </button>
                      </form>

                      {/* DISPLAY FEED */}
                      <div className="space-y-3 pt-2">
                        <h4 className="text-xs font-bold text-neutral-800 border-b pb-1">Verified Buyer Feed</h4>
                        {specReviews.length === 0 ? (
                          <p className="text-[11px] text-gray-400 text-center py-4">No reviews recorded yet for this piece. Be the first to review!</p>
                        ) : (
                          specReviews.map((rev) => (
                            <div key={rev.id} className="p-3 bg-neutral-50 border rounded-xl space-y-1.5">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-gray-900">{rev.userName}</span>
                                <span className="text-[9px] text-gray-400 font-mono">{rev.date}</span>
                              </div>
                              <div className="flex items-center text-amber-500 leading-none">
                                {Array.from({ length: 5 }).map((_, revSIdx) => (
                                  <Star
                                    key={revSIdx}
                                    className={`w-3 h-3 ${revSIdx < rev.rating ? "fill-amber-500 text-amber-500" : "text-gray-250"}`}
                                  />
                                ))}
                              </div>
                              <p className="text-[11px] leading-relaxed text-gray-600 font-medium">{rev.comment}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* ADD DIRECT TO CART AND QUANTITY SELECTOR */}
                <div className="pt-4 border-t flex items-center justify-between gap-4 mt-auto">
                  <div className="flex flex-col text-left">
                    <span className="text-[10px] text-gray-400 font-bold">TOTAL VALUE</span>
                    <span className="text-lg font-black text-neutral-900 font-mono">KSh {selectedProduct.price.toLocaleString()}</span>
                  </div>

                  <div className="flex items-center gap-2 flex-1 max-w-[240px]">
                    <button
                      onClick={() => {
                        handleAddToCartWithLogging(selectedProduct);
                        setSelectedProduct(null);
                      }}
                      disabled={isOutOfStock}
                      className={`w-full py-3.5 rounded-xl font-bold text-xs text-white shadow-md flex items-center justify-center gap-2 transition-transform hover:scale-[1.01] cursor-pointer ${
                        isOutOfStock ? "bg-gray-250 cursor-not-allowed" : "bg-orange-500 hover:bg-orange-600"
                      }`}
                    >
                      <ShoppingCart className="w-4 h-4" />
                      <span>{isOutOfStock ? "Sold out" : "Add to Shopping Bag"}</span>
                    </button>
                  </div>
                </div>

              </div>

            </div>
          </div>
        );
      })()}

    </div>
  );
}
