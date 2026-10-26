import type { ResumeData } from '@/stores/resume-store';
import { getBaseFontSize, getFont, ContactLine, ExperienceBlock, EducationBlock, SkillPills, SkillsInline, RESUME_TEXT_COLOR } from './shared';
import type { CSSProperties } from 'react';

interface Props { resume: ResumeData }

export function makeSectionStyle(accent: string, variant: 'underline' | 'bg' | 'side' | 'dot' | 'thin' | 'thick' | 'none', fontSize: number): CSSProperties {
  const base: CSSProperties = { fontSize: `${fontSize + 2}px`, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.2px', marginTop: '16px', marginBottom: '8px', color: RESUME_TEXT_COLOR };
  if (variant === 'underline') return { ...base, borderBottom: `2px solid ${accent}`, paddingBottom: '3px' };
  if (variant === 'bg') return { ...base, backgroundColor: `${accent}12`, padding: '4px 8px', borderLeft: `3px solid ${accent}`, color: accent };
  if (variant === 'side') return { ...base, borderLeft: `4px solid ${accent}`, paddingLeft: '10px', color: accent };
  if (variant === 'thin') return { ...base, borderBottom: `1px solid #ddd`, paddingBottom: '3px' };
  if (variant === 'thick') return { ...base, borderBottom: `4px solid ${accent}`, paddingBottom: '3px' };
  return { ...base };
}

export function Sections({ resume, sectionStyle }: Props & { sectionStyle: CSSProperties }) {
  const bfs = getBaseFontSize(resume.fontSize);
  const a = resume.accentColor;
  return (<>
    {resume.summary && <div><h2 style={sectionStyle}>Professional Summary</h2><p style={{ fontSize: `${bfs}px`, color: RESUME_TEXT_COLOR, lineHeight: '1.6' }}>{resume.summary}</p></div>}
    {resume.experience.length > 0 && <div><h2 style={sectionStyle}>Work Experience</h2>{resume.experience.map(e => <ExperienceBlock key={e.id} exp={e} accent={a} baseFontSize={bfs} />)}</div>}
    {resume.education.length > 0 && <div><h2 style={sectionStyle}>Education</h2>{resume.education.map(e => <EducationBlock key={e.id} edu={e} baseFontSize={bfs} />)}</div>}
    {resume.skills.length > 0 && <div><h2 style={sectionStyle}>Skills</h2><SkillPills skills={resume.skills} accent={a} baseFontSize={bfs} /></div>}
  </>);
}

function Body({ resume, children, p }: Props & { children: React.ReactNode; p?: string }) {
  return <div style={{ padding: p || '24px 44px 36px', fontFamily: getFont(resume), color: RESUME_TEXT_COLOR, fontSize: `${getBaseFontSize(resume.fontSize)}px`, lineHeight: '1.5' }}>{children}</div>;
}

export function ModernTemplate({ resume }: Props) {
  const a = resume.accentColor, bfs = getBaseFontSize(resume.fontSize);
  return (<div style={{ fontFamily: getFont(resume) }}><div style={{ backgroundColor: a, color: '#fff', padding: '30px 44px 22px' }}><h1 style={{ fontSize: '28px', fontWeight: 700, letterSpacing: '-0.5px', margin: 0 }}>{resume.contact.fullName || 'Your Name'}</h1><div style={{ marginTop: '6px' }}><ContactLine resume={resume} color="rgba(255,255,255,0.85)" separator="•" /></div></div><Body resume={resume}><Sections resume={resume} sectionStyle={makeSectionStyle(a, 'underline', bfs)} /></Body></div>);
}

export function ClassicTemplate({ resume }: Props) {
  const a = resume.accentColor, bfs = getBaseFontSize(resume.fontSize);
  return (<div style={{ fontFamily: getFont(resume), padding: '36px 44px' }}><div style={{ textAlign: 'center', marginBottom: '6px' }}><h1 style={{ fontSize: '26px', fontWeight: 700, color: a, margin: 0 }}>{resume.contact.fullName || 'Your Name'}</h1><div style={{ display: 'flex', justifyContent: 'center', marginTop: '6px' }}><ContactLine resume={resume} separator="|" /></div></div><Sections resume={resume} sectionStyle={makeSectionStyle(a, 'thin', bfs)} /></div>);
}

export function MinimalTemplate({ resume }: Props) {
  const a = resume.accentColor, bfs = getBaseFontSize(resume.fontSize);
  return (<div style={{ fontFamily: getFont(resume), padding: '40px 48px' }}><h1 style={{ fontSize: '22px', fontWeight: 400, letterSpacing: '3px', textTransform: 'uppercase', color: RESUME_TEXT_COLOR, margin: 0 }}>{resume.contact.fullName || 'Your Name'}</h1><div style={{ marginTop: '6px' }}><ContactLine resume={resume} separator="•" /></div>{resume.summary && <><h2 style={makeSectionStyle(a, 'none', bfs)}>Summary</h2><p style={{ fontSize: `${bfs}px`, color: RESUME_TEXT_COLOR, lineHeight: '1.7' }}>{resume.summary}</p></>}{resume.experience.length > 0 && <><h2 style={makeSectionStyle(a, 'none', bfs)}>Experience</h2>{resume.experience.map(e => <ExperienceBlock key={e.id} exp={e} accent={a} baseFontSize={bfs} />)}</>}{resume.education.length > 0 && <><h2 style={makeSectionStyle(a, 'none', bfs)}>Education</h2>{resume.education.map(e => <EducationBlock key={e.id} edu={e} baseFontSize={bfs} />)}</>}{resume.skills.length > 0 && <><h2 style={makeSectionStyle(a, 'none', bfs)}>Skills</h2><SkillsInline skills={resume.skills} baseFontSize={bfs} /></>}</div>);
}

export function ExecutiveTemplate({ resume }: Props) {
  const a = resume.accentColor, bfs = getBaseFontSize(resume.fontSize);
  return (<div style={{ fontFamily: getFont(resume), padding: '36px 44px' }}><div style={{ borderBottom: `3px solid ${a}`, paddingBottom: '12px', marginBottom: '4px' }}><h1 style={{ fontSize: '30px', fontWeight: 800, color: a, margin: 0 }}>{resume.contact.fullName || 'Your Name'}</h1><div style={{ marginTop: '6px' }}><ContactLine resume={resume} separator="|" /></div></div><Sections resume={resume} sectionStyle={makeSectionStyle(a, 'side', bfs)} /></div>);
}

export function BoldTemplate({ resume }: Props) {
  const a = resume.accentColor, bfs = getBaseFontSize(resume.fontSize);
  return (<div style={{ fontFamily: getFont(resume), padding: '36px 44px' }}><h1 style={{ fontSize: '42px', fontWeight: 900, color: a, margin: 0, lineHeight: 1.1, letterSpacing: '-1px' }}>{resume.contact.fullName || 'YOUR NAME'}</h1><div style={{ height: '4px', backgroundColor: a, marginTop: '10px', marginBottom: '6px', width: '80px' }} /><ContactLine resume={resume} separator="•" /><Sections resume={resume} sectionStyle={makeSectionStyle(a, 'thick', bfs)} /></div>);
}

export function GradientTemplate({ resume }: Props) {
  const a = resume.accentColor, bfs = getBaseFontSize(resume.fontSize);
  return (<div style={{ fontFamily: getFont(resume) }}><div style={{ background: `linear-gradient(135deg, ${a}, ${a}aa)`, color: '#fff', padding: '36px 44px 28px' }}><h1 style={{ fontSize: '28px', fontWeight: 700, margin: 0 }}>{resume.contact.fullName || 'Your Name'}</h1><div style={{ marginTop: '8px', opacity: 0.9 }}><ContactLine resume={resume} color="rgba(255,255,255,0.85)" separator="•" /></div>{resume.summary && <p style={{ marginTop: '12px', fontSize: `${bfs}px`, opacity: 0.9, lineHeight: '1.6' }}>{resume.summary}</p>}</div><Body resume={resume}>{resume.experience.length > 0 && <><h2 style={makeSectionStyle(a, 'bg', bfs)}>Experience</h2>{resume.experience.map(e => <ExperienceBlock key={e.id} exp={e} accent={a} baseFontSize={bfs} />)}</>}{resume.education.length > 0 && <><h2 style={makeSectionStyle(a, 'bg', bfs)}>Education</h2>{resume.education.map(e => <EducationBlock key={e.id} edu={e} baseFontSize={bfs} />)}</>}{resume.skills.length > 0 && <><h2 style={makeSectionStyle(a, 'bg', bfs)}>Skills</h2><SkillPills skills={resume.skills} accent={a} baseFontSize={bfs} /></>}</Body></div>);
}

export function InkTemplate({ resume }: Props) {
  const a = resume.accentColor, bfs = getBaseFontSize(resume.fontSize);
  return (<div style={{ fontFamily: getFont(resume) }}><div style={{ backgroundColor: '#0f172a', color: '#fff', padding: '36px 44px 26px' }}><h1 style={{ fontSize: '30px', fontWeight: 300, letterSpacing: '4px', textTransform: 'uppercase', margin: 0 }}>{resume.contact.fullName || 'Your Name'}</h1><div style={{ marginTop: '8px' }}><ContactLine resume={resume} color="rgba(255,255,255,0.6)" separator="/" /></div></div><Body resume={resume}><Sections resume={resume} sectionStyle={makeSectionStyle(a, 'underline', bfs)} /></Body></div>);
}

export function NeonTemplate({ resume }: Props) {
  const a = resume.accentColor, bfs = getBaseFontSize(resume.fontSize);
  return (<div style={{ fontFamily: getFont(resume), padding: '36px 44px', borderTop: `4px solid ${a}` }}><h1 style={{ fontSize: '28px', fontWeight: 800, color: RESUME_TEXT_COLOR, margin: 0 }}>{resume.contact.fullName || 'Your Name'}</h1><div style={{ height: '2px', background: `linear-gradient(90deg, ${a}, transparent)`, marginTop: '8px', marginBottom: '4px' }} /><ContactLine resume={resume} color={a} separator="•" /><Sections resume={resume} sectionStyle={{ ...makeSectionStyle(a, 'side', bfs), borderLeftColor: a, color: a }} /></div>);
}
