import { useState, useEffect } from "react";
import { safeStorage } from "./utils/safeStorage";
import Header from "./components/Header";
import ProductCatalog from "./components/ProductCatalog";
import CartCheckout from "./components/CartCheckout";
import VendorPortal from "./components/VendorPortal";
import AdminDashboard from "./components/AdminDashboard";
import AuthLandingPage from "./components/AuthLandingPage";
import CustomerCareChatbot from "./components/CustomerCareChatbot";
import FormspreeContactModal from "./components/FormspreeContactModal";
import { Product, Order, PushNotification } from "./types";
import { Sparkles, CheckCircle, Flame, ShieldAlert, ShoppingBag, BellRing, X } from "lucide-react";

const LOCAL_FALLBACK_PRODUCTS: Product[] = [
  {
    id: "prod-1",
    name: "Aura Soundbar Pro",
    description: "Elegant spatial audio system featuring patented high-fidelity sonic waves, dynamic acoustic profiling, and rich walnut wood grills.",
    category: "Audio",
    price: 249.99,
    stock: 12,
    image: "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600&auto=format&fit=crop&q=80",
    vendorId: "vendor-global",
    rating: 4.8,
    reviewsCount: 34,
    createdAt: new Date().toISOString()
  },
  {
    id: "prod-2",
    name: "Nova Light Canvas",
    description: "Intelligent ambient modular LED light sheets that morph color palettes and shift luminances in synchronization with your environment's kinetic vibes.",
    category: "Home Ambient",
    price: 139.50,
    stock: 25,
    image: "https://images.unsplash.com/photo-1507646227500-4d389b0012be?w=600&auto=format&fit=crop&q=80",
    vendorId: "vendor-global",
    rating: 4.6,
    reviewsCount: 19,
    createdAt: new Date().toISOString()
  },
  {
    id: "prod-3",
    name: "Zenith Ergo Split Keyboard",
    description: "Ergonomic mechanical split-layout keyboard crafted in aviation-grade dark gray aluminum with hot-swappable clicky gold switches.",
    category: "Tech Gear",
    price: 189.00,
    stock: 8,
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=80",
    vendorId: "vendor-global",
    rating: 4.9,
    reviewsCount: 42,
    createdAt: new Date().toISOString()
  },
  {
    id: "prod-4",
    name: "Nebula Desk Mat (Extra Large)",
    description: "Premium smooth mouse mat woven with low-friction silver-thread microtexture, non-slip rubber padding, and high-fidelity deep space print.",
    category: "Accessories",
    price: 39.00,
    stock: 40,
    image: "https://images.unsplash.com/photo-1616440347437-b1c73416efc2?w=600&auto=format&fit=crop&q=80",
    vendorId: "vendor-global",
    rating: 4.7,
    reviewsCount: 112,
    createdAt: new Date().toISOString()
  }
];

export default function App() {
  // STATE DEFINITIONS
  const [currentUser, setCurrentUser] = useState<string | null>(() => safeStorage.getItem("wantalian_user") || null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [currentRole, setCurrentRole] = useState<'customer' | 'vendor' | 'admin'>(() => {
    return (safeStorage.getItem("wantalian_role") as any) || "customer";
  });
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => !!safeStorage.getItem("wantalian_user"));
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const cached = safeStorage.getItem("wantalian_cached_products");
      return cached ? JSON.parse(cached) : LOCAL_FALLBACK_PRODUCTS;
    } catch {
      return LOCAL_FALLBACK_PRODUCTS;
    }
  });
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = safeStorage.getItem("wantalian_local_orders");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [notifications, setNotifications] = useState<PushNotification[]>(() => {
    try {
      const saved = safeStorage.getItem("wantalian_local_notifications");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [serverIsAlive, setServerIsAlive] = useState(true);
  
  const [cart, setCart] = useState<{ productId: string; name: string; price: number; quantity: number }[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [browsingHistory, setBrowsingHistory] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  
  // State for ML Recommendation Refresh triggers
  const [mlTrigger, setMlTrigger] = useState(0);

  // floating real-time push toast alerts state
  const [activeToast, setActiveToast] = useState<PushNotification | null>(null);

  const [guestBrowsing, setGuestBrowsing] = useState<boolean>(true);

  // Sync products and orders on mount
  const fetchData = async () => {
    try {
      const pResp = await fetch("/api/products");
      if (pResp.ok) {
        setServerIsAlive(true);
        const pList = await pResp.json();
        if (pList && pList.length > 0) {
          setProducts(pList);
          safeStorage.setItem("wantalian_cached_products", JSON.stringify(pList));
        }
      } else if (pResp.status === 404) {
        setServerIsAlive(false);
      }
      
      if (pResp && pResp.ok) {
        const oResp = await fetch("/api/notifications"); // load notifications initially
        if (oResp.ok) {
          const nList = await oResp.json();
          setNotifications(nList);
          safeStorage.setItem("wantalian_local_notifications", JSON.stringify(nList));
        }
      }
    } catch (err) {
      setServerIsAlive(false);
      console.warn("Could not fetch fresh live catalog from endpoint. Loading cached catalog parameters.", err);
      try {
        const cached = safeStorage.getItem("wantalian_cached_products");
        if (cached) {
          setProducts(JSON.parse(cached));
        }
      } catch {
        // use initial hardcoded state
      }
    }
  };

  const fetchOrders = async () => {
    // Legacy support, replaced by reactive stats refresh
  };

  // Dedicated fetcher for orders
  const refreshOrders = async () => {
    try {
      const resp = await fetch("/api/admin/analytics");
      if (resp.ok) {
        setServerIsAlive(true);
        const ordResp = await fetch("/api/admin/orders");
        if (ordResp.ok) {
          const ordList = await ordResp.json();
          setOrders(ordList);
          safeStorage.setItem("wantalian_local_orders", JSON.stringify(ordList));
        }
      } else if (resp.status === 404) {
        setServerIsAlive(false);
      }
    } catch (err) {
      setServerIsAlive(false);
      console.warn("Could not pull order log records.", err);
    }
  };

  useEffect(() => {
    fetchData();
    refreshOrders();

    // 1. Core Persistent Browsing History Loading
    const localHist = safeStorage.getItem("omnishop_search_history");
    if (localHist) {
      setBrowsingHistory(JSON.parse(localHist));
    }

    // 2. REAL-TIME MULTI-USER NOTIFICATION POLL TRAFFIC ENFORCER
    // Polls notifications status every 3 seconds representing real-time push update constraints.
    // If not alive, we skip the fetches to avoid 404 logs on static hosting (Vercel).
    const pollInterval = setInterval(async () => {
      if (!serverIsAlive) return;
      try {
        const resp = await fetch("/api/notifications");
        if (resp.ok) {
          const freshNotifications: PushNotification[] = await resp.json();
          
          // Verify if a brand new notification was logged to trigger float in-app push alerts TOASTS!
          if (freshNotifications.length > 0) {
            const currentLatest = notifications[0];
            const incomingLatest = freshNotifications[0];

            if (!currentLatest || currentLatest.id !== incomingLatest.id) {
              // Trigger Floating Toast Alert!
              setActiveToast(incomingLatest);
              // auto fade out toast in 6 seconds
              setTimeout(() => {
                setActiveToast(null);
              }, 6000);
            }
          }
          setNotifications(freshNotifications);
          safeStorage.setItem("wantalian_local_notifications", JSON.stringify(freshNotifications));
        } else if (resp.status === 404) {
          setServerIsAlive(false);
        }
      } catch (err) {
         // Silently fail connection during hot rebuild HMR frames
      }
    }, 3000);

    return () => clearInterval(pollInterval);
  }, [notifications, serverIsAlive]);

  // Handle Search Logs History writing
  const handleLogHistory = async (productId: string, actionType: 'view' | 'cart' | 'purchase') => {
    try {
      // Find matching product name in cache
      const item = products.find(p => p.id === productId);
      if (!item) return;

      const actionText = `Product: ${item.name} | Category: ${item.category}`;
      let updatedHistory = [actionText, ...browsingHistory];
      
      // limit browsing pattern logs to 12 parameters to optimize prompt size
      if (updatedHistory.length > 12) {
        updatedHistory = updatedHistory.slice(0, 12);
      }

      setBrowsingHistory(updatedHistory);
      safeStorage.setItem("omnishop_search_history", JSON.stringify(updatedHistory));

      // POST search logs to database proxy
      await fetch("/api/history/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, actionType })
      });

      // Increment Refresh trigger to call custom Gemini Recomendation model again!
      setMlTrigger(prev => prev + 1);
    } catch (err) {
      console.warn("Telemetry log save skipped", err);
    }
  };

  // CART WORKFLOWS
  const handleAddToCart = (product: any) => {
    setCart(prev => {
      const exists = prev.find(item => item.productId === product.id);
      if (exists) {
        return prev.map(item =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { productId: product.id, name: product.name, price: product.price, quantity: 1 }];
    });
    setShowCart(true);
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.productId !== productId));
  };

  const handleClearCart = () => setCart([]);

  // SUBMIT OR UPLOAD NEW PRODUCT: VENDOR INTERFACE
  const handleAddProductVendor = async (partialProduct: Partial<Product>) => {
    try {
      const resp = await fetch("/api/vendor/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(partialProduct)
      });

      if (resp.status === 404) {
        throw new Error("fallback 404");
      }

      if (!resp.ok) {
        const err = await resp.json();
        throw new Error(err.error || "Failed to commit product specification.");
      }

      await fetchData();
    } catch (err: any) {
      console.warn("Using vendor add fallback client-side:", err);
      // Simulate client-side addition!
      const fallbackId = `prod-${Math.floor(Math.random() * 900000) + 100000}`;
      const newProduct: Product = {
        id: fallbackId,
        name: partialProduct.name || "Custom Vendor Product",
        description: partialProduct.description || "Vendor custom specified hardware module.",
        category: partialProduct.category || "Audio Systems",
        price: Number(partialProduct.price) || 99.99,
        stock: Number(partialProduct.stock) || 10,
        image: partialProduct.image || "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600&auto=format&fit=crop&q=80",
        vendorId: partialProduct.vendorId || "vendor-local",
        rating: 5.0,
        reviewsCount: 1,
        createdAt: new Date().toISOString()
      };

      const updatedProducts = [...products, newProduct];
      setProducts(updatedProducts);
      safeStorage.setItem("wantalian_cached_products", JSON.stringify(updatedProducts));
    }
  };

  // INVENTORY ADJUSTER: VENDOR FORMS
  const handleAdjustStockVendor = async (productId: string, adjustment: number) => {
    try {
      const resp = await fetch("/api/vendor/products/stock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, adjustment })
      });

      if (resp.status === 404) {
        throw new Error("fallback 404");
      }

      if (!resp.ok) {
        throw new Error("Inventory adjuster rejected command.");
      }

      await fetchData();
    } catch (err) {
      console.warn("Using vendor stock adjust fallback client-side:", err);
      const updated = products.map(p => {
        if (p.id === productId) {
          const s = typeof p.stock === "number" ? p.stock : parseInt(String(p.stock), 10) || 0;
          return { ...p, stock: Math.max(0, s + adjustment) };
        }
        return p;
      });
      setProducts(updated);
      safeStorage.setItem("wantalian_cached_products", JSON.stringify(updated));
    }
  };

  // UPDATE STATUS DETAILS: ADMIN INTERFACE
  const handleUpdateOrderStatusAdmin = async (orderId: string, status: string) => {
    try {
      const resp = await fetch("/api/admin/orders/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status })
      });

      if (resp.status === 404) {
        throw new Error("fallback 404");
      }

      if (!resp.ok) {
        throw new Error("Transits ledger rejected order status update.");
      }

      await refreshOrders();
    } catch (err) {
      console.warn("Using order status admin update fallback client-side:", err);
      const updatedOrders = orders.map(o => {
        if (o.id === orderId) {
          return { ...o, status };
        }
        return o;
      });
      setOrders(updatedOrders);
      safeStorage.setItem("wantalian_local_orders", JSON.stringify(updatedOrders));
    }
  };

  const handleMarkNotificationsRead = async () => {
    try {
      if (serverIsAlive) {
        await fetch("/api/notifications/read-all", { method: "POST" });
      }
    } catch (err) {
      console.warn("Notification marker skipped server log:", err);
    }
    const cleared = notifications.map(n => ({ ...n, isRead: true } as any));
    setNotifications(cleared);
    safeStorage.setItem("wantalian_local_notifications", JSON.stringify(cleared));
  };

  if (!isLoggedIn && !guestBrowsing) {
    return (
      <AuthLandingPage
        onLoginSuccess={(email, role) => {
          setCurrentUser(email);
          setCurrentRole(role);
          setIsLoggedIn(true);
          setGuestBrowsing(false);
          safeStorage.setItem("wantalian_user", email);
          safeStorage.setItem("wantalian_role", role);
        }}
        onBrowseAsGuest={() => setGuestBrowsing(true)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col font-sans pb-16 selection:bg-orange-500 selection:text-white">
      
      {/* SHIELD HEADER PANEL */}
      <Header
        currentRole={currentRole}
        onChangeRole={(role) => {
          setCurrentRole(role);
          safeStorage.setItem("wantalian_role", role);
        }}
        cartCount={cart.reduce((s, i) => s + i.quantity, 0)}
        onOpenCart={() => setShowCart(true)}
        notifications={notifications}
        onMarkNotificationsRead={handleMarkNotificationsRead}
        onLogout={() => {
          setCurrentUser(null);
          setIsLoggedIn(false);
          setGuestBrowsing(false);
          safeStorage.removeItem("wantalian_user");
          safeStorage.removeItem("wantalian_role");
        }}
        searchTerm={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenContactModal={() => setShowContactModal(true)}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-10">
        
        {/* CONDITIONAL RENDER CHANNELS */}
        {currentRole === "customer" && (
          <div className="space-y-10">
            {/* PRIMARY CUSTOM SHOPPING FRONTPAGE */}
            <ProductCatalog
              products={products}
              onAddToCart={handleAddToCart}
              onLogHistory={handleLogHistory}
              searchTerm={searchQuery}
              onSearchChange={setSearchQuery}
            />
          </div>
        )}

        {currentRole === "vendor" && (
          <VendorPortal
            products={products}
            onAddProduct={handleAddProductVendor}
            onAdjustStock={handleAdjustStockVendor}
            notifications={notifications}
          />
        )}

        {currentRole === "admin" && (
          <AdminDashboard
            orders={orders}
            onUpdateOrderStatus={handleUpdateOrderStatusAdmin}
          />
        )}

      </main>

      {/* RENDER ACTIVE SLIDING CART CHECKOUT */}
      {showCart && (
        <CartCheckout
          cart={cart}
          products={products}
          onRemoveFromCart={handleRemoveFromCart}
          onClearCart={handleClearCart}
          onClose={() => setShowCart(false)}
          onCheckoutSuccess={(order) => {
            // Keep sidebar open for success screen layout preference selection
            refreshOrders();
          }}
          onGoHome={() => {
            setShowCart(false);
            setSearchQuery("");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          onLogHistory={handleLogHistory}
          isLoggedIn={isLoggedIn}
          currentUserEmail={currentUser || ""}
          onLoginSuccess={(email, role) => {
            setCurrentUser(email);
            setCurrentRole(role);
            setIsLoggedIn(true);
            setGuestBrowsing(false);
            safeStorage.setItem("wantalian_user", email);
            safeStorage.setItem("wantalian_role", role);
          }}
        />
      )}

      {/* CUSTOMER CARE CHATBOT INTEGRATION */}
      <CustomerCareChatbot />

      {/* SECURE FORMSPREE CONTACT MODAL */}
      <FormspreeContactModal
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
        currentUserEmail={currentUser || ""}
      />

      {/* FLOAT REAL TIME PUSH ALERTS TOAST Overlay (Satisfies Push notification updates requirements wonderfully!) */}
      {activeToast && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-white border border-gray-100 shadow-2xl rounded-2xl p-4 flex items-start gap-3.5 border-l-4 border-l-orange-500 animate-slide-up">
          <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
            <BellRing className="w-4 h-4 text-emerald-600 animate-swing" />
          </div>
          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-900">
                {activeToast.title}
              </span>
              <button
                onClick={() => setActiveToast(null)}
                className="text-gray-400 hover:text-gray-900 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-[11px] text-gray-600 leading-snug">
              {activeToast.message}
            </p>
            <span className="text-[9px] font-mono text-gray-400 block pt-1">
              {new Date(activeToast.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>
      )}

    </div>
  );
}
