"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import {
  collection, addDoc, deleteDoc, doc, onSnapshot,
  serverTimestamp, updateDoc, writeBatch,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { formatBdPhone, normalizeBdPhone } from "@/lib/phone";
import { useLanguage } from "@/context/LanguageContext";
import { adminCopy, getMemberTypeLabel } from "@/lib/i18n";
import Image from "next/image";
import toast from "react-hot-toast";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Trash2, Plus, Users, Megaphone, Calendar, FileText, Pencil, X, Check, BarChart2, TrendingUp, Clock3, CheckCircle2, FileDown, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const RichTextEditor = dynamic(() => import("@/components/RichTextEditor"), { ssr: false });

type Tab = "members" | "activities" | "announcements" | "requests" | "analytics";

interface Member { id: string; name: string; sscYear: string; memberType?: string; work: string; workplace: string; bloodGroup: string; address: string; phone?: string; email?: string; image?: string; }
interface Activity { id: string; title: string; description: string; date: string; images: string[]; }
interface Announcement { id: string; title: string; content: string; }
interface JoinRequest { id: string; name: string; sscYear: string; memberType?: string; work: string; workplace: string; bloodGroup: string; address: string; phone?: string; email?: string; image?: string; message: string; status: string; approvedAt?: { seconds: number }; }

const inputCls = "input-field";
const MEMBER_TYPES = ["Founder Member", "General Member", "Locals"] as const;

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const { language } = useLanguage();
  const copy = adminCopy[language];
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("members");

  const [members, setMembers] = useState<Member[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [requests, setRequests] = useState<JoinRequest[]>([]);

  const [memberForm, setMemberForm] = useState({ name: "", sscYear: "", memberType: "", work: "", workplace: "", bloodGroup: "", address: "", phone: "", email: "" });
  const [memberImage, setMemberImage] = useState<File | null>(null);
  const [memberLoading, setMemberLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isEditPanelVisible, setIsEditPanelVisible] = useState(true);
  const [editLoading, setEditLoading] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", sscYear: "", memberType: "", work: "", workplace: "", bloodGroup: "", address: "", phone: "", email: "" });
  const [editImage, setEditImage] = useState<File | null>(null);
  const [memberSearch, setMemberSearch] = useState("");
  const [memberTypeFilter, setMemberTypeFilter] = useState("");
  const [activityForm, setActivityForm] = useState({ title: "", description: "", date: "" });
  const [activityMedia, setActivityMedia] = useState<File[]>([]);
  const [activityMediaPreviews, setActivityMediaPreviews] = useState<string[]>([]);
  const [announcementForm, setAnnouncementForm] = useState({ title: "", content: "" });
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [sendEmailNotify, setSendEmailNotify] = useState(true);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [testingEmail, setTestingEmail] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push("/admin/login");
  }, [user, loading, router]);

  useEffect(() => {
    const unsubs = [
      onSnapshot(collection(db, "members"), (s) => setMembers(s.docs.map((d) => ({ id: d.id, ...d.data() } as Member)))),
      onSnapshot(collection(db, "activities"), (s) => setActivities(s.docs.map((d) => ({ id: d.id, ...d.data() } as Activity)))),
      onSnapshot(collection(db, "announcements"), (s) => setAnnouncements(s.docs.map((d) => ({ id: d.id, ...d.data() } as Announcement)))),
      onSnapshot(collection(db, "joinRequests"), (s) => setRequests(s.docs.map((d) => ({ id: d.id, ...d.data() } as JoinRequest)))),
    ];
    return () => unsubs.forEach((u) => u());
  }, []);

  useEffect(() => {
    const previews = activityMedia.map((file) => URL.createObjectURL(file));
    setActivityMediaPreviews(previews);

    return () => {
      previews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [activityMedia]);

  const addMember = async () => {
    if (!memberForm.name) return toast.error(copy.nameRequired);
    if (!memberForm.memberType) return toast.error(copy.memberTypeRequired);
    if (!memberForm.phone) return toast.error(copy.phoneRequired);
    if (memberForm.phone && !normalizeBdPhone(memberForm.phone)) return toast.error(copy.invalidPhone);
    setMemberLoading(true);
    try {
      let image = "";
      if (memberImage) {
        toast.loading(copy.uploadingPhoto, { id: "mphoto" });
        image = await uploadToCloudinary(memberImage);
      }
      await addDoc(collection(db, "members"), { ...memberForm, phone: memberForm.phone ? formatBdPhone(memberForm.phone) : "", image });
      setMemberForm({ name: "", sscYear: "", memberType: "", work: "", workplace: "", bloodGroup: "", address: "", phone: "", email: "" });
      setMemberImage(null);
      toast.success(copy.memberAdded);
    } catch {
      toast.error(copy.addMemberFailed);
    } finally {
      toast.dismiss("mphoto");
      setMemberLoading(false);
    }
  };

  const addActivity = async () => {
    if (!activityForm.title) return toast.error(copy.titleRequired);
    toast.loading(copy.uploadingImages, { id: "upload" });
    try {
      const images = await Promise.all(activityMedia.map((f) => uploadToCloudinary(f)));
      const data = { ...activityForm, images };
      await addDoc(collection(db, "activities"), data);
      await addDoc(collection(db, "announcements"), {
        title: `New Activity: ${activityForm.title}`,
        content: activityForm.description,
        timestamp: serverTimestamp(),
        likes: [],
      });
      setActivityForm({ title: "", description: "", date: "" });
      setActivityMedia([]);
      toast.success(copy.activityAdded);
    } catch {
      toast.error(copy.addActivityFailed);
    } finally {
      toast.dismiss("upload");
    }
  };

  const sendTestEmail = async () => {
    const targetEmail = testEmail.trim() || user?.email || "";
    if (!targetEmail || !targetEmail.includes("@")) {
      return toast.error("অনুগ্রহ করে একটি সঠিক ইমেইল ঠিকানা দিন");
    }
    const sampleTitle = announcementForm.title.trim() || "New Activity: 🌙✨ ঈদ পুনর্মিলনী ২০২৬ ✨🌙";
    const sampleContent = announcementForm.content.trim() || "আসসালামু আলাইকুম সবাইকে 😊\nআমাদের প্রিয় কমিউনিটির পক্ষ থেকে আয়োজন করা হয়েছে **ঈদ পুনর্মিলনী ২০২৬** 🎉\nএই অনুষ্ঠানে :\n🎤 আড্ডা ও পরিচিতি \n🎾 বিভিন্ন ধরনের খেলাধুলা \n📸 ফটোসেশন \n🎉 সবার সাথে আনন্দময় সময়";

    setTestingEmail(true);
    toast.loading("টেস্ট ইমেইল পাঠানো হচ্ছে...", { id: "test-email-send" });
    try {
      const res = await fetch("/api/send-announcement-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: sampleTitle,
          content: sampleContent,
          recipientEmails: [targetEmail],
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`📧 টেস্ট ইমেইল ${targetEmail} ঠিকানায় সফলভাবে পাঠানো হয়েছে!`, { id: "test-email-send" });
      } else {
        toast.error(`টেস্ট ইমেইল পাঠাতে সমস্যা: ${data.error}`, { id: "test-email-send" });
      }
    } catch (e) {
      console.error("Test email error:", e);
      toast.error("ইমেইল পাঠাতে সমস্যা হয়েছে", { id: "test-email-send" });
    } finally {
      setTestingEmail(false);
    }
  };

  const addAnnouncement = async () => {
    if (!announcementForm.title) return toast.error(copy.titleRequired);
    try {
      const titleToEmail = announcementForm.title;
      const contentToEmail = announcementForm.content;

      await addDoc(collection(db, "announcements"), { ...announcementForm, timestamp: serverTimestamp(), likes: [] });
      setAnnouncementForm({ title: "", content: "" });
      toast.success(copy.announcementPosted);

      if (sendEmailNotify) {
        setSendingEmail(true);
        const memberEmails = members
          .map((m) => m.email)
          .filter((e): e is string => Boolean(e && e.includes("@")));

        if (memberEmails.length > 0) {
          toast.loading("সদস্যদের ইমেইল পাঠানো হচ্ছে...", { id: "email-send" });
          try {
            const res = await fetch("/api/send-announcement-email", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                title: titleToEmail,
                content: contentToEmail,
                recipientEmails: memberEmails,
              }),
            });
            const data = await res.json();
            if (res.ok) {
              toast.success(`📧 ${data.message || "সদস্যদের ইমেইল নোটিফিকেশন পাঠানো হয়েছে!"}`, { id: "email-send" });
            } else {
              toast.error(`ইমেইল পাঠাতে সমস্যা: ${data.error}`, { id: "email-send" });
            }
          } catch (e) {
            console.error("Email error:", e);
            toast.dismiss("email-send");
          }
        } else {
          toast("ইমেইল পাঠানোর জন্য কোন সদস্য পাওয়া যায়নি", { icon: "ℹ️" });
        }
        setSendingEmail(false);
      }
    } catch (err) {
      console.error(err);
      toast.error("বিজ্ঞপ্তি প্রকাশ করতে সমস্যা হয়েছে");
    }
  };

  const deleteDoc_ = async (col: string, id: string, label = "item") => {
    if (!confirm(copy.deleteConfirm.replace("{label}", label))) return;
    await deleteDoc(doc(db, col, id));
    toast.success(copy.deleted);
  };

  const startEdit = (m: Member) => {
    setEditingId(m.id);
    setIsEditPanelVisible(true);
    setEditForm({ name: m.name, sscYear: m.sscYear, memberType: m.memberType || "", work: m.work, workplace: m.workplace, bloodGroup: m.bloodGroup, address: m.address, phone: m.phone || "", email: m.email || "" });
    setEditImage(null);
  };

  const saveEdit = async () => {
    if (!editingId) return;
    if (!editForm.memberType) return toast.error(copy.memberTypeRequired);
    if (!editForm.phone) return toast.error(copy.phoneRequired);
    if (editForm.phone && !normalizeBdPhone(editForm.phone)) return toast.error(copy.invalidPhone);
    setEditLoading(true);
    try {
      let image: string | undefined;
      if (editImage) {
        toast.loading(copy.uploadingPhoto, { id: "editphoto" });
        image = await uploadToCloudinary(editImage);
      }
      const data: Record<string, string> = { ...editForm, phone: editForm.phone ? formatBdPhone(editForm.phone) : "" };
      if (image) data.image = image;
      await updateDoc(doc(db, "members", editingId), data);
      setEditingId(null);
      setIsEditPanelVisible(true);
      toast.success(copy.memberUpdated);
    } catch {
      toast.error(copy.updateMemberFailed);
    } finally {
      toast.dismiss("editphoto");
      setEditLoading(false);
    }
  };

  const approveRequest = async (r: JoinRequest) => {
    if (approvingId) return;
    setApprovingId(r.id);
    try {
      const batch = writeBatch(db);
      const memberRef = doc(collection(db, "members"));
      const requestRef = doc(db, "joinRequests", r.id);

      batch.set(memberRef, {
        name: r.name,
        sscYear: r.sscYear,
        memberType: r.memberType || "",
        work: r.work,
        workplace: r.workplace || "",
        bloodGroup: r.bloodGroup || "",
        address: r.address,
        phone: r.phone || "",
        email: r.email || "",
        image: r.image || "",
      });
      batch.delete(requestRef);

      await batch.commit();
      toast.success(copy.memberApproved);

      const reqEmail = typeof r.email === "string" ? r.email.trim() : "";
      if (reqEmail && reqEmail.includes("@")) {
        fetch("/api/send-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "approval",
            name: r.name,
            recipientEmails: [reqEmail],
          }),
        }).catch((err) => console.error("Approval email skipped/failed:", err));
      }
    } catch {
      toast.error(copy.approveMemberFailed);
    } finally {
      setApprovingId(null);
    }
  };

  const removeRequestMessage = async (id: string) => {
    if (!confirm(copy.removeRequestMessage)) return;
    try {
      await updateDoc(doc(db, "joinRequests", id), { message: "" });
      toast.success(copy.requestMessageRemoved);
    } catch {
      toast.error(copy.removeRequestMessageFailed);
    }
  };

  if (loading || !user) return <div className="pt-32 text-center text-muted">{copy.loading}</div>;

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "members", label: copy.members, icon: <Users size={16} /> },
    { key: "activities", label: copy.activities, icon: <Calendar size={16} /> },
    { key: "announcements", label: copy.announcements, icon: <Megaphone size={16} /> },
    { key: "requests", label: copy.requests, icon: <FileText size={16} /> },
    { key: "analytics", label: "Analytics", icon: <BarChart2 size={16} /> },
  ];

  const filteredMembers = members.filter((member) => {
    const search = memberSearch.trim().toLowerCase();
    const matchesSearch =
      !search ||
      [
        member.name,
        member.phone,
        member.email,
        member.work,
        member.workplace,
        member.address,
        member.sscYear,
        member.bloodGroup,
        member.memberType,
      ]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(search));

    const matchesType = !memberTypeFilter || member.memberType === memberTypeFilter;
    return matchesSearch && matchesType;
  });

  const exportPDF = async () => {
    setExporting(true);
    try {
      const { jsPDF } = await import("jspdf");
      const { default: autoTable } = await import("jspdf-autotable");

      const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

      // Header
      doc.setFillColor(46, 107, 69);
      doc.rect(0, 0, 297, 20, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Student Aid BDG — Official Member Directory", 14, 13);
      doc.setFontSize(9);
      doc.text(`Exported: ${new Date().toLocaleDateString("en-US", { dateStyle: "long" })} · Total: ${members.length} members`, 297 - 14, 13, { align: "right" });

      autoTable(doc, {
        startY: 24,
        head: [["Name", "Type", "SSC Year", "Occupation", "Workplace", "Blood", "Phone", "Email", "Address"]],
        body: (filteredMembers.length > 0 ? filteredMembers : members).map((m) => [
          m.name,
          m.memberType || "—",
          m.sscYear || "—",
          m.work || "—",
          m.workplace || "—",
          m.bloodGroup || "—",
          m.phone || "—",
          m.email || "—",
          m.address || "—",
        ]),
        headStyles: { fillColor: [46, 107, 69], textColor: 255, fontSize: 9, fontStyle: "bold" },
        bodyStyles: { fontSize: 8, textColor: [30, 30, 30] },
        alternateRowStyles: { fillColor: [240, 247, 242] },
        columnStyles: { 0: { fontStyle: "bold" } },
        margin: { left: 14, right: 14 },
      });

      // Footer
      const pageCount = (doc as typeof doc & { internal: { getNumberOfPages: () => number } }).internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setTextColor(150, 150, 150);
        doc.setFontSize(8);
        doc.text(`Page ${i} of ${pageCount} · Student Aid BDG (Kannecta)`, 14, 205);
      }

      doc.save(`StudentAidBDG_Members_${new Date().toISOString().split("T")[0]}.pdf`);
      toast.success("PDF directory downloaded!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate PDF");
    } finally {
      setExporting(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="pt-28 sm:pt-32 pb-20 px-3 sm:px-6 max-w-5xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-5 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold gradient-text">{copy.dashboard}</h1>
          <p className="text-secondary text-xs sm:text-sm mt-1 truncate">
            {copy.loggedInAs} <span className="font-medium text-[var(--accent)]">{user.email}</span>
          </p>
        </div>
        <button
          onClick={exportPDF}
          disabled={exporting || members.length === 0}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold transition hover:scale-105 shadow-sm disabled:opacity-50 bg-[var(--accent)]/10 text-[var(--accent)] border-[var(--accent)]/30 hover:bg-[var(--accent)]/20"
          style={{
            fontFamily: "'Outfit', system-ui, sans-serif",
          }}
          title="Download Members Directory as PDF"
        >
          {exporting ? <Loader2 size={16} className="animate-spin text-[var(--accent)]" /> : <FileDown size={16} className="text-[var(--accent)]" />}
          <span>PDF</span>
        </button>
      </div>



      {/* Tabs — mobile app style (5 cols) on mobile, scrollable/flex on desktop */}
      <div className="grid grid-cols-5 gap-1.5 sm:flex sm:gap-2 mb-5 py-3">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 p-2 sm:px-4 sm:py-2.5 rounded-xl text-[10px] sm:text-sm font-medium transition ${
              tab === t.key ? "bg-[var(--accent)] text-white shadow-lg shadow-emerald-950/30 font-semibold" : "bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-hover)]"
            }`}
          >
            {t.icon} <span className="truncate w-full text-center">{t.label}</span>
          </button>
        ))}
      </div>

      {/* ── Members Tab ── */}
      {tab === "members" && (
        <div className="space-y-4">
          <div className="card p-4 sm:p-6">
            <h2 className="font-semibold mb-4 flex items-center gap-2 text-sm sm:text-base">
              <Plus size={15} /> {copy.addMember}
            </h2>
            <div className="space-y-3">
              {([["name", copy.fullNameRequired], ["work", copy.occupationRequired], ["workplace", copy.workplaceRequired], ["address", copy.addressRequired], ["phone", copy.phoneNumberRequired], ["email", copy.emailOptional]] as [keyof typeof memberForm, string][]).map(([k, p]) => (
                <input key={k} placeholder={p} value={memberForm[k as keyof typeof memberForm]}
                  onChange={(e) => setMemberForm({ ...memberForm, [k]: e.target.value })}
                  className={inputCls}
                />
              ))}
              <select value={memberForm.sscYear}
                onChange={(e) => setMemberForm({ ...memberForm, sscYear: e.target.value })}
                className={inputCls}
              >
                <option value="">{copy.sscYearOptional}</option>
                {Array.from({ length: 50 }, (_, i) => new Date().getFullYear() - i).map((y) => (
                  <option key={y} value={String(y)}>{y}</option>
                ))}
              </select>
              <select value={memberForm.memberType}
                onChange={(e) => setMemberForm({ ...memberForm, memberType: e.target.value })}
                className={inputCls}
              >
                <option value="">{copy.memberTypeRequiredLabel}</option>
                {MEMBER_TYPES.map((type) => (
                  <option key={type} value={type}>{getMemberTypeLabel(type, language)}</option>
                ))}
              </select>
              <select value={memberForm.bloodGroup}
                onChange={(e) => setMemberForm({ ...memberForm, bloodGroup: e.target.value })}
                className={inputCls}
              >
                <option value="">{copy.bloodGroupRequired}</option>
                {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
              <div>
                <label className="block text-xs text-secondary mb-1">{copy.profilePhoto}</label>
                <input type="file" accept="image/*"
                  onChange={(e) => setMemberImage(e.target.files?.[0] || null)}
                  className="w-full text-sm text-secondary file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-[var(--accent)] file:text-white file:font-semibold hover:file:opacity-90 transition file:text-xs"
                />
              </div>
            </div>
            <button onClick={addMember} disabled={memberLoading}
              className="mt-4 w-full sm:w-auto btn-primary !py-2.5 !px-6 !text-sm"
            >
              {memberLoading ? copy.adding : copy.addMember}
            </button>
          </div>

          <div className="space-y-2">
            <div className="card p-4 sm:p-5">
              <div className="flex items-center justify-between gap-3 mb-4">
                <div>
                  <h2 className="font-semibold text-sm sm:text-base">{copy.searchMembers}</h2>
                  <p className="text-xs text-secondary mt-1">
                    {copy.showing.replace("{filtered}", String(filteredMembers.length)).replace("{total}", String(members.length))}
                  </p>
                </div>
                {memberSearch && (
                  <button
                    onClick={() => setMemberSearch("")}
                    className="text-xs px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-white/5 text-secondary hover:text-primary transition"
                  >
                    {copy.clear}
                  </button>
                )}
              </div>
              <div>
                <input
                  placeholder={copy.memberSearchPlaceholder}
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  className={inputCls}
                />
              </div>
            </div>

            {filteredMembers.map((m) => (
              <div key={m.id} className="card overflow-hidden">
                {editingId === m.id ? (
                  <div className="p-4 space-y-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{copy.editing}: {m.name}</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setIsEditPanelVisible((visible) => !visible)}
                          className="text-xs px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-white/5 text-secondary hover:text-primary transition"
                        >
                          {isEditPanelVisible ? copy.hidePanel : copy.showPanel}
                        </button>
                        <button onClick={() => {
                          setEditingId(null);
                          setIsEditPanelVisible(true);
                        }} className="text-muted hover:text-secondary transition"><X size={15} /></button>
                      </div>
                    </div>
                    {isEditPanelVisible ? (
                      <>
                        {([["name", copy.fullName], ["work", copy.occupation], ["workplace", copy.workplace], ["address", copy.address], ["phone", copy.phone], ["email", copy.email]] as [keyof typeof editForm, string][]).map(([k, p]) => (
                          <input key={k} placeholder={p} value={editForm[k]}
                            onChange={(e) => setEditForm({ ...editForm, [k]: e.target.value })}
                            className={inputCls}
                          />
                        ))}
                        <select value={editForm.sscYear}
                          onChange={(e) => setEditForm({ ...editForm, sscYear: e.target.value })}
                          className={inputCls}
                        >
                          <option value="">{copy.sscYearOptional}</option>
                          {Array.from({ length: 50 }, (_, i) => new Date().getFullYear() - i).map((y) => (
                            <option key={y} value={String(y)}>{y}</option>
                          ))}
                        </select>
                        <select value={editForm.memberType}
                          onChange={(e) => setEditForm({ ...editForm, memberType: e.target.value })}
                          className={inputCls}
                        >
                          <option value="">{copy.memberTypeRequiredLabel}</option>
                          {MEMBER_TYPES.map((type) => (
                            <option key={type} value={type}>{getMemberTypeLabel(type, language)}</option>
                          ))}
                        </select>
                        <select value={editForm.bloodGroup}
                          onChange={(e) => setEditForm({ ...editForm, bloodGroup: e.target.value })}
                          className={inputCls}
                        >
                          <option value="">{copy.bloodGroup}</option>
                          {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((b) => (
                            <option key={b} value={b}>{b}</option>
                          ))}
                        </select>
                        <div>
                          <label className="block text-xs text-secondary mb-1">{copy.changePhoto}</label>
                          <input type="file" accept="image/*"
                            onChange={(e) => setEditImage(e.target.files?.[0] || null)}
                            className="w-full text-sm text-secondary file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-[var(--accent)] file:text-white file:font-semibold hover:file:opacity-90 transition file:text-xs"
                          />
                        </div>
                        <div className="flex gap-2 pt-1">
                          <button onClick={saveEdit} disabled={editLoading} className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 px-4 py-2 rounded-xl text-xs font-medium transition">
                            <Check size={13} /> {editLoading ? copy.saving : copy.save}
                          </button>
                          <button onClick={() => {
                            setEditingId(null);
                            setIsEditPanelVisible(true);
                          }} className="px-4 py-2 rounded-xl text-xs font-medium bg-gray-100 dark:bg-white/5 text-secondary hover:text-primary transition">
                            {copy.cancel}
                          </button>
                        </div>
                      </>
                    ) : (
                      <p className="text-xs text-secondary">{copy.editingPanelHidden}</p>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-3 px-4 py-3">
                    <div className="relative w-9 h-9 rounded-full overflow-hidden bg-emerald-600/30 flex items-center justify-center text-sm font-bold text-emerald-300 flex-shrink-0">
                      {m.image ? <Image src={m.image} alt={m.name} fill sizes="36px" className="object-cover" /> : m.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{m.name}</p>
                      <p className="text-secondary text-xs truncate">
                        {[m.memberType && `${m.memberType[0].toUpperCase() + m.memberType.slice(1)}`, m.sscYear && `SSC ${m.sscYear}`, m.workplace || m.work, m.bloodGroup].filter(Boolean).join(" · ")}
                        {m.phone && " · 📞"}
                        {m.email && " · ✉️"}
                      </p>
                    </div>
                    <button onClick={() => startEdit(m)} className="text-emerald-400 hover:text-emerald-300 transition flex-shrink-0 p-1">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => deleteDoc_("members", m.id, "member")} className="text-red-400 hover:text-red-300 transition flex-shrink-0 p-1">
                      <Trash2 size={15} />
                    </button>
                  </div>
                )}
              </div>
            ))}
            {filteredMembers.length === 0 && (
              <div className="card p-6 text-center text-sm text-secondary">
                {copy.noMembersMatched}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Activities Tab ── */}
      {tab === "activities" && (
        <div className="space-y-4">
          <div className="card p-4 sm:p-6">
            <h2 className="font-semibold mb-4 flex items-center gap-2 text-sm sm:text-base">
              <Plus size={15} /> {copy.addActivity}
            </h2>
            <div className="space-y-3">
              <input placeholder={copy.title} value={activityForm.title}
                onChange={(e) => setActivityForm({ ...activityForm, title: e.target.value })}
                className={inputCls}
              />
              <textarea placeholder={copy.description} value={activityForm.description} rows={3}
                onChange={(e) => setActivityForm({ ...activityForm, description: e.target.value })}
                className={`${inputCls} resize-none`}
              />
              <input type="date" value={activityForm.date}
                onChange={(e) => setActivityForm({ ...activityForm, date: e.target.value })}
                className={inputCls}
              />
              <div>
                <label className="block text-xs text-secondary mb-1">{copy.photosMultiple}</label>
                <input type="file" accept="image/*" multiple
                  onChange={(e) => setActivityMedia(Array.from(e.target.files || []))}
                  className="w-full text-sm text-secondary file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-[var(--accent)] file:text-white file:font-semibold hover:file:opacity-90 transition file:text-xs"
                />
                {activityMedia.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {activityMediaPreviews.map((previewUrl, i) => (
                      <div key={i} className="relative">
                        <Image src={previewUrl} alt="" width={64} height={64} className="object-cover rounded-lg" />
                        <button onClick={() => setActivityMedia(activityMedia.filter((_, j) => j !== i))}
                          className="absolute -top-1 -right-1 bg-red-500 rounded-full w-4 h-4 flex items-center justify-center text-white text-xs"
                        >×</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <button onClick={addActivity}
              className="mt-4 w-full sm:w-auto btn-primary !py-2.5 !px-6 !text-sm"
            >
              {copy.addActivityButton}
            </button>
          </div>

          <div className="space-y-2">
            {activities.map((a) => (
              <div key={a.id} className="card flex items-center gap-3 px-4 py-3">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{a.title}</p>
                  <p className="text-secondary text-xs">{a.date} · {copy.activityCountPhotos.replace("{count}", String(a.images?.length || 0))}</p>
                </div>
                <button onClick={() => deleteDoc_("activities", a.id, "activity")} className="text-red-400 hover:text-red-300 transition flex-shrink-0 p-1">
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Announcements Tab ── */}
      {tab === "announcements" && (
        <div className="space-y-4">
          <div className="card p-4 sm:p-6">
            <h2 className="font-semibold mb-4 flex items-center gap-2 text-sm sm:text-base">
              <Plus size={15} /> {copy.postAnnouncement}
            </h2>
            <div className="space-y-3">
              <input placeholder={copy.title} value={announcementForm.title}
                onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
                className={inputCls}
              />
              <div>
                <label className="block text-xs mb-1.5" style={{ color: "var(--text-secondary)" }}>{copy.content}</label>
                <RichTextEditor
                  value={announcementForm.content}
                  onChange={(html) => setAnnouncementForm({ ...announcementForm, content: html })}
                  placeholder={copy.content}
                />
              </div>
              <div className="pt-1 flex flex-col gap-2">
                <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer" style={{ color: "var(--text-primary)" }}>
                  <input
                    type="checkbox"
                    checked={sendEmailNotify}
                    onChange={(e) => setSendEmailNotify(e.target.checked)}
                    className="w-4 h-4 rounded accent-[var(--accent)] cursor-pointer"
                  />
                  <span>📧 সকল সদস্যের ইমেইলে বার্তা পাঠান (Send email notification to all member emails)</span>
                </label>
              </div>
            </div>
            <button onClick={addAnnouncement} disabled={sendingEmail}
              className="mt-4 btn-primary !py-2.5 !px-6 !text-sm flex items-center gap-2"
            >
              {sendingEmail ? <Loader2 size={16} className="animate-spin" /> : <Megaphone size={16} />}
              {sendingEmail ? "ইমেইল পাঠানো হচ্ছে..." : copy.postAnnouncementButton}
            </button>
          </div>

          <div className="space-y-2">
            {announcements.map((a) => (
              <div key={a.id} className="card flex items-center gap-3 px-4 py-3">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{a.title}</p>
                  <p className="text-secondary text-xs line-clamp-1" dangerouslySetInnerHTML={{ __html: a.content }} />
                </div>
                <button onClick={() => deleteDoc_("announcements", a.id, "announcement")} className="text-red-400 hover:text-red-300 transition flex-shrink-0 p-1">
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Analytics Tab ── */}
      {tab === "analytics" && (() => {
        // Member count by SSC year
        const yearCounts: Record<string, number> = {};
        members.forEach((m) => { if (m.sscYear) yearCounts[m.sscYear] = (yearCounts[m.sscYear] || 0) + 1; });
        const yearData = Object.entries(yearCounts).sort((a, b) => a[0].localeCompare(b[0])).map(([year, count]) => ({ year, count }));

        // Member count by type
        const typeCounts: Record<string, number> = {};
        members.forEach((m) => { const t = m.memberType || "Unknown"; typeCounts[t] = (typeCounts[t] || 0) + 1; });
        const typeData = Object.entries(typeCounts).map(([type, count]) => ({ type: type.split(" ")[0], count }));

        // Top liked announcements
        interface Announcement { id: string; title: string; content: string; likes?: string[]; }
        const topAnnouncements = [...(announcements as Announcement[])]
          .filter((a) => a.likes && a.likes.length > 0)
          .sort((a, b) => (b.likes?.length || 0) - (a.likes?.length || 0))
          .slice(0, 5)
          .map((a) => ({ title: a.title.slice(0, 24) + (a.title.length > 24 ? "…" : ""), likes: a.likes?.length || 0 }));

        const pendingRequests = requests.filter((r) => r.status === "pending");
        const upcomingActivities = activities.filter((a) => a.date && new Date(a.date) > new Date()).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        const COLORS = ["#6366f1", "#8b5cf6", "#06b6d4", "#22c55e", "#f59e0b"];

        return (
          <div className="space-y-6">
            {/* Top stat cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "Total Members", value: members.length, icon: <Users size={18} />, color: "#6366f1" },
                { label: "Activities", value: activities.length, icon: <Calendar size={18} />, color: "#8b5cf6" },
                { label: "Upcoming Events", value: upcomingActivities.length, icon: <TrendingUp size={18} />, color: "#06b6d4" },
                { label: "Pending Requests", value: pendingRequests.length, icon: <Clock3 size={18} />, color: "#f59e0b" },
              ].map((s) => (
                <div key={s.label} className="stat-card">
                  <div className="w-10 h-10 rounded-2xl mx-auto mb-3 flex items-center justify-center text-white" style={{ background: s.color }}>{s.icon}</div>
                  <div className="font-display text-3xl font-extrabold mb-1" style={{ color: s.color }}>{s.value}</div>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>{s.label}</p>
                </div>
              ))}
            </div>

            {/* Charts row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Members by SSC Year */}
              <div className="card p-5">
                <h3 className="font-display font-semibold mb-4 text-sm" style={{ color: "var(--text-primary)" }}>Members by SSC Year</h3>
                {yearData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={yearData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                      <XAxis dataKey="year" tick={{ fontSize: 11, fill: "var(--text-muted)" }} />
                      <YAxis tick={{ fontSize: 11, fill: "var(--text-muted)" }} allowDecimals={false} />
                      <Tooltip contentStyle={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "0.75rem", fontSize: 12 }} />
                      <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                        {yearData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : <p className="text-sm text-center py-12" style={{ color: "var(--text-muted)" }}>No SSC year data yet</p>}
              </div>

              {/* Members by Type */}
              <div className="card p-5">
                <h3 className="font-display font-semibold mb-4 text-sm" style={{ color: "var(--text-primary)" }}>Members by Type</h3>
                {typeData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={typeData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                      <XAxis dataKey="type" tick={{ fontSize: 11, fill: "var(--text-muted)" }} />
                      <YAxis tick={{ fontSize: 11, fill: "var(--text-muted)" }} allowDecimals={false} />
                      <Tooltip contentStyle={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "0.75rem", fontSize: 12 }} />
                      <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                        {typeData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : <p className="text-sm text-center py-12" style={{ color: "var(--text-muted)" }}>No member type data yet</p>}
              </div>
            </div>

            {/* Top liked announcements */}
            {topAnnouncements.length > 0 && (
              <div className="card p-5">
                <h3 className="font-display font-semibold mb-4 text-sm" style={{ color: "var(--text-primary)" }}>Top Liked Announcements</h3>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={topAnnouncements} layout="vertical" margin={{ top: 0, right: 20, bottom: 0, left: 0 }}>
                    <XAxis type="number" tick={{ fontSize: 11, fill: "var(--text-muted)" }} allowDecimals={false} />
                    <YAxis dataKey="title" type="category" tick={{ fontSize: 11, fill: "var(--text-muted)" }} width={120} />
                    <Tooltip contentStyle={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "0.75rem", fontSize: 12 }} />
                    <Bar dataKey="likes" radius={[0, 6, 6, 0]} fill="#ef4444" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Upcoming events */}
            {upcomingActivities.length > 0 && (
              <div className="card p-5">
                <h3 className="font-display font-semibold mb-4 text-sm" style={{ color: "var(--text-primary)" }}>Upcoming Events</h3>
                <div className="space-y-2">
                  {upcomingActivities.slice(0, 5).map((a) => {
                    const diff = Math.ceil((new Date(a.date).getTime() - Date.now()) / 86400000);
                    return (
                      <div key={a.id} className="flex items-center justify-between px-4 py-2.5 rounded-xl" style={{ background: "var(--bg-section)" }}>
                        <span className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>{a.title}</span>
                        <span className="countdown-pill ml-3 flex-shrink-0">{diff === 0 ? "Today" : `${diff}d`}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Pending requests quick widget */}
            {pendingRequests.length > 0 && (
              <div className="card p-5">
                <h3 className="font-display font-semibold mb-4 text-sm flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
                  <Clock3 size={15} className="text-amber-400" /> Pending Join Requests ({pendingRequests.length})
                </h3>
                <div className="space-y-3">
                  {pendingRequests.slice(0, 5).map((r) => (
                    <div key={r.id} className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center text-sm font-bold text-white" style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
                        {r.image ? <Image src={r.image} alt={r.name} width={36} height={36} className="object-cover" /> : r.name[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>{r.name}</p>
                        <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>{r.work} · {r.memberType}</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => approveRequest(r)} disabled={approvingId === r.id} className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white transition font-medium">
                          <CheckCircle2 size={12} /> {approvingId === r.id ? "..." : "Approve"}
                        </button>
                        <button onClick={() => deleteDoc_("joinRequests", r.id, "request")} className="text-xs px-3 py-1.5 rounded-lg text-red-400 border transition" style={{ borderColor: "var(--border)" }}>Reject</button>
                      </div>
                    </div>
                  ))}
                  {pendingRequests.length > 5 && (
                    <button onClick={() => setTab("requests")} className="text-xs text-emerald-500 hover:text-emerald-400 transition">View all {pendingRequests.length} requests →</button>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* ── Join Requests Tab ── */}
      {tab === "requests" && (
        <div className="space-y-3">
          {requests.length === 0 && <p className="text-muted text-center py-10">{copy.noJoinRequests}</p>}
          {requests.map((r) => (
            <div key={r.id} className="card p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex gap-3 min-w-0 flex-1">
                  {r.image && (
                    <Image src={r.image} alt={r.name} width={48} height={48} className="rounded-full object-cover flex-shrink-0 ring-2 ring-white/10" />
                  )}
                  <div className="min-w-0">
                  <p className="font-medium text-sm">{r.name}</p>
                  <p className="text-secondary text-xs mt-0.5">{[r.memberType && `${r.memberType[0].toUpperCase() + r.memberType.slice(1)}`, r.sscYear && `SSC ${r.sscYear}`, r.work].filter(Boolean).join(" · ")}</p>
                  {r.workplace && <p className="text-secondary text-xs">📍 {r.workplace}</p>}
                  {r.address && <p className="text-secondary text-xs">{r.address}</p>}
                  {r.bloodGroup && <p className="text-secondary text-xs">🩸 {r.bloodGroup}</p>}
                  {r.phone && <p className="text-secondary text-xs">📞 {r.phone}</p>}
                  {r.email && <p className="text-secondary text-xs">✉️ {r.email}</p>}
                  {r.message && <p className="text-muted text-xs mt-1 italic">&quot;{r.message}&quot;</p>}
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full flex-shrink-0 ${r.status === "approved" ? "bg-green-500/20 text-green-400" : "bg-amber-500/20 text-amber-400"}`}>
                  {r.status}
                </span>
              </div>
              {r.message && (
                <div className="mb-3">
                  <button
                    onClick={() => removeRequestMessage(r.id)}
                    className="text-xs px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-white/5 text-secondary hover:text-primary transition"
                  >
                    {copy.removeMessage}
                  </button>
                </div>
              )}
              {r.status === "pending" && (
                <div className="flex gap-2 mt-3">
                  <button onClick={() => approveRequest(r)}
                    disabled={approvingId === r.id}
                    className="flex-1 btn-primary !py-2 !px-4 !text-xs"
                  >
                    {approvingId === r.id ? copy.approving : `✓ ${copy.approve}`}
                  </button>
                  <button onClick={() => deleteDoc_("joinRequests", r.id, "request")}
                    className="flex-1 btn-ghost !py-2 !px-4 !text-xs !text-red-500 !border-red-500/30 hover:!bg-red-500/10"
                  >
                    ✕ {copy.reject}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
