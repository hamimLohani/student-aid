import Link from "next/link";
import Image from "next/image";
import { Mail, Phone, ArrowUpRight } from "lucide-react";

const footerButtonBase =
  "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition";

const footerGhostButton = `${footerButtonBase} border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-primary)] hover:border-indigo-400 hover:bg-[var(--bg-card-hover)]`;

export default function Footer() {
  return (
    <footer className="relative mt-16 border-t border-[var(--border)] bg-[var(--bg)]">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
      <div className="max-w-6xl mx-auto px-4 py-10 sm:py-14">
        <div className="card relative overflow-hidden p-6 sm:p-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.14),transparent_38%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.12),transparent_32%)] pointer-events-none" />

          <div className="relative grid gap-8 md:grid-cols-[1.4fr_1fr]">
            <div>
              <div className="flex items-center gap-3">
                <Image
                  src="/student-aid-logo.svg"
                  alt="Student Aid BDG logo"
                  width={48}
                  height={48}
                  className="h-12 w-12 rounded-2xl shadow-[0_10px_30px_rgba(99,102,241,0.18)]"
                />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-indigo-500">
                    Student Community
                  </p>
                  <h3 className="text-xl font-bold">Student Aid BDG</h3>
                </div>
              </div>

              <p className="mt-4 max-w-md text-sm leading-6 text-secondary">
                Empowering students through community, collaboration, and shared growth. Built for connection, support, and practical opportunities.
              </p>

              <div className="mt-5 flex flex-wrap gap-3">
                <Link href="/join" className={`${footerButtonBase} bg-indigo-600 text-white hover:bg-indigo-500`}>
                  Become a Member <ArrowUpRight size={16} />
                </Link>
                <Link href="/announcements" className={footerGhostButton}>
                  Latest Updates
                </Link>
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted">
                Built By
              </p>
              <div className="mt-3 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] px-4 py-3">
                <p className="text-sm font-semibold text-[var(--text-primary)]">
                  Md. Inzamamul Lohani
                </p>
                <p className="mt-1 text-sm text-secondary">
                  Software Engineering, University of Dhaka
                </p>
              </div>
              <div className="mt-4 space-y-3">
                <a
                  href="mailto:hamimlohani@gmail.com"
                  className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] px-4 py-3 text-sm transition hover:border-indigo-400 hover:bg-[var(--bg-card-hover)]"
                >
                  <Mail size={16} className="text-indigo-500" />
                  <span className="truncate">hamimlohani@gmail.com</span>
                </a>
                <a
                  href="tel:+8801572906733"
                  className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] px-4 py-3 text-sm transition hover:border-indigo-400 hover:bg-[var(--bg-card-hover)]"
                >
                  <Phone size={16} className="text-indigo-500" />
                  <span>+880 1572-906733</span>
                </a>
              </div>
            </div>
          </div>

          <div className="relative mt-8 flex flex-col gap-2 border-t border-[var(--border)] pt-5 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
            <p>© {new Date().getFullYear()} Student Aid BDG. All rights reserved.</p>
            <p>Designed for students who want a stronger network.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
