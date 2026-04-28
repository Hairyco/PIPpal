import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle,
  X,
  Send,
  Sparkles,
  Copy,
  Check,
  Loader2,
  Lock,
  ArrowRight,
  Bot,
} from 'lucide-react';
import { useAppContext } from './AppContext';

interface PIPAssistantProps {
  isVisible: boolean;
  hasPaid?: boolean;
  onUpgrade?: () => void;
}

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  isLoading?: boolean;
}

const INITIAL_MESSAGE: Message = {
  id: 'init',
  text: "Hi! I'm your PIP Assistant powered by AI. Ask me anything about PIP — eligibility, rates, assessments, appeals, or what to do after a decision. I'll give you personalised guidance based on your conditions.",
  sender: 'assistant',
};

const SUGGESTED_QUESTIONS = [
  'Am I likely to qualify for PIP?',
  'What happens at a PIP assessment?',
  'How do I challenge a PIP decision?',
  'What counts as evidence for PIP?',
];

export function PIPAssistant({
  isVisible,
  hasPaid = true,
  onUpgrade,
}: PIPAssistantProps) {
  const { medProfile } = useAppContext();
  const [isOpen, setIsOpen] = useState(false);
  const [showUpsell, setShowUpsell] = useState(false);
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [conversationHistory, setConversationHistory] = useState<{ role: string; content: string }[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [messages, isOpen]);

  if (!isVisible) return null;

  const handleButtonClick = () => {
    if (hasPaid) {
      setIsOpen(true);
    } else {
      setShowUpsell(true);
    }
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || isThinking) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: text.trim(),
      sender: 'user',
    };

    const loadingMessage: Message = {
      id: 'loading',
      text: '',
      sender: 'assistant',
      isLoading: true,
    };

    setMessages((prev) => [...prev, userMessage, loadingMessage]);
    setInputValue('');
    setIsThinking(true);

    const newHistory = [
      ...conversationHistory,
      { role: 'user', content: text.trim() },
    ];

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text.trim(),
          medProfile,
          conversationHistory: conversationHistory.slice(-10), // Last 5 exchanges
        }),
      });

      const data = await response.json();
      const reply = data.reply || 'Sorry, I could not generate a response. Please try again.';

      setConversationHistory([
        ...newHistory,
        { role: 'assistant', content: reply },
      ]);

      setMessages((prev) =>
        prev
          .filter((m) => m.id !== 'loading')
          .concat({
            id: Date.now().toString(),
            text: reply,
            sender: 'assistant',
          })
      );
    } catch (err) {
      // Fallback response if API fails
      setMessages((prev) =>
        prev
          .filter((m) => m.id !== 'loading')
          .concat({
            id: Date.now().toString(),
            text: "I'm having trouble connecting right now. Please try again in a moment, or check our Help sections for PIP guidance.",
            sender: 'assistant',
          })
      );
    } finally {
      setIsThinking(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedMsgId(id);
      setTimeout(() => setCopiedMsgId(null), 2000);
    });
  };

  const formatMessage = (text: string) => {
    return text.split('\n').map((line, i) => (
      <span key={i}>
        {line}
        {i < text.split('\n').length - 1 && <br />}
      </span>
    ));
  };

  return (
    <>
      {/* Floating button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={handleButtonClick}
            className="fixed bottom-6 right-5 z-40 w-14 h-14 bg-teal-700 text-white rounded-full shadow-xl flex items-center justify-center hover:bg-teal-800 transition-colors active:scale-95"
            aria-label="Open PIP Assistant"
          >
            <MessageCircle className="w-6 h-6" />
            {hasPaid && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 rounded-full flex items-center justify-center">
                <Sparkles className="w-2.5 h-2.5 text-amber-900" />
              </span>
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {/* Upsell popup for free users */}
      <AnimatePresence>
        {showUpsell && !isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-5 z-50 bg-white rounded-2xl shadow-xl border border-stone-200 p-4 max-w-xs"
          >
            <button
              onClick={() => setShowUpsell(false)}
              className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded-full hover:bg-stone-100 text-stone-400"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2 mb-2">
              <Lock className="w-4 h-4 text-amber-500" />
              <h3 className="font-bold text-stone-900 text-sm">AI Assistant — Full Access</h3>
            </div>
            <p className="text-xs text-stone-600 mb-3 leading-relaxed">
              Get personalised PIP guidance from our AI assistant — tailored to your conditions and situation.
            </p>
            <button
              onClick={() => { setShowUpsell(false); onUpgrade?.(); }}
              className="w-full bg-teal-700 text-white text-xs font-bold py-2.5 rounded-xl hover:bg-teal-800 transition-colors flex items-center justify-center gap-1.5"
            >
              Unlock Full Access — £12.99
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-6 right-5 z-50 w-[340px] max-w-[calc(100vw-2.5rem)] bg-white rounded-2xl shadow-2xl border border-stone-200 flex flex-col overflow-hidden"
            style={{ height: '520px', maxHeight: 'calc(100vh - 6rem)' }}
          >
            {/* Header */}
            <div className="bg-teal-700 px-4 py-3 flex items-center gap-3 shrink-0">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-white text-sm">PIPpal AI Assistant</h3>
                <p className="text-teal-200 text-xs">Powered by Claude AI</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-teal-600 transition-colors text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.isLoading ? (
                    <div className="bg-stone-100 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-2">
                      <Loader2 className="w-4 h-4 text-teal-600 animate-spin" />
                      <span className="text-xs text-stone-500">Thinking…</span>
                    </div>
                  ) : (
                    <div className={`group relative max-w-[85%] ${msg.sender === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                      <div
                        className={`px-3 py-2.5 rounded-2xl text-sm leading-relaxed
                          ${msg.sender === 'user'
                            ? 'bg-teal-700 text-white rounded-tr-sm'
                            : 'bg-stone-100 text-stone-800 rounded-tl-sm'
                          }`}
                      >
                        {formatMessage(msg.text)}
                      </div>
                      {msg.sender === 'assistant' && msg.id !== 'init' && (
                        <button
                          onClick={() => handleCopy(msg.id, msg.text)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity self-start ml-1 text-stone-400 hover:text-stone-600"
                        >
                          {copiedMsgId === msg.id
                            ? <Check className="w-3 h-3 text-teal-600" />
                            : <Copy className="w-3 h-3" />
                          }
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {/* Suggested questions — show after init message only */}
              {messages.length === 1 && (
                <div className="space-y-2">
                  <p className="text-xs text-stone-400 font-medium">Suggested questions:</p>
                  {SUGGESTED_QUESTIONS.map((q) => (
                    <button
                      key={q}
                      onClick={() => sendMessage(q)}
                      className="w-full text-left text-xs bg-teal-50 text-teal-800 px-3 py-2 rounded-xl hover:bg-teal-100 transition-colors border border-teal-100 leading-relaxed"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-stone-100 p-3 shrink-0">
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage(inputValue);
                    }
                  }}
                  placeholder="Ask about PIP…"
                  disabled={isThinking}
                  className="flex-1 bg-stone-100 rounded-xl px-3 py-2.5 text-sm outline-none focus:bg-stone-50 focus:ring-2 focus:ring-teal-500/20 disabled:opacity-60 placeholder:text-stone-400"
                />
                <button
                  onClick={() => sendMessage(inputValue)}
                  disabled={!inputValue.trim() || isThinking}
                  className="w-10 h-10 bg-teal-700 text-white rounded-xl flex items-center justify-center hover:bg-teal-800 transition-colors active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                >
                  {isThinking
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <Send className="w-4 h-4" />
                  }
                </button>
              </div>
              <p className="text-center text-[10px] text-stone-400 mt-2">
                AI guidance only — not legal advice
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
