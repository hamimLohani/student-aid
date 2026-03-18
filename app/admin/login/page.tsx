"use client";
import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { Lock } from "lucide-react";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success("Welcome back!");
      router.push("/admin");
    } catch {
      toast.error("Invalid credentials.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="card w-full max-w-sm p-8"
      >
        <div className="flex justify-center mb-6">
          <div className="bg-indigo-100 dark:bg-indigo-600/20 p-4 rounded-2xl">
            <Lock size={28} className="text-indigo-600 dark:text-indigo-400" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-center mb-6">Admin Login</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="Email" required className="input-field"
          />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
            placeholder="Password" required className="input-field"
          />
          <button type="submit" disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50 py-3 rounded-xl font-semibold transition"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
