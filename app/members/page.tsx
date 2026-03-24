"use client";
import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { getMemberTypeLabel, membersCopy } from "@/lib/i18n";

interface Member {
  id: string; name: string; sscYear: string; memberType?: string; work: string;
  workplace: string; bloodGroup: string; address: string;
  phone?: string; email?: string; image?: string;
}

export default function MembersPage() {
  const { language } = useLanguage();
  const copy = membersCopy[language];
  const [members, setMembers] = useState<Member[]>([]);
  const [search, setSearch] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [filterMemberType, setFilterMemberType] = useState("");
  const [filterBlood, setFilterBlood] = useState("");
  const [filterWorkplace, setFilterWorkplace] = useState("");
  const [filterAddress, setFilterAddress] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const activeFilters = [filterYear, filterMemberType, filterBlood, filterWorkplace, filterAddress].filter(Boolean).length;

  useEffect(() => {
    return onSnapshot(collection(db, "members"), (snap) =>
      setMembers(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Member)))
    );
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
      [
        m.name,
        m.phone,
        m.email,
        m.work,
        m.workplace,
        m.address,
        m.sscYear,
        m.bloodGroup,
        m.memberType,
      ]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(q));

    return (
      matchesSearch &&
      (filterYear ? m.sscYear === filterYear : true) &&
      (filterMemberType ? m.memberType === filterMemberType : true) &&
      (filterBlood ? m.bloodGroup === filterBlood : true) &&
      (filterWorkplace ? m.workplace === filterWorkplace : true) &&
      (filterAddress ? m.address === filterAddress : true)
    );
  });

  return (
    <div className="pt-20 sm:pt-24 pb-16 px-3 sm:px-4 max-w-6xl mx-auto">
      <h1 className="text-3xl sm:text-4xl font-bold mb-1">{copy.title}</h1>
      <p className="text-secondary text-sm sm:text-base mb-6 sm:mb-8">{copy.description}</p>

      {/* Search + Filter toggle */}
      <div className="flex gap-2 mb-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder={copy.searchPlaceholder}
            className="input-field pl-9"
          />
        </div>
        <button onClick={() => setShowFilters(!showFilters)}
          className={`sm:hidden flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm font-medium transition flex-shrink-0 ${
            showFilters || activeFilters > 0
              ? "bg-indigo-600 border-indigo-600 text-white"
              : "border-[var(--border)] text-secondary hover:border-indigo-400"
          }`}
        >
          <SlidersHorizontal size={15} />
          {activeFilters > 0 && <span className="bg-white text-indigo-600 text-xs font-bold w-4 h-4 rounded-full flex items-center justify-center">{activeFilters}</span>}
        </button>
      </div>

      {/* Filters — always visible on desktop, collapsible on mobile */}
      <motion.div
        initial={false}
        animate={{ height: showFilters ? "auto" : 0, opacity: showFilters ? 1 : 0 }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
        className="overflow-hidden sm:!h-auto sm:!opacity-100"
      >
        <div className="grid grid-cols-1 gap-2 pb-3 sm:grid-cols-5 sm:gap-3 sm:pb-0">
          <select value={filterYear} onChange={(e) => setFilterYear(e.target.value)} className="input-field">
            <option value="">{copy.allSscYears}</option>
            {years.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
          <select value={filterMemberType} onChange={(e) => setFilterMemberType(e.target.value)} className="input-field">
            <option value="">{copy.allMemberTypes}</option>
            {memberTypes.map((type) => <option key={type} value={type}>{getMemberTypeLabel(type, language)}</option>)}
          </select>
          <select value={filterBlood} onChange={(e) => setFilterBlood(e.target.value)} className="input-field">
            <option value="">{copy.allBloodGroups}</option>
            {bloodGroups.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
          <select value={filterWorkplace} onChange={(e) => setFilterWorkplace(e.target.value)} className="input-field">
            <option value="">{copy.allWorkplaces}</option>
            {workplaces.map((w) => <option key={w} value={w}>{w}</option>)}
          </select>
          <select value={filterAddress} onChange={(e) => setFilterAddress(e.target.value)} className="input-field">
            <option value="">{copy.allAddresses}</option>
            {addresses.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
        {activeFilters > 0 && (
          <button onClick={() => { setFilterYear(""); setFilterMemberType(""); setFilterBlood(""); setFilterWorkplace(""); setFilterAddress(""); }}
            className="sm:hidden flex items-center gap-1 text-xs text-red-400 hover:text-red-300 transition mb-3"
          >
            <X size={12} /> {copy.clearFilters}
          </button>
        )}
      </motion.div>

      {/* Active filter badges — mobile only */}
      {activeFilters > 0 && !showFilters && (
        <div className="flex flex-wrap gap-2 mb-3 sm:hidden">
          {filterYear && <span className="flex items-center gap-1 text-xs bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 px-2 py-1 rounded-full">SSC {filterYear} <button onClick={() => setFilterYear("")}><X size={10} /></button></span>}
          {filterMemberType && <span className="flex items-center gap-1 text-xs bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 px-2 py-1 rounded-full">👥 {filterMemberType} <button onClick={() => setFilterMemberType("")}><X size={10} /></button></span>}
          {filterBlood && <span className="flex items-center gap-1 text-xs bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 px-2 py-1 rounded-full">🩸 {filterBlood} <button onClick={() => setFilterBlood("")}><X size={10} /></button></span>}
          {filterWorkplace && <span className="flex items-center gap-1 text-xs bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 px-2 py-1 rounded-full">🏢 {filterWorkplace} <button onClick={() => setFilterWorkplace("")}><X size={10} /></button></span>}
          {filterAddress && <span className="flex items-center gap-1 text-xs bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400 px-2 py-1 rounded-full">📍 {filterAddress} <button onClick={() => setFilterAddress("")}><X size={10} /></button></span>}
        </div>
      )}

      <div className="mb-6 sm:mb-8" />

      {filtered.length === 0 && <p className="text-muted text-center py-20">{copy.noMembers}</p>}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-5 mt-6">
        {filtered.map((m, i) => (
          <motion.div key={m.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} whileHover={{ y: -4, scale: 1.02 }} whileTap={{ scale: 0.97 }} transition={{ delay: i * 0.05, type: "spring", stiffness: 280, damping: 20 }}>
            <Link href={`/members/${m.id}`} className="card block p-3 sm:p-5 text-center hover:border-indigo-400">
              <div className="relative w-14 h-14 sm:w-20 sm:h-20 rounded-full mx-auto mb-2 sm:mb-3 overflow-hidden bg-indigo-100 dark:bg-indigo-600/30 flex items-center justify-center text-xl sm:text-3xl font-bold text-indigo-600 dark:text-indigo-300 ring-2 ring-indigo-200 dark:ring-white/10">
                {m.image ? <Image src={m.image} alt={m.name} fill sizes="80px" className="object-cover" /> : m.name[0]}
              </div>
              <h3 className="font-semibold text-sm sm:text-base leading-tight">{m.name}</h3>
              {m.memberType && <p className="text-secondary text-xs mt-1">{m.memberType[0].toUpperCase() + m.memberType.slice(1)}</p>}
              {m.sscYear && <p className="text-secondary text-xs mt-1">SSC {m.sscYear}</p>}
              <p className="text-muted text-xs mt-0.5 truncate">📍 {m.workplace || m.work || "—"}</p>
              <div className="flex flex-wrap justify-center gap-1 mt-2">
                {m.bloodGroup && <span className="text-xs bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full">{m.bloodGroup}</span>}
                {m.phone && <span className="text-xs bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400 px-2 py-0.5 rounded-full">📞</span>}
                {m.email && <span className="text-xs bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full">✉️</span>}
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
