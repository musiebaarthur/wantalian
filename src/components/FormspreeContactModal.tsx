import React, { useState, useEffect } from "react";
import { 
  X, 
  Send, 
  CheckCircle, 
  AlertTriangle, 
  ExternalLink, 
  Settings, 
  HelpCircle, 
  FileText, 
  User, 
  Mail, 
  Hash, 
  Sparkles,
  RefreshCw
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface FormspreeContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserEmail?: string;
  defaultFormId?: string;
}

export default function FormspreeContactModal({
  isOpen,
  onClose,
  currentUserEmail = "",
  defaultFormId = "xgobwdpr" // A pre-configured Formspree form ID to allow instant connect submissions
}: FormspreeContactModalProps) {
  // Use localStorage to persist the form ID the user wishes to connect
  const [formId, setFormId] = useState<string>(() => {
    const saved = localStorage.getItem("wantalian_formspree_id");
    if (!saved || saved === "mnqzzvpy") {
      return defaultFormId;
    }
    return saved;
  });

  // State fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [inquiryType, setInquiryType] = useState("General Support");
  const [orderRef, setOrderRef] = useState("");
  const [message, setMessage] = useState("");
  
  // Status states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  
  // Settings toggle
  const [showConfig, setShowConfig] = useState(false);

  // Set initial email from current user if they are logged in
  useEffect(() => {
    if (currentUserEmail && !email) {
      setEmail(currentUserEmail);
    }
  }, [currentUserEmail]);

  // Persist formId modifications
  const handleSaveFormId = (newId: string) => {
    const cleaned = newId.trim();
    setFormId(cleaned);
    localStorage.setItem("wantalian_formspree_id", cleaned);
  };

  const resetForm = () => {
    setName("");
    // keep email
    setOrderRef("");
    setMessage("");
    setSubmitSuccess(false);
    setSubmitError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      setSubmitError("Please fill out all required fields.");
      return;
    }

    if (!formId.trim()) {
      setSubmitError("Please configure a Formspree Form ID or Endpoint first.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    // Formspree supports both complete endpoint URLs and 8-character form IDs
    const endpointUrl = formId.startsWith("http") 
      ? formId 
      : `https://formspree.io/f/${formId}`;

    try {
      const response = await fetch(endpointUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          inquiryType: inquiryType,
          orderReference: orderRef.trim() || "N/A",
          message: message.trim(),
          _subject: `[Wantalian Store Hub] ${inquiryType} from ${name}`,
          submittedAt: new Date().toISOString()
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitSuccess(true);
        setSubmitError(null);
      } else {
        setSubmitError(
          data.error || 
          "Formspree server rejected the entry. Please check if your Form ID is validated and active."
        );
      }
    } catch (err: any) {
      console.error("Formspree submission error", err);
      setSubmitError("Network connectivity failure. Unable to contact Formspree servers. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-neutral-900/60 backdrop-blur-xs cursor-pointer"
        />

        {/* Modal Sheet */}
        <motion.div 
          initial={{ scale: 0.95, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 15 }}
          className="relative bg-white border border-gray-150 rounded-3xl shadow-2xl overflow-hidden w-full max-w-lg z-10 flex flex-col max-h-[90vh]"
        >
          {/* HEADER BAR */}
          <div className="bg-gradient-to-r from-neutral-900 via-neutral-850 to-neutral-900 text-white px-6 py-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="bg-orange-500 p-1.5 rounded-lg text-white">
                <Send className="w-4 h-4 transform -rotate-12" />
              </div>
              <div>
                <h3 className="text-sm font-black tracking-tight flex items-center gap-1.5 uppercase">
                  <span>Formspree Contact Desk</span>
                  <Sparkles className="w-3.5 h-3.5 text-orange-400" />
                </h3>
                <p className="text-[10px] text-gray-400 font-mono tracking-wide">
                  SECURE EMAIL FORM TRANSMISSION
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowConfig(!showConfig)}
                title="Configure Formspree Connection Settings"
                className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                  showConfig 
                    ? "bg-orange-500/20 border-orange-500 text-orange-400" 
                    : "hover:bg-white/10 border-transparent text-gray-300 hover:text-white"
                }`}
              >
                <Settings className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-white/10 border border-transparent hover:border-white/10 rounded-lg text-gray-300 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="overflow-y-auto p-6 flex-1 space-y-5">
            {/* IN-APP CONFIGURATION PANEL */}
            <AnimatePresence>
              {showConfig && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="bg-orange-50/50 border border-orange-200/60 rounded-2xl p-4 space-y-3.5 text-xs text-orange-950 overflow-hidden"
                >
                  <div className="flex items-start gap-2.5">
                    <HelpCircle className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="font-extrabold text-orange-900 uppercase tracking-tight">Formspree Connection Settings</p>
                      <p className="text-[11px] leading-relaxed text-orange-850">
                        Customize what email inbox receives your submissions. Paste your personal <strong>Formspree Form ID</strong> (e.g. <code>xoqzzrpb</code>) or absolute POST URL below.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="formspreeIdInput" className="text-[9px] uppercase font-mono tracking-wider font-bold text-orange-800 block">
                      Target Form ID or Endpoint URL
                    </label>
                    <div className="flex gap-2">
                      <input
                        id="formspreeIdInput"
                        type="text"
                        placeholder="e.g. xoqzzrpb"
                        value={formId}
                        onChange={(e) => handleSaveFormId(e.target.value)}
                        className="flex-1 px-3 py-1.5 text-xs text-neutral-800 bg-white border border-orange-200 rounded-lg focus:outline-hidden focus:border-orange-500 font-mono"
                      />
                      <button
                        onClick={() => handleSaveFormId(defaultFormId)}
                        title="Revert to pre-configured Test Inbox"
                        className="px-2.5 py-1.5 rounded-lg border border-orange-200 hover:border-orange-355 text-orange-800 bg-white hover:bg-orange-50 text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-all shrink-0"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Use Demo</span>
                      </button>
                    </div>
                  </div>

                  <div className="bg-white/80 rounded-xl p-2.5 border border-orange-100 flex items-center justify-between text-[11px] font-medium text-orange-900">
                    <span>Need your own Formspree Inbox?</span>
                    <a 
                      href="https://formspree.io/" 
                      target="_blank" 
                      referrerPolicy="no-referrer" 
                      rel="noopener noreferrer" 
                      className="text-orange-600 hover:text-orange-700 font-bold flex items-center gap-1.5 transition-colors underline"
                    >
                      <span>Get Free ID</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {submitSuccess ? (
              /* SUCCESS SCREEN */
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-8 text-center space-y-4"
              >
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner-xs border border-emerald-205">
                  <CheckCircle className="w-10 h-10" />
                </div>
                <div className="space-y-1.5">
                  <h4 className="text-base font-black text-neutral-900 uppercase">Submission Dispatched!</h4>
                  <p className="text-xs text-gray-500 max-w-sm mx-auto leading-relaxed">
                    Your inquiry has been successfully transmitted via Formspree connection 
                    <strong className="font-bold text-gray-700 font-mono"> (ID: {formId})</strong>. 
                    The admin or vendor will receive your message in their designated email inbox shortly.
                  </p>
                </div>

                <div className="bg-gray-50 max-w-sm mx-auto p-4 border border-gray-100 rounded-2xl text-[11px] text-gray-500 text-left space-y-1 mt-4">
                  <p className="font-bold text-neutral-805 flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5 text-gray-400" />
                    Formspree Payload Summary:
                  </p>
                  <ul className="list-disc pl-4 space-y-0.5">
                    <li>Sender Name: <span className="font-semibold text-neutral-700">{name}</span></li>
                    <li>Reply Address: <span className="font-semibold text-neutral-700">{email}</span></li>
                    <li>Classification: <span className="font-semibold text-neutral-700">{inquiryType}</span></li>
                    {orderRef && <li>Order Reference: <span className="font-semibold text-neutral-700 font-mono">{orderRef}</span></li>}
                  </ul>
                </div>

                <div className="flex justify-center gap-3 pt-4">
                  <button
                    onClick={resetForm}
                    className="px-5 py-2 text-xs font-bold bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-all cursor-pointer"
                  >
                    Send Another Message
                  </button>
                  <button
                    onClick={onClose}
                    className="px-5 py-2 text-xs font-bold bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl transition-all cursor-pointer"
                  >
                    Dismiss Close
                  </button>
                </div>
              </motion.div>
            ) : (
              /* FORM ENTRY SHEET */
              <form onSubmit={handleSubmit} className="space-y-4">
                {submitError && (
                  <div className="bg-red-50 border border-red-100 text-red-700/90 text-xs p-3.5 rounded-xl flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <span>{submitError}</span>
                  </div>
                )}

                {/* TWO COLUMN */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-mono tracking-wider font-bold text-gray-400 block flex items-center gap-0.5">
                      <User className="w-3 h-3 text-gray-450" />
                      Your Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Arthur Musieba"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs text-gray-700 bg-gray-50 border border-gray-100 rounded-xl focus:outline-hidden focus:border-orange-500 focus:bg-white transition-all shadow-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-mono tracking-wider font-bold text-gray-400 block flex items-center gap-0.5">
                      <Mail className="w-3 h-3 text-gray-450" />
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="address@domain.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs text-gray-700 bg-gray-50 border border-gray-100 rounded-xl focus:outline-hidden focus:border-orange-500 focus:bg-white transition-all shadow-xs font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-mono tracking-wider font-bold text-gray-400 block">
                      Inquiry Classification <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={inquiryType}
                      onChange={(e) => setInquiryType(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs text-gray-700 bg-gray-50 border border-gray-105 rounded-xl focus:outline-hidden focus:border-orange-500 focus:bg-white transition-all cursor-pointer shadow-xs"
                    >
                      <option value="General Support">General Customer Care</option>
                      <option value="Order Issue & Returns">Order Issue &amp; Returns</option>
                      <option value="Billing & M-Pesa Code">Billing &amp; M-Pesa Codes</option>
                      <option value="Vendor Application">Vendor Account Help</option>
                      <option value="Retail Partnership">Retail Partnerships</option>
                      <option value="Technical Malfunction">Technical App Bug</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-mono tracking-wider font-bold text-gray-400 block flex items-center gap-0.5">
                      <Hash className="w-3 h-3 text-gray-450" />
                      Order Reference (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. ord-171542"
                      value={orderRef}
                      onChange={(e) => setOrderRef(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs text-gray-700 bg-gray-50 border border-gray-100 rounded-xl focus:outline-hidden focus:border-orange-500 focus:bg-white transition-all shadow-xs font-mono uppercase"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-mono tracking-wider font-bold text-gray-400 block">
                    Message Body Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Provide context regarding modular setups, setup inquiries, delivery details, workspace custom dimensions, or any partnership offers..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-3 py-2 text-xs text-gray-700 bg-gray-50 border border-gray-100 rounded-xl focus:outline-hidden focus:border-orange-500 focus:bg-white transition-all shadow-xs resize-none"
                  />
                </div>

                <div className="bg-gray-50/60 p-3 border border-gray-100 rounded-2xl flex items-center justify-between text-[11px] text-gray-450">
                  <span className="flex items-center gap-1.5 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Formspree integration parameters loaded
                  </span>
                  <span className="font-mono text-[10px] font-bold text-gray-500">f/{formId.substring(0, 8)}...</span>
                </div>

                {/* ACTIONS */}
                <div className="flex items-center justify-end gap-3 pt-2 shrink-0">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-5 py-2.5 rounded-xl hover:bg-neutral-50 text-neutral-650 font-bold text-xs ring-1 ring-neutral-200 transition-colors cursor-pointer"
                  >
                    Discard Close
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-extrabold text-xs tracking-wide rounded-xl shadow-md hover:shadow-orange-500/20 hover:scale-[1.02] transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:pointer-events-none"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin shrink-0" />
                        <span>Dispatching to Formspree...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Send Secure Message</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
