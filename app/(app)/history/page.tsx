"use client";

import { useState } from "react";
import { useCVHistory } from "@/hooks/useCVHistory";
import { CVPreview } from "@/components/cv/CVPreview";
import { CVHistoryEntry } from "@/types";
import { auth } from "@/lib/firebase";

export default function HistoryPage() {
  const { entries, loading } = useCVHistory();
  const [search,   setSearch]   = useState("");
  const [selected, setSelected] = useState<CVHistoryEntry | null>(null);

  const filtered = entries.filter((e) => {
    const q = search.toLowerCase();
    return (
      e.role?.toLowerCase().includes(q) ||
      e.company?.toLowerCase().includes(q)
    );
  });

  const atsColor = (score?: number) =>
    !score        ? "text-outline"   :
    score >= 88   ? "text-tertiary"  :
    score >= 75   ? "text-primary"   :
                    "text-secondary";

  const atsBg = (score?: number) =>
    !score        ? "bg-outline/10"      :
    score >= 88   ? "bg-tertiary/10"     :
    score >= 75   ? "bg-primary/10"      :
                    "bg-secondary/10";

  const dotColor = (score?: number) =>
    !score        ? "bg-outline"   :
    score >= 88   ? "bg-tertiary"  :
    score >= 75   ? "bg-primary"   :
                    "bg-secondary";

  async function handleDownload(entry: CVHistoryEntry) {
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch("/api/export-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ cvData: entry.cvData, lang: entry.lang ?? "en" }),
      });
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      const namePart = entry.cvData.contact_info.name.replace(/\s+/g, "-").toLowerCase();
      const rolePart = (entry.role ?? "").replace(/\s+/g, "-").toLowerCase();
      const compPart = (entry.company ?? "").replace(/\s+/g, "-").toLowerCase();
      const parts    = [namePart, rolePart, compPart].filter(Boolean);
      a.download = `cv-${parts.join("_")}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      const { generatePDF } = await import("@/utils/generatePDF");
      generatePDF(entry.cvData, { role: entry.role, company: entry.company });
    }
  }

  return (
    <div className="flex min-h-screen bg-surface relative">
      {/* ── Main content ── */}
      <main className="flex-1 min-w-0 bg-surface">
        {/* Header + Search */}
        <header className="sticky top-0 z-30 bg-surface/80 backdrop-blur-md px-6 md:px-12 py-8 flex flex-col gap-8 border-b border-outline-variant/5">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2 className="text-4xl font-black tracking-tight text-white mb-2">History</h2>
              <p className="text-outline font-label text-sm uppercase tracking-widest">
                Your Tailored Professional Archive
              </p>
            </div>
            <div className="flex items-center gap-3 bg-surface-container-low p-1.5 rounded-xl">
              <button className="p-2 rounded-lg bg-surface-container-high text-primary flex items-center justify-center">
                <span className="material-symbols-outlined text-xl">grid_view</span>
              </button>
              <button className="p-2 rounded-lg text-outline hover:text-white transition-colors flex items-center justify-center">
                <span className="material-symbols-outlined text-xl">list</span>
              </button>
            </div>
          </div>
          <div className="relative group">
            <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-outline group-focus-within:text-primary transition-colors">
                search
              </span>
            </div>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-surface-container-low border-b-2 border-outline-variant/20 focus:border-primary focus:bg-surface-container focus:ring-0 text-white placeholder:text-outline/50 pl-14 pr-6 py-5 rounded-t-xl transition-all font-body"
              placeholder="Filter by role or company..."
              type="text"
            />
          </div>
        </header>

        {/* Grid */}
        <div className="px-6 md:px-12 pb-24 pt-8">
          {loading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="bg-surface-container rounded-2xl p-6 animate-pulse h-48"
                />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-24">
              <span className="material-symbols-outlined text-outline text-6xl mb-4 block">
                description
              </span>
              <h3 className="text-xl font-bold text-white mb-2">No CVs found</h3>
              <p className="text-on-surface-variant text-sm">
                {search ? "Try a different search." : "Generate your first tailored CV!"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filtered.map((entry) => (
                <div
                  key={entry.id}
                  className="group relative bg-surface-container hover:bg-surface-container-high hover:-translate-y-1 transition-all duration-300 rounded-2xl p-6 overflow-hidden cursor-pointer"
                  onClick={() => setSelected(entry)}
                >
                  {/* ATS badge */}
                  <div className="absolute top-0 right-0 p-4">
                    <div className={`flex items-center gap-1.5 px-3 py-1 ${atsBg(entry.atsScore)} rounded-full`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${dotColor(entry.atsScore)}`} />
                      <span className={`text-[10px] font-mono font-bold ${atsColor(entry.atsScore)}`}>
                        {entry.atsScore ?? "—"} ATS
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col h-full">
                    <div className="mb-6 pr-16">
                      <span className="text-[10px] font-mono text-outline mb-1 block">
                        {entry.createdAt?.toDate?.()?.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                      <h3 className="text-xl font-bold text-white leading-tight group-hover:text-primary transition-colors">
                        {entry.role}
                      </h3>
                      {entry.company && (
                        <p className="text-outline-variant font-medium">{entry.company}</p>
                      )}
                    </div>
                    <div className="mt-auto flex items-center justify-between">
                      <div className="flex -space-x-2">
                        {(entry.jdAnalysis?.requiredSkills ?? []).slice(0, 2).map((s) => (
                          <div
                            key={s}
                            className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-[10px] border-2 border-surface-container text-primary font-bold"
                            title={s}
                          >
                            {s.slice(0, 2).toUpperCase()}
                          </div>
                        ))}
                      </div>
                      <button className="flex items-center gap-2 text-primary font-bold text-sm group/btn">
                        View CV
                        <span className="material-symbols-outlined text-lg group-hover/btn:translate-x-1 transition-transform">
                          arrow_forward
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* ── Drawer ── */}
      {selected && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelected(null)}
          />
          <div className="absolute inset-y-0 right-0 max-w-full flex">
            <div className="pointer-events-auto w-screen max-w-2xl bg-surface-container-low shadow-2xl flex flex-col">
              {/* Drawer header */}
              <div className="px-8 py-6 flex items-center justify-between border-b border-white/5 shrink-0">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setSelected(null)}
                    className="text-outline hover:text-white transition-colors"
                  >
                    <span className="material-symbols-outlined text-2xl">close</span>
                  </button>
                  <h3 className="text-lg font-bold text-white">CV Preview</h3>
                </div>
                <div className="flex items-center gap-4">
                  {selected.atsScore != null && (
                    <div className="flex items-center gap-2 bg-tertiary/10 px-3 py-1 rounded-lg">
                      <span
                        className="material-symbols-outlined text-tertiary text-sm"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        auto_awesome
                      </span>
                      <span className="text-xs font-mono font-bold text-tertiary">
                        {selected.atsScore} ATS Score
                      </span>
                    </div>
                  )}
                  <button
                    onClick={() => handleDownload(selected)}
                    className="bg-gradient-to-br from-primary to-primary-container text-on-primary-container px-6 py-2 rounded-lg font-bold text-sm hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-lg">download</span>
                    Download PDF
                  </button>
                </div>
              </div>

              {/* CV canvas */}
              <div className="flex-1 overflow-y-auto bg-surface-container-lowest p-8 md:p-12">
                <div className="max-w-[800px] mx-auto cv-preview-shadow">
                  <CVPreview cv={selected.cvData} lang={selected.lang ?? "en"} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
