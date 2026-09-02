import type { Metadata, Viewport } from "next";
import { Outfit, Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { LanguageProvider } from "@/context/LanguageContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Toaster } from "react-hot-toast";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Student Aid (BDG) — Community Platform",
  description:
    "Student Aid BDG is a community platform for students — connecting members, sharing activities, and empowering each other through collaboration and support.",
  keywords: ["Student Aid", "BDG", "community", "students", "Bangladesh"],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Student Aid",
  },
  openGraph: {
    title: "Student Aid (BDG) — Community Platform",
    description:
      "A premium community platform for Student Aid BDG members. Activities, announcements, member directory and more.",
    type: "website",
    siteName: "Student Aid BDG",
  },
  twitter: {
    card: "summary_large_image",
    title: "Student Aid (BDG) — Community Platform",
    description: "A premium community platform for Student Aid BDG members.",
  },
};

export const viewport: Viewport = {
  themeColor: "#6366f1",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="bn"
      suppressHydrationWarning
      className={`${outfit.variable} ${inter.variable}`}
    >
      <body className="min-h-screen flex flex-col transition-colors duration-300">
        <ThemeProvider>
          <LanguageProvider>
            <AuthProvider>
              {/* Subtle background grid overlay */}
              <div className="fixed inset-0 bg-grid opacity-40 pointer-events-none z-0" />

              <Navbar />
              <main className="flex-1 relative z-10">{children}</main>
              <Footer />

              <Toaster
                position="top-right"
                toastOptions={{
                  style: {
                    background: "var(--bg-card)",
                    color: "var(--text-primary)",
                    border: "1px solid var(--border)",
                    borderRadius: "0.875rem",
                    backdropFilter: "blur(16px)",
                    fontFamily: "'Inter', system-ui, sans-serif",
                    fontSize: "0.875rem",
                    boxShadow:
                      "0 8px 32px rgba(99,102,241,0.15), 0 2px 8px rgba(0,0,0,0.1)",
                  },
                  success: {
                    iconTheme: { primary: "#22c55e", secondary: "white" },
                  },
                  error: {
                    iconTheme: { primary: "#ef4444", secondary: "white" },
                  },
                }}
              />
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
