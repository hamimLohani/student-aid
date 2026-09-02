"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useLanguage } from "@/context/LanguageContext";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Menu, X, Sun, Moon, LogOut, Shield } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { navbarCopy } from "@/lib/i18n";

export default function Navbar() {
  const { user } = useAuth();
  const { dark, toggle } = useTheme();
  const { language, toggleLanguage } = useLanguage();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const copy = navbarCopy[language];

  const links = [
    { href: "/", label: copy.home },
    { href: "/activities", label: copy.activities },
    { href: "/members", label: copy.members },
    { href: "/announcements", label: copy.announcements },
    { href: "/join", label: copy.join },
  ];

  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setOpen(false); }, [pathname]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const themeIcon = mounted
    ? dark
      ? <Sun size={17} className="text-yellow-400" />
      : <Moon size={17} className="text-indigo-500" />
    : <span className="block h-[17px] w-[17px]" aria-hidden="true" />;

  return (
    <>
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-500 ${
          scrolled
            ? "py-0 shadow-lg shadow-[rgba(99,102,241,0.08)]"
            : "py-1"
        }`}
        style={{
          background: "var(--nav-bg)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: scrolled
            ? "1px solid var(--border)"
            : "1px solid transparent",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-3 group"
            aria-label="Student Aid BDG Home"
          >
            <motion.div
              whileHover={{ rotate: 6, scale: 1.08 }}
              transition={{ type: "spring", stiffness: 350, damping: 20 }}
              className="relative"
            >
              <div className="absolute inset-0 rounded-xl bg-indigo-500/30 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <Image
                src="/student-aid-logo.svg"
                alt="Student Aid BDG logo"
                width={42}
                height={42}
                className="relative h-10 w-10 rounded-xl"
                priority
              />
            </motion.div>
            <div className="flex flex-col leading-none">
              <span
                className="font-display font-bold text-base tracking-tight"
                style={{ color: "var(--text-primary)" }}
              >
                Student Aid
              </span>
              <span
                className="font-display font-bold text-xs tracking-widest uppercase"
                style={{
                  background:
                    "linear-gradient(90deg, #6366f1, #8b5cf6, #06b6d4)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                BDG
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`nav-link px-3.5 py-2 rounded-lg transition-colors text-sm ${
                  isActive(l.href) ? "active" : ""
                }`}
              >
                {l.label}
              </Link>
            ))}
          </div>

          {/* Desktop Controls */}
          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <>
                <Link
                  href="/admin"
                  className="flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg text-indigo-500 hover:bg-indigo-500/10 transition"
                >
                  <Shield size={14} />
                  {copy.admin}
                </Link>
                <motion.button
                  whileTap={{ scale: 0.93 }}
                  onClick={() => signOut(auth)}
                  className="flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg text-red-400 hover:bg-red-500/10 transition"
                >
                  <LogOut size={14} />
                  {copy.logout}
                </motion.button>
              </>
            ) : (
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Link
                  href="/admin/login"
                  className="btn-primary !py-2 !px-4 !text-sm"
                >
                  {copy.login}
                </Link>
              </motion.div>
            )}

            {/* Language toggle */}
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.94 }}
              onClick={toggleLanguage}
              className="px-3 py-1.5 text-xs font-bold rounded-lg border transition"
              style={{
                borderColor: "var(--border)",
                background: "var(--bg-card)",
                color: "var(--text-secondary)",
                fontFamily: "'Outfit', system-ui, sans-serif",
                letterSpacing: "0.05em",
              }}
            >
              {copy.language}
            </motion.button>

            {/* Theme toggle */}
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggle}
              className="p-2 rounded-lg border transition"
              style={{
                borderColor: "var(--border)",
                background: "var(--bg-card)",
              }}
              aria-label="Toggle theme"
            >
              {themeIcon}
            </motion.button>
          </div>

          {/* Mobile Controls */}
          <div className="md:hidden flex items-center gap-2">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={toggleLanguage}
              className="px-2.5 py-1.5 text-xs font-bold rounded-lg border transition"
              style={{
                borderColor: "var(--border)",
                background: "var(--bg-card)",
                color: "var(--text-secondary)",
              }}
            >
              {copy.language}
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={toggle}
              className="p-2 rounded-lg border transition"
              style={{ borderColor: "var(--border)", background: "var(--bg-card)" }}
              aria-label="Toggle theme"
            >
              {themeIcon}
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setOpen(!open)}
              className="p-2 rounded-lg border transition"
              style={{ borderColor: "var(--border)", background: "var(--bg-card)", color: "var(--text-primary)" }}
              aria-label="Toggle menu"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={open ? "x" : "menu"}
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  {open ? <X size={20} /> : <Menu size={20} />}
                </motion.div>
              </AnimatePresence>
            </motion.button>
          </div>
        </div>

        {/* Glow bottom line — visible when scrolled */}
        <AnimatePresence>
          {scrolled && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="glow-line"
            />
          )}
        </AnimatePresence>
      </nav>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
              onClick={() => setOpen(false)}
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-0 right-0 bottom-0 z-50 w-72 md:hidden flex flex-col"
              style={{
                background: "var(--bg-card)",
                backdropFilter: "blur(24px)",
                WebkitBackdropFilter: "blur(24px)",
                borderLeft: "1px solid var(--border)",
                boxShadow: "-8px 0 40px rgba(99,102,241,0.15)",
              }}
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: "var(--border)" }}>
                <span className="font-display font-bold text-base" style={{ color: "var(--text-primary)" }}>
                  Menu
                </span>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setOpen(false)}
                  className="p-1.5 rounded-lg"
                  style={{ color: "var(--text-muted)" }}
                >
                  <X size={18} />
                </motion.button>
              </div>

              {/* Nav Links */}
              <div className="flex flex-col gap-1 p-4 flex-1">
                {links.map((l, i) => (
                  <motion.div
                    key={l.href}
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: i * 0.06, type: "spring", stiffness: 300, damping: 25 }}
                  >
                    <Link
                      href={l.href}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition ${
                        isActive(l.href)
                          ? "text-indigo-500 bg-indigo-500/10"
                          : "hover:bg-[var(--bg-card-hover)]"
                      }`}
                      style={{ color: isActive(l.href) ? undefined : "var(--text-secondary)", fontFamily: "'Outfit', system-ui, sans-serif" }}
                    >
                      {isActive(l.href) && (
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0" />
                      )}
                      {l.label}
                    </Link>
                  </motion.div>
                ))}
              </div>

              {/* Auth actions */}
              <div className="p-4 border-t" style={{ borderColor: "var(--border)" }}>
                {user ? (
                  <div className="flex flex-col gap-2">
                    <Link
                      href="/admin"
                      className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-indigo-500 bg-indigo-500/10"
                    >
                      <Shield size={14} /> {copy.admin}
                    </Link>
                    <button
                      onClick={() => { signOut(auth); setOpen(false); }}
                      className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition text-left"
                    >
                      <LogOut size={14} /> {copy.logout}
                    </button>
                  </div>
                ) : (
                  <Link
                    href="/admin/login"
                    className="btn-primary w-full justify-center !text-sm"
                  >
                    {copy.login}
                  </Link>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
