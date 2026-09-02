"use client";
import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import Link from "next/link";
import {
  ArrowRight,
  Users,
  Megaphone,
  Calendar,
  Sparkles,
  Zap,
  Heart,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { homeCopy } from "@/lib/i18n";

/* ── Animation variants ── */
const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  show: { opacity: 1, y: 0 },
};
const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.13 } },
};

/* ── Animated Counter ── */
function Counter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = Math.ceil(target / 50);
    const timer = setInterval(() => {
      start = Math.min(start + step, target);
      setVal(start);
      if (start >= target) clearInterval(timer);
    }, 28);
    return () => clearInterval(timer);
  }, [inView, target]);

  return (
    <span ref={ref}>
      {val}
      {suffix}
    </span>
  );
}

export default function HomePage() {
  const { language } = useLanguage();
  const copy = homeCopy[language];

  const aboutCards = [
    {
      icon: "🎯",
      gradient: "from-indigo-500 to-purple-600",
      glow: "rgba(99,102,241,0.25)",
      title: copy.missionTitle,
      desc: copy.missionDescription,
    },
    {
      icon: "🔭",
      gradient: "from-purple-500 to-pink-600",
      glow: "rgba(168,85,247,0.25)",
      title: copy.visionTitle,
      desc: copy.visionDescription,
    },
    {
      icon: "🤝",
      gradient: "from-cyan-500 to-blue-600",
      glow: "rgba(6,182,212,0.25)",
      title: copy.goalsTitle,
      desc: copy.goalsDescription,
    },
  ];

  const stats = [
    { value: 120, suffix: "+", label: "Active Members", icon: <Users size={22} /> },
    { value: 40, suffix: "+", label: "Activities Held", icon: <Calendar size={22} /> },
    { value: 5, suffix: "+", label: "Years Active", icon: <Zap size={22} /> },
    { value: 100, suffix: "%", label: "Community Driven", icon: <Heart size={22} /> },
  ];

  const quickLinks = [
    {
      icon: <Calendar size={32} />,
      label: copy.activities,
      href: "/activities",
      gradient: "from-indigo-600 to-violet-600",
      desc: "Events & programs",
    },
    {
      icon: <Users size={32} />,
      label: copy.members,
      href: "/members",
      gradient: "from-violet-600 to-purple-700",
      desc: "Our community",
    },
    {
      icon: <Megaphone size={32} />,
      label: copy.announcements,
      href: "/announcements",
      gradient: "from-cyan-500 to-blue-600",
      desc: "Latest updates",
    },
  ];

  return (
    <div className="pt-16 overflow-hidden">
      {/* ═══════════════════════════════════════
          HERO SECTION
      ═══════════════════════════════════════ */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-4">
        {/* Floating orbs */}
        <div
          className="orb orb-1 absolute -top-20 -left-32 w-[520px] h-[520px] opacity-60"
          aria-hidden="true"
        />
        <div
          className="orb orb-2 absolute top-1/3 -right-40 w-[440px] h-[440px] opacity-50"
          aria-hidden="true"
        />
        <div
          className="orb orb-3 absolute -bottom-10 left-1/4 w-[360px] h-[360px] opacity-40"
          aria-hidden="true"
        />

        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="relative z-10 w-full max-w-4xl mx-auto"
        >
          {/* Badge */}
          <motion.div variants={fadeUp} className="mb-6">
            <span className="badge">
              <Sparkles size={12} />
              {copy.badge}
            </span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            variants={fadeUp}
            className="font-display text-5xl sm:text-6xl md:text-8xl font-extrabold mb-6 leading-[1.1] tracking-tight"
          >
            <span
              className={
                language === "bn"
                  ? "gradient-text leading-[1.24] pb-3 block"
                  : "gradient-text leading-tight block"
              }
            >
              {copy.heroTitle}
            </span>
            <span
              className="inline-block mt-1"
              style={{
                background: "linear-gradient(135deg, #06b6d4, #6366f1)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              BDG
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={fadeUp}
            className="text-base sm:text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed px-2"
            style={{ color: "var(--text-secondary)" }}
          >
            {copy.heroDescription}
          </motion.p>

          {/* CTAs */}
          <motion.div
            variants={fadeUp}
            className="flex flex-col sm:flex-row gap-4 justify-center px-4"
          >
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
              <Link
                href="/members"
                className="btn-primary flex items-center gap-2"
              >
                {copy.exploreMembers}
                <ArrowRight size={18} />
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
              <Link href="/join" className="btn-ghost flex items-center gap-2">
                {copy.joinRequest}
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          style={{ color: "var(--text-muted)" }}
        >
          <span className="text-xs font-medium tracking-widest uppercase">
            Scroll
          </span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            className="w-0.5 h-6 rounded-full"
            style={{ background: "linear-gradient(to bottom, #6366f1, transparent)" }}
          />
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════
          STATS SECTION
      ═══════════════════════════════════════ */}
      <section className="py-16 px-4 relative">
        <div className="max-w-5xl mx-auto">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
          >
            {stats.map((s, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                className="stat-card"
              >
                <div
                  className="w-12 h-12 rounded-2xl mx-auto mb-4 flex items-center justify-center text-white"
                  style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
                >
                  {s.icon}
                </div>
                <div
                  className="font-display text-3xl sm:text-4xl font-extrabold mb-1"
                  style={{
                    background: "linear-gradient(135deg, #6366f1, #06b6d4)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  <Counter target={s.value} suffix={s.suffix} />
                </div>
                <p className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>
                  {s.label}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          ABOUT SECTION
      ═══════════════════════════════════════ */}
      <section className="section-bg py-20 sm:py-28 px-4 relative">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 70% 50% at 50% 50%, rgba(99,102,241,0.05) 0%, transparent 70%)",
          }}
          aria-hidden="true"
        />
        <div className="max-w-6xl mx-auto relative">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <motion.div variants={fadeUp}>
              <span className="badge mb-4">
                <Sparkles size={12} />
                About Us
              </span>
            </motion.div>
            <motion.h2
              variants={fadeUp}
              className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mb-4"
              style={{ color: "var(--text-primary)" }}
            >
              {copy.aboutTitle}
            </motion.h2>
            <motion.p
              variants={fadeUp}
              className="text-base sm:text-lg max-w-2xl mx-auto"
              style={{ color: "var(--text-secondary)" }}
            >
              {copy.aboutDescription}
            </motion.p>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-7"
          >
            {aboutCards.map((item, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                whileHover={{ y: -6 }}
                transition={{ type: "spring", stiffness: 280, damping: 22 }}
                className="card-premium p-7"
              >
                {/* Icon */}
                <div
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center text-2xl mb-5`}
                  style={{ boxShadow: `0 8px 24px ${item.glow}` }}
                >
                  {item.icon}
                </div>
                <h3
                  className="font-display text-xl font-bold mb-3"
                  style={{ color: "var(--text-primary)" }}
                >
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          QUICK LINKS SECTION
      ═══════════════════════════════════════ */}
      <section className="py-20 sm:py-28 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <motion.h2
              variants={fadeUp}
              className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mb-4"
              style={{ color: "var(--text-primary)" }}
            >
              Explore
            </motion.h2>
            <motion.p
              variants={fadeUp}
              className="text-base sm:text-lg"
              style={{ color: "var(--text-secondary)" }}
            >
              Everything the community has to offer
            </motion.p>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-7"
          >
            {quickLinks.map((item, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                whileHover={{ y: -6, scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 300, damping: 22 }}
              >
                <Link
                  href={item.href}
                  className="card group flex flex-col items-center text-center p-8 sm:p-10 relative overflow-hidden"
                >
                  {/* Gradient bg blur on hover */}
                  <div
                    className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 bg-gradient-to-br ${item.gradient}`}
                  />

                  <div
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center text-white mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}
                  >
                    {item.icon}
                  </div>

                  <span
                    className="font-display text-lg font-bold mb-1 group-hover:text-indigo-500 transition-colors"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {item.label}
                  </span>
                  <span className="text-sm" style={{ color: "var(--text-muted)" }}>
                    {item.desc}
                  </span>

                  <motion.div
                    className="mt-4 flex items-center gap-1 text-indigo-500 text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity"
                    animate={{ x: [0, 4, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  >
                    Explore <ArrowRight size={14} />
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          JOIN CTA SECTION
      ═══════════════════════════════════════ */}
      <section className="py-20 sm:py-28 px-4 relative overflow-hidden">
        {/* Background gradient */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(139,92,246,0.06) 50%, rgba(6,182,212,0.06) 100%)",
          }}
          aria-hidden="true"
        />
        <div className="orb orb-2 absolute -right-20 top-0 w-80 h-80 opacity-30" aria-hidden="true" />
        <div className="orb orb-1 absolute -left-20 bottom-0 w-64 h-64 opacity-25" aria-hidden="true" />

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center relative z-10"
        >
          <motion.div variants={fadeUp}>
            <span className="badge mb-6">
              <Heart size={12} />
              {copy.joinTitle}
            </span>
          </motion.div>
          <motion.h2
            variants={fadeUp}
            className="font-display text-4xl sm:text-5xl md:text-6xl font-extrabold mb-6 leading-tight"
            style={{ color: "var(--text-primary)" }}
          >
            {copy.joinTitle}
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="text-base sm:text-lg mb-10 max-w-xl mx-auto"
            style={{ color: "var(--text-secondary)" }}
          >
            {copy.joinDescription}
          </motion.p>
          <motion.div variants={fadeUp} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              href="/join"
              className="btn-primary text-lg !py-4 !px-8"
            >
              {copy.joinNow}
              <ArrowRight size={20} />
            </Link>
          </motion.div>
        </motion.div>
      </section>
    </div>
  );
}
