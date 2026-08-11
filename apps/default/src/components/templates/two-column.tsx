import type { ResumeData } from '@/stores/resume-store';
import { getBaseFontSize, getFont, ContactStack, ExperienceBlock, EducationBlock, SkillsInline } from './shared';
import { makeSectionStyle } from './single-column';
interface Props { resume: ResumeData }

export function SplitTemplate({ resume }: Props) {
  const a = resume.accentColor, bfs = getBaseFontSize(resume.fontSize);
  return (<div style={{ display: 'flex', fontFamily: getFont(resume), minHeight: '100%' }}>
    <div style={{ width: '38%', backgroundColor: a, color: '#fff', padding: '32px 24px' }}>
      <h1 style={{ fontSize: '22px', fontWeight: 700, margin: 0, lineHeight: 1.2 }}>{resume.contact.fullName || 'Your Name'}</h1>
      <div style={{ marginTop: '14px' }}><ContactStack resume={resume} color="rgba(255,255,255,0.75)" /></div>
      {resume.skills.length > 0 && <><h2 style={{ fontSize: `${bfs+1}px`, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', marginTop: '24px', marginBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.3)', paddingBottom: '4px', color: '#fff' }}>Skills</h2><div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>{resume.skills.map((s,i) => <span key={i} style={{ fontSize: `${bfs}px`, opacity: 0.9 }}>• {s}</span>)}</div></>}
      {resume.education.length > 0 && <><h2 style={{ fontSize: `${bfs+1}px`, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', marginTop: '24px', marginBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.3)', paddingBottom: '4px', color: '#fff' }}>Education</h2>{resume.education.map(e => <div key={e.id} style={{ marginBottom: '8px' }}><strong style={{ fontSize: `${bfs}px` }}>{e.degree}</strong>{e.school && <p style={{ fontSize: `${bfs-1}px`, opacity: 0.75 }}>{e.school}</p>}{e.graduationYear && <p style={{ fontSize: `${bfs-1}px`, opacity: 0.6 }}>{e.graduationYear}</p>}</div>)}</>}
    </div>
    <div style={{ flex: 1, padding: '32px 28px', fontSize: `${bfs}px`, color: '#1a1a1a', lineHeight: '1.5' }}>
      {resume.summary && <><h2 style={makeSectionStyle(a, 'underline', bfs)}>Summary</h2><p style={{ color: '#444', lineHeight: '1.6' }}>{resume.summary}</p></>}
      {resume.experience.length > 0 && <><h2 style={makeSectionStyle(a, 'underline', bfs)}>Experience</h2>{resume.experience.map(e => <ExperienceBlock key={e.id} exp={e} accent={a} baseFontSize={bfs} />)}</>}
    </div></div>);
}

export function SidebarLeftTemplate({ resume }: Props) {
  const a = resume.accentColor, bfs = getBaseFontSize(resume.fontSize);
  return (<div style={{ display: 'flex', fontFamily: getFont(resume), minHeight: '100%' }}>
    <div style={{ width: '32%', backgroundColor: '#1e293b', color: '#e2e8f0', padding: '28px 20px' }}>
      <h1 style={{ fontSize: '20px', fontWeight: 700, margin: 0, color: '#fff' }}>{resume.contact.fullName || 'Your Name'}</h1>
      <div style={{ marginTop: '12px' }}><ContactStack resume={resume} color="#94a3b8" /></div>
      {resume.skills.length > 0 && <><h2 style={{ fontSize: `${bfs}px`, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', marginTop: '20px', marginBottom: '6px', color: a }}>Skills</h2><div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>{resume.skills.map((s,i) => <span key={i} style={{ fontSize: `${bfs-1}px`, color: '#cbd5e1' }}>▸ {s}</span>)}</div></>}
      {resume.education.length > 0 && <><h2 style={{ fontSize: `${bfs}px`, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', marginTop: '20px', marginBottom: '6px', color: a }}>Education</h2>{resume.education.map(e => <div key={e.id} style={{ marginBottom: '6px' }}><p style={{ fontSize: `${bfs}px`, fontWeight: 600, color: '#fff' }}>{e.degree}</p><p style={{ fontSize: `${bfs-1}px`, color: '#94a3b8' }}>{e.school}</p></div>)}</>}
    </div>
    <div style={{ flex: 1, padding: '28px 28px', fontSize: `${bfs}px`, color: '#1a1a1a', lineHeight: '1.5' }}>
      {resume.summary && <><h2 style={makeSectionStyle(a, 'side', bfs)}>Summary</h2><p style={{ color: '#444', lineHeight: '1.6' }}>{resume.summary}</p></>}
      {resume.experience.length > 0 && <><h2 style={makeSectionStyle(a, 'side', bfs)}>Experience</h2>{resume.experience.map(e => <ExperienceBlock key={e.id} exp={e} accent={a} baseFontSize={bfs} />)}</>}
    </div></div>);
}

export function SidebarRightTemplate({ resume }: Props) {
  const a = resume.accentColor, bfs = getBaseFontSize(resume.fontSize);
  return (<div style={{ display: 'flex', fontFamily: getFont(resume), minHeight: '100%' }}>
    <div style={{ flex: 1, padding: '32px 28px', fontSize: `${bfs}px`, color: '#1a1a1a', lineHeight: '1.5' }}>
      <h1 style={{ fontSize: '26px', fontWeight: 700, color: a, margin: 0 }}>{resume.contact.fullName || 'Your Name'}</h1>
      {resume.summary && <><h2 style={makeSectionStyle(a, 'underline', bfs)}>Summary</h2><p style={{ color: '#444', lineHeight: '1.6' }}>{resume.summary}</p></>}
      {resume.experience.length > 0 && <><h2 style={makeSectionStyle(a, 'underline', bfs)}>Experience</h2>{resume.experience.map(e => <ExperienceBlock key={e.id} exp={e} accent={a} baseFontSize={bfs} />)}</>}
    </div>
    <div style={{ width: '30%', backgroundColor: '#f1f5f9', padding: '32px 20px', borderLeft: `3px solid ${a}` }}>
      <ContactStack resume={resume} color="#475569" />
      {resume.skills.length > 0 && <><h2 style={{ fontSize: `${bfs}px`, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginTop: '20px', marginBottom: '6px', color: a }}>Skills</h2><div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>{resume.skills.map((s,i) => <span key={i} style={{ fontSize: `${bfs-1}px`, padding: '1px 6px', backgroundColor: `${a}15`, color: a, borderRadius: '3px' }}>{s}</span>)}</div></>}
      {resume.education.length > 0 && <><h2 style={{ fontSize: `${bfs}px`, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginTop: '20px', marginBottom: '6px', color: a }}>Education</h2>{resume.education.map(e => <div key={e.id} style={{ marginBottom: '6px' }}><p style={{ fontSize: `${bfs}px`, fontWeight: 600 }}>{e.degree}</p><p style={{ fontSize: `${bfs-1}px`, color: '#666' }}>{e.school}</p></div>)}</>}
    </div></div>);
}

export function MetroTemplate({ resume }: Props) {
  const a = resume.accentColor, bfs = getBaseFontSize(resume.fontSize);
  return (<div style={{ fontFamily: getFont(resume), minHeight: '100%' }}>
    <div style={{ backgroundColor: a, color: '#fff', padding: '24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 800, margin: 0 }}>{resume.contact.fullName || 'Your Name'}</h1>
      <div style={{ fontSize: `${bfs-1}px`, opacity: 0.85 }}>{[resume.contact.email, resume.contact.phone].filter(Boolean).join(' • ')}</div>
    </div>
    <div style={{ display: 'flex' }}>
      <div style={{ width: '35%', backgroundColor: `${a}08`, padding: '20px', borderRight: `2px solid ${a}22` }}>
        <ContactStack resume={resume} />
        {resume.skills.length > 0 && <><h2 style={{ fontSize: `${bfs}px`, fontWeight: 700, color: a, textTransform: 'uppercase', letterSpacing: '1px', marginTop: '18px', marginBottom: '6px' }}>Skills</h2><div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>{resume.skills.map((s,i) => <span key={i} style={{ fontSize: `${bfs-1}px`, backgroundColor: `${a}18`, color: a, padding: '2px 8px', borderRadius: '4px', border: `1px solid ${a}30` }}>{s}</span>)}</div></>}
        {resume.education.length > 0 && <><h2 style={{ fontSize: `${bfs}px`, fontWeight: 700, color: a, textTransform: 'uppercase', letterSpacing: '1px', marginTop: '18px', marginBottom: '6px' }}>Education</h2>{resume.education.map(e => <EducationBlock key={e.id} edu={e} baseFontSize={bfs} />)}</>}
      </div>
      <div style={{ flex: 1, padding: '20px 24px', fontSize: `${bfs}px`, color: '#1a1a1a', lineHeight: '1.5' }}>
        {resume.summary && <><h2 style={makeSectionStyle(a, 'bg', bfs)}>Summary</h2><p style={{ color: '#444', lineHeight: '1.6' }}>{resume.summary}</p></>}
        {resume.experience.length > 0 && <><h2 style={makeSectionStyle(a, 'bg', bfs)}>Experience</h2>{resume.experience.map(e => <ExperienceBlock key={e.id} exp={e} accent={a} baseFontSize={bfs} />)}</>}
      </div>
    </div></div>);
}

export function BlueprintTemplate({ resume }: Props) {
  const a = resume.accentColor, bfs = getBaseFontSize(resume.fontSize);
  return (<div style={{ fontFamily: getFont(resume), backgroundColor: '#f8faff', minHeight: '100%', border: `1px solid ${a}30` }}>
    <div style={{ backgroundColor: '#eff6ff', padding: '24px 32px', borderBottom: `2px solid ${a}` }}>
      <h1 style={{ fontSize: '22px', fontWeight: 700, color: a, margin: 0, fontFamily: "'SF Mono', monospace" }}>{resume.contact.fullName || 'Your Name'}</h1>
      <div style={{ marginTop: '4px', fontSize: `${bfs-1}px`, color: '#64748b' }}>{[resume.contact.email, resume.contact.phone, resume.contact.location].filter(Boolean).join(' | ')}</div>
    </div>
    <div style={{ display: 'flex' }}>
      <div style={{ width: '35%', padding: '20px', borderRight: `1px dashed ${a}40` }}>
        {resume.skills.length > 0 && <><h2 style={{ fontSize: `${bfs}px`, fontWeight: 700, color: a, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>Tech Stack</h2><div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>{resume.skills.map((s,i) => <span key={i} style={{ fontSize: `${bfs-1}px`, color: '#334155', fontFamily: "'SF Mono', monospace" }}>+ {s}</span>)}</div></>}
        {resume.education.length > 0 && <><h2 style={{ fontSize: `${bfs}px`, fontWeight: 700, color: a, textTransform: 'uppercase', letterSpacing: '1px', marginTop: '18px', marginBottom: '6px' }}>Education</h2>{resume.education.map(e => <EducationBlock key={e.id} edu={e} baseFontSize={bfs} />)}</>}
      </div>
      <div style={{ flex: 1, padding: '20px 24px', fontSize: `${bfs}px`, color: '#1a1a1a', lineHeight: '1.5' }}>
        {resume.summary && <><h2 style={makeSectionStyle(a, 'side', bfs)}>Summary</h2><p style={{ color: '#444', lineHeight: '1.6' }}>{resume.summary}</p></>}
        {resume.experience.length > 0 && <><h2 style={makeSectionStyle(a, 'side', bfs)}>Experience</h2>{resume.experience.map(e => <ExperienceBlock key={e.id} exp={e} accent={a} baseFontSize={bfs} />)}</>}
      </div>
    </div></div>);
}

export function MagazineTemplate({ resume }: Props) {
  const a = resume.accentColor, bfs = getBaseFontSize(resume.fontSize);
  return (<div style={{ fontFamily: getFont(resume), minHeight: '100%' }}>
    <div style={{ backgroundColor: a, color: '#fff', padding: '36px 36px 28px' }}>
      <h1 style={{ fontSize: '32px', fontWeight: 300, letterSpacing: '6px', textTransform: 'uppercase', margin: 0 }}>{resume.contact.fullName || 'Your Name'}</h1>
      <div style={{ marginTop: '8px', fontSize: `${bfs-1}px`, opacity: 0.8 }}>{[resume.contact.email, resume.contact.phone, resume.contact.location].filter(Boolean).join(' ✦ ')}</div>
    </div>
    <div style={{ display: 'flex' }}>
      <div style={{ flex: 1, padding: '24px 24px 36px', borderRight: `1px solid ${a}20` }}>
        {resume.summary && <><h2 style={makeSectionStyle(a, 'thick', bfs)}>Profile</h2><p style={{ fontSize: `${bfs}px`, color: '#444', lineHeight: '1.7', fontStyle: 'italic' }}>{resume.summary}</p></>}
        {resume.experience.length > 0 && <><h2 style={makeSectionStyle(a, 'thick', bfs)}>Experience</h2>{resume.experience.map(e => <ExperienceBlock key={e.id} exp={e} accent={a} baseFontSize={bfs} />)}</>}
      </div>
      <div style={{ width: '32%', padding: '24px 20px', backgroundColor: `${a}06` }}>
        {resume.skills.length > 0 && <><h2 style={{ fontSize: `${bfs}px`, fontWeight: 700, color: a, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '8px' }}>Expertise</h2><SkillsInline skills={resume.skills} baseFontSize={bfs} color="#555" /></>}
        {resume.education.length > 0 && <><h2 style={{ fontSize: `${bfs}px`, fontWeight: 700, color: a, textTransform: 'uppercase', letterSpacing: '2px', marginTop: '20px', marginBottom: '8px' }}>Education</h2>{resume.education.map(e => <EducationBlock key={e.id} edu={e} baseFontSize={bfs} />)}</>}
      </div>
    </div></div>);
}
