"use client";
import { useEffect, useState, useRef } from "react";
import {
  collection, onSnapshot, orderBy, query,
  addDoc, updateDoc, doc, arrayUnion, arrayRemove, serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, MessageCircle, Send, ChevronDown, User } from "lucide-react";

interface Announcement { id: string; title: string; content: string; timestamp: { seconds: number }; likes: string[]; }
interface Comment { id: string; text: string; author: string; authorImage?: string; createdAt: { seconds: number }; }
interface Member { id: string; name: string; image?: string; }

function MemberPicker({ members, selected, onSelect }: { members: Member[]; selected: Member | null; onSelect: (m: Member | null) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen(!open)}
        className="flex items-center gap-2 input-field py-2 pr-3 cursor-pointer text-left w-full"
      >
        {selected ? (
          <>
            <div className="w-6 h-6 rounded-full overflow-hidden bg-indigo-600/30 flex-shrink-0">
              {selected.image
                ? <img src={selected.image} alt={selected.name} className="w-full h-full object-cover" />
                : <span className="w-full h-full flex items-center justify-center text-xs font-bold text-indigo-300">{selected.name[0]}</span>}
            </div>
            <span className="text-sm flex-1 truncate">{selected.name}</span>
          </>
        ) : (
          <>
            <User size={14} className="text-muted flex-shrink-0" />
            <span className="text-muted text-sm flex-1">Comment as...</span>
          </>
        )}
        <ChevronDown size={14} className={`text-muted transition-transform flex-shrink-0 ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="absolute z-20 top-full mt-1 w-full card py-1 max-h-48 overflow-y-auto shadow-lg"
          >
            <button type="button" onClick={() => { onSelect(null); setOpen(false); }}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-muted hover:text-indigo-600 dark:hover:text-white hover:bg-indigo-50 dark:hover:bg-indigo-600/10 transition"
            >
              <User size={14} /> Guest
            </button>
            {members.map((m) => (
              <button type="button" key={m.id} onClick={() => { onSelect(m); setOpen(false); }}
                className="flex items-center gap-2 w-full px-3 py-2 hover:bg-indigo-50 dark:hover:bg-indigo-600/10 transition"
              >
                <div className="w-6 h-6 rounded-full overflow-hidden bg-indigo-600/30 flex-shrink-0">
                  {m.image
                    ? <img src={m.image} alt={m.name} className="w-full h-full object-cover" />
                    : <span className="w-full h-full flex items-center justify-center text-xs font-bold text-indigo-300">{m.name[0]}</span>}
                </div>
                <span className="text-sm truncate">{m.name}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function AnnouncementCard({ a, members }: { a: Announcement; members: Member[] }) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [showComments, setShowComments] = useState(false);
  const [text, setText] = useState("");
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
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
      text,
      author: selectedMember?.name || user?.email || "Guest",
      authorImage: selectedMember?.image || "",
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
          <MessageCircle size={16} /> {showComments ? "Hide" : `Comments${comments.length ? ` (${comments.length})` : ""}`}
        </motion.button>
      </div>

      {showComments && (
        <div className="mt-4 border-t border-[var(--border)] pt-4 space-y-3">
          {comments.map((c) => (
            <div key={c.id} className="flex items-start gap-2 text-sm">
              <div className="w-7 h-7 rounded-full overflow-hidden bg-indigo-600/30 flex-shrink-0 mt-0.5">
                {c.authorImage
                  ? <img src={c.authorImage} alt={c.author} className="w-full h-full object-cover" />
                  : <span className="w-full h-full flex items-center justify-center text-xs font-bold text-indigo-300">{c.author[0]?.toUpperCase()}</span>}
              </div>
              <div>
                <span className="text-indigo-600 dark:text-indigo-400 font-medium">{c.author} </span>
                <span className="text-secondary">{c.text}</span>
              </div>
            </div>
          ))}

          <div className="space-y-2 mt-3">
            <MemberPicker members={members} selected={selectedMember} onSelect={setSelectedMember} />
            <div className="flex gap-2">
              <input value={text} onChange={(e) => setText(e.target.value)}
                placeholder="Write a comment..."
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
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [members, setMembers] = useState<Member[]>([]);

  useEffect(() => {
    const q = query(collection(db, "announcements"), orderBy("timestamp", "desc"));
    const unsub1 = onSnapshot(q, (snap) => setAnnouncements(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Announcement))));
    const unsub2 = onSnapshot(collection(db, "members"), (snap) => setMembers(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Member))));
    return () => { unsub1(); unsub2(); };
  }, []);

  return (
    <div className="pt-20 sm:pt-24 pb-16 px-3 sm:px-4 max-w-6xl mx-auto">
      <h1 className="text-3xl sm:text-4xl font-bold mb-1">Announcements</h1>
      <p className="text-secondary text-sm sm:text-base mb-8 sm:mb-10">Stay updated with the latest news from Student Aid BDG.</p>
      {announcements.length === 0 && <p className="text-muted text-center py-20">No announcements yet.</p>}
      <div className="max-w-3xl space-y-4 sm:space-y-6">
        {announcements.map((a) => <AnnouncementCard key={a.id} a={a} members={members} />)}
      </div>
    </div>
  );
}
