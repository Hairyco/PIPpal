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
  HeartHandshake,
} from 'lucide-react';
import { useAppContext } from './AppContext';

interface PIPAssistantProps {
  isVisible: boolean;
  hasPaid?: boolean;
  onUpgrade?: () => void;
  autoOpenQuestion?: string | null;
  autoOpenContext?: string | null;
  onAutoOpenHandled?: () => void;
}

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  isLoading?: boolean;
}

const makeNoConditionsMessage = (name: string): Message => ({
  id: 'init',
  text: `${name ? `Hi ${name}. ` : 'Hi. '}I can give you much more useful guidance if I know your conditions. If you have not added them yet, tap the side menu and go to Medical Profile. Once done, come back and ask me anything about your PIP claim.`,
  sender: 'assistant',
});

const makeInitialMessage = (name: string, conditions: string): Message => ({
  id: 'init',
  text: `${name ? `Hi ${name}. ` : 'Hi. '}I can see you have ${conditions}. I will use that to give you specific guidance. Ask me anything about your PIP claim, assessment or appeal.`,
  sender: 'assistant',
});

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
  autoOpenQuestion,
  autoOpenContext,
  onAutoOpenHandled,
}: PIPAssistantProps) {
  const { medProfile, user } = useAppContext();

  // Auto-open when a question is passed from news screen
  React.useEffect(() => {
    if (autoOpenQuestion) {
      const timer = setTimeout(() => {
        setIsOpen(true);
        // If there's article context, pre-fill with context + question
        const fullQuestion = autoOpenContext
          ? `Re: "${autoOpenContext.slice(0, 100)}..." — ${autoOpenQuestion}`
          : autoOpenQuestion;
        setInputValue(fullQuestion);
        onAutoOpenHandled?.();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [autoOpenQuestion]);
  const firstName = user?.name ? user.name.split(' ')[0] : '';
  const hasConditions = medProfile.conditions.length > 0;
  const conditionNames = medProfile.conditions.map((c: any) => c.name).join(', ');
  const [isOpen, setIsOpen] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showUpsell, setShowUpsell] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    hasConditions ? makeInitialMessage(firstName, conditionNames) : makeNoConditionsMessage(firstName)
  ]);

  useEffect(() => {
    setMessages([hasConditions ? makeInitialMessage(firstName, conditionNames) : makeNoConditionsMessage(firstName)]);
  }, [conditionNames, firstName]);
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
          conversationHistory: conversationHistory.slice(-10),
        }),
      });

      if (!response.ok) throw new Error('API error');

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
      setMessages((prev) =>
        prev
          .filter((m) => m.id !== 'loading')
          .concat({
            id: Date.now().toString(),
            text: "I'm having trouble connecting right now. Please try again in a moment.",
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
            aria-label="Open PIPpal Assistant"
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
              <h3 className="font-bold text-stone-900 text-sm">PIPpal Assistant — Full Access</h3>
            </div>
            <p className="text-xs text-stone-600 mb-3 leading-relaxed">
              Get personalised PIP guidance tailored to your conditions and situation.
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
            className={`fixed z-50 bg-white shadow-2xl border border-stone-200 flex flex-col overflow-hidden transition-all duration-300 ${
              isFullScreen
                ? 'inset-0 rounded-none'
                : 'bottom-6 right-5 w-[340px] max-w-[calc(100vw-2.5rem)] rounded-2xl'
            }`}
            style={isFullScreen ? {} : { height: '520px', maxHeight: 'calc(100vh - 6rem)' }}
          >
            {/* Header */}
            <div className="bg-teal-700 px-4 py-3 flex items-center gap-3 shrink-0">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <HeartHandshake className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-white text-sm">PIPpal Assistant</h3>
                <p className="text-teal-200 text-xs">PIP guidance & support</p>
              </div>
              <button
                onClick={() => setIsFullScreen(!isFullScreen)}
                className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-teal-600 transition-colors text-white mr-1"
                title={isFullScreen ? 'Minimise' : 'Full screen'}
              >
                {isFullScreen ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/></svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>
                )}
              </button>
              <button
                onClick={() => { setIsOpen(false); setIsFullScreen(false); }}
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

              {/* Suggested questions */}
              {messages.length === 1 && (
                <div className="space-y-2">
                  <p className="text-xs text-stone-400 font-medium">Try asking:</p>
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
                Guidance only — not legal or medical advice
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}