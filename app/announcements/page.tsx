"use client";
import { useEffect, useState } from "react";
import {
  collection, onSnapshot, orderBy, query,
  addDoc, updateDoc, doc, arrayUnion, arrayRemove, serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";
import { motion } from "framer-motion";
import { Heart, MessageCircle, Send } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { announcementsCopy } from "@/lib/i18n";

interface Announcement { id: string; title: string; content: string; timestamp: { seconds: number }; likes: string[]; }
interface Comment { id: string; text: string; author: string; authorImage?: string; createdAt: { seconds: number }; }
function AnnouncementCard({ a }: { a: Announcement }) {
  const { user } = useAuth();
  const { language } = useLanguage();
  const copy = announcementsCopy[language];
  const [comments, setComments] = useState<Comment[]>([]);
  const [showComments, setShowComments] = useState(false);
  const [text, setText] = useState("");
  const liked = user && a.likes?.includes(user.uid);

  useEffect(() => {
    if (!showComments) return;
    const q = query(collection(db, "announcements", a.id, "comments"), orderBy("createdAt"));
    return onSnapshot(q, (snap) => setComments(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Comment))));
  }, [showComments, a.id]);

  const toggleLike = async () => {
    if (!user) return;
    await updateDoc(doc(db, "announcements", a.id), { likes: liked ? arrayRemove(user.uid) : arrayUnion(user.uid) });
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
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card p-4 sm:p-6">
      <h3 className="text-lg sm:text-xl font-semibold mb-2">{a.title}</h3>
      <p className="text-secondary text-sm mb-3">{a.content}</p>
      <p className="text-muted text-xs mb-4">{a.timestamp ? new Date(a.timestamp.seconds * 1000).toLocaleString() : ""}</p>
      <div className="flex items-center gap-4">
        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.85 }} onClick={toggleLike} className={`flex items-center gap-1.5 text-sm transition ${liked ? "text-red-500" : "text-muted hover:text-red-500"}`}>
          <Heart size={16} fill={liked ? "currentColor" : "none"} /> {a.likes?.length || 0}
        </motion.button>
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.9 }} onClick={() => setShowComments(!showComments)} className="flex items-center gap-1.5 text-sm text-muted hover:text-indigo-600 dark:hover:text-white transition">
          <MessageCircle size={16} /> {showComments ? copy.hide : `${copy.comments}${comments.length ? ` (${comments.length})` : ""}`}
        </motion.button>
      </div>

      {showComments && (
        <div className="mt-4 border-t border-[var(--border)] pt-4 space-y-3">
          {comments.map((c) => (
            <div key={c.id} className="flex items-start gap-2 text-sm">
              <div className="relative w-7 h-7 rounded-full overflow-hidden bg-indigo-600/30 flex-shrink-0 mt-0.5">
                {c.authorImage
                  ? <Image src={c.authorImage} alt={c.author} fill sizes="28px" className="object-cover" />
                  : <span className="w-full h-full flex items-center justify-center text-xs font-bold text-indigo-300">{c.author[0]?.toUpperCase()}</span>}
              </div>
              <div>
                <span className="text-indigo-600 dark:text-indigo-400 font-medium">{c.author} </span>
                <span className="text-secondary">{c.text}</span>
              </div>
            </div>
          ))}

          <div className="space-y-2 mt-3">
            <p className="text-xs text-muted">
              {copy.commentingAs} {user?.email || copy.guest}
            </p>
            <div className="flex gap-2">
              <input value={text} onChange={(e) => setText(e.target.value)}
                placeholder={copy.writeComment}
                className="input-field flex-1 min-w-0 py-2"
                onKeyDown={(e) => e.key === "Enter" && postComment()}
              />
              <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.9 }} onClick={postComment} className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-2 rounded-lg transition flex-shrink-0">
                <Send size={14} />
              </motion.button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default function AnnouncementsPage() {
  const { language } = useLanguage();
  const copy = announcementsCopy[language];
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  useEffect(() => {
    const q = query(collection(db, "announcements"), orderBy("timestamp", "desc"));
    return onSnapshot(q, (snap) => setAnnouncements(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Announcement))));
  }, []);

  return (
    <div className="pt-20 sm:pt-24 pb-16 px-3 sm:px-4 max-w-6xl mx-auto">
      <h1 className="text-3xl sm:text-4xl font-bold mb-1">{copy.title}</h1>
      <p className="text-secondary text-sm sm:text-base mb-8 sm:mb-10">{copy.description}</p>
      {announcements.length === 0 && <p className="text-muted text-center py-20">{copy.empty}</p>}
      <div className="max-w-3xl space-y-4 sm:space-y-6">
        {announcements.map((a) => <AnnouncementCard key={a.id} a={a} />)}
      </div>
    </div>
  );
}
