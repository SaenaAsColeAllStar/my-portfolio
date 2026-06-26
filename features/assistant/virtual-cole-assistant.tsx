"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Brain, 
  Terminal as TerminalIcon, 
  Send, 
  Sparkles, 
  Loader2, 
  RefreshCw, 
  X, 
  MessageSquare,
  HelpCircle,
  Copy,
  Trash2
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface VirtualColeAssistantProps {
  onProjectSelect?: (slug: string) => void;
  onArticleSelect?: (slug: string) => void;
  isFloatingModal?: boolean; // Set true to render as a floating spotlight modal
  onCloseModal?: () => void;
}

const SUGGESTED_QUERIES = [
  {
    label: "Distributed Cognitive Router",
    query: "Tell me about the Distributed Cognitive Semantic Router project and its latency metrics.",
  },
  {
    label: "Handling Database Lockout",
    query: "How did Cole solve SQLite write-lockout and SQLITE_BUSY errors in D1?",
  },
  {
    label: "Professional Trajectory",
    query: "What was Cole working on in 2025 and 2026? Give a structured summary of roles.",
  },
  {
    label: "Technical Architecture Stack",
    query: "What is the hosting, edge infrastructure, and database stack powering Cole.dev?",
  },
];

export default function VirtualColeAssistant({
  onProjectSelect,
  onArticleSelect,
  isFloatingModal = false,
  onCloseModal
}: VirtualColeAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "System online. I am Virtual Cole, the digital mind of Cole, a world-class AI and Systems Engineer.\n\nI am connected directly to Cole's verified project blueprints, technical essays, and chronology logs. Interrogate my architecture or inquire about system specifications.\n\nType a query below, or choose a suggested exploration module.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Spotlight Modal Toggle States (Cmd+J / Ctrl+J)
  const [isSpotlightOpen, setIsSpotlightOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the bottom of the conversation
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, isStreaming]);

  // Global Keyboard Shortcut (Cmd+J / Ctrl+J) to toggle floating spotlight modal
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "j") {
        e.preventDefault();
        if (isFloatingModal && onCloseModal) {
          onCloseModal();
        } else {
          setIsSpotlightOpen((prev) => !prev);
        }
      }
      if (e.key === "Escape" && isSpotlightOpen) {
        setIsSpotlightOpen(false);
      }
    };
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [isFloatingModal, onCloseModal, isSpotlightOpen]);

  // Trigger RAG streaming inference
  const handleSend = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed || isLoading || isStreaming) return;

    setError(null);
    setInput("");
    setIsLoading(true);

    const userMessage: Message = {
      id: `msg_${Date.now()}_u`,
      role: "user",
      content: trimmed,
    };

    setMessages((prev) => [...prev, userMessage]);

    // Setup streaming placeholder message
    const assistantMessageId = `msg_${Date.now()}_a`;
    
    try {
      const response = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error ${response.status}`);
      }

      // Stop loading spinner and start dynamic token streaming
      setIsLoading(false);
      setIsStreaming(true);

      // Read chunk-by-chunk stream
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = "";

      // Enqueue streaming placeholder
      setMessages((prev) => [
        ...prev,
        {
          id: assistantMessageId,
          role: "assistant",
          content: "",
        },
      ]);

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          accumulatedText += chunk;

          // Update message content in real-time
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessageId
                ? { ...msg, content: accumulatedText }
                : msg
            )
          );
        }
      }
    } catch (err: any) {
      console.error("Assistant chat error:", err);
      setError(err.message || "Failed to synchronise response with the edge brain.");
      // Remove placeholder message if error occurs
      setMessages((prev) => prev.filter((m) => m.id !== assistantMessageId));
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
    }
  };

  // Reset conversation to initial welcome
  const handleClearHistory = () => {
    if (confirm("Are you sure you want to reset the AI assistant conversation history?")) {
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content: "System online. I am Virtual Cole, the digital mind of Cole, a world-class AI and Systems Engineer.\n\nI am connected directly to Cole's verified project blueprints, technical essays, and chronology logs. Interrogate my architecture or inquire about system specifications.\n\nType a query below, or choose a suggested exploration module.",
        },
      ]);
      setError(null);
    }
  };

  // Copy response utility
  const handleCopyMessage = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  // Parses response text to convert custom tags like [Project: slug] or [Article: slug] into live, clickable UI badges
  const renderMessageContent = (content: string) => {
    if (!content) return null;

    const regex = /\[(Project|Article|Timeline):\s*([^\]]+)\]/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(content)) !== null) {
      const matchIndex = match.index;
      if (matchIndex > lastIndex) {
        parts.push(content.substring(lastIndex, matchIndex));
      }

      const type = match[1];
      const slug = match[2].trim();

      parts.push(
        <button
          key={`chip_${matchIndex}`}
          onClick={() => {
            if (type === "Project" && onProjectSelect) {
              onProjectSelect(slug);
            } else if (type === "Article" && onArticleSelect) {
              onArticleSelect(slug);
            }
          }}
          className="inline-flex items-center gap-1 mx-1 px-2 py-0.5 bg-gold/10 hover:bg-gold/20 border border-gold/20 text-gold text-[10px] font-mono rounded font-medium transition-all duration-150 cursor-pointer hover:-translate-y-0.5"
          title={`View ${type}: ${slug}`}
        >
          <Sparkles className="w-3 h-3 text-gold animate-pulse" />
          <span>
            {type.toUpperCase()}: {slug.replace(/-/g, " ")}
          </span>
        </button>
      );

      lastIndex = regex.lastIndex;
    }

    if (lastIndex < content.length) {
      parts.push(content.substring(lastIndex));
    }

    return (
      <div className="space-y-2.5 font-sans text-xs leading-relaxed text-text-mute">
        {parts.map((part, index) => {
          if (typeof part !== "string") {
            return <React.Fragment key={index}>{part}</React.Fragment>;
          }

          const lines = part.split("\n");
          return lines.map((line, lineIdx) => {
            const trimmedLine = line.trim();
            if (!trimmedLine) {
              return <div key={`${index}_${lineIdx}`} className="h-1.5" />;
            }

            if (trimmedLine.startsWith("### ")) {
              return (
                <h4 key={`${index}_${lineIdx}`} className="font-sans font-semibold text-foreground text-xs mt-3 mb-1.5 flex items-center gap-1.5 select-none">
                  <span className="w-1 h-1 bg-gold rounded-full" />
                  {trimmedLine.replace("### ", "")}
                </h4>
              );
            }
            if (trimmedLine.startsWith("## ")) {
              return (
                <h3 key={`${index}_${lineIdx}`} className="font-sans font-semibold text-foreground text-sm mt-4 mb-2 border-b border-neutral-800 pb-1 select-none">
                  {trimmedLine.replace("## ", "")}
                </h3>
              );
            }

            if (trimmedLine.startsWith("- ") || trimmedLine.startsWith("* ")) {
              return (
                <ul key={`${index}_${lineIdx}`} className="list-disc pl-4 space-y-1 my-1">
                  <li>
                    {formatBoldAndMono(trimmedLine.substring(2))}
                  </li>
                </ul>
              );
            }

            return (
              <p key={`${index}_${lineIdx}`}>
                {formatBoldAndMono(line)}
              </p>
            );
          });
        })}
      </div>
    );
  };

  const formatBoldAndMono = (text: string) => {
    const boldRegex = /\*\*([^*]+)\*\*/g;
    const monoRegex = /`([^`]+)`/g;

    let parts: (string | React.ReactNode)[] = [text];

    parts = parts.flatMap((part) => {
      if (typeof part !== "string") return part;
      const subParts = [];
      let lastIdx = 0;
      let m;
      while ((m = boldRegex.exec(part)) !== null) {
        if (m.index > lastIdx) {
          subParts.push(part.substring(lastIdx, m.index));
        }
        subParts.push(<strong key={`b_${m.index}`} className="font-semibold text-foreground">{m[1]}</strong>);
        lastIdx = boldRegex.lastIndex;
      }
      if (lastIdx < part.length) {
        subParts.push(part.substring(lastIdx));
      }
      return subParts;
    });

    parts = parts.flatMap((part) => {
      if (typeof part !== "string") return part;
      const subParts = [];
      let lastIdx = 0;
      let m;
      while ((m = monoRegex.exec(part)) !== null) {
        if (m.index > lastIdx) {
          subParts.push(part.substring(lastIdx, m.index));
        }
        subParts.push(
          <code key={`m_${m.index}`} className="font-mono text-[9.5px] bg-neutral-900 border border-neutral-800 text-gold px-1 py-0.5 rounded">
            {m[1]}
          </code>
        );
        lastIdx = monoRegex.lastIndex;
      }
      if (lastIdx < part.length) {
        subParts.push(part.substring(lastIdx));
      }
      return subParts;
    });

    return parts;
  };

  // Render Core Assistant Container
  const assistantConsole = (
    <div className="bg-surface text-foreground rounded-large border border-border-strong shadow-2xl flex flex-col h-[500px] overflow-hidden select-none">
      {/* Console Header */}
      <div className="flex items-center justify-between border-b border-border-strong px-5 py-3 text-xs font-mono text-text-mute bg-surface-alt/40 select-none">
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-gold" />
          <span className="font-semibold tracking-wider text-[10px]">VIRTUAL_COLE_CORE_V1.6</span>
        </div>
        <div className="flex items-center gap-4">
          {/* Reset button */}
          {messages.length > 1 && (
            <button 
              onClick={handleClearHistory}
              className="hover:text-red-500 p-0.5 border border-transparent hover:border-border-strong hover:bg-surface-alt rounded transition-all cursor-pointer"
              title="Reset Conversation"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
          <div className="flex items-center gap-1.5 border-l border-border-strong pl-4">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[9px] text-emerald-500 uppercase font-semibold">Grounded</span>
          </div>
        </div>
      </div>

      {/* Message Scroll Chamber */}
      <div
        ref={scrollContainerRef}
        className="flex-grow overflow-y-auto px-5 py-4 space-y-4 scrollbar-thin select-text selection:bg-gold/15"
      >
        <AnimatePresence initial={false}>
          {messages.map((m) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className={`flex flex-col max-w-[85%] ${
                m.role === "user" ? "ml-auto items-end" : "mr-auto items-start"
              }`}
            >
              {/* Sender Tag */}
              <span className="text-[8.5px] font-mono text-text-tech mb-1 tracking-wider uppercase font-bold select-none">
                {m.role === "user" ? "visitor_query" : "virtual_cole"}
              </span>

              {/* Message Bubble */}
              <div
                className={`p-3.5 rounded-large relative group ${
                  m.role === "user"
                    ? "bg-gold/10 text-foreground rounded-tr-none border border-gold/30"
                    : "bg-surface-alt border border-border-strong rounded-tl-none"
                }`}
              >
                {m.role === "user" ? (
                  <p className="text-xs leading-relaxed whitespace-pre-wrap font-sans">{m.content}</p>
                ) : (
                  renderMessageContent(m.content)
                )}

                {/* Copy helper */}
                {m.role === "assistant" && m.content && (
                  <button 
                    onClick={() => handleCopyMessage(m.content)}
                    className="absolute bottom-1 right-2 opacity-0 group-hover:opacity-100 p-1 bg-surface border border-border-strong text-text-mute hover:text-gold rounded transition-all cursor-pointer select-none"
                    title="Copy Text"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Loading Skeletons */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-start max-w-[80%]"
          >
            <span className="text-[8.5px] font-mono text-text-tech mb-1 uppercase font-bold">
              virtual_cole
            </span>
            <div className="bg-surface-alt border border-border-strong rounded-large rounded-tl-none p-3.5 flex items-center gap-3">
              <Loader2 className="w-3.5 h-3.5 text-gold animate-spin" />
              <span className="text-[10px] font-mono text-text-mute animate-pulse">Running semantic inference pipelines...</span>
            </div>
          </motion.div>
        )}

        {/* Error Re-try Banner */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-3 bg-red-500/10 dark:bg-red-950/20 border border-red-500/20 dark:border-red-900/25 rounded-medium text-red-600 dark:text-red-200 text-[11px] flex items-center gap-2 font-sans"
          >
            <RefreshCw className="w-3.5 h-3.5 text-red-500 animate-spin flex-shrink-0" />
            <div className="flex-grow leading-tight">
              <p className="font-semibold font-mono uppercase text-[8px] text-red-500 dark:text-red-400 tracking-wider">Transmission Blocked</p>
              <p className="text-neutral-600 dark:text-neutral-400 text-[10.5px] mt-0.5">{error}</p>
            </div>
            <button
              onClick={() => handleSend(messages[messages.length - 1].content)}
              className="px-2.5 py-1 bg-red-500/20 dark:bg-red-900/30 hover:bg-red-500/30 dark:hover:bg-red-900/50 border border-red-500/10 dark:border-red-800/20 rounded font-mono text-[9px] uppercase tracking-wider text-red-700 dark:text-white transition-all cursor-pointer"
            >
              Retry
            </button>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Explorations */}
      <AnimatePresence>
        {messages.length === 1 && !isLoading && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="px-5 pb-3.5 border-t border-border-strong pt-3.5 bg-surface-alt/20"
          >
            <p className="text-[8.5px] font-mono text-text-tech uppercase tracking-wider font-bold mb-2 flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5 text-gold" />
              <span>Suggested Explorations:</span>
            </p>
            <div className="grid grid-cols-2 gap-2">
              {SUGGESTED_QUERIES.map((sq, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(sq.query)}
                  className="p-2.5 bg-surface-alt/40 hover:bg-surface-alt border border-border-strong rounded-medium text-left transition-all duration-150 cursor-pointer text-xs text-foreground"
                >
                  <p className="font-mono text-[9.5px] text-gold font-semibold truncate">{sq.label}</p>
                  <p className="text-[9.5px] text-text-mute truncate mt-0.5 font-sans">{sq.query}</p>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Control Deck */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend(input);
        }}
        className="flex gap-2 border-t border-border-strong p-4 bg-surface-alt/20"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={isLoading || isStreaming ? "Inference pipeline streaming..." : "Ask Virtual Cole about systems or biography..."}
          className="flex-grow bg-background border border-border-strong rounded-medium px-4 py-2.5 text-xs text-foreground focus:outline-none focus:border-gold font-sans transition-colors placeholder-text-tech/60 disabled:opacity-45"
          disabled={isLoading || isStreaming}
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading || isStreaming}
          className="bg-gold hover:bg-gold/90 text-black rounded-medium px-4 py-2 text-xs font-mono transition-colors font-semibold flex items-center justify-center gap-1.5 disabled:opacity-40"
        >
          {isLoading || isStreaming ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <>
              <Send className="w-3 h-3" />
              <span>RUN</span>
            </>
          )}
        </button>
      </form>
    </div>
  );

  // If floating modal mode is selected (Command overlay), render modal wrapper
  if (isFloatingModal) {
    return (
      <div className="fixed inset-0 bg-[#000000]/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl relative">
          {/* Circular close button */}
          <button 
            onClick={onCloseModal}
            className="absolute -top-12 right-0 p-2 bg-neutral-900 border border-neutral-800 hover:border-red-500 hover:text-red-500 rounded-full text-text-mute transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
          {assistantConsole}
        </div>
      </div>
    );
  }

  // SPOTLIGHT FLOATING MODAL OVERLAY (Toggled by Cmd+J globally if rendered in layout)
  return (
    <>
      {/* Base Inline Console */}
      {assistantConsole}

      {/* Spotlight command overlay (Cmd+J) */}
      <AnimatePresence>
        {isSpotlightOpen && (
          <div className="fixed inset-0 bg-[#000000]/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              className="w-full max-w-2xl relative"
            >
              <button 
                onClick={() => setIsSpotlightOpen(false)}
                className="absolute -top-12 right-0 p-2 bg-neutral-900 border border-neutral-800 hover:border-red-500 hover:text-red-500 rounded-full text-text-mute transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
              {assistantConsole}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
