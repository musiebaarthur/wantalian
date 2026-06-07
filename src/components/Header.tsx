import { 
  ShoppingCart, Bell, Sparkles, LayoutDashboard, Store, User, 
  CheckCircle2, AlertTriangle, LogOut, Search, HelpCircle, 
  ChevronDown, BookOpen, PhoneCall, ShieldCheck, Heart, Wallet, Mail
} from "lucide-react";
import { useState } from "react";
import { PushNotification } from "../types";

interface HeaderProps {
  currentRole: 'customer' | 'vendor' | 'admin';
  onChangeRole: (role: 'customer' | 'vendor' | 'admin') => void;
  cartCount: number;
  onOpenCart: () => void;
  notifications: PushNotification[];
  onMarkNotificationsRead: () => void;
  onLogout?: () => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onOpenContactModal?: () => void;
}

export default function Header({
  currentRole,
  onChangeRole,
  cartCount,
  onOpenCart,
  notifications,
  onMarkNotificationsRead,
  onLogout,
  searchTerm,
  onSearchChange,
  onOpenContactModal
}: HeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);
  const [showHelpDropdown, setShowHelpDropdown] = useState(false);
  
  const unreadCount = notifications.filter(n => n.status === "unread").length;

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "customer": return "bg-emerald-50 text-emerald-800 border border-emerald-200";
      case "vendor": return "bg-orange-50 text-orange-700 border border-orange-200";
      case "admin": return "bg-neutral-800 text-yellow-400 border border-neutral-700";
      default: return "bg-gray-50 text-gray-700 border border-gray-200";
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-gray-200 shadow-xs">
      
      {/* EXTREMELY SLICK TOP STRIP (Jumia Style Marketing & Banner) */}
      <div className="bg-neutral-900 text-gray-300 text-[11px] font-medium py-1.5 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-1.5 sm:gap-4 scrollbar-none overflow-x-auto">
            <span className="flex items-center gap-1 text-orange-400 font-bold tracking-wide">
              <Sparkles className="w-3 h-3 text-orange-400" />
              Mali Safi kwa Bei Poa
            </span>
            <span className="hidden sm:inline text-gray-500">|</span>
            <span className="shrink-0">⚡ Next-Day Delivery available in Nairobi & major hubs</span>
            <span className="hidden md:inline text-gray-500">|</span>
            <span className="hidden md:inline text-emerald-400 shrink-0">✔ 100% Original Products Guaranteed</span>
          </div>
          
          <div className="flex items-center gap-3 shrink-0">
            {/* Live Counter Info */}
            <span className="text-[10px] bg-orange-500 text-white font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider">
              Mega Sale Event
            </span>
          </div>
        </div>
      </div>

      {/* CORE NAVIGATION BAR */}
      <div className="px-4 py-3 sm:px-6 max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-4">
        
        {/* LOGO & BRANDING */}
        <div className="flex items-center justify-between w-full md:w-auto shrink-0 gap-3">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => onSearchChange("")}>
            <div className="bg-orange-500 text-white p-2 rounded-xl shadow-md flex items-center justify-center">
              <Store className="w-5.5 h-5.5" />
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-black text-neutral-900 tracking-tight">
                  <span className="text-orange-500 font-extrabold">Wanta</span>
                  <span className="text-neutral-900 font-black">lian</span>
                </span>
                <span className="text-[9px] bg-emerald-600 text-white font-mono font-bold px-1 py-0.2 rounded-sm uppercase tracking-wide">
                  Hub
                </span>
              </div>
              <p className="text-[10px] text-gray-400 font-mono tracking-wider -mt-1 font-semibold">
                MALI SAFI KWA BEI POA
              </p>
            </div>
          </div>

          {/* MOBILE TOGGLE CARDS & ACTION BAR */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={onOpenCart}
              className="relative p-2.5 text-neutral-700 bg-neutral-50 rounded-full"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-orange-500 text-[10px] font-bold text-white flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* JUMIA-STYLE HERO SEARCH CONSOLE */}
        <div className="flex-1 w-full max-w-2xl relative">
          <div className="relative flex items-center w-full">
            <Search className="absolute left-3.5 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search products, brands, workspace upgrades, accessories..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-24 py-2.5 text-xs text-neutral-800 bg-neutral-50 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 focus:bg-white focus:ring-1 focus:ring-orange-500 transition-all font-medium text-ellipsis"
            />
            <button
              onClick={() => {}}
              className="absolute right-1 px-4 py-1.5 text-xs font-bold text-white bg-orange-500 hover:bg-orange-600 rounded-md transition-colors shadow-sm"
              style={{ top: "4px" }}
            >
              SEARCH
            </button>
          </div>
        </div>

        {/* DIRECT SERVICES INTERFACE */}
        <div className="flex items-center gap-3 md:gap-5 w-full md:w-auto justify-between md:justify-end shrink-0">
          
          {/* CUSTOMER ACCOUNTS DROPDOWN */}
          <div className="relative">
            <button
              onClick={() => {
                setShowAccountDropdown(!showAccountDropdown);
                setShowHelpDropdown(false);
                setShowNotifications(false);
              }}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-neutral-700 bg-neutral-50 rounded-lg hover:bg-neutral-100 border border-gray-200 transition-colors"
            >
              <User className="w-4 h-4 text-orange-500" />
              <span>Accounts</span>
              <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform ${showAccountDropdown ? "rotate-180" : ""}`} />
            </button>

            {showAccountDropdown && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 shadow-xl rounded-xl z-50 p-2 divide-y divide-gray-100">
                <div className="p-2">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
                    Manage Dashboard
                  </span>
                  <div className="flex items-center gap-2 p-1.5 bg-neutral-50 rounded-lg">
                    <div className="w-7 h-7 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-xs uppercase">
                      {currentRole[0]}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-neutral-800 capitalize leading-none mb-0.5">{currentRole} Profile</p>
                      <span className={`text-[9px] font-medium font-mono px-1.5 py-0.2 rounded-full ${getRoleBadgeColor(currentRole)}`}>
                        {currentRole} Mode
                      </span>
                    </div>
                  </div>
                </div>

                {/* ROLE SWITCHERS */}
                <div className="py-2 space-y-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block px-2 mb-1">
                    Switch App Workspace
                  </span>
                  <button
                    onClick={() => {
                      onChangeRole("customer");
                      setShowAccountDropdown(false);
                    }}
                    className={`w-full flex items-center gap-2 px-2.5 py-1.5 text-xs rounded-lg transition-colors text-left ${
                      currentRole === "customer" ? "bg-emerald-50 text-emerald-800 font-bold" : "text-gray-700 hover:bg-neutral-50"
                    }`}
                  >
                    <User className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Customer Marketplace</span>
                  </button>
                  <button
                    onClick={() => {
                      onChangeRole("vendor");
                      setShowAccountDropdown(false);
                    }}
                    className={`w-full flex items-center gap-2 px-2.5 py-1.5 text-xs rounded-lg transition-colors text-left ${
                      currentRole === "vendor" ? "bg-orange-50 text-orange-700 font-bold" : "text-gray-700 hover:bg-neutral-50"
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                    <span>Vendor Portal</span>
                  </button>
                  <button
                    onClick={() => {
                      onChangeRole("admin");
                      setShowAccountDropdown(false);
                    }}
                    className={`w-full flex items-center gap-2 px-2.5 py-1.5 text-xs rounded-lg transition-colors text-left ${
                      currentRole === "admin" ? "bg-neutral-950 text-yellow-500 font-bold" : "text-gray-700 hover:bg-neutral-50"
                    }`}
                  >
                    <LayoutDashboard className="w-3.5 h-3.5 text-orange-400" />
                    <span>Admin Controls</span>
                  </button>
                </div>

                {/* LOGOUT */}
                {onLogout && (
                  <div className="pt-1.5">
                    <button
                      onClick={() => {
                        onLogout();
                        setShowAccountDropdown(false);
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-lg font-semibold transition-colors text-left"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Log Out Session</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* HELP CENTER & M-PESA GUIDE DROPDOWN */}
          <div className="relative">
            <button
              onClick={() => {
                setShowHelpDropdown(!showHelpDropdown);
                setShowAccountDropdown(false);
                setShowNotifications(false);
              }}
              className="flex items-center gap-1 px-2.5 py-2 text-xs font-semibold text-neutral-700 bg-neutral-50 rounded-lg hover:bg-neutral-100 border border-gray-250 transition-colors"
            >
              <HelpCircle className="w-4 h-4 text-blue-500" />
              <span>Help</span>
              <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform ${showHelpDropdown ? "rotate-180" : ""}`} />
            </button>

            {showHelpDropdown && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 shadow-xl rounded-xl z-50 p-2.5 space-y-2">
                <h4 className="text-xs font-bold text-gray-800 border-b pb-1">Wanta Commerce Guide</h4>
                <div className="space-y-2 text-[11px] text-gray-600">
                  <div className="flex items-start gap-1.5">
                    <Wallet className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-neutral-800">1. Lipa Na M-Pesa Instructions</p>
                      <p className="text-gray-500 leading-snug">Go to M-Pesa &gt; Lipa Na M-Pesa &gt; Paybill. Business No: 247 247, Account: 628766. Confirm with code.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-neutral-800">2. Customer Protection</p>
                      <p className="text-gray-500 leading-snug">All payments are safely stored in trust. 7-day unconditional refunds if issues crop up.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <BookOpen className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-neutral-800">3. Wantalian Express tag</p>
                      <p className="text-gray-500 leading-snug">Look for the "⚡ Express" tag on products for guaranteed 24-hour dispatch.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-1.5 pt-1 border-t">
                    <PhoneCall className="w-3.5 h-3.5 text-neutral-400 shrink-0 mt-0.5" />
                    <span className="text-neutral-500">Care Center: +254 700 829560</span>
                  </div>
                  <div className="pt-2 border-t flex flex-col">
                    <button
                      onClick={() => {
                        setShowHelpDropdown(false);
                        if (onOpenContactModal) onOpenContactModal();
                      }}
                      className="w-full flex items-center justify-center gap-1.5 py-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-black text-[10.5px] tracking-wide rounded-lg transition-all shadow-sm hover:shadow-orange-500/10 cursor-pointer active:scale-95 uppercase"
                    >
                      <Mail className="w-3.5 h-3.5 text-white animate-pulse" />
                      <span>Contact Formspree Inbox</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ACTIVE STATUS NOTIFICATIONS dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowAccountDropdown(false);
                setShowHelpDropdown(false);
                if (!showNotifications && unreadCount > 0) {
                  onMarkNotificationsRead();
                }
              }}
              className="relative p-2 text-neutral-650 bg-neutral-50 hover:bg-neutral-100 rounded-full transition-colors border border-gray-200 cursor-pointer"
              aria-label="View notifications"
            >
              <Bell className="w-4.5 h-4.5 text-gray-700" />
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-orange-600 text-[10px] font-mono font-bold text-white flex items-center justify-center border border-white animate-bounce">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 max-h-[420px] overflow-y-auto bg-white border border-gray-200 shadow-xl rounded-xl z-50 p-2 divide-y divide-gray-100 animate-fade-in">
                <div className="flex items-center justify-between px-2.5 py-1.5">
                  <span className="text-xs font-bold text-gray-900">Push Notifications Feed</span>
                  {unreadCount > 0 && (
                    <span className="text-[9px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded">
                      {unreadCount} UNREAD STATUSES
                    </span>
                  )}
                </div>
                
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-gray-400 font-medium">
                    No active updates right now.
                  </div>
                ) : (
                  notifications.map((notif) => {
                    const isAlert = notif.title.includes("Alert") || notif.title.includes("Warning");
                    return (
                      <div key={notif.id} className={`p-2.5 space-y-1 hover:bg-neutral-50 transition-colors ${notif.status === "unread" ? "bg-orange-50/20" : ""}`}>
                        <div className="flex items-start gap-2 justify-between">
                          <div className="flex items-center gap-1.5">
                            {isAlert ? (
                              <AlertTriangle className="w-3.5 h-3.5 text-orange-500 shrink-0 animate-pulse" />
                            ) : (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            )}
                            <span className="text-xs font-bold text-gray-900">{notif.title}</span>
                          </div>
                          <span className="text-[9px] text-gray-400 font-mono">
                            {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-[11px] leading-relaxed text-gray-600">{notif.message}</p>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>

          {/* DESKTOP SHOPPING CART BUTTON */}
          {currentRole === "customer" && (
            <button
              onClick={onOpenCart}
              className="hidden md:flex items-center gap-2 p-2 px-3 text-neutral-800 bg-orange-100 hover:bg-orange-200 border border-orange-200 rounded-lg font-bold text-xs transition-colors cursor-pointer"
            >
              <ShoppingCart className="w-4 h-4 text-orange-600" />
              <span>Cart</span>
              <span className="min-w-[18px] h-[18px] rounded-full bg-orange-600 text-[10px] font-bold text-white flex items-center justify-center px-1">
                {cartCount}
              </span>
            </button>
          )}

        </div>
      </div>
    </header>
  );
}
