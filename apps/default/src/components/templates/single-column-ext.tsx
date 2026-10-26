import type { ResumeData } from '@/stores/resume-store';
import { getBaseFontSize, getFont, ContactLine, ExperienceBlock, EducationBlock, SkillPills, RESUME_TEXT_COLOR } from './shared';
import { makeSectionStyle, Sections } from './single-column';

interface Props { resume: ResumeData }

function Body({ resume, children, p }: Props & { children: React.ReactNode; p?: string }) {
  return <div style={{ padding: p || '24px 44px 36px', fontFamily: getFont(resume), color: RESUME_TEXT_COLOR, fontSize: `${getBaseFontSize(resume.fontSize)}px`, lineHeight: '1.5' }}>{children}</div>;
}

export function CorporateTemplate({ resume }: Props) {
  const a = resume.accentColor, bfs = getBaseFontSize(resume.fontSize);
  return (<div style={{ fontFamily: getFont(resume) }}><div style={{ borderTop: `6px solid ${a}`, padding: '28px 44px 20px' }}><h1 style={{ fontSize: '26px', fontWeight: 700, color: RESUME_TEXT_COLOR, margin: 0 }}>{resume.contact.fullName || 'Your Name'}</h1><div style={{ marginTop: '6px' }}><ContactLine resume={resume} separator="|" /></div></div><Body resume={resume} p="8px 44px 36px"><Sections resume={resume} sectionStyle={makeSectionStyle(a, 'underline', bfs)} /></Body></div>);
}

export function BankingTemplate({ resume }: Props) {
  const bfs = getBaseFontSize(resume.fontSize), a = resume.accentColor;
  return (<div style={{ fontFamily: "'Georgia', serif", padding: '36px 44px' }}><div style={{ borderBottom: `2px solid ${a}`, paddingBottom: '12px' }}><h1 style={{ fontSize: '24px', fontWeight: 700, color: a, margin: 0 }}>{resume.contact.fullName || 'Your Name'}</h1><div style={{ marginTop: '6px' }}><ContactLine resume={resume} separator="|" /></div></div><Sections resume={resume} sectionStyle={{ ...makeSectionStyle(a, 'underline', bfs), color: a }} /></div>);
}

export function LegalTemplate({ resume }: Props) {
  const bfs = getBaseFontSize(resume.fontSize), a = resume.accentColor;
  return (<div style={{ fontFamily: "'Times New Roman', serif", padding: '36px 48px' }}><h1 style={{ fontSize: '22px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', color: a, margin: 0 }}>{resume.contact.fullName || 'Your Name'}</h1><div style={{ marginTop: '6px' }}><ContactLine resume={resume} separator="•" /></div><Sections resume={resume} sectionStyle={makeSectionStyle(a, 'thin', bfs)} /></div>);
}

export function ConsultingTemplate({ resume }: Props) {
  const a = resume.accentColor, bfs = getBaseFontSize(resume.fontSize);
  return (<div style={{ fontFamily: getFont(resume), padding: '36px 44px' }}><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: `2px solid ${a}`, paddingBottom: '10px', flexWrap: 'wrap', gap: '8px' }}><h1 style={{ fontSize: '24px', fontWeight: 700, color: RESUME_TEXT_COLOR, margin: 0 }}>{resume.contact.fullName || 'Your Name'}</h1><ContactLine resume={resume} separator="|" /></div><Sections resume={resume} sectionStyle={makeSectionStyle(a, 'bg', bfs)} /></div>);
}

export function DeveloperTemplate({ resume }: Props) {
  const a = resume.accentColor, bfs = getBaseFontSize(resume.fontSize);
  return (<div style={{ fontFamily: getFont(resume) }}><div style={{ backgroundColor: '#0f172a', color: '#fff', padding: '28px 44px 20px' }}><h1 style={{ fontSize: '26px', fontWeight: 700, margin: 0, fontFamily: "'SF Mono', Consolas, monospace" }}>{resume.contact.fullName || 'Your Name'}</h1><div style={{ marginTop: '6px' }}><ContactLine resume={resume} color={a} separator="//" /></div></div><Body resume={resume}><Sections resume={resume} sectionStyle={{ ...makeSectionStyle(a, 'side', bfs), fontFamily: "'SF Mono', monospace" }} /></Body></div>);
}

export function TerminalTemplate({ resume }: Props) {
  const a = resume.accentColor, bfs = getBaseFontSize(resume.fontSize);
  const items = [resume.contact.email, resume.contact.phone, resume.contact.location].filter(Boolean);
  return (<div style={{ fontFamily: "'Courier New', Consolas, monospace", backgroundColor: '#0a0a0a', color: a, padding: '32px 40px', minHeight: '100%' }}>
    <div style={{ borderBottom: `1px solid ${a}40`, paddingBottom: '12px' }}><span style={{ color: '#666' }}>$ whoami</span><h1 style={{ fontSize: '24px', fontWeight: 700, margin: '4px 0 0', color: a }}>{resume.contact.fullName || 'user'}</h1><div style={{ marginTop: '4px', fontSize: `${bfs - 1}px`, color: `${a}99` }}>{items.join(' | ')}</div></div>
    {resume.summary && <><p style={{ color: '#666', marginTop: '14px' }}>$ cat summary.txt</p><p style={{ color: '#ccc', fontSize: `${bfs}px`, lineHeight: '1.6' }}>{resume.summary}</p></>}
    {resume.experience.length > 0 && <><p style={{ color: '#666', marginTop: '14px' }}>$ ls experience/</p>{resume.experience.map(e => <div key={e.id} style={{ marginBottom: '10px' }}><p style={{ color: a, fontWeight: 700, fontSize: `${bfs + 1}px` }}>{e.title} @ {e.company}</p>{e.startDate && <p style={{ fontSize: `${bfs - 1}px`, color: '#666' }}>{e.startDate} – {e.endDate}</p>}{e.bullets.map((b, i) => <p key={i} style={{ fontSize: `${bfs}px`, color: '#bbb', paddingLeft: '12px' }}>&gt; {b}</p>)}</div>)}</>}
    {resume.skills.length > 0 && <><p style={{ color: '#666', marginTop: '14px' }}>$ echo $SKILLS</p><p style={{ color: a, fontSize: `${bfs}px` }}>{resume.skills.join(', ')}</p></>}
    {resume.education.length > 0 && <><p style={{ color: '#666', marginTop: '14px' }}>$ cat education.log</p>{resume.education.map(e => <p key={e.id} style={{ color: '#bbb', fontSize: `${bfs}px` }}>{e.degree} — {e.school} ({e.graduationYear})</p>)}</>}
  </div>);
}

export function StartupTemplate({ resume }: Props) {
  const a = resume.accentColor, bfs = getBaseFontSize(resume.fontSize);
  return (<div style={{ fontFamily: getFont(resume) }}><div style={{ background: `linear-gradient(135deg, ${a}, ${a}cc)`, color: '#fff', padding: '28px 44px 22px', borderRadius: '0 0 20px 20px' }}><h1 style={{ fontSize: '26px', fontWeight: 800, margin: 0 }}>{resume.contact.fullName || 'Your Name'}</h1><div style={{ marginTop: '6px', opacity: 0.85 }}><ContactLine resume={resume} color="rgba(255,255,255,0.8)" separator="•" /></div></div><Body resume={resume}><Sections resume={resume} sectionStyle={makeSectionStyle(a, 'bg', bfs)} /></Body></div>);
}

export function AcademicTemplate({ resume }: Props) {
  const a = resume.accentColor, bfs = getBaseFontSize(resume.fontSize);
  return (<div style={{ fontFamily: "'Georgia', serif", padding: '36px 44px' }}><h1 style={{ fontSize: '24px', fontWeight: 700, color: RESUME_TEXT_COLOR, margin: 0 }}>{resume.contact.fullName || 'Your Name'}</h1><div style={{ marginTop: '6px' }}><ContactLine resume={resume} separator="•" /></div><Sections resume={resume} sectionStyle={makeSectionStyle(a, 'thin', bfs)} /></div>);
}

export function ResearchTemplate({ resume }: Props) {
  const a = resume.accentColor, bfs = getBaseFontSize(resume.fontSize);
  return (<div style={{ fontFamily: "'Palatino Linotype', serif", padding: '36px 44px' }}><div style={{ textAlign: 'center', marginBottom: '6px' }}><h1 style={{ fontSize: '22px', fontWeight: 700, color: a, margin: 0 }}>{resume.contact.fullName || 'Your Name'}</h1><div style={{ display: 'flex', justifyContent: 'center', marginTop: '6px' }}><ContactLine resume={resume} separator="·" /></div></div><Sections resume={resume} sectionStyle={makeSectionStyle(a, 'underline', bfs)} /></div>);
}

export function ScholarlyTemplate({ resume }: Props) {
  const a = resume.accentColor, bfs = getBaseFontSize(resume.fontSize);
  return (<div style={{ fontFamily: "'Georgia', Cambria, serif", padding: '40px 50px' }}><h1 style={{ fontSize: '20px', fontWeight: 400, letterSpacing: '3px', textTransform: 'uppercase', color: RESUME_TEXT_COLOR, margin: 0 }}>{resume.contact.fullName || 'Your Name'}</h1><div style={{ borderTop: '1px solid #ccc', borderBottom: '1px solid #ccc', padding: '4px 0', marginTop: '8px' }}><ContactLine resume={resume} separator="•" /></div><Sections resume={resume} sectionStyle={makeSectionStyle(a, 'none', bfs)} /></div>);
}

export function SerifTemplate({ resume }: Props) {
  const a = resume.accentColor, bfs = getBaseFontSize(resume.fontSize);
  return (<div style={{ fontFamily: "'Georgia', serif", padding: '40px 48px' }}><h1 style={{ fontSize: '28px', fontWeight: 400, color: a, margin: 0, fontStyle: 'italic' }}>{resume.contact.fullName || 'Your Name'}</h1><div style={{ marginTop: '6px' }}><ContactLine resume={resume} separator="·" /></div><Sections resume={resume} sectionStyle={{ ...makeSectionStyle(a, 'thin', bfs), fontFamily: "'Georgia', serif" }} /></div>);
}

export function EditorialTemplate({ resume }: Props) {
  const a = resume.accentColor, bfs = getBaseFontSize(resume.fontSize);
  return (<div style={{ fontFamily: getFont(resume) }}><div style={{ backgroundColor: '#0f172a', color: '#fff', padding: '40px 44px 30px' }}><h1 style={{ fontSize: '36px', fontWeight: 800, margin: 0, lineHeight: 1 }}>{resume.contact.fullName || 'Your Name'}</h1>{resume.summary && <p style={{ marginTop: '14px', fontSize: `${bfs + 1}px`, fontStyle: 'italic', opacity: 0.8, lineHeight: '1.6', borderLeft: '3px solid rgba(255,255,255,0.3)', paddingLeft: '12px' }}>{resume.summary}</p>}</div><Body resume={resume}><ContactLine resume={resume} separator="|" />{resume.experience.length > 0 && <><h2 style={makeSectionStyle(a, 'thick', bfs)}>Experience</h2>{resume.experience.map(e => <ExperienceBlock key={e.id} exp={e} accent={a} baseFontSize={bfs} />)}</>}{resume.education.length > 0 && <><h2 style={makeSectionStyle(a, 'thick', bfs)}>Education</h2>{resume.education.map(e => <EducationBlock key={e.id} edu={e} baseFontSize={bfs} />)}</>}{resume.skills.length > 0 && <><h2 style={makeSectionStyle(a, 'thick', bfs)}>Skills</h2><SkillPills skills={resume.skills} accent={a} baseFontSize={bfs} /></>}</Body></div>);
}

export function LuxeTemplate({ resume }: Props) {
  const a = resume.accentColor, bfs = getBaseFontSize(resume.fontSize);
  return (<div style={{ fontFamily: "'Georgia', serif" }}><div style={{ backgroundColor: '#0f172a', color: '#fff', padding: '32px 44px 24px', borderBottom: `3px solid ${a}` }}><h1 style={{ fontSize: '26px', fontWeight: 400, letterSpacing: '4px', textTransform: 'uppercase', margin: 0 }}>{resume.contact.fullName || 'Your Name'}</h1><div style={{ marginTop: '8px' }}><ContactLine resume={resume} color={a} separator="✦" /></div></div><div style={{ padding: '24px 44px 36px' }}><Sections resume={resume} sectionStyle={{ ...makeSectionStyle(a, 'underline', bfs), color: a }} /></div></div>);
}
