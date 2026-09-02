"use client";
import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  addDoc,
  updateDoc,
  doc,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  MessageCircle,
  Send,
  Megaphone,
  ChevronDown,
  Clock,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { announcementsCopy } from "@/lib/i18n";
import ShareButton from "@/components/ShareButton";

interface Announcement {
  id: string;
  title: string;
  content: string;
  timestamp: { seconds: number };
  likes: string[];
}
interface Comment {
  id: string;
  text: string;
  author: string;
  authorImage?: string;
  createdAt: { seconds: number };
}

/* ── Relative time formatter ── */
function timeAgo(seconds: number): string {
  const diff = Math.floor(Date.now() / 1000 - seconds);
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(seconds * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/* ── Skeleton ── */
function SkeletonAnnouncement() {
  return (
    <div className="announcement-card space-y-3">
      <div className="skeleton h-5 w-2/3 rounded-lg" />
      <div className="skeleton h-4 w-full rounded-lg" />
      <div className="skeleton h-4 w-3/4 rounded-lg" />
      <div className="flex gap-4 mt-4">
        <div className="skeleton h-6 w-16 rounded-full" />
        <div className="skeleton h-6 w-24 rounded-full" />
      </div>
    </div>
  );
}

/* ── Single Announcement Card ── */
function AnnouncementCard({ a }: { a: Announcement }) {
  const { user } = useAuth();
  const { language } = useLanguage();
  const copy = announcementsCopy[language];
  const [comments, setComments] = useState<Comment[]>([]);
  const [showComments, setShowComments] = useState(false);
  const [text, setText] = useState("");
  const [likeAnim, setLikeAnim] = useState(false);
  const liked = !!(user && a.likes?.includes(user.uid));

  useEffect(() => {
    if (!showComments) return;
    const q = query(
      collection(db, "announcements", a.id, "comments"),
      orderBy("createdAt")
    );
    return onSnapshot(q, (snap) =>
      setComments(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Comment)))
    );
  }, [showComments, a.id]);

  const toggleLike = async () => {
    if (!user) return;
    setLikeAnim(true);
    setTimeout(() => setLikeAnim(false), 500);
    await updateDoc(doc(db, "announcements", a.id), {
      likes: liked ? arrayRemove(user.uid) : arrayUnion(user.uid),
    });
  };

  const postComment = async () => {
    if (!text.trim()) return;
    await addDoc(collection(db, "announcements", a.id, "comments"), {
      text: text.trim(),
      author: user?.email || copy.guest,
      authorImage: "",
      createdAt: serverTimestamp(),
    });
    setText("");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 280, damping: 24 }}
      className="announcement-card"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3
          className="font-display text-lg sm:text-xl font-bold leading-snug"
          style={{ color: "var(--text-primary)" }}
        >
          {a.title}
        </h3>
        {a.timestamp && (
          <span
            className="flex items-center gap-1 text-xs flex-shrink-0 mt-0.5"
            style={{ color: "var(--text-muted)" }}
          >
            <Clock size={11} />
            {timeAgo(a.timestamp.seconds)}
          </span>
        )}
      </div>

      {/* Content — renders rich HTML or plain text */}
      <div
        className="text-sm leading-relaxed mb-4 rich-content"
        style={{ color: "var(--text-secondary)" }}
        dangerouslySetInnerHTML={{ __html: a.content }}
      />

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2 flex-wrap" style={{ borderTop: "1px solid var(--border)" }}>
        {/* Like */}
        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={toggleLike}
          className={`flex items-center gap-1.5 text-sm font-semibold transition-colors ${
            liked ? "text-red-500" : "hover:text-red-400"
          }`}
          style={{ color: liked ? undefined : "var(--text-muted)" }}
        >
          <motion.span animate={likeAnim ? { scale: [1, 1.5, 0.9, 1] } : {}}>
            <Heart
              size={16}
              fill={liked ? "currentColor" : "none"}
              className={likeAnim ? "heart-liked" : ""}
            />
          </motion.span>
          {a.likes?.length || 0}
        </motion.button>

        {/* Comments toggle */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-indigo-500"
          style={{ color: "var(--text-muted)" }}
        >
          <MessageCircle size={16} />
          {showComments
            ? copy.hide
            : `${copy.comments}${comments.length ? ` (${comments.length})` : ""}`}
          <motion.span
            animate={{ rotate: showComments ? 180 : 0 }}
            transition={{ duration: 0.25 }}
          >
            <ChevronDown size={14} />
          </motion.span>
        </motion.button>

        {/* Share */}
        <div className="ml-auto">
          <ShareButton compact />
        </div>
      </div>

      {/* Comments panel */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div
              className="mt-4 pt-4 space-y-3"
              style={{ borderTop: "1px solid var(--border)" }}
            >
              {/* Comment list */}
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
                  {/* Avatar */}
                  <div
                    className="relative w-7 h-7 rounded-full overflow-hidden flex-shrink-0 mt-0.5 flex items-center justify-center text-xs font-bold text-white"
                    style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
                  >
                    {c.authorImage ? (
                      <Image
                        src={c.authorImage}
                        alt={c.author}
                        fill
                        sizes="28px"
                        className="object-cover"
                      />
                    ) : (
                      c.author[0]?.toUpperCase()
                    )}
                  </div>
                  <div
                    className="flex-1 rounded-xl px-3 py-2 text-sm"
                    style={{
                      background: "var(--bg-section)",
                      color: "var(--text-primary)",
                    }}
                  >
                    <span
                      className="font-semibold text-indigo-500 mr-1.5"
                      style={{ fontFamily: "'Outfit', system-ui, sans-serif" }}
                    >
                      {c.author.split("@")[0]}
                    </span>
                    {c.text}
                  </div>
                </motion.div>
              ))}

              {/* Comment input */}
              <div className="pt-2">
                <p className="text-xs mb-2" style={{ color: "var(--text-muted)" }}>
                  {copy.commentingAs}{" "}
                  <span style={{ color: "var(--accent)" }}>
                    {user?.email || copy.guest}
                  </span>
                </p>
                <div className="flex gap-2">
                  <input
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder={copy.writeComment}
                    className="input-field flex-1 min-w-0 py-2.5 text-sm"
                    onKeyDown={(e) => e.key === "Enter" && postComment()}
                    id={`comment-input-${a.id}`}
                  />
                  <motion.button
                    whileHover={{ scale: 1.06 }}
                    whileTap={{ scale: 0.92 }}
                    onClick={postComment}
                    disabled={!text.trim()}
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
    </motion.div>
  );
}

/* ── Page ── */
export default function AnnouncementsPage() {
  const { language } = useLanguage();
  const copy = announcementsCopy[language];
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, "announcements"),
      orderBy("timestamp", "desc")
    );
    return onSnapshot(q, (snap) => {
      setAnnouncements(
        snap.docs.map((d) => ({ id: d.id, ...d.data() } as Announcement))
      );
      setLoading(false);
    });
  }, []);

  return (
    <div className="pt-28 sm:pt-32 pb-20 px-4 max-w-3xl mx-auto page-enter">
      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-10"
      >
        <span className="badge mb-4">
          <Megaphone size={12} />
          {copy.title}
        </span>
        <h1
          className="font-display text-4xl sm:text-5xl font-extrabold mb-4 leading-tight"
          style={{
            background: "linear-gradient(135deg, var(--text-primary) 0%, #6366f1 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          {copy.title}
        </h1>
        <p className="text-base sm:text-lg" style={{ color: "var(--text-secondary)" }}>
          {copy.description}
        </p>
      </motion.div>

      {/* Skeleton */}
      {loading && (
        <div className="space-y-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonAnnouncement key={i} />
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && announcements.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center py-32 text-center"
        >
          <div
            className="w-20 h-20 rounded-3xl flex items-center justify-center mb-6"
            style={{ background: "var(--bg-section)" }}
          >
            <Megaphone size={36} style={{ color: "var(--text-muted)" }} />
          </div>
          <p className="font-display text-xl font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
            No Announcements
          </p>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            {copy.empty}
          </p>
        </motion.div>
      )}

      {/* Announcement list */}
      {!loading && announcements.length > 0 && (
        <div className="space-y-5">
          {announcements.map((a) => (
            <AnnouncementCard key={a.id} a={a} />
          ))}
        </div>
      )}
    </div>
  );
}
