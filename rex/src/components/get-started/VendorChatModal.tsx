import { useEffect, useRef, useState } from 'react';
import { MessageCircle, Send, X } from 'lucide-react';
import {
  demoReply,
  openingMessage,
  type ChatMessage,
  type VendorChatTarget,
} from '../../utils/vendorChat';

const inputClass =
  'w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-base text-foreground placeholder:text-muted-foreground focus:border-sky-500/40 focus:outline-none focus:ring-1 focus:ring-sky-500/30';

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

interface VendorChatModalProps {
  target: VendorChatTarget;
  onClose: () => void;
}

export function VendorChatModal({ target, onClose }: VendorChatModalProps) {
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'open',
      from: 'vendor',
      text: openingMessage(target),
      time: formatTime(new Date()),
    },
  ]);
  const [replying, setReplying] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, replying]);

  const sendMessage = () => {
    const text = draft.trim();
    if (!text || replying) return;

    setMessages((prev) => [
      ...prev,
      { id: `f-${Date.now()}`, from: 'founder', text, time: formatTime(new Date()) },
    ]);
    setDraft('');
    setReplying(true);

    window.setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: `v-${Date.now()}`,
          from: 'vendor',
          text: demoReply(target),
          time: formatTime(new Date()),
        },
      ]);
      setReplying(false);
    }, 900);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="vendor-chat-title"
    >
      <div
        className="flex h-[min(560px,92vh)] w-full max-w-lg flex-col rounded-t-2xl border border-white/10 bg-[#0a0e17] shadow-2xl sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-white/10 p-4">
          {target.avatar ? (
            <img src={target.avatar} alt="" className="h-10 w-10 rounded-full object-cover" />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-500/20">
              <MessageCircle className="h-5 w-5 text-sky-400" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h2 id="vendor-chat-title" className="truncate font-semibold text-white">
              {target.name}
            </h2>
            <p className="truncate text-xs text-muted-foreground">{target.subtitle}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-white/10 hover:text-white"
            aria-label="Close chat"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="border-b border-emerald-500/20 bg-emerald-500/5 px-4 py-2.5 text-xs text-emerald-200/90">
          Launch anytime — vendor scope, pricing, and timelines can be finalised in this chat after
          go-live.
        </div>

        <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.from === 'founder' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                  message.from === 'founder'
                    ? 'rounded-br-md bg-sky-500/20 text-sky-100'
                    : 'rounded-bl-md border border-white/10 bg-white/[0.04] text-foreground'
                }`}
              >
                <p className="leading-relaxed">{message.text}</p>
                <p className="mt-1 text-[10px] opacity-60">{message.time}</p>
              </div>
            </div>
          ))}
          {replying && (
            <p className="text-xs text-muted-foreground"> {target.name} is typing…</p>
          )}
        </div>

        <div className="border-t border-white/10 p-4">
          <div className="flex gap-2">
            <input
              className={inputClass}
              placeholder="Ask about scope, timeline, or budget…"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  sendMessage();
                }
              }}
            />
            <button
              type="button"
              onClick={sendMessage}
              disabled={!draft.trim() || replying}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-sky-500/30 bg-sky-500/15 text-sky-300 hover:bg-sky-500/25 disabled:opacity-40"
              aria-label="Send message"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
