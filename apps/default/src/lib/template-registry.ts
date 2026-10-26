import type { TemplateId, FontFamily } from '@/stores/resume-store';

export interface TemplateDefinition {
  id: TemplateId;
  name: string;
  description: string;
  category: TemplateCategory;
  twoColumn: boolean;
  defaultAccent: string;
  previewColors: [string, string, string, string];
  tags: string[];
  bestFor: string;
  /** If true, this template requires premium activation to use */
  premium?: boolean;
}

export type TemplateCategory =
  | 'professional' | 'two-column' | 'creative' | 'corporate'
  | 'tech' | 'academic' | 'elegant';

export const CATEGORY_INFO: Record<TemplateCategory, { label: string; emoji: string; description: string }> = {
  professional: { label: 'Professional', emoji: '💼', description: 'Clean, versatile designs' },
  'two-column': { label: 'Two-Column', emoji: '📐', description: 'Space-efficient sidebar layouts' },
  creative: { label: 'Creative', emoji: '🎨', description: 'Bold, expressive designs' },
  corporate: { label: 'Corporate', emoji: '🏢', description: 'Polished business layouts' },
  tech: { label: 'Tech', emoji: '💻', description: 'Tailored for technical roles' },
  academic: { label: 'Academic', emoji: '🎓', description: 'Formal research layouts' },
  elegant: { label: 'Elegant', emoji: '✨', description: 'Refined, sophisticated typography' },
};

// FREE templates: 1 per category (7 total)
// PREMIUM templates: remaining 20 (requires activation)
export const TEMPLATES: TemplateDefinition[] = [
  // ─── Professional ───
  { id: 'modern', name: 'Modern', description: 'Bold colored header with clean body', category: 'professional', twoColumn: false, defaultAccent: '#2563eb', previewColors: ['#2563eb','#fff','#f8fafc','#2563eb'], tags: ['popular','ats-friendly'], bestFor: 'All industries' },
  { id: 'classic', name: 'Classic', description: 'Centered header, traditional layout', category: 'professional', twoColumn: false, defaultAccent: '#1e3a5f', previewColors: ['#fff','#fff','#fff','#1e3a5f'], tags: ['ats-friendly','traditional'], bestFor: 'General professional', premium: true },
  { id: 'minimal', name: 'Minimal', description: 'Ultra-clean with generous whitespace', category: 'professional', twoColumn: false, defaultAccent: '#374151', previewColors: ['#fff','#fff','#fff','#374151'], tags: ['ats-friendly','clean'], bestFor: 'Design, writing', premium: true },
  { id: 'executive', name: 'Executive', description: 'Commanding presence, accent headings', category: 'professional', twoColumn: false, defaultAccent: '#0f172a', previewColors: ['#fff','#fff','#fff','#0f172a'], tags: ['senior','leadership'], bestFor: 'C-suite, VP, director', premium: true },
  // ─── Two-Column ───
  { id: 'split', name: 'Split', description: '50/50 split with colored left panel', category: 'two-column', twoColumn: true, defaultAccent: '#1e40af', previewColors: ['#1e40af','#fff','#f0f4ff','#1e40af'], tags: ['visual','sidebar'], bestFor: 'Marketing, design' },
  { id: 'sidebar-left', name: 'Sidebar Left', description: 'Dark sidebar left with skills & contact', category: 'two-column', twoColumn: true, defaultAccent: '#1e293b', previewColors: ['#1e293b','#fff','#f8fafc','#3b82f6'], tags: ['sidebar','compact'], bestFor: 'Tech, engineering', premium: true },
  { id: 'sidebar-right', name: 'Sidebar Right', description: 'Light sidebar right, experience focus', category: 'two-column', twoColumn: true, defaultAccent: '#6366f1', previewColors: ['#fff','#f1f5f9','#fff','#6366f1'], tags: ['sidebar','experience'], bestFor: 'Senior professionals', premium: true },
  { id: 'metro', name: 'Metro', description: 'Tile-based grid layout with colored blocks', category: 'two-column', twoColumn: true, defaultAccent: '#0ea5e9', previewColors: ['#0ea5e9','#f0f9ff','#fff','#0ea5e9'], tags: ['tiles','modern'], bestFor: 'Startups, product', premium: true },
  // ─── Creative ───
  { id: 'bold', name: 'Bold', description: 'Oversized name, thick dividers, max confidence', category: 'creative', twoColumn: false, defaultAccent: '#dc2626', previewColors: ['#fff','#fff','#fff','#dc2626'], tags: ['bold-type','statement'], bestFor: 'Creative directors' },
  { id: 'gradient', name: 'Gradient', description: 'Gradient header flowing into clean content', category: 'creative', twoColumn: false, defaultAccent: '#8b5cf6', previewColors: ['#8b5cf6','#c084fc','#fff','#8b5cf6'], tags: ['gradient','colorful'], bestFor: 'Design, marketing', premium: true },
  { id: 'ink', name: 'Ink', description: 'Dark header with hand-crafted editorial feel', category: 'creative', twoColumn: false, defaultAccent: '#0f172a', previewColors: ['#0f172a','#fff','#fafafa','#0f172a'], tags: ['dark','editorial'], bestFor: 'Journalists, writers', premium: true },
  { id: 'neon', name: 'Neon', description: 'Vibrant accent lines and glowing highlights', category: 'creative', twoColumn: false, defaultAccent: '#06b6d4', previewColors: ['#0f172a','#fff','#f0fdfa','#06b6d4'], tags: ['vibrant','standout'], bestFor: 'Designers, gaming', premium: true },
  // ─── Corporate ───
  { id: 'corporate', name: 'Corporate', description: 'Subtle accent stripe, clean identity', category: 'corporate', twoColumn: false, defaultAccent: '#1e40af', previewColors: ['#1e40af','#fff','#fff','#1e40af'], tags: ['stripe','professional'], bestFor: 'Fortune 500' },
  { id: 'banking', name: 'Banking', description: 'Conservative navy/gold, trustworthy', category: 'corporate', twoColumn: false, defaultAccent: '#1e3a5f', previewColors: ['#1e3a5f','#fff','#fafaf9','#b45309'], tags: ['finance','conservative'], bestFor: 'Finance, banking', premium: true },
  { id: 'legal', name: 'Legal', description: 'Serif headers, formal spacing, dignified', category: 'corporate', twoColumn: false, defaultAccent: '#292524', previewColors: ['#fff','#fff','#fafaf9','#292524'], tags: ['legal','formal'], bestFor: 'Law, government', premium: true },
  { id: 'consulting', name: 'Consulting', description: 'Clear hierarchy, results-oriented', category: 'corporate', twoColumn: false, defaultAccent: '#0369a1', previewColors: ['#fff','#fff','#f0f9ff','#0369a1'], tags: ['consulting','structured'], bestFor: 'Consulting, advisory', premium: true },
  // ─── Tech ───
  { id: 'developer', name: 'Developer', description: 'Monospace accents, code-inspired badges', category: 'tech', twoColumn: false, defaultAccent: '#22c55e', previewColors: ['#0f172a','#fff','#f0fdf4','#22c55e'], tags: ['monospace','developer'], bestFor: 'Software engineers' },
  { id: 'terminal', name: 'Terminal', description: 'Dark bg with green terminal-style text', category: 'tech', twoColumn: false, defaultAccent: '#22c55e', previewColors: ['#0a0a0a','#0a0a0a','#111','#22c55e'], tags: ['dark-mode','terminal'], bestFor: 'Security, systems', premium: true },
  { id: 'blueprint', name: 'Blueprint', description: 'Technical grid-inspired engineering layout', category: 'tech', twoColumn: true, defaultAccent: '#2563eb', previewColors: ['#eff6ff','#dbeafe','#fff','#2563eb'], tags: ['grid','engineering'], bestFor: 'Engineering, data science', premium: true },
  { id: 'startup', name: 'Startup', description: 'SaaS aesthetic, rounded corners, vibrant', category: 'tech', twoColumn: false, defaultAccent: '#7c3aed', previewColors: ['#7c3aed','#ede9fe','#fff','#7c3aed'], tags: ['startup','saas'], bestFor: 'Startups, product', premium: true },
  // ─── Academic ───
  { id: 'academic', name: 'Academic', description: 'Formal CV layout for publications', category: 'academic', twoColumn: false, defaultAccent: '#1e3a5f', previewColors: ['#fff','#fff','#fafafa','#1e3a5f'], tags: ['cv','formal'], bestFor: 'Professors, PhD' },
  { id: 'research', name: 'Research', description: 'Serif layout for publication lists', category: 'academic', twoColumn: false, defaultAccent: '#4338ca', previewColors: ['#fff','#fff','#faf5ff','#4338ca'], tags: ['publications','research'], bestFor: 'Scientists, scholars', premium: true },
  { id: 'scholarly', name: 'Scholarly', description: 'Book-like typesetting, elegant proportions', category: 'academic', twoColumn: false, defaultAccent: '#44403c', previewColors: ['#fff','#fff','#fafaf9','#44403c'], tags: ['serif','book'], bestFor: 'Humanities, teaching', premium: true },
  // ─── Elegant ───
  { id: 'serif', name: 'Serif', description: 'Timeless serif typography, refined', category: 'elegant', twoColumn: false, defaultAccent: '#78350f', previewColors: ['#fff','#fff','#fffbeb','#78350f'], tags: ['serif','classic'], bestFor: 'Senior professionals' },
  { id: 'editorial', name: 'Editorial', description: 'Magazine-inspired with visual hierarchy', category: 'elegant', twoColumn: false, defaultAccent: '#0f172a', previewColors: ['#0f172a','#fff','#fff','#0f172a'], tags: ['magazine','editorial'], bestFor: 'Editors, publishers', premium: true },
  { id: 'magazine', name: 'Magazine', description: 'Multi-column magazine spread design', category: 'elegant', twoColumn: true, defaultAccent: '#be185d', previewColors: ['#be185d','#fdf2f8','#fff','#be185d'], tags: ['creative','visual'], bestFor: 'Fashion, PR, luxury', premium: true },
  { id: 'luxe', name: 'Luxe', description: 'Gold accents, premium feel, pure sophistication', category: 'elegant', twoColumn: false, defaultAccent: '#92400e', previewColors: ['#0f172a','#fff','#fffbeb','#92400e'], tags: ['luxury','gold'], bestFor: 'Executive, hospitality', premium: true },
];

export const FONT_OPTIONS: { id: FontFamily; label: string; css: string }[] = [
  { id: 'system', label: 'System', css: "'Segoe UI', system-ui, -apple-system, sans-serif" },
  { id: 'inter', label: 'Inter', css: "'Inter', 'Segoe UI', system-ui, sans-serif" },
  { id: 'serif', label: 'Serif', css: "Georgia, 'Times New Roman', serif" },
  { id: 'georgia', label: 'Georgia', css: "Georgia, Cambria, serif" },
  { id: 'garamond', label: 'Garamond', css: "'EB Garamond', Garamond, serif" },
  { id: 'palatino', label: 'Palatino', css: "'Palatino Linotype', 'Book Antiqua', serif" },
  { id: 'times', label: 'Times', css: "'Times New Roman', Times, serif" },
  { id: 'mono', label: 'Monospace', css: "'SF Mono', 'Fira Code', Consolas, monospace" },
];

export const ACCENT_COLORS = [
  '#2563eb','#3b82f6','#6366f1','#7c3aed','#8b5cf6','#a855f7',
  '#059669','#10b981','#14b8a6','#06b6d4','#0891b2','#0ea5e9',
  '#dc2626','#ef4444','#f97316','#d97706','#eab308','#ca8a04',
  '#be185d','#e11d48','#f43f5e','#ec4899','#0f172a','#374151',
  '#1e40af','#1e3a5f','#4338ca','#7e22ce','#92400e','#78350f',
];

// Deliberately limited to shades that remain readable against the white and
// near-white template surfaces. Accent colors can still be bright; body copy
// should not silently inherit an inaccessible accent.
export const TEXT_COLORS = [
  '#111827','#1f2937','#374151','#334155','#1e293b','#0f172a',
  '#1e3a5f','#312e81','#4c1d95','#064e3b','#7f1d1d','#78350f',
];

export const FONT_SIZES: { id: 'sm' | 'md' | 'lg'; label: string; base: number }[] = [
  { id: 'sm', label: 'Compact', base: 10 },
  { id: 'md', label: 'Standard', base: 11 },
  { id: 'lg', label: 'Large', base: 12 },
];

export const FREE_TEMPLATES = TEMPLATES.filter((t) => !t.premium);
export const PREMIUM_TEMPLATES = TEMPLATES.filter((t) => t.premium);

export function isTemplatePremium(id: TemplateId): boolean {
  return TEMPLATES.find((t) => t.id === id)?.premium === true;
}

export function getTemplatesByCategory(category: TemplateCategory) {
  return TEMPLATES.filter((t) => t.category === category);
}

export function getTemplateById(id: TemplateId) {
  return TEMPLATES.find((t) => t.id === id);
}

export function getFontCSS(fontFamily: FontFamily): string {
  return FONT_OPTIONS.find((f) => f.id === fontFamily)?.css ?? FONT_OPTIONS[0].css;
}
