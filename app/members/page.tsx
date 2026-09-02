"use client";
import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Search, SlidersHorizontal, X, Users, MapPin, Briefcase } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { getMemberTypeLabel, membersCopy } from "@/lib/i18n";

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

const memberTypeColor: Record<string, string> = {
  "Senior Member": "pill-violet",
  "Junior Member": "pill-cyan",
  Locals: "pill-amber",
};

/* ── Skeleton Member Card ── */
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

export default function MembersPage() {
  const { language } = useLanguage();
  const copy = membersCopy[language];
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [filterMemberType, setFilterMemberType] = useState("");
  const [filterBlood, setFilterBlood] = useState("");
  const [filterWorkplace, setFilterWorkplace] = useState("");
  const [filterAddress, setFilterAddress] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const activeFilters = [filterYear, filterMemberType, filterBlood, filterWorkplace, filterAddress].filter(Boolean).length;

  useEffect(() => {
    return onSnapshot(collection(db, "members"), (snap) => {
      setMembers(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Member)));
      setLoading(false);
    });
  }, []);

  const years = [...new Set(members.map((m) => m.sscYear).filter(Boolean))].sort();
  const memberTypes = [...new Set(members.map((m) => m.memberType).filter(Boolean))].sort() as string[];
  const bloodGroups = [...new Set(members.map((m) => m.bloodGroup).filter(Boolean))].sort();
  const workplaces = [...new Set(members.map((m) => m.workplace).filter(Boolean))].sort();
  const addresses = [...new Set(members.map((m) => m.address).filter(Boolean))].sort();

  const filtered = members.filter((m) => {
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

  const clearFilters = () => {
    setFilterYear("");
    setFilterMemberType("");
    setFilterBlood("");
    setFilterWorkplace("");
    setFilterAddress("");
  };

  return (
    <div className="pt-24 pb-20 px-4 max-w-6xl mx-auto page-enter">
      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-10"
      >
        <span className="badge mb-4">
          <Users size={12} />
          {copy.title}
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
        <p className="text-base sm:text-lg max-w-xl" style={{ color: "var(--text-secondary)" }}>
          {copy.description}
        </p>
      </motion.div>

      {/* Search + Filter toggle */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex gap-3 mb-3"
      >
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2"
            style={{ color: "var(--text-muted)" }}
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={copy.searchPlaceholder}
            className="input-field pl-10"
            id="member-search"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 transition"
              style={{ color: "var(--text-muted)" }}
            >
              <X size={14} />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`sm:hidden flex items-center gap-1.5 px-4 py-2 rounded-xl border text-sm font-semibold transition flex-shrink-0 ${
            showFilters || activeFilters > 0
              ? "bg-indigo-600 border-indigo-600 text-white"
              : "border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--border-hover)]"
          }`}
          style={{ fontFamily: "'Outfit', system-ui, sans-serif" }}
        >
          <SlidersHorizontal size={15} />
          {activeFilters > 0 && (
            <span className="bg-white text-indigo-600 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
              {activeFilters}
            </span>
          )}
        </button>
      </motion.div>

      {/* Filters */}
      <AnimatePresence>
        {(showFilters || true) && (
          <motion.div
            initial={false}
            animate={{ height: showFilters ? "auto" : 0, opacity: showFilters ? 1 : 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden sm:!h-auto sm:!opacity-100 mb-4"
          >
            <div className="grid grid-cols-1 gap-2 pb-3 sm:grid-cols-5 sm:gap-3 sm:pb-0">
              {[
                { value: filterYear, set: setFilterYear, label: copy.allSscYears, options: years.map((y) => ({ v: y, l: y })) },
                { value: filterMemberType, set: setFilterMemberType, label: copy.allMemberTypes, options: memberTypes.map((t) => ({ v: t, l: getMemberTypeLabel(t, language) })) },
                { value: filterBlood, set: setFilterBlood, label: copy.allBloodGroups, options: bloodGroups.map((b) => ({ v: b, l: b })) },
                { value: filterWorkplace, set: setFilterWorkplace, label: copy.allWorkplaces, options: workplaces.map((w) => ({ v: w, l: w })) },
                { value: filterAddress, set: setFilterAddress, label: copy.allAddresses, options: addresses.map((a) => ({ v: a, l: a })) },
              ].map((f, i) => (
                <select
                  key={i}
                  value={f.value}
                  onChange={(e) => f.set(e.target.value)}
                  className="input-field text-sm"
                >
                  <option value="">{f.label}</option>
                  {f.options.map((o) => (
                    <option key={o.v} value={o.v}>{o.l}</option>
                  ))}
                </select>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active filter badges */}
      {activeFilters > 0 && (
        <div className="flex flex-wrap gap-2 mb-5">
          {filterYear && (
            <span className="pill pill-violet">
              SSC {filterYear}
              <button onClick={() => setFilterYear("")}><X size={10} /></button>
            </span>
          )}
          {filterMemberType && (
            <span className="pill pill-amber">
              {filterMemberType}
              <button onClick={() => setFilterMemberType("")}><X size={10} /></button>
            </span>
          )}
          {filterBlood && (
            <span className="pill pill-red">
              🩸 {filterBlood}
              <button onClick={() => setFilterBlood("")}><X size={10} /></button>
            </span>
          )}
          {filterWorkplace && (
            <span className="pill pill-violet">
              🏢 {filterWorkplace}
              <button onClick={() => setFilterWorkplace("")}><X size={10} /></button>
            </span>
          )}
          {filterAddress && (
            <span className="pill pill-green">
              📍 {filterAddress}
              <button onClick={() => setFilterAddress("")}><X size={10} /></button>
            </span>
          )}
          <button
            onClick={clearFilters}
            className="pill pill-red cursor-pointer"
          >
            <X size={10} /> {copy.clearFilters}
          </button>
        </div>
      )}

      {/* Results count */}
      {!loading && (
        <p className="text-sm mb-6 font-medium" style={{ color: "var(--text-muted)" }}>
          {filtered.length} member{filtered.length !== 1 ? "s" : ""} found
        </p>
      )}

      {/* Skeleton loading */}
      {loading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-5">
          {Array.from({ length: 8 }).map((_, i) => <SkeletonMember key={i} />)}
        </div>
      )}

      {/* Empty state */}
      {!loading && filtered.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-32 text-center"
        >
          <div
            className="w-20 h-20 rounded-3xl flex items-center justify-center mb-6"
            style={{ background: "var(--bg-section)" }}
          >
            <Users size={36} style={{ color: "var(--text-muted)" }} />
          </div>
          <p className="font-display text-xl font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
            No Members Found
          </p>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            {copy.noMembers}
          </p>
        </motion.div>
      )}

      {/* Member grid */}
      {!loading && filtered.length > 0 && (
        <motion.div
          initial="hidden"
          animate="show"
          variants={{ show: { transition: { staggerChildren: 0.05 } } }}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-5"
        >
          {filtered.map((m) => (
            <motion.div
              key={m.id}
              variants={fadeUp}
              transition={{ type: "spring", stiffness: 300, damping: 24 }}
            >
              <Link href={`/members/${m.id}`} className="member-card block group">
                {/* Card body */}
                <div className="p-4 sm:p-5 text-center">
                  {/* Avatar */}
                  <div
                    className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full mx-auto mb-3 overflow-hidden ring-2 flex-shrink-0"
                    style={{
                      background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                      ringColor: "var(--border)",
                    }}
                  >
                    {m.image ? (
                      <Image
                        src={m.image}
                        alt={m.name}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    ) : (
                      <span className="w-full h-full flex items-center justify-center text-xl sm:text-2xl font-extrabold text-white font-display">
                        {m.name[0]}
                      </span>
                    )}
                  </div>

                  {/* Name */}
                  <h3
                    className="font-display text-sm sm:text-base font-bold leading-tight mb-1.5 group-hover:text-indigo-500 transition-colors"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {m.name}
                  </h3>

                  {/* Member type badge */}
                  {m.memberType && (
                    <span className={`pill text-[10px] mb-2 ${memberTypeColor[m.memberType] ?? "pill-violet"}`}>
                      {getMemberTypeLabel(m.memberType, language)}
                    </span>
                  )}

                  {/* SSC year */}
                  {m.sscYear && (
                    <p className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>
                      SSC {m.sscYear}
                    </p>
                  )}

                  {/* Workplace */}
                  <p
                    className="text-xs truncate flex items-center justify-center gap-1"
                    style={{ color: "var(--text-muted)" }}
                  >
                    <Briefcase size={10} />
                    {m.workplace || m.work || "—"}
                  </p>

                  {/* Badges row */}
                  <div className="flex flex-wrap justify-center gap-1 mt-2.5">
                    {m.bloodGroup && (
                      <span className="pill pill-red text-[10px]">{m.bloodGroup}</span>
                    )}
                    {m.phone && (
                      <span className="pill pill-green text-[10px]">📞</span>
                    )}
                    {m.email && (
                      <span className="pill pill-cyan text-[10px]">✉️</span>
                    )}
                  </div>
                </div>

                {/* Hover overlay */}
                <div className="overlay">
                  <div className="flex items-center gap-2">
                    <MapPin size={12} className="text-indigo-400 flex-shrink-0" />
                    <span className="text-white text-xs truncate">{m.address || "—"}</span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
