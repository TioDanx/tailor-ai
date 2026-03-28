@AGENTS.md

# Tailor AI — contexto para Claude

## Qué es
Plataforma SaaS de generación de CVs con IA. El usuario sube su CV, pega una descripción de trabajo, y recibe un CV tailored con score ATS, preview en vivo y exportación a PDF.

## Stack
- **Next.js 16** (App Router) + **TypeScript**
- **Tailwind CSS 4** para estilos
- **Google Gemini** (`@google/generative-ai`) para toda la IA
- **Firebase** — Auth (cliente) + Firestore + Admin SDK (servidor)
- **Stripe** — Checkout + Webhooks para pagos
- **Vitest** para tests

## Estructura de archivos clave
```
app/api/
  analyze-jd/route.ts       → extrae skills y keywords de una JD
  generate-cv/route.ts      → genera el CV tailored, descuenta crédito
  parse-cv/route.ts         → parsea CV subido (PDF/TXT) con Gemini
  optimize-summary/route.ts → reescribe el summary profesional
  export-pdf/route.ts       → exporta CV a PDF con Puppeteer (501 si no disponible)
  checkout/route.ts         → crea sesión de Stripe Checkout
  webhooks/stripe/route.ts  → recibe eventos Stripe, otorga créditos

components/cv/CVPreview.tsx → renderer del CV (debe coincidir con el PDF)
utils/atsScore.ts           → calculateATSScore — función pura, testeable
utils/generatePDF.ts        → fallback client-side con jsPDF
types/index.ts              → tipos centrales: CVData, UserProfile, JDAnalysis, etc.

__tests__/
  utils/atsScore.test.ts
  api/generate-cv.test.ts
  api/stripe-webhook.test.ts
  api/parse-cv.test.ts
```

## Tipos principales
```ts
CVData {
  contact_info: { name, email, phone, location?, linkedin?, portfolio? }
  description: string
  experience: { role, company, startDate, endDate, bullets[] }[]
  education:  { degree, institution, field?, year? }[]
  additional_info: { skills: string, languages?: string }
}

UserProfile {
  uid, name, email, phone, linkedin?, location?
  hardSkills[], softSkills[], experience[], education[], certifications[]
  cvCredits: number, plan: "free"|"starter"|"pro", unlimited?: boolean
}
```

## Planes y créditos
| Plan | Créditos | Precio |
|---|---|---|
| free | 5 | — |
| starter | 50 | $10 |
| pro | 100 | $20 |

`unlimited: true` en Firestore omite el chequeo de créditos (solo admin/test).

## Scripts
```bash
npm run dev        # desarrollo
npm run build      # producción
npm test           # vitest run
npm run test:watch # vitest watch
npm run lint       # ESLint
```

## Tests (Vitest)
- Path alias `@/*` configurado en `vitest.config.ts`
- Mocks de Firebase Admin, Gemini y Stripe con `vi.hoisted()` + `vi.mock()`
- Para mockear clases usadas con `new`, usar `class` en el factory (no arrow functions)
- `vi.clearAllMocks()` en cada `beforeEach`

## Decisiones de diseño importantes
- **Contact info**: `generate-cv/route.ts` incluye `email`, `phone`, `linkedin`, `location` del perfil en el prompt a Gemini. Sin esto, la IA inventa los datos de contacto.
- **Idempotencia Stripe**: los eventos se deduplan guardando `event.id` en la colección `stripeEvents` antes de procesar.
- **ATS score**: base 40 + hasta 60 por cobertura de keywords. Cap en 99.
- **PDF**: Puppeteer en servidor, jsPDF en cliente como fallback (el server retorna 501 si Puppeteer no está disponible).
- **CVPreview.tsx debe coincidir con export-pdf/route.ts**: ambos renderizan el mismo CV; si se cambia el layout de uno, actualizar el otro.

## Variables de entorno requeridas
```
GEMINI_API_KEY
FIREBASE_PROJECT_ID / FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY
NEXT_PUBLIC_FIREBASE_* (6 vars para el cliente)
STRIPE_SECRET_KEY / STRIPE_WEBHOOK_SECRET / STRIPE_STARTER_PRICE_ID / STRIPE_PRO_PRICE_ID
NEXT_PUBLIC_APP_URL
```
