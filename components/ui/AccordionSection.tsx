"use client";

import { useState, ReactNode } from "react";

interface AccordionSectionProps {
  title: string;
  children?: ReactNode;
  defaultOpen?: boolean;
  isEmpty?: boolean;
}

export function AccordionSection({
  title,
  children,
  defaultOpen = true,
  isEmpty = false,
}: AccordionSectionProps) {
  const [open, setOpen] = useState(defaultOpen && !isEmpty);

  return (
    <section
      className={`group bg-surface-container-low rounded-2xl overflow-hidden border border-transparent hover:border-outline-variant/10 transition-all ${isEmpty ? "opacity-80" : ""}`}
    >
      <button
        type="button"
        className="w-full flex items-center justify-between p-6 text-left"
        onClick={() => setOpen((o) => !o)}
      >
        <div className="flex items-center gap-4">
          <div
            className={`w-2 h-2 rounded-full ${
              isEmpty
                ? "bg-outline-variant"
                : "bg-tertiary shadow-[0_0_8px_rgba(79,219,200,0.5)]"
            }`}
          />
          <h3 className="text-xl font-headline font-bold text-white">{title}</h3>
        </div>
        <div className="flex items-center gap-3">
          {isEmpty && (
            <span className="text-xs font-label text-outline">Empty</span>
          )}
          <span
            className={`material-symbols-outlined text-outline group-hover:text-primary transition-all duration-200 ${
              open ? "rotate-180" : ""
            }`}
          >
            expand_more
          </span>
        </div>
      </button>

      {open && children && (
        <div className="px-6 pb-8">{children}</div>
      )}
    </section>
  );
}
