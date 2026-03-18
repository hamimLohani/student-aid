"use client";
import { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { Camera } from "lucide-react";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const inputCls = "input-field";

export default function JoinPage() {
  const [form, setForm] = useState({
    name: "", sscYear: "", work: "", workplace: "", bloodGroup: "",
    address: "", phone: "", email: "", message: "",
  });
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const set = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setPhoto(file);
    setPreview(file ? URL.createObjectURL(file) : null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { name, sscYear, work, workplace, bloodGroup, address, phone, email } = form;
    if (!name || !sscYear || !work || !workplace || !bloodGroup || !address || !phone || !email) {
      return toast.error("Please fill in all required fields.");
    }
    setLoading(true);
    try {
      let image = "";
      if (photo) {
        toast.loading("Uploading photo...", { id: "photo" });
        image = await uploadToCloudinary(photo);
        toast.dismiss("photo");
      }
      await addDoc(collection(db, "joinRequests"), { ...form, image, createdAt: serverTimestamp(), status: "pending" });
      toast.success("Request submitted! We'll get back to you soon.");
      setForm({ name: "", sscYear: "", work: "", workplace: "", bloodGroup: "", address: "", phone: "", email: "", message: "" });
      setPhoto(null);
      setPreview(null);
    } catch {
      toast.error("Something went wrong. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="pt-20 sm:pt-24 pb-16 px-4 max-w-xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl sm:text-4xl font-bold mb-2">Join Us</h1>
        <p className="text-secondary text-sm sm:text-base mb-1">Fill out the form below to request membership.</p>
        <p className="text-muted text-xs mb-6">All fields are required except message.</p>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Profile Photo */}
          <div className="flex flex-col items-center gap-3 py-2">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-100 dark:bg-white/5 border-2 border-dashed border-gray-300 dark:border-white/20 flex items-center justify-center cursor-pointer hover:border-indigo-500 transition"
              onClick={() => document.getElementById("photo-input")?.click()}
            >
              {preview ? (
                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center gap-1 text-muted">
                  <Camera size={22} />
                  <span className="text-xs">Photo</span>
                </div>
              )}
            </motion.div>
            <input id="photo-input" type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
            <button type="button" onClick={() => document.getElementById("photo-input")?.click()}
              className="text-xs text-indigo-400 hover:text-indigo-300 transition"
            >
              {preview ? "Change photo" : "Upload profile photo (optional)"}
            </button>
          </div>

          <div>
            <label className="block text-sm text-secondary mb-1">Full Name *</label>
            <input required value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Your full name" className={inputCls} />
          </div>

          <div>
            <label className="block text-sm text-secondary mb-1">SSC Year *</label>
            <select required value={form.sscYear} onChange={(e) => set("sscYear", e.target.value)} className={inputCls}>
              <option value="">Select SSC year</option>
              {Array.from({ length: 20 }, (_, i) => new Date().getFullYear() - i).map((y) => (
                <option key={y} value={String(y)}>{y}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-secondary mb-1">Occupation *</label>
            <input required value={form.work} onChange={(e) => set("work", e.target.value)} placeholder="Student, Engineer, Doctor, etc." className={inputCls} />
          </div>

          <div>
            <label className="block text-sm text-secondary mb-1">Workplace *</label>
            <input required value={form.workplace} onChange={(e) => set("workplace", e.target.value)} placeholder="Company, School, Hospital, etc." className={inputCls} />
          </div>

          <div>
            <label className="block text-sm text-secondary mb-1">Current Address *</label>
            <input required value={form.address} onChange={(e) => set("address", e.target.value)} placeholder="City, Country" className={inputCls} />
          </div>

          <div>
            <label className="block text-sm text-secondary mb-1">Phone Number *</label>
            <input required type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+880 1XXX XXXXXX" className={inputCls} />
          </div>

          <div>
            <label className="block text-sm text-secondary mb-1">Email Address *</label>
            <input required type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="you@example.com" className={inputCls} />
          </div>

          <div>
            <label className="block text-sm text-secondary mb-1">Blood Group *</label>
            <select required value={form.bloodGroup} onChange={(e) => set("bloodGroup", e.target.value)} className={inputCls}>
              <option value="">Select blood group</option>
              {BLOOD_GROUPS.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm text-secondary mb-1">Message (optional)</label>
            <textarea
              value={form.message} onChange={(e) => set("message", e.target.value)}
              rows={3} placeholder="Why do you want to join?"
              className={`${inputCls} resize-none`}
            />
          </div>

          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} type="submit" disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 py-3.5 rounded-xl font-semibold transition text-base"
            style={{ boxShadow: "0 4px 16px rgba(99,102,241,0.3)" }}
          >
            {loading ? "Submitting..." : "Submit Request"}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}
