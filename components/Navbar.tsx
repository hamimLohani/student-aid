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
import { Menu, X, Sun, Moon, LogOut, Shield, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { navbarCopy } from "@/lib/i18n";
import GlobalSearch from "@/components/GlobalSearch";

export default function Navbar() {
  const { user } = useAuth();
  const { dark, toggle } = useTheme();
  const { language, toggleLanguage } = useLanguage();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
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

  // Cmd+K / Ctrl+K to open search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setOpen(false); }, [pathname]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const themeIcon = mounted
    ? dark
      ? <Sun size={17} className="text-yellow-400" />
      : <Moon size={17} className="text-[var(--accent)]" />
    : <span className="block h-[17px] w-[17px]" aria-hidden="true" />;

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50 px-4 pt-4 sm:pt-6 pointer-events-none flex justify-center transition-all duration-500">
        <nav
          className={`pointer-events-auto w-full max-w-6xl rounded-2xl transition-all duration-500 ${
            scrolled
              ? "py-1.5 shadow-2xl shadow-emerald-950/10"
              : "py-2 shadow-lg shadow-black/5"
          }`}
          style={{
            background: "var(--nav-bg)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            border: "1px solid var(--border)",
          }}
        >
          <div className="px-3 sm:px-4 flex items-center justify-between h-14 relative">
          {/* Logo Group */}
          <div className="flex flex-1 justify-start">
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
              <div className="absolute inset-0 rounded-xl bg-[var(--accent)]/30 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
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
                    "linear-gradient(90deg, #34744e, #4d8e64, #6fa076)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                BDG
              </span>
            </div>
            </Link>
          </div>

          {/* Desktop Nav - Centered */}
          <div className="hidden lg:flex items-center justify-center gap-1">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`nav-link px-3.5 py-1.5 rounded-xl transition-all text-sm font-medium ${
                  isActive(l.href) ? "active bg-[var(--bg-section)] text-[var(--accent)] font-semibold" : "hover:bg-[var(--bg-card-hover)]"
                }`}
              >
                {l.label}
              </Link>
            ))}
          </div>

          {/* Desktop Controls Group */}
          <div className="hidden md:flex flex-1 justify-end items-center gap-2">
            {/* Search button */}
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.94 }}
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm transition"
              style={{ borderColor: "var(--border)", background: "var(--bg-card)", color: "var(--text-muted)" }}
              aria-label="Open search"
            >
              <Search size={14} />
              <span className="text-xs hidden lg:inline" style={{ fontFamily: "'Outfit', system-ui, sans-serif" }}>Search</span>
              <kbd className="hidden lg:flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded border" style={{ borderColor: "var(--border)", background: "var(--bg-section)" }}>⌘K</kbd>
            </motion.button>
            {user ? (
              <>
                <Link
                  href="/admin"
                  className="flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg text-[var(--accent)] hover:bg-[var(--accent)]/10 transition"
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
        </nav>
      </div>

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

            {/* Floating Menu */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ type: "spring", stiffness: 350, damping: 30 }}
              className="fixed top-24 left-4 right-4 z-50 md:hidden flex flex-col rounded-[2rem] overflow-hidden"
              style={{
                background: "var(--nav-bg)",
                backdropFilter: "blur(24px)",
                WebkitBackdropFilter: "blur(24px)",
                border: "1px solid var(--border)",
                boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
              }}
            >
              {/* Menu Header */}
              <div className="flex items-center justify-between p-5 pb-2">
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
              <div className="flex flex-col gap-1 p-4 pt-2">
                <motion.div
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1, type: "spring", stiffness: 300, damping: 25 }}
                >
                  <button
                    onClick={() => {
                      setSearchOpen(true);
                      setOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition hover:bg-[var(--bg-card-hover)] text-left"
                    style={{ color: "var(--text-secondary)", fontFamily: "'Outfit', system-ui, sans-serif" }}
                  >
                    <Search size={18} />
                    Search
                  </button>
                </motion.div>
                {links.map((l, i) => (
                  <motion.div
                    key={l.href}
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: (i + 1) * 0.04 + 0.1, type: "spring", stiffness: 300, damping: 25 }}
                  >
                    <Link
                      href={l.href}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition ${
                        isActive(l.href)
                          ? "text-[var(--accent)] bg-[var(--accent)]/10 font-semibold"
                          : "hover:bg-[var(--bg-card-hover)]"
                      }`}
                      style={{ color: isActive(l.href) ? undefined : "var(--text-secondary)", fontFamily: "'Outfit', system-ui, sans-serif" }}
                    >
                      {isActive(l.href) && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] flex-shrink-0" />
                      )}
                      {l.label}
                    </Link>
                  </motion.div>
                ))}
              </div>

              {/* Auth actions */}
              <div className="p-4 pt-2">
                {user ? (
                  <div className="flex flex-col gap-2">
                    <Link
                      href="/admin"
                      className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-[var(--accent)] bg-[var(--accent)]/10"
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
      {/* GlobalSearch Modal */}
      <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
