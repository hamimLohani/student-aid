"use client";
import { useEffect, useState } from "react";
import { collection, onSnapshot, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Droplets, Phone, MapPin, AlertTriangle, CheckCircle2, Loader2, Heart } from "lucide-react";

interface Member {
  id: string;
  name: string;
  bloodGroup: string;
  phone?: string;
  address?: string;
  work?: string;
  image?: string;
}

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const BLOOD_COLORS: Record<string, string> = {
  "A+": "#ef4444", "A-": "#f97316", "B+": "#8b5cf6", "B-": "#6366f1",
  "AB+": "#06b6d4", "AB-": "#0891b2", "O+": "#22c55e", "O-": "#16a34a",
};

const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

export default function DonorFinderPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string>("");
  const [showEmergency, setShowEmergency] = useState(false);
  const [emergencyMsg, setEmergencyMsg] = useState("");
  const [emergencyLocation, setEmergencyLocation] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    return onSnapshot(collection(db, "members"), (snap) => {
      const all = snap.docs
        .map((d) => ({ id: d.id, ...d.data() } as Member))
        .filter((m) => m.bloodGroup);
      setMembers(all);
      setLoading(false);
    });
  }, []);

  const filtered = selected ? members.filter((m) => m.bloodGroup === selected) : members;

  const handleEmergency = async () => {
    if (!selected) return;
    setSubmitting(true);
    try {
      await addDoc(collection(db, "announcements"), {
        title: `🚨 Emergency Blood Request — ${selected}`,
        content: `<p><strong>Blood Group Needed:</strong> ${selected}</p><p><strong>Location:</strong> ${emergencyLocation || "Not specified"}</p>${emergencyMsg ? `<p><strong>Details:</strong> ${emergencyMsg}</p>` : ""}<p><em>Please contact any ${selected} blood group donor immediately.</em></p>`,
        timestamp: serverTimestamp(),
        likes: [],
        type: "emergency",
        bloodGroup: selected,
      });
      setSubmitted(true);
      setTimeout(() => { setSubmitted(false); setShowEmergency(false); setEmergencyMsg(""); setEmergencyLocation(""); }, 3000);
    } finally {
      setSubmitting(false);
    }
  };

  const bloodCounts = BLOOD_GROUPS.reduce((acc, bg) => {
    acc[bg] = members.filter((m) => m.bloodGroup === bg).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="pt-28 sm:pt-32 pb-20 px-4 max-w-5xl mx-auto page-enter">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
        <span className="badge mb-4"><Droplets size={12} /> Blood Donor Finder</span>
        <h1
          className="font-display text-4xl sm:text-5xl font-extrabold mb-4 leading-tight"
          style={{
            background: "linear-gradient(135deg, var(--text-primary) 0%, #ef4444 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Find a Blood Donor
        </h1>
        <p className="text-base sm:text-lg max-w-xl" style={{ color: "var(--text-secondary)" }}>
          Search for members by blood group. In an emergency, post an urgent request to the community.
        </p>
      </motion.div>

      {/* Blood group selector grid */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-4 sm:grid-cols-8 gap-2 sm:gap-3 mb-8"
      >
        {BLOOD_GROUPS.map((bg) => (
          <motion.button
            key={bg}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            onClick={() => setSelected(selected === bg ? "" : bg)}
            className="card flex flex-col items-center py-3 px-2 cursor-pointer transition-all"
            style={{
              borderColor: selected === bg ? BLOOD_COLORS[bg] : "var(--border)",
              background: selected === bg ? `${BLOOD_COLORS[bg]}15` : undefined,
              boxShadow: selected === bg ? `0 0 16px ${BLOOD_COLORS[bg]}30` : undefined,
            }}
          >
            <span className="text-base font-bold" style={{ color: BLOOD_COLORS[bg] }}>{bg}</span>
            <span className="text-[10px] mt-0.5" style={{ color: "var(--text-muted)" }}>
              {bloodCounts[bg] || 0}
            </span>
          </motion.button>
        ))}
      </motion.div>

      {/* Results summary + Emergency button */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <p className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>
          {loading ? "Loading..." : `${filtered.length} donor${filtered.length !== 1 ? "s" : ""} found${selected ? ` with ${selected}` : ""}`}
        </p>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setShowEmergency(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition"
          style={{
            background: "linear-gradient(135deg, #ef4444, #dc2626)",
            color: "#fff",
            boxShadow: "0 4px 16px rgba(239,68,68,0.35)",
          }}
        >
          <AlertTriangle size={14} />
          Emergency Request
        </motion.button>
      </div>

      {/* Member grid */}
      {!loading && (
        <motion.div
          initial="hidden"
          animate="show"
          variants={{ show: { transition: { staggerChildren: 0.05 } } }}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
        >
          {filtered.map((m) => (
            <motion.div key={m.id} variants={fadeUp} transition={{ type: "spring", stiffness: 300, damping: 24 }}>
              <Link href={`/members/${m.id}`} className="card block p-4 text-center group hover:border-red-400 transition-colors">
                {/* Avatar */}
                <div
                  className="relative w-14 h-14 rounded-full mx-auto mb-3 overflow-hidden flex items-center justify-center text-xl font-bold text-white flex-shrink-0"
                  style={{ background: `linear-gradient(135deg, ${BLOOD_COLORS[m.bloodGroup] || "#6366f1"}, ${BLOOD_COLORS[m.bloodGroup] || "#8b5cf6"}99)` }}
                >
                  {m.image ? (
                    <Image src={m.image} alt={m.name} fill sizes="56px" className="object-cover" />
                  ) : (
                    m.name[0]
                  )}
                </div>
                <h3
                  className="font-display text-sm font-bold mb-1 group-hover:text-red-500 transition-colors truncate"
                  style={{ color: "var(--text-primary)" }}
                >
                  {m.name}
                </h3>
                <span
                  className="pill pill-red text-xs inline-flex mb-2"
                  style={{ background: `${BLOOD_COLORS[m.bloodGroup]}20`, color: BLOOD_COLORS[m.bloodGroup] }}
                >
                  <Heart size={10} />
                  {m.bloodGroup}
                </span>
                {m.phone && (
                  <p className="text-xs truncate flex items-center justify-center gap-1" style={{ color: "var(--text-muted)" }}>
                    <Phone size={10} /> {m.phone}
                  </p>
                )}
                {m.address && (
                  <p className="text-[10px] truncate flex items-center justify-center gap-1 mt-0.5" style={{ color: "var(--text-muted)" }}>
                    <MapPin size={9} /> {m.address}
                  </p>
                )}
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="flex flex-col items-center py-24 text-center">
          <Droplets size={48} className="mb-4 opacity-20" style={{ color: "var(--text-muted)" }} />
          <p className="font-display text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
            No donors found {selected && `for ${selected}`}
          </p>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
            Try selecting a different blood group
          </p>
        </div>
      )}

      {/* Emergency Modal */}
      <AnimatePresence>
        {showEmergency && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowEmergency(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ type: "spring", stiffness: 340, damping: 28 }}
              className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 max-w-md mx-auto"
            >
              <div className="card p-6">
                {submitted ? (
                  <div className="text-center py-4">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center"
                      style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)" }}
                    >
                      <CheckCircle2 size={28} className="text-white" />
                    </motion.div>
                    <p className="font-display font-bold text-lg" style={{ color: "var(--text-primary)" }}>
                      Emergency Posted!
                    </p>
                    <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
                      Your request has been sent to the community.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white flex-shrink-0" style={{ background: "#ef4444" }}>
                        <AlertTriangle size={18} />
                      </div>
                      <div>
                        <h3 className="font-display font-bold" style={{ color: "var(--text-primary)" }}>Emergency Blood Request</h3>
                        <p className="text-xs" style={{ color: "var(--text-muted)" }}>Posts an urgent announcement to the community</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-medium block mb-1.5" style={{ color: "var(--text-secondary)" }}>
                          Blood Group Needed *
                        </label>
                        <select
                          value={selected}
                          onChange={(e) => setSelected(e.target.value)}
                          className="input-field"
                          id="emergency-blood-select"
                        >
                          <option value="">Select blood group</option>
                          {BLOOD_GROUPS.map((bg) => (
                            <option key={bg} value={bg}>{bg}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-medium block mb-1.5" style={{ color: "var(--text-secondary)" }}>Location</label>
                        <input
                          value={emergencyLocation}
                          onChange={(e) => setEmergencyLocation(e.target.value)}
                          placeholder="Hospital name, area..."
                          className="input-field"
                          id="emergency-location"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium block mb-1.5" style={{ color: "var(--text-secondary)" }}>Additional Details</label>
                        <textarea
                          value={emergencyMsg}
                          onChange={(e) => setEmergencyMsg(e.target.value)}
                          placeholder="Contact number, urgency details..."
                          rows={3}
                          className="input-field resize-none"
                          id="emergency-details"
                        />
                      </div>
                    </div>

                    <div className="flex gap-3 mt-5">
                      <motion.button
                        whileTap={{ scale: 0.96 }}
                        onClick={handleEmergency}
                        disabled={!selected || submitting}
                        className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white transition"
                        style={{ background: "linear-gradient(135deg, #ef4444, #dc2626)", opacity: !selected || submitting ? 0.6 : 1 }}
                      >
                        {submitting ? <Loader2 size={14} className="animate-spin" /> : <AlertTriangle size={14} />}
                        {submitting ? "Posting..." : "Post Emergency Request"}
                      </motion.button>
                      <button
                        onClick={() => setShowEmergency(false)}
                        className="btn-ghost !py-3 !px-4"
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
