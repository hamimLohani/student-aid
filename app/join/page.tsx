"use client";
import { useEffect, useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { formatBdPhone, normalizeBdPhone } from "@/lib/phone";
import { motion } from "framer-motion";
import Image from "next/image";
import toast from "react-hot-toast";
import { Camera } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { getMemberTypeLabel, joinCopy } from "@/lib/i18n";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const MEMBER_TYPES = ["Senior Member", "Junior Member", "Locals"] as const;
const inputCls = "input-field";

export default function JoinPage() {
  const { language } = useLanguage();
  const copy = joinCopy[language];
  const [form, setForm] = useState({
    name: "", sscYear: "", memberType: "", work: "", workplace: "", bloodGroup: "",
    address: "", phone: "", email: "", message: "",
  });
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const set = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

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
    if (!normalizedPhone) {
      return toast.error(copy.invalidPhone);
    }
    setLoading(true);
    try {
      let image = "";
      if (photo) {
        toast.loading(copy.uploadingPhoto, { id: "photo" });
        image = await uploadToCloudinary(photo);
      }
      await addDoc(collection(db, "joinRequests"), { ...form, phone: formatBdPhone(normalizedPhone), image, createdAt: serverTimestamp(), status: "pending" });
      toast.success(copy.submitted);
      setForm({ name: "", sscYear: "", memberType: "", work: "", workplace: "", bloodGroup: "", address: "", phone: "", email: "", message: "" });
      setPhoto(null);
      setPreview(null);
    } catch {
      toast.error(copy.failed);
    } finally {
      toast.dismiss("photo");
      setLoading(false);
    }
  };

  return (
    <div className="pt-20 sm:pt-24 pb-16 px-4 max-w-xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl sm:text-4xl font-bold mb-2">{copy.title}</h1>
        <p className="text-secondary text-sm sm:text-base mb-1">{copy.description}</p>
        <p className="text-muted text-xs mb-6">{copy.optionalInfo}</p>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Profile Photo */}
          <div className="flex flex-col items-center gap-3 py-2">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-100 dark:bg-white/5 border-2 border-dashed border-gray-300 dark:border-white/20 flex items-center justify-center cursor-pointer hover:border-indigo-500 transition"
              onClick={() => document.getElementById("photo-input")?.click()}
            >
              {preview ? (
                <Image src={preview} alt="Preview" fill sizes="96px" className="object-cover" />
              ) : (
                <div className="flex flex-col items-center gap-1 text-muted">
                  <Camera size={22} />
                  <span className="text-xs">{copy.photo}</span>
                </div>
              )}
            </motion.div>
            <input id="photo-input" type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
            <button type="button" onClick={() => document.getElementById("photo-input")?.click()}
              className="text-xs text-indigo-400 hover:text-indigo-300 transition"
            >
              {preview ? copy.changePhoto : copy.uploadPhoto}
            </button>
          </div>

          <div>
            <label className="block text-sm text-secondary mb-1">{copy.fullName}</label>
            <input required value={form.name} onChange={(e) => set("name", e.target.value)} placeholder={copy.fullNamePlaceholder} className={inputCls} />
          </div>

          <div>
            <label className="block text-sm text-secondary mb-1">{copy.sscYear}</label>
            <select value={form.sscYear} onChange={(e) => set("sscYear", e.target.value)} className={inputCls}>
              <option value="">{copy.selectSscYear}</option>
              {Array.from({ length: 50 }, (_, i) => new Date().getFullYear() - i).map((y) => (
                <option key={y} value={String(y)}>{y}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-secondary mb-1">{copy.memberType}</label>
            <select required value={form.memberType} onChange={(e) => set("memberType", e.target.value)} className={inputCls}>
              <option value="">{copy.selectMemberType}</option>
              {MEMBER_TYPES.map((type) => (
                <option key={type} value={type}>{getMemberTypeLabel(type, language)}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-secondary mb-1">{copy.occupation}</label>
            <input required value={form.work} onChange={(e) => set("work", e.target.value)} placeholder={copy.occupationPlaceholder} className={inputCls} />
          </div>

          <div>
            <label className="block text-sm text-secondary mb-1">{copy.workplace}</label>
            <input required value={form.workplace} onChange={(e) => set("workplace", e.target.value)} placeholder={copy.workplacePlaceholder} className={inputCls} />
          </div>

          <div>
            <label className="block text-sm text-secondary mb-1">{copy.address}</label>
            <input required value={form.address} onChange={(e) => set("address", e.target.value)} placeholder={copy.addressPlaceholder} className={inputCls} />
          </div>

          <div>
            <label className="block text-sm text-secondary mb-1">{copy.phone}</label>
            <input
              required type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)}
              placeholder={copy.phonePlaceholder}
              inputMode="numeric"
              title={copy.phoneTitle}
              className={inputCls}
            />
          </div>

          <div>
            <label className="block text-sm text-secondary mb-1">{copy.email}</label>
            <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder={copy.emailPlaceholder} className={inputCls} />
          </div>

          <div>
            <label className="block text-sm text-secondary mb-1">{copy.bloodGroup}</label>
            <select required value={form.bloodGroup} onChange={(e) => set("bloodGroup", e.target.value)} className={inputCls}>
              <option value="">{copy.selectBloodGroup}</option>
              {BLOOD_GROUPS.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm text-secondary mb-1">{copy.message}</label>
            <textarea
              value={form.message} onChange={(e) => set("message", e.target.value)}
              rows={3} placeholder={copy.messagePlaceholder}
              className={`${inputCls} resize-none`}
            />
          </div>

          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} type="submit" disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 py-3.5 rounded-xl font-semibold transition text-base"
            style={{ boxShadow: "0 4px 16px rgba(99,102,241,0.3)" }}
          >
            {loading ? copy.submitting : copy.submit}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}
