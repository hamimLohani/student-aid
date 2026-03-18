"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Users, Megaphone, Calendar } from "lucide-react";

const fade = { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0 } };

export default function HomePage() {
  return (
    <div className="pt-16">
      {/* Hero */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-purple-500/10 pointer-events-none dark:from-indigo-900/40 dark:to-purple-900/30" />
        <motion.div
          variants={fade} initial="hidden" animate="show" transition={{ duration: 0.7 }}
          className="relative z-10 w-full max-w-3xl px-2"
        >
          <span className="inline-block bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-300 text-xs sm:text-sm px-3 sm:px-4 py-1 rounded-full mb-4 sm:mb-6 border border-indigo-200 dark:border-indigo-500/30">
            Community Platform
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold mb-4 sm:mb-6 bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 dark:from-white dark:via-indigo-200 dark:to-purple-300 bg-clip-text text-transparent leading-tight">
            Student Aid <span className="text-indigo-600 dark:text-indigo-400">BDG</span>
          </h1>
          <p className="text-secondary text-base sm:text-lg md:text-xl mb-8 sm:mb-10 max-w-xl mx-auto px-2">
            Empowering students through community, collaboration, and shared growth.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} className="w-full sm:w-auto">
              <Link href="/members" className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-semibold transition w-full" style={{ boxShadow: "0 4px 16px rgba(99,102,241,0.3)" }}>
                Explore Members <ArrowRight size={18} />
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} className="w-full sm:w-auto">
              <Link href="/announcements" className="flex items-center justify-center gap-2 border border-indigo-200 dark:border-white/20 hover:border-indigo-400 dark:hover:border-white/40 text-indigo-600 dark:text-white px-6 py-3 rounded-xl font-semibold transition w-full">
                Latest Updates
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* About */}
      <section className="py-16 sm:py-24 px-4 max-w-6xl mx-auto">
        <motion.div variants={fade} initial="hidden" whileInView="show" viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-3">About Us</h2>
          <p className="text-secondary text-center text-sm sm:text-base max-w-2xl mx-auto mb-10 sm:mb-16">
            Student Aid BDG is a student-led community dedicated to academic support, networking, and personal development.
          </p>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          {[
            { icon: <span role="img" aria-label="Target emoji">🎯</span>, title: "Mission", desc: "To provide accessible academic support and resources to every student in need." },
            { icon: <span role="img" aria-label="Telescope emoji">🔭</span>, title: "Vision", desc: "A future where every student has equal opportunity to succeed and thrive." },
            { icon: <span role="img" aria-label="Handshake emoji">🤝</span>, title: "Goals", desc: "Build a strong network, organize impactful events, and foster lifelong connections." },
          ].map((item, i) => (
            <motion.div
              key={i} variants={fade} initial="hidden" whileInView="show" viewport={{ once: true }} transition={{ delay: i * 0.15 }}
              className="card p-5 sm:p-6"
            >
              <div className="text-3xl sm:text-4xl mb-3">{item.icon}</div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2">{item.title}</h3>
              <p className="text-secondary text-sm">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Quick Links */}
      <section className="section-bg py-12 sm:py-16 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 text-center">
          {[
            { icon: <Calendar size={28} />, label: "Activities", href: "/activities" },
            { icon: <Users size={28} />, label: "Members", href: "/members" },
            { icon: <Megaphone size={28} />, label: "Announcements", href: "/announcements" },
          ].map((item, i) => (
            <motion.div key={i} whileHover={{ scale: 1.04, y: -3 }} whileTap={{ scale: 0.97 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
              <Link href={item.href} className="card flex flex-row sm:flex-col items-center gap-4 sm:gap-3 p-5 sm:p-8 hover:bg-indigo-50 dark:hover:bg-indigo-600/20 group">
                <span className="text-indigo-500 group-hover:scale-110 transition">{item.icon}</span>
                <span className="font-semibold text-base sm:text-lg">{item.label}</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Join CTA */}
      <section className="py-16 sm:py-24 px-4 text-center">
        <motion.div variants={fade} initial="hidden" whileInView="show" viewport={{ once: true }}>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">Want to Join Us?</h2>
          <p className="text-secondary mb-8 text-sm sm:text-base">Submit a join request and become part of our growing community.</p>
          <motion.div whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.95 }} className="inline-block">
            <Link href="/join" className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-xl font-semibold transition inline-block" style={{ boxShadow: "0 4px 16px rgba(99,102,241,0.3)" }}>
              Join Now
            </Link>
          </motion.div>
        </motion.div>
      </section>
    </div>
  );
}
