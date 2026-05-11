import { CVData } from "@/types";

/**
 * Client-side PDF generation using jsPDF as a fallback.
 * Supports up to 2 pages with intelligent page-break logic.
 */
export async function generatePDF(cv: CVData, meta?: { role?: string; company?: string }): Promise<void> {
  const { jsPDF } = await import("jspdf");

  const doc  = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const c    = cv.contact_info;
  const W    = 210;
  const L    = 25; // left margin
  const R    = W - 25; // right margin
  let   y    = 25;

  const SAFE_BOTTOM = 277; // 297mm (A4) - 20mm bottom margin
  const MAX_PAGES   = 2;

  const line = (dy = 6) => { y += dy; };
  const text = (str: string, x: number, bold = false, size = 10) => {
    doc.setFontSize(size);
    doc.setFont("helvetica", bold ? "bold" : "normal");
    const lines = doc.splitTextToSize(str, R - x);
    doc.text(lines, x, y);
    y += lines.length * (size * 0.4);
  };
  const section = (title: string) => {
    line(4);
    doc.setDrawColor(200, 200, 200);
    doc.line(L, y, R, y);
    line(5);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text(title.toUpperCase(), L, y);
    line(5);
  };

  // Returns true if drawing can proceed; false if 2-page cap is reached.
  const checkPage = (neededMm: number): boolean => {
    if (y + neededMm > SAFE_BOTTOM) {
      if (doc.getNumberOfPages() >= MAX_PAGES) return false;
      doc.addPage();
      y = 25;
    }
    return true;
  };

  // Name
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text(c.name.toUpperCase(), W / 2, y, { align: "center" });
  line(6);

  // Title
  if (c.title) {
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(c.title, W / 2, y, { align: "center" });
    line(5);
  }

  // Contact
  const contactLine = (
    [c.location, c.email, c.phone, c.linkedin ? "LinkedIn" : null, c.portfolio ? "Portfolio" : null] as (string | null)[]
  ).filter(Boolean).join(" • ");
  doc.setFontSize(8);
  doc.setFont("helvetica", "italic");
  const contactLines = doc.splitTextToSize(contactLine, R - L);
  doc.text(contactLines, W / 2, y, { align: "center" });
  y += contactLines.length * 3.2;
  line(2);
  doc.setDrawColor(50, 50, 50);
  doc.setLineWidth(0.5);
  doc.line(L, y, R, y);
  line(6);

  // Summary
  if (cv.description) {
    const descLines = doc.splitTextToSize(cv.description, R - L);
    if (checkPage(14 + descLines.length * 4)) {
      section("Professional Summary");
      text(cv.description, L);
      line(2);
    }
  }

  // Experience
  if (cv.experience?.length) {
    if (checkPage(14)) section("Professional Experience");

    for (const exp of cv.experience) {
      // Estimate total height of this entry before drawing
      let entryHeight = 5; // role line + line(5)
      for (const b of exp.bullets) {
        entryHeight += doc.splitTextToSize(`• ${b}`, R - L - 4).length * 4;
      }
      entryHeight += 3; // trailing line(3)

      if (!checkPage(entryHeight)) break;

      const dateStr = `${exp.startDate} — ${exp.endDate}`;
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      const dateW = doc.getTextWidth(dateStr);

      doc.setFontSize(10);
      doc.setFont("helvetica", "bolditalic");
      const roleStr = doc.splitTextToSize(`${exp.role} | ${exp.company}`, R - L - dateW - 3)[0];
      doc.text(roleStr, L, y);

      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.text(dateStr, R, y, { align: "right" });
      line(5);

      for (const b of exp.bullets) {
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        const wrapped = doc.splitTextToSize(`• ${b}`, R - (L + 2));
        if (!checkPage(wrapped.length * 4)) break;
        doc.text(wrapped, L + 2, y);
        y += wrapped.length * 4;
      }
      line(3);
    }
  }

  // Projects
  if (cv.projects?.length) {
    if (checkPage(14)) section("Projects");

    for (const proj of cv.projects) {
      const descLines = doc.splitTextToSize(proj.description, R - L);
      const entryHeight = 5 + descLines.length * 4 + (proj.tech.length ? 4 : 0) + 3;

      if (!checkPage(entryHeight)) break;

      // Project name + tech on same line
      const techStr = proj.tech.length ? proj.tech.join(", ") : "";
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      const techW = techStr ? doc.getTextWidth(techStr) : 0;

      doc.setFontSize(10);
      doc.setFont("helvetica", "bolditalic");
      const nameStr = doc.splitTextToSize(proj.name, R - L - techW - 3)[0];
      doc.text(nameStr, L, y);

      if (techStr) {
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(120, 120, 120);
        doc.text(techStr, R, y, { align: "right" });
        doc.setTextColor(0, 0, 0);
      }
      line(5);

      if (proj.description) {
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        const wrapped = doc.splitTextToSize(proj.description, R - L);
        if (!checkPage(wrapped.length * 4)) break;
        doc.text(wrapped, L, y);
        y += wrapped.length * 4;
      }
      line(3);
    }
  }

  // Education
  if (cv.education?.length) {
    if (checkPage(14)) section("Education");

    for (const edu of cv.education) {
      if (!checkPage(8)) break;
      const label = `${edu.degree}${edu.field ? ` in ${edu.field}` : ""}`;
      const meta  = `${edu.institution}${edu.year ? ` • ${edu.year}` : ""}`;

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      const metaW = doc.getTextWidth(meta);

      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      const labelStr = doc.splitTextToSize(label, R - L - metaW - 3)[0];
      doc.text(labelStr, L, y);

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text(meta, R, y, { align: "right" });
      line(6);
    }
  }

  // Skills
  if (cv.additional_info?.skills) {
    const skillLines = doc.splitTextToSize(cv.additional_info.skills, R - L);
    if (checkPage(14 + skillLines.length * 4)) {
      section("Technical Skills");
      text(cv.additional_info.skills, L);
    }
  }

  // Languages
  if (cv.additional_info?.languages) {
    const langLines = doc.splitTextToSize(cv.additional_info.languages, R - L);
    if (checkPage(14 + langLines.length * 4)) {
      section("Languages");
      text(cv.additional_info.languages, L);
    }
  }

  // Footer on every page
  const totalPages = doc.getNumberOfPages();
  const footerText = "This resume was made with tailor.ai by Daniel Campuzano";
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFontSize(6);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(180, 180, 180);
    doc.text(footerText, R, 290, { align: "right" });
    doc.setTextColor(0, 0, 0);
  }

  const slug = (s: string) => s.trim().replace(/\s+/g, "-").toLowerCase();
  const parts = [c.name, meta?.role, meta?.company].filter(Boolean).map((s) => slug(s!));
  doc.save(`cv-${parts.join("_")}.pdf`);
}
