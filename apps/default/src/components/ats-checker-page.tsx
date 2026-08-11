import { useState } from 'react';
import { useResumeStore, type ATSResult } from '@/stores/resume-store';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ShieldCheck, FileText, Sparkles, Loader2, AlertCircle, ChevronRight, ArrowUp, Minus, ArrowDown, Check, X, Target, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

export function ATSCheckerPage() {
  const { resume, atsJobDescription, atsResult, atsAnalyzing, setAtsJobDescription, setAtsResult, setAtsAnalyzing } = useResumeStore();
  const [error, setError] = useState('');
  const hasResume = resume.contact.fullName || resume.summary || resume.experience.length > 0;
  const canAnalyze = hasResume && atsJobDescription.trim().length > 30 && !atsAnalyzing;

  const buildResumeText = () => {
    const parts = [resume.contact.fullName];
    if (resume.contact.email) parts.push(resume.contact.email);
    if (resume.contact.phone) parts.push(resume.contact.phone);
    if (resume.contact.location) parts.push(resume.contact.location);
    if (resume.summary) parts.push('\nPROFESSIONAL SUMMARY\n' + resume.summary);
    if (resume.experience.length > 0) {
      parts.push('\nWORK EXPERIENCE');
      resume.experience.forEach(e => { parts.push(`${e.title} at ${e.company} (${e.startDate} - ${e.endDate})`); e.bullets.forEach(b => parts.push('• ' + b)); });
    }
    if (resume.education.length > 0) {
      parts.push('\nEDUCATION');
      resume.education.forEach(e => parts.push(`${e.degree} - ${e.school} (${e.graduationYear})`));
    }
    if (resume.skills.length > 0) parts.push('\nSKILLS\n' + resume.skills.join(', '));
    return parts.join('\n');
  };

  const handleAnalyze = async () => {
    setError(''); setAtsAnalyzing(true); setAtsResult(null);
    try {
      const resp = await axios.post('/api/taskade/webhooks/01KQWNGR0CHHCMJ0EY4PZSK801/run', {
        resumeText: buildResumeText(), jobDescription: atsJobDescription,
      });
      const raw = resp.data?.output?.result || resp.data?.result;
      if (!raw) { setError('Empty response from AI. Try again.'); return; }
      const parsed: ATSResult = typeof raw === 'string' ? JSON.parse(raw) : raw;
      setAtsResult(parsed);
    } catch (e: any) {
      console.error(e); setError(e?.response?.data?.message || 'Analysis failed. Please try again.');
    } finally { setAtsAnalyzing(false); }
  };

  return (
    <div className="flex flex-col md:flex-row h-full overflow-hidden">
      {/* Left: Input */}
      <div className="w-full md:w-[380px] lg:w-[420px] border-r border-border/50 flex flex-col overflow-hidden">
        <div className="px-5 py-4 border-b border-border/50">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center"><ShieldCheck className="size-4 text-white" /></div>
            <div><h2 className="text-sm font-semibold">ATS Score Checker</h2><p className="text-[10px] text-muted-foreground">Analyze resume compatibility with any job posting</p></div>
          </div>
        </div>
        <div className="flex-1 overflow-auto p-5 space-y-5">
          <div className={cn('flex items-start gap-3 p-3 rounded-xl border', hasResume ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-amber-500/30 bg-amber-500/5')}>
            <FileText className={cn('size-4 mt-0.5 shrink-0', hasResume ? 'text-emerald-500' : 'text-amber-500')} />
            <div>
              <p className={cn('text-xs font-medium', hasResume ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400')}>{hasResume ? `Scanning ${resume.contact.fullName}'s resume` : 'No resume data yet'}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{hasResume ? `${resume.experience.length} roles • ${resume.skills.length} skills • ${resume.education.length} degrees` : 'Chat with Resume Coach first'}</p>
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5"><Target className="size-3" /> Job Description</h3>
            <Textarea value={atsJobDescription} onChange={(e) => setAtsJobDescription(e.target.value)} placeholder="Paste the complete job description here...\n\nInclude requirements, qualifications, responsibilities — the more detail, the better the analysis." className="min-h-[240px] text-sm resize-none" />
            <p className="text-[10px] text-muted-foreground">{atsJobDescription.length > 0 ? `${atsJobDescription.split(/\s+/).filter(Boolean).length} words` : 'Paste at least a few sentences'}</p>
          </div>
          <AnimatePresence>{error && (<motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-start gap-2 p-3 rounded-xl border border-destructive/30 bg-destructive/5"><AlertCircle className="size-4 text-destructive shrink-0 mt-0.5" /><p className="text-xs text-destructive">{error}</p></motion.div>)}</AnimatePresence>
          <Button onClick={handleAnalyze} disabled={!canAnalyze} className="w-full gap-2 h-10 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-md shadow-emerald-500/20">
            {atsAnalyzing ? <><Loader2 className="size-4 animate-spin" />Analyzing resume...</> : <><Sparkles className="size-4" />{atsResult ? 'Re-analyze' : 'Analyze ATS Score'}</>}
          </Button>
        </div>
      </div>

      {/* Right: Results */}
      <div className="flex-1 overflow-auto bg-muted/30">
        <AnimatePresence mode="wait">
          {atsAnalyzing ? (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center h-full gap-4">
              <div className="size-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center"><ShieldCheck className="size-7 text-emerald-500 animate-pulse" /></div>
              <div className="text-center"><p className="text-sm font-medium">Running ATS analysis...</p><p className="text-xs text-muted-foreground mt-1">Scanning keywords, formatting, and compatibility</p></div>
            </motion.div>
          ) : atsResult ? (
            <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ATSResults result={atsResult} />
            </motion.div>
          ) : (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center h-full text-center gap-4">
              <div className="rounded-full bg-muted p-6"><ShieldCheck className="size-10 text-muted-foreground" /></div>
              <div><h3 className="font-semibold text-foreground mb-1">ATS analysis results will appear here</h3><p className="text-sm text-muted-foreground max-w-sm">Paste a job description and click Analyze to see how well your resume matches the role.</p></div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function ATSResults({ result }: { result: ATSResult }) {
  const score = result.overallScore;
  const scoreColor = score >= 80 ? 'text-emerald-500' : score >= 60 ? 'text-amber-500' : 'text-red-500';
  const scoreBg = score >= 80 ? 'from-emerald-500' : score >= 60 ? 'from-amber-500' : 'from-red-500';
  const scoreLabel = score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : score >= 40 ? 'Needs Work' : 'Low Match';
  const circumference = 2 * Math.PI * 54;
  const dashOffset = circumference - (score / 100) * circumference;

  const categories = [
    { key: 'keywordMatch', label: 'Keyword Match', icon: Target },
    { key: 'formatting', label: 'Formatting', icon: FileText },
    { key: 'experienceRelevance', label: 'Experience', icon: TrendingUp },
    { key: 'skillsAlignment', label: 'Skills', icon: Sparkles },
    { key: 'educationFit', label: 'Education', icon: ShieldCheck },
  ] as const;

  const priorityIcon = (p: string) => p === 'high' ? <ArrowUp className="size-3 text-red-500" /> : p === 'medium' ? <Minus className="size-3 text-amber-500" /> : <ArrowDown className="size-3 text-blue-400" />;

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* Score Ring + Summary */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row items-center gap-6 p-6 rounded-2xl bg-card border border-border/50">
        <div className="relative shrink-0">
          <svg width="130" height="130" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="54" fill="none" stroke="currentColor" strokeWidth="8" className="text-muted/30" />
            <motion.circle cx="60" cy="60" r="54" fill="none" strokeWidth="8" strokeLinecap="round" className={scoreBg.replace('from-', 'text-')} style={{ strokeDasharray: circumference, transformOrigin: 'center', transform: 'rotate(-90deg)' }} initial={{ strokeDashoffset: circumference }} animate={{ strokeDashoffset: dashOffset }} transition={{ duration: 1.2, ease: 'easeOut' }} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span className={cn('text-3xl font-bold', scoreColor)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>{score}</motion.span>
            <span className="text-[10px] text-muted-foreground font-medium">{scoreLabel}</span>
          </div>
        </div>
        <div className="flex-1 text-center sm:text-left">
          <h3 className="text-lg font-semibold mb-2">ATS Compatibility Score</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{result.summary}</p>
        </div>
      </motion.div>

      {/* Category Scores */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="p-5 rounded-2xl bg-card border border-border/50">
        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><TrendingUp className="size-4" /> Category Breakdown</h3>
        <div className="space-y-3">
          {categories.map(({ key, label, icon: Icon }) => {
            const val = result.categoryScores[key];
            const barColor = val >= 80 ? 'bg-emerald-500' : val >= 60 ? 'bg-amber-500' : 'bg-red-500';
            return (
              <div key={key} className="flex items-center gap-3">
                <Icon className="size-4 text-muted-foreground shrink-0" />
                <span className="text-xs font-medium w-24 shrink-0">{label}</span>
                <div className="flex-1 h-2.5 bg-muted rounded-full overflow-hidden">
                  <motion.div className={cn('h-full rounded-full', barColor)} initial={{ width: 0 }} animate={{ width: `${val}%` }} transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }} />
                </div>
                <span className={cn('text-xs font-bold w-8 text-right', val >= 80 ? 'text-emerald-500' : val >= 60 ? 'text-amber-500' : 'text-red-500')}>{val}</span>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Keywords */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="p-5 rounded-2xl bg-card border border-border/50">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><Check className="size-4 text-emerald-500" /> Matched Keywords <span className="text-[10px] font-normal text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded">{result.matchedKeywords.length}</span></h3>
          <div className="flex flex-wrap gap-1.5">
            {result.matchedKeywords.map((kw, i) => (
              <span key={i} className="text-[11px] px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">{kw}</span>
            ))}
            {result.matchedKeywords.length === 0 && <p className="text-xs text-muted-foreground">No keywords matched</p>}
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="p-5 rounded-2xl bg-card border border-border/50">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><X className="size-4 text-red-500" /> Missing Keywords <span className="text-[10px] font-normal text-red-500 bg-red-500/10 px-1.5 py-0.5 rounded">{result.missingKeywords.length}</span></h3>
          <div className="flex flex-wrap gap-1.5">
            {result.missingKeywords.map((kw, i) => (
              <span key={i} className="text-[11px] px-2 py-0.5 rounded-md bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">{kw}</span>
            ))}
            {result.missingKeywords.length === 0 && <p className="text-xs text-muted-foreground">No missing keywords — great coverage!</p>}
          </div>
        </motion.div>
      </div>

      {/* Improvements */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="p-5 rounded-2xl bg-card border border-border/50">
        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><Sparkles className="size-4 text-amber-500" /> Improvement Suggestions</h3>
        <div className="space-y-2.5">
          {result.improvements.map((imp, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 + i * 0.08 }}
              className={cn('flex items-start gap-3 p-3 rounded-xl border', imp.priority === 'high' ? 'border-red-500/20 bg-red-500/5' : imp.priority === 'medium' ? 'border-amber-500/20 bg-amber-500/5' : 'border-blue-500/20 bg-blue-500/5')}
            >
              <div className="mt-0.5">{priorityIcon(imp.priority)}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className={cn('text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded', imp.priority === 'high' ? 'bg-red-500/10 text-red-500' : imp.priority === 'medium' ? 'bg-amber-500/10 text-amber-500' : 'bg-blue-500/10 text-blue-400')}>{imp.priority}</span>
                  <span className="text-[10px] text-muted-foreground capitalize">{imp.category}</span>
                </div>
                <p className="text-xs text-foreground leading-relaxed">{imp.suggestion}</p>
              </div>
              <ChevronRight className="size-3.5 text-muted-foreground shrink-0 mt-1" />
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
