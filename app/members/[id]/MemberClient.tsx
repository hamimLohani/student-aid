"use client";
import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toBdTel } from "@/lib/phone";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import { MapPin, Briefcase, GraduationCap, ArrowLeft, Building2, Droplets, Phone, Mail } from "lucide-react";
import Link from "next/link";

interface Member {
  name: string; sscYear: string; memberType?: string; work: string; workplace: string;
  bloodGroup: string; address: string; phone?: string; email?: string; image?: string;
}

export default function MemberProfileClient() {
  const { id } = useParams<{ id: string }>();
  const [member, setMember] = useState<Member | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "not-found">("loading");

  useEffect(() => {
    return onSnapshot(doc(db, "members", id), (d) => {
      if (d.exists()) {
        setMember(d.data() as Member);
        setStatus("ready");
        return;
      }
      setMember(null);
      setStatus("not-found");
    });
  }, [id]);

  if (status === "loading") return <div className="pt-32 text-center text-muted">Loading...</div>;

  if (status === "not-found") {
    return (
      <div className="pt-20 sm:pt-24 pb-16 px-4 max-w-2xl mx-auto">
        <Link href="/members" className="flex items-center gap-2 text-secondary hover:text-indigo-600 mb-6 transition text-sm">
          <ArrowLeft size={16} /> Back to Members
        </Link>
        <div className="card p-6 sm:p-8 text-center">
          <h1 className="text-2xl font-bold">Member not found</h1>
          <p className="text-secondary text-sm mt-2">This member profile is unavailable or has been removed.</p>
        </div>
      </div>
    );
  }

  const details = [
    { icon: <Briefcase size={18} className="text-indigo-500" />, label: "Type Of Member", value: member.memberType ? member.memberType[0].toUpperCase() + member.memberType.slice(1) : "" },
    { icon: <GraduationCap size={18} className="text-indigo-500" />, label: "SSC Year", value: member.sscYear },
    { icon: <Briefcase size={18} className="text-indigo-500" />, label: "Occupation", value: member.work },
    { icon: <Building2 size={18} className="text-indigo-500" />, label: "Workplace", value: member.workplace },
    { icon: <Droplets size={18} className="text-red-500" />, label: "Blood Group", value: member.bloodGroup },
    { icon: <MapPin size={18} className="text-indigo-500" />, label: "Present Address", value: member.address },
    { icon: <Phone size={18} className="text-green-500" />, label: "Phone", value: member.phone },
    { icon: <Mail size={18} className="text-blue-500" />, label: "Email", value: member.email },
  ];

  return (
    <div className="pt-20 sm:pt-24 pb-16 px-4 max-w-2xl mx-auto">
      <Link href="/members" className="flex items-center gap-2 text-secondary hover:text-indigo-600 mb-6 transition text-sm">
        <ArrowLeft size={16} /> Back to Members
      </Link>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card p-6 sm:p-8">
        <div className="flex flex-col items-center mb-6">
          <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden bg-indigo-100 dark:bg-indigo-600/30 flex items-center justify-center text-4xl sm:text-5xl font-bold text-indigo-600 dark:text-indigo-300 ring-4 ring-indigo-200 dark:ring-indigo-500/20 mb-4">
            {member.image ? <Image src={member.image} alt={member.name} fill sizes="128px" className="object-cover" /> : member.name[0]}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-center">{member.name}</h1>
          {member.bloodGroup && (
            <span className="mt-2 text-sm bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 px-3 py-1 rounded-full">
              🩸 {member.bloodGroup}
            </span>
          )}
        </div>
        <div className="space-y-2">
          {details.map(({ icon, label, value }, i) =>
            value ? (
              <motion.div
                key={label}
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                className="flex items-center gap-3 bg-[var(--bg-section)] rounded-xl px-4 py-3"
              >
                <span className="flex-shrink-0">{icon}</span>
                <div className="min-w-0">
                  <p className="text-muted text-xs">{label}</p>
                  {label === "Phone" ? (
                    <a href={`tel:${toBdTel(value)}`} className="text-green-600 dark:text-green-400 hover:underline text-sm font-medium">{value}</a>
                  ) : label === "Email" ? (
                    <a href={`mailto:${value}`} className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium truncate block">{value}</a>
                  ) : (
                    <p className="text-sm font-medium truncate">{value}</p>
                  )}
                </div>
              </motion.div>
            ) : null
          )}
        </div>
      </motion.div>
    </div>
  );
}
