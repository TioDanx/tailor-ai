"use client";

import { useState, useEffect, useRef, ReactNode } from "react";
import Link from "next/link";
import { AuthProvider } from "@/contexts/AuthContext";
import { useAuth } from "@/contexts/AuthContext";
import { AuthModal } from "@/components/auth/AuthModal";

// ── Scroll-reveal wrapper ─────────────────────────────────────────────────────
function FadeIn({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(28px)",
        transition: `opacity 0.65s ease ${delay}ms, transform 0.65s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

function LandingContent() {
  const { user } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    // Trigger hero animations after first paint
    const t = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(t);
  }, []);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 20);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function openAuth(mode: "signin" | "signup") {
    setAuthMode(mode);
    setShowAuth(true);
  }

  // Helper for staggered hero items
  function heroStyle(delayMs: number) {
    return {
      opacity: mounted ? 1 : 0,
      transform: mounted ? "translateY(0)" : "translateY(22px)",
      transition: `opacity 0.7s ease ${delayMs}ms, transform 0.7s ease ${delayMs}ms`,
    };
  }

  return (
    <div className="bg-background text-on-surface font-body">
      {/* ── Top Nav ── */}
      <nav
        className={`fixed top-0 w-full z-50 flex justify-between items-center px-6 py-4 font-['Inter'] antialiased tracking-tight border-b transition-all duration-300 ${
          scrolled
            ? "bg-[#131313]/90 backdrop-blur-md border-white/10 shadow-lg shadow-black/20"
            : "bg-[#131313] border-white/5"
        }`}
      >
        <div className="text-xl font-bold tracking-tighter text-white">tailor.ai</div>
        <div className="hidden md:flex items-center gap-8">
          {[
            { label: "Pricing", id: "pricing" },
            { label: "FAQ",     id: "faq" },
          ].map(({ label, id }) => (
            <button
              key={id}
              onClick={() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })}
              className="text-gray-400 hover:text-white transition-colors"
            >
              {label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-4">
          {user ? (
            <Link
              href="/dashboard"
              className="button-gradient text-on-primary-container px-5 py-2 rounded-lg font-semibold hover:scale-[1.02] transition-transform duration-200 active:scale-95"
            >
              Go to Dashboard
            </Link>
          ) : (
            <button
              onClick={() => openAuth("signup")}
              className="button-gradient text-on-primary-container px-5 py-2 rounded-lg font-semibold hover:scale-[1.02] transition-transform duration-200 active:scale-95"
            >
              Get started
            </button>
          )}
        </div>
      </nav>

      <main className="pt-24">
        {/* ── Hero ── */}
        <section className="relative px-6 py-20 lg:min-h-[calc(100vh-6rem)] lg:flex lg:flex-col lg:justify-center overflow-hidden">
          <div className="max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 z-10">
              <div style={heroStyle(0)}>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-high border border-outline-variant/20 mb-6">
                  <span
                    className="material-symbols-outlined text-tertiary text-sm"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    auto_awesome
                  </span>
                  <span className="font-label text-xs tracking-widest uppercase text-on-surface-variant">
                    AI-Powered precision
                  </span>
                </div>
              </div>

              <h1 style={heroStyle(80)} className="font-headline text-5xl md:text-7xl font-extrabold tracking-tighter text-white leading-[0.9] mb-8">
                Build your profile once.{" "}
                <br />
                <span className="text-gradient-primary">Tailor in seconds.</span>
              </h1>

              <p style={heroStyle(180)} className="text-on-surface-variant text-lg md:text-xl max-w-xl leading-relaxed mb-10">
                Stop wasting hours manually editing CVs. Paste a job description and let our
                AI architect a perfectly fitted professional identity for every application.
              </p>

              <div style={heroStyle(280)}>
                <button
                  onClick={() => openAuth("signup")}
                  className="button-gradient text-on-primary-container px-8 py-4 rounded-lg font-bold text-lg hover:scale-[1.02] transition-transform shadow-lg shadow-primary/20"
                >
                  Get started for free
                </button>
              </div>
            </div>

            <div className="hidden lg:block lg:col-span-5 relative" style={heroStyle(340)}>
              {/* CV mockup */}
              <div className="relative z-10 bg-surface-container-lowest rounded-xl cv-canvas-shadow border border-outline-variant/10 animate-float overflow-hidden">
                {/* Scan beam */}
                <div className="absolute inset-x-0 h-16 bg-gradient-to-b from-transparent via-primary/10 to-transparent pointer-events-none z-20 animate-scan-beam" />

                <div className="p-8">
                  {/* Top bar */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-tertiary/60" />
                      <div className="h-2 w-20 bg-surface-container-high rounded" />
                    </div>
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-tertiary/10 border border-tertiary/20">
                      <div className="w-1.5 h-1.5 rounded-full bg-tertiary animate-blink" />
                      <span className="text-[9px] font-mono text-tertiary tracking-wider">TAILORING</span>
                    </div>
                  </div>

                  {/* Name + role */}
                  <div className="mb-5">
                    <div className="h-6 w-2/3 bg-white/85 rounded mb-2" />
                    <div className="h-3 w-1/2 bg-primary/30 rounded" />
                  </div>

                  {/* Contact row */}
                  <div className="flex gap-3 mb-6">
                    <div className="h-2 w-16 bg-outline-variant/25 rounded" />
                    <div className="h-2 w-20 bg-outline-variant/25 rounded" />
                    <div className="h-2 w-14 bg-outline-variant/25 rounded" />
                  </div>

                  <div className="border-t border-outline-variant/10 pt-5 space-y-5">
                    {/* Summary section */}
                    <div>
                      <div className="h-2.5 w-16 bg-primary/40 rounded mb-3" />
                      <div className="space-y-1.5">
                        <div className="h-1.5 w-full bg-outline-variant/25 rounded" />
                        <div className="h-1.5 w-full bg-outline-variant/25 rounded" />
                        <div className="h-1.5 w-4/5 bg-outline-variant/25 rounded" />
                      </div>
                    </div>

                    {/* Experience section */}
                    <div>
                      <div className="h-2.5 w-20 bg-primary/40 rounded mb-3" />
                      <div className="space-y-1.5">
                        <div className="h-2 w-1/2 bg-white/50 rounded" />
                        <div className="h-1.5 w-3/4 bg-outline-variant/20 rounded" />
                        <div className="h-1.5 w-full bg-outline-variant/20 rounded" />
                        <div className="h-1.5 w-5/6 bg-outline-variant/20 rounded" />
                      </div>
                    </div>

                    {/* Skills chips */}
                    <div>
                      <div className="h-2.5 w-12 bg-primary/40 rounded mb-3" />
                      <div className="flex flex-wrap gap-1.5">
                        {[28, 20, 24, 18, 22, 16].map((w, i) => (
                          <div
                            key={i}
                            className="h-5 rounded-full bg-surface-container-high border border-primary/15"
                            style={{ width: `${w * 3}px` }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* ATS score bar at bottom */}
                <div className="border-t border-outline-variant/10 px-8 py-3 flex items-center justify-between">
                  <span className="text-[9px] font-mono text-outline tracking-widest uppercase">ATS Score</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-1 bg-surface-container-high rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-primary to-tertiary rounded-full" style={{ width: "94%" }} />
                    </div>
                    <span className="text-[10px] font-bold text-tertiary">94</span>
                  </div>
                </div>
              </div>

              {/* Glow */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] bg-primary/10 blur-[120px] rounded-full -z-0 pointer-events-none animate-pulse-glow" />
            </div>
          </div>
        </section>

        {/* ── How It Works ── */}
        <section className="py-32 px-6 bg-surface-container-low">
          <div className="max-w-7xl mx-auto">
            <FadeIn className="mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-high border border-outline-variant/20 mb-6">
                <span className="material-symbols-outlined text-tertiary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                  route
                </span>
                <span className="font-label text-xs tracking-widest uppercase text-on-surface-variant">
                  How it works
                </span>
              </div>
              <h2 className="font-headline text-3xl md:text-5xl font-bold tracking-tight text-white mb-4 leading-[1.05]">
                From raw history to{" "}
                <span className="text-gradient-primary">targeted narrative.</span>
              </h2>
              <p className="text-on-surface-variant text-lg max-w-lg leading-relaxed">
                Three deliberate steps. One perfectly fitted CV — every time.
              </p>
            </FadeIn>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
              {/* Connector line (desktop only) */}
              <div className="hidden md:block absolute top-14 left-[17%] right-[17%] h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent pointer-events-none" />

              {[
                {
                  icon: "manage_accounts",
                  step: "01",
                  title: "Build your profile",
                  desc: "Import a PDF or LinkedIn export. Our AI maps every role, skill, and achievement — once, permanently.",
                  accent: "tertiary" as const,
                },
                {
                  icon: "content_paste_search",
                  step: "02",
                  title: "Drop the job description",
                  desc: "Paste any JD. The engine extracts ATS keywords, required skills, seniority signals, and cultural tone in seconds.",
                  accent: "primary" as const,
                  highlight: true,
                },
                {
                  icon: "auto_fix_high",
                  step: "03",
                  title: "Get your tailored CV",
                  desc: "Bullet points rewritten, keywords injected, tone adjusted. Download a print-ready PDF or keep editing inline.",
                  accent: "tertiary" as const,
                },
              ].map(({ icon, step, title, desc, accent, highlight }, i) => (
                <FadeIn key={step} delay={i * 120}>
                  <div
                    className={`group relative p-8 rounded-2xl h-full transition-all duration-300 ${
                      highlight
                        ? "bg-surface-container border-2 border-primary/30 hover:border-primary/60 shadow-lg shadow-primary/5"
                        : "bg-surface-container border border-outline-variant/10 hover:border-outline-variant/30"
                    }`}
                  >
                    {highlight && (
                      <div className="absolute -top-3 left-8 px-3 py-0.5 rounded-full bg-primary text-on-primary-container text-[10px] font-bold uppercase tracking-wider">
                        Key step
                      </div>
                    )}
                    <div className="flex items-start justify-between mb-6">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform ${accent === "tertiary" ? "bg-tertiary/10" : "bg-primary/10"}`}>
                        <span
                          className={`material-symbols-outlined text-2xl ${accent === "tertiary" ? "text-tertiary" : "text-primary"}`}
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          {icon}
                        </span>
                      </div>
                      <span className="font-mono text-4xl font-black text-outline-variant/30 leading-none">
                        {step}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-3">{title}</h3>
                    <p className="text-on-surface-variant text-sm leading-relaxed">{desc}</p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* ── Features ── */}
        <section className="py-32 px-6 overflow-hidden">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

              {/* Cards grid */}
              <div className="relative order-2 lg:order-1">
                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-5">
                    <FadeIn delay={0}>
                      <div
                        className="bg-surface-container p-6 rounded-2xl border border-outline-variant/10 hover:border-primary/20 hover:bg-surface-container-high transition-colors duration-300"
                        style={{ animation: "floatCard 4.2s ease-in-out infinite" }}
                      >
                        <div className="w-10 h-10 rounded-xl bg-tertiary/10 flex items-center justify-center mb-4">
                          <span className="material-symbols-outlined text-tertiary text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                            verified
                          </span>
                        </div>
                        <h4 className="text-white font-bold mb-1.5">ATS-Ready</h4>
                        <p className="text-xs text-on-surface-variant leading-relaxed">
                          Parses cleanly in Greenhouse, Workday, and Lever — every time.
                        </p>
                      </div>
                    </FadeIn>
                    <FadeIn delay={150}>
                      <div
                        className="bg-surface-container-high p-6 rounded-2xl border border-outline-variant/10 hover:border-primary/20 hover:bg-surface-container-highest transition-colors duration-300"
                        style={{ animation: "floatCard 5s ease-in-out infinite 1.1s" }}
                      >
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                          <span className="material-symbols-outlined text-primary text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                            language
                          </span>
                        </div>
                        <h4 className="text-white font-bold mb-1.5">Bilingual</h4>
                        <p className="text-xs text-on-surface-variant leading-relaxed">
                          Generate in English or Spanish — auto-detected from the job description.
                        </p>
                      </div>
                    </FadeIn>
                  </div>
                  <div className="space-y-5 pt-10">
                    <FadeIn delay={75}>
                      <div
                        className="bg-surface-container-high p-6 rounded-2xl border border-outline-variant/10 hover:border-primary/20 hover:bg-surface-container-highest transition-colors duration-300"
                        style={{ animation: "floatCard 4.7s ease-in-out infinite 0.4s" }}
                      >
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                          <span className="material-symbols-outlined text-primary text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                            edit_note
                          </span>
                        </div>
                        <h4 className="text-white font-bold mb-1.5">Inline Editing</h4>
                        <p className="text-xs text-on-surface-variant leading-relaxed">
                          Fine-tune any section manually with live AI suggestions alongside.
                        </p>
                      </div>
                    </FadeIn>
                    <FadeIn delay={225}>
                      <div
                        className="bg-surface-container p-6 rounded-2xl border border-outline-variant/10 hover:border-primary/20 hover:bg-surface-container-high transition-colors duration-300"
                        style={{ animation: "floatCard 3.9s ease-in-out infinite 1.7s" }}
                      >
                        <div className="w-10 h-10 rounded-xl bg-tertiary/10 flex items-center justify-center mb-4">
                          <span className="material-symbols-outlined text-tertiary text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                            picture_as_pdf
                          </span>
                        </div>
                        <h4 className="text-white font-bold mb-1.5">PDF Export</h4>
                        <p className="text-xs text-on-surface-variant leading-relaxed">
                          Professional typography, optimized for both screen and print.
                        </p>
                      </div>
                    </FadeIn>
                  </div>
                </div>
                {/* Subtle glow behind cards */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-primary/5 blur-[80px] rounded-full -z-10 pointer-events-none" />
              </div>

              {/* Text side */}
              <FadeIn className="order-1 lg:order-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-high border border-outline-variant/20 mb-6">
                  <span className="material-symbols-outlined text-primary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                    bolt
                  </span>
                  <span className="font-label text-xs tracking-widest uppercase text-on-surface-variant">
                    Built to win
                  </span>
                </div>
                <h2 className="font-headline text-4xl md:text-5xl font-black text-white mb-6 leading-[1.05]">
                  Tools that put you{" "}
                  <span className="text-gradient-primary">one step ahead.</span>
                </h2>
                <p className="text-on-surface-variant text-lg mb-10 leading-relaxed">
                  We don&apos;t just rewrite text. We craft the exact narrative each employer
                  wants to read — with the keywords their ATS actually ranks.
                </p>
                <div className="space-y-3 mb-10">
                  {[
                    { icon: "manage_search", label: "Automatic keyword optimization" },
                    { icon: "tune",          label: "Tone adjustment per role and company" },
                    { icon: "analytics",     label: "Real-time ATS score as you generate" },
                  ].map(({ icon, label }) => (
                    <div key={label} className="flex items-center gap-3 py-2.5 px-4 rounded-xl bg-surface-container border border-outline-variant/10 hover:border-primary/20 transition-colors">
                      <span className="material-symbols-outlined text-primary text-lg shrink-0">
                        {icon}
                      </span>
                      <span className="text-white text-sm font-medium">{label}</span>
                    </div>
                  ))}
                </div>
                {/* Mini stats */}
                <div className="flex gap-6">
                  <div>
                    <div className="text-2xl font-black text-white">94<span className="text-primary text-lg">avg</span></div>
                    <div className="text-xs text-on-surface-variant mt-0.5">Avg ATS score</div>
                  </div>
                  <div className="w-px bg-outline-variant/20" />
                  <div>
                    <div className="text-2xl font-black text-white">&lt;30<span className="text-tertiary text-lg">s</span></div>
                    <div className="text-xs text-on-surface-variant mt-0.5">Generation time</div>
                  </div>
                  <div className="w-px bg-outline-variant/20" />
                  <div>
                    <div className="text-2xl font-black text-white">2<span className="text-primary text-lg">lang</span></div>
                    <div className="text-xs text-on-surface-variant mt-0.5">ES &amp; EN supported</div>
                  </div>
                </div>
              </FadeIn>
            </div>
          </div>
        </section>

        {/* ── Pricing ── */}
        <section className="py-32 px-6 bg-surface-container-lowest" id="pricing">
          <FadeIn>
            <div className="max-w-2xl mx-auto text-center mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-high border border-outline-variant/20 mb-6">
                <span className="material-symbols-outlined text-tertiary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                  payments
                </span>
                <span className="font-label text-xs tracking-widest uppercase text-on-surface-variant">
                  Pricing
                </span>
              </div>
              <h2 className="font-headline text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
                Pay once.{" "}
                <span className="text-gradient-primary">Land the job.</span>
              </h2>
              <p className="text-on-surface-variant text-lg">
                No subscriptions. No renewals. Buy credits when you need them.
              </p>
            </div>
          </FadeIn>

          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {/* Free */}
            <FadeIn delay={0}>
              <div className="bg-surface-container-low p-8 rounded-2xl flex flex-col border border-outline-variant/10 hover:border-outline-variant/25 transition-all duration-300 h-full">
                <div className="mb-6">
                  <div className="font-label text-xs tracking-widest text-on-surface-variant uppercase mb-3">
                    Trial
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-1">Free</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-white">$0</span>
                    <span className="text-on-surface-variant text-sm">forever</span>
                  </div>
                  <p className="text-xs text-on-surface-variant mt-3 leading-relaxed">
                    Try the full experience before you commit.
                  </p>
                </div>
                <div className="border-t border-outline-variant/10 pt-6 mb-8 space-y-3 flex-1">
                  {[
                    { icon: "description", text: "5 tailored CVs" },
                    { icon: "preview",     text: "Live CV preview" },
                    { icon: "download",    text: "PDF export" },
                  ].map(({ icon, text }) => (
                    <div key={text} className="flex items-center gap-2.5 text-sm text-on-surface-variant">
                      <span className="material-symbols-outlined text-outline text-base">{icon}</span>
                      {text}
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => openAuth("signup")}
                  className="w-full py-3 rounded-xl border border-outline-variant/30 text-white font-bold hover:bg-surface-container transition-colors mt-auto"
                >
                  Start for free
                </button>
              </div>
            </FadeIn>

            {/* Starter */}
            <FadeIn delay={100}>
              <div className="bg-surface-container p-8 rounded-2xl flex flex-col border-2 border-primary relative shadow-2xl shadow-primary/10 hover:shadow-primary/20 transition-all duration-300 h-full">
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 button-gradient text-on-primary-container px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap">
                  Most Popular
                </div>
                <div className="mb-6">
                  <div className="font-label text-xs tracking-widest text-primary font-bold uppercase mb-3">
                    Starter
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-1">10 Credits</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-white">$5</span>
                    <span className="text-on-surface-variant text-sm">one-time</span>
                  </div>
                  <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20">
                    <span className="text-[10px] font-bold text-primary">$0.50 / CV</span>
                  </div>
                </div>
                <div className="border-t border-outline-variant/10 pt-6 mb-8 space-y-3 flex-1">
                  {[
                    { icon: "description",    text: "10 tailored CVs", highlight: true },
                    { icon: "preview",        text: "Live CV preview", highlight: false },
                    { icon: "download",       text: "PDF export", highlight: false },
                    { icon: "analytics",      text: "ATS score per CV", highlight: false },
                  ].map(({ icon, text, highlight }) => (
                    <div key={text} className={`flex items-center gap-2.5 text-sm ${highlight ? "text-white font-medium" : "text-on-surface-variant"}`}>
                      <span className={`material-symbols-outlined text-base ${highlight ? "text-primary" : "text-primary/60"}`}>{icon}</span>
                      {text}
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => openAuth("signup")}
                  className="w-full py-3 rounded-xl button-gradient text-on-primary-container font-bold hover:scale-[1.02] transition-transform mt-auto"
                >
                  Get 10 Credits
                </button>
              </div>
            </FadeIn>

            {/* Pro */}
            <FadeIn delay={200}>
              <div className="bg-surface-container-low p-8 rounded-2xl flex flex-col border border-outline-variant/10 hover:border-tertiary/30 transition-all duration-300 h-full group">
                <div className="mb-6">
                  <div className="font-label text-xs tracking-widest text-tertiary font-bold uppercase mb-3">
                    Pro
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-1">25 Credits</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-white">$10</span>
                    <span className="text-on-surface-variant text-sm">one-time</span>
                  </div>
                  <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-tertiary/10 border border-tertiary/20">
                    <span className="text-[10px] font-bold text-tertiary">$0.40 / CV</span>
                  </div>
                </div>
                <div className="border-t border-outline-variant/10 pt-6 mb-8 space-y-3 flex-1">
                  {[
                    { icon: "description",    text: "25 tailored CVs", highlight: true },
                    { icon: "preview",        text: "Live CV preview", highlight: false },
                    { icon: "download",       text: "PDF export", highlight: false },
                    { icon: "analytics",      text: "ATS score per CV", highlight: false },
                    { icon: "mail",           text: "AI cover letter", highlight: true },
                  ].map(({ icon, text, highlight }) => (
                    <div key={text} className={`flex items-center gap-2.5 text-sm ${highlight ? "text-white font-medium" : "text-on-surface-variant"}`}>
                      <span className={`material-symbols-outlined text-base ${highlight ? "text-tertiary" : "text-tertiary/50"}`}>{icon}</span>
                      {text}
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => openAuth("signup")}
                  className="w-full py-3 rounded-xl border border-tertiary/30 text-white font-bold hover:bg-surface-container hover:border-tertiary/50 transition-all mt-auto"
                >
                  Get 25 Credits
                </button>
              </div>
            </FadeIn>
          </div>

          {/* Trust line */}
          <FadeIn delay={300}>
            <p className="text-center text-xs text-outline mt-10 flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-sm">lock</span>
              Secure checkout via Stripe · No subscription · Credits never expire
            </p>
          </FadeIn>
        </section>
        {/* ── FAQ ── */}
        <section className="py-32 px-6" id="faq">
          <div className="max-w-3xl mx-auto">
            <FadeIn className="mb-16 text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-high border border-outline-variant/20 mb-6">
                <span className="material-symbols-outlined text-primary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                  help
                </span>
                <span className="font-label text-xs tracking-widest uppercase text-on-surface-variant">
                  FAQ
                </span>
              </div>
              <h2 className="font-headline text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
                Questions?{" "}
                <span className="text-gradient-primary">We got you.</span>
              </h2>
              <p className="text-on-surface-variant text-lg">
                Everything you need to know before you start.
              </p>
            </FadeIn>

            <div className="space-y-3">
              {[
                {
                  q: "How does the AI tailoring actually work?",
                  a: "You build a master profile once — your full work history, skills, and education. When you paste a job description, our AI analyzes it for required skills, seniority level, and ATS keywords, then rewrites your bullet points and summary to match that specific role. It's not a template swap — it's a targeted rewrite.",
                },
                {
                  q: "Do my credits ever expire?",
                  a: "No. Credits are yours to use at your own pace — no monthly reset, no expiry date. Buy once and use them whenever you need them.",
                },
                {
                  q: "What file formats do you accept for import?",
                  a: "You can upload your existing CV as a PDF or plain text (.txt). We also support pasting content directly into the profile builder. LinkedIn import is on the roadmap.",
                },
                {
                  q: "How accurate is the ATS score?",
                  a: "Our scoring model is calibrated against common ATS systems (Greenhouse, Workday, Lever, iCIMS). It measures keyword coverage, formatting compatibility, and section completeness. Scores above 85 consistently pass automated screening in our testing.",
                },
                {
                  q: "Can I edit the CV after it's generated?",
                  a: "Yes — every generated CV has inline editing enabled. You can click any section and modify it manually. The AI suggestions update in real time as you type.",
                },
                {
                  q: "Is my data secure?",
                  a: "All data is encrypted in transit (TLS) and at rest. We never sell or share your profile data. You can delete your account and all associated data at any time from your settings.",
                },
              ].map(({ q, a }, i) => (
                <FadeIn key={i} delay={i * 60}>
                  <div
                    className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                      openFaq === i
                        ? "bg-surface-container border-primary/25"
                        : "bg-surface-container-low border-outline-variant/10 hover:border-outline-variant/25"
                    }`}
                  >
                    <button
                      className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    >
                      <span className={`font-semibold text-sm md:text-base transition-colors ${openFaq === i ? "text-white" : "text-on-surface-variant"}`}>
                        {q}
                      </span>
                      <span
                        className={`material-symbols-outlined text-xl shrink-0 transition-all duration-300 ${
                          openFaq === i ? "text-primary rotate-180" : "text-outline"
                        }`}
                      >
                        expand_more
                      </span>
                    </button>
                    <div
                      style={{
                        maxHeight: openFaq === i ? "400px" : "0px",
                        transition: "max-height 0.35s ease",
                        overflow: "hidden",
                      }}
                    >
                      <p className="px-6 pb-6 text-sm text-on-surface-variant leading-relaxed">
                        {a}
                      </p>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>

            {/* CTA below FAQ */}
            <FadeIn delay={100}>
              <div className="mt-16 text-center p-8 rounded-2xl bg-surface-container border border-outline-variant/10">
                <p className="text-on-surface-variant mb-2 text-sm">Still have questions?</p>
                <h3 className="text-white font-bold text-xl mb-6">Start free — no credit card required.</h3>
                <button
                  onClick={() => openAuth("signup")}
                  className="button-gradient text-on-primary-container px-8 py-3 rounded-xl font-bold hover:scale-[1.02] transition-transform shadow-lg shadow-primary/20"
                >
                  Try tailor.ai free
                </button>
              </div>
            </FadeIn>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="py-12 px-6 border-t border-outline-variant/10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-lg font-black tracking-tighter text-white">tailor.ai</div>
          <div className="flex gap-8 text-sm text-on-surface-variant">
            <a className="hover:text-primary transition-colors" href="#">Privacy</a>
            <a className="hover:text-primary transition-colors" href="#">Terms</a>
            <a className="hover:text-primary transition-colors" href="#">Contact</a>
          </div>
          <div className="text-sm font-label text-outline uppercase tracking-widest">
            © 2025 tailored identity inc.
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} initialMode={authMode} />}
    </div>
  );
}

export default function LandingPage() {
  return (
    <AuthProvider>
      <LandingContent />
    </AuthProvider>
  );
}
