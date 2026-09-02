"use client";
import { useEffect, useState } from "react";
import {
  doc, onSnapshot, collection, query, orderBy,
  addDoc, serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  Calendar, Clock, ArrowLeft, X, ChevronLeft, ChevronRight,
  MessageCircle, Send, Download, ChevronDown,
} from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { activityDetailCopy } from "@/lib/i18n";
import ShareButton from "@/components/ShareButton";

interface Activity {
  title: string;
  description: string;
  date: string;
  images: string[];
}

interface Comment {
  id: string;
  text: string;
  author: string;
  createdAt: { seconds: number };
}

function Countdown({ date, pastEventLabel }: { date: string; pastEventLabel: string }) {
  const [time, setTime] = useState("");
  const [isPast, setIsPast] = useState(false);
  useEffect(() => {
    const tick = () => {
      const diff = new Date(date).getTime() - Date.now();
      if (diff <= 0) { setIsPast(true); setTime(pastEventLabel); return; }
      setIsPast(false);
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      setTime(`${d}d ${h}h ${m}m`);
    };
    tick();
    const id = setInterval(tick, 60000);
    return () => clearInterval(id);
  }, [date, pastEventLabel]);
  return (
    <span className={`countdown-pill ${isPast ? "past" : ""}`}>
      <Clock size={11} />
      {time}
    </span>
  );
}

export default function ActivityDetailClient() {
  const { id } = useParams<{ id: string }>();
  const { language } = useLanguage();
  const { user } = useAuth();
  const copy = activityDetailCopy[language];
  const [activity, setActivity] = useState<Activity | null>(null);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");

  useEffect(() => {
    return onSnapshot(doc(db, "activities", id), (d) => {
      if (d.exists()) setActivity(d.data() as Activity);
    });
  }, [id]);

  useEffect(() => {
    if (!showComments) return;
    const q = query(collection(db, "activities", id, "comments"), orderBy("createdAt"));
    return onSnapshot(q, (snap) =>
      setComments(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Comment)))
    );
  }, [showComments, id]);

  const prev = () => setLightbox((i) => (i! > 0 ? i! - 1 : activity!.images.length - 1));
  const next = () => setLightbox((i) => (i! < activity!.images.length - 1 ? i! + 1 : 0));

  // Keyboard lightbox navigation
  useEffect(() => {
    if (lightbox === null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
      else if (e.key === "Escape") setLightbox(null);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lightbox, activity]);

  const postComment = async () => {
    if (!commentText.trim()) return;
    await addDoc(collection(db, "activities", id, "comments"), {
      text: commentText.trim(),
      author: user?.email || "Guest",
      createdAt: serverTimestamp(),
    });
    setCommentText("");
  };

  const downloadImage = (src: string, idx: number) => {
    const a = document.createElement("a");
    a.href = src;
    a.download = `photo-${idx + 1}.jpg`;
    a.target = "_blank";
    a.click();
  };

  if (!activity) return (
    <div className="pt-32 text-center" style={{ color: "var(--text-muted)" }}>
      {copy.loading}
    </div>
  );

  return (
    <div className="pt-28 sm:pt-32 pb-20 px-3 sm:px-4 max-w-4xl mx-auto page-enter">
      {/* Back + Share row */}
      <div className="flex items-center justify-between mb-6 gap-3">
        <Link
          href="/activities"
          className="flex items-center gap-2 text-sm font-medium transition hover:text-[var(--accent)]"
          style={{ color: "var(--text-secondary)" }}
        >
          <ArrowLeft size={16} /> {copy.back}
        </Link>
        <ShareButton title={activity.title} />
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Hero image */}
        {activity.images?.[0] && (
          <div
            className="relative w-full h-56 sm:h-96 rounded-2xl overflow-hidden mb-6 cursor-pointer group"
            onClick={() => setLightbox(0)}
          >
            <Image
              src={activity.images[0]}
              alt={activity.title}
              fill
              sizes="(max-width: 640px) 100vw, 896px"
              className="object-cover group-hover:scale-105 transition duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </div>
        )}

        {/* Title & meta */}
        <h1
          className="font-display text-2xl sm:text-4xl font-extrabold mb-3 leading-tight"
          style={{ color: "var(--text-primary)" }}
        >
          {activity.title}
        </h1>
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <span
            className="flex items-center gap-1.5 text-sm"
            style={{ color: "var(--text-muted)" }}
          >
            <Calendar size={14} />
            {new Date(activity.date).toLocaleDateString(language === "bn" ? "bn-BD" : "en-US", {
              weekday: "long", year: "numeric", month: "long", day: "numeric",
            })}
          </span>
          <Countdown date={activity.date} pastEventLabel={copy.pastEvent} />
        </div>

        {/* Description */}
        <p
          className="text-sm sm:text-base leading-relaxed mb-10 whitespace-pre-line"
          style={{ color: "var(--text-secondary)" }}
        >
          {activity.description}
        </p>

        {/* Photo gallery */}
        {activity.images?.length > 1 && (
          <div className="mb-10">
            <h2
              className="font-display text-lg font-semibold mb-4"
              style={{ color: "var(--text-primary)" }}
            >
              {copy.gallery} ({activity.images.length} {copy.photos})
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
              {activity.images.map((img, i) => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.03 }}
                  className="relative aspect-square rounded-xl overflow-hidden cursor-pointer group"
                  onClick={() => setLightbox(i)}
                >
                  <Image
                    src={img}
                    alt={`${copy.photo} ${i + 1}`}
                    fill
                    sizes="(max-width: 640px) 50vw, 33vw"
                    className="object-cover group-hover:brightness-90 transition"
                  />
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Comments section */}
        <div
          className="announcement-card"
          style={{ marginTop: "2rem" }}
        >
          <button
            onClick={() => setShowComments((v) => !v)}
            className="flex items-center gap-2 w-full text-left font-display font-semibold text-sm"
            style={{ color: "var(--text-primary)" }}
          >
            <MessageCircle size={16} className="text-[var(--accent)]" />
            {showComments ? "Hide Comments" : `Comments${comments.length ? ` (${comments.length})` : ""}`}
            <motion.span
              animate={{ rotate: showComments ? 180 : 0 }}
              transition={{ duration: 0.25 }}
              className="ml-auto"
            >
              <ChevronDown size={15} style={{ color: "var(--text-muted)" }} />
            </motion.span>
          </button>

          <AnimatePresence>
            {showComments && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="mt-4 pt-4 space-y-3" style={{ borderTop: "1px solid var(--border)" }}>
                  {comments.length === 0 && (
                    <p className="text-xs text-center py-3" style={{ color: "var(--text-muted)" }}>
                      No comments yet. Be the first!
                    </p>
                  )}
                  {comments.map((c) => (
                    <motion.div
                      key={c.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-start gap-2.5 text-sm"
                    >
                      <div
                        className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-white"
                        style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-2))" }}
                      >
                        {c.author[0]?.toUpperCase()}
                      </div>
                      <div
                        className="flex-1 rounded-xl px-3 py-2 text-sm"
                        style={{ background: "var(--bg-section)", color: "var(--text-primary)" }}
                      >
                        <span className="font-semibold text-[var(--accent)] mr-1.5">
                          {c.author.split("@")[0]}
                        </span>
                        {c.text}
                      </div>
                    </motion.div>
                  ))}

                  {/* Comment input */}
                  <div className="pt-2">
                    <div className="flex gap-2">
                      <input
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="Write a comment..."
                        className="input-field flex-1 min-w-0 py-2.5 text-sm"
                        onKeyDown={(e) => e.key === "Enter" && postComment()}
                        id="activity-comment-input"
                      />
                      <motion.button
                        whileHover={{ scale: 1.06 }}
                        whileTap={{ scale: 0.92 }}
                        onClick={postComment}
                        disabled={!commentText.trim()}
                        className="btn-primary !py-2 !px-3 !text-sm flex-shrink-0"
                      >
                        <Send size={14} />
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center px-4"
            onClick={() => setLightbox(null)}
          >
            {/* Controls */}
            <button
              className="absolute top-4 right-4 text-white/70 hover:text-white z-10"
              onClick={() => setLightbox(null)}
            >
              <X size={28} />
            </button>
            <button
              className="absolute top-4 left-4 text-white/70 hover:text-white z-10 flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-white/10"
              onClick={(e) => { e.stopPropagation(); downloadImage(activity.images[lightbox], lightbox); }}
            >
              <Download size={14} /> Save
            </button>

            {activity.images.length > 1 && (
              <>
                <button
                  className="absolute left-3 sm:left-6 text-white/70 hover:text-white z-10 bg-white/10 rounded-full p-2"
                  onClick={(e) => { e.stopPropagation(); prev(); }}
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  className="absolute right-3 sm:right-6 text-white/70 hover:text-white z-10 bg-white/10 rounded-full p-2"
                  onClick={(e) => { e.stopPropagation(); next(); }}
                >
                  <ChevronRight size={24} />
                </button>
              </>
            )}

            <motion.img
              key={lightbox}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              src={activity.images[lightbox]}
              alt={`${copy.photo} ${lightbox + 1}`}
              className="max-h-[85vh] max-w-full rounded-xl object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            <p className="absolute bottom-4 text-white/50 text-sm">
              {lightbox + 1} / {activity.images.length}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
