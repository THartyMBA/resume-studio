import type { ResumeData, ResumeExperience, ResumeEducation } from '@/stores/resume-store';
import { getFontCSS } from '@/lib/template-registry';
import type { CSSProperties } from 'react';

export const RESUME_TEXT_COLOR = 'var(--resume-text-color, #374151)';

export function getTextColor(resume: ResumeData) {
  return /^#[0-9a-fA-F]{6}$/.test(resume.textColor || '') ? resume.textColor : '#374151';
}

export function getBaseFontSize(size: 'sm' | 'md' | 'lg') {
  return size === 'sm' ? 10 : size === 'lg' ? 12 : 11;
}

export function getFont(resume: ResumeData) {
  return getFontCSS(resume.fontFamily);
}

export function ContactLine({ resume, color, separator = '|' }: { resume: ResumeData; color?: string; separator?: string }) {
  const items = [
    resume.contact.location,
    resume.contact.phone,
    resume.contact.email,
    resume.contact.linkedin,
    resume.contact.portfolio,
  ].filter(Boolean);
  return (
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', fontSize: `${getBaseFontSize(resume.fontSize) - 1}px`, color: color || RESUME_TEXT_COLOR }}>
      {items.map((item, i) => (
        <span key={i}>{i > 0 ? ` ${separator} ` : ''}{item}</span>
      ))}
    </div>
  );
}

export function ContactStack({ resume, color }: { resume: ResumeData; color?: string }) {
  const items = [
    resume.contact.email,
    resume.contact.phone,
    resume.contact.location,
    resume.contact.linkedin,
    resume.contact.portfolio,
  ].filter(Boolean);
  const sz = getBaseFontSize(resume.fontSize) - 1;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', fontSize: `${sz}px`, color: color || RESUME_TEXT_COLOR }}>
      {items.map((item, i) => <span key={i}>{item}</span>)}
    </div>
  );
}

export function SectionHeader({ title, style }: { title: string; style: CSSProperties }) {
  return <h2 style={style}>{title}</h2>;
}

export function ExperienceBlock({ exp, accent, baseFontSize }: { exp: ResumeExperience; accent: string; baseFontSize: number }) {
  return (
    <div style={{ marginBottom: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap' }}>
        <div>
          <strong style={{ fontSize: `${baseFontSize + 1}px` }}>{exp.title}</strong>
          {exp.company && <span style={{ color: accent, fontWeight: 600 }}> | {exp.company}</span>}
          {exp.location && <span style={{ color: RESUME_TEXT_COLOR }}> — {exp.location}</span>}
        </div>
        {(exp.startDate || exp.endDate) && (
          <span style={{ fontSize: `${baseFontSize - 1}px`, color: RESUME_TEXT_COLOR, whiteSpace: 'nowrap' }}>
            {exp.startDate} – {exp.endDate}
          </span>
        )}
      </div>
      <ul style={{ paddingLeft: '16px', marginTop: '3px', listStyleType: 'disc' }}>
        {exp.bullets.map((b, i) => (
          <li key={i} style={{ fontSize: `${baseFontSize}px`, color: RESUME_TEXT_COLOR, marginBottom: '1px', lineHeight: '1.5' }}>{b}</li>
        ))}
      </ul>
    </div>
  );
}

export function EducationBlock({ edu, baseFontSize }: { edu: ResumeEducation; baseFontSize: number }) {
  return (
    <div style={{ marginBottom: '6px' }}>
      <strong style={{ fontSize: `${baseFontSize + 1}px` }}>{edu.degree}</strong>
      {edu.school && <span style={{ color: RESUME_TEXT_COLOR }}> | {edu.school}</span>}
      {edu.graduationYear && <span style={{ color: RESUME_TEXT_COLOR }}> | {edu.graduationYear}</span>}
      {edu.details && <p style={{ fontSize: `${baseFontSize - 1}px`, color: RESUME_TEXT_COLOR, marginTop: '1px' }}>{edu.details}</p>}
    </div>
  );
}

export function SkillPills({ skills, accent, baseFontSize }: { skills: string[]; accent: string; baseFontSize: number }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
      {skills.map((s, i) => (
        <span key={i} style={{
          padding: '2px 8px', borderRadius: '4px', fontSize: `${baseFontSize - 1}px`,
          backgroundColor: `${accent}15`, color: accent, border: `1px solid ${accent}30`,
        }}>{s}</span>
      ))}
    </div>
  );
}

export function SkillsInline({ skills, baseFontSize, color }: { skills: string[]; baseFontSize: number; color?: string }) {
  return (
    <p style={{ fontSize: `${baseFontSize}px`, color: color || RESUME_TEXT_COLOR, lineHeight: '1.6' }}>
      {skills.join(' • ')}
    </p>
  );
}

export function SkillBars({ skills, accent, baseFontSize }: { skills: string[]; accent: string; baseFontSize: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      {skills.map((s, i) => (
        <div key={i} style={{ fontSize: `${baseFontSize - 1}px`, color: '#fff' }}>
          <span>{s}</span>
          <div style={{ height: '3px', backgroundColor: `${accent}40`, borderRadius: '2px', marginTop: '2px' }}>
            <div style={{ height: '100%', width: `${75 + Math.random() * 25}%`, backgroundColor: accent, borderRadius: '2px' }} />
          </div>
        </div>
      ))}
    </div>
  );
}
