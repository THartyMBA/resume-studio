import type { ResumeData, ResumeExperience, ResumeEducation } from '@/stores/resume-store';

export type DiffStatus = 'added' | 'removed' | 'changed' | 'unchanged';

export interface TextDiff {
  field: string;
  label: string;
  status: DiffStatus;
  values: string[]; // one per version being compared
}

export interface ListDiff<T> {
  label: string;
  items: { status: DiffStatus; values: (T | null)[] }[];
}

export interface SkillDiff {
  skill: string;
  present: boolean[]; // one per version
}

export interface ResumeDiffResult {
  contact: TextDiff[];
  summary: TextDiff;
  experience: ListDiff<ResumeExperience>;
  education: ListDiff<ResumeEducation>;
  skills: SkillDiff[];
  styling: TextDiff[];
  stats: { total: number; changed: number; added: number; removed: number };
}

function textStatus(vals: string[]): DiffStatus {
  const unique = new Set(vals.filter(Boolean));
  if (unique.size <= 1) {
    const allEmpty = vals.every((v) => !v);
    return allEmpty ? 'unchanged' : 'unchanged';
  }
  return 'changed';
}

function matchById<T extends { id: string }>(lists: T[][]): { status: DiffStatus; values: (T | null)[] }[] {
  const allIds = new Set<string>();
  lists.forEach((l) => l.forEach((item) => allIds.add(item.id)));

  const results: { status: DiffStatus; values: (T | null)[] }[] = [];

  allIds.forEach((id) => {
    const values = lists.map((l) => l.find((item) => item.id === id) || null);
    const presentCount = values.filter(Boolean).length;
    const allPresent = presentCount === lists.length;
    const nonePresent = presentCount === 0;

    let status: DiffStatus = 'unchanged';
    if (!allPresent && !nonePresent) {
      // Exists in some but not all
      const firstPresent = values.findIndex(Boolean);
      if (firstPresent === 0 && presentCount < lists.length) status = 'removed';
      else status = 'added';
    } else if (allPresent) {
      // Compare serialized content
      const serialized = values.map((v) => JSON.stringify(v));
      const unique = new Set(serialized);
      status = unique.size > 1 ? 'changed' : 'unchanged';
    }

    results.push({ status, values });
  });

  return results;
}

export function compareResumes(resumes: ResumeData[]): ResumeDiffResult {
  if (resumes.length < 2) throw new Error('Need at least 2 resumes to compare');

  // Contact fields
  const contactFields: { field: string; label: string; getter: (r: ResumeData) => string }[] = [
    { field: 'fullName', label: 'Full Name', getter: (r) => r.contact.fullName },
    { field: 'email', label: 'Email', getter: (r) => r.contact.email },
    { field: 'phone', label: 'Phone', getter: (r) => r.contact.phone },
    { field: 'location', label: 'Location', getter: (r) => r.contact.location },
    { field: 'linkedin', label: 'LinkedIn', getter: (r) => r.contact.linkedin },
    { field: 'portfolio', label: 'Portfolio', getter: (r) => r.contact.portfolio },
  ];

  const contact: TextDiff[] = contactFields.map(({ field, label, getter }) => {
    const values = resumes.map(getter);
    return { field, label, status: textStatus(values), values };
  });

  // Summary
  const summaryValues = resumes.map((r) => r.summary);
  const summary: TextDiff = { field: 'summary', label: 'Summary', status: textStatus(summaryValues), values: summaryValues };

  // Experience
  const experience: ListDiff<ResumeExperience> = {
    label: 'Experience',
    items: matchById(resumes.map((r) => r.experience)),
  };

  // Education
  const education: ListDiff<ResumeEducation> = {
    label: 'Education',
    items: matchById(resumes.map((r) => r.education)),
  };

  // Skills
  const allSkills = new Set<string>();
  resumes.forEach((r) => r.skills.forEach((s) => allSkills.add(s.toLowerCase())));
  const skills: SkillDiff[] = Array.from(allSkills).sort().map((skill) => ({
    skill,
    present: resumes.map((r) => r.skills.some((s) => s.toLowerCase() === skill)),
  }));

  // Styling
  const stylingFields: { field: string; label: string; getter: (r: ResumeData) => string }[] = [
    { field: 'template', label: 'Template', getter: (r) => r.template },
    { field: 'accentColor', label: 'Accent Color', getter: (r) => r.accentColor },
    { field: 'fontFamily', label: 'Font', getter: (r) => r.fontFamily },
    { field: 'fontSize', label: 'Font Size', getter: (r) => r.fontSize },
  ];

  const styling: TextDiff[] = stylingFields.map(({ field, label, getter }) => {
    const values = resumes.map(getter);
    return { field, label, status: textStatus(values), values };
  });

  // Stats
  let total = 0;
  let changed = 0;
  let added = 0;
  let removed = 0;

  [...contact, summary, ...styling].forEach((d) => {
    total++;
    if (d.status === 'changed') changed++;
    if (d.status === 'added') added++;
    if (d.status === 'removed') removed++;
  });

  experience.items.forEach((item) => { total++; if (item.status === 'changed') changed++; if (item.status === 'added') added++; if (item.status === 'removed') removed++; });
  education.items.forEach((item) => { total++; if (item.status === 'changed') changed++; if (item.status === 'added') added++; if (item.status === 'removed') removed++; });

  const skillsWithDiff = skills.filter((s) => !s.present.every((p) => p === s.present[0]));
  total += skills.length;
  changed += skillsWithDiff.length;

  return { contact, summary, experience, education, skills, styling, stats: { total, changed, added, removed } };
}
