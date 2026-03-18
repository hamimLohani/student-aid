"use client";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Menu, X, Sun, Moon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const links = [
  { href: "/", label: "Home" },
  { href: "/activities", label: "Activities" },
  { href: "/members", label: "Members" },
  { href: "/announcements", label: "Announcements" },
  { href: "/join", label: "Join Us" },
];

export default function Navbar() {
  const { user } = useAuth();
  const { dark, toggle } = useTheme();
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-gray-950/80 backdrop-blur border-b border-gray-200 dark:border-white/10 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-3 font-bold text-xl text-indigo-600 dark:text-indigo-400">
          <motion.div whileHover={{ rotate: 4, scale: 1.06 }} transition={{ type: "spring", stiffness: 300 }}>
            <Image
              src="/student-aid-logo.svg"
              alt="Student Aid BDG logo"
              width={44}
              height={44}
              className="h-11 w-11 rounded-xl"
              priority
            />
          </motion.div>
          Student Aid BDG
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-6">
          {links.map((l) => (
            <Link key={l.href} href={l.href}
              className="relative text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-white transition-colors duration-200 group"
            >
              {l.label}
              <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-indigo-500 rounded-full transition-all duration-300 group-hover:w-full" />
            </Link>
          ))}
          {user ? (
            <>
              <Link href="/admin" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 transition">Admin</Link>
              <motion.button whileTap={{ scale: 0.93 }} onClick={() => signOut(auth)} className="text-red-500 dark:text-red-400 hover:text-red-400 transition">Logout</motion.button>
            </>
          ) : (
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link href="/admin/login" className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-1.5 rounded-lg transition">Login</Link>
            </motion.div>
          )}
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={toggle}
            className="p-2 rounded-lg bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 transition"
          >
            {dark ? <Sun size={18} className="text-yellow-400" /> : <Moon size={18} className="text-indigo-600" />}
          </motion.button>
        </div>

        {/* Mobile */}
        <div className="md:hidden flex items-center gap-2">
          <motion.button whileTap={{ scale: 0.9 }} onClick={toggle} className="p-2 rounded-lg bg-gray-100 dark:bg-white/10 transition">
            {dark ? <Sun size={18} className="text-yellow-400" /> : <Moon size={18} className="text-indigo-600" />}
          </motion.button>
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => setOpen(!open)}>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div key={open ? "x" : "menu"} initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                {open ? <X /> : <Menu />}
              </motion.div>
            </AnimatePresence>
          </motion.button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="md:hidden overflow-hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-white/10"
          >
            <div className="px-4 py-4 flex flex-col gap-4">
              {links.map((l, i) => (
                <motion.div key={l.href} initial={{ x: -16, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.05 }}>
                  <Link href={l.href} onClick={() => setOpen(false)}
                    className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-white transition-colors"
                  >
                    {l.label}
                  </Link>
                </motion.div>
              ))}
              {user ? (
                <>
                  <Link href="/admin" onClick={() => setOpen(false)} className="text-indigo-600 dark:text-indigo-400">Admin</Link>
                  <button onClick={() => { signOut(auth); setOpen(false); }} className="text-red-500 dark:text-red-400 text-left">Logout</button>
                </>
              ) : (
                <Link href="/admin/login" onClick={() => setOpen(false)} className="text-indigo-600 dark:text-indigo-400">Login</Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
