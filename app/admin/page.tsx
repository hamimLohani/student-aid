"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import {
  collection, addDoc, deleteDoc, doc, onSnapshot,
  serverTimestamp, updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { uploadToCloudinary } from "@/lib/cloudinary";
import toast from "react-hot-toast";
import { Trash2, Plus, Users, Megaphone, Calendar, FileText, Pencil, X, Check } from "lucide-react";

type Tab = "members" | "activities" | "announcements" | "requests";

interface Member { id: string; name: string; sscYear: string; work: string; workplace: string; bloodGroup: string; address: string; phone?: string; email?: string; image?: string; }
interface Activity { id: string; title: string; description: string; date: string; images: string[]; }
interface Announcement { id: string; title: string; content: string; }
interface JoinRequest { id: string; name: string; sscYear: string; work: string; workplace: string; bloodGroup: string; address: string; phone?: string; email?: string; image?: string; message: string; status: string; approvedAt?: { seconds: number }; }

const inputCls = "input-field";

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("members");

  const [members, setMembers] = useState<Member[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [requests, setRequests] = useState<JoinRequest[]>([]);

  const [memberForm, setMemberForm] = useState({ name: "", sscYear: "", work: "", workplace: "", bloodGroup: "", address: "", phone: "", email: "" });
  const [memberImage, setMemberImage] = useState<File | null>(null);
  const [memberLoading, setMemberLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: "", sscYear: "", work: "", workplace: "", bloodGroup: "", address: "", phone: "", email: "" });
  const [editImage, setEditImage] = useState<File | null>(null);
  const [activityForm, setActivityForm] = useState({ title: "", description: "", date: "" });
  const [activityMedia, setActivityMedia] = useState<File[]>([]);
  const [announcementForm, setAnnouncementForm] = useState({ title: "", content: "" });

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
    const cutoff = Date.now() - 24 * 60 * 60 * 1000;
    const expiredApproved = requests.filter(
      (r) => r.status === "approved" && r.approvedAt && r.approvedAt.seconds * 1000 <= cutoff
    );

    if (expiredApproved.length === 0) return;

    void Promise.all(
      expiredApproved.map((r) => deleteDoc(doc(db, "joinRequests", r.id)))
    ).catch(() => {
      toast.error("Failed to clean up expired approved requests.");
    });
  }, [requests]);

  const addMember = async () => {
    if (!memberForm.name) return toast.error("Name required");
    setMemberLoading(true);
    try {
      let image = "";
      if (memberImage) {
        toast.loading("Uploading photo...", { id: "mphoto" });
        image = await uploadToCloudinary(memberImage);
        toast.dismiss("mphoto");
      }
      await addDoc(collection(db, "members"), { ...memberForm, image });
      setMemberForm({ name: "", sscYear: "", work: "", workplace: "", bloodGroup: "", address: "", phone: "", email: "" });
      setMemberImage(null);
      toast.success("Member added!");
    } catch { toast.error("Failed to add member."); }
    setMemberLoading(false);
  };

  const addActivity = async () => {
    if (!activityForm.title) return toast.error("Title required");
    toast.loading("Uploading images...", { id: "upload" });
    const images = await Promise.all(activityMedia.map((f) => uploadToCloudinary(f)));
    toast.dismiss("upload");
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
    toast.success("Activity added & announced!");
  };

  const addAnnouncement = async () => {
    if (!announcementForm.title) return toast.error("Title required");
    await addDoc(collection(db, "announcements"), { ...announcementForm, timestamp: serverTimestamp(), likes: [] });
    setAnnouncementForm({ title: "", content: "" });
    toast.success("Announcement posted!");
  };

  const deleteDoc_ = async (col: string, id: string, label = "item") => {
    if (!confirm(`Delete this ${label}? This cannot be undone.`)) return;
    await deleteDoc(doc(db, col, id));
    toast.success("Deleted!");
  };

  const startEdit = (m: Member) => {
    setEditingId(m.id);
    setEditForm({ name: m.name, sscYear: m.sscYear, work: m.work, workplace: m.workplace, bloodGroup: m.bloodGroup, address: m.address, phone: m.phone || "", email: m.email || "" });
    setEditImage(null);
  };

  const saveEdit = async () => {
    if (!editingId) return;
    let image: string | undefined;
    if (editImage) {
      toast.loading("Uploading photo...", { id: "editphoto" });
      image = await uploadToCloudinary(editImage);
      toast.dismiss("editphoto");
    }
    const data: Record<string, string> = { ...editForm };
    if (image) data.image = image;
    await updateDoc(doc(db, "members", editingId), data);
    setEditingId(null);
    toast.success("Member updated!");
  };

  const approveRequest = async (r: JoinRequest) => {
    await addDoc(collection(db, "members"), { name: r.name, sscYear: r.sscYear, work: r.work, workplace: r.workplace || "", bloodGroup: r.bloodGroup || "", address: r.address, phone: r.phone || "", email: r.email || "", image: r.image || "" });
    await updateDoc(doc(db, "joinRequests", r.id), { status: "approved", approvedAt: serverTimestamp() });
    toast.success("Member approved!");
  };

  if (loading || !user) return <div className="pt-32 text-center text-muted">Loading...</div>;

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "members", label: "Members", icon: <Users size={16} /> },
    { key: "activities", label: "Activities", icon: <Calendar size={16} /> },
    { key: "announcements", label: "Announcements", icon: <Megaphone size={16} /> },
    { key: "requests", label: "Requests", icon: <FileText size={16} /> },
  ];

  return (
    <div className="pt-20 sm:pt-24 pb-20 px-3 sm:px-6 max-w-5xl mx-auto">

      {/* Header */}
      <div className="mb-5 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-secondary text-xs sm:text-sm mt-1 truncate">
          Logged in as <span className="text-indigo-400">{user.email}</span>
        </p>
      </div>

      {/* Stats — 2 cols on mobile, 4 on desktop */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Members", count: members.length, tab: "members" as Tab },
          { label: "Activities", count: activities.length, tab: "activities" as Tab },
          { label: "Announcements", count: announcements.length, tab: "announcements" as Tab },
          { label: "Pending", count: requests.filter((r) => r.status === "pending").length, tab: "requests" as Tab },
        ].map((s) => (
          <button key={s.label} onClick={() => setTab(s.tab)}
            className={`card p-3 sm:p-4 text-center transition hover:border-indigo-400 ${
              tab === s.tab ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-600/10" : ""
            }`}
          >
            <div className="text-2xl sm:text-3xl font-bold text-indigo-400">{s.count}</div>
            <div className="text-secondary text-xs sm:text-sm mt-1">{s.label}</div>
          </button>
        ))}
      </div>

      {/* Tabs — scrollable row on mobile */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1 scrollbar-hide">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium transition whitespace-nowrap flex-shrink-0 ${
              tab === t.key ? "bg-indigo-600 text-white" : "bg-gray-100 dark:bg-white/5 text-secondary hover:text-indigo-600 dark:hover:text-white"
            }`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* ── Members Tab ── */}
      {tab === "members" && (
        <div className="space-y-4">
          <div className="card p-4 sm:p-6">
            <h2 className="font-semibold mb-4 flex items-center gap-2 text-sm sm:text-base">
              <Plus size={15} /> Add Member
            </h2>
            <div className="space-y-3">
              {([["name", "Full Name"], ["work", "Occupation"], ["workplace", "Workplace"], ["address", "Current Address"], ["phone", "Phone Number (optional)"], ["email", "Email Address (optional)"]] as [keyof typeof memberForm, string][]).map(([k, p]) => (
                <input key={k} placeholder={p} value={memberForm[k as keyof typeof memberForm]}
                  onChange={(e) => setMemberForm({ ...memberForm, [k]: e.target.value })}
                  className={inputCls}
                />
              ))}
              <select value={memberForm.sscYear}
                onChange={(e) => setMemberForm({ ...memberForm, sscYear: e.target.value })}
                className={inputCls}
              >
                <option value="">SSC Year</option>
                {Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i).map((y) => (
                  <option key={y} value={String(y)}>{y}</option>
                ))}
              </select>
              <select value={memberForm.bloodGroup}
                onChange={(e) => setMemberForm({ ...memberForm, bloodGroup: e.target.value })}
                className={inputCls}
              >
                <option value="">Blood Group</option>
                {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
              <div>
                <label className="block text-xs text-secondary mb-1">Profile Photo</label>
                <input type="file" accept="image/*"
                  onChange={(e) => setMemberImage(e.target.files?.[0] || null)}
                  className="w-full text-sm text-secondary file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-indigo-600/30 file:text-indigo-300 file:text-sm"
                />
              </div>
            </div>
            <button onClick={addMember} disabled={memberLoading}
              className="mt-4 w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 px-6 py-2.5 rounded-xl text-sm font-medium transition"
            >
              {memberLoading ? "Adding..." : "Add Member"}
            </button>
          </div>

          <div className="space-y-2">
            {members.map((m) => (
              <div key={m.id} className="card overflow-hidden">
                {editingId === m.id ? (
                  <div className="p-4 space-y-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">Editing: {m.name}</span>
                      <button onClick={() => setEditingId(null)} className="text-muted hover:text-secondary transition"><X size={15} /></button>
                    </div>
                    {([["name", "Full Name"], ["work", "Occupation"], ["workplace", "Workplace"], ["address", "Current Address"], ["phone", "Phone"], ["email", "Email"]] as [keyof typeof editForm, string][]).map(([k, p]) => (
                      <input key={k} placeholder={p} value={editForm[k]}
                        onChange={(e) => setEditForm({ ...editForm, [k]: e.target.value })}
                        className={inputCls}
                      />
                    ))}
                    <select value={editForm.sscYear}
                      onChange={(e) => setEditForm({ ...editForm, sscYear: e.target.value })}
                      className={inputCls}
                    >
                      <option value="">SSC Year</option>
                      {Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i).map((y) => (
                        <option key={y} value={String(y)}>{y}</option>
                      ))}
                    </select>
                    <select value={editForm.bloodGroup}
                      onChange={(e) => setEditForm({ ...editForm, bloodGroup: e.target.value })}
                      className={inputCls}
                    >
                      <option value="">Blood Group</option>
                      {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((b) => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                    <div>
                      <label className="block text-xs text-secondary mb-1">Change Photo (optional)</label>
                      <input type="file" accept="image/*"
                        onChange={(e) => setEditImage(e.target.files?.[0] || null)}
                        className="w-full text-sm text-secondary file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-indigo-600/30 file:text-indigo-300 file:text-sm"
                      />
                    </div>
                    <div className="flex gap-2 pt-1">
                      <button onClick={saveEdit} className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-xl text-xs font-medium transition">
                        <Check size={13} /> Save
                      </button>
                      <button onClick={() => setEditingId(null)} className="px-4 py-2 rounded-xl text-xs font-medium bg-gray-100 dark:bg-white/5 text-secondary hover:text-primary transition">
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 px-4 py-3">
                    <div className="w-9 h-9 rounded-full overflow-hidden bg-indigo-600/30 flex items-center justify-center text-sm font-bold text-indigo-300 flex-shrink-0">
                      {m.image ? <img src={m.image} alt={m.name} className="w-full h-full object-cover" /> : m.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{m.name}</p>
                      <p className="text-secondary text-xs truncate">SSC {m.sscYear} · {m.workplace || m.work} {m.bloodGroup && `· ${m.bloodGroup}`}{m.phone && ` · 📞`}{m.email && ` · ✉️`}</p>
                    </div>
                    <button onClick={() => startEdit(m)} className="text-indigo-400 hover:text-indigo-300 transition flex-shrink-0 p-1">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => deleteDoc_("members", m.id, "member")} className="text-red-400 hover:text-red-300 transition flex-shrink-0 p-1">
                      <Trash2 size={15} />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Activities Tab ── */}
      {tab === "activities" && (
        <div className="space-y-4">
          <div className="card p-4 sm:p-6">
            <h2 className="font-semibold mb-4 flex items-center gap-2 text-sm sm:text-base">
              <Plus size={15} /> Add Activity
            </h2>
            <div className="space-y-3">
              <input placeholder="Title" value={activityForm.title}
                onChange={(e) => setActivityForm({ ...activityForm, title: e.target.value })}
                className={inputCls}
              />
              <textarea placeholder="Description" value={activityForm.description} rows={3}
                onChange={(e) => setActivityForm({ ...activityForm, description: e.target.value })}
                className={`${inputCls} resize-none`}
              />
              <input type="date" value={activityForm.date}
                onChange={(e) => setActivityForm({ ...activityForm, date: e.target.value })}
                className={inputCls}
              />
              <div>
                <label className="block text-xs text-secondary mb-1">Photos (select multiple)</label>
                <input type="file" accept="image/*" multiple
                  onChange={(e) => setActivityMedia(Array.from(e.target.files || []))}
                  className="w-full text-sm text-secondary file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-indigo-600/30 file:text-indigo-300 file:text-sm"
                />
                {activityMedia.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {activityMedia.map((f, i) => (
                      <div key={i} className="relative">
                        <img src={URL.createObjectURL(f)} alt="" className="w-16 h-16 object-cover rounded-lg" />
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
              className="mt-4 w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 px-6 py-2.5 rounded-xl text-sm font-medium transition"
            >
              Add Activity
            </button>
          </div>

          <div className="space-y-2">
            {activities.map((a) => (
              <div key={a.id} className="card flex items-center gap-3 px-4 py-3">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{a.title}</p>
                  <p className="text-secondary text-xs">{a.date} · {a.images?.length || 0} photos</p>
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
              <Plus size={15} /> Post Announcement
            </h2>
            <div className="space-y-3">
              <input placeholder="Title" value={announcementForm.title}
                onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
                className={inputCls}
              />
              <textarea placeholder="Content" value={announcementForm.content} rows={4}
                onChange={(e) => setAnnouncementForm({ ...announcementForm, content: e.target.value })}
                className={`${inputCls} resize-none`}
              />
            </div>
            <button onClick={addAnnouncement}
              className="mt-4 w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 px-6 py-2.5 rounded-xl text-sm font-medium transition"
            >
              Post Announcement
            </button>
          </div>

          <div className="space-y-2">
            {announcements.map((a) => (
              <div key={a.id} className="card flex items-center gap-3 px-4 py-3">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{a.title}</p>
                  <p className="text-secondary text-xs line-clamp-1">{a.content}</p>
                </div>
                <button onClick={() => deleteDoc_("announcements", a.id, "announcement")} className="text-red-400 hover:text-red-300 transition flex-shrink-0 p-1">
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Join Requests Tab ── */}
      {tab === "requests" && (
        <div className="space-y-3">
          {requests.length === 0 && <p className="text-muted text-center py-10">No join requests.</p>}
          {requests.some((r) => r.status === "approved") && (
            <p className="text-xs text-muted">Approved requests are removed automatically after 24 hours.</p>
          )}
          {requests.map((r) => (
            <div key={r.id} className="card p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex gap-3 min-w-0 flex-1">
                  {r.image && (
                    <img src={r.image} alt={r.name} className="w-12 h-12 rounded-full object-cover flex-shrink-0 ring-2 ring-white/10" />
                  )}
                  <div className="min-w-0">
                  <p className="font-medium text-sm">{r.name}</p>
                  <p className="text-secondary text-xs mt-0.5">SSC {r.sscYear} · {r.work}</p>
                  {r.workplace && <p className="text-secondary text-xs">📍 {r.workplace}</p>}
                  {r.address && <p className="text-secondary text-xs">{r.address}</p>}
                  {r.bloodGroup && <p className="text-secondary text-xs">🩸 {r.bloodGroup}</p>}
                  {r.phone && <p className="text-secondary text-xs">📞 {r.phone}</p>}
                  {r.email && <p className="text-secondary text-xs">✉️ {r.email}</p>}
                  {r.message && <p className="text-muted text-xs mt-1 italic">"{r.message}"</p>}
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full flex-shrink-0 ${r.status === "approved" ? "bg-green-500/20 text-green-400" : "bg-amber-500/20 text-amber-400"}`}>
                  {r.status}
                </span>
              </div>
              {r.status === "pending" && (
                <div className="flex gap-2 mt-3">
                  <button onClick={() => approveRequest(r)}
                    className="flex-1 bg-green-600 hover:bg-green-500 py-2 rounded-xl text-xs font-medium transition"
                  >
                    ✓ Approve
                  </button>
                  <button onClick={() => deleteDoc_("joinRequests", r.id, "request")}
                    className="flex-1 bg-red-600/20 hover:bg-red-600/40 text-red-400 py-2 rounded-xl text-xs font-medium transition"
                  >
                    ✕ Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
