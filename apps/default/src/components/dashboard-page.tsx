import { useEffect, useMemo } from 'react';
import { useAuth } from 'react-oidc-context';
import { useResumeStore } from '@/stores/resume-store';
import { useJobTrackerStore, STAGES, type Stage } from '@/stores/job-tracker-store';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  FileText, Briefcase, Mic, GitBranch, ArrowRight,
  TrendingUp, Clock, Sparkles, CheckCircle2, XCircle,
  Phone, MessageSquare, Trophy, ChevronRight,
} from 'lucide-react';

const stagger = {
  container: { hidden: {}, show: { transition: { staggerChildren: 0.06 } } },
  item: { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } } },
};

function StatCard({ icon: Icon, label, value, sub, gradient, onClick }: {
  icon: any; label: string; value: string | number; sub?: string;
  gradient: string; onClick?: () => void;
}) {
  return (
    <motion.button
      variants={stagger.item}
      onClick={onClick}
      className={cn(
        'relative group text-left p-5 rounded-2xl border border-border/40 overflow-hidden transition-all',
        'hover:border-border hover:shadow-lg hover:shadow-primary/5 hover:scale-[1.02]',
        onClick && 'cursor-pointer'
      )}
    >
      <div className={cn('absolute inset-0 opacity-[0.06] group-hover:opacity-[0.1] transition-opacity', gradient)} />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-3xl font-bold tracking-tight">{value}</p>
          <p className="text-xs font-medium text-muted-foreground mt-1">{label}</p>
          {sub && <p className="text-[10px] text-muted-foreground/70 mt-0.5">{sub}</p>}
        </div>
        <div className={cn('size-10 rounded-xl flex items-center justify-center bg-gradient-to-br', gradient)}>
          <Icon className="size-5 text-white" />
        </div>
      </div>
      {onClick && (
        <div className="absolute bottom-3 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <ChevronRight className="size-4 text-muted-foreground" />
        </div>
      )}
    </motion.button>
  );
}

function PipelineStage({ label, count, color, isLast }: {
  label: string; count: number; color: string; isLast: boolean;
}) {
  const hasItems = count > 0;
  return (
    <motion.div variants={stagger.item} className="flex items-center gap-2">
      <div className={cn(
        'flex flex-col items-center gap-1.5 px-4 py-3 rounded-xl border transition-all min-w-[100px]',
        hasItems ? 'border-border/50 bg-card' : 'border-border/20 bg-muted/30 opacity-60'
      )}>
        <span className={cn('text-2xl font-bold', color)}>{count}</span>
        <span className="text-[10px] font-medium text-muted-foreground whitespace-nowrap">{label}</span>
      </div>
      {!isLast && <ArrowRight className="size-4 text-muted-foreground/40 shrink-0" />}
    </motion.div>
  );
}

function ActivityItem({ icon: Icon, title, time, color }: {
  icon: any; title: string; time: string; color: string;
}) {
  return (
    <motion.div variants={stagger.item} className="flex items-start gap-3 py-2.5">
      <div className={cn('size-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5', color)}>
        <Icon className="size-3.5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium leading-snug">{title}</p>
        <p className="text-[10px] text-muted-foreground mt-0.5">{time}</p>
      </div>
    </motion.div>
  );
}

function VersionCard({ name, targetRole, updatedAt, isActive, onClick }: {
  name: string; targetRole: string; updatedAt: string; isActive: boolean; onClick: () => void;
}) {
  return (
    <motion.button variants={stagger.item} onClick={onClick}
      className={cn('w-full text-left p-3.5 rounded-xl border transition-all hover:shadow-md',
        isActive ? 'border-primary/40 bg-primary/5 shadow-sm shadow-primary/10' : 'border-border/40 bg-card hover:border-border'
      )}>
      <div className="flex items-center gap-2">
        {isActive && <div className="size-1.5 rounded-full bg-primary shrink-0" />}
        <span className={cn('text-xs font-semibold truncate', isActive ? 'text-primary' : 'text-foreground')}>{name}</span>
      </div>
      {targetRole && (
        <p className="text-[10px] text-muted-foreground mt-1 truncate flex items-center gap-1">
          <Briefcase className="size-2.5 shrink-0" />{targetRole}
        </p>
      )}
      <p className="text-[9px] text-muted-foreground/60 mt-1 flex items-center gap-1">
        <Clock className="size-2.5 shrink-0" />{formatRelative(updatedAt)}
      </p>
    </motion.button>
  );
}

function formatRelative(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

const PIPELINE_COLORS: Record<Stage, string> = {
  applied: 'text-blue-500', phone: 'text-violet-500', interview: 'text-amber-500',
  offer: 'text-emerald-500', rejected: 'text-red-500',
};

export function DashboardPage() {
  const auth = useAuth();
  const { resume, versions, activeVersionId, setActiveView, loadVersion } = useResumeStore();
  const { jobs, fetchJobs } = useJobTrackerStore();

  const userName = auth.user?.profile?.name || auth.user?.profile?.preferred_username || 'there';
  const firstName = userName.split(' ')[0];

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  const stats = useMemo(() => {
    const totalVersions = versions.length;
    const hasResume = !!(resume.contact.fullName || resume.summary || resume.experience.length);
    const pipelineCounts: Record<Stage, number> = { applied: 0, phone: 0, interview: 0, offer: 0, rejected: 0 };
    jobs.forEach((j) => { pipelineCounts[j.stage]++; });
    const activeJobs = jobs.filter((j) => j.stage !== 'rejected').length;
    return {
      totalVersions, hasResume, activeJobs,
      interviewCount: pipelineCounts.interview,
      offerCount: pipelineCounts.offer,
      totalJobs: jobs.length, pipelineCounts,
    };
  }, [versions, resume, jobs]);

  const activities = useMemo(() => {
    const items: { icon: any; title: string; time: string; color: string; date: Date }[] = [];
    const iconMap: Record<Stage, any> = { applied: Briefcase, phone: Phone, interview: Mic, offer: Trophy, rejected: XCircle };
    const colorMap: Record<Stage, string> = {
      applied: 'bg-blue-500/15 text-blue-500', phone: 'bg-violet-500/15 text-violet-500',
      interview: 'bg-amber-500/15 text-amber-500', offer: 'bg-emerald-500/15 text-emerald-500',
      rejected: 'bg-red-500/15 text-red-500',
    };
    versions.forEach((v) => {
      items.push({ icon: GitBranch, title: `Saved "${v.name}"${v.targetRole ? ` for ${v.targetRole}` : ''}`,
        time: formatRelative(v.updatedAt), color: 'bg-violet-500/15 text-violet-500', date: new Date(v.updatedAt) });
    });
    jobs.forEach((j) => {
      const sl = STAGES.find((s) => s.id === j.stage)?.label || j.stage;
      items.push({ icon: iconMap[j.stage] || Briefcase, title: `${j.role} at ${j.company} — ${sl}`,
        time: j.dateApplied ? formatRelative(new Date(j.dateApplied).toISOString()) : 'recently',
        color: colorMap[j.stage] || 'bg-muted text-muted-foreground', date: j.dateApplied ? new Date(j.dateApplied) : new Date() });
    });
    items.sort((a, b) => b.date.getTime() - a.date.getTime());
    return items.slice(0, 8);
  }, [versions, jobs]);

  const hasNoData = !stats.hasResume && stats.totalVersions === 0 && stats.totalJobs === 0;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="h-full overflow-auto">
      <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        {/* Greeting */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{greeting}, {firstName} 👋</h1>
          <p className="text-sm text-muted-foreground mt-1.5">
            {hasNoData ? "Welcome to ResumeForge. Let's build your career story." : "Here's your career snapshot at a glance."}
          </p>
        </motion.div>

        {/* Stat Cards */}
        <motion.div variants={stagger.container} initial="hidden" animate="show" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={FileText} label="Resume Versions" value={stats.totalVersions}
            sub={stats.hasResume ? 'Active resume loaded' : 'No resume yet'} gradient="from-blue-500 to-cyan-500" onClick={() => setActiveView('editor')} />
          <StatCard icon={Briefcase} label="Active Applications" value={stats.activeJobs}
            sub={`${stats.totalJobs} total tracked`} gradient="from-violet-500 to-fuchsia-500" onClick={() => setActiveView('tracker')} />
          <StatCard icon={Mic} label="Interviews" value={stats.interviewCount}
            sub={stats.interviewCount ? 'Prep with AI Coach →' : 'None yet'} gradient="from-amber-500 to-orange-500" onClick={() => setActiveView('interview')} />
          <StatCard icon={Trophy} label="Offers" value={stats.offerCount}
            sub={stats.offerCount ? 'Negotiate your best deal →' : 'Keep pushing!'} gradient="from-emerald-500 to-teal-500" onClick={() => setActiveView('salary')} />
        </motion.div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Pipeline */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="rounded-2xl border border-border/40 bg-card/50 p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2"><TrendingUp className="size-4 text-primary" /><h2 className="text-sm font-semibold">Job Pipeline</h2></div>
                <button onClick={() => setActiveView('tracker')} className="text-[10px] font-medium text-primary hover:text-primary/80 transition-colors flex items-center gap-1">
                  View all <ArrowRight className="size-3" />
                </button>
              </div>
              {stats.totalJobs === 0 ? (
                <div className="flex flex-col items-center py-8 text-center">
                  <div className="size-12 rounded-xl bg-muted/50 flex items-center justify-center mb-3"><Briefcase className="size-5 text-muted-foreground/50" /></div>
                  <p className="text-xs font-medium text-muted-foreground">No applications tracked yet</p>
                  <p className="text-[10px] text-muted-foreground/70 mt-1 max-w-[240px]">Start tracking your job applications to see your pipeline here</p>
                  <button onClick={() => setActiveView('tracker')} className="mt-3 text-[11px] font-medium px-4 py-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">Add Application</button>
                </div>
              ) : (
                <motion.div variants={stagger.container} initial="hidden" animate="show" className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                  {STAGES.map((s, i) => (
                    <PipelineStage key={s.id} label={s.label} count={stats.pipelineCounts[s.id]} color={PIPELINE_COLORS[s.id]} isLast={i === STAGES.length - 1} />
                  ))}
                </motion.div>
              )}
            </motion.div>

            {/* Quick Actions */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {([
                { icon: MessageSquare, label: 'AI Coach', view: 'chat' as const, color: 'from-blue-500/20 to-cyan-500/20 text-blue-500' },
                { icon: FileText, label: 'Edit Resume', view: 'editor' as const, color: 'from-violet-500/20 to-fuchsia-500/20 text-violet-500' },
                { icon: CheckCircle2, label: 'ATS Check', view: 'ats' as const, color: 'from-emerald-500/20 to-teal-500/20 text-emerald-500' },
                { icon: Sparkles, label: 'Cover Letter', view: 'cover-letter' as const, color: 'from-amber-500/20 to-orange-500/20 text-amber-500' },
              ]).map((a) => (
                <button key={a.view} onClick={() => setActiveView(a.view)}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border/30 bg-card/30 hover:bg-card hover:border-border/60 hover:shadow-md transition-all group">
                  <div className={cn('size-9 rounded-lg bg-gradient-to-br flex items-center justify-center group-hover:scale-110 transition-transform', a.color)}>
                    <a.icon className="size-4" />
                  </div>
                  <span className="text-[11px] font-medium text-muted-foreground group-hover:text-foreground transition-colors">{a.label}</span>
                </button>
              ))}
            </motion.div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Versions */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
              className="rounded-2xl border border-border/40 bg-card/50 p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2"><GitBranch className="size-4 text-primary" /><h2 className="text-sm font-semibold">Versions</h2></div>
                <span className="text-[10px] text-muted-foreground px-1.5 py-0.5 rounded-full bg-muted">{stats.totalVersions}</span>
              </div>
              {stats.totalVersions === 0 ? (
                <div className="text-center py-6">
                  <p className="text-xs text-muted-foreground">No saved versions</p>
                  <p className="text-[10px] text-muted-foreground/70 mt-1">Save your first resume version</p>
                </div>
              ) : (
                <motion.div variants={stagger.container} initial="hidden" animate="show" className="space-y-2 max-h-[220px] overflow-auto scrollbar-none">
                  {versions.slice(-4).reverse().map((v) => (
                    <VersionCard key={v.id} name={v.name} targetRole={v.targetRole} updatedAt={v.updatedAt}
                      isActive={v.id === activeVersionId} onClick={() => { loadVersion(v.id); setActiveView('editor'); }} />
                  ))}
                </motion.div>
              )}
            </motion.div>

            {/* Activity Timeline */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
              className="rounded-2xl border border-border/40 bg-card/50 p-5">
              <div className="flex items-center gap-2 mb-3"><Clock className="size-4 text-primary" /><h2 className="text-sm font-semibold">Recent Activity</h2></div>
              {activities.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-xs text-muted-foreground">No activity yet</p>
                  <p className="text-[10px] text-muted-foreground/70 mt-1">Your actions will appear here</p>
                </div>
              ) : (
                <motion.div variants={stagger.container} initial="hidden" animate="show" className="divide-y divide-border/30 max-h-[300px] overflow-auto scrollbar-none">
                  {activities.map((a, i) => <ActivityItem key={i} {...a} />)}
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
