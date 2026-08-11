import { useState, useMemo } from 'react';
import { useResumeStore, type ResumeVersion, type ResumeData, type ResumeExperience, type ResumeEducation } from '@/stores/resume-store';
import { compareResumes, type ResumeDiffResult, type DiffStatus, type SkillDiff, type TextDiff } from '@/lib/resume-diff';
import { ResumeTemplate } from '@/components/templates';
import {
  GitCompareArrows, ChevronDown, Plus, Minus as MinusIcon, Eye, List, BarChart3,
  AlertCircle, Check, X, ArrowLeftRight, Briefcase, GraduationCap,
  User, FileText, Palette, PenLine, Trash2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

type ViewMode = 'diff' | 'preview';

const STATUS_STYLE: Record<DiffStatus, { bg: string; text: string; dot: string; label: string }> = {
  added: { bg: 'bg-emerald-500/10 border-emerald-500/20', text: 'text-emerald-600 dark:text-emerald-400', dot: 'bg-emerald-500', label: 'Added' },
  removed: { bg: 'bg-red-500/10 border-red-500/20', text: 'text-red-600 dark:text-red-400', dot: 'bg-red-500', label: 'Removed' },
  changed: { bg: 'bg-amber-500/10 border-amber-500/20', text: 'text-amber-600 dark:text-amber-400', dot: 'bg-amber-500', label: 'Changed' },
  unchanged: { bg: 'bg-muted/30 border-border/30', text: 'text-muted-foreground', dot: 'bg-muted-foreground/30', label: 'Same' },
};

/* ─── Version Selector ─── */

function VersionSelector({ label, selected, versions, currentResume, onChange, onRemove, canRemove, colorClass }: {
  label: string; selected: string; versions: ResumeVersion[]; currentResume: ResumeData;
  onChange: (id: string) => void; onRemove?: () => void; canRemove: boolean; colorClass: string;
}) {
  const [open, setOpen] = useState(false);

  const selectedName = selected === '__current__'
    ? '✏️ Current Draft'
    : versions.find((v) => v.id === selected)?.name || 'Select version';

  return (
    <div className="relative flex-1 min-w-[140px]">
      <div className="flex items-center gap-1.5 mb-1">
        <div className={cn('size-2.5 rounded-full', colorClass)} />
        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{label}</span>
      </div>
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-2 px-3 py-2 text-xs font-medium rounded-lg bg-card border border-border/50 hover:bg-muted/50 transition-all">
        <span className="truncate">{selectedName}</span>
        <div className="flex items-center gap-1 shrink-0">
          {canRemove && (
            <button onClick={(e) => { e.stopPropagation(); onRemove?.(); }}
              className="p-0.5 rounded hover:bg-destructive/10 hover:text-destructive transition-colors">
              <Trash2 className="size-3" />
            </button>
          )}
          <ChevronDown className={cn('size-3 transition-transform', open && 'rotate-180')} />
        </div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
            className="absolute top-full left-0 right-0 mt-1 bg-card border border-border/50 rounded-xl shadow-xl z-50 max-h-[260px] overflow-auto">
            <button onClick={() => { onChange('__current__'); setOpen(false); }}
              className={cn('w-full text-left px-3 py-2 text-xs hover:bg-muted/50 transition-colors flex items-center gap-2',
                selected === '__current__' && 'bg-primary/5 text-primary font-medium')}>
              <PenLine className="size-3 shrink-0" /> Current Draft
            </button>
            {versions.map((v) => (
              <button key={v.id} onClick={() => { onChange(v.id); setOpen(false); }}
                className={cn('w-full text-left px-3 py-2 text-xs hover:bg-muted/50 transition-colors',
                  selected === v.id && 'bg-primary/5 text-primary font-medium')}>
                <span className="font-medium">{v.name}</span>
                {v.targetRole && <span className="text-[10px] text-muted-foreground ml-1.5">• {v.targetRole}</span>}
              </button>
            ))}
            {versions.length === 0 && (
              <p className="px-3 py-4 text-[10px] text-muted-foreground text-center">No saved versions yet</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Stats Bar ─── */

function StatsBar({ stats }: { stats: ResumeDiffResult['stats'] }) {
  const unchanged = stats.total - stats.changed - stats.added - stats.removed;
  return (
    <div className="flex items-center gap-3 text-[10px]">
      <span className="text-muted-foreground font-medium">{stats.total} fields</span>
      <div className="flex items-center gap-1"><div className="size-2 rounded-full bg-amber-500" /><span className="text-amber-600 dark:text-amber-400">{stats.changed} changed</span></div>
      <div className="flex items-center gap-1"><div className="size-2 rounded-full bg-emerald-500" /><span className="text-emerald-600 dark:text-emerald-400">{stats.added} added</span></div>
      <div className="flex items-center gap-1"><div className="size-2 rounded-full bg-red-500" /><span className="text-red-600 dark:text-red-400">{stats.removed} removed</span></div>
      <div className="flex items-center gap-1"><div className="size-2 rounded-full bg-muted-foreground/30" /><span className="text-muted-foreground">{unchanged} same</span></div>
    </div>
  );
}

/* ─── Diff Section ─── */

function DiffTextRow({ diff, names }: { diff: TextDiff; names: string[] }) {
  const s = STATUS_STYLE[diff.status];
  if (diff.status === 'unchanged') return null;
  return (
    <div className={cn('rounded-lg border p-3', s.bg)}>
      <div className="flex items-center gap-1.5 mb-2">
        <div className={cn('size-2 rounded-full', s.dot)} />
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{diff.label}</span>
        <span className={cn('text-[9px] px-1.5 py-0.5 rounded-full ml-auto', s.bg, s.text)}>{s.label}</span>
      </div>
      <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${diff.values.length}, 1fr)` }}>
        {diff.values.map((val, i) => (
          <div key={i} className="text-xs p-2 rounded-md bg-background/60 border border-border/20 min-h-[32px]">
            <p className="text-[9px] text-muted-foreground mb-0.5 font-medium">{names[i]}</p>
            <p className={cn(val ? 'text-foreground' : 'text-muted-foreground/40 italic')}>{val || '(empty)'}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function SkillsDiffSection({ skills, names }: { skills: SkillDiff[]; names: string[] }) {
  const diffs = skills.filter((s) => !s.present.every((p) => p === s.present[0]));
  const shared = skills.filter((s) => s.present.every((p) => p));
  if (diffs.length === 0 && shared.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-xs font-semibold flex items-center gap-1.5"><BarChart3 className="size-3.5 text-violet-500" /> Skills Comparison</h3>
      {diffs.length > 0 && (
        <div className="space-y-1">
          <p className="text-[10px] text-muted-foreground font-medium">Differences</p>
          <div className="grid gap-1" style={{ gridTemplateColumns: `120px repeat(${names.length}, 1fr)` }}>
            <div className="text-[9px] text-muted-foreground font-medium px-2 py-1">Skill</div>
            {names.map((n, i) => <div key={i} className="text-[9px] text-muted-foreground font-medium text-center py-1">{n}</div>)}
            {diffs.map((s) => (
              <div key={s.skill} className="contents">
                <div className="text-xs px-2 py-1.5 rounded-l-md bg-muted/30 capitalize font-medium truncate">{s.skill}</div>
                {s.present.map((p, i) => (
                  <div key={i} className={cn('flex items-center justify-center py-1.5', i === s.present.length - 1 && 'rounded-r-md', p ? 'bg-emerald-500/10' : 'bg-red-500/10')}>
                    {p ? <Check className="size-3.5 text-emerald-500" /> : <X className="size-3.5 text-red-400" />}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
      {shared.length > 0 && (
        <div>
          <p className="text-[10px] text-muted-foreground font-medium mb-1">Shared ({shared.length})</p>
          <div className="flex flex-wrap gap-1">
            {shared.map((s) => <span key={s.skill} className="text-[10px] px-2 py-0.5 rounded-full bg-muted border border-border/30 capitalize">{s.skill}</span>)}
          </div>
        </div>
      )}
    </div>
  );
}

function ExperienceDiffSection({ items, names }: { items: ResumeDiffResult['experience']['items']; names: string[] }) {
  const diffs = items.filter((item) => item.status !== 'unchanged');
  if (diffs.length === 0 && items.length > 0) return <p className="text-[10px] text-muted-foreground italic">All experience entries are identical</p>;
  if (items.length === 0) return null;

  return (
    <div className="space-y-2">
      {items.map((item, idx) => {
        const s = STATUS_STYLE[item.status];
        return (
          <div key={idx} className={cn('rounded-lg border p-3', s.bg)}>
            <div className="flex items-center gap-1.5 mb-2">
              <div className={cn('size-2 rounded-full', s.dot)} />
              <span className={cn('text-[9px] px-1.5 py-0.5 rounded-full', s.bg, s.text)}>{s.label}</span>
            </div>
            <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${names.length}, 1fr)` }}>
              {item.values.map((exp, i) => (
                <div key={i} className="text-xs p-2 rounded-md bg-background/60 border border-border/20">
                  <p className="text-[9px] text-muted-foreground mb-1 font-medium">{names[i]}</p>
                  {exp ? (
                    <>
                      <p className="font-semibold">{exp.title}</p>
                      <p className="text-muted-foreground">{exp.company}{exp.location ? ` • ${exp.location}` : ''}</p>
                      <p className="text-[10px] text-muted-foreground">{exp.startDate} – {exp.endDate}</p>
                      {exp.bullets.length > 0 && (
                        <ul className="mt-1 space-y-0.5">{exp.bullets.map((b, j) => <li key={j} className="text-[10px] text-muted-foreground">• {b}</li>)}</ul>
                      )}
                    </>
                  ) : <p className="text-muted-foreground/40 italic">(not present)</p>}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function EducationDiffSection({ items, names }: { items: ResumeDiffResult['education']['items']; names: string[] }) {
  if (items.length === 0) return null;
  return (
    <div className="space-y-2">
      {items.map((item, idx) => {
        const s = STATUS_STYLE[item.status];
        return (
          <div key={idx} className={cn('rounded-lg border p-3', s.bg)}>
            <div className="flex items-center gap-1.5 mb-2"><div className={cn('size-2 rounded-full', s.dot)} /><span className={cn('text-[9px] px-1.5 py-0.5 rounded-full', s.bg, s.text)}>{s.label}</span></div>
            <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${names.length}, 1fr)` }}>
              {item.values.map((edu, i) => (
                <div key={i} className="text-xs p-2 rounded-md bg-background/60 border border-border/20">
                  <p className="text-[9px] text-muted-foreground mb-1 font-medium">{names[i]}</p>
                  {edu ? (<><p className="font-semibold">{edu.degree}</p><p className="text-muted-foreground">{edu.school} • {edu.graduationYear}</p>{edu.details && <p className="text-[10px] text-muted-foreground mt-0.5">{edu.details}</p>}</>) : <p className="text-muted-foreground/40 italic">(not present)</p>}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}


/* ─── Main Component ─── */

const SLOT_COLORS = ['bg-blue-500', 'bg-violet-500', 'bg-amber-500', 'bg-rose-500'];
const SLOT_RING = ['ring-blue-500/30', 'ring-violet-500/30', 'ring-amber-500/30', 'ring-rose-500/30'];

export function ComparePage() {
  const { versions, resume } = useResumeStore();
  const [selectedIds, setSelectedIds] = useState<string[]>(() => {
    const initial = ['__current__'];
    if (versions.length > 0) initial.push(versions[0].id);
    return initial;
  });
  const [viewMode, setViewMode] = useState<ViewMode>('diff');
  const [showUnchanged, setShowUnchanged] = useState(false);

  const canAdd = selectedIds.length < 4 && (versions.length + 1) > selectedIds.length;

  function getResume(id: string): ResumeData {
    if (id === '__current__') return resume;
    const ver = versions.find((v) => v.id === id);
    return ver ? ver.resume : resume;
  }

  function getName(id: string): string {
    if (id === '__current__') return 'Current Draft';
    const ver = versions.find((v) => v.id === id);
    return ver ? ver.name : 'Unknown';
  }

  function handleChange(idx: number, newId: string) {
    setSelectedIds((prev) => { const next = [...prev]; next[idx] = newId; return next; });
  }

  function handleAdd() {
    const used = new Set(selectedIds);
    const available = versions.find((v) => !used.has(v.id));
    if (available) setSelectedIds((prev) => [...prev, available.id]);
    else if (!used.has('__current__')) setSelectedIds((prev) => [...prev, '__current__']);
  }

  function handleRemove(idx: number) {
    setSelectedIds((prev) => prev.filter((_, i) => i !== idx));
  }

  const resumes = selectedIds.map(getResume);
  const names = selectedIds.map(getName);
  const hasEnough = selectedIds.length >= 2;

  const diff = useMemo(() => {
    if (!hasEnough) return null;
    try { return compareResumes(resumes); } catch { return null; }
  }, [selectedIds, versions, resume]);

  const noVersions = versions.length === 0;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border/50 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center">
              <GitCompareArrows className="size-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-semibold">Compare Versions</h2>
              <p className="text-[10px] text-muted-foreground">Side-by-side diff to tailor resumes for each application</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* View toggle */}
            <div className="flex items-center bg-muted/50 rounded-lg p-0.5 border border-border/30">
              <button onClick={() => setViewMode('diff')}
                className={cn('flex items-center gap-1 px-2.5 py-1 text-[10px] font-medium rounded-md transition-all', viewMode === 'diff' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground')}>
                <List className="size-3" /> Diff
              </button>
              <button onClick={() => setViewMode('preview')}
                className={cn('flex items-center gap-1 px-2.5 py-1 text-[10px] font-medium rounded-md transition-all', viewMode === 'preview' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground')}>
                <Eye className="size-3" /> Preview
              </button>
            </div>
          </div>
        </div>

        {/* Version selectors */}
        <div className="flex items-end gap-2 flex-wrap">
          {selectedIds.map((id, idx) => (
            <VersionSelector key={idx} label={`Version ${String.fromCharCode(65 + idx)}`} selected={id} versions={versions}
              currentResume={resume} onChange={(newId) => handleChange(idx, newId)}
              onRemove={() => handleRemove(idx)} canRemove={selectedIds.length > 2}
              colorClass={SLOT_COLORS[idx] || 'bg-primary'} />
          ))}
          {canAdd && (
            <button onClick={handleAdd}
              className="flex items-center gap-1 px-3 py-2 text-xs font-medium rounded-lg border border-dashed border-border/50 text-muted-foreground hover:text-foreground hover:border-primary/30 hover:bg-primary/5 transition-all mb-0.5">
              <Plus className="size-3" /> Add
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto bg-muted/20">
        {noVersions ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 p-8">
            <div className="rounded-full bg-muted p-6"><GitCompareArrows className="size-10 text-muted-foreground" /></div>
            <div className="text-center">
              <h3 className="font-semibold text-foreground mb-1">No versions to compare</h3>
              <p className="text-sm text-muted-foreground max-w-sm">Save at least two resume versions first using the Version Manager in the toolbar, then come back to compare them side-by-side.</p>
            </div>
          </div>
        ) : !hasEnough ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 p-8">
            <div className="rounded-full bg-muted p-6"><ArrowLeftRight className="size-10 text-muted-foreground" /></div>
            <div className="text-center">
              <h3 className="font-semibold text-foreground mb-1">Select versions to compare</h3>
              <p className="text-sm text-muted-foreground max-w-sm">Pick at least two versions above to see the differences.</p>
            </div>
          </div>
        ) : viewMode === 'diff' && diff ? (
          <motion.div key="diff" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-5 sm:p-6 max-w-5xl mx-auto space-y-6">
            <StatsBar stats={diff.stats} />

            {/* Show unchanged toggle */}
            <button onClick={() => setShowUnchanged(!showUnchanged)}
              className="flex items-center gap-1.5 text-[10px] text-muted-foreground hover:text-foreground transition-colors">
              {showUnchanged ? <MinusIcon className="size-3" /> : <Plus className="size-3" />}
              {showUnchanged ? 'Hide unchanged fields' : 'Show unchanged fields'}
            </button>

            {/* Contact */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold flex items-center gap-1.5"><User className="size-3.5 text-blue-500" /> Contact Information</h3>
              {diff.contact.filter((d) => showUnchanged || d.status !== 'unchanged').map((d) => (
                <DiffTextRow key={d.field} diff={d} names={names} />
              ))}
              {diff.contact.every((d) => d.status === 'unchanged') && !showUnchanged && (
                <p className="text-[10px] text-muted-foreground italic">All contact fields are identical</p>
              )}
            </div>

            {/* Summary */}
            {(showUnchanged || diff.summary.status !== 'unchanged') && (
              <div className="space-y-3">
                <h3 className="text-xs font-semibold flex items-center gap-1.5"><FileText className="size-3.5 text-emerald-500" /> Professional Summary</h3>
                <DiffTextRow diff={diff.summary} names={names} />
              </div>
            )}

            {/* Experience */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold flex items-center gap-1.5"><Briefcase className="size-3.5 text-amber-500" /> Work Experience</h3>
              <ExperienceDiffSection items={showUnchanged ? diff.experience.items : diff.experience.items.filter((i) => i.status !== 'unchanged')} names={names} />
            </div>

            {/* Education */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold flex items-center gap-1.5"><GraduationCap className="size-3.5 text-violet-500" /> Education</h3>
              <EducationDiffSection items={showUnchanged ? diff.education.items : diff.education.items.filter((i) => i.status !== 'unchanged')} names={names} />
            </div>

            {/* Skills */}
            <SkillsDiffSection skills={diff.skills} names={names} />

            {/* Styling */}
            {diff.styling.some((d) => d.status !== 'unchanged') && (
              <div className="space-y-3">
                <h3 className="text-xs font-semibold flex items-center gap-1.5"><Palette className="size-3.5 text-rose-500" /> Styling</h3>
                {diff.styling.filter((d) => showUnchanged || d.status !== 'unchanged').map((d) => (
                  <DiffTextRow key={d.field} diff={d} names={names} />
                ))}
              </div>
            )}
          </motion.div>
        ) : viewMode === 'preview' ? (
          <motion.div key="preview" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="p-4 sm:p-6">
            <div className="flex gap-4 overflow-x-auto pb-4" style={{ scrollSnapType: 'x mandatory' }}>
              {selectedIds.map((id, idx) => {
                const r = getResume(id);
                const name = getName(id);
                return (
                  <div key={id + idx} className="flex-shrink-0 space-y-2" style={{ scrollSnapAlign: 'start', width: `max(320px, calc(${100 / selectedIds.length}% - ${(selectedIds.length - 1) * 16 / selectedIds.length}px))` }}>
                    <div className="flex items-center gap-2">
                      <div className={cn('size-2.5 rounded-full', SLOT_COLORS[idx])} />
                      <span className="text-xs font-semibold truncate">{name}</span>
                    </div>
                    <div className={cn('bg-white rounded-lg shadow-lg overflow-hidden border-2', SLOT_RING[idx])} style={{ minHeight: '500px' }}>
                      <div className="transform origin-top-left" style={{ transform: 'scale(0.65)', width: '153.85%', height: '153.85%' }}>
                        <ResumeTemplate resume={r} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        ) : null}
      </div>
    </div>
  );
}