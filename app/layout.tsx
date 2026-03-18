import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import Navbar from "@/components/Navbar";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Student Aid (BDG)",
  description: "Community Platform for Student Aid BDG",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen transition-colors duration-300`}>
        <ThemeProvider>
          <AuthProvider>
            <Navbar />
            <main>{children}</main>
            <Toaster position="top-right" toastOptions={{ style: { background: "var(--bg-card)", color: "var(--text-primary)", border: "1px solid var(--border)" } }} />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
