"use client";
import { useEffect, useState } from "react";
import { collection, onSnapshot, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { donorsCopy } from "@/lib/i18n";
import { Droplets, Phone, MapPin, AlertTriangle, CheckCircle2, Loader2, Heart } from "lucide-react";

interface Member {
  id: string;
  name: string;
  bloodGroup: string;
  phone?: string;
  address?: string;
  work?: string;
  image?: string;
  memberType?: string;
  sscYear?: string;
}

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const BLOOD_COLORS: Record<string, string> = {
  "A+": "#ef4444", "A-": "#f97316", "B+": "#8b5cf6", "B-": "#6366f1",
  "AB+": "#06b6d4", "AB-": "#0891b2", "O+": "#22c55e", "O-": "#16a34a",
};

const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

export default function DonorFinderPage() {
  const { language } = useLanguage();
  const copy = donorsCopy[language];

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

  const filtered = (selected ? members.filter((m) => m.bloodGroup === selected) : members).sort((a, b) => {
    // 1. Founder Member priority
    const aFounder = a.memberType === "Founder Member";
    const bFounder = b.memberType === "Founder Member";
    if (aFounder && !bFounder) return -1;
    if (!aFounder && bFounder) return 1;

    // 2. SSC Year (Senior first -> earlier year)
    const aYear = a.sscYear ? parseInt(a.sscYear) : Infinity;
    const bYear = b.sscYear ? parseInt(b.sscYear) : Infinity;

    if (aYear !== bYear) {
      return aYear - bYear;
    }

    // Fallback to name
    return a.name.localeCompare(b.name);
  });

  const handleEmergency = async () => {
    if (!selected) return;
    setSubmitting(true);
    try {
      await addDoc(collection(db, "announcements"), {
        title: copy.announcementTitle.replace("{group}", selected),
        content: `<p><strong>${copy.announcementGroup}</strong> ${selected}</p><p><strong>${copy.announcementLocation}</strong> ${emergencyLocation || copy.announcementLocationNotSpecified}</p>${emergencyMsg ? `<p><strong>${copy.announcementDetails}</strong> ${emergencyMsg}</p>` : ""}<p><em>${copy.announcementFooter.replace("{group}", selected)}</em></p>`,
        timestamp: serverTimestamp(),
        likes: [],
        type: "emergency",
        bloodGroup: selected,
      });
      setSubmitted(true);
      setTimeout(() => { setSubmitted(false); setShowEmergency(false); setEmergencyMsg(""); setEmergencyLocation(""); }, 3000);
    } catch (error) {
      console.error("Error posting emergency request:", error);
      alert("Failed to post emergency request. Please try again or contact an admin.");
    } finally {
      setSubmitting(false);
    }
  };

  const bloodCounts = BLOOD_GROUPS.reduce((acc, bg) => {
    acc[bg] = members.filter((m) => m.bloodGroup === bg).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="pt-28 sm:pt-32 pb-20 px-4 max-w-5xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
        <span className="badge mb-4"><Droplets size={12} /> {copy.badge}</span>
        <h1
          className="font-display text-4xl sm:text-5xl font-extrabold mb-4 leading-tight"
          style={{
            background: "linear-gradient(135deg, var(--text-primary) 0%, #ef4444 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          {copy.title}
        </h1>
        <p className="text-base sm:text-lg max-w-xl" style={{ color: "var(--text-secondary)" }}>
          {copy.description}
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
              borderColor: selected === bg ? BLOOD_COLORS[bg] : `${BLOOD_COLORS[bg]}40`,
              background: selected === bg ? BLOOD_COLORS[bg] : `${BLOOD_COLORS[bg]}10`,
              boxShadow: selected === bg ? `0 8px 24px ${BLOOD_COLORS[bg]}40` : undefined,
            }}
          >
            <span className="text-base font-bold" style={{ color: selected === bg ? "#ffffff" : BLOOD_COLORS[bg] }}>{bg}</span>
            <span className="text-[10px] mt-0.5 font-medium" style={{ color: selected === bg ? "rgba(255,255,255,0.8)" : "var(--text-muted)" }}>
              {bloodCounts[bg] || 0}
            </span>
          </motion.button>
        ))}
      </motion.div>

      {/* Results summary + Emergency button */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <p className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>
          {loading
            ? copy.loading
            : language === "bn"
            ? `${filtered.length} জন ডোনার পাওয়া গেছে ${selected ? `(${selected})` : ""}`
            : `${filtered.length} donor${filtered.length !== 1 ? "s" : ""} found${selected ? ` with ${selected}` : ""}`}
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
          {copy.emergencyRequestBtn}
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
                    m.name.charAt(0)
                  )}
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                </div>
                <h3 className="font-display font-bold text-sm leading-tight mb-1 truncate group-hover:text-red-500 transition-colors" style={{ color: "var(--text-primary)" }}>{m.name}</h3>
                <div className="flex flex-col items-center gap-1.5 mt-2">
                  <span className="pill text-[10px]" style={{ borderColor: BLOOD_COLORS[m.bloodGroup], color: BLOOD_COLORS[m.bloodGroup], background: `${BLOOD_COLORS[m.bloodGroup]}10` }}>
                    Blood {m.bloodGroup}
                  </span>
                  <span className="text-xs truncate max-w-full opacity-70 flex items-center gap-1">
                    <MapPin size={10} /> {m.address || "No address"}
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Empty state */}
      {!loading && filtered.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-20 text-center">
          <Droplets size={48} className="mb-4 opacity-20" style={{ color: "var(--text-muted)" }} />
          <p className="font-display text-xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
            {copy.noDonorsFound}
          </p>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            {copy.tryDifferentGroup}
          </p>
        </motion.div>
      )}

      {/* Emergency Modal */}
      <AnimatePresence>
        {showEmergency && (
          <motion.div
            key="emergency-modal-wrapper"
            className="fixed inset-0 z-50 flex items-start justify-center pt-28 px-4"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowEmergency(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ type: "spring", stiffness: 340, damping: 28 }}
              className="relative w-full max-w-md z-10"
            >
              <div className="card p-6">
                {submitted ? (
                  <div className="text-center py-4">
                    <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-4 mx-auto">
                      <CheckCircle2 size={32} className="text-green-500" />
                    </div>
                    <h3 className="font-display text-2xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
                      {copy.postedSuccessTitle}
                    </h3>
                    <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
                      {copy.postedSuccessSub}
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500 flex-shrink-0">
                        <Heart size={20} />
                      </div>
                      <div>
                        <h3 className="font-display font-bold" style={{ color: "var(--text-primary)" }}>{copy.modalTitle}</h3>
                        <p className="text-xs" style={{ color: "var(--text-muted)" }}>{copy.modalSub}</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-medium block mb-1.5" style={{ color: "var(--text-secondary)" }}>
                          {copy.announcementGroup} *
                        </label>
                        <select
                          value={selected}
                          onChange={(e) => setSelected(e.target.value)}
                          className="input-field"
                          id="emergency-blood-select"
                        >
                          <option value="" disabled>{copy.selectGroup}</option>
                          {BLOOD_GROUPS.map((bg) => (
                            <option key={bg} value={bg}>{bg}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="space-y-1.5">
                        <label htmlFor="emergency-location" className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                          {copy.locationLabel} <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
                          <input
                            type="text"
                            value={emergencyLocation}
                            onChange={(e) => setEmergencyLocation(e.target.value)}
                            className="input-field pl-10"
                            placeholder={copy.locationPlaceholder}
                            id="emergency-location"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label htmlFor="emergency-details" className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                          {copy.detailsLabel}
                        </label>
                        <textarea
                          value={emergencyMsg}
                          onChange={(e) => setEmergencyMsg(e.target.value)}
                          className="input-field min-h-[100px] resize-y"
                          placeholder={copy.detailsPlaceholder}
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
                        {submitting ? copy.posting : copy.postRequest}
                      </motion.button>
                      <button
                        onClick={() => setShowEmergency(false)}
                        className="btn-ghost !py-3 !px-4"
                      >
                        {copy.cancel}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
