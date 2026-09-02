"use client";

import Link from "next/link";
import Image from "next/image";
import { Mail, Phone, ArrowUpRight, Github, Facebook } from "lucide-react";
import { formatBdPhone, toBdTel } from "@/lib/phone";
import { useLanguage } from "@/context/LanguageContext";
import { footerCopy } from "@/lib/i18n";
import { motion } from "framer-motion";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/activities", label: "Activities" },
  { href: "/members", label: "Members" },
  { href: "/announcements", label: "Announcements" },
  { href: "/join", label: "Join Us" },
];

export default function Footer() {
  const contactPhone = formatBdPhone("01572906733");
  const { language } = useLanguage();
  const copy = footerCopy[language];

  return (
    <footer className="relative mt-20 overflow-hidden" style={{ borderTop: "1px solid var(--border)" }}>
      {/* Top glow line */}
      <div className="glow-line" />

      {/* Mesh gradient background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 10% 120%, rgba(99,102,241,0.08) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 90% 110%, rgba(6,182,212,0.06) 0%, transparent 55%)",
        }}
      />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-14">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

          {/* Brand Column */}
          <div className="lg:col-span-1">
            <Link href="/" className="inline-flex items-center gap-3 group mb-5">
              <motion.div
                whileHover={{ rotate: 5, scale: 1.06 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="relative"
              >
                <div className="absolute inset-0 rounded-2xl bg-indigo-500/20 blur-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                <Image
                  src="/student-aid-logo.svg"
                  alt="Student Aid BDG logo"
                  width={48}
                  height={48}
                  className="relative h-12 w-12 rounded-2xl"
                />
              </motion.div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-indigo-500 mb-0.5">
                  {copy.eyebrow}
                </p>
                <h3 className="font-display font-bold text-lg leading-tight" style={{ color: "var(--text-primary)" }}>
                  Student Aid BDG
                </h3>
              </div>
            </Link>

            <p className="text-sm leading-relaxed max-w-xs mb-6" style={{ color: "var(--text-secondary)" }}>
              {copy.description}
            </p>

            <div className="flex gap-3">
              <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.95 }}>
                <Link
                  href="/join"
                  className="btn-primary !py-2.5 !px-5 !text-sm"
                >
                  {copy.cta} <ArrowUpRight size={15} />
                </Link>
              </motion.div>
              <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.95 }}>
                <Link
                  href="/announcements"
                  className="btn-ghost !py-2.5 !px-5 !text-sm"
                >
                  {copy.updates}
                </Link>
              </motion.div>
            </div>
          </div>

          {/* Navigation Column */}
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] mb-5" style={{ color: "var(--text-muted)" }}>
              Navigation
            </p>
            <ul className="space-y-3">
              {navLinks.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm font-medium transition-colors hover:text-indigo-500 flex items-center gap-2 group"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    <span className="w-0 h-px bg-indigo-500 transition-all duration-300 group-hover:w-3" />
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Column */}
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] mb-5" style={{ color: "var(--text-muted)" }}>
              {copy.builtBy}
            </p>

            <div className="card p-4 mb-4">
              <div className="flex items-center gap-3 mb-2">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                  style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
                >
                  I
                </div>
                <div>
                  <p className="text-sm font-semibold font-display" style={{ color: "var(--text-primary)" }}>
                    Md. Inzamamul Lohani
                  </p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    {copy.role}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <motion.a
                href="mailto:hamimlohani@gmail.com"
                whileHover={{ x: 3 }}
                className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm transition border"
                style={{
                  borderColor: "var(--border)",
                  background: "var(--bg-card)",
                  color: "var(--text-secondary)",
                }}
              >
                <Mail size={15} className="text-indigo-500 flex-shrink-0" />
                <span className="truncate">hamimlohani@gmail.com</span>
              </motion.a>
              <motion.a
                href={`tel:${toBdTel(contactPhone)}`}
                whileHover={{ x: 3 }}
                className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm transition border"
                style={{
                  borderColor: "var(--border)",
                  background: "var(--bg-card)",
                  color: "var(--text-secondary)",
                }}
              >
                <Phone size={15} className="text-indigo-500 flex-shrink-0" />
                <span>{contactPhone}</span>
              </motion.a>
            </div>

            {/* Social */}
            <div className="flex gap-2 mt-4">
              {[
                { icon: <Github size={16} />, href: "https://github.com", label: "GitHub" },
                { icon: <Facebook size={16} />, href: "https://facebook.com", label: "Facebook" },
              ].map((s) => (
                <motion.a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ y: -2, scale: 1.08 }}
                  whileTap={{ scale: 0.93 }}
                  aria-label={s.label}
                  className="p-2.5 rounded-xl border transition"
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

        {/* Bottom bar */}
        <div
          className="mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs"
          style={{ borderTop: "1px solid var(--border)", color: "var(--text-muted)" }}
        >
          <p>© {new Date().getFullYear()} Student Aid BDG. {copy.copyright}</p>
          <p className="text-indigo-400/70">{copy.tagline}</p>
        </div>
      </div>
    </footer>
  );
}
