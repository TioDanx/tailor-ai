"use client";

import { useRef, useState, useEffect } from "react";
import { CVData } from "@/types";

interface CVPreviewProps {
  cv: CVData;
  lang?: "es" | "en";
  className?: string;
  editable?: boolean;
  onChange?: (updated: CVData) => void;
}

export function CVPreview({ cv, lang = "en", className = "", editable = false, onChange }: CVPreviewProps) {
  const { contact_info: c, description, experience, education, additional_info } = cv;

  const labels = lang === "es"
    ? { summary: "Resumen Profesional", experience: "Experiencia Profesional", projects: "Proyectos", education: "Educación", skills: "Habilidades Técnicas", languages: "Idiomas", eduIn: "en" }
    : { summary: "Professional Summary", experience: "Professional Experience", projects: "Projects", education: "Education", skills: "Technical Skills", languages: "Languages", eduIn: "in" };

  const wrapperRef = useRef<HTMLDivElement>(null);
  const [contentHeightPx, setContentHeightPx] = useState<number | null>(null);
  const [pageHeightPx, setPageHeightPx]       = useState<number | null>(null);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const observer = new ResizeObserver(() => {
      setPageHeightPx(el.offsetWidth * 1.414);
      setContentHeightPx(el.scrollHeight);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const exceedsTwo =
    pageHeightPx !== null &&
    contentHeightPx !== null &&
    contentHeightPx > 2 * pageHeightPx;

  // Deep clone + patch helper
  function patch(fn: (d: CVData) => void): CVData {
    const draft = JSON.parse(JSON.stringify(cv)) as CVData;
    fn(draft);
    return draft;
  }

  const editableProps = editable
    ? { contentEditable: true as const, suppressContentEditableWarning: true }
    : {};

  const ec = editable
    ? "outline-none border-b border-dashed border-blue-400/50 focus:border-blue-500 focus:bg-blue-50/5 rounded-sm cursor-text min-w-[4px] inline-block"
    : "";

  return (
    <>
      {exceedsTwo && (
        <div
          role="alert"
          className="hidden md:flex mb-2 items-center gap-2 rounded-md border border-amber-500/40 bg-amber-500/15 px-3 py-2 font-sans text-xs text-amber-400"
        >
          <span className="font-bold">Atención:</span>
          El CV supera 2 páginas. Acortá los bullets o el summary.
        </div>
      )}

      {editable && (
        <div className="hidden md:flex mb-2 items-center gap-2 px-3 py-1.5 bg-blue-500/10 border border-blue-400/20 rounded-lg text-[10px] text-blue-400 font-sans font-medium">
          <span className="material-symbols-outlined text-sm">edit</span>
          Click on any field to edit it directly
        </div>
      )}

      <div
        ref={wrapperRef}
        className={`cv-canvas relative w-full bg-white p-12 text-[#131313] font-serif selection:bg-primary-container/30 ${className}`}
      >
        {/* Header */}
        <div className="text-center border-b-2 border-gray-900 pb-6 mb-8">
          <h1 className="text-4xl font-bold uppercase tracking-tight mb-1">
            <span
              {...editableProps}
              className={ec}
              onBlur={(e) => onChange?.(patch((d) => { d.contact_info.name = e.currentTarget.textContent ?? ""; }))}
            >
              {c.name}
            </span>
          </h1>

          {(c.title || editable) && (
            <p className="text-sm font-sans font-semibold text-gray-700 mb-2 tracking-wide">
              <span
                {...editableProps}
                className={ec}
                onBlur={(e) => onChange?.(patch((d) => { d.contact_info.title = e.currentTarget.textContent ?? ""; }))}
              >
                {c.title ?? ""}
              </span>
            </p>
          )}

          <p className="text-sm italic font-sans text-gray-600">
            {editable ? (
              <>
                {(["location", "email", "phone", "linkedin", "portfolio"] as const).map((field, i, arr) => {
                  const val = c[field] ?? "";
                  if (!val && !editable) return null;
                  return (
                    <span key={field}>
                      <span
                        {...editableProps}
                        className={ec}
                        onBlur={(e) => onChange?.(patch((d) => {
                          (d.contact_info as unknown as Record<string, string>)[field] = e.currentTarget.textContent ?? "";
                        }))}
                      >
                        {val}
                      </span>
                      {i < arr.length - 1 && <span className="select-none"> • </span>}
                    </span>
                  );
                })}
              </>
            ) : (
              [c.location, c.email, c.phone, c.linkedin, c.portfolio].filter(Boolean).join(" • ")
            )}
          </p>
        </div>

        {/* Summary */}
        {(description || editable) && (
          <div className="mb-6">
            <h2 className="text-sm font-bold uppercase tracking-widest border-b border-gray-300 mb-3 font-sans">
              {labels.summary}
            </h2>
            <p
              {...editableProps}
              className={`text-xs leading-relaxed text-justify ${ec}`}
              onBlur={(e) => onChange?.(patch((d) => { d.description = e.currentTarget.textContent ?? ""; }))}
            >
              {description}
            </p>
          </div>
        )}

        {/* Experience */}
        {experience.length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-bold uppercase tracking-widest border-b border-gray-300 mb-3 font-sans">
              {labels.experience}
            </h2>
            {experience.map((exp, i) => (
              <div key={i} className="mb-4">
                <div className="flex justify-between items-baseline mb-1">
                  <span className="font-bold text-sm italic">
                    <span
                      {...editableProps}
                      className={ec}
                      onBlur={(e) => onChange?.(patch((d) => { d.experience[i].role = e.currentTarget.textContent ?? ""; }))}
                    >
                      {exp.role}
                    </span>
                    {" | "}
                    <span
                      {...editableProps}
                      className={ec}
                      onBlur={(e) => onChange?.(patch((d) => { d.experience[i].company = e.currentTarget.textContent ?? ""; }))}
                    >
                      {exp.company}
                    </span>
                  </span>
                  <span className="text-[10px] font-sans">
                    <span
                      {...editableProps}
                      className={ec}
                      onBlur={(e) => onChange?.(patch((d) => { d.experience[i].startDate = e.currentTarget.textContent ?? ""; }))}
                    >
                      {exp.startDate}
                    </span>
                    {" — "}
                    <span
                      {...editableProps}
                      className={ec}
                      onBlur={(e) => onChange?.(patch((d) => { d.experience[i].endDate = e.currentTarget.textContent ?? ""; }))}
                    >
                      {exp.endDate}
                    </span>
                  </span>
                </div>
                <ul className="list-disc ml-4 text-xs space-y-1.5">
                  {exp.bullets.map((b, j) => (
                    <li key={j}>
                      <span
                        {...editableProps}
                        className={ec}
                        onBlur={(e) => onChange?.(patch((d) => { d.experience[i].bullets[j] = e.currentTarget.textContent ?? ""; }))}
                      >
                        {b}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {/* Projects */}
        {cv.projects && cv.projects.length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-bold uppercase tracking-widest border-b border-gray-300 mb-3 font-sans">
              {labels.projects}
            </h2>
            {cv.projects.map((proj, i) => (
              <div key={i} className="mb-3">
                <div className="flex justify-between items-baseline mb-0.5">
                  <span className="font-bold text-sm italic">
                    <span
                      {...editableProps}
                      className={ec}
                      onBlur={(e) => onChange?.(patch((d) => { d.projects![i].name = e.currentTarget.textContent ?? ""; }))}
                    >
                      {proj.name}
                    </span>
                  </span>
                  {proj.tech.length > 0 && (
                    <span className="text-[10px] font-sans text-gray-500">
                      {proj.tech.join(", ")}
                    </span>
                  )}
                </div>
                <p
                  {...editableProps}
                  className={`text-xs leading-relaxed ${ec}`}
                  onBlur={(e) => onChange?.(patch((d) => { d.projects![i].description = e.currentTarget.textContent ?? ""; }))}
                >
                  {proj.description}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Education */}
        {education.length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-bold uppercase tracking-widest border-b border-gray-300 mb-3 font-sans">
              {labels.education}
            </h2>
            {education.map((edu, i) => (
              <div key={i} className="flex justify-between items-baseline">
                <span className="font-bold text-xs">
                  <span
                    {...editableProps}
                    className={ec}
                    onBlur={(e) => onChange?.(patch((d) => { d.education[i].degree = e.currentTarget.textContent ?? ""; }))}
                  >
                    {edu.degree}
                  </span>
                  {(edu.field || editable) && (
                    <> {labels.eduIn} <span
                      {...editableProps}
                      className={ec}
                      onBlur={(e) => onChange?.(patch((d) => { d.education[i].field = e.currentTarget.textContent ?? ""; }))}
                    >
                      {edu.field ?? ""}
                    </span></>
                  )}
                </span>
                <span className="text-[10px] font-sans text-right">
                  <span
                    {...editableProps}
                    className={ec}
                    onBlur={(e) => onChange?.(patch((d) => { d.education[i].institution = e.currentTarget.textContent ?? ""; }))}
                  >
                    {edu.institution}
                  </span>
                  {(edu.year || editable) && (
                    <> • <span
                      {...editableProps}
                      className={ec}
                      onBlur={(e) => onChange?.(patch((d) => { d.education[i].year = e.currentTarget.textContent ?? ""; }))}
                    >
                      {edu.year ?? ""}
                    </span></>
                  )}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Skills */}
        {additional_info?.skills && (
          <div className="mb-6">
            <h2 className="text-sm font-bold uppercase tracking-widest border-b border-gray-300 mb-3 font-sans">
              {labels.skills}
            </h2>
            <p
              {...editableProps}
              className={`text-xs ${ec}`}
              onBlur={(e) => onChange?.(patch((d) => { d.additional_info.skills = e.currentTarget.textContent ?? ""; }))}
            >
              {additional_info.skills}
            </p>
          </div>
        )}

        {/* Languages */}
        {additional_info?.languages && (
          <div>
            <h2 className="text-sm font-bold uppercase tracking-widest border-b border-gray-300 mb-3 font-sans">
              {labels.languages}
            </h2>
            <p
              {...editableProps}
              className={`text-xs ${ec}`}
              onBlur={(e) => onChange?.(patch((d) => { if (d.additional_info) d.additional_info.languages = e.currentTarget.textContent ?? ""; }))}
            >
              {additional_info.languages}
            </p>
          </div>
        )}
      </div>
    </>
  );
}
