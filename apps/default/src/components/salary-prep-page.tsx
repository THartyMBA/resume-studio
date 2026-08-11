import { useState } from 'react';
import { useResumeStore, type SalaryResult, type SalaryTalkingPoint } from '@/stores/resume-store';
import { Button } from '@/components/ui/button';
import {
  DollarSign, FileText, Sparkles, Loader2, AlertCircle, TrendingUp, TrendingDown,
  Minus, Target, MessageSquare, Shield, Clock, AlertTriangle, ChevronDown,
  Briefcase, MapPin, Calendar, Copy, Check, Zap, ArrowRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { toast } from 'sonner';

const IMPACT_META: Record<string, { color: string; bg: string; label: string }> = {
  high: { color: 'text-emerald-500', bg: 'bg-emerald-500/10 border-emerald-500/20', label: 'High Impact' },
  medium: { color: 'text-amber-500', bg: 'bg-amber-500/10 border-amber-500/20', label: 'Medium' },
  low: { color: 'text-slate-400', bg: 'bg-slate-400/10 border-slate-400/20', label: 'Low' },
};
const TREND_ICON = { up: TrendingUp, stable: Minus, down: TrendingDown };
const TREND_COLOR = { up: 'text-emerald-500', stable: 'text-amber-500', down: 'text-red-500' };
const CONFIDENCE_META = {
  strong: { color: 'text-emerald-500', bg: 'bg-emerald-500/10', label: '🟢 Strong data' },
  moderate: { color: 'text-amber-500', bg: 'bg-amber-500/10', label: '🟡 Moderate data' },
  limited: { color: 'text-red-500', bg: 'bg-red-500/10', label: '🔴 Limited data' },
};

function formatCurrency(num: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(num);
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={handleCopy} className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors shrink-0" title="Copy script">
      {copied ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
    </button>
  );
}

export function SalaryPrepPage() {
  const {
    resume, salaryTargetRole, salaryLocation, salaryYearsExp, salaryResult, salaryResearching,
    setSalaryTargetRole, setSalaryLocation, setSalaryYearsExp, setSalaryResult, setSalaryResearching,
  } = useResumeStore();
  const [error, setError] = useState('');
  const [expandedTP, setExpandedTP] = useState<number | null>(null);
  const [expandedCO, setExpandedCO] = useState<number | null>(null);

  const hasResume = resume.contact.fullName || resume.summary || resume.experience.length > 0;
  const canResearch = salaryTargetRole.trim().length > 2 && salaryLocation.trim().length > 1 && salaryYearsExp.trim().length > 0 && !salaryResearching;

  const buildResumeText = () => {
    const p = [resume.contact.fullName];
    if (resume.summary) p.push('\nSUMMARY\n' + resume.summary);
    if (resume.experience.length > 0) { p.push('\nEXPERIENCE'); resume.experience.forEach(e => { p.push(`${e.title} at ${e.company} (${e.startDate}-${e.endDate})`); e.bullets.forEach(b => p.push('• ' + b)); }); }
    if (resume.skills.length > 0) p.push('\nSKILLS\n' + resume.skills.join(', '));
    return p.join('\n');
  };

  const handleResearch = async () => {
    setError(''); setSalaryResearching(true); setSalaryResult(null);
    try {
      const resp = await axios.post('/api/taskade/webhooks/01KQWQQTX94ZXSTHJNAM17G97A/run', {
        targetRole: salaryTargetRole, location: salaryLocation, yearsExperience: salaryYearsExp,
        resumeText: hasResume ? buildResumeText() : '',
      });
      const raw = resp.data?.output?.result || resp.data?.result;
      if (!raw) { setError('Empty response. Try again.'); return; }
      setSalaryResult(typeof raw === 'string' ? JSON.parse(raw) : raw);
    } catch (e: any) { console.error(e); setError(e?.response?.data?.message || 'Research failed. Try again.'); }
    finally { setSalaryResearching(false); }
  };

  const features = [
    { icon: TrendingUp, label: 'Market salary range & percentiles', color: 'text-emerald-500' },
    { icon: MessageSquare, label: 'Word-for-word negotiation scripts', color: 'text-blue-500' },
    { icon: Shield, label: 'Counter-offer strategies', color: 'text-violet-500' },
    { icon: Clock, label: 'Timing & red flag warnings', color: 'text-amber-500' },
  ];

  return (
    <div className="flex flex-col md:flex-row h-full overflow-hidden">
      {/* Left: Input */}
      <div className="w-full md:w-[380px] lg:w-[420px] border-r border-border/50 flex flex-col overflow-hidden">
        <div className="px-5 py-4 border-b border-border/50">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center"><DollarSign className="size-4 text-white" /></div>
            <div><h2 className="text-sm font-semibold">Salary Negotiation Prep</h2><p className="text-[10px] text-muted-foreground">Research market rates & get negotiation talking points</p></div>
          </div>
        </div>
        <div className="flex-1 overflow-auto p-5 space-y-5">
          <div className={cn('flex items-start gap-3 p-3 rounded-xl border', hasResume ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-amber-500/30 bg-amber-500/5')}>
            <FileText className={cn('size-4 mt-0.5 shrink-0', hasResume ? 'text-emerald-500' : 'text-amber-500')} />
            <div>
              <p className={cn('text-xs font-medium', hasResume ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400')}>
                {hasResume ? `Using ${resume.contact.fullName}'s profile` : 'No resume loaded (optional)'}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{hasResume ? `${resume.experience.length} roles • ${resume.skills.length} skills` : 'Results are more personalized with a resume'}</p>
            </div>
          </div>

          <div className="space-y-3">
            <InputField icon={Briefcase} label="Target Role" value={salaryTargetRole} onChange={setSalaryTargetRole} placeholder="e.g. Senior Software Engineer" />
            <InputField icon={MapPin} label="Location" value={salaryLocation} onChange={setSalaryLocation} placeholder="e.g. San Francisco, CA or Remote" />
            <InputField icon={Calendar} label="Years of Experience" value={salaryYearsExp} onChange={setSalaryYearsExp} placeholder="e.g. 5" />
          </div>

          <AnimatePresence>{error && (<motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-start gap-2 p-3 rounded-xl border border-destructive/30 bg-destructive/5"><AlertCircle className="size-4 text-destructive shrink-0 mt-0.5" /><p className="text-xs text-destructive">{error}</p></motion.div>)}</AnimatePresence>

          <Button onClick={handleResearch} disabled={!canResearch} className="w-full gap-2 h-10 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-md shadow-emerald-500/20">
            {salaryResearching ? <><Loader2 className="size-4 animate-spin" />Researching market data...</> : <><Sparkles className="size-4" />{salaryResult ? 'Re-research' : 'Research Salary Data'}</>}
          </Button>

          {!salaryResult && (<div className="space-y-2 pt-2"><p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">What you'll get</p>{features.map((f, i) => (<div key={i} className="flex items-center gap-2"><f.icon className={cn('size-3.5', f.color)} /><span className="text-xs text-muted-foreground">{f.label}</span></div>))}</div>)}
        </div>
      </div>

      {/* Right: Results */}
      <div className="flex-1 overflow-auto bg-muted/30">
        <AnimatePresence mode="wait">
          {salaryResearching ? (<LoadingState />) : salaryResult ? (
            <motion.div key="results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-5 sm:p-6 max-w-4xl mx-auto space-y-6">
              <ResultsView result={salaryResult} role={salaryTargetRole} loc={salaryLocation} expandedTP={expandedTP} setExpandedTP={setExpandedTP} expandedCO={expandedCO} setExpandedCO={setExpandedCO} />
            </motion.div>
          ) : (<EmptyState />)}
        </AnimatePresence>
      </div>
    </div>
  );
}

function InputField({ icon: Icon, label, value, onChange, placeholder }: { icon: any; label: string; value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5"><Icon className="size-3" /> {label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full text-sm px-3 py-2.5 rounded-lg bg-background border border-border/50 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all" />
    </div>
  );
}

function LoadingState() {
  return (
    <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center h-full gap-4">
      <div className="relative">
        <div className="size-16 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-600/20 flex items-center justify-center"><Loader2 className="size-8 text-emerald-500 animate-spin" /></div>
        <div className="absolute inset-0 rounded-full bg-emerald-500/10 animate-ping" />
      </div>
      <div className="text-center"><p className="text-sm font-medium">Researching salary data…</p><p className="text-xs text-muted-foreground mt-1">Searching compensation databases & market reports</p></div>
    </motion.div>
  );
}

function EmptyState() {
  return (
    <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center h-full gap-4 p-8">
      <div className="rounded-full bg-muted p-6"><DollarSign className="size-10 text-muted-foreground" /></div>
      <div className="text-center"><h3 className="font-semibold text-foreground mb-1">Ready to negotiate</h3><p className="text-sm text-muted-foreground max-w-sm">Enter your target role and location to get personalized salary data, market insights, and word-for-word negotiation scripts.</p></div>
    </motion.div>
  );
}

function ResultsView({ result, role, loc, expandedTP, setExpandedTP, expandedCO, setExpandedCO }: {
  result: SalaryResult; role: string; loc: string;
  expandedTP: number | null; setExpandedTP: (v: number | null) => void;
  expandedCO: number | null; setExpandedCO: (v: number | null) => void;
}) {
  const conf = CONFIDENCE_META[result.confidenceLevel] || CONFIDENCE_META.moderate;
  const r = result.salaryRange;
  const span = r.high - r.low;
  const medPct = span > 0 ? ((r.median - r.low) / span) * 100 : 50;

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h2 className="text-lg font-bold flex items-center gap-2"><DollarSign className="size-5 text-emerald-500" /> Salary Report</h2><p className="text-xs text-muted-foreground mt-0.5">{role} • {loc}</p></div>
        <span className={cn('text-[10px] font-medium px-2.5 py-1 rounded-full border', conf.bg, conf.color)}>{conf.label}</span>
      </div>

      {/* Range Card */}
      <div className="bg-card rounded-xl border border-border/50 p-5 space-y-4">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5"><Target className="size-3" /> Market Salary Range</h3>
        <div className="flex items-end justify-between gap-4">
          <div className="text-center"><p className="text-[10px] text-muted-foreground">Low</p><p className="text-lg font-bold text-muted-foreground">{formatCurrency(r.low)}</p></div>
          <div className="text-center flex-1"><p className="text-[10px] text-emerald-500 font-medium">Median</p><p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(r.median)}</p></div>
          <div className="text-center"><p className="text-[10px] text-muted-foreground">High</p><p className="text-lg font-bold text-muted-foreground">{formatCurrency(r.high)}</p></div>
        </div>
        <div className="relative h-3 bg-muted rounded-full overflow-hidden">
          <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-slate-400 via-emerald-500 to-green-600 rounded-full" style={{ width: '100%' }} />
          <div className="absolute top-1/2 -translate-y-1/2 size-4 bg-white border-2 border-emerald-500 rounded-full shadow-md" style={{ left: `calc(${medPct}% - 8px)` }} />
        </div>
      </div>

      {/* Total Comp */}
      <div className="bg-card rounded-xl border border-border/50 p-5 space-y-3">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">💰 Total Compensation</h3>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Base Salary', value: result.totalCompensation.baseSalary, icon: DollarSign, color: 'text-emerald-500' },
            { label: 'Bonus', value: result.totalCompensation.bonus, icon: Zap, color: 'text-amber-500' },
            { label: 'Equity/Stock', value: result.totalCompensation.equity, icon: TrendingUp, color: 'text-violet-500' },
            { label: 'Benefits', value: result.totalCompensation.benefits, icon: Shield, color: 'text-blue-500' },
          ].map(item => (
            <div key={item.label} className="p-3 rounded-lg bg-muted/50 border border-border/30">
              <div className="flex items-center gap-1.5 mb-1"><item.icon className={cn('size-3', item.color)} /><p className="text-[10px] text-muted-foreground font-medium">{item.label}</p></div>
              <p className="text-xs font-semibold">{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Market Insights */}
      {result.marketInsights?.length > 0 && (
        <div className="bg-card rounded-xl border border-border/50 p-5 space-y-3">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5"><TrendingUp className="size-3" /> Market Insights</h3>
          <div className="space-y-2">{result.marketInsights.map((ins, i) => { const TI = TREND_ICON[ins.trend] || Minus; const tc = TREND_COLOR[ins.trend] || 'text-muted-foreground'; return (
            <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-border/30"><TI className={cn('size-4 mt-0.5 shrink-0', tc)} /><div className="min-w-0"><p className="text-xs font-semibold">{ins.title}</p><p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{ins.detail}</p></div></div>
          ); })}</div>
        </div>
      )}

      {/* Talking Points */}
      {result.negotiationTalkingPoints?.length > 0 && (
        <div className="bg-card rounded-xl border border-border/50 p-5 space-y-3">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5"><MessageSquare className="size-3" /> Negotiation Talking Points</h3>
          <div className="space-y-2">{result.negotiationTalkingPoints.map((tp: SalaryTalkingPoint, i: number) => { const im = IMPACT_META[tp.impact] || IMPACT_META.medium; const isExp = expandedTP === i; return (
            <div key={i} className={cn('rounded-lg border transition-all', im.bg)}>
              <button onClick={() => setExpandedTP(isExp ? null : i)} className="w-full flex items-start gap-3 p-3 text-left">
                <span className={cn('text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0 mt-0.5', im.bg, im.color)}>{im.label}</span>
                <div className="flex-1 min-w-0"><p className="text-xs font-semibold">{tp.point}</p><p className="text-[10px] text-muted-foreground mt-0.5">{tp.category}</p></div>
                <ChevronDown className={cn('size-3.5 text-muted-foreground shrink-0 mt-0.5 transition-transform', isExp && 'rotate-180')} />
              </button>
              <AnimatePresence>{isExp && (<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><div className="px-3 pb-3 pt-0"><div className="p-3 rounded-lg bg-background/80 border border-border/30"><div className="flex items-center justify-between mb-1.5"><p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">💬 What to say</p><CopyButton text={tp.script} /></div><p className="text-xs text-foreground italic leading-relaxed">"{tp.script}"</p></div></div></motion.div>)}</AnimatePresence>
            </div>
          ); })}</div>
        </div>
      )}

      {/* Counter-Offer Strategies */}
      {result.counterOfferStrategies?.length > 0 && (
        <div className="bg-card rounded-xl border border-border/50 p-5 space-y-3">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5"><Shield className="size-3" /> Counter-Offer Strategies</h3>
          <div className="space-y-2">{result.counterOfferStrategies.map((co, i) => { const isExp = expandedCO === i; return (
            <div key={i} className="rounded-lg border border-violet-500/20 bg-violet-500/5">
              <button onClick={() => setExpandedCO(isExp ? null : i)} className="w-full flex items-start gap-3 p-3 text-left">
                <ArrowRight className="size-4 text-violet-500 shrink-0 mt-0.5" /><div className="flex-1 min-w-0"><p className="text-xs font-semibold">If: {co.scenario}</p></div>
                <ChevronDown className={cn('size-3.5 text-muted-foreground shrink-0 mt-0.5 transition-transform', isExp && 'rotate-180')} />
              </button>
              <AnimatePresence>{isExp && (<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><div className="px-3 pb-3 space-y-2"><div className="p-3 rounded-lg bg-background/80 border border-border/30"><div className="flex items-center justify-between mb-1"><p className="text-[10px] font-medium text-emerald-500 uppercase tracking-wider">✅ Response</p><CopyButton text={co.response} /></div><p className="text-xs italic leading-relaxed">"{co.response}"</p></div><div className="p-2.5 rounded-lg bg-muted/50"><p className="text-[10px] text-muted-foreground"><span className="font-medium">Why:</span> {co.reasoning}</p></div></div></motion.div>)}</AnimatePresence>
            </div>
          ); })}</div>
        </div>
      )}

      {/* Timing */}
      {result.timingAdvice && (<div className="bg-card rounded-xl border border-amber-500/20 bg-amber-500/5 p-5 space-y-2"><h3 className="text-xs font-semibold flex items-center gap-1.5"><Clock className="size-3 text-amber-500" /> Timing Advice</h3><p className="text-xs text-muted-foreground leading-relaxed">{result.timingAdvice}</p></div>)}

      {/* Red Flags */}
      {result.redFlags?.length > 0 && (<div className="bg-card rounded-xl border border-red-500/20 bg-red-500/5 p-5 space-y-2"><h3 className="text-xs font-semibold flex items-center gap-1.5"><AlertTriangle className="size-3 text-red-500" /> Red Flags to Watch For</h3><div className="space-y-1.5">{result.redFlags.map((flag, i) => (<div key={i} className="flex items-start gap-2"><span className="text-red-500 text-xs mt-0.5">⚠️</span><p className="text-xs text-muted-foreground">{flag}</p></div>))}</div></div>)}
    </>
  );
}
