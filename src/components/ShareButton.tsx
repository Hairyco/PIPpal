import React, { useEffect, useState, useRef, Component } from 'react';
import { Share2, Check, MessageSquare, Copy, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
interface ShareButtonProps {
  title: string;
  text: string;
  variant?: 'icon' | 'full';
  className?: string;
}
export function ShareButton({
  title,
  text,
  variant = 'icon',
  className = ''
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    }
    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showMenu]);
  const shareUrl = window.location.href;
  const shareMessage = `${text}\n${shareUrl}`;
  const handleNativeShare = async () => {
    setShowMenu(false);
    try {
      if (navigator.share) {
        await navigator.share({
          title,
          text,
          url: shareUrl
        });
      } else {
        handleCopyLink();
      }
    } catch (err) {
      if ((err as Error)?.name !== 'AbortError') {
        handleCopyLink();
      }
    }
  };
  const handleTextShare = () => {
    setShowMenu(false);
    const smsBody = encodeURIComponent(shareMessage);
    // Use & for iOS, ? for Android — & works on both in most cases
    window.location.href = `sms:?&body=${smsBody}`;
  };
  const handleCopyLink = async () => {
    setShowMenu(false);
    try {
      await navigator.clipboard.writeText(shareMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {

      // clipboard failed silently
    }};
  const menuItems = [
  ...(navigator.share ?
  [
  {
    label: 'Share',
    icon: Share2,
    action: handleNativeShare
  }] :

  []),
  {
    label: 'Text Message',
    icon: MessageSquare,
    action: handleTextShare
  },
  {
    label: 'Copy Link',
    icon: Copy,
    action: handleCopyLink
  }];

  const shareMenu =
  <AnimatePresence>
      {showMenu &&
    <motion.div
      initial={{
        opacity: 0,
        scale: 0.9,
        y: 4
      }}
      animate={{
        opacity: 1,
        scale: 1,
        y: 0
      }}
      exit={{
        opacity: 0,
        scale: 0.9,
        y: 4
      }}
      transition={{
        duration: 0.15
      }}
      className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-lg border border-stone-200 py-1 z-50 min-w-[160px]">
      
          {menuItems.map((item) =>
      <button
        key={item.label}
        onClick={item.action}
        className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-medium text-stone-700 hover:bg-stone-50 transition-colors">
        
              <item.icon className="w-4 h-4 text-stone-500" />
              {item.label}
            </button>
      )}
        </motion.div>
    }
    </AnimatePresence>;

  if (variant === 'full') {
    return (
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setShowMenu(!showMenu)}
          className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-95 ${className}`}>
          
          <AnimatePresence mode="wait">
            {copied ?
            <motion.span
              key="copied"
              initial={{
                opacity: 0,
                scale: 0.8
              }}
              animate={{
                opacity: 1,
                scale: 1
              }}
              exit={{
                opacity: 0,
                scale: 0.8
              }}
              className="flex items-center gap-2">
              
                <Check className="w-4 h-4" />
                Link Copied!
              </motion.span> :

            <motion.span
              key="share"
              initial={{
                opacity: 0,
                scale: 0.8
              }}
              animate={{
                opacity: 1,
                scale: 1
              }}
              exit={{
                opacity: 0,
                scale: 0.8
              }}
              className="flex items-center gap-2">
              
                <Share2 className="w-4 h-4" />
                Share This Tool
              </motion.span>
            }
          </AnimatePresence>
        </button>
        {shareMenu}
      </div>);

  }
  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setShowMenu(!showMenu)}
        className={`relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all active:scale-90 hover:bg-black/5 ${className}`}
        title="Share this tool">
        
        <AnimatePresence mode="wait">
          {copied ?
          <motion.div
            key="check"
            initial={{
              opacity: 0,
              scale: 0.5
            }}
            animate={{
              opacity: 1,
              scale: 1
            }}
            exit={{
              opacity: 0,
              scale: 0.5
            }}
            className="flex items-center gap-1.5">
            
              <Check className="w-4 h-4 text-green-600" />
              <span className="text-green-600">Copied!</span>
            </motion.div> :

          <motion.div
            key="share"
            initial={{
              opacity: 0,
              scale: 0.5
            }}
            animate={{
              opacity: 1,
              scale: 1
            }}
            exit={{
              opacity: 0,
              scale: 0.5
            }}
            className="flex items-center gap-1.5">
            
              <Share2 className="w-4 h-4" />
              <span>Share</span>
            </motion.div>
          }
        </AnimatePresence>
      </button>
      {shareMenu}
    </div>);

}