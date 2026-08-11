import { useState } from 'react';
import { useResumeStore, type InterviewResult, type InterviewQuestion } from '@/stores/resume-store';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Mic, FileText, Sparkles, Loader2, AlertCircle, ChevronDown, ChevronRight, Target,
  Brain, MessageCircle, Lightbulb, AlertTriangle, CheckCircle2, HelpCircle, Zap,
  BookOpen, Users, Briefcase, BarChart3,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const CATEGORY_META: Record<string, { icon: typeof Brain; color: string; bg: string; label: string }> = {
  behavioral: { icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10 border-blue-500/20', label: 'Behavioral' },
  technical: { icon: Brain, color: 'text-violet-500', bg: 'bg-violet-500/10 border-violet-500/20', label: 'Technical' },
  situational: { icon: Lightbulb, color: 'text-amber-500', bg: 'bg-amber-500/10 border-amber-500/20', label: 'Situational' },
  'role-specific': { icon: Briefcase, color: 'text-emerald-500', bg: 'bg-emerald-500/10 border-emerald-500/20', label: 'Role-Specific' },
};

const DIFFICULTY_META: Record<string, { color: string; bg: string }> = {
  easy: { color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  medium: { color: 'text-amber-500', bg: 'bg-amber-500/10' },
  hard: { color: 'text-red-500', bg: 'bg-red-500/10' },
};

const TIP_META: Record<string, { icon: typeof BookOpen; color: string }> = {
  research: { icon: BookOpen, color: 'text-blue-500' },
  mindset: { icon: Brain, color: 'text-violet-500' },
  delivery: { icon: Mic, color: 'text-amber-500' },
  content: { icon: FileText, color: 'text-emerald-500' },
};

export function InterviewPrepPage() {
  const {
    resume, interviewJobDescription, interviewResult, interviewGenerating,
    setInterviewJobDescription, setInterviewResult, setInterviewGenerating,
  } = useResumeStore();
  const [error, setError] = useState('');
  const hasResume = resume.contact.fullName || resume.summary || resume.experience.length > 0;
  const hasJD = interviewJobDescription.trim().length > 30;
  const canGenerate = hasResume && hasJD && !interviewGenerating;

  const buildResumeText = () => {
    const parts = [resume.contact.fullName];
    if (resume.contact.email) parts.push(resume.contact.email);
    if (resume.summary) parts.push('\nPROFESSIONAL SUMMARY\n' + resume.summary);
    if (resume.experience.length > 0) {
      parts.push('\nWORK EXPERIENCE');
      resume.experience.forEach((e) => {
        parts.push(e.title + ' at ' + e.company + ' (' + e.startDate + ' - ' + e.endDate + ')');
        e.bullets.forEach((b) => parts.push('- ' + b));
      });
    }
    if (resume.education.length > 0) {
      parts.push('\nEDUCATION');
      resume.education.forEach((e) => parts.push(e.degree + ' - ' + e.school + ' (' + e.graduationYear + ')'));
    }
    if (resume.skills.length > 0) parts.push('\nSKILLS\n' + resume.skills.join(', '));
    return parts.join('\n');
  };

  const handleGenerate = async () => {
    setError(''); setInterviewGenerating(true); setInterviewResult(null);
    try {
      const resp = await axios.post('/api/taskade/webhooks/01KQWPPE8TRC4HH5TDWRKM8B0Z/run', {
        resumeText: buildResumeText(), jobDescription: interviewJobDescription,
      });
      const raw = resp.data?.output?.result || resp.data?.result;
      if (!raw) { setError('Empty response. Try again.'); return; }
      const parsed: InterviewResult = typeof raw === 'string' ? JSON.parse(raw) : raw;
      setInterviewResult(parsed);
    } catch (e: any) {
      console.error(e);
      setError(e?.response?.data?.message || 'Generation failed. Please try again.');
    } finally { setInterviewGenerating(false); }
  };

  const featureList = [
    { icon: MessageCircle, label: '10 targeted interview questions', color: 'text-blue-500' },
    { icon: BarChart3, label: 'STAR-method answers from your experience', color: 'text-violet-500' },
    { icon: CheckCircle2, label: 'Key points to emphasize', color: 'text-emerald-500' },
    { icon: AlertTriangle, label: 'Common mistakes to avoid', color: 'text-red-500' },
    { icon: Lightbulb, label: 'Follow-up questions & prep tips', color: 'text-amber-500' },
  ];

  return (
    <div className="flex flex-col md:flex-row h-full overflow-hidden">
      <div className="w-full md:w-[380px] lg:w-[420px] border-r border-border/50 flex flex-col overflow-hidden">
        <div className="px-5 py-4 border-b border-border/50">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
              <Mic className="size-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-semibold">Interview Prep</h2>
              <p className="text-[10px] text-muted-foreground">AI-generated questions & STAR answers</p>
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-auto p-5 space-y-5">
          <div className={cn('flex items-start gap-3 p-3 rounded-xl border', hasResume ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-amber-500/30 bg-amber-500/5')}>
            <FileText className={cn('size-4 mt-0.5 shrink-0', hasResume ? 'text-emerald-500' : 'text-amber-500')} />
            <div>
              <p className={cn('text-xs font-medium', hasResume ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400')}>
                {hasResume ? 'Using ' + resume.contact.fullName + "'s resume" : 'No resume data yet'}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {hasResume ? resume.experience.length + ' roles \u2022 ' + resume.skills.length + ' skills' : 'Build your resume with the Coach first'}
              </p>
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Target className="size-3" /> Target Job Description
            </h3>
            <Textarea value={interviewJobDescription} onChange={(e) => setInterviewJobDescription(e.target.value)}
              placeholder="Paste the job description you're interviewing for..." className="min-h-[200px] text-sm resize-none" />
            <p className="text-[10px] text-muted-foreground">
              {interviewJobDescription.length > 0 ? interviewJobDescription.split(/\s+/).filter(Boolean).length + ' words' : 'Paste at least a few sentences'}
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="size-3" /> What You'll Get
            </h3>
            <div className="space-y-1.5">
              {featureList.map(function (item) {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Icon className={cn('size-3.5', item.color)} /><span>{item.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="flex items-start gap-2 p-3 rounded-xl border border-destructive/30 bg-destructive/5">
                <AlertCircle className="size-4 text-destructive shrink-0 mt-0.5" />
                <p className="text-xs text-destructive">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>
          <Button onClick={handleGenerate} disabled={!canGenerate}
            className="w-full gap-2 h-10 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white shadow-md shadow-orange-500/20">
            {interviewGenerating
              ? <><Loader2 className="size-4 animate-spin" />Generating questions...</>
              : <><Mic className="size-4" />{interviewResult ? 'Regenerate' : 'Generate Interview Prep'}</>}
          </Button>
        </div>
      </div>
      <div className="flex-1 overflow-auto bg-muted/30">
        <AnimatePresence mode="wait">
          {interviewGenerating ? (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center h-full gap-4">
              <div className="size-16 rounded-2xl bg-gradient-to-br from-orange-500/20 to-red-500/20 flex items-center justify-center">
                <Mic className="size-7 text-orange-500 animate-pulse" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium">Preparing your interview...</p>
                <p className="text-xs text-muted-foreground mt-1">Crafting questions and STAR answers from your experience</p>
              </div>
            </motion.div>
          ) : interviewResult ? (
            <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <InterviewResults result={interviewResult} />
            </motion.div>
          ) : (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center h-full text-center gap-4">
              <div className="rounded-full bg-muted p-6"><Mic className="size-10 text-muted-foreground" /></div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">Your interview prep will appear here</h3>
                <p className="text-sm text-muted-foreground max-w-sm">Paste a job description and click Generate to get personalized questions with STAR-method answers.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function InterviewResults({ result }: { result: InterviewResult }) {
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const categories = ['all', 'behavioral', 'technical', 'situational', 'role-specific'];
  const filtered = activeFilter === 'all' ? result.questions : result.questions.filter(function (q) { return q.category === activeFilter; });

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-5 rounded-2xl bg-card border border-border/50">
        <div className="flex items-start gap-4">
          <div className="size-12 rounded-xl bg-gradient-to-br from-orange-500/20 to-red-500/20 flex items-center justify-center shrink-0">
            <Zap className="size-5 text-orange-500" />
          </div>
          <div>
            <h3 className="text-sm font-semibold mb-1">Readiness Assessment</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">{result.overallReadiness}</p>
          </div>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
        {categories.map(function (cat) {
          const meta = CATEGORY_META[cat];
          const count = cat === 'all' ? result.questions.length : result.questions.filter(function (q) { return q.category === cat; }).length;
          const isActive = activeFilter === cat;
          const CatIcon = meta ? meta.icon : Brain;
          return (
            <button key={cat} onClick={function () { setActiveFilter(cat); }}
              className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium border transition-all whitespace-nowrap shrink-0',
                isActive ? 'bg-foreground text-background border-foreground' : 'bg-card border-border/50 text-muted-foreground hover:text-foreground')}>
              {meta && <CatIcon className="size-3" />}
              {cat === 'all' ? 'All' : (meta ? meta.label : cat)}
              <span className={cn('text-[9px] px-1 py-0.5 rounded-full', isActive ? 'bg-background/20' : 'bg-muted')}>{count}</span>
            </button>
          );
        })}
      </motion.div>

      <div className="space-y-4">
        {filtered.map(function (q, i) {
          return (
            <motion.div key={q.category + '-' + i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.05 }}>
              <QuestionCard question={q} index={i} />
            </motion.div>
          );
        })}
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
        className="p-5 rounded-2xl bg-card border border-border/50">
        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
          <Lightbulb className="size-4 text-amber-500" /> Preparation Tips
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {result.prepTips.map(function (tip, i) {
            const meta = TIP_META[tip.category] || TIP_META.content;
            const TipIcon = meta.icon;
            return (
              <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.75 + i * 0.06 }}
                className="flex items-start gap-2.5 p-3 rounded-xl border border-border/50 bg-background">
                <TipIcon className={cn('size-4 mt-0.5 shrink-0', meta.color)} />
                <div>
                  <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">{tip.category}</span>
                  <p className="text-xs text-foreground leading-relaxed mt-0.5">{tip.tip}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}

const STAR_FIELDS = [
  { key: 'situation' as const, label: 'Situation', color: 'border-l-blue-500 bg-blue-500/5', letter: 'S' },
  { key: 'task' as const, label: 'Task', color: 'border-l-violet-500 bg-violet-500/5', letter: 'T' },
  { key: 'action' as const, label: 'Action', color: 'border-l-amber-500 bg-amber-500/5', letter: 'A' },
  { key: 'result' as const, label: 'Result', color: 'border-l-emerald-500 bg-emerald-500/5', letter: 'R' },
];

function QuestionCard({ question: q, index }: { question: InterviewQuestion; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const meta = CATEGORY_META[q.category] || CATEGORY_META.behavioral;
  const diff = DIFFICULTY_META[q.difficulty] || DIFFICULTY_META.medium;
  const CatIcon = meta.icon;

  return (
    <div className={cn('rounded-2xl border bg-card overflow-hidden transition-all', expanded ? 'border-border shadow-lg' : 'border-border/50')}>
      <button onClick={function () { setExpanded(!expanded); }} className="w-full text-left p-4 flex items-start gap-3 hover:bg-muted/30 transition-colors">
        <div className={cn('size-8 rounded-lg flex items-center justify-center shrink-0 text-sm font-bold', meta.bg, meta.color)}>
          {index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1.5">
            <span className={cn('text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full border flex items-center gap-1', meta.bg, meta.color)}>
              <CatIcon className="size-2.5" /> {meta.label}
            </span>
            <span className={cn('text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full', diff.bg, diff.color)}>{q.difficulty}</span>
          </div>
          <p className="text-sm font-medium text-foreground leading-relaxed pr-6">{q.question}</p>
        </div>
        <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }} className="shrink-0 mt-1">
          <ChevronDown className="size-4 text-muted-foreground" />
        </motion.div>
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
            <div className="px-4 pb-4 space-y-4">
              <div className="flex items-start gap-2 p-3 rounded-xl bg-muted/30 border border-border/30">
                <HelpCircle className="size-3.5 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-0.5">Why interviewers ask this</p>
                  <p className="text-xs text-foreground/80 leading-relaxed">{q.whyAsked}</p>
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="text-xs font-semibold flex items-center gap-1.5">
                  <BarChart3 className="size-3.5 text-violet-500" /> STAR Method Answer
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {STAR_FIELDS.map(function (field) {
                    return (
                      <div key={field.key} className={cn('p-3 rounded-xl border-l-[3px] border border-border/30', field.color)}>
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="text-[10px] font-bold bg-foreground/10 size-5 rounded flex items-center justify-center">{field.letter}</span>
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{field.label}</span>
                        </div>
                        <p className="text-xs text-foreground/80 leading-relaxed">{q.starAnswer[field.key]}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
                  <h4 className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-2 flex items-center gap-1">
                    <CheckCircle2 className="size-3" /> Key Points
                  </h4>
                  <ul className="space-y-1.5">
                    {q.keyPoints.map(function (p, i) {
                      return (
                        <li key={i} className="flex items-start gap-1.5 text-xs text-foreground/80">
                          <ChevronRight className="size-3 text-emerald-500 shrink-0 mt-0.5" /><span>{p}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
                <div className="p-3 rounded-xl border border-red-500/20 bg-red-500/5">
                  <h4 className="text-[10px] font-semibold uppercase tracking-wider text-red-600 dark:text-red-400 mb-2 flex items-center gap-1">
                    <AlertTriangle className="size-3" /> Avoid
                  </h4>
                  <ul className="space-y-1.5">
                    {q.mistakes.map(function (m, i) {
                      return (
                        <li key={i} className="flex items-start gap-1.5 text-xs text-foreground/80">
                          <ChevronRight className="size-3 text-red-500 shrink-0 mt-0.5" /><span>{m}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
              <div className="flex items-start gap-2 p-3 rounded-xl border border-amber-500/20 bg-amber-500/5">
                <MessageCircle className="size-3.5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-0.5">Likely follow-up</p>
                  <p className="text-xs text-foreground/80 leading-relaxed italic">&ldquo;{q.followUp}&rdquo;</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
