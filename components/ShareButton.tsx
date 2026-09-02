"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Share2, Link2, Facebook, MessageCircle, MessageSquare, Check, Share } from "lucide-react";

interface ShareButtonProps {
  url?: string;
  title?: string;
  compact?: boolean;
}

export default function ShareButton({ url, title = "Student Aid BDG", compact = false }: ShareButtonProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareUrl = url || (typeof window !== "undefined" ? window.location.href : "");

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const shareWhatsApp = () => {
    window.open(
      `https://wa.me/?text=${encodeURIComponent(`${title} — ${shareUrl}`)}`,
      "_blank",
      "noopener"
    );
  };

  const shareFacebook = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      "_blank",
      "noopener"
    );
  };

  const shareMessenger = () => {
    // Safari throws "invalid address" if fb-messenger:// is used and the app isn't installed.
    // Fallback to Facebook Sharer (which has a 'Send in Messenger' option) for Apple devices
    const isApple = /Mac|iPhone|iPad|iPod/i.test(typeof navigator !== 'undefined' ? navigator.userAgent : '');
    
    if (isApple) {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, "_blank", "noopener");
    } else {
      window.open(`fb-messenger://share/?link=${encodeURIComponent(shareUrl)}`, "_self");
    }
  };

  const shareNative = async () => {
    try {
      await navigator.share({ title, url: shareUrl });
    } catch {
      // user canceled or not supported
    }
    setOpen(false);
  };

  const canNativeShare = typeof navigator !== "undefined" && !!navigator.share;

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.93 }}
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-xl border transition"
        style={{
          borderColor: open ? "var(--border-hover)" : "var(--border)",
          background: open ? "var(--bg-card-hover)" : "var(--bg-card)",
          color: "var(--text-secondary)",
          fontFamily: "'Outfit', system-ui, sans-serif",
        }}
        aria-label="Share"
        id="share-button"
      >
        <Share2 size={14} />
        {!compact && <span>Share</span>}
      </motion.button>

      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />

            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: -4 }}
              transition={{ type: "spring", stiffness: 400, damping: 28 }}
              className="absolute right-0 top-full mt-2 z-40 min-w-[160px] py-1 rounded-xl border"
              style={{ 
                borderColor: "var(--border)",
                background: "var(--bg)", 
                boxShadow: "0 12px 40px rgba(0,0,0,0.18), 0 0 0 1px var(--border)" 
              }}
            >
              {/* Native OS Share (if supported) */}
              {canNativeShare && (
                <button
                  onClick={shareNative}
                  className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm transition text-left hover:bg-[var(--bg-section)]"
                  style={{ color: "var(--text-primary)", fontFamily: "'Inter', system-ui, sans-serif" }}
                >
                  <Share size={14} className="text-zinc-500" />
                  Share via...
                </button>
              )}

              {/* Copy link */}
              <button
                onClick={() => { copyLink(); setOpen(false); }}
                className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm transition text-left hover:bg-[var(--bg-section)]"
                style={{ color: copied ? "#22c55e" : "var(--text-primary)", fontFamily: "'Inter', system-ui, sans-serif" }}
              >
                {copied ? <Check size={14} className="text-green-500" /> : <Link2 size={14} className="text-indigo-500" />}
                {copied ? "Copied!" : "Copy Link"}
              </button>

              {/* Facebook */}
              <button
                onClick={() => { shareFacebook(); setOpen(false); }}
                className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm transition text-left hover:bg-[var(--bg-section)]"
                style={{ color: "var(--text-primary)", fontFamily: "'Inter', system-ui, sans-serif" }}
              >
                <Facebook size={14} className="text-blue-600" />
                Facebook
              </button>

              {/* Messenger */}
              <button
                onClick={() => { shareMessenger(); setOpen(false); }}
                className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm transition text-left hover:bg-[var(--bg-section)]"
                style={{ color: "var(--text-primary)", fontFamily: "'Inter', system-ui, sans-serif" }}
              >
                <MessageSquare size={14} className="text-blue-500" />
                Messenger
              </button>

              {/* WhatsApp */}
              <button
                onClick={() => { shareWhatsApp(); setOpen(false); }}
                className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm transition text-left hover:bg-[var(--bg-section)]"
                style={{ color: "var(--text-primary)", fontFamily: "'Inter', system-ui, sans-serif" }}
              >
                <MessageCircle size={14} className="text-green-500" />
                WhatsApp
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
