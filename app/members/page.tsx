"use client";
import { useEffect, useState, useCallback } from "react";
import { collection, onSnapshot, query, orderBy, limit, getDocs, startAfter, QueryDocumentSnapshot, DocumentData } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  Search, SlidersHorizontal, X, Users, MapPin, Briefcase,
  FileDown, LayoutGrid, List, Droplets, ChevronDown, Loader2,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { getMemberTypeLabel, membersCopy } from "@/lib/i18n";
import { useAuth } from "@/context/AuthContext";

interface Member {
  id: string;
  name: string;
  sscYear: string;
  memberType?: string;
  work: string;
  workplace: string;
  bloodGroup: string;
  address: string;
  phone?: string;
  email?: string;
  image?: string;
}

const PAGE_SIZE = 16;

const memberTypeColor: Record<string, string> = {
  "Founder Member": "pill-violet",
  "Established Member": "pill-violet",
  "Senior Member": "pill-violet",
  "General Member": "pill-cyan",
  "Junior Member": "pill-cyan",
  Locals: "pill-amber",
};

function SkeletonMember() {
  return (
    <div className="card overflow-hidden p-5">
      <div className="w-16 h-16 sm:w-20 sm:h-20 skeleton rounded-full mx-auto mb-3" />
      <div className="skeleton h-4 w-3/4 mx-auto rounded-lg mb-2" />
      <div className="skeleton h-3 w-1/2 mx-auto rounded-lg mb-2" />
      <div className="skeleton h-3 w-2/3 mx-auto rounded-lg" />
    </div>
  );
}

const fadeUp = { hidden: { opacity: 0, scale: 0.95 }, show: { opacity: 1, scale: 1 } };

type ViewMode = "grid" | "byYear" | "byType";

export default function MembersPage() {
  const { language } = useLanguage();
  const { user } = useAuth();
  const copy = membersCopy[language];
  const [allMembers, setAllMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [filterMemberType, setFilterMemberType] = useState("");
  const [filterBlood, setFilterBlood] = useState("");
  const [filterWorkplace, setFilterWorkplace] = useState("");
  const [filterAddress, setFilterAddress] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [exporting, setExporting] = useState(false);

  const activeFilters = [filterYear, filterMemberType, filterBlood, filterWorkplace, filterAddress].filter(Boolean).length;

  useEffect(() => {
    return onSnapshot(collection(db, "members"), (snap) => {
      setAllMembers(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Member)));
      setLoading(false);
    });
  }, []);

  const years = [...new Set(allMembers.map((m) => m.sscYear).filter(Boolean))].sort();
  const memberTypes = [...new Set(allMembers.map((m) => m.memberType).filter(Boolean))].sort() as string[];
  const bloodGroups = [...new Set(allMembers.map((m) => m.bloodGroup).filter(Boolean))].sort();
  const workplaces = [...new Set(allMembers.map((m) => m.workplace).filter(Boolean))].sort();
  const addresses = [...new Set(allMembers.map((m) => m.address).filter(Boolean))].sort();

  const filtered = allMembers.filter((m) => {
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q ||
      [m.name, m.phone, m.email, m.work, m.workplace, m.address, m.sscYear, m.bloodGroup, m.memberType]
        .filter(Boolean)
        .some((v) => v!.toLowerCase().includes(q));
    return (
      matchesSearch &&
      (!filterYear || m.sscYear === filterYear) &&
      (!filterMemberType || m.memberType === filterMemberType) &&
      (!filterBlood || m.bloodGroup === filterBlood) &&
      (!filterWorkplace || m.workplace === filterWorkplace) &&
      (!filterAddress || m.address === filterAddress)
    );
  });

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  const clearFilters = () => {
    setFilterYear(""); setFilterMemberType(""); setFilterBlood("");
    setFilterWorkplace(""); setFilterAddress("");
  };

  // PDF Export (admin only)
  const exportPDF = async () => {
    if (!user) return;
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
      doc.text("Student Aid BDG — Member Directory", 14, 13);
      doc.setFontSize(9);
      doc.text(`Exported: ${new Date().toLocaleDateString("en-US", { dateStyle: "long" })} · ${filtered.length} members`, 297 - 14, 13, { align: "right" });

      autoTable(doc, {
        startY: 24,
        head: [["Name", "Type", "SSC Year", "Occupation", "Workplace", "Blood", "Phone", "Email", "Address"]],
        body: filtered.map((m) => [
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
        doc.text(`Page ${i} of ${pageCount} · Student Aid BDG`, 14, 205);
      }

      doc.save(`StudentAidBDG_Members_${new Date().toISOString().split("T")[0]}.pdf`);
    } finally {
      setExporting(false);
    }
  };

  // Group by SSC year or type
  const groupBy = (key: "sscYear" | "memberType") => {
    const grouped: Record<string, Member[]> = {};
    filtered.forEach((m) => {
      const k = m[key] || "Unknown";
      if (!grouped[k]) grouped[k] = [];
      grouped[k].push(m);
    });
    return Object.entries(grouped).sort((a, b) => a[0].localeCompare(b[0]));
  };

  const MemberCard = ({ m }: { m: Member }) => (
    <Link href={`/members/${m.id}`} className="member-card block group">
      <div className="p-4 sm:p-5 text-center">
        <div
          className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full mx-auto mb-3 overflow-hidden flex-shrink-0"
          style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", boxShadow: "0 0 0 2px var(--border)" }}
        >
          {m.image ? (
            <Image src={m.image} alt={m.name} fill sizes="80px" className="object-cover" />
          ) : (
            <span className="w-full h-full flex items-center justify-center text-xl sm:text-2xl font-extrabold text-white font-display">
              {m.name[0]}
            </span>
          )}
        </div>
        <h3 className="font-display text-sm sm:text-base font-bold leading-tight mb-1.5 group-hover:text-[var(--accent)] transition-colors" style={{ color: "var(--text-primary)" }}>
          {m.name}
        </h3>
        {m.memberType && (
          <span className={`pill text-[10px] mb-2 ${memberTypeColor[m.memberType] ?? "pill-violet"}`}>
            {getMemberTypeLabel(m.memberType, language)}
          </span>
        )}
        {m.sscYear && (
          <p className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>SSC {m.sscYear}</p>
        )}
        <p className="text-xs truncate flex items-center justify-center gap-1" style={{ color: "var(--text-muted)" }}>
          <Briefcase size={10} />
          {m.workplace || m.work || "—"}
        </p>
        <div className="flex flex-wrap justify-center gap-1 mt-2.5">
          {m.bloodGroup && <span className="pill pill-red text-[10px]">{m.bloodGroup}</span>}
          {m.phone && <span className="pill pill-green text-[10px]">📞</span>}
          {m.email && <span className="pill pill-cyan text-[10px]">✉️</span>}
        </div>
      </div>
      <div className="overlay">
        <div className="flex items-center gap-2">
          <MapPin size={12} className="text-emerald-300 flex-shrink-0" />
          <span className="text-white text-xs truncate">{m.address || "—"}</span>
        </div>
      </div>
    </Link>
  );

  return (
    <div className="pt-28 sm:pt-32 pb-20 px-4 max-w-6xl mx-auto page-enter">
      {/* Page header */}
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-10">
        <span className="badge mb-4"><Users size={12} /> {copy.title}</span>
        <h1
          className="font-display text-4xl sm:text-5xl md:text-6xl font-extrabold mb-4 leading-tight"
          style={{ background: "linear-gradient(135deg, var(--text-primary) 0%, var(--accent) 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
        >
          {copy.title}
        </h1>
        <p className="text-base sm:text-lg max-w-xl" style={{ color: "var(--text-secondary)" }}>{copy.description}</p>
      </motion.div>

      {/* Toolbar */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex gap-2 mb-3 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-0">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={copy.searchPlaceholder} className="input-field pl-10" id="member-search" />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }}>
              <X size={14} />
            </button>
          )}
        </div>



        {/* Filter toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm font-semibold transition ${showFilters || activeFilters > 0 ? "bg-[var(--accent)] border-[var(--accent)] text-white shadow-md shadow-emerald-900/20" : "border-[var(--border)] text-[var(--text-secondary)]"}`}
          style={{ fontFamily: "'Outfit', system-ui, sans-serif" }}
        >
          <SlidersHorizontal size={14} />
          {activeFilters > 0 && <span className="bg-white text-[var(--accent)] text-xs font-bold w-4 h-4 rounded-full flex items-center justify-center">{activeFilters}</span>}
        </button>

        {/* Blood Donor link */}
        <Link href="/members/donors" className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-red-500/40 bg-red-500/10 text-red-500 text-sm font-semibold transition hover:bg-red-500/20 hover:border-red-500/60 hover:scale-105" style={{ fontFamily: "'Outfit', system-ui, sans-serif" }}>
          <Droplets size={14} />
          <span className="hidden sm:inline">Donors</span>
        </Link>

        {/* PDF Export (admin only) */}
        {user && (
          <button
            onClick={exportPDF}
            disabled={exporting || filtered.length === 0}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm font-semibold transition hover:scale-105 disabled:opacity-50 bg-[var(--accent)]/10 text-[var(--accent)] border-[var(--accent)]/30 hover:bg-[var(--accent)]/20"
            style={{ fontFamily: "'Outfit', system-ui, sans-serif" }}
            title="Export as PDF (Admin only)"
          >
            {exporting ? <Loader2 size={14} className="animate-spin text-[var(--accent)]" /> : <FileDown size={14} className="text-[var(--accent)]" />}
            <span className="hidden sm:inline">PDF</span>
          </button>
        )}
      </motion.div>

      {/* Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden mb-3"
          >
            <div className="grid grid-cols-1 gap-2 pb-3 sm:grid-cols-4 sm:gap-3">
              {[
                { value: filterYear, set: setFilterYear, label: copy.allSscYears, options: years.map((y) => ({ v: y, l: y })) },
                { value: filterMemberType, set: setFilterMemberType, label: copy.allMemberTypes, options: memberTypes.map((t) => ({ v: t, l: getMemberTypeLabel(t, language) })) },
                { value: filterWorkplace, set: setFilterWorkplace, label: copy.allWorkplaces, options: workplaces.map((w) => ({ v: w, l: w })) },
                { value: filterAddress, set: setFilterAddress, label: copy.allAddresses, options: addresses.map((a) => ({ v: a, l: a })) },
              ].map((f, i) => (
                <select key={i} value={f.value} onChange={(e) => f.set(e.target.value)} className="input-field text-sm">
                  <option value="">{f.label}</option>
                  {f.options.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
                </select>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active filter pills */}
      {activeFilters > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {filterYear && <span className="pill pill-violet">SSC {filterYear} <button onClick={() => setFilterYear("")}><X size={10} /></button></span>}
          {filterMemberType && <span className="pill pill-amber">{filterMemberType} <button onClick={() => setFilterMemberType("")}><X size={10} /></button></span>}
          {filterBlood && <span className="pill pill-red">🩸 {filterBlood} <button onClick={() => setFilterBlood("")}><X size={10} /></button></span>}
          {filterWorkplace && <span className="pill pill-violet">🏢 {filterWorkplace} <button onClick={() => setFilterWorkplace("")}><X size={10} /></button></span>}
          {filterAddress && <span className="pill pill-green">📍 {filterAddress} <button onClick={() => setFilterAddress("")}><X size={10} /></button></span>}
          <button onClick={clearFilters} className="pill pill-red cursor-pointer"><X size={10} /> {copy.clearFilters}</button>
        </div>
      )}

      {/* Results count */}
      {!loading && (
        <p className="text-sm mb-5 font-medium" style={{ color: "var(--text-muted)" }}>
          {filtered.length} member{filtered.length !== 1 ? "s" : ""} found
        </p>
      )}

      {/* Skeleton */}
      {loading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-5">
          {Array.from({ length: 8 }).map((_, i) => <SkeletonMember key={i} />)}
        </div>
      )}

      {/* Empty state */}
      {!loading && filtered.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-32 text-center">
          <div className="w-20 h-20 rounded-3xl flex items-center justify-center mb-6" style={{ background: "var(--bg-section)" }}>
            <Users size={36} style={{ color: "var(--text-muted)" }} />
          </div>
          <p className="font-display text-xl font-semibold mb-2" style={{ color: "var(--text-primary)" }}>No Members Found</p>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>{copy.noMembers}</p>
        </motion.div>
      )}

      {/* Grid view */}
      {!loading && filtered.length > 0 && (
        <>
          <motion.div
            initial="hidden" animate="show"
            variants={{ show: { transition: { staggerChildren: 0.04 } } }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-5"
          >
            {visible.map((m) => (
              <motion.div key={m.id} variants={fadeUp} transition={{ type: "spring", stiffness: 300, damping: 24 }}>
                <MemberCard m={m} />
              </motion.div>
            ))}
          </motion.div>

          {/* Load more */}
          {hasMore && (
            <div className="flex justify-center mt-8">
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                className="btn-ghost flex items-center gap-2"
              >
                <ChevronDown size={16} />
                Load More ({filtered.length - visibleCount} remaining)
              </motion.button>
            </div>
          )}
        </>
      )}


    </div>
  );
}
