"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Brain, Terminal, Send, ArrowDown, Sparkles, Loader2, RefreshCw } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface VirtualColeAssistantProps {
  onProjectSelect?: (slug: string) => void;
  onArticleSelect?: (slug: string) => void;
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
}: VirtualColeAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Welcome. I am Virtual Cole, the digital mind of Cole, a world-class AI and Systems Engineer.\n\nI am connected directly to Cole's verified project blueprints, technical essays, and chronology logs. Interrogate my architecture or inquire about system specifications.\n\nType a query below, or choose a suggested exploration module.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the bottom of the conversation
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed || isLoading) return;

    setError(null);
    setInput("");
    const userMessage: Message = {
      id: `msg_${Date.now()}_u`,
      role: "user",
      content: trimmed,
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
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

      const data = await response.json();
      
      setMessages((prev) => [
        ...prev,
        {
          id: `msg_${Date.now()}_a`,
          role: "assistant",
          content: data.text,
        },
      ]);
    } catch (err: any) {
      console.error("Assistant chat error:", err);
      setError(err.message || "Failed to synchronise response with the edge brain.");
    } finally {
      setIsLoading(false);
    }
  };

  // Parses response text to convert custom tags like [Project: slug] or [Article: slug] into live, clickable UI badges
  const renderMessageContent = (content: string) => {
    if (!content) return null;

    // Split content by references like [Project: slug] or [Article: slug]
    const regex = /\[(Project|Article):\s*([^\]]+)\]/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(content)) !== null) {
      const matchIndex = match.index;
      // Add plain text before match
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
          className="inline-flex items-center gap-1 mx-1 px-2.5 py-0.5 bg-[#0070F3]/10 hover:bg-[#0070F3]/20 border border-[#0070F3]/20 text-[#0070F3] text-[10px] font-mono rounded-md font-semibold tracking-wider transition-all duration-200 cursor-pointer transform hover:-translate-y-0.5"
          title={`Expand ${type}: ${slug}`}
        >
          <Sparkles className="w-3 h-3 text-[#0070F3] animate-pulse" />
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

    // Format paragraphs and headers
    return (
      <div className="space-y-3 font-sans text-sm leading-relaxed text-gray-200">
        {parts.map((part, index) => {
          if (typeof part !== "string") {
            return <React.Fragment key={index}>{part}</React.Fragment>;
          }

          // Format line breaks into separate paragraphs/lists
          const lines = part.split("\n");
          return lines.map((line, lineIdx) => {
            const trimmedLine = line.trim();
            if (!trimmedLine) {
              return <div key={`${index}_${lineIdx}`} className="h-2" />;
            }

            // Headers
            if (trimmedLine.startsWith("### ")) {
              return (
                <h4 key={`${index}_${lineIdx}`} className="font-display font-medium text-white text-sm mt-4 mb-2 tracking-tight flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[#0070F3] rounded-full" />
                  {trimmedLine.replace("### ", "")}
                </h4>
              );
            }
            if (trimmedLine.startsWith("## ")) {
              return (
                <h3 key={`${index}_${lineIdx}`} className="font-display font-medium text-white text-base mt-5 mb-2 tracking-tight border-b border-white/5 pb-1">
                  {trimmedLine.replace("## ", "")}
                </h3>
              );
            }

            // Unordered list item
            if (trimmedLine.startsWith("- ") || trimmedLine.startsWith("* ")) {
              return (
                <ul key={`${index}_${lineIdx}`} className="list-disc pl-5 space-y-1 my-1">
                  <li className="text-gray-300">
                    {formatBoldAndMono(trimmedLine.substring(2))}
                  </li>
                </ul>
              );
            }

            // Monospace block (mock for code fragments)
            if (trimmedLine.startsWith("```")) {
              return null; // Ignore simple markers for code blocks to avoid clutter
            }

            return (
              <p key={`${index}_${lineIdx}`} className="text-gray-300">
                {formatBoldAndMono(line)}
              </p>
            );
          });
        })}
      </div>
    );
  };

  // Helper to format bold **text** and monospace `code` inside strings
  const formatBoldAndMono = (text: string) => {
    const boldRegex = /\*\*([^*]+)\*\*/g;
    const monoRegex = /`([^`]+)`/g;

    let parts: (string | React.ReactNode)[] = [text];

    // Handle bold parsing
    parts = parts.flatMap((part) => {
      if (typeof part !== "string") return part;
      const subParts = [];
      let lastIdx = 0;
      let m;
      while ((m = boldRegex.exec(part)) !== null) {
        if (m.index > lastIdx) {
          subParts.push(part.substring(lastIdx, m.index));
        }
        subParts.push(<strong key={`b_${m.index}`} className="font-semibold text-white">{m[1]}</strong>);
        lastIdx = boldRegex.lastIndex;
      }
      if (lastIdx < part.length) {
        subParts.push(part.substring(lastIdx));
      }
      return subParts;
    });

    // Handle monospace parsing
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
          <code key={`m_${m.index}`} className="font-mono text-xs bg-white/10 text-[#0070F3] px-1 py-0.5 rounded">
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

  return (
    <div className="bg-[#111111] text-[#E2E8F0] rounded-2xl border border-white/10 shadow-2xl flex flex-col h-[520px] overflow-hidden">
      {/* Console Header */}
      <div className="flex items-center justify-between border-b border-white/[0.08] px-5 py-3.5 text-xs font-mono text-gray-400 bg-black/40">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-[#0070F3]" />
          <span className="font-bold tracking-wider text-[11px]">COLE_MIND_RECONSTRUCTOR_V1.5</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[10px] text-green-400 uppercase tracking-wider font-semibold">Edge Grounded</span>
        </div>
      </div>

      {/* Message Scroll Chamber */}
      <div
        ref={scrollContainerRef}
        className="flex-grow overflow-y-auto px-5 py-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10"
      >
        <AnimatePresence initial={false}>
          {messages.map((m) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className={`flex flex-col max-w-[85%] ${
                m.role === "user" ? "ml-auto items-end" : "mr-auto items-start"
              }`}
            >
              {/* Sender Tag */}
              <span className="text-[10px] font-mono text-gray-500 mb-1 tracking-wider uppercase font-semibold">
                {m.role === "user" ? "visitor_payload" : "virtual_cole"}
              </span>

              {/* Message Bubble */}
              <div
                className={`p-4 rounded-2xl ${
                  m.role === "user"
                    ? "bg-[#0070F3] text-white rounded-tr-none shadow-md shadow-[#0070F3]/10"
                    : "bg-white/5 border border-white/[0.05] rounded-tl-none"
                }`}
              >
                {m.role === "user" ? (
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{m.content}</p>
                ) : (
                  renderMessageContent(m.content)
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-start max-w-[80%]"
          >
            <span className="text-[10px] font-mono text-gray-500 mb-1 uppercase tracking-wider font-semibold">
              virtual_cole
            </span>
            <div className="bg-white/5 border border-white/[0.05] rounded-2xl rounded-tl-none p-4 flex items-center gap-3">
              <Loader2 className="w-4 h-4 text-[#0070F3] animate-spin" />
              <span className="text-xs font-mono text-gray-400 animate-pulse">Running semantic inference pipelines...</span>
            </div>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-3 bg-red-950/40 border border-red-900/30 rounded-xl text-red-200 text-xs flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4 text-red-400 animate-spin" />
            <div className="flex-grow">
              <p className="font-semibold font-mono uppercase tracking-wider text-[10px]">Transmission Blocked</p>
              <p className="text-gray-400 mt-0.5">{error}</p>
            </div>
            <button
              onClick={() => handleSend(messages[messages.length - 1].content)}
              className="px-2.5 py-1 bg-red-900/40 hover:bg-red-900/60 border border-red-800/30 rounded-lg text-[10px] font-mono uppercase tracking-wider text-white transition-colors"
            >
              Retry
            </button>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompt Rails */}
      <AnimatePresence>
        {messages.length === 1 && !isLoading && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="px-5 pb-3 border-t border-white/[0.04] pt-3 bg-black/20"
          >
            <p className="text-[10px] font-mono text-gray-500 uppercase tracking-wider font-semibold mb-2">Suggested Interrogations:</p>
            <div className="grid grid-cols-2 gap-2">
              {SUGGESTED_QUERIES.map((sq, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(sq.query)}
                  className="p-2 bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.06] rounded-xl text-left transition-all duration-200 cursor-pointer text-xs"
                >
                  <p className="font-mono text-[10px] text-[#0070F3] font-semibold">{sq.label}</p>
                  <p className="text-[10px] text-gray-400 truncate mt-0.5">{sq.query}</p>
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
        className="flex gap-2 border-t border-white/[0.08] p-4 bg-black/40"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={isLoading ? "Inference processor busy..." : "Ask Virtual Cole about architectural node mappings..."}
          className="flex-grow bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#0070F3] font-sans transition-colors placeholder-gray-500 disabled:opacity-50"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="bg-[#0070F3] hover:bg-[#0070F3]/90 text-white rounded-xl px-4 py-2 text-xs font-mono transition-colors font-medium flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:hover:bg-[#0070F3]"
        >
          {isLoading ? (
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
}
