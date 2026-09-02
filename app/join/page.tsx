"use client";
import { useEffect, useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { formatBdPhone, normalizeBdPhone } from "@/lib/phone";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import toast from "react-hot-toast";
import {
  Camera,
  User,
  GraduationCap,
  Briefcase,
  MapPin,
  Phone,
  Mail,
  Droplets,
  MessageSquare,
  CheckCircle2,
  Users,
  Heart,
  Zap,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { getMemberTypeLabel, joinCopy } from "@/lib/i18n";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const MEMBER_TYPES = ["Senior Member", "Junior Member", "Locals"] as const;

/* ── Field wrapper ── */
function FieldWrap({
  label,
  icon,
  children,
  required,
}: {
  label: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <div>
      <label
        className="flex items-center gap-1.5 text-sm font-medium mb-1.5"
        style={{ color: "var(--text-secondary)", fontFamily: "'Outfit', system-ui, sans-serif" }}
      >
        {icon && <span style={{ color: "var(--accent)" }}>{icon}</span>}
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

/* ── Benefits panel ── */
const benefits = [
  { icon: <Users size={20} />, text: "Join a growing network of 120+ students" },
  { icon: <Zap size={20} />, text: "Access exclusive events and activities" },
  { icon: <Heart size={20} />, text: "Support and be supported by peers" },
  { icon: <GraduationCap size={20} />, text: "Connect across SSC batches and professions" },
];

export default function JoinPage() {
  const { language } = useLanguage();
  const copy = joinCopy[language];

  const [form, setForm] = useState({
    name: "",
    sscYear: "",
    memberType: "",
    work: "",
    workplace: "",
    bloodGroup: "",
    address: "",
    phone: "",
    email: "",
    message: "",
  });
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const set = (key: string, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (preview) URL.revokeObjectURL(preview);
    setPhoto(file);
    setPreview(file ? URL.createObjectURL(file) : null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { name, memberType, work, workplace, bloodGroup, address, phone } = form;
    if (!name || !memberType || !work || !workplace || !bloodGroup || !address || !phone) {
      return toast.error(copy.requiredFields);
    }
    const normalizedPhone = normalizeBdPhone(phone);
    if (!normalizedPhone) return toast.error(copy.invalidPhone);

    setLoading(true);
    try {
      let image = "";
      if (photo) {
        toast.loading(copy.uploadingPhoto, { id: "photo" });
        image = await uploadToCloudinary(photo);
      }
      await addDoc(collection(db, "joinRequests"), {
        ...form,
        phone: formatBdPhone(normalizedPhone),
        image,
        createdAt: serverTimestamp(),
        status: "pending",
      });
      setSubmitted(true);
      toast.success(copy.submitted);
    } catch {
      toast.error(copy.failed);
    } finally {
      toast.dismiss("photo");
      setLoading(false);
    }
  };

  /* ── Success state ── */
  if (submitted) {
    return (
      <div className="pt-24 pb-20 px-4 min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 280, damping: 22 }}
          className="card p-10 max-w-md w-full text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
            className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)" }}
          >
            <CheckCircle2 size={40} className="text-white" />
          </motion.div>
          <h2 className="font-display text-2xl font-bold mb-3" style={{ color: "var(--text-primary)" }}>
            Request Submitted!
          </h2>
          <p className="text-sm leading-relaxed mb-6" style={{ color: "var(--text-secondary)" }}>
            {copy.submitted}. We&apos;ll review your application and get back to you soon.
          </p>
          <button
            onClick={() => {
              setSubmitted(false);
              setForm({ name: "", sscYear: "", memberType: "", work: "", workplace: "", bloodGroup: "", address: "", phone: "", email: "", message: "" });
              setPhoto(null);
              setPreview(null);
            }}
            className="btn-ghost w-full justify-center"
          >
            Submit Another
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-20 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Page header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <span className="badge mb-4">
            <Users size={12} />
            Join Community
          </span>
          <h1
            className="font-display text-4xl sm:text-5xl md:text-6xl font-extrabold mb-4 leading-tight"
            style={{
              background: "linear-gradient(135deg, var(--text-primary) 0%, #6366f1 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {copy.title}
          </h1>
          <p className="text-base sm:text-lg max-w-xl mx-auto" style={{ color: "var(--text-secondary)" }}>
            {copy.description}
          </p>
        </motion.div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.6fr] gap-8 items-start">
          {/* Left — Benefits panel */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="lg:sticky lg:top-24"
          >
            <div className="card p-6 sm:p-8 relative overflow-hidden">
              {/* Background orb */}
              <div
                className="absolute -top-10 -right-10 w-40 h-40 rounded-full blur-3xl pointer-events-none"
                style={{ background: "var(--orb-1)" }}
                aria-hidden="true"
              />

              {/* Photo upload section */}
              <div className="flex flex-col items-center mb-8">
                <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "var(--text-muted)" }}>
                  Profile Photo
                </p>
                <motion.div
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  className="relative w-28 h-28 rounded-full overflow-hidden cursor-pointer border-2 border-dashed transition-colors"
                  style={{ borderColor: preview ? "var(--accent)" : "var(--border)" }}
                  onClick={() => document.getElementById("photo-input")?.click()}
                >
                  {preview ? (
                    <Image
                      src={preview}
                      alt="Preview"
                      fill
                      sizes="112px"
                      className="object-cover"
                    />
                  ) : (
                    <div
                      className="w-full h-full flex flex-col items-center justify-center gap-2"
                      style={{ background: "var(--bg-section)", color: "var(--text-muted)" }}
                    >
                      <Camera size={24} />
                      <span className="text-[10px] font-medium">{copy.photo}</span>
                    </div>
                  )}
                </motion.div>
                <input
                  id="photo-input"
                  type="file"
                  accept="image/*"
                  onChange={handlePhoto}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => document.getElementById("photo-input")?.click()}
                  className="text-xs mt-3 font-semibold transition-colors hover:text-indigo-400"
                  style={{ color: "var(--accent)" }}
                >
                  {preview ? copy.changePhoto : copy.uploadPhoto}
                </button>
              </div>

              {/* Divider */}
              <div className="glow-line mb-6" />

              {/* Benefits */}
              <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "var(--text-muted)" }}>
                Why Join Us?
              </p>
              <ul className="space-y-4">
                {benefits.map((b, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className="flex items-start gap-3"
                  >
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-white"
                      style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
                    >
                      {b.icon}
                    </div>
                    <p className="text-sm leading-relaxed mt-1" style={{ color: "var(--text-secondary)" }}>
                      {b.text}
                    </p>
                  </motion.li>
                ))}
              </ul>

              <p className="text-xs mt-6 leading-relaxed" style={{ color: "var(--text-muted)" }}>
                * {copy.optionalInfo}
              </p>
            </div>
          </motion.div>

          {/* Right — Form */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <form onSubmit={handleSubmit} className="card p-6 sm:p-8 space-y-5">
              <h2 className="font-display text-xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>
                Personal Information
              </h2>

              <FieldWrap label={copy.fullName} icon={<User size={14} />} required>
                <input
                  required
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  placeholder={copy.fullNamePlaceholder}
                  className="input-field"
                  id="join-name"
                />
              </FieldWrap>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <FieldWrap label={copy.sscYear} icon={<GraduationCap size={14} />}>
                  <select
                    value={form.sscYear}
                    onChange={(e) => set("sscYear", e.target.value)}
                    className="input-field"
                    id="join-sscyear"
                  >
                    <option value="">{copy.selectSscYear}</option>
                    {Array.from({ length: 50 }, (_, i) => new Date().getFullYear() - i).map((y) => (
                      <option key={y} value={String(y)}>{y}</option>
                    ))}
                  </select>
                </FieldWrap>

                <FieldWrap label={copy.memberType} icon={<Users size={14} />} required>
                  <select
                    required
                    value={form.memberType}
                    onChange={(e) => set("memberType", e.target.value)}
                    className="input-field"
                    id="join-membertype"
                  >
                    <option value="">{copy.selectMemberType}</option>
                    {MEMBER_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {getMemberTypeLabel(type, language)}
                      </option>
                    ))}
                  </select>
                </FieldWrap>
              </div>

              <div className="glow-line" />
              <h2 className="font-display text-xl font-bold" style={{ color: "var(--text-primary)" }}>
                Professional Details
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <FieldWrap label={copy.occupation} icon={<Briefcase size={14} />} required>
                  <input
                    required
                    value={form.work}
                    onChange={(e) => set("work", e.target.value)}
                    placeholder={copy.occupationPlaceholder}
                    className="input-field"
                    id="join-work"
                  />
                </FieldWrap>
                <FieldWrap label={copy.workplace} icon={<Briefcase size={14} />} required>
                  <input
                    required
                    value={form.workplace}
                    onChange={(e) => set("workplace", e.target.value)}
                    placeholder={copy.workplacePlaceholder}
                    className="input-field"
                    id="join-workplace"
                  />
                </FieldWrap>
              </div>

              <FieldWrap label={copy.address} icon={<MapPin size={14} />} required>
                <input
                  required
                  value={form.address}
                  onChange={(e) => set("address", e.target.value)}
                  placeholder={copy.addressPlaceholder}
                  className="input-field"
                  id="join-address"
                />
              </FieldWrap>

              <div className="glow-line" />
              <h2 className="font-display text-xl font-bold" style={{ color: "var(--text-primary)" }}>
                Contact & Health
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <FieldWrap label={copy.phone} icon={<Phone size={14} />} required>
                  <input
                    required
                    type="tel"
                    value={form.phone}
                    onChange={(e) => set("phone", e.target.value)}
                    placeholder={copy.phonePlaceholder}
                    inputMode="numeric"
                    title={copy.phoneTitle}
                    className="input-field"
                    id="join-phone"
                  />
                </FieldWrap>
                <FieldWrap label={copy.email} icon={<Mail size={14} />}>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                    placeholder={copy.emailPlaceholder}
                    className="input-field"
                    id="join-email"
                  />
                </FieldWrap>
              </div>

              <FieldWrap label={copy.bloodGroup} icon={<Droplets size={14} />} required>
                <select
                  required
                  value={form.bloodGroup}
                  onChange={(e) => set("bloodGroup", e.target.value)}
                  className="input-field"
                  id="join-blood"
                >
                  <option value="">{copy.selectBloodGroup}</option>
                  {BLOOD_GROUPS.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </FieldWrap>

              <FieldWrap label={copy.message} icon={<MessageSquare size={14} />}>
                <textarea
                  value={form.message}
                  onChange={(e) => set("message", e.target.value)}
                  rows={3}
                  placeholder={copy.messagePlaceholder}
                  className="input-field resize-none"
                  id="join-message"
                />
              </FieldWrap>

              {/* Submit */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                type="submit"
                disabled={loading}
                className="btn-primary w-full justify-center !text-base !py-4 mt-2"
                id="join-submit"
              >
                {loading ? (
                  <>
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                      className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                    />
                    {copy.submitting}
                  </>
                ) : (
                  copy.submit
                )}
              </motion.button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
