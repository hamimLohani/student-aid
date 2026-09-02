"use client";

import Link from "next/link";
import Image from "next/image";
import { Mail, Phone, ArrowUpRight, Github, Facebook, ShieldCheck, MapPin, HeartHandshake, Globe, FileText, Droplets } from "lucide-react";
import { formatBdPhone, toBdTel } from "@/lib/phone";
import { useLanguage } from "@/context/LanguageContext";
import { footerCopy, navbarCopy } from "@/lib/i18n";
import { motion } from "framer-motion";

export default function Footer() {
  const contactPhone = formatBdPhone("01572906733");
  const { language } = useLanguage();
  const copy = footerCopy[language];
  const nav = navbarCopy[language];

  const quickLinks = [
    { href: "/", label: nav.home },
    { href: "/activities", label: nav.activities },
    { href: "/members", label: nav.members },
    { href: "/announcements", label: nav.announcements },
    { href: "/join", label: nav.join },
  ];

  const communityLinks = [
    { href: "/members/donors", label: language === "bn" ? "রক্তদাতা খুঁজুন" : "Blood Donors" },
    { href: "/members/donors", label: language === "bn" ? "জরুরি রক্ত অনুরোধ" : "Emergency Blood Aid" },
    { href: "/join", label: language === "bn" ? "সদস্য আবেদন" : "Member Application" },
  ];

  return (
    <footer className="relative mt-24 overflow-hidden" style={{ borderTop: "1px solid var(--border)" }}>
      {/* Top glow separator line */}
      <div className="glow-line" />

      {/* Background ambient radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 10% 120%, rgba(46,107,69,0.08) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 90% 110%, rgba(77,142,100,0.06) 0%, transparent 55%)",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-12">
          
          {/* Col 1-4: Kannecta Brand & Mission */}
          <div className="lg:col-span-4 flex flex-col justify-between">
            <div>
              <Link href="/" className="inline-flex items-center gap-3.5 group mb-5">
                <motion.div
                  whileHover={{ rotate: 4, scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="relative"
                >
                  <div className="absolute inset-0 rounded-2xl bg-[var(--accent)]/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
                  <Image
                    src="/student-aid-logo.svg"
                    alt="Kannecta Student Aid logo"
                    width={48}
                    height={48}
                    className="relative h-12 w-12 rounded-2xl shadow-sm"
                  />
                </motion.div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em]" style={{ color: "var(--accent)" }}>
                    {copy.eyebrow}
                  </p>
                  <h3 className="font-display font-extrabold text-xl leading-tight" style={{ color: "var(--text-primary)" }}>
                    Student Aid BDG
                  </h3>
                </div>
              </Link>

              <p className="text-sm leading-relaxed max-w-sm" style={{ color: "var(--text-secondary)" }}>
                {copy.description}
              </p>
            </div>
          </div>

          {/* Col 5-7: Platform Links */}
          <div className="lg:col-span-2">
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] mb-5" style={{ color: "var(--text-muted)" }}>
              {language === "bn" ? "প্ল্যাটফর্ম" : "Platform"}
            </p>
            <ul className="space-y-3">
              {quickLinks.map((l) => (
                <li key={l.href + l.label}>
                  <Link
                    href={l.href}
                    className="text-sm font-medium transition-all hover:translate-x-1 flex items-center gap-2 group"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]/40 group-hover:bg-[var(--accent)] group-hover:scale-125 transition-all" />
                    <span className="group-hover:text-[var(--text-primary)] transition-colors">{l.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 8-9: Emergency & Community Services */}
          <div className="lg:col-span-3">
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] mb-5" style={{ color: "var(--text-muted)" }}>
              {language === "bn" ? "কমিউনিটি সেবা" : "Community Aid"}
            </p>
            <ul className="space-y-3">
              {communityLinks.map((l, i) => (
                <li key={i}>
                  <Link
                    href={l.href}
                    className="text-sm font-medium transition-all hover:translate-x-1 flex items-center gap-2 group"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]/40 group-hover:bg-[var(--accent)] group-hover:scale-125 transition-all" />
                    <span className="group-hover:text-[var(--text-primary)] transition-colors">{l.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 10-12: Kannecta Headquarters & Lead Contact */}
          <div className="lg:col-span-3">
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] mb-5" style={{ color: "var(--text-muted)" }}>
              {copy.builtBy}
            </p>

            {/* Lead Engineer Card */}
            <div className="card p-3.5 mb-3.5 border border-[var(--border)] hover:border-[var(--border-hover)] transition-all">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white shadow-sm flex-shrink-0"
                  style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-2))" }}
                >
                  IL
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-extrabold font-display truncate" style={{ color: "var(--text-primary)" }}>
                    Md. Inzamamul Lohani
                  </p>
                  <p className="text-[11px] truncate" style={{ color: "var(--text-muted)" }}>
                    {copy.role}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs border" style={{ borderColor: "var(--border)", background: "var(--bg-card)", color: "var(--text-secondary)" }}>
                <MapPin size={14} className="text-[var(--accent)] flex-shrink-0" />
                <span className="truncate">Dhaka, Bangladesh</span>
              </div>

              <motion.a
                href="mailto:bsse1639@iit.du.ac.bd"
                whileHover={{ x: 2 }}
                className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium transition border hover:border-[var(--border-hover)]"
                style={{ borderColor: "var(--border)", background: "var(--bg-card)", color: "var(--text-secondary)" }}
              >
                <Mail size={14} className="text-[var(--accent)] flex-shrink-0" />
                <span className="truncate">bsse1639@iit.du.ac.bd</span>
              </motion.a>

              <motion.a
                href={`tel:${toBdTel(contactPhone)}`}
                whileHover={{ x: 2 }}
                className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium transition border hover:border-[var(--border-hover)]"
                style={{ borderColor: "var(--border)", background: "var(--bg-card)", color: "var(--text-secondary)" }}
              >
                <Phone size={14} className="text-[var(--accent)] flex-shrink-0" />
                <span>{contactPhone}</span>
              </motion.a>
            </div>

            {/* Social Channels */}
            <div className="flex items-center gap-2 mt-4">
              {[
                { icon: <Github size={15} />, href: "https://github.com/hamimLohani/student-aid", label: "GitHub" },
                { icon: <Facebook size={15} />, href: "https://facebook.com", label: "Facebook" },
                { icon: <Globe size={15} />, href: "#", label: "Website" },
              ].map((s) => (
                <motion.a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ y: -2, scale: 1.05 }}
                  whileTap={{ scale: 0.94 }}
                  aria-label={s.label}
                  className="p-2.5 rounded-xl border transition hover:border-[var(--border-hover)] hover:text-[var(--text-primary)]"
                  style={{
                    borderColor: "var(--border)",
                    background: "var(--bg-card)",
                    color: "var(--text-muted)",
                  }}
                >
                  {s.icon}
                </motion.a>
              ))}
            </div>
          </div>

        </div>

        {/* Bottom Bar: Copyright & Legal Compliance */}
        <div
          className="mt-14 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs"
          style={{ borderTop: "1px solid var(--border)", color: "var(--text-muted)" }}
        >
          <div className="flex items-center gap-2">
            <ShieldCheck size={15} className="text-[var(--accent)]" />
            <p>© {new Date().getFullYear()} <span className="font-bold text-[var(--text-primary)]">Student Aid BDG</span>. {copy.copyright}</p>
          </div>

          <div className="flex items-center gap-4 text-[11px] font-medium" style={{ color: "var(--text-secondary)" }}>
            <span className="font-semibold text-[var(--accent)]">{copy.developedBy}</span>
            <span>•</span>
            <span className="hover:text-[var(--text-primary)] transition-colors cursor-pointer">{copy.privacy}</span>
            <span>•</span>
            <span className="hover:text-[var(--text-primary)] transition-colors cursor-pointer">{copy.terms}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
