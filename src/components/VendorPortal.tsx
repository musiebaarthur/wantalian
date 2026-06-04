import { Plus, Minus, Tag, DollarSign, Package, AlertTriangle, Sparkles, Check, Bell, BellRing, ShoppingBag, Clock, Image, ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import React, { useState } from "react";
import { Product, PushNotification } from "../types";

export interface GalleryItem {
  id: string;
  name: string;
  category: string;
  url: string;
}

export const CURATED_GALLERY: GalleryItem[] = [
  // Audio
  { id: "g-audio-1", name: "Premium Aura Headphones", category: "Audio", url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80" },
  { id: "g-audio-2", name: "TWS True Wireless Buds", category: "Audio", url: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop&q=80" },
  { id: "g-audio-3", name: "Vintage Oak Stereo", category: "Audio", url: "https://images.unsplash.com/photo-1608156639585-b3a032ef9689?w=600&auto=format&fit=crop&q=80" },
  { id: "g-audio-4", name: "Smart Home Assistant Pod", category: "Audio", url: "https://images.unsplash.com/photo-1543512214-318c7553f230?w=600&auto=format&fit=crop&q=80" },

  // Tech Gear
  { id: "g-tech-1", name: "Tactile Mechanical Keyboard", category: "Tech Gear", url: "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=600&auto=format&fit=crop&q=80" },
  { id: "g-tech-2", name: "Ergonomic Arc Mouse", category: "Tech Gear", url: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600&auto=format&fit=crop&q=80" },
  { id: "g-tech-3", name: "Immersive Gaming Display", category: "Tech Gear", url: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&auto=format&fit=crop&q=80" },
  { id: "g-tech-4", name: "Multipurpose Hub Expansion", category: "Tech Gear", url: "https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=600&auto=format&fit=crop&q=80" },

  // Home Ambient
  { id: "g-home-1", name: "Warm Amber Lightbulb", category: "Home Ambient", url: "https://images.unsplash.com/photo-1550985616-10810253b84d?w=600&auto=format&fit=crop&q=80" },
  { id: "g-home-2", name: "Vivid Flexible LED strip", category: "Home Ambient", url: "https://images.unsplash.com/photo-1565814636199-ae8133055c1c?w=600&auto=format&fit=crop&q=80" },
  { id: "g-home-3", name: "Harmonious Sands Frame", category: "Home Ambient", url: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80" },
  { id: "g-home-4", name: "Aromatherapy Nebulizer Mist", category: "Home Ambient", url: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=600&auto=format&fit=crop&q=80" },

  // Accessories
  { id: "g-acc-1", name: "Fine Leather Card Holder", category: "Accessories", url: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&auto=format&fit=crop&q=80" },
  { id: "g-acc-2", name: "Executive Felt Pad", category: "Accessories", url: "https://images.unsplash.com/photo-1632292224971-0d45778bd364?w=600&auto=format&fit=crop&q=80" },
  { id: "g-acc-3", name: "Silver Raised Laptop Stand", category: "Accessories", url: "https://images.unsplash.com/photo-1527443195645-1133b7f28990?w=600&auto=format&fit=crop&q=80" },
  { id: "g-acc-4", name: "Eyewear Computer Filters", category: "Accessories", url: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&auto=format&fit=crop&q=80" },

  // Apparel
  { id: "g-app-1", name: "Essential Cozy Pullover", category: "Apparel", url: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600&auto=format&fit=crop&q=80" },
  { id: "g-app-2", name: "Unisex High-Top Sports Shoes", category: "Apparel", url: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&auto=format&fit=crop&q=80" },
  { id: "g-app-3", name: "Steel Chronograph Watch", category: "Apparel", url: "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=600&auto=format&fit=crop&q=80" }
];

interface VendorPortalProps {
  products: Product[];
  onAddProduct: (newProduct: Partial<Product>) => Promise<void>;
  onAdjustStock: (productId: string, adjustment: number) => Promise<void>;
  onDeleteProduct?: (productId: string) => Promise<void>;
  notifications: PushNotification[];
}

export default function VendorPortal({
  products,
  onAddProduct,
  onAdjustStock,
  onDeleteProduct,
  notifications
}: VendorPortalProps) {
  // New Product form fields
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Tech Gear");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [image, setImage] = useState("");
  const [brand, setBrand] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [isExpress, setIsExpress] = useState(false);

  const [formSuccess, setFormSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);

  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const [showGalleryPicker, setShowGalleryPicker] = useState(false);
  const [selectedGalleryCategory, setSelectedGalleryCategory] = useState("All");

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const vendorId = "vendor-user"; // Simulate authenticated vendor user

  const myProducts = products; // In this system, show all products to vendor so they can manage them

  const categoriesAvailable = [
    "Tech Gear",
    "Audio",
    "Home Ambient",
    "Accessories",
    "Apparel"
  ];

  // Set randomized magnificent stock images
  const setRandomStockImage = (cat: string) => {
    switch (cat) {
      case "Tech Gear":
        return "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=80";
      case "Audio":
        return "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600&auto=format&fit=crop&q=80";
      case "Home Ambient":
        return "https://images.unsplash.com/photo-1507646227500-4d389b0012be?w=600&auto=format&fit=crop&q=80";
      case "Apparel":
        return "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600&auto=format&fit=crop&q=80";
      default:
        return "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80";
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setErrorStatus("Only image files are permitted.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target && typeof event.target.result === "string") {
        const img = new window.Image();
        img.onload = () => {
          // Downscale to target size e.g. max dimension 800px to avoid storage crashes and maximize speeds
          const maxDim = 800;
          let width = img.width;
          let height = img.height;
          
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            // Convert to high-performance compressed jpeg
            const compressedBase64 = canvas.toDataURL("image/jpeg", 0.75);
            setImage(compressedBase64);
          } else {
            // Fallback to original
            setImage(event.target?.result as string);
          }
        };
        img.onerror = () => {
          setErrorStatus("Failed to process image drawing buffer.");
        };
        img.src = event.target.result;
      }
    };
    reader.onerror = () => {
      setErrorStatus("Failed to parse chosen image file.");
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorStatus(null);
    setSubmitting(true);

    if (!name || !price || !stock) {
      setErrorStatus("Product Name, Price and Starting Stock are mandatory fields.");
      setSubmitting(false);
      return;
    }

    const priceNum = parseFloat(price);
    const stockNum = parseInt(stock, 10);

    if (isNaN(priceNum) || priceNum <= 0) {
      setErrorStatus("Price must be a valid positive number.");
      setSubmitting(false);
      return;
    }

    if (isNaN(stockNum) || stockNum < 0) {
      setErrorStatus("Starting Quantity must be an integer metric (0 or more).");
      setSubmitting(false);
      return;
    }

    // Automatically calculate a realistic older retail price with a 15% to 35% discount rate
    const rates = [15, 20, 25, 30, 35];
    const rateIndex = Math.abs(name.charCodeAt(0) + Math.round(priceNum)) % rates.length;
    const selectedRate = rates[rateIndex];
    const originalPriceNum = Math.round(priceNum / (1 - selectedRate / 100));

    // Set fallback image if empty
    const finalImage = image.trim() || setRandomStockImage(category);

    try {
      await onAddProduct({
        name,
        description: description || "Exclusive premium item added by vendor partners.",
        category,
        price: priceNum,
        stock: stockNum,
        image: finalImage,
        vendorId,
        brand: brand.trim() || undefined,
        isExpress: isExpress,
        originalPrice: originalPriceNum
      });

      // Reset form on success
      setName("");
      setDescription("");
      setPrice("");
      setStock("");
      setImage("");
      setBrand("");
      setOriginalPrice("");
      setIsExpress(false);
      setFormSuccess(true);
      setTimeout(() => setFormSuccess(false), 4500);
    } catch (err: any) {
      setErrorStatus(err.message || "Failed to submit new product definition.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      {/* COLUMN 1: NEW PRODUCT FORM UPLOAD */}
      <div className="lg:col-span-1 bg-white border border-gray-100 rounded-2xl shadow-xs p-6 space-y-5 h-fit">
        <div>
          <h2 className="text-base font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-600" />
            Vendor Upload Dashboard
          </h2>
          <p className="text-[11px] text-gray-400 mt-1">
            Publish new items directly to Wantalian's active store catalog.
          </p>
        </div>

        {formSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl text-xs flex items-center gap-2 animate-bounce">
            <Check className="w-4 h-4 text-emerald-500" />
            <span>Product successfully deployed live to store!</span>
          </div>
        )}

        {errorStatus && (
          <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-xs">
            ⚠️ {errorStatus}
          </div>
        )}

        <form onSubmit={handleCreateProduct} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[9px] uppercase font-mono tracking-wider font-bold text-gray-400 block">
              Product Title
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Apollo Sonic Headsets"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-1.5 text-xs text-gray-700 bg-gray-50 border border-gray-100 rounded-lg focus:outline-hidden focus:border-neutral-900 focus:bg-white transition-all shadow-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div className="space-y-1">
              <label className="text-[9px] uppercase font-mono tracking-wider font-bold text-gray-400 block">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-2 py-1.5 text-xs text-gray-700 bg-gray-50 border border-gray-100 rounded-lg focus:outline-hidden"
              >
                {categoriesAvailable.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] uppercase font-mono tracking-wider font-bold text-gray-400 block">
                Brand Name
              </label>
              <input
                type="text"
                placeholder="e.g. W-OFFICIAL"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full px-3 py-1.5 text-xs text-gray-700 bg-gray-50 border border-gray-100 rounded-lg focus:outline-hidden focus:border-neutral-900 focus:bg-white transition-all shadow-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] uppercase font-mono tracking-wider font-bold text-gray-400 block flex items-center gap-0.5">
                <Tag className="w-3 h-3 text-gray-400" />
                Unit Price (KSh)
              </label>
              <input
                type="number"
                required
                step="1"
                placeholder="e.g. 15000"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-3 py-1.5 text-xs text-gray-700 bg-gray-50 border border-gray-100 rounded-lg focus:outline-hidden focus:border-neutral-900 focus:bg-white transition-all shadow-xs font-mono font-bold"
              />
            </div>

            <div className="bg-orange-50/30 border border-dashed border-orange-100/50 rounded-xl p-3 space-y-1 select-none flex flex-col justify-center">
              <span className="text-[9px] uppercase font-extrabold tracking-wider text-orange-800 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-orange-500 animate-pulse" />
                Auto-Slashed Discount Active
              </span>
              <p className="text-[10px] text-gray-500 leading-relaxed font-medium">
                Provide only the actual sale price above. Our system automatically generates a crossed-out higher "original retail" price with a computed <strong className="text-orange-600 font-bold">15% to 35% discount</strong> to drive user interest!
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] uppercase font-mono tracking-wider font-bold text-gray-400 block flex items-center gap-0.5">
                <Package className="w-3 h-3 text-gray-400" />
                Initial Quantity
              </label>
              <input
                type="number"
                required
                placeholder="e.g. 25"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="w-full px-3 py-1.5 text-xs text-gray-700 bg-gray-50 border border-gray-100 rounded-lg focus:outline-hidden focus:border-neutral-900 focus:bg-white transition-all shadow-xs font-mono"
              />
            </div>

            <div className="flex items-center gap-1.5 pt-5 pl-1">
              <input
                type="checkbox"
                id="isExpressCheckbox"
                checked={isExpress}
                onChange={(e) => setIsExpress(e.target.checked)}
                className="w-3.5 h-3.5 rounded text-emerald-600 accent-emerald-600 focus:ring-emerald-500 cursor-pointer"
              />
              <label htmlFor="isExpressCheckbox" className="text-[9px] font-black text-emerald-800 tracking-tight cursor-pointer uppercase select-none">
                Wantalian Express ⚡
              </label>
            </div>
          </div>

          {/* IMAGE UPLOAD CONTAINER: DRAG AND DROP + INPUT */}
          <div className="space-y-1.5">
            <label className="text-[9px] uppercase font-mono tracking-wider font-bold text-gray-400 block">
              Product Image Setup
            </label>
            
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-xl p-4 text-center transition-all flex flex-col items-center justify-center gap-2 min-h-[140px] ${
                isDragOver 
                  ? "border-emerald-500 bg-emerald-50/50" 
                  : "border-gray-200 hover:border-emerald-500 bg-gray-50/40"
              }`}
            >
              <input
                id="vendor-image-file-input"
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/*"
                className="hidden"
              />
              {image ? (
                <div className="relative z-10 w-full flex flex-col items-center gap-2">
                  <img
                    src={image}
                    alt="Uploaded preview"
                    className="max-h-24 object-cover rounded-lg shadow-2xs border border-gray-100"
                  />
                  <div className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    <span>Image Loaded Successfully</span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setImage("");
                    }}
                    className="text-[10px] text-red-500 hover:underline hover:text-red-650 font-mono cursor-pointer"
                  >
                    Remove Photo
                  </button>
                </div>
              ) : (
                <label 
                  htmlFor="vendor-image-file-input"
                  className="absolute inset-0 cursor-pointer z-5 flex flex-col items-center justify-center p-4"
                >
                  <div className="space-y-1 text-center">
                    <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl inline-flex mb-1">
                      <Plus className="w-4 h-4 text-emerald-600" />
                    </div>
                    <p className="text-xs font-semibold text-gray-700">Choose photo from your gallery</p>
                    <p className="text-[10px] text-gray-400">Tap to browse files or drop here</p>
                  </div>
                </label>
              )}
            </div>

            <div className="pt-1">
              <label className="text-[9px] uppercase font-mono tracking-wider font-bold text-gray-450 block mb-1">
                Or Paste Image Remote URL
              </label>
              <input
                type="text"
                placeholder="https://images.unsplash.com/photo-..."
                value={image.startsWith("data:") ? "" : image}
                onChange={(e) => setImage(e.target.value)}
                className="w-full px-3 py-1.5 text-xs text-gray-700 bg-gray-50 border border-gray-100 rounded-lg focus:outline-hidden focus:border-neutral-900 focus:bg-white transition-all text-ellipsis"
              />
            </div>

            {/* GALLERY CHOICE SELECTION ROOM */}
            <div className="pt-2 border-t border-gray-100/60 mt-2">
              <button
                type="button"
                onClick={() => setShowGalleryPicker(!showGalleryPicker)}
                className="w-full flex items-center justify-between py-1.5 px-3 bg-orange-50/40 hover:bg-orange-50/80 border border-orange-100/50 rounded-lg text-[10.5px] font-bold text-orange-850 transition-all select-none"
              >
                <div className="flex items-center gap-1.5">
                  <Image className="w-3.5 h-3.5 text-orange-600" />
                  <span>Choose Image from Stock Galleries</span>
                </div>
                {showGalleryPicker ? <ChevronUp className="w-3.5 h-3.5 text-orange-500" /> : <ChevronDown className="w-3.5 h-3.5 text-orange-500" />}
              </button>

              {showGalleryPicker && (
                <div className="mt-2 p-2 bg-neutral-50/50 border border-gray-200/60 rounded-xl space-y-2">
                  <div className="flex items-center gap-1 overflow-x-auto scrollbar-none pb-1">
                    {["All", "Audio", "Tech Gear", "Home Ambient", "Accessories", "Apparel"].map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setSelectedGalleryCategory(cat)}
                        className={`px-2 py-0.5 text-[9px] font-bold rounded-md whitespace-nowrap transition-all ${
                          selectedGalleryCategory === cat
                            ? "bg-neutral-900 text-white"
                            : "bg-white text-gray-500 border border-gray-200/80 hover:bg-gray-150"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto scrollbar-thin p-0.5">
                    {CURATED_GALLERY.filter(item => selectedGalleryCategory === "All" || item.category === selectedGalleryCategory).map((item) => {
                      const isSelected = image === item.url;
                      return (
                        <div
                          key={item.id}
                          onClick={() => setImage(item.url)}
                          className={`group relative aspect-video rounded-lg overflow-hidden border cursor-pointer transition-all ${
                            isSelected
                              ? "border-orange-500 ring-2 ring-orange-500/20 shadow-xs"
                              : "border-gray-150 hover:border-gray-300"
                          }`}
                        >
                          <img
                            src={item.url}
                            alt={item.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300 pointer-events-none"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-neutral-950/80 via-neutral-950/45 to-transparent p-1 px-1.5 flex flex-col justify-end">
                            <span className="text-[8px] font-bold text-white leading-tight truncate">
                              {item.name}
                            </span>
                            <span className="text-[7px] font-mono text-orange-300 font-semibold leading-none">
                              {item.category}
                            </span>
                          </div>
                          {isSelected && (
                            <div className="absolute top-1 right-1 bg-orange-500 text-white p-0.5 rounded-full shadow-xs">
                              <Check className="w-2.5 h-2.5" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[9px] uppercase font-mono tracking-wider font-bold text-gray-400 block">
              Narrative Description
            </label>
            <textarea
              rows={3}
              placeholder="Detail mechanical switches, structural elements, frequencies, colors..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-1.5 text-xs text-gray-700 bg-gray-50 border border-gray-100 rounded-lg focus:outline-hidden focus:border-neutral-900 focus:bg-white transition-all shadow-xs"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className={`w-full py-2 rounded-xl text-xs font-bold text-white shadow-xs cursor-pointer flex items-center justify-center gap-1.5 transition-all ${
              submitting ? "bg-indigo-300" : "bg-neutral-950 hover:bg-neutral-850"
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>{submitting ? "Uploading Product Entry..." : "Upload & Deploy Product"}</span>
          </button>
        </form>
      </div>

      {/* COLUMN 2 & 3: DETAILS AND NOTIFICATIONS */}
      <div className="lg:col-span-2 space-y-8">
        
        {/* CARD 2A: STOCK INVENTORY CONTROL MANAGER */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-xs p-6 space-y-6 flex flex-col justify-between">
          <div className="space-y-1">
            <h2 className="text-base font-bold text-gray-900 tracking-tight flex items-center gap-2">
              <Package className="w-5 h-5 text-emerald-600" />
              Live Stock Inventory Controller
            </h2>
            <p className="text-[11px] text-gray-400">
              Audit catalog status, track current stock levels, and update inventory instantly.
            </p>
          </div>

          {/* LEDGER GRID */}
          <div className="divide-y divide-gray-100 flex-1 mt-4 max-h-[300px] overflow-y-auto pr-2">
            {myProducts.length === 0 ? (
              <div className="text-center py-16 text-xs text-gray-400">
                No product registers linked to your profile catalog.
              </div>
            ) : (
              myProducts.map((p) => {
                const isOut = p.stock === 0;
                const isLow = p.stock <= 3 && p.stock > 0;

                return (
                  <div key={p.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-12 h-12 rounded-lg object-cover bg-gray-50 border border-gray-100 shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <h4 className="text-xs font-semibold text-gray-900">{p.name}</h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[9px] font-mono text-gray-400 border border-gray-100 bg-gray-50 px-1 py-0.2 rounded uppercase">
                            {p.category}
                          </span>
                          <span className="text-[10px] font-bold text-gray-600 font-mono">
                            KSh {p.price.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* ACTIVE LEVEL ALERTS AND STOCK TUNING */}
                    <div className="flex items-center gap-4 justify-between sm:justify-end">
                      
                      {/* STOCK LEVEL WARN */}
                      <div className="flex items-center gap-1">
                        {isOut ? (
                          <span className="bg-red-50 text-red-600 border border-red-100 text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                            Out Of Stock 🚨
                          </span>
                        ) : isLow ? (
                          <div className="flex items-center gap-0.5 text-amber-600 text-[10px] font-mono bg-amber-50 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                            <AlertTriangle className="w-3 h-3 text-amber-500" />
                            <span>LOW STOCK: {p.stock}</span>
                          </div>
                        ) : (
                          <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] font-mono px-2 py-0.5 rounded-full font-bold">
                            Safe Volume: {p.stock} units
                          </span>
                        )}
                      </div>

                      {/* TUNING ADJUSTMENT BUTTONS */}
                      <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg p-0.5">
                        <button
                          onClick={() => onAdjustStock(p.id, -1)}
                          className="p-1 text-gray-500 hover:text-gray-900 bg-white hover:bg-gray-100 rounded-md transition-all border border-gray-100 shadow-3xs cursor-pointer"
                          title="Decrease Stock -1"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        
                        <span className="w-8 text-center text-xs font-bold font-mono text-gray-900">
                          {p.stock}
                        </span>

                        <button
                          onClick={() => onAdjustStock(p.id, 1)}
                          className="p-1 text-gray-500 hover:text-gray-900 bg-white hover:bg-gray-100 rounded-md transition-all border border-gray-100 shadow-3xs cursor-pointer"
                          title="Increase Stock +1"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* SAFE INLINE CATALOG DELETION OPTION */}
                      {onDeleteProduct && (
                        <div className="flex items-center pl-1.5 border-l border-gray-100 shrink-0">
                          {deletingId === p.id ? (
                            <div className="flex items-center gap-1 animate-fade-in">
                              <button
                                onClick={async () => {
                                  try {
                                    await onDeleteProduct(p.id);
                                  } finally {
                                    setDeletingId(null);
                                  }
                                }}
                                className="px-2 py-1 bg-red-650 hover:bg-red-750 text-white font-extrabold text-[9px] uppercase tracking-wider rounded-md shadow-xs transition-all active:scale-95 cursor-pointer whitespace-nowrap"
                              >
                                Delete
                              </button>
                              <button
                                onClick={() => setDeletingId(null)}
                                className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-650 font-extrabold text-[9px] uppercase tracking-wider rounded-md transition-all cursor-pointer whitespace-nowrap"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeletingId(p.id)}
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all cursor-pointer shrink-0"
                              title="Delete Item from Store Catalog"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      )}

                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* INVENTORY GUIDELINES OUTLINE */}
          <div className="bg-gray-50 p-4 border border-gray-100 rounded-xl space-y-1 text-xs text-gray-500">
            <p className="font-semibold text-gray-700">Vendor Catalog Guidelines:</p>
            <ul className="list-disc pl-4 space-y-0.5 text-[11px] leading-relaxed">
              <li>Ensure product descriptions and images are clear and accurate.</li>
              <li>Restocking or selling items updates the store inventory automatically in real time.</li>
              <li>Provide helpful unit pricing and stock counts.</li>
            </ul>
          </div>
        </div>

        {/* CARD 2B: LIVE ORDER NOTIFICATIONS & ALERTS */}
        {(() => {
          const vendorNotifications = notifications.filter(
            (n) =>
              n.id.includes("vendor") ||
              n.title.toLowerCase().includes("order placed") ||
              n.title.toLowerCase().includes("low stock") ||
              n.message.toLowerCase().includes("vendor alert")
          );

          return (
            <div className="bg-white border border-gray-100 rounded-xl shadow-2xs p-6 space-y-5">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h2 className="text-base font-bold text-gray-900 tracking-tight flex items-center gap-2">
                    <BellRing className="w-5 h-5 text-orange-500 animate-pulse" />
                    Live Vendor Order & Stock Alerts
                  </h2>
                  <p className="text-[11px] text-gray-400">
                    Real-time updates regarding new incoming customer purchases, sales transaction states, and critical stock dips.
                  </p>
                </div>
                {vendorNotifications.some(n => n.status === "unread") && (
                  <span className="text-[9px] font-black tracking-wider text-orange-600 bg-orange-100/60 px-2.5 py-1 rounded-full uppercase animate-pulse">
                    New Sales Alerts
                  </span>
                )}
              </div>

              <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-2 divide-y divide-gray-50">
                {vendorNotifications.length === 0 ? (
                  <div className="text-center py-12 text-xs text-gray-400 flex flex-col items-center justify-center gap-2">
                    <Bell className="w-8 h-8 text-gray-200" />
                    <span>No active order notifications recorded in this session. Try purchasing as a customer to see them trigger live!</span>
                  </div>
                ) : (
                  vendorNotifications.map((notif) => {
                    const isUnread = notif.status === "unread";
                    const isHighPriority = notif.title.includes("Stock") || notif.title.includes("Alert");

                    return (
                      <div
                        key={notif.id}
                        className={`pt-3.5 first:pt-0 pb-1 flex items-start gap-3 transition-colors ${
                          isUnread ? "bg-orange-50/10 rounded-lg p-2 -mx-2 border-l-2 border-orange-500" : ""
                        }`}
                      >
                        <div className={`p-2 rounded-xl border shrink-0 ${
                          isHighPriority
                            ? "bg-amber-50 border-amber-105 text-amber-605"
                            : "bg-emerald-50 border-emerald-105 text-emerald-600"
                        }`}>
                          {notif.title.includes("Order") ? (
                            <ShoppingBag className="w-4 h-4" />
                          ) : (
                            <Bell className="w-4 h-4" />
                          )}
                        </div>

                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between gap-2.5">
                            <h4 className="text-xs font-black text-gray-900 leading-snug">
                              {notif.title}
                            </h4>
                            <span className="text-[9.5px] text-gray-400 font-mono flex items-center gap-1 shrink-0">
                              <Clock className="w-3 h-3 text-gray-300" />
                              {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-[11px] leading-relaxed text-gray-600">
                            {notif.message}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })()}

      </div>

    </div>
  );
}
