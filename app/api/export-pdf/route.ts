import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebaseAdmin";
import { CVData } from "@/types";

export async function POST(req: NextRequest) {
  const token = (req.headers.get("authorization") ?? "").replace("Bearer ", "");
  try {
    await adminAuth.verifyIdToken(token);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { cvData } = await req.json() as { cvData: CVData };
  if (!cvData) {
    return NextResponse.json({ error: "cvData is required" }, { status: 400 });
  }

  const c = cvData.contact_info;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  @page { margin: 13mm; }
  body { font-family: Georgia, serif; font-size: 11px; color: #111; padding: 0; line-height: 1.5; }
  h1 { font-size: 24px; text-transform: uppercase; letter-spacing: -0.5px; text-align: center; margin-bottom: 2px; }
  .cv-title { text-align: center; font-size: 11px; font-weight: 600; color: #333; margin-bottom: 4px; letter-spacing: 0.3px; }
  .contact { text-align: center; font-style: italic; font-size: 10px; color: #555; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 2px solid #111; }
  h2 { font-family: Arial, sans-serif; font-size: 9px; text-transform: uppercase; letter-spacing: 2px; border-bottom: 1px solid #ddd; margin: 16px 0 8px; padding-bottom: 4px; break-after: avoid; }
  p, li { font-size: 10px; line-height: 1.6; }
  ul { margin-left: 16px; }
  .exp-header { display: flex; justify-content: space-between; margin-bottom: 4px; }
  .exp-role { font-weight: bold; font-style: italic; font-size: 11px; }
  .exp-date { font-family: Arial, sans-serif; font-size: 9px; }
  .exp-item { margin-bottom: 16px; break-inside: avoid; }
  .edu-item { margin-bottom: 8px; break-inside: avoid; }
  .summary-block { break-inside: avoid; }
  .footer { position: fixed; bottom: 0; right: 0; font-family: Arial, sans-serif; font-size: 7px; color: #bbb; }
</style>
</head>
<body>
<h1>${c.name}</h1>
${c.title ? `<p class="cv-title">${c.title}</p>` : ""}
<div class="contact">
  ${[c.location, c.email, c.phone, c.linkedin, c.portfolio].filter(Boolean).join(" • ")}
</div>

${cvData.description ? `
<h2>Professional Summary</h2>
<div class="summary-block"><p>${cvData.description}</p></div>
` : ""}

${cvData.experience?.length ? `
<h2>Professional Experience</h2>
${cvData.experience.map((exp) => `
<div class="exp-item">
  <div class="exp-header">
    <span class="exp-role">${exp.role} | ${exp.company}</span>
    <span class="exp-date">${exp.startDate} — ${exp.endDate}</span>
  </div>
  <ul>
    ${exp.bullets.map((b) => `<li>${b}</li>`).join("")}
  </ul>
</div>
`).join("")}
` : ""}

${cvData.projects?.length ? `
<h2>Projects</h2>
${cvData.projects.map((proj) => `
<div class="exp-item">
  <div class="exp-header">
    <span class="exp-role">${proj.name}</span>
    <span class="exp-date">${proj.tech.join(", ")}</span>
  </div>
  <p>${proj.description}</p>
</div>
`).join("")}
` : ""}

${cvData.education?.length ? `
<h2>Education</h2>
${cvData.education.map((edu) => `
<div class="edu-item">
  <div class="exp-header">
    <span style="font-weight:bold; font-size:10px">${edu.degree}${edu.field ? ` in ${edu.field}` : ""}</span>
    <span style="font-size:9px; font-family:Arial">${edu.institution}${edu.year ? ` • ${edu.year}` : ""}</span>
  </div>
</div>
`).join("")}
` : ""}

${cvData.additional_info?.skills ? `
<h2>Technical Skills</h2>
<p>${cvData.additional_info.skills}</p>
` : ""}

${cvData.additional_info?.languages ? `
<h2>Languages</h2>
<p>${cvData.additional_info.languages}</p>
` : ""}

<div class="footer">This resume was made with tailor.ai by Daniel Campuzano</div>
</body>
</html>`;

  try {
    // Try puppeteer (server-side) — only available if optionally installed
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const chromium    = require("@sparticuz/chromium");
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const puppeteer   = require("puppeteer-core");

    const browser = await puppeteer.default.launch({
      args:            chromium.default.args,
      defaultViewport: chromium.default.defaultViewport,
      executablePath:  await chromium.default.executablePath(),
      headless:        true,
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });
    const pdfBuffer = await page.pdf({ format: "A4", printBackground: true });
    await browser.close();

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type":        "application/pdf",
        "Content-Disposition": `attachment; filename="cv.pdf"`,
      },
    });
  } catch {
    // Puppeteer not available — signal client to use its own PDF generator
    return NextResponse.json({ error: "server-pdf-unavailable" }, { status: 501 });
  }
}
