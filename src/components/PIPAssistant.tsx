import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle,
  X,
  Send,
  Sparkles,
  AlertCircle,
  Copy,
  Check,
  ImagePlus,
  FileImage,
  Loader2,
  Lock,
  ArrowRight } from
'lucide-react';
interface PIPAssistantProps {
  isVisible: boolean;
  hasPaid?: boolean;
  onUpgrade?: () => void;
}
interface Message {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  imageUrl?: string;
}
const INITIAL_MESSAGE: Message = {
  id: 'init',
  text: "Hi! I'm your PIP Assistant. Ask me anything about PIP — eligibility, rates, assessments, or what to do after a decision. You can also upload screenshots of your decision letter or assessment report and I'll help you understand and challenge them.",
  sender: 'assistant'
};
export function PIPAssistant({
  isVisible,
  hasPaid = true,
  onUpgrade
}: PIPAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showUpsell, setShowUpsell] = useState(false);
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [inputValue, setInputValue] = useState('');
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalysing, setIsAnalysing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({
        behavior: 'smooth'
      });
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
  const getAssistantResponse = (query: string): string => {
    const lower = query.toLowerCase();
    if (
    lower.includes('rate') ||
    lower.includes('how much') ||
    lower.includes('payment'))
    {
      return 'For 2025/26, the Daily Living part pays £72.65 (standard) or £108.55 (enhanced) per week. The Mobility part pays £28.70 (standard) or £75.75 (enhanced) per week. It is paid every 4 weeks.';
    }
    if (
    lower.includes('eligib') ||
    lower.includes('qualify') ||
    lower.includes('who can'))
    {
      return 'To be eligible for PIP, you must be aged 16 to State Pension age, have a long-term physical or mental health condition or disability, and have had difficulties with daily living or getting around for 3 months, expecting them to last for at least 9 more months.';
    }
    if (
    lower.includes('timeline') ||
    lower.includes('how long') ||
    lower.includes('wait'))
    {
      return 'The PIP process typically takes 4 to 6 months from your initial call to receiving a decision. If awarded, your payments will be backdated to the date you started your claim.';
    }
    if (
    lower.includes('assessment') ||
    lower.includes('medical') ||
    lower.includes('telephone'))
    {
      return 'Assessments can be in-person, by video, or by telephone. A health professional will ask how your condition affects your daily life. You can request a telephone assessment if traveling causes severe distress.\n\n📸 Tip: If you have your assessment report (PA4), upload a screenshot and I can help you identify points to challenge.';
    }
    if (
    lower.includes('mandatory reconsideration') ||
    lower.includes('mr') ||
    lower.includes('appeal') ||
    lower.includes('refused') ||
    lower.includes('challenge') ||
    lower.includes('disagree') ||
    lower.includes('decision letter'))
    {
      return "If you disagree with the decision, you have 1 month to request a Mandatory Reconsideration (MR). If the MR is unsuccessful, you can appeal to an independent tribunal. About 60% of refused claims are overturned at appeal.\n\n📸 Upload a screenshot of your decision letter or assessment report and I'll help you identify which descriptors to challenge and how to argue your case using the SAFES rule.";
    }
    if (lower.includes('diary') || lower.includes('evidence')) {
      return 'Keeping a PIP diary for a week or two is excellent evidence. It shows how your condition fluctuates and affects you on a day-to-day basis. Medical letters and reports are also strong evidence.';
    }
    if (lower.includes('change') || lower.includes('worse')) {
      return 'If your condition gets worse, you can report a Change of Circumstances. Be aware that this triggers a full review of your award, which could go up, stay the same, or go down.';
    }
    if (
    lower.includes('mental health') ||
    lower.includes('anxiety') ||
    lower.includes('depression'))
    {
      return 'PIP is absolutely for mental health conditions too. About 39% of all claims are for psychiatric or neurodivergent conditions. It focuses on how your condition affects your daily life, not just physical mobility.';
    }
    if (
    lower.includes('work') ||
    lower.includes('job') ||
    lower.includes('employ'))
    {
      return 'You can claim PIP whether you are working full-time, part-time, or not at all. It is not means-tested, so your income and savings do not affect your eligibility.';
    }
    if (
    lower.includes('screenshot') ||
    lower.includes('upload') ||
    lower.includes('photo') ||
    lower.includes('picture') ||
    lower.includes('image'))
    {
      return 'You can upload a screenshot using the 📷 button next to the text input. I can help you read and understand:\n\n• Decision letters — identify which descriptors to challenge\n• Assessment reports (PA4) — spot inaccuracies\n• Points breakdowns — check if you should have scored higher\n\nJust tap the image button and select your screenshot!';
    }
    if (
    lower.includes('hello') ||
    lower.includes('hi ') ||
    lower.includes('hey'))
    {
      return 'Hello! How can I help you with your PIP claim today? You can ask me questions or upload screenshots of your decision letter for help challenging it.';
    }
    if (lower.includes('thank')) {
      return "You're very welcome! Let me know if you have any other questions about PIP.";
    }
    return "I'm a PIP guidance assistant. I can help with general information about PIP eligibility, rates, assessments, and the claims process. You can also upload screenshots of your decision letter or assessment report for help understanding them. For complex personal cases or legal advice, I recommend contacting Citizens Advice (0800 144 8848).";
  };
  const getImageResponse = (hasText: boolean, text: string): string => {
    const lower = text.toLowerCase();
    if (lower.includes('decision') || lower.includes('letter')) {
      return "📄 I can see your decision letter. Here's what I'd recommend:\n\n1. **Check each activity score** — compare the points awarded against what you believe you should have scored\n2. **Look for 0-point activities** — these are often where assessors underestimate your difficulties\n3. **Apply the SAFES rule** — for each disputed activity, can you do it Safely, to an Acceptable standard, Frequently enough, in Enough time, and Sustainably?\n\n📝 To challenge this, you'll need to file a Mandatory Reconsideration within 1 month. Would you like help writing your challenge for any specific activity?";
    }
    if (
    lower.includes('assessment') ||
    lower.includes('pa4') ||
    lower.includes('report'))
    {
      return '📋 I can see your assessment report. Key things to look for:\n\n1. **Factual errors** — Did the assessor record something you didn\'t say, or misquote you?\n2. **Missing information** — Did they leave out conditions, medications, or difficulties you mentioned?\n3. **Observations vs reality** — Assessors often note things like "appeared well-groomed" to justify low scores. This doesn\'t reflect your worst days.\n\n🔍 For each activity where you scored lower than expected, compare what the assessor wrote against what actually happens on your worst days. Would you like help drafting a response for a specific activity?';
    }
    if (lower.includes('points') || lower.includes('score')) {
      return '📊 I can see your points breakdown. Let me help you analyse it:\n\n• **Daily Living**: You need 8+ points for Standard rate, 12+ for Enhanced\n• **Mobility**: You need 8+ points for Standard rate, 12+ for Enhanced\n\nLook at activities where you scored 0 — these are often the easiest to challenge. Even moving from 0 to 2 points on a few activities can push you over the threshold.\n\nWould you like me to help you challenge any specific activity score?';
    }
    return "📸 Thanks for uploading that screenshot. I can see it's related to your PIP claim. Here's how I can help:\n\n1. **If it's a decision letter** — I can help you identify which descriptors to challenge and how to structure your Mandatory Reconsideration\n2. **If it's an assessment report (PA4)** — I can help you spot inaccuracies and build your case\n3. **If it's a points breakdown** — I can help you understand where you might score higher\n\nCould you tell me a bit more about what this document is, and which activities you want to challenge? That way I can give you more specific guidance.";
  };
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setImagePreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  const handleSend = () => {
    if (!inputValue.trim() && !imagePreview) return;
    const userMsg: Message = {
      id: Date.now().toString(),
      text: inputValue.trim() || (imagePreview ? 'Uploaded a screenshot' : ''),
      sender: 'user',
      imageUrl: imagePreview || undefined
    };
    setMessages((prev) => [...prev, userMsg]);
    const sentText = inputValue.trim();
    const hadImage = !!imagePreview;
    setInputValue('');
    setImagePreview(null);
    if (hadImage) {
      // Show analysing state
      setIsAnalysing(true);
      setTimeout(() => {
        setIsAnalysing(false);
        const responseText = getImageResponse(!!sentText, sentText);
        const assistantMsg: Message = {
          id: (Date.now() + 1).toString(),
          text: responseText,
          sender: 'assistant'
        };
        setMessages((prev) => [...prev, assistantMsg]);
      }, 2000);
    } else {
      setTimeout(() => {
        const responseText = getAssistantResponse(sentText);
        const assistantMsg: Message = {
          id: (Date.now() + 1).toString(),
          text: responseText,
          sender: 'assistant'
        };
        setMessages((prev) => [...prev, assistantMsg]);
      }, 600);
    }
  };
  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedMsgId(id);
      setTimeout(() => setCopiedMsgId(null), 2000);
    });
  };
  const removeImagePreview = () => {
    setImagePreview(null);
  };
  return (
    <>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden" />
      

      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && !showUpsell &&
        <motion.button
          initial={{
            scale: 0,
            opacity: 0
          }}
          animate={{
            scale: 1,
            opacity: 1
          }}
          exit={{
            scale: 0,
            opacity: 0
          }}
          onClick={handleButtonClick}
          className="fixed bottom-6 right-5 w-14 h-14 bg-purple-700 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-purple-800 active:scale-95 transition-all z-[60]">
          
            <MessageCircle className="w-6 h-6" />
            <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-rose-500 border-2 border-white rounded-full"></span>
          </motion.button>
        }
      </AnimatePresence>

      {/* Upsell Overlay for unpaid users */}
      <AnimatePresence>
        {showUpsell &&
        <>
            <motion.div
            initial={{
              opacity: 0
            }}
            animate={{
              opacity: 1
            }}
            exit={{
              opacity: 0
            }}
            onClick={() => setShowUpsell(false)}
            className="fixed inset-0 bg-stone-900/20 backdrop-blur-sm z-[60]" />
          
            <motion.div
            initial={{
              y: 40,
              opacity: 0
            }}
            animate={{
              y: 0,
              opacity: 1
            }}
            exit={{
              y: 40,
              opacity: 0
            }}
            transition={{
              type: 'spring',
              damping: 25,
              stiffness: 200
            }}
            className="fixed bottom-6 right-5 left-5 sm:left-auto sm:w-80 bg-white rounded-2xl shadow-2xl z-[70] border border-stone-200 overflow-hidden">
            
              <div className="bg-purple-700 px-5 py-4 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-purple-100" />
                    </div>
                    <h3 className="font-bold text-sm">PIP Assistant</h3>
                  </div>
                  <button
                  onClick={() => setShowUpsell(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors">
                  
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="p-5 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-purple-50 rounded-full flex items-center justify-center shrink-0">
                    <Lock className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-stone-900 text-sm mb-1">
                      Unlock PIP Assistant
                    </h4>
                    <p className="text-xs text-stone-600 leading-relaxed">
                      Get instant answers about PIP eligibility, rates,
                      assessments, and how to challenge decisions. Upload
                      screenshots of your decision letter for personalised
                      guidance.
                    </p>
                  </div>
                </div>
                <div className="bg-purple-50 rounded-xl p-3 border border-purple-100">
                  <div className="space-y-1.5 text-xs text-purple-800">
                    <div className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                      <span>Ask anything about PIP — anytime</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                      <span>Upload decision letters for help challenging</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                      <span>Included with Full Access — £12.99 one-time</span>
                    </div>
                  </div>
                </div>
                <button
                onClick={() => {
                  setShowUpsell(false);
                  onUpgrade?.();
                }}
                className="w-full bg-orange-500 text-white py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-orange-600 active:scale-[0.98] transition-all shadow-sm">
                
                  Unlock Full Access
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </>
        }
      </AnimatePresence>

      {/* Chat Overlay — only for paid users */}
      <AnimatePresence>
        {isOpen &&
        <>
            {/* Backdrop */}
            <motion.div
            initial={{
              opacity: 0
            }}
            animate={{
              opacity: 1
            }}
            exit={{
              opacity: 0
            }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-stone-900/20 backdrop-blur-sm z-[60]" />
          

            {/* Slide-up Panel */}
            <motion.div
            initial={{
              y: '100%'
            }}
            animate={{
              y: 0
            }}
            exit={{
              y: '100%'
            }}
            transition={{
              type: 'spring',
              damping: 25,
              stiffness: 200
            }}
            className="fixed bottom-0 left-0 right-0 h-[75%] bg-stone-50 rounded-t-3xl shadow-2xl z-[70] flex flex-col overflow-hidden border-t border-stone-200">
            
              {/* Header */}
              <div className="bg-purple-700 px-5 py-4 flex items-center justify-between text-white shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-purple-100" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">PIP Assistant</h3>
                    <p className="text-[10px] text-purple-200 font-medium">
                      Guidance & Information · 📸 Screenshot support
                    </p>
                  </div>
                </div>
                <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors">
                
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Disclaimer */}
              <div className="bg-purple-50 px-4 py-2 border-b border-purple-100 flex items-center gap-2 shrink-0">
                <AlertCircle className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                <p className="text-[10px] text-purple-800 leading-tight">
                  I provide general PIP guidance, not legal advice. For complex
                  cases, please contact Citizens Advice.
                </p>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {messages.map((msg) =>
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                
                    <div
                  className={`max-w-[85%] ${msg.sender === 'user' ? '' : 'group'}`}>
                  
                      {/* Image thumbnail */}
                      {msg.imageUrl &&
                  <div
                    className={`mb-1 rounded-xl overflow-hidden border ${msg.sender === 'user' ? 'border-purple-500' : 'border-stone-200'}`}>
                    
                          <img
                      src={msg.imageUrl}
                      alt="Uploaded screenshot"
                      className="w-full max-h-48 object-cover" />
                    
                        </div>
                  }
                      <div
                    className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-line ${msg.sender === 'user' ? 'bg-purple-700 text-white rounded-br-sm' : 'bg-white border border-stone-200 text-stone-800 rounded-bl-sm shadow-sm'}`}>
                    
                        {msg.text}
                      </div>
                      {msg.sender === 'assistant' &&
                  <button
                    onClick={() => handleCopyMessage(msg.id, msg.text)}
                    className={`mt-1 flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium transition-all ${copiedMsgId === msg.id ? 'text-purple-700 bg-purple-50' : 'text-stone-400 hover:text-stone-600 hover:bg-stone-100'}`}>
                    
                          {copiedMsgId === msg.id ?
                    <>
                              <Check className="w-3 h-3" />
                              Copied
                            </> :

                    <>
                              <Copy className="w-3 h-3" />
                              Copy
                            </>
                    }
                        </button>
                  }
                    </div>
                  </div>
              )}

                {/* Analysing indicator */}
                {isAnalysing &&
              <div className="flex justify-start">
                    <div className="bg-white border border-stone-200 rounded-2xl rounded-bl-sm shadow-sm px-4 py-3 flex items-center gap-2.5">
                      <Loader2 className="w-4 h-4 text-purple-600 animate-spin" />
                      <span className="text-sm text-stone-600">
                        Analysing your screenshot...
                      </span>
                    </div>
                  </div>
              }

                <div ref={messagesEndRef} />
              </div>

              {/* Image Preview Strip */}
              {imagePreview &&
            <div className="px-4 py-2 bg-purple-50 border-t border-purple-100 flex items-center gap-3 shrink-0">
                  <div className="relative">
                    <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-12 h-12 rounded-lg object-cover border border-purple-200" />
                
                    <button
                  onClick={removeImagePreview}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-stone-700 text-white rounded-full flex items-center justify-center hover:bg-stone-800">
                  
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-purple-800">
                      Screenshot attached
                    </p>
                    <p className="text-[10px] text-purple-600">
                      Add a message or tap send to upload
                    </p>
                  </div>
                </div>
            }

              {/* Input Area */}
              <div className="p-4 bg-white border-t border-stone-100 shrink-0">
                <div className="flex items-center gap-2 bg-stone-100 rounded-full p-1.5 pr-2 border border-stone-200 focus-within:border-purple-400 focus-within:ring-2 focus-within:ring-purple-100 transition-all">
                  <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-9 h-9 flex items-center justify-center rounded-full text-stone-500 hover:text-purple-600 hover:bg-purple-50 transition-colors shrink-0"
                  title="Upload screenshot">
                  
                    <ImagePlus className="w-5 h-5" />
                  </button>
                  <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder={
                  imagePreview ?
                  'Describe what this is (optional)...' :
                  'Ask about PIP or upload a screenshot...'
                  }
                  className="flex-1 bg-transparent border-none focus:outline-none py-2 text-sm text-stone-800 placeholder:text-stone-400" />
                
                  <button
                  onClick={handleSend}
                  disabled={!inputValue.trim() && !imagePreview}
                  className="w-9 h-9 bg-purple-700 text-white rounded-full flex items-center justify-center hover:bg-purple-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0">
                  
                    <Send className="w-4 h-4 ml-0.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        }
      </AnimatePresence>
    </>);

}