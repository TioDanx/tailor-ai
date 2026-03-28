"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { useUserProfile } from "@/contexts/UserProfileContext";
import { useUserQuota } from "@/hooks/useUserQuota";
import { useCVHistory } from "@/hooks/useCVHistory";
import { ATSRing } from "@/components/ui/ATSRing";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.25, 0.1, 0.25, 1], delay: i * 0.08 },
  }),
};

const TIPS = [
  {
    icon: "description",
    title: "One page, maximum impact",
    body: "Recruiters spend an average of 7 seconds on a CV. Keep it to one page and lead with your strongest achievements.",
  },
  {
    icon: "trending_up",
    title: "Quantify everything you can",
    body: '"Increased sales by 30%" beats "responsible for sales". Numbers make achievements concrete and credible.',
  },
  {
    icon: "manage_accounts",
    title: "Optimize your LinkedIn headline",
    body: 'Your headline is searchable. Use keywords from the roles you want, not just your current title. Ex: "Full Stack Engineer · React · Node.js".',
  },
  {
    icon: "visibility",
    title: "Turn on Open to Work (privately)",
    body: "Set it to visible only to recruiters — not your network. LinkedIn shows your profile 2x more to headhunters when this is active.",
  },
  {
    icon: "psychology",
    title: "Tailor keywords to each job",
    body: "ATS systems filter by exact keyword match. Use Tailor AI on every application to mirror the job description's language.",
  },
];

const tipSlide: Variants = {
  enter: { opacity: 0, x: 32 },
  center: { opacity: 1, x: 0, transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] } },
  exit:  { opacity: 0, x: -32, transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] } },
};

const COMPLETION_STEPS = [
  { key: "name",        label: "Name" },
  { key: "shortDescription", label: "Summary" },
  { key: "hardSkills",  label: "Skills" },
  { key: "experience",  label: "Experience" },
  { key: "education",   label: "Education" },
] as const;

export default function DashboardPage() {
  const router   = useRouter();
  const { profile }       = useUserProfile();
  const { credits, max }  = useUserQuota();
  const { entries, loading: historyLoading } = useCVHistory(3);

  const [jd, setJd] = useState("");
  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % TIPS.length);
    }, 6000);
    return () => clearInterval(id);
  }, []);

  // Profile completion
  const completedSteps = COMPLETION_STEPS.filter(({ key }) => {
    const val = profile?.[key as keyof typeof profile];
    if (Array.isArray(val)) return val.length > 0;
    return !!val;
  });
  const completionPct = Math.round((completedSteps.length / COMPLETION_STEPS.length) * 100);

  function handleQuickTailor() {
    if (jd.trim()) {
      sessionStorage.setItem("quickJD", jd);
    }
    router.push("/generate");
  }

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <header className="p-4 sm:p-8 md:p-12 max-w-7xl mx-auto w-full">
        <motion.div
          className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 md:mb-12"
          initial="hidden"
          animate="show"
          variants={fadeUp}
        >
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Welcome back, {profile?.name?.split(" ")[0] || "there"}.
            </h2>
            <p className="text-on-surface-variant font-body max-w-md opacity-80">
              Your professional identity is currently{" "}
              <span className="text-primary font-bold">{completionPct}%</span> optimized.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative w-12 h-12 rounded-full bg-surface-container-high border border-outline-variant/20 flex items-center justify-center overflow-hidden">
              {profile?.photoURL ? (
                <Image
                  src={profile.photoURL}
                  alt="Avatar"
                  fill
                  className="object-cover"
                />
              ) : (
                <span className="text-on-surface-variant font-bold">
                  {profile?.name?.[0]?.toUpperCase() ?? "?"}
                </span>
              )}
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left column */}
          <div className="lg:col-span-8 space-y-8">
            {/* Profile Completion / Tips */}
            {completionPct < 100 ? (
              <motion.section
                className="bg-surface-container-low rounded-2xl p-4 sm:p-8 border border-outline-variant/10 shadow-sm"
                custom={1}
                initial="hidden"
                animate="show"
                variants={fadeUp}
              >
                <div className="flex items-center justify-between mb-6 sm:mb-8">
                  <div>
                    <h3 className="font-headline font-bold text-lg sm:text-xl text-white">
                      Complete your profile
                    </h3>
                    <p className="text-sm text-on-surface-variant/70 font-label uppercase tracking-widest mt-1">
                      Status:{" "}
                      {completionPct >= 60 ? "Improving" : "Getting started"}
                    </p>
                  </div>
                  <span className="text-3xl font-black text-primary italic">
                    {completionPct}%
                  </span>
                </div>

                <div className="relative h-2 w-full bg-surface-container rounded-full overflow-hidden mb-6 sm:mb-8">
                  <div
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary to-tertiary shadow-[0_0_15px_rgba(192,193,255,0.4)] transition-all duration-500"
                    style={{ width: `${completionPct}%` }}
                  />
                </div>

                <div className="grid grid-cols-5 gap-2 sm:gap-4">
                  {COMPLETION_STEPS.map(({ key, label }) => {
                    const done = completedSteps.some((s) => s.key === key);
                    return (
                      <div
                        key={key}
                        className={`flex flex-col items-center gap-2 ${done ? "" : "opacity-40"}`}
                      >
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center border ${
                            done
                              ? "bg-primary/20 border-primary/30"
                              : "bg-surface-container-high border-outline-variant/20"
                          }`}
                        >
                          <span
                            className={`material-symbols-outlined text-sm ${
                              done ? "text-primary" : "text-on-surface-variant"
                            }`}
                            style={done ? { fontVariationSettings: "'FILL' 1" } : undefined}
                          >
                            {done ? "check_circle" : "circle"}
                          </span>
                        </div>
                        <span
                          className={`text-[10px] font-label uppercase font-bold ${
                            done ? "text-primary" : "text-on-surface-variant"
                          }`}
                        >
                          {label}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <Link
                  href="/profile"
                  className="mt-8 w-full py-4 text-primary font-bold text-sm tracking-widest uppercase border-b border-primary/20 hover:bg-primary/5 transition-colors flex items-center justify-center"
                >
                  Finish Identity Setup
                </Link>
              </motion.section>
            ) : (
              <motion.section
                className="bg-surface-container-low rounded-2xl p-4 sm:p-8 border border-outline-variant/10 shadow-sm overflow-hidden"
                custom={1}
                initial="hidden"
                animate="show"
                variants={fadeUp}
              >
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <div className="flex items-center gap-3">
                    <span
                      className="material-symbols-outlined text-tertiary"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      emoji_objects
                    </span>
                    <h3 className="font-headline font-bold text-lg sm:text-xl text-white">Tips & Tricks</h3>
                  </div>
                  <div className="flex gap-1.5">
                    {TIPS.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setTipIndex(i)}
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          i === tipIndex ? "w-5 bg-primary" : "w-1.5 bg-outline-variant/40 hover:bg-outline-variant"
                        }`}
                        aria-label={`Tip ${i + 1}`}
                      />
                    ))}
                  </div>
                </div>

                <div className="relative min-h-[80px]">
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={tipIndex}
                      className="flex gap-4"
                      variants={tipSlide}
                      initial="enter"
                      animate="center"
                      exit="exit"
                    >
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                        <span
                          className="material-symbols-outlined text-primary text-sm"
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          {TIPS[tipIndex].icon}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white mb-1">{TIPS[tipIndex].title}</p>
                        <p className="text-xs text-on-surface-variant leading-relaxed">{TIPS[tipIndex].body}</p>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </motion.section>
            )}

            {/* Quick Generate */}
            <motion.section
              className="bg-surface-container p-1 text-white rounded-3xl overflow-hidden shadow-2xl"
              custom={2}
              initial="hidden"
              animate="show"
              variants={fadeUp}
            >
              <div className="bg-surface-container-highest p-4 sm:p-8 rounded-2xl border border-white/5">
                <div className="flex items-center gap-3 mb-4 sm:mb-6">
                  <span className="material-symbols-outlined text-tertiary">auto_awesome</span>
                  <h3 className="font-headline font-bold text-lg">Quick Tailor</h3>
                </div>
                <textarea
                  value={jd}
                  onChange={(e) => setJd(e.target.value)}
                  className="w-full bg-surface-container-low border-b border-outline-variant/20 focus:border-primary focus:ring-0 text-on-surface placeholder:text-gray-600 transition-all p-4 min-h-[120px] sm:min-h-[160px] rounded-xl resize-none font-body"
                  placeholder="Paste the job description here to generate a tailored CV in seconds..."
                />
                <div className="mt-3 flex justify-end">
                  <button
                    onClick={handleQuickTailor}
                    className="bg-gradient-to-br from-primary to-primary-container text-on-primary-container px-6 sm:px-8 py-3 rounded-full font-black text-sm hover:scale-105 transition-transform flex items-center gap-2 shadow-lg shadow-primary/20"
                  >
                    Tailor My Profile
                    <span className="material-symbols-outlined text-sm">bolt</span>
                  </button>
                </div>
              </div>
            </motion.section>
          </div>

          {/* Right column */}
          <div className="lg:col-span-4 space-y-8">
            {/* Recent CVs */}
            <motion.section
              className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/10"
              custom={1.5}
              initial="hidden"
              animate="show"
              variants={fadeUp}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-headline font-bold text-lg text-white">Recent CVs</h3>
                <Link
                  href="/history"
                  className="text-xs font-label text-primary font-bold uppercase hover:underline"
                >
                  View All
                </Link>
              </div>

              {historyLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="bg-surface-container rounded-xl p-4 border border-outline-variant/5 animate-pulse h-16"
                    />
                  ))}
                </div>
              ) : entries.length === 0 ? (
                <div className="text-center py-8">
                  <span className="material-symbols-outlined text-outline text-4xl mb-3 block">
                    description
                  </span>
                  <p className="text-on-surface-variant text-sm">
                    No CVs yet. Generate your first one!
                  </p>
                  <Link
                    href="/generate"
                    className="mt-4 inline-block text-primary font-bold text-sm hover:underline"
                  >
                    Generate now →
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {entries.map((entry, i) => (
                    <motion.div
                      key={entry.id}
                      custom={i}
                      initial="hidden"
                      animate="show"
                      variants={fadeUp}
                    >
                      <Link
                        href="/history"
                        className="block bg-surface-container rounded-xl p-4 border border-outline-variant/5 hover:bg-surface-container-high transition-all hover:-translate-y-1 cursor-pointer group"
                      >
                        <div className="flex justify-between items-start">
                          <div className="space-y-1">
                            <h4 className="font-bold text-sm text-white group-hover:text-primary transition-colors">
                              {entry.role}
                            </h4>
                            <p className="text-xs text-on-surface-variant">
                              {entry.company && `${entry.company} • `}
                              {entry.createdAt?.toDate?.()?.toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })}
                            </p>
                          </div>
                          {entry.atsScore != null && (
                            <ATSRing score={entry.atsScore} size={48} />
                          )}
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.section>
          </div>
        </div>
      </header>
    </div>
  );
}
