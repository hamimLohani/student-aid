"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Users, Calendar, Megaphone, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface Result {
  id: string;
  type: "member" | "activity" | "announcement";
  title: string;
  subtitle?: string;
  href: string;
  image?: string;
}

interface GlobalSearchProps {
  open: boolean;
  onClose: () => void;
}

const TYPE_ICONS = {
  member: <Users size={14} />,
  activity: <Calendar size={14} />,
  announcement: <Megaphone size={14} />,
};

const TYPE_LABELS = {
  member: "Member",
  activity: "Activity",
  announcement: "Announcement",
};

const TYPE_COLORS: Record<string, string> = {
  member: "pill-violet",
  activity: "pill-cyan",
  announcement: "pill-amber",
};

export default function GlobalSearch({ open, onClose }: GlobalSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 80);
      setQuery("");
      setResults([]);
      setSelected(0);
    }
  }, [open]);

  // Escape to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  // Search
  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); return; }
    setLoading(true);
    try {
      const [memberSnap, activitySnap, announcementSnap] = await Promise.all([
        getDocs(collection(db, "members")),
        getDocs(collection(db, "activities")),
        getDocs(collection(db, "announcements")),
      ]);

      const ql = q.toLowerCase();
      const found: Result[] = [];

      memberSnap.docs.forEach((d) => {
        const m = d.data();
        if (
          [m.name, m.work, m.workplace, m.address, m.sscYear, m.bloodGroup, m.memberType]
            .filter(Boolean)
            .some((v) => v.toLowerCase().includes(ql))
        ) {
          found.push({
            id: d.id,
            type: "member",
            title: m.name,
            subtitle: [m.memberType, m.sscYear && `SSC ${m.sscYear}`, m.work].filter(Boolean).join(" · "),
            href: `/members/${d.id}`,
            image: m.image,
          });
        }
      });

      activitySnap.docs.forEach((d) => {
        const a = d.data();
        if ([a.title, a.description].filter(Boolean).some((v) => v.toLowerCase().includes(ql))) {
          found.push({
            id: d.id,
            type: "activity",
            title: a.title,
            subtitle: a.date ? new Date(a.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "",
            href: `/activities/${d.id}`,
            image: a.images?.[0],
          });
        }
      });

      announcementSnap.docs.forEach((d) => {
        const a = d.data();
        if ([a.title, a.content].filter(Boolean).some((v) => v.toLowerCase().includes(ql))) {
          found.push({
            id: d.id,
            type: "announcement",
            title: a.title,
            subtitle: a.content?.replace(/<[^>]+>/g, "").slice(0, 80),
            href: `/announcements`,
          });
        }
      });

      setResults(found.slice(0, 12));
      setSelected(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(query), 280);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, doSearch]);

  // Keyboard navigation
  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelected((s) => Math.min(s + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelected((s) => Math.max(s - 1, 0));
    } else if (e.key === "Enter" && results[selected]) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: -20, x: "-50%", scale: 0.97 }}
            animate={{ opacity: 1, y: 0, x: "-50%", scale: 1 }}
            exit={{ opacity: 0, y: -12, x: "-50%", scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="fixed top-[10vh] left-1/2 z-50 w-full max-w-2xl px-4"
          >
            <div
              className="card overflow-hidden"
              style={{ boxShadow: "0 24px 80px rgba(0,0,0,0.3), 0 0 0 1px var(--border)" }}
            >
              {/* Search input */}
              <div
                className="flex items-center gap-3 px-4 py-3.5"
                style={{ borderBottom: results.length > 0 || loading ? "1px solid var(--border)" : "none" }}
              >
                {loading ? (
                  <Loader2 size={18} className="text-indigo-500 animate-spin flex-shrink-0" />
                ) : (
                  <Search size={18} className="flex-shrink-0" style={{ color: "var(--text-muted)" }} />
                )}
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKey}
                  placeholder="Search members, activities, announcements..."
                  className="flex-1 bg-transparent outline-none text-base font-medium"
                  style={{ color: "var(--text-primary)", fontFamily: "'Inter', system-ui, sans-serif" }}
                  id="global-search-input"
                />
                {query && (
                  <button onClick={() => setQuery("")} style={{ color: "var(--text-muted)" }}>
                    <X size={16} />
                  </button>
                )}
                <kbd
                  className="hidden sm:flex items-center gap-1 text-xs px-2 py-1 rounded-md border flex-shrink-0"
                  style={{ borderColor: "var(--border)", background: "var(--bg-section)", color: "var(--text-muted)", fontFamily: "'Outfit', system-ui, sans-serif" }}
                >
                  Esc
                </kbd>
              </div>

              {/* Results */}
              {results.length > 0 && (
                <div className="max-h-[60vh] overflow-y-auto">
                  {/* Group by type */}
                  {(["member", "activity", "announcement"] as const).map((type) => {
                    const typeResults = results.filter((r) => r.type === type);
                    if (typeResults.length === 0) return null;
                    return (
                      <div key={type}>
                        <div
                          className="px-4 py-2 text-xs font-bold uppercase tracking-widest flex items-center gap-2"
                          style={{ color: "var(--text-muted)", background: "var(--bg-section)" }}
                        >
                          {TYPE_ICONS[type]}
                          {TYPE_LABELS[type]}s
                        </div>
                        {typeResults.map((r, idx) => {
                          const globalIdx = results.indexOf(r);
                          return (
                            <Link
                              key={r.id}
                              href={r.href}
                              onClick={onClose}
                              className="flex items-center gap-3 px-4 py-3 transition-colors group"
                              style={{
                                background: selected === globalIdx ? "var(--bg-section)" : "transparent",
                                borderBottom: idx < typeResults.length - 1 ? "1px solid var(--border)" : "none",
                              }}
                              onMouseEnter={() => setSelected(globalIdx)}
                            >
                              {/* Avatar / Icon */}
                              <div
                                className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center overflow-hidden relative"
                                style={{ background: "var(--bg-section)" }}
                              >
                                {r.image ? (
                                  <Image src={r.image} alt={r.title} fill sizes="36px" className="object-cover" />
                                ) : (
                                  <span className="text-indigo-500">{TYPE_ICONS[type]}</span>
                                )}
                              </div>

                              {/* Text */}
                              <div className="flex-1 min-w-0">
                                <p
                                  className="text-sm font-semibold truncate group-hover:text-indigo-500 transition-colors"
                                  style={{ color: "var(--text-primary)", fontFamily: "'Outfit', system-ui, sans-serif" }}
                                >
                                  {r.title}
                                </p>
                                {r.subtitle && (
                                  <p className="text-xs truncate mt-0.5" style={{ color: "var(--text-muted)" }}>
                                    {r.subtitle}
                                  </p>
                                )}
                              </div>

                              <span className={`pill ${TYPE_COLORS[r.type]} text-[10px] flex-shrink-0`}>
                                {TYPE_LABELS[r.type]}
                              </span>
                              <ArrowRight size={14} className="text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                            </Link>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Empty state */}
              {query && !loading && results.length === 0 && (
                <div className="py-12 text-center" style={{ color: "var(--text-muted)" }}>
                  <Search size={32} className="mx-auto mb-3 opacity-30" />
                  <p className="text-sm font-medium">No results for &ldquo;{query}&rdquo;</p>
                  <p className="text-xs mt-1">Try searching for a member name, activity, or announcement</p>
                </div>
              )}

              {/* Footer hint */}
              {!query && (
                <div
                  className="px-4 py-3 flex items-center gap-4 text-xs"
                  style={{ color: "var(--text-muted)", borderTop: "1px solid var(--border)" }}
                >
                  <span className="flex items-center gap-1.5">
                    <kbd className="px-1.5 py-0.5 rounded border" style={{ borderColor: "var(--border)", background: "var(--bg-section)" }}>↑</kbd>
                    <kbd className="px-1.5 py-0.5 rounded border" style={{ borderColor: "var(--border)", background: "var(--bg-section)" }}>↓</kbd>
                    Navigate
                  </span>
                  <span className="flex items-center gap-1.5">
                    <kbd className="px-1.5 py-0.5 rounded border" style={{ borderColor: "var(--border)", background: "var(--bg-section)" }}>↵</kbd>
                    Open
                  </span>
                  <span className="flex items-center gap-1.5">
                    <kbd className="px-1.5 py-0.5 rounded border" style={{ borderColor: "var(--border)", background: "var(--bg-section)" }}>Esc</kbd>
                    Close
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
