import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { getCurrentUserId } from '@/stores/auth-user-store';
import { isTemplatePremium } from '@/lib/template-registry';
import { getUserTier } from '@/hooks/use-user-tier';

/** @deprecated Use getUserTier().hasPremiumTemplates instead */
const getPremiumStatus = () => getUserTier().hasPremiumTemplates;

export interface ResumeContact {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  portfolio: string;
}

export interface ResumeExperience {
  id: string;
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  bullets: string[];
}

export interface ResumeEducation {
  id: string;
  degree: string;
  school: string;
  graduationYear: string;
  details: string;
}

export type TemplateId =
  // Professional
  | 'modern' | 'classic' | 'minimal' | 'executive'
  // Two-Column
  | 'split' | 'sidebar-left' | 'sidebar-right' | 'metro'
  // Creative
  | 'bold' | 'gradient' | 'ink' | 'neon'
  // Corporate
  | 'corporate' | 'banking' | 'legal' | 'consulting'
  // Tech
  | 'developer' | 'terminal' | 'blueprint' | 'startup'
  // Academic
  | 'academic' | 'research' | 'scholarly'
  // Elegant
  | 'serif' | 'editorial' | 'magazine' | 'luxe';

export type FontFamily =
  | 'system' | 'serif' | 'mono' | 'georgia' | 'garamond' | 'inter' | 'palatino' | 'times';

export interface ResumeData {
  contact: ResumeContact;
  summary: string;
  experience: ResumeExperience[];
  education: ResumeEducation[];
  skills: string[];
  template: TemplateId;
  accentColor: string;
  fontFamily: FontFamily;
  fontSize: 'sm' | 'md' | 'lg';
}

export type CoverLetterTone = 'professional' | 'enthusiastic' | 'conversational' | 'formal';

export interface CoverLetterData {
  jobTitle: string;
  companyName: string;
  jobPosting: string;
  hiringManager: string;
  tone: CoverLetterTone;
  body: string;
  generatedAt: string;
}

export interface ATSImprovement {
  category: string;
  priority: 'high' | 'medium' | 'low';
  suggestion: string;
}

export interface SkillsGapMatchedSkill { skill: string; relevance: string; confidence: number; }
export interface SkillsGapMissingSkill { skill: string; priority: string; difficulty: string; action: string; }
export interface SkillsGapTransferableSkill { skill: string; explanation: string; }
export interface SkillsGapHighlightSkill { skill: string; suggestion: string; }
export interface SkillsGapResumeChange { section: string; current: string; suggested: string; }
export interface SkillsGapAssessment { fitScore: number; readiness: string; summary: string; nextSteps: string[]; }
export interface SkillsGapResult {
  matchedSkills: SkillsGapMatchedSkill[];
  missingSkills: SkillsGapMissingSkill[];
  transferableSkills: SkillsGapTransferableSkill[];
  skillsToHighlight: SkillsGapHighlightSkill[];
  assessment: SkillsGapAssessment;
  resumeChanges: SkillsGapResumeChange[];
}

export interface ATSCategoryScores {
  keywordMatch: number;
  formatting: number;
  experienceRelevance: number;
  skillsAlignment: number;
  educationFit: number;
}

export interface ATSResult {
  overallScore: number;
  summary: string;
  matchedKeywords: string[];
  missingKeywords: string[];
  categoryScores: ATSCategoryScores;
  improvements: ATSImprovement[];
}

export interface LinkedInHeadline {
  text: string;
  style: string;
}

export interface LinkedInExperience {
  title: string;
  company: string;
  description: string;
}

export interface LinkedInTip {
  tip: string;
  impact: 'high' | 'medium' | 'low';
}

export interface LinkedInResult {
  headlines: LinkedInHeadline[];
  about: string;
  experiences: LinkedInExperience[];
  topSkills: string[];
  profileTips: LinkedInTip[];
}

export interface InterviewSTAR {
  situation: string;
  task: string;
  action: string;
  result: string;
}

export interface InterviewQuestion {
  question: string;
  category: 'behavioral' | 'technical' | 'situational' | 'role-specific';
  difficulty: 'easy' | 'medium' | 'hard';
  whyAsked: string;
  starAnswer: InterviewSTAR;
  keyPoints: string[];
  mistakes: string[];
  followUp: string;
}

export interface InterviewPrepTip {
  tip: string;
  category: string;
}

export interface InterviewResult {
  questions: InterviewQuestion[];
  prepTips: InterviewPrepTip[];
  overallReadiness: string;
}

export interface SalaryMarketInsight {
  title: string;
  detail: string;
  trend: 'up' | 'stable' | 'down';
}

export interface SalaryTalkingPoint {
  category: string;
  point: string;
  script: string;
  impact: 'high' | 'medium' | 'low';
}

export interface SalaryCounterOffer {
  scenario: string;
  response: string;
  reasoning: string;
}

export interface SalaryResult {
  salaryRange: { low: number; median: number; high: number; currency: string };
  totalCompensation: { baseSalary: string; bonus: string; equity: string; benefits: string };
  marketInsights: SalaryMarketInsight[];
  negotiationTalkingPoints: SalaryTalkingPoint[];
  counterOfferStrategies: SalaryCounterOffer[];
  timingAdvice: string;
  redFlags: string[];
  confidenceLevel: 'strong' | 'moderate' | 'limited';
}

export interface ResumeVersion {
  id: string;
  name: string;
  targetRole: string;
  resume: ResumeData;
  createdAt: string;
  updatedAt: string;
}

/** localStorage key prefix for per-user data */
const LS_PREFIX = 'resumeforge_user_';

type PersistedState = {
  resume: ResumeData;
  uploadedText: string;
  coverLetter: CoverLetterData;
  versions: ResumeVersion[];
  activeVersionId: string | null;
};

function getStorageKey(userId: string) { return `${LS_PREFIX}${userId}`; }

function saveToStorage(userId: string, state: PersistedState) {
  try {
    localStorage.setItem(getStorageKey(userId), JSON.stringify(state));
  } catch { /* quota exceeded — silently fail */ }
}

function loadFromStorage(userId: string): PersistedState | null {
  try {
    const raw = localStorage.getItem(getStorageKey(userId));
    if (!raw) return null;
    return JSON.parse(raw);
  } catch { return null; }
}

interface ResumeStore {
  resume: ResumeData;
  uploadedText: string;
  activeView: 'dashboard' | 'chat' | 'editor' | 'preview' | 'cover-letter' | 'ats' | 'linkedin' | 'interview' | 'salary' | 'compare' | 'tracker' | 'skills-gap';
  chatOpen: boolean;
  coverLetter: CoverLetterData;
  coverLetterGenerating: boolean;
  atsJobDescription: string;
  atsResult: ATSResult | null;
  atsAnalyzing: boolean;
  linkedinTargetRole: string;
  linkedinResult: LinkedInResult | null;
  linkedinGenerating: boolean;
  interviewJobDescription: string;
  interviewResult: InterviewResult | null;
  interviewGenerating: boolean;
  setResume: (data: Partial<ResumeData>) => void;
  setUploadedText: (text: string) => void;
  setActiveView: (view: 'dashboard' | 'chat' | 'editor' | 'preview' | 'cover-letter' | 'ats' | 'linkedin' | 'interview' | 'salary' | 'compare' | 'tracker' | 'skills-gap') => void;
  setChatOpen: (open: boolean) => void;
  setCoverLetter: (data: Partial<CoverLetterData>) => void;
  setCoverLetterGenerating: (val: boolean) => void;
  setAtsJobDescription: (val: string) => void;
  setAtsResult: (val: ATSResult | null) => void;
  setAtsAnalyzing: (val: boolean) => void;
  setLinkedinTargetRole: (val: string) => void;
  setLinkedinResult: (val: LinkedInResult | null) => void;
  setLinkedinGenerating: (val: boolean) => void;
  setInterviewJobDescription: (val: string) => void;
  setInterviewResult: (val: InterviewResult | null) => void;
  setInterviewGenerating: (val: boolean) => void;
  salaryTargetRole: string;
  salaryLocation: string;
  salaryYearsExp: string;
  salaryResult: SalaryResult | null;
  salaryResearching: boolean;
  skillsGapJobDescription: string;
  skillsGapResult: SkillsGapResult | null;
  skillsGapAnalyzing: boolean;
  setSkillsGapJobDescription: (val: string) => void;
  setSkillsGapResult: (val: SkillsGapResult | null) => void;
  setSkillsGapAnalyzing: (val: boolean) => void;
  setSalaryTargetRole: (val: string) => void;
  setSalaryLocation: (val: string) => void;
  setSalaryYearsExp: (val: string) => void;
  setSalaryResult: (val: SalaryResult | null) => void;
  setSalaryResearching: (val: boolean) => void;
  versions: ResumeVersion[];
  activeVersionId: string | null;
  saveVersion: (name: string, targetRole: string) => void;
  loadVersion: (id: string) => void;
  deleteVersion: (id: string) => void;
  renameVersion: (id: string, name: string, targetRole: string) => void;
  updateCurrentVersion: () => void;
  parseResumeFromMarkdown: (markdown: string) => void;
  resetResume: () => void;
  /** Hydrate store from localStorage for a specific user */
  hydrateForUser: (userId: string) => void;
  /** Clear store data on sign-out */
  clearForSignOut: () => void;
  /** Persist current state for a specific user */
  persistForUser: (userId: string) => void;
}

const defaultResume: ResumeData = {
  contact: {
    fullName: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    portfolio: '',
  },
  summary: '',
  experience: [],
  education: [],
  skills: [],
  template: 'modern',
  accentColor: '#2563eb',
  fontFamily: 'system',
  fontSize: 'md',
};

const defaultCoverLetter: CoverLetterData = {
  jobTitle: '',
  companyName: '',
  jobPosting: '',
  hiringManager: '',
  tone: 'professional',
  body: '',
  generatedAt: '',
};

export const useResumeStore = create<ResumeStore>((set) => ({
  resume: { ...defaultResume },
  uploadedText: '',
  activeView: 'dashboard',
  chatOpen: false,
  coverLetter: { ...defaultCoverLetter },
  coverLetterGenerating: false,
  atsJobDescription: '',
  atsResult: null,
  atsAnalyzing: false,
  linkedinTargetRole: '',
  linkedinResult: null,
  linkedinGenerating: false,
  interviewJobDescription: '',
  interviewResult: null,
  interviewGenerating: false,
  salaryTargetRole: '',
  salaryLocation: '',
  salaryYearsExp: '',
  salaryResult: null,
  salaryResearching: false,
  skillsGapJobDescription: '',
  skillsGapResult: null,
  skillsGapAnalyzing: false,
  setSkillsGapJobDescription: (val) => set({ skillsGapJobDescription: val }),
  setSkillsGapResult: (val) => set({ skillsGapResult: val }),
  setSkillsGapAnalyzing: (val) => set({ skillsGapAnalyzing: val }),
  setSalaryTargetRole: (val) => set({ salaryTargetRole: val }),
  setSalaryLocation: (val) => set({ salaryLocation: val }),
  setSalaryYearsExp: (val) => set({ salaryYearsExp: val }),
  setSalaryResult: (val) => set({ salaryResult: val }),
  setSalaryResearching: (val) => set({ salaryResearching: val }),
  versions: [],
  activeVersionId: null,

  setResume: (data) => {
    if (data.template && isTemplatePremium(data.template) && !getPremiumStatus()) {
      console.warn(`Template "${data.template}" requires premium activation.`);
      return;
    }
    set((state) => ({ resume: { ...state.resume, ...data } }));
  },

  setUploadedText: (text) => set({ uploadedText: text }),

  setActiveView: (view) => set({ activeView: view }),

  setChatOpen: (open) => set({ chatOpen: open }),

  setCoverLetter: (data) =>
    set((state) => ({
      coverLetter: { ...state.coverLetter, ...data },
    })),

  setCoverLetterGenerating: (val) => set({ coverLetterGenerating: val }),

  setAtsJobDescription: (val) => set({ atsJobDescription: val }),
  setAtsResult: (val) => set({ atsResult: val }),
  setAtsAnalyzing: (val) => set({ atsAnalyzing: val }),

  setLinkedinTargetRole: (val) => set({ linkedinTargetRole: val }),
  setLinkedinResult: (val) => set({ linkedinResult: val }),
  setLinkedinGenerating: (val) => set({ linkedinGenerating: val }),

  setInterviewJobDescription: (val) => set({ interviewJobDescription: val }),
  setInterviewResult: (val) => set({ interviewResult: val }),
  setInterviewGenerating: (val) => set({ interviewGenerating: val }),

  parseResumeFromMarkdown: (markdown: string) => {
    const lines = markdown.split('\n');
    const contact: ResumeContact = { ...defaultResume.contact };
    let summary = '';
    const experience: ResumeExperience[] = [];
    const education: ResumeEducation[] = [];
    const skills: string[] = [];

    let currentSection = '';
    let currentExp: ResumeExperience | null = null;
    let expIdCounter = 0;
    let eduIdCounter = 0;

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      const upperLine = trimmed.toUpperCase();

      if (upperLine.includes('PROFESSIONAL SUMMARY') || upperLine.includes('SUMMARY') && upperLine.length < 30) {
        currentSection = 'summary';
        continue;
      }
      if (upperLine.includes('WORK EXPERIENCE') || upperLine.includes('EXPERIENCE') && upperLine.length < 30) {
        currentSection = 'experience';
        continue;
      }
      if (upperLine.includes('EDUCATION')) {
        currentSection = 'education';
        continue;
      }
      if (upperLine.includes('SKILLS') || upperLine.includes('TECHNICAL SKILLS')) {
        currentSection = 'skills';
        continue;
      }

      if (currentSection === '' && !contact.fullName && !trimmed.startsWith('•') && !trimmed.startsWith('-')) {
        if (!trimmed.includes('|') && !trimmed.includes('@') && trimmed.length < 60) {
          contact.fullName = trimmed.replace(/[#*]/g, '').trim();
          continue;
        }
        if (trimmed.includes('|') || trimmed.includes('@')) {
          const parts = trimmed.split(/[|,]/).map((p) => p.trim());
          for (const part of parts) {
            if (part.includes('@')) contact.email = part;
            else if (part.match(/\(\d{3}\)|\d{3}-\d{3}/)) contact.phone = part;
            else if (part.includes('linkedin')) contact.linkedin = part;
            else if (!contact.location && part.length > 2) contact.location = part;
          }
          continue;
        }
      }

      if (currentSection === 'summary') {
        summary += (summary ? ' ' : '') + trimmed;
      }

      if (currentSection === 'experience') {
        if (!trimmed.startsWith('•') && !trimmed.startsWith('-') && !trimmed.startsWith('–')) {
          if (currentExp) experience.push(currentExp);
          currentExp = {
            id: `exp-${expIdCounter++}`,
            title: trimmed.replace(/[#*]/g, '').trim(),
            company: '',
            location: '',
            startDate: '',
            endDate: '',
            bullets: [],
          };

          const titleParts = trimmed.split('|').map((p) => p.replace(/[#*]/g, '').trim());
          if (titleParts.length >= 2) {
            currentExp.title = titleParts[0];
            currentExp.company = titleParts[1];
            if (titleParts[2]) currentExp.location = titleParts[2];
          }
        } else if (currentExp) {
          const bullet = trimmed.replace(/^[•\-–]\s*/, '').trim();
          if (bullet.match(/\d{4}\s*[–\-]\s*(\d{4}|present)/i)) {
            const dateMatch = bullet.match(/(\w+\s+\d{4}|\d{4})\s*[–\-]\s*(\w+\s+\d{4}|\d{4}|present)/i);
            if (dateMatch) {
              currentExp.startDate = dateMatch[1];
              currentExp.endDate = dateMatch[2];
            }
          } else {
            currentExp.bullets.push(bullet);
          }
        }
      }

      if (currentSection === 'education') {
        if (!trimmed.startsWith('•') && !trimmed.startsWith('-')) {
          education.push({
            id: `edu-${eduIdCounter++}`,
            degree: trimmed.replace(/[#*]/g, '').trim(),
            school: '',
            graduationYear: '',
            details: '',
          });
        }
      }

      if (currentSection === 'skills') {
        const skillItems = trimmed
          .replace(/^[•\-–]\s*/, '')
          .replace(/^[^:]+:\s*/, '')
          .split(/[,;]/)
          .map((s) => s.trim())
          .filter((s) => s.length > 0);
        skills.push(...skillItems);
      }
    }

    if (currentExp) experience.push(currentExp);

    set({
      resume: {
        contact,
        summary,
        experience,
        education,
        skills: [...new Set(skills)],
        template: 'modern',
        accentColor: '#2563eb',
        fontFamily: 'system',
        fontSize: 'md',
      },
    });
  },

  saveVersion: (name, targetRole) =>
    set((state) => {
      const now = new Date().toISOString();
      const newVersion: ResumeVersion = {
        id: uuidv4(),
        name,
        targetRole,
        resume: JSON.parse(JSON.stringify(state.resume)),
        createdAt: now,
        updatedAt: now,
      };
      return {
        versions: [...state.versions, newVersion],
        activeVersionId: newVersion.id,
      };
    }),

  loadVersion: (id) =>
    set((state) => {
      const version = state.versions.find((v) => v.id === id);
      if (!version) return {};
      return {
        resume: JSON.parse(JSON.stringify(version.resume)),
        activeVersionId: id,
      };
    }),

  deleteVersion: (id) =>
    set((state) => ({
      versions: state.versions.filter((v) => v.id !== id),
      activeVersionId: state.activeVersionId === id ? null : state.activeVersionId,
    })),

  renameVersion: (id, name, targetRole) =>
    set((state) => ({
      versions: state.versions.map((v) =>
        v.id === id ? { ...v, name, targetRole, updatedAt: new Date().toISOString() } : v
      ),
    })),

  updateCurrentVersion: () =>
    set((state) => {
      if (!state.activeVersionId) return {};
      return {
        versions: state.versions.map((v) =>
          v.id === state.activeVersionId
            ? { ...v, resume: JSON.parse(JSON.stringify(state.resume)), updatedAt: new Date().toISOString() }
            : v
        ),
      };
    }),

  resetResume: () => set({ resume: { ...defaultResume }, uploadedText: '', activeVersionId: null }),

  hydrateForUser: (userId: string) => {
    const saved = loadFromStorage(userId);
    if (saved) {
      set({
        resume: saved.resume ?? { ...defaultResume },
        uploadedText: saved.uploadedText ?? '',
        versions: saved.versions ?? [],
        activeVersionId: saved.activeVersionId ?? null,
        coverLetter: saved.coverLetter ?? { ...defaultCoverLetter },
      });
    } else {
      // Fresh user — start clean
      set({
        resume: { ...defaultResume },
        uploadedText: '',
        versions: [],
        activeVersionId: null,
        coverLetter: { ...defaultCoverLetter },
      });
    }
  },

  clearForSignOut: () => {
    set({
      resume: { ...defaultResume },
      uploadedText: '',
      versions: [],
      activeVersionId: null,
      coverLetter: { ...defaultCoverLetter },
      atsResult: null,
      atsJobDescription: '',
      linkedinResult: null,
      interviewResult: null,
      salaryResult: null,
      skillsGapResult: null,
      activeView: 'dashboard',
    });
  },

  persistForUser: (userId: string) => {
    const state = useResumeStore.getState();
    saveToStorage(userId, {
      resume: state.resume,
      uploadedText: state.uploadedText,
      coverLetter: state.coverLetter,
      versions: state.versions,
      activeVersionId: state.activeVersionId,
    });
  },
}));

// Auto-persist on state changes (debounced)
let persistTimer: ReturnType<typeof setTimeout> | null = null;
useResumeStore.subscribe((state) => {
  const userId = getCurrentUserId();
  if (!userId) return;
  if (persistTimer) clearTimeout(persistTimer);
  persistTimer = setTimeout(() => {
    saveToStorage(userId, {
      resume: state.resume,
      uploadedText: state.uploadedText,
      coverLetter: state.coverLetter,
      versions: state.versions,
      activeVersionId: state.activeVersionId,
    });
  }, 500);
});
