import { Timestamp } from "firebase/firestore";

// ── Plan tiers ───────────────────────────────────────────────────────────────
export type Plan = "free" | "starter" | "pro";

// ── User Profile (Firestore: users/{uid}) ────────────────────────────────────
export interface Experience {
  id: string;
  company: string;
  role: string;
  startDate: string;
  endDate: string; // "Present" or date string
  location: string;
  achievements: string[];
  techStack: string[];
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startYear: string;
  endYear: string;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  year: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  url?: string;
  tech: string[];
}

export interface Language {
  name: string;
  level: "native" | "fluent" | "intermediate" | "basic";
}

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  phone: string;
  linkedin?: string;
  portfolio?: string;
  location?: string;
  photoURL?: string;
  title?: string;
  shortDescription?: string;
  hardSkills: string[];
  softSkills: string[];
  languages: Language[];
  experience: Experience[];
  education: Education[];
  certifications: Certification[];
  projects?: Project[];
  cvCredits: number;
  plan: Plan;
  unlimited?: boolean;
  createdAt: Timestamp;
  lastCvAt?: Timestamp;
  stripeCustomerId?: string;
}

// ── JD Analysis (returned by /api/analyze-jd) ────────────────────────────────
export interface ProfileFit {
  score: number;           // 0–100
  label: string;           // "Excelente match" | "Buen candidato" | "Match parcial" | "Débil match"
  summary: string;         // 1-2 sentence AI assessment in JD language
  matchedSkills: string[];
  missingSkills: string[];
}

export interface JDAnalysis {
  role: string;
  company?: string;
  seniority: string;
  requiredSkills: string[];
  niceToHave: string[];
  atsKeywords: string[];
  domain: string;
  lang: "es" | "en";
  rawSummary: string;
  profileFit?: ProfileFit;
}

// ── CV Data (AI-generated output) ────────────────────────────────────────────
export interface CVContactInfo {
  name: string;
  title?: string;
  email: string;
  phone: string;
  location?: string;
  linkedin?: string;
  portfolio?: string;
}

export interface CVExperience {
  role: string;
  company: string;
  startDate: string;
  endDate: string;
  location?: string;
  bullets: string[];
}

export interface CVEducation {
  degree: string;
  institution: string;
  field?: string;
  year?: string;
}

export interface CVData {
  contact_info: CVContactInfo;
  description: string;
  education: CVEducation[];
  experience: CVExperience[];
  additional_info: {
    skills: string;
    languages?: string;
  };
  projects?: Array<{
    name: string;
    description: string;
    tech: string[];
  }>;
}

// ── CV History Entry (Firestore: users/{uid}/cvHistory/{cvId}) ───────────────
export interface CVHistoryEntry {
  id: string;
  cvData: CVData;
  jobDescription: string;
  jdAnalysis?: JDAnalysis;
  lang: "es" | "en";
  createdAt: Timestamp;
  role: string;
  company?: string;
  atsScore?: number;
  matchedKeywords?: string[];
  missingKeywords?: string[];
  userEdits?: Partial<CVData>;
}

// ── ATS Score Result ──────────────────────────────────────────────────────────
export interface ATSResult {
  score: number;
  matched: string[];
  missing: string[];
}
