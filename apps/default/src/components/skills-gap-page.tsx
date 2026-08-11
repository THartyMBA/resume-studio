import { useState } from 'react';
import { useResumeStore, type SkillsGapResult } from '@/stores/resume-store';
import {
  Target, Loader2, AlertCircle, Check, X, ChevronDown, TrendingUp,
  Sparkles, ArrowRight, BookOpen, Lightbulb, Pencil, Shield, Zap,
  ArrowUpRight, Clock, Star, ChevronRight, BarChart3,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const WORKFLOW_URL = '/api/taskade/webhooks/01KT54Z1WCMA19BEW7DFCQBRK7/run';

const READINESS_CONFIG: Record<string, { color: string; bg: string; border: string; label: string; icon: typeof Shield }> = {
  'ready': { color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', label: 'Ready', icon: Shield },
  'almost-ready': { color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30', label: 'Almost Ready', icon: TrendingUp },
  'needs-work': { color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30', label: 'Needs Work', icon: Lightbulb },
  'significant-gap': { color: 'text-red-600 dark:text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30', label: 'Significant Gap', icon: Target },
};

const PRIORITY_BADGE: Record<string, { bg: string; text: string }> = {
  'must-have': { bg: 'bg-red-500/10 border-red-500/20', text: 'text-red-600 dark:text-red-400' },
  'should-have': { bg: 'bg-amber-500/10 border-amber-500/20', text: 'text-amber-600 dark:text-amber-400' },
  'nice-to-have': { bg: 'bg-blue-500/10 border-blue-500/20', text: 'text-blue-600 dark:text-blue-400' },
  'critical': { bg: 'bg-red-500/10 border-red-500/20', text: 'text-red-600 dark:text-red-400' },
  'important': { bg: 'bg-amber-500/10 border-amber-500/20', text: 'text-amber-600 dark:text-amber-400' },
};

const DIFFICULTY_ICON: Record<string, typeof Clock> = { easy: Zap, moderate: Clock, hard: BookOpen };

/* ── Score Ring ── */
function ScoreRing({ score }: { score: number }) {
  const r = 40; const c = 2 * Math.PI * r; const offset = c - (score / 100) * c;
  const clr = score >= 75 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444';
  return (
    <div className="relative size-24 shrink-0">
      <svg viewBox="0 0 100 100" className="size-full -rotate-90">
        <circle cx="50" cy="50" r={r} fill="none" stroke="currentColor" strokeWidth="6" className="text-muted/30" />
        <motion.circle cx="50" cy="50" r={r} fill="none" stroke={clr} strokeWidth="6" strokeLinecap="round"
          strokeDasharray={c} initial={{ strokeDashoffset: c }} animate={{ strokeDashoffset: offset }} transition={{ duration: 1.2, ease: 'easeOut' }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span className="text-xl font-bold" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>{score}</motion.span>
        <span className="text-[8px] text-muted-foreground uppercase tracking-widest">FIT</span>
      </div>
    </div>
  );
}

/* ── Collapsible Section ── */
function Section({ title, icon: Icon, count, color, children, defaultOpen = false }: {
  title: string; icon: any; count: number; color: string; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-xl border border-border/50 overflow-hidden">
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors">
        <div className="flex items-center gap-2">
          <Icon className={cn('size-4', color)} />
          <span className="text-xs font-semibold">{title}</span>
          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">{count}</span>
        </div>
        <ChevronDown className={cn('size-4 text-muted-foreground transition-transform', open && 'rotate-180')} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
            <div className="px-4 pb-4 space-y-2">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Confidence Bar ── */
function ConfidenceBar({ value }: { value: number }) {
  const clr = value >= 75 ? 'bg-emerald-500' : value >= 50 ? 'bg-amber-500' : 'bg-red-500';
  return (
    <div className="flex items-center gap-2 flex-1">
      <div className="flex-1 h-1.5 rounded-full bg-muted/50 overflow-hidden">
        <motion.div className={cn('h-full rounded-full', clr)} initial={{ width: 0 }} animate={{ width: `${value}%` }} transition={{ duration: 0.8 }} />
      </div>
      <span className="text-[9px] text-muted-foreground w-7 text-right">{value}%</span>
    </div>
  );
}


/* ── Main Component ── */
export function SkillsGapPage() {
  const {
    resume, skillsGapJobDescription, skillsGapResult, skillsGapAnalyzing,
    setSkillsGapJobDescription, setSkillsGapResult, setSkillsGapAnalyzing,
  } = useResumeStore();
  const [error, setError] = useState('');

  const hasResume = resume.contact.fullName || resume.summary || resume.experience.length > 0;
  const hasSkills = resume.skills.length > 0;
  const jdLongEnough = skillsGapJobDescription.trim().length > 30;
  const canAnalyze = hasResume && jdLongEnough && !skillsGapAnalyzing;

  const buildResumeText = () => {
    const parts = [resume.contact.fullName];
    if (resume.summary) parts.push('\nSUMMARY\n' + resume.summary);
    if (resume.experience.length > 0) {
      parts.push('\nEXPERIENCE');
      resume.experience.forEach((e) => { parts.push(`${e.title} at ${e.company} (${e.startDate} – ${e.endDate})`); e.bullets.forEach((b) => parts.push('• ' + b)); });
    }
    if (resume.education.length > 0) { parts.push('\nEDUCATION'); resume.education.forEach((e) => parts.push(`${e.degree} – ${e.school} (${e.graduationYear})`)); }
    if (resume.skills.length > 0) parts.push('\nSKILLS\n' + resume.skills.join(', '));
    return parts.join('\n');
  };

  const handleAnalyze = async () => {
    setError(''); setSkillsGapAnalyzing(true); setSkillsGapResult(null);
    try {
      const resp = await axios.post(WORKFLOW_URL, {
        resumeSkills: resume.skills.join(', '),
        resumeText: buildResumeText(),
        jobDescription: skillsGapJobDescription,
      });
      const raw = resp.data?.output?.result || resp.data?.result;
      if (!raw) { setError('Empty response from AI. Try again.'); return; }
      const parsed: SkillsGapResult = typeof raw === 'string' ? JSON.parse(raw) : raw;
      setSkillsGapResult(parsed);
    } catch (e: any) {
      console.error(e); setError(e?.response?.data?.message || 'Analysis failed. Please try again.');
    } finally { setSkillsGapAnalyzing(false); }
  };

  const r = skillsGapResult;

  return (
    <div className="flex flex-col md:flex-row h-full overflow-hidden">
      {/* Left Panel: Input */}
      <div className="w-full md:w-[380px] lg:w-[420px] border-r border-border/50 flex flex-col overflow-hidden">
        <div className="px-5 py-4 border-b border-border/50">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center">
              <Target className="size-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-semibold">Skills Gap Analyzer</h2>
              <p className="text-[10px] text-muted-foreground">Compare your skills against any job description</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-5 space-y-5">
          {/* Resume status */}
          <div className={cn('flex items-start gap-3 p-3 rounded-xl border', hasResume ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-amber-500/30 bg-amber-500/5')}>
            {hasResume ? <Check className="size-4 text-emerald-500 mt-0.5 shrink-0" /> : <AlertCircle className="size-4 text-amber-500 mt-0.5 shrink-0" />}
            <div>
              <p className="text-xs font-medium">{hasResume ? 'Resume loaded' : 'No resume loaded'}</p>
              <p className="text-[10px] text-muted-foreground">{hasResume ? `${resume.skills.length} skills • ${resume.experience.length} roles` : 'Upload or build your resume first'}</p>
            </div>
          </div>

          {/* Current skills preview */}
          {hasSkills && (
            <div className="space-y-2">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Your Current Skills</p>
              <div className="flex flex-wrap gap-1">
                {resume.skills.map((s) => (
                  <span key={s} className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">{s}</span>
                ))}
              </div>
            </div>
          )}

          {/* JD input */}
          <div className="space-y-2">
            <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Target Job Description</label>
            <textarea value={skillsGapJobDescription} onChange={(e) => setSkillsGapJobDescription(e.target.value)}
              placeholder="Paste the full job description here — include responsibilities, requirements, preferred qualifications, and tech stack…"
              className="w-full min-h-[240px] text-sm px-4 py-3 rounded-xl bg-background border border-border/50 focus:outline-none focus:ring-2 focus:ring-violet-500/30 transition-all resize-none leading-relaxed" />
            <div className="flex items-center justify-between">
              <p className={cn('text-[9px]', jdLongEnough ? 'text-muted-foreground' : 'text-amber-500')}>
                {skillsGapJobDescription.trim().length} chars {!jdLongEnough && '(min 30)'}
              </p>
            </div>
          </div>

          {/* Analyze button */}
          <button onClick={handleAnalyze} disabled={!canAnalyze}
            className={cn('w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all',
              canAnalyze ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white hover:from-violet-500 hover:to-fuchsia-500 shadow-lg shadow-violet-500/20' : 'bg-muted text-muted-foreground cursor-not-allowed')}>
            {skillsGapAnalyzing ? <><Loader2 className="size-4 animate-spin" /> Analyzing skills gap…</> : <><Sparkles className="size-4" /> Analyze Skills Gap</>}
          </button>

          {error && <div className="flex items-start gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/30"><AlertCircle className="size-4 text-destructive shrink-0 mt-0.5" /><p className="text-xs text-destructive">{error}</p></div>}
        </div>
      </div>

      {/* Right Panel: Results */}
      <div className="flex-1 overflow-auto">
        {skillsGapAnalyzing ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 p-8">
            <div className="relative">
              <div className="size-20 rounded-full bg-gradient-to-br from-violet-500/20 to-fuchsia-600/20 flex items-center justify-center">
                <Loader2 className="size-10 text-violet-500 animate-spin" />
              </div>
              <div className="absolute inset-0 rounded-full bg-violet-500/10 animate-ping" />
            </div>
            <div className="text-center space-y-1">
              <p className="text-sm font-semibold">Mapping your skills landscape…</p>
              <p className="text-xs text-muted-foreground">Comparing resume against job requirements</p>
            </div>
          </div>
        ) : !r ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 p-8">
            <div className="rounded-full bg-muted p-6"><Target className="size-10 text-muted-foreground" /></div>
            <div className="text-center max-w-sm">
              <h3 className="font-semibold mb-1">Paste a job description</h3>
              <p className="text-sm text-muted-foreground">The AI will map your skills against the role's requirements, identify gaps, and suggest exactly how to strengthen your resume.</p>
            </div>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-5 sm:p-6 max-w-3xl mx-auto space-y-5">
            {/* Assessment Header */}
            <div className="flex items-center gap-5 p-5 rounded-2xl bg-card border border-border/50">
              <ScoreRing score={r.assessment.fitScore} />
              <div className="flex-1 min-w-0">
                {(() => { const rc = READINESS_CONFIG[r.assessment.readiness] || READINESS_CONFIG['needs-work']; const RIcon = rc.icon; return (
                  <div className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold mb-2 border', rc.bg, rc.border, rc.color)}>
                    <RIcon className="size-3" /> {rc.label}
                  </div>
                ); })()}
                <p className="text-sm text-muted-foreground leading-relaxed">{r.assessment.summary}</p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { label: 'Matched', value: r.matchedSkills.length, icon: Check, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                { label: 'Missing', value: r.missingSkills.length, icon: X, color: 'text-red-500', bg: 'bg-red-500/10' },
                { label: 'Transferable', value: r.transferableSkills.length, icon: ArrowUpRight, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                { label: 'To Highlight', value: r.skillsToHighlight.length, icon: Star, color: 'text-amber-500', bg: 'bg-amber-500/10' },
              ].map((s) => (
                <div key={s.label} className={cn('flex items-center gap-2 p-3 rounded-xl border border-border/30', s.bg)}>
                  <s.icon className={cn('size-4', s.color)} />
                  <div><p className="text-lg font-bold leading-none">{s.value}</p><p className="text-[9px] text-muted-foreground">{s.label}</p></div>
                </div>
              ))}
            </div>

            {/* Matched Skills */}
            <Section title="Matched Skills" icon={Check} count={r.matchedSkills.length} color="text-emerald-500" defaultOpen>
              {r.matchedSkills.map((s, i) => {
                const badge = PRIORITY_BADGE[s.relevance] || PRIORITY_BADGE['nice-to-have'];
                return (
                  <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors">
                    <Check className="size-3.5 text-emerald-500 shrink-0" />
                    <span className="text-xs font-medium flex-shrink-0">{s.skill}</span>
                    <span className={cn('text-[9px] px-1.5 py-0.5 rounded-full border shrink-0', badge?.bg, badge?.text)}>{s.relevance}</span>
                    <ConfidenceBar value={s.confidence} />
                  </div>
                );
              })}
            </Section>

            {/* Missing Skills */}
            <Section title="Missing Skills" icon={AlertCircle} count={r.missingSkills.length} color="text-red-500" defaultOpen>
              {r.missingSkills.map((s, i) => {
                const badge = PRIORITY_BADGE[s.priority] || PRIORITY_BADGE['nice-to-have'];
                const DiffIcon = DIFFICULTY_ICON[s.difficulty] || Clock;
                return (
                  <div key={i} className="p-3 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <X className="size-3.5 text-red-500 shrink-0" />
                      <span className="text-xs font-semibold">{s.skill}</span>
                      <span className={cn('text-[9px] px-1.5 py-0.5 rounded-full border', badge?.bg, badge?.text)}>{s.priority}</span>
                      <span className="flex items-center gap-0.5 text-[9px] text-muted-foreground"><DiffIcon className="size-2.5" /> {s.difficulty}</span>
                    </div>
                    <div className="flex items-start gap-1.5 ml-5.5">
                      <ArrowRight className="size-3 text-muted-foreground shrink-0 mt-0.5" />
                      <p className="text-[11px] text-muted-foreground leading-relaxed">{s.action}</p>
                    </div>
                  </div>
                );
              })}
            </Section>

            {/* Transferable Skills */}
            {r.transferableSkills.length > 0 && (
              <Section title="Transferable Skills" icon={ArrowUpRight} count={r.transferableSkills.length} color="text-blue-500">
                {r.transferableSkills.map((s, i) => (
                  <div key={i} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-muted/20">
                    <ArrowUpRight className="size-3.5 text-blue-500 shrink-0 mt-0.5" />
                    <div><p className="text-xs font-semibold">{s.skill}</p><p className="text-[11px] text-muted-foreground leading-relaxed">{s.explanation}</p></div>
                  </div>
                ))}
              </Section>
            )}

            {/* Skills to Highlight */}
            {r.skillsToHighlight.length > 0 && (
              <Section title="Skills to Highlight" icon={Star} count={r.skillsToHighlight.length} color="text-amber-500">
                {r.skillsToHighlight.map((s, i) => (
                  <div key={i} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-muted/20">
                    <Star className="size-3.5 text-amber-500 shrink-0 mt-0.5" />
                    <div><p className="text-xs font-semibold">{s.skill}</p><p className="text-[11px] text-muted-foreground leading-relaxed">{s.suggestion}</p></div>
                  </div>
                ))}
              </Section>
            )}

            {/* Resume Changes */}
            {r.resumeChanges.length > 0 && (
              <Section title="Suggested Resume Changes" icon={Pencil} count={r.resumeChanges.length} color="text-violet-500">
                {r.resumeChanges.map((c, i) => (
                  <div key={i} className="p-3 rounded-lg border border-border/30 space-y-2">
                    <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">{c.section}</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div className="p-2 rounded-md bg-red-500/5 border border-red-500/10">
                        <p className="text-[9px] text-red-500 font-medium mb-0.5">Current</p>
                        <p className="text-[11px] text-muted-foreground leading-relaxed">{c.current}</p>
                      </div>
                      <div className="p-2 rounded-md bg-emerald-500/5 border border-emerald-500/10">
                        <p className="text-[9px] text-emerald-500 font-medium mb-0.5">Suggested</p>
                        <p className="text-[11px] text-foreground leading-relaxed">{c.suggested}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </Section>
            )}

            {/* Next Steps */}
            {r.assessment.nextSteps.length > 0 && (
              <div className="p-4 rounded-xl bg-gradient-to-br from-violet-500/5 to-fuchsia-500/5 border border-violet-500/20 space-y-3">
                <h3 className="text-xs font-semibold flex items-center gap-1.5"><ChevronRight className="size-3.5 text-violet-500" /> Next Steps</h3>
                <ol className="space-y-2">
                  {r.assessment.nextSteps.map((step, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <span className="size-5 rounded-full bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center text-[10px] font-bold shrink-0">{i + 1}</span>
                      <p className="text-xs text-muted-foreground leading-relaxed pt-0.5">{step}</p>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}