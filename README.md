# Tailor AI

AI-powered CV tailoring platform. Upload your CV, paste a job description, and get a tailored, ATS-optimized resume in seconds — with live preview, inline editing, and one-click PDF export.

## What it does

1. **Parse CV** — upload a PDF or TXT and Gemini extracts your full profile (experience, education, skills, projects, contact info).
2. **Analyze JD** — paste a job description and the AI extracts role, seniority, required skills, ATS keywords, and a profile fit score.
3. **Generate CV** — Gemini writes a tailored CV from your profile + JD analysis, matching keywords and tone.
4. **ATS Score** — every generated CV is scored against the JD keywords (40–99 scale).
5. **Manual Edit** — inline contentEditable editing on the live preview after generation.
6. **Export PDF** — server-side via Puppeteer, or client-side via jsPDF as fallback.
7. **CV History** — all generated CVs are saved to Firestore and searchable from the history page.

## Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS 4 |
| Animations | Framer Motion |
| AI | Google Gemini (`@google/generative-ai`) |
| Auth | Firebase Authentication |
| Database | Firestore (Firebase Admin SDK) |
| Payments | Stripe (Checkout + Webhooks) |
| PDF (server) | Puppeteer + `@sparticuz/chromium` |
| PDF (client) | jsPDF (fallback) |
| Tests | Vitest |

## Project structure

```
app/
  page.tsx                        → landing page (marketing + auth)
  layout.tsx                      → root layout (fonts, metadata)
  (app)/
    layout.tsx                    → authenticated shell (Providers → AppLayout)
    dashboard/page.tsx            → welcome, profile completion, tips carousel, quick tailor
    generate/page.tsx             → JD input → analysis → CV generation → live preview
    history/page.tsx              → CV archive with search, ATS badge, PDF download
    profile/page.tsx              → profile editor (CV import or manual entry)
  api/
    analyze-jd/route.ts           → POST — extract JD requirements + profile fit via Gemini
    generate-cv/route.ts          → POST — generate tailored CV, decrement credit, save to Firestore
    parse-cv/route.ts             → POST — parse uploaded CV file (PDF/TXT) via Gemini
    optimize-summary/route.ts     → POST — rewrite professional summary with AI
    export-pdf/route.ts           → POST — render CV to PDF via Puppeteer (501 if unavailable)
    checkout/route.ts             → POST — create Stripe Checkout session
    webhooks/stripe/route.ts      → POST — handle Stripe events, grant credits

components/
  cv/CVPreview.tsx                → live CV renderer; supports inline editing; must match PDF output
  layout/
    AppLayout.tsx                 → sidebar + bottom nav wrapper
    Sidebar.tsx                   → desktop nav, quota bar, upgrade button, user info
    BottomNav.tsx                 → mobile bottom navigation
    Providers.tsx                 → Auth → UserProfile → AuthGate → AppLayout
    AuthGate.tsx                  → redirects unauthenticated users to landing
  auth/AuthModal.tsx              → Google sign-in modal
  ui/
    ATSRing.tsx                   → SVG circular ATS score badge
    AccordionSection.tsx          → collapsible profile section wrapper
    Badge.tsx                     → status badge
    Button.tsx                    → reusable button
    SkillChip.tsx                 → removable skill tag

contexts/
  AuthContext.tsx                 → Firebase auth state + sign-in/out methods
  UserProfileContext.tsx          → Firestore user profile with real-time sync

hooks/
  useJDAnalysis.ts                → calls /api/analyze-jd, manages loading/error state
  useUserQuota.ts                 → credits, plan, pctUsed, hasQuota derived from profile
  useCVHistory.ts                 → real-time Firestore listener on cvHistory subcollection
  useAuthGate.ts                  → redirect to "/" if unauthenticated

lib/
  firebase.ts                     → client Firebase app (singleton)
  firebaseAdmin.ts                → server Firebase Admin SDK (auth + Firestore)
  stripe.ts                       → Stripe client + PLANS config (starter/pro)
  ai.ts                           → GEMINI_MODEL constant

utils/
  atsScore.ts                     → calculateATSScore — pure function, fully tested
  generatePDF.ts                  → client-side PDF fallback via jsPDF (2-page max)

types/index.ts                    → UserProfile, CVData, JDAnalysis, CVHistoryEntry,
                                    Experience, Education, Project, Certification, Language

__tests__/
  utils/atsScore.test.ts          → 6 unit tests (pure scoring logic)
  api/generate-cv.test.ts         → 5 tests (auth, quota, contact info injection, happy path)
  api/stripe-webhook.test.ts      → 6 tests (signature, idempotency, credit amounts)
  api/parse-cv.test.ts            → 4 tests (auth, file type, file size)
```

## Plans & credits

| Plan | Credits | Price |
|---|---|---|
| Free | 5 | — |
| Starter | 50 | $10 |
| Pro | 100 | $20 |

`unlimited: true` on a user doc bypasses the credit check entirely (admin/test use).

## Environment variables

```env
# Firebase (server) — use individual vars or the JSON blob
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
# or:
FIREBASE_ADMIN_SERVICE_ACCOUNT_JSON=

# Firebase (client)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Google Gemini
GEMINI_API_KEY=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_STARTER_PRICE_ID=
STRIPE_PRO_PRICE_ID=

# App
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

## Scripts

```bash
npm run dev        # development server (Turbopack)
npm run build      # production build
npm run lint       # ESLint
npm test           # run all tests (vitest)
npm run test:watch # vitest in watch mode
```

## Key design decisions

- **Contact info in prompt** — `generate-cv` injects `email`, `phone`, `linkedin`, and `location` from the user profile into the Gemini prompt so the AI uses real data instead of hallucinating it.
- **Projects on CV** — user projects (stored in `UserProfile.projects`) are passed to Gemini and rendered in `CVPreview` between Experience and Education.
- **Inline editing** — `CVPreview` accepts `editable` and `onChange` props; when enabled, every CV field becomes `contentEditable` and patches the `CVData` state on blur.
- **Stripe idempotency** — webhook events are deduplicated by storing `event.id` in a `stripeEvents` Firestore collection before processing.
- **Transactional quota** — credit deduction in `generate-cv` runs inside a Firestore transaction to prevent race conditions.
- **PDF fallback** — if Puppeteer is unavailable (e.g. local dev without `@sparticuz/chromium`), the server returns `501` and the client falls back to jsPDF. `CVPreview` and the Puppeteer template must stay in sync.
- **ATS score capped at 99** — a score of 100 would imply a perfect CV, which is misleading.
- **Language auto-detection** — `analyze-jd` detects whether the job description is in Spanish or English and generates the CV in the same language (overridable by the user).
