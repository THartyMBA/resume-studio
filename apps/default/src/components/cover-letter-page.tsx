import { useRef, useState } from 'react';
import { useResumeStore, type CoverLetterTone } from '@/stores/resume-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Sparkles, Download, FileText, Briefcase, Building2, User, Volume2, RotateCcw, AlertCircle, Copy, Check, Loader2, PenLine } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { getFontCSS } from '@/lib/template-registry';

const TONES: { id: CoverLetterTone; label: string; desc: string; emoji: string }[] = [
  { id: 'professional', label: 'Professional', desc: 'Polished & direct', emoji: '💼' },
  { id: 'enthusiastic', label: 'Enthusiastic', desc: 'Energetic & passionate', emoji: '🔥' },
  { id: 'conversational', label: 'Conversational', desc: 'Warm & approachable', emoji: '💬' },
  { id: 'formal', label: 'Formal', desc: 'Traditional & dignified', emoji: '📜' },
];

export function CoverLetterPage() {
  const { resume, coverLetter, coverLetterGenerating, setCoverLetter, setCoverLetterGenerating } = useResumeStore();
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [editing, setEditing] = useState(false);
  const letterRef = useRef<HTMLDivElement>(null);

  const hasResume = resume.contact.fullName || resume.summary || resume.experience.length > 0;
  const hasJobInfo = coverLetter.jobTitle.trim() && coverLetter.companyName.trim();
  const canGenerate = hasResume && hasJobInfo && !coverLetterGenerating;
  const hasLetter = coverLetter.body.trim().length > 0;

  const formatExperience = () => resume.experience.map((e) => `${e.title} at ${e.company} (${e.startDate} - ${e.endDate})\n${e.bullets.map((b) => '• ' + b).join('\n')}`).join('\n\n');

  const handleGenerate = async () => {
    setError(''); setCoverLetterGenerating(true);
    try {
      const response = await axios.post('/api/taskade/webhooks/01KQWM5F3E0HMV2GYSZNYB0W6Q/run', {
        fullName: resume.contact.fullName, resumeSummary: resume.summary,
        experience: formatExperience(), skills: resume.skills.join(', '),
        jobTitle: coverLetter.jobTitle, companyName: coverLetter.companyName,
        jobPosting: coverLetter.jobPosting, hiringManager: coverLetter.hiringManager, tone: coverLetter.tone,
      });
      const result = response.data?.output?.coverLetter || response.data?.coverLetter || '';
      if (result) { setCoverLetter({ body: result, generatedAt: new Date().toLocaleString() }); }
      else { setError('The AI returned an empty response. Please try again.'); }
    } catch (e: any) {
      console.error(e); setError(e?.response?.data?.message || 'Failed to generate cover letter. Please try again.');
    } finally { setCoverLetterGenerating(false); }
  };

  const handleCopy = async () => { await navigator.clipboard.writeText(coverLetter.body); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  const handleExportPDF = () => {
    const el = letterRef.current; if (!el) return;
    const pw = window.open('', '_blank'); if (!pw) return;
    const fc = getFontCSS(resume.fontFamily);
    pw.document.write(`<!DOCTYPE html><html><head><title>Cover Letter - ${resume.contact.fullName}</title><style>*{box-sizing:border-box;margin:0;padding:0}@page{margin:0.75in;size:letter}body{font-family:${fc};color:#1a1a1a;line-height:1.7;font-size:12px}p{margin-bottom:12px}h1{font-size:16px;margin-bottom:4px}</style></head><body>${el.innerHTML}</body></html>`);
    pw.document.close(); setTimeout(() => { pw.print(); pw.close(); }, 300);
  };

  return (
    <div className="flex flex-col md:flex-row h-full overflow-hidden">
      {/* Left: Input */}
      <div className="w-full md:w-[380px] lg:w-[420px] border-r border-border/50 flex flex-col overflow-hidden">
        <div className="px-5 py-4 border-b border-border/50">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center"><PenLine className="size-4 text-white" /></div>
            <div><h2 className="text-sm font-semibold">Cover Letter Generator</h2><p className="text-[10px] text-muted-foreground">Tailored to your resume & job posting</p></div>
          </div>
        </div>
        <div className="flex-1 overflow-auto p-5 space-y-5">
          <div className={cn('flex items-start gap-3 p-3 rounded-xl border', hasResume ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-amber-500/30 bg-amber-500/5')}>
            <FileText className={cn('size-4 mt-0.5 shrink-0', hasResume ? 'text-emerald-500' : 'text-amber-500')} />
            <div>
              <p className={cn('text-xs font-medium', hasResume ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400')}>
                {hasResume ? `Using ${resume.contact.fullName}'s resume` : 'No resume data yet'}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{hasResume ? `${resume.experience.length} roles • ${resume.skills.length} skills` : 'Chat with Resume Coach first'}</p>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5"><Briefcase className="size-3" /> Target Position</h3>
            <div className="space-y-2">
              <div className="space-y-1"><Label className="text-xs text-muted-foreground">Job Title *</Label><Input value={coverLetter.jobTitle} onChange={(e) => setCoverLetter({ jobTitle: e.target.value })} placeholder="e.g. Senior Product Manager" className="h-8 text-sm" /></div>
              <div className="space-y-1"><Label className="text-xs text-muted-foreground">Company Name *</Label><div className="relative"><Building2 className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" /><Input value={coverLetter.companyName} onChange={(e) => setCoverLetter({ companyName: e.target.value })} placeholder="e.g. Stripe" className="h-8 text-sm pl-8" /></div></div>
              <div className="space-y-1"><Label className="text-xs text-muted-foreground">Hiring Manager (optional)</Label><div className="relative"><User className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" /><Input value={coverLetter.hiringManager} onChange={(e) => setCoverLetter({ hiringManager: e.target.value })} placeholder="e.g. Jane Smith" className="h-8 text-sm pl-8" /></div></div>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5"><FileText className="size-3" /> Job Posting</h3>
            <Textarea value={coverLetter.jobPosting} onChange={(e) => setCoverLetter({ jobPosting: e.target.value })} placeholder="Paste the full job description here..." className="min-h-[120px] text-sm resize-none" />
            <p className="text-[10px] text-muted-foreground">More detail = more tailored letter</p>
          </div>

          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5"><Volume2 className="size-3" /> Tone</h3>
            <div className="grid grid-cols-2 gap-2">
              {TONES.map((t) => (
                <button key={t.id} onClick={() => setCoverLetter({ tone: t.id })} className={cn('flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all', coverLetter.tone === t.id ? 'border-primary bg-primary/5 shadow-sm' : 'border-border/50 hover:border-primary/30')}>
                  <span className="text-base">{t.emoji}</span><div><p className="text-xs font-medium">{t.label}</p><p className="text-[10px] text-muted-foreground">{t.desc}</p></div>
                </button>
              ))}
            </div>
          </div>

          <AnimatePresence>{error && (<motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-start gap-2 p-3 rounded-xl border border-destructive/30 bg-destructive/5"><AlertCircle className="size-4 text-destructive shrink-0 mt-0.5" /><p className="text-xs text-destructive">{error}</p></motion.div>)}</AnimatePresence>

          <Button onClick={handleGenerate} disabled={!canGenerate} className="w-full gap-2 h-10 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-md shadow-amber-500/20">
            {coverLetterGenerating ? <><Loader2 className="size-4 animate-spin" />Crafting your letter...</> : <><Sparkles className="size-4" />{hasLetter ? 'Regenerate' : 'Generate Cover Letter'}</>}
          </Button>
        </div>
      </div>

      {/* Right: Preview */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/50">
          <span className="text-xs text-muted-foreground">{hasLetter && coverLetter.generatedAt && `Generated ${coverLetter.generatedAt}`}</span>
          <div className="flex items-center gap-2">
            {hasLetter && (<>
              <Button variant="ghost" size="sm" onClick={() => setEditing(!editing)} className="gap-1.5 text-xs"><PenLine className="size-3" />{editing ? 'Preview' : 'Edit'}</Button>
              <Button variant="ghost" size="sm" onClick={handleCopy} className="gap-1.5 text-xs">{copied ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}{copied ? 'Copied' : 'Copy'}</Button>
              <Button variant="ghost" size="sm" onClick={() => { setCoverLetter({ body: '' }); setEditing(false); }} className="gap-1.5 text-xs"><RotateCcw className="size-3" />Clear</Button>
              <Button onClick={handleExportPDF} size="sm" className="gap-1.5"><Download className="size-3.5" />Export PDF</Button>
            </>)}
          </div>
        </div>
        <div className="flex-1 overflow-auto bg-muted/30 p-4 sm:p-8">
          <AnimatePresence mode="wait">
            {coverLetterGenerating ? (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center h-full gap-4">
                <div className="size-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center"><Sparkles className="size-7 text-amber-500 animate-pulse" /></div>
                <div className="text-center"><p className="text-sm font-medium">Crafting your cover letter...</p><p className="text-xs text-muted-foreground mt-1">Analyzing the job posting & matching your experience</p></div>
              </motion.div>
            ) : hasLetter ? (
              <motion.div key="letter" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mx-auto max-w-[8.5in] bg-white shadow-2xl shadow-black/10 rounded-sm overflow-hidden" style={{ minHeight: '11in' }}>
                {editing ? (
                  <div className="p-12"><Textarea value={coverLetter.body} onChange={(e) => setCoverLetter({ body: e.target.value })} className="min-h-[600px] text-sm border-none shadow-none focus-visible:ring-0 p-0 resize-none bg-transparent" style={{ fontFamily: getFontCSS(resume.fontFamily), fontSize: '13px', lineHeight: '1.8', color: '#1a1a1a' }} /></div>
                ) : (<div ref={letterRef}><CoverLetterDocument /></div>)}
              </motion.div>
            ) : (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center h-full text-center gap-4">
                <div className="rounded-full bg-muted p-6"><PenLine className="size-10 text-muted-foreground" /></div>
                <div><h3 className="font-semibold text-foreground mb-1">Your cover letter will appear here</h3><p className="text-sm text-muted-foreground max-w-sm">Fill in the job details and click Generate. The AI crafts a personalized letter matching your resume to the role.</p></div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function CoverLetterDocument() {
  const { resume, coverLetter } = useResumeStore();
  const accent = resume.accentColor;
  const fontCss = getFontCSS(resume.fontFamily);
  const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const paragraphs = coverLetter.body.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);

  return (
    <div style={{ fontFamily: fontCss, color: '#1a1a1a', padding: '56px 64px', lineHeight: '1.7', fontSize: '12px' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 700, color: accent, margin: 0 }}>{resume.contact.fullName || 'Your Name'}</h1>
        <div style={{ fontSize: '11px', color: '#666', marginTop: '4px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {[resume.contact.email, resume.contact.phone, resume.contact.location, resume.contact.linkedin].filter(Boolean).map((item, i) => (<span key={i}>{i > 0 ? '• ' : ''}{item}</span>))}
        </div>
      </div>
      <p style={{ fontSize: '11px', color: '#666', marginBottom: '20px' }}>{today}</p>
      {(coverLetter.hiringManager || coverLetter.companyName) && (
        <div style={{ marginBottom: '20px', fontSize: '12px' }}>{coverLetter.hiringManager && <p>{coverLetter.hiringManager}</p>}{coverLetter.companyName && <p>{coverLetter.companyName}</p>}</div>
      )}
      {paragraphs.map((p, i) => (<p key={i} style={{ marginBottom: '14px', fontSize: '12px', lineHeight: '1.75', color: '#333' }}>{p}</p>))}
    </div>
  );
}
