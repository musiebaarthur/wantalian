import { Plus, Minus, Tag, DollarSign, Package, AlertTriangle, Sparkles, Check, Bell, BellRing, ShoppingBag, Clock } from "lucide-react";
import React, { useState } from "react";
import { Product, PushNotification } from "../types";

interface VendorPortalProps {
  products: Product[];
  onAddProduct: (newProduct: Partial<Product>) => Promise<void>;
  onAdjustStock: (productId: string, adjustment: number) => Promise<void>;
  notifications: PushNotification[];
}

export default function VendorPortal({
  products,
  onAddProduct,
  onAdjustStock,
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
        setImage(event.target.result);
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
    const originalPriceNum = originalPrice ? parseFloat(originalPrice) : undefined;

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

    if (originalPriceNum !== undefined && (isNaN(originalPriceNum) || originalPriceNum < priceNum)) {
      setErrorStatus("Original Retail Price must be a valid positive number and should exceed or equal Unit Price.");
      setSubmitting(false);
      return;
    }

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

            <div className="space-y-1">
              <label className="text-[9px] uppercase font-mono tracking-wider font-bold text-gray-400 block flex items-center gap-0.5">
                <Tag className="w-3 h-3 text-gray-300 line-through" />
                Original Retail (KSh)
              </label>
              <input
                type="number"
                step="1"
                placeholder="e.g. 20000 (Optional)"
                value={originalPrice}
                onChange={(e) => setOriginalPrice(e.target.value)}
                className="w-full px-3 py-1.5 text-xs text-gray-700 bg-gray-50 border border-gray-100 rounded-lg focus:outline-hidden focus:border-neutral-900 focus:bg-white transition-all shadow-xs font-mono text-gray-500"
              />
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
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
                isDragOver 
                  ? "border-emerald-500 bg-emerald-50/50" 
                  : "border-gray-200 hover:border-emerald-500 bg-gray-50/40"
              }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/*"
                className="hidden"
              />
              {image ? (
                <div className="relative group w-full flex flex-col items-center gap-2">
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
                    className="text-[10px] text-red-500 hover:underline hover:text-red-650 font-mono"
                  >
                    Remove Photo
                  </button>
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl inline-flex">
                    <Plus className="w-4 h-4 text-emerald-600" />
                  </div>
                  <p className="text-xs font-semibold text-gray-700">Drag & drop photo or click to upload</p>
                  <p className="text-[10px] text-gray-400">Supports PNG, JPG, GIF up to 5MB</p>
                </div>
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
