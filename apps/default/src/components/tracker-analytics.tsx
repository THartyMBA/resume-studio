import { useMemo } from 'react';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, AreaChart, Area, CartesianGrid,
} from 'recharts';
import { type JobApplication, type Stage, STAGES } from '@/stores/job-tracker-store';
import {
  TrendingUp, Target, XCircle, ArrowRight,
  CalendarDays, Briefcase, Percent, Trophy,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const STAGE_HEX: Record<Stage, string> = {
  applied: '#3b82f6', phone: '#8b5cf6', interview: '#f59e0b',
  offer: '#10b981', rejected: '#ef4444',
};

interface Props { jobs: JobApplication[]; }

function StatCard({ icon: Icon, label, value, sub, color, bg }: {
  icon: any; label: string; value: string | number; sub?: string; color: string; bg: string;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      className={cn('flex items-center gap-3 p-4 rounded-xl border border-border/50', bg)}>
      <div className={cn('size-10 rounded-lg flex items-center justify-center bg-background/60', color)}>
        <Icon className="size-5" />
      </div>
      <div>
        <p className="text-xl font-bold leading-tight">{value}</p>
        <p className="text-[10px] text-muted-foreground">{label}</p>
        {sub && <p className="text-[9px] text-muted-foreground/70 mt-0.5">{sub}</p>}
      </div>
    </motion.div>
  );
}

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border/50 rounded-lg shadow-xl px-3 py-2 text-xs">
      {label && <p className="font-semibold text-foreground mb-1">{label}</p>}
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center gap-1.5">
          <div className="size-2 rounded-full" style={{ backgroundColor: p.color || p.fill }} />
          <span className="text-muted-foreground">{p.name || p.dataKey}:</span>
          <span className="font-semibold">{p.value}</span>
        </div>
      ))}
    </div>
  );
}

function FunnelStep({ stage, count, total, maxCount, isLast }: {
  stage: typeof STAGES[number]; count: number; total: number; maxCount: number; isLast: boolean;
}) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  const widthPct = maxCount > 0 ? Math.max(8, (count / maxCount) * 100) : 8;
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <span className={cn('text-xs font-semibold', stage.color)}>{stage.label}</span>
          <span className="text-[10px] text-muted-foreground">{count} ({pct}%)</span>
        </div>
        <div className="w-full bg-muted/30 rounded-full h-5 overflow-hidden">
          <motion.div initial={{ width: 0 }} animate={{ width: `${widthPct}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="h-full rounded-full flex items-center justify-end pr-2"
            style={{ backgroundColor: STAGE_HEX[stage.id] }}>
            {widthPct > 20 && <span className="text-[9px] font-bold text-white">{count}</span>}
          </motion.div>
        </div>
      </div>
      {!isLast && <ArrowRight className="size-3.5 text-muted-foreground/40 shrink-0" />}
    </div>
  );
}

export function TrackerAnalytics({ jobs }: Props) {
  const stageData = useMemo(() => {
    const c: Record<Stage, number> = { applied: 0, phone: 0, interview: 0, offer: 0, rejected: 0 };
    jobs.forEach((j) => { if (c[j.stage] !== undefined) c[j.stage]++; });
    return STAGES.map((s) => ({ name: s.label, value: c[s.id], stage: s.id }));
  }, [jobs]);

  const funnelData = useMemo(() => {
    const c: Record<Stage, number> = { applied: 0, phone: 0, interview: 0, offer: 0, rejected: 0 };
    jobs.forEach((j) => { if (c[j.stage] !== undefined) c[j.stage]++; });
    return STAGES.filter((s) => s.id !== 'rejected').map((s) => ({ stage: s, count: c[s.id] }));
  }, [jobs]);

  const timelineData = useMemo(() => {
    const wm: Record<string, number> = {};
    jobs.forEach((j) => {
      if (!j.dateApplied) return;
      try {
        const d = new Date(j.dateApplied);
        const dow = d.getDay();
        const diff = d.getDate() - dow + (dow === 0 ? -6 : 1);
        const ws = new Date(d.setDate(diff));
        const k = ws.toISOString().slice(0, 10);
        wm[k] = (wm[k] || 0) + 1;
      } catch { /* skip */ }
    });
    return Object.entries(wm).sort(([a], [b]) => a.localeCompare(b))
      .map(([w, c]) => ({ week: new Date(w).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), applications: c }));
  }, [jobs]);

  const priorityData = useMemo(() => {
    const c = { high: 0, medium: 0, low: 0 };
    jobs.forEach((j) => { if (c[j.priority] !== undefined) c[j.priority]++; });
    return [
      { name: 'High', value: c.high, fill: '#ef4444' },
      { name: 'Medium', value: c.medium, fill: '#f59e0b' },
      { name: 'Low', value: c.low, fill: '#6b7280' },
    ].filter((d) => d.value > 0);
  }, [jobs]);

  const stats = useMemo(() => {
    const active = jobs.filter((j) => j.stage !== 'rejected');
    const offers = jobs.filter((j) => j.stage === 'offer');
    const appliedCount = stageData.find((d) => d.stage === 'applied')?.value || 0;
    const responseRate = jobs.length > 0 ? Math.round(((jobs.length - appliedCount) / jobs.length) * 100) : 0;
    const offerRate = jobs.length > 0 ? Math.round((offers.length / jobs.length) * 100) : 0;
    const dates = jobs.filter((j) => j.dateApplied).map((j) => new Date(j.dateApplied).getTime()).filter((d) => !isNaN(d));
    const avgDays = dates.length > 1 ? Math.round((Math.max(...dates) - Math.min(...dates)) / (86400000) / (dates.length - 1)) : 0;
    return { total: jobs.length, active: active.length, offers: offers.length, responseRate, offerRate, avgDays };
  }, [jobs, stageData]);

  const maxFunnel = Math.max(...funnelData.map((f) => f.count), 1);

  if (jobs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 py-16">
        <div className="size-16 rounded-full bg-muted/50 flex items-center justify-center"><TrendingUp className="size-8 text-muted-foreground/50" /></div>
        <p className="text-sm text-muted-foreground">Add applications to see analytics</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-5 overflow-auto h-full">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard icon={Briefcase} label="Total Applied" value={stats.total} color="text-blue-500" bg="bg-blue-500/5" />
        <StatCard icon={TrendingUp} label="Active Pipeline" value={stats.active} sub={`${stats.responseRate}% response rate`} color="text-violet-500" bg="bg-violet-500/5" />
        <StatCard icon={Trophy} label="Offers" value={stats.offers} sub={`${stats.offerRate}% offer rate`} color="text-emerald-500" bg="bg-emerald-500/5" />
        <StatCard icon={CalendarDays} label="Avg. Gap" value={stats.avgDays > 0 ? `${stats.avgDays}d` : '—'} sub="between applications" color="text-amber-500" bg="bg-amber-500/5" />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Donut */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="rounded-xl border border-border/50 bg-card p-5">
          <h3 className="text-xs font-semibold mb-4 flex items-center gap-1.5"><Target className="size-3.5 text-muted-foreground" /> Stage Distribution</h3>
          <div className="flex items-center gap-6">
            <div className="w-[180px] h-[180px] shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={stageData.filter((d) => d.value > 0)} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value" strokeWidth={0}>
                    {stageData.filter((d) => d.value > 0).map((d) => <Cell key={d.stage} fill={STAGE_HEX[d.stage]} />)}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-2">
              {stageData.filter((d) => d.value > 0).map((d) => {
                const pct = jobs.length > 0 ? Math.round((d.value / jobs.length) * 100) : 0;
                return (
                  <div key={d.stage} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="size-2.5 rounded-full" style={{ backgroundColor: STAGE_HEX[d.stage] }} />
                      <span className="text-[11px] font-medium">{d.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold">{d.value}</span>
                      <span className="text-[9px] text-muted-foreground w-8 text-right">{pct}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Priority Bar */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="rounded-xl border border-border/50 bg-card p-5">
          <h3 className="text-xs font-semibold mb-4 flex items-center gap-1.5"><Percent className="size-3.5 text-muted-foreground" /> Priority Breakdown</h3>
          <div className="h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priorityData} barSize={40}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis allowDecimals={false} tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" width={24} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="value" name="Applications" radius={[6, 6, 0, 0]}>
                  {priorityData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Funnel */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="rounded-xl border border-border/50 bg-card p-5">
        <h3 className="text-xs font-semibold mb-4 flex items-center gap-1.5"><TrendingUp className="size-3.5 text-muted-foreground" /> Application Funnel</h3>
        <div className="space-y-3">
          {funnelData.map((f, i) => <FunnelStep key={f.stage.id} stage={f.stage} count={f.count} total={jobs.length} maxCount={maxFunnel} isLast={i === funnelData.length - 1} />)}
        </div>
        <div className="mt-4 pt-4 border-t border-border/30 flex flex-wrap gap-4">
          {funnelData.length >= 2 && (() => {
            const conv = [];
            for (let i = 0; i < funnelData.length - 1; i++) {
              const from = funnelData[i], to = funnelData[i + 1];
              const rate = from.count > 0 ? Math.round((to.count / from.count) * 100) : 0;
              conv.push({ from: from.stage.label, to: to.stage.label, rate });
            }
            return conv.map((c) => (
              <div key={c.from} className="flex items-center gap-1.5 text-[10px]">
                <span className="text-muted-foreground">{c.from}</span>
                <ArrowRight className="size-2.5 text-muted-foreground/50" />
                <span className="text-muted-foreground">{c.to}</span>
                <span className={cn('font-bold', c.rate >= 50 ? 'text-emerald-500' : c.rate >= 25 ? 'text-amber-500' : 'text-red-500')}>{c.rate}%</span>
              </div>
            ));
          })()}
        </div>
      </motion.div>

      {/* Timeline */}
      {timelineData.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="rounded-xl border border-border/50 bg-card p-5">
          <h3 className="text-xs font-semibold mb-4 flex items-center gap-1.5"><CalendarDays className="size-3.5 text-muted-foreground" /> Application Activity</h3>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineData}>
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis dataKey="week" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis allowDecimals={false} tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" width={24} />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="applications" name="Applications" stroke="#8b5cf6" strokeWidth={2} fill="url(#areaGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      {/* Rejections */}
      {(() => {
        const rej = jobs.filter((j) => j.stage === 'rejected');
        if (rej.length === 0) return null;
        return (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="rounded-xl border border-border/50 bg-card p-5">
            <h3 className="text-xs font-semibold mb-3 flex items-center gap-1.5"><XCircle className="size-3.5 text-red-500" /> Rejections ({rej.length})</h3>
            <div className="space-y-1.5">
              {rej.map((j) => (
                <div key={j.id} className="flex items-center justify-between py-1.5 px-2 rounded-md bg-red-500/5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium">{j.role}</span>
                    <span className="text-[10px] text-muted-foreground">at {j.company}</span>
                  </div>
                  {j.dateApplied && <span className="text-[9px] text-muted-foreground">{new Date(j.dateApplied).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>}
                </div>
              ))}
            </div>
          </motion.div>
        );
      })()}
    </div>
  );
}
