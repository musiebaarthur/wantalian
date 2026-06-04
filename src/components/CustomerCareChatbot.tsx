import React, { useState, useRef, useEffect } from "react";
import { 
  MessageSquare, 
  X, 
  Send, 
  Sparkles, 
  Headphones, 
  Loader2, 
  RefreshCw, 
  CornerDownLeft,
  Minimize2,
  Maximize2
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const QUICK_SUGGESTIONS = [
  "⚡ How do I pay using M-Pesa?",
  "📦 Do you deliver to my county?",
  "🔥 What is your best audio system?",
  "🛠️ What is your return policy?"
];

export default function CustomerCareChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Jambo! Karibu to **Wantalian Home Hub** Customer Care. 🇰🇪✨ I'm **Wanta**, your conversational workspace assistant.\n\nHow may I help you upgrade your interior modular system or desk setup today? Ask me about our premium catalogs, delivery counties, or Lipa na M-Pesa!",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const listEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to list end
  useEffect(() => {
    if (listEndRef.current) {
      listEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading, isOpen, isMinimized]);

  // Format markdown-like text to simple HTML nodes
  const renderMessageContent = (text: string) => {
    // Simple robust formatter
    const paragraphs = text.split("\n\n");
    return paragraphs.map((para, pIdx) => {
      // Split by bold patterns **text**
      const parts = para.split(/\*\*([^*]+)\*\*/g);
      const parsedElements = parts.map((part, idx) => {
        if (idx % 2 === 1) {
          return <strong key={idx} className="font-extrabold text-orange-600">{part}</strong>;
        }
        return part;
      });

      return (
        <p key={pIdx} className="text-xs text-gray-750 font-normal leading-relaxed mb-1.5 last:mb-0">
          {parsedElements}
        </p>
      );
    });
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      role: "user",
      content: text.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue("");
    setIsLoading(true);

    try {
      // Construct complete message log to provide context
      const chatLogs = [...messages, userMsg].map(m => ({
        role: m.role,
        content: m.content
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: chatLogs })
      });

      const data = await res.json();
      
      setMessages(prev => [
        ...prev,
        {
          id: `ast-${Date.now()}`,
          role: "assistant",
          content: data.text || "I apologize, but I received an empty response. How else may I assist you?",
          timestamp: new Date()
        }
      ]);
    } catch (err) {
      console.error("Chat error", err);
      setMessages(prev => [
        ...prev,
        {
          id: `ast-err-${Date.now()}`,
          role: "assistant",
          content: "Habari! My system is experiencing a minor connectivity hiccup, but feel free to pay using M-Pesa Buy Goods **Till Number 8295601** (Wantalian Home Hub) or ask about our hot Aura Soundbar Pro!",
          timestamp: new Date()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSendMessage(inputValue);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: "welcome-reset",
        role: "assistant",
        content: "Resetting system. Karibu! I'm ready to assist you. Ask me anything about our Kenyan county delivery networks or modular specifications!",
        timestamp: new Date()
      }
    ]);
  };

  return (
    <div className="fixed bottom-6 right-6 z-45 font-sans pointer-events-none">
      
      {/* TRIGGER FLOATING BUBBLE */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="pointer-events-auto flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-bold rounded-full shadow-2xl hover:shadow-emerald-600/30 transition-all duration-300 hover:scale-105 border border-emerald-500/30 group animate-slide-up cursor-pointer"
        >
          <div className="relative">
            <Headphones className="w-5 h-5 text-emerald-100 group-hover:rotate-12 transition-transform" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-orange-500 border border-emerald-600 animate-ping" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-orange-500 border border-emerald-600" />
          </div>
          <span className="text-xs tracking-wide">Need Help? Chat with Wanta</span>
        </button>
      )}

      {/* EXPANDED CHAT PORTAL */}
      {isOpen && (
        <div
          className={`pointer-events-auto bg-white border border-gray-200 rounded-3xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 w-80 sm:w-96 animate-slide-up ${
            isMinimized ? "h-14" : "h-[480px] max-h-[85vh]"
          }`}
        >
          {/* CHATBOX HEADER */}
          <div className="bg-gradient-to-r from-neutral-900 to-neutral-800 text-white px-4 py-3.5 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center relative">
                <Headphones className="w-4 h-4 text-white" />
                <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-400 border border-neutral-900" />
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <span className="text-xs font-black tracking-wide">Wanta Customer Care</span>
                  <Sparkles className="w-3 h-3 text-orange-400" />
                </div>
                <p className="text-[9px] text-emerald-400 font-mono tracking-wider uppercase">
                  ● Always Online (Kenyan Hub AI)
                </p>
              </div>
            </div>

            {/* WINDOW CONTROLS */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleResetChat}
                title="Clear Conversation Logs"
                className="p-1 hover:bg-white/10 rounded-lg transition-colors cursor-pointer text-gray-300 hover:text-white"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                title={isMinimized ? "Expand Chat" : "Minimize Chat"}
                className="p-1 hover:bg-white/10 rounded-lg transition-colors cursor-pointer text-gray-300 hover:text-white"
              >
                {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Close Dialog"
                className="p-1 hover:bg-white/10 rounded-lg transition-colors cursor-pointer text-gray-300 hover:text-red-500"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* CHAT CONTAINER BODY (Hides when minimized) */}
          {!isMinimized && (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/70 relative">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex items-start gap-2 max-w-[85%] ${
                      m.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                    }`}
                  >
                    {/* Avatar */}
                    {m.role === "assistant" && (
                      <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                        <span className="text-[9px] font-bold text-emerald-800">W</span>
                      </div>
                    )}

                    {/* Content Bubble */}
                    <div className="space-y-0.5">
                      <div
                        className={`p-3 rounded-2xl text-xs leading-relaxed ${
                          m.role === "user"
                            ? "bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-tr-none shadow-md"
                            : "bg-white border border-gray-200 text-gray-800 rounded-tl-none shadow-xs"
                        }`}
                      >
                        {m.role === "user" ? (
                          <p className="whitespace-pre-line">{m.content}</p>
                        ) : (
                          renderMessageContent(m.content)
                        )}
                      </div>
                      <span className="text-[8px] text-gray-400 block font-mono px-1">
                        {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))}

                {/* Loading indicator */}
                {isLoading && (
                  <div className="flex items-start gap-2 mr-auto max-w-[85%]">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 animate-spin">
                      <Loader2 className="w-3 h-3 text-emerald-600" />
                    </div>
                    <div className="p-3 bg-white border border-gray-200 rounded-2xl rounded-tl-none shadow-xs flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" />
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:0.2s]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                )}

                <div ref={listEndRef} />
              </div>

              {/* SUGGESTION PILLS SCROLL shrink-0 */}
              <div className="px-3 py-2 bg-white border-t border-gray-100 flex gap-1.5 overflow-x-auto scrollbar-none shrink-0 border-b border-gray-200">
                {QUICK_SUGGESTIONS.map((saj, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(saj.replace(/^[^\s]+\s+/, ""))}
                    className="whitespace-nowrap px-2.5 py-1 text-[10px] font-semibold bg-gray-50 hover:bg-emerald-50 text-gray-600 hover:text-emerald-800 border border-gray-200 hover:border-emerald-300 rounded-full transition-all cursor-pointer shadow-3xs shrink-0"
                  >
                    {saj}
                  </button>
                ))}
              </div>

              {/* INPUT ZONE shrink-0 */}
              <div className="p-3 bg-white border-t border-gray-200 shrink-0 flex items-center gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Uliza chochote..."
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-xs text-gray-700 placeholder-gray-400 focus:outline-none focus:border-emerald-600 focus:bg-white transition-all shadow-inner-xs"
                />
                <button
                  onClick={() => handleSendMessage(inputValue)}
                  disabled={!inputValue.trim() || isLoading}
                  className={`p-2 rounded-xl text-white transition-all shadow-md  ${
                    inputValue.trim() && !isLoading
                      ? "bg-emerald-600 hover:bg-emerald-700 cursor-pointer transform hover:scale-105"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </>
          )}
        </div>
      )}

    </div>
  );
}
