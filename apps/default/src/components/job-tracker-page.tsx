import { useEffect, useState, useMemo } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import {
  useJobTrackerStore, STAGES, type Stage, type JobApplication,
} from '@/stores/job-tracker-store';
import { JobFormModal } from '@/components/job-form-modal';
import { TrackerAnalytics } from '@/components/tracker-analytics';
import {
  Kanban, Plus, Loader2, Building2, DollarSign, Calendar,
  MoreHorizontal, Pencil, Trash2, ExternalLink, Flag,
  User, Mail, StickyNote, ChevronDown, BarChart3, LayoutGrid,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

const PRIORITY_DOT: Record<string, string> = { high: 'bg-red-500', medium: 'bg-amber-500', low: 'bg-gray-400' };

/* ── Card Menu ── */
function CardMenu({ job, onEdit, onDelete }: { job: JobApplication; onEdit: () => void; onDelete: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        className="p-1 rounded hover:bg-muted/50 transition-colors"><MoreHorizontal className="size-3.5 text-muted-foreground" /></button>
      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="absolute right-0 top-full mt-1 bg-card border border-border/50 rounded-lg shadow-xl z-50 py-1 min-w-[140px]">
              <button onClick={() => { onEdit(); setOpen(false); }}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-muted/50 transition-colors"><Pencil className="size-3" /> Edit</button>
              {job.url && (
                <a href={job.url} target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-muted/50 transition-colors"><ExternalLink className="size-3" /> Open Link</a>
              )}
              <button onClick={() => { onDelete(); setOpen(false); }}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-destructive hover:bg-destructive/10 transition-colors"><Trash2 className="size-3" /> Delete</button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Job Card ── */
function JobCard({ job, index, onEdit, onDelete }: { job: JobApplication; index: number; onEdit: () => void; onDelete: () => void }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <Draggable draggableId={job.id} index={index}>
      {(provided, snapshot) => (
        <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}
          className={cn('bg-card rounded-lg border border-border/50 p-3 mb-2 transition-all cursor-grab active:cursor-grabbing',
            snapshot.isDragging && 'shadow-lg ring-2 ring-primary/20 rotate-1')}>
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <div className={cn('size-2 rounded-full shrink-0', PRIORITY_DOT[job.priority])} />
                <p className="text-xs font-semibold truncate">{job.role}</p>
              </div>
              <div className="flex items-center gap-1 mt-0.5">
                <Building2 className="size-3 text-muted-foreground shrink-0" />
                <p className="text-[11px] text-muted-foreground truncate">{job.company}</p>
              </div>
            </div>
            <CardMenu job={job} onEdit={onEdit} onDelete={onDelete} />
          </div>

          {/* Meta chips */}
          <div className="flex flex-wrap gap-1 mt-2">
            {job.salary && (
              <span className="flex items-center gap-0.5 text-[9px] px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <DollarSign className="size-2.5" />{job.salary}
              </span>
            )}
            {job.dateApplied && (
              <span className="flex items-center gap-0.5 text-[9px] px-1.5 py-0.5 rounded-md bg-muted/50 text-muted-foreground border border-border/30">
                <Calendar className="size-2.5" />{formatDate(job.dateApplied)}
              </span>
            )}
          </div>

          {/* Expandable details */}
          {(job.notes || job.contactName || job.contactEmail) && (
            <button onClick={() => setExpanded(!expanded)} className="flex items-center gap-1 mt-2 text-[9px] text-muted-foreground hover:text-foreground transition-colors">
              <ChevronDown className={cn('size-3 transition-transform', expanded && 'rotate-180')} />
              {expanded ? 'Less' : 'Details'}
            </button>
          )}
          <AnimatePresence>
            {expanded && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden">
                <div className="pt-2 space-y-1.5 border-t border-border/30 mt-2">
                  {job.notes && <div className="flex items-start gap-1.5"><StickyNote className="size-3 text-muted-foreground shrink-0 mt-0.5" /><p className="text-[10px] text-muted-foreground leading-relaxed">{job.notes}</p></div>}
                  {job.contactName && <div className="flex items-center gap-1.5"><User className="size-3 text-muted-foreground" /><p className="text-[10px] text-muted-foreground">{job.contactName}</p></div>}
                  {job.contactEmail && <div className="flex items-center gap-1.5"><Mail className="size-3 text-muted-foreground" /><a href={`mailto:${job.contactEmail}`} className="text-[10px] text-primary hover:underline">{job.contactEmail}</a></div>}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </Draggable>
  );
}

function formatDate(d: string) {
  if (!d) return '';
  try { return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); }
  catch { return d; }
}

/* ── Main Page ── */
export function JobTrackerPage() {
  const { jobs, loading, fetchJobs, addJob, updateJob, deleteJob, moveJob } = useJobTrackerStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<JobApplication | null>(null);
  const [addToStage, setAddToStage] = useState<Stage | undefined>();
  const [showAnalytics, setShowAnalytics] = useState(false);

  useEffect(() => { fetchJobs(); }, []);

  const columns = useMemo(() => {
    const map: Record<Stage, JobApplication[]> = { applied: [], phone: [], interview: [], offer: [], rejected: [] };
    jobs.forEach((j) => { if (map[j.stage]) map[j.stage].push(j); });
    return map;
  }, [jobs]);

  const stats = useMemo(() => ({
    total: jobs.length,
    active: jobs.filter((j) => j.stage !== 'rejected').length,
    offers: jobs.filter((j) => j.stage === 'offer').length,
  }), [jobs]);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const newStage = result.destination.droppableId as Stage;
    const jobId = result.draggableId;
    const job = jobs.find((j) => j.id === jobId);
    if (!job || job.stage === newStage) return;
    moveJob(jobId, newStage);
    const stageLabel = STAGES.find((s) => s.id === newStage)?.label || newStage;
    toast.success(`Moved to ${stageLabel}`);
  };

  const handleAdd = (stage?: Stage) => {
    setEditingJob(null);
    setAddToStage(stage);
    setModalOpen(true);
  };

  const handleEdit = (job: JobApplication) => {
    setEditingJob(job);
    setAddToStage(undefined);
    setModalOpen(true);
  };

  const handleDelete = (job: JobApplication) => {
    deleteJob(job.id);
    toast.success(`Removed ${job.role} at ${job.company}`);
  };

  const handleSubmit = (data: Omit<JobApplication, 'id'>) => {
    if (editingJob) {
      updateJob(editingJob.id, data);
      toast.success('Application updated');
    } else {
      addJob(data);
      toast.success('Application added');
    }
  };

  if (loading && jobs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <div className="relative">
          <div className="size-16 rounded-full bg-gradient-to-br from-blue-500/20 to-violet-600/20 flex items-center justify-center">
            <Loader2 className="size-8 text-blue-500 animate-spin" />
          </div>
          <div className="absolute inset-0 rounded-full bg-blue-500/10 animate-ping" />
        </div>
        <div className="text-center"><p className="text-sm font-medium">Loading applications…</p></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border/50">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <Kanban className="size-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-semibold">Job Application Tracker</h2>
              <p className="text-[10px] text-muted-foreground">Drag cards between columns to update status</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Stats */}
            <div className="hidden sm:flex items-center gap-3 text-[10px]">
              <div className="flex items-center gap-1"><BarChart3 className="size-3 text-muted-foreground" /><span className="text-muted-foreground">{stats.total} total</span></div>
              <div className="flex items-center gap-1"><div className="size-2 rounded-full bg-blue-500" /><span className="text-blue-600 dark:text-blue-400">{stats.active} active</span></div>
              <div className="flex items-center gap-1"><div className="size-2 rounded-full bg-emerald-500" /><span className="text-emerald-600 dark:text-emerald-400">{stats.offers} offers</span></div>
            </div>
            {/* View toggle */}
            <div className="flex items-center rounded-lg border border-border/50 bg-muted/30 p-0.5">
              <button onClick={() => setShowAnalytics(false)}
                className={cn('flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium transition-all', !showAnalytics ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground')}>
                <LayoutGrid className="size-3" /> Board
              </button>
              <button onClick={() => setShowAnalytics(true)}
                className={cn('flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium transition-all', showAnalytics ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground')}>
                <BarChart3 className="size-3" /> Analytics
              </button>
            </div>
            {!showAnalytics && (
              <button onClick={() => handleAdd()}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
                <Plus className="size-3.5" /> Add
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content: Board or Analytics */}
      {showAnalytics ? (
        <div className="flex-1 overflow-auto">
          <TrackerAnalytics jobs={jobs} />
        </div>
      ) : (
      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex gap-3 p-4 h-full min-w-max">
            {STAGES.map((stage) => {
              const stageJobs = columns[stage.id];
              return (
                <div key={stage.id} className="w-[280px] flex flex-col h-full">
                  {/* Column Header */}
                  <div className={cn('flex items-center justify-between px-3 py-2 rounded-t-xl border border-b-0', stage.bg, stage.border)}>
                    <div className="flex items-center gap-2">
                      <span className={cn('text-xs font-semibold', stage.color)}>{stage.label}</span>
                      <span className={cn('text-[9px] font-bold px-1.5 py-0.5 rounded-full', stage.bg, stage.color)}>{stageJobs.length}</span>
                    </div>
                    <button onClick={() => handleAdd(stage.id)}
                      className={cn('p-1 rounded-md transition-colors hover:bg-background/50', stage.color)}>
                      <Plus className="size-3.5" />
                    </button>
                  </div>

                  {/* Drop zone */}
                  <Droppable droppableId={stage.id}>
                    {(provided, snapshot) => (
                      <div ref={provided.innerRef} {...provided.droppableProps}
                        className={cn(
                          'flex-1 overflow-y-auto rounded-b-xl border p-2 transition-colors min-h-[100px]',
                          stage.border,
                          snapshot.isDraggingOver ? 'bg-primary/5 border-primary/30' : 'bg-muted/20'
                        )}>
                        {stageJobs.map((job, idx) => (
                          <JobCard key={job.id} job={job} index={idx}
                            onEdit={() => handleEdit(job)}
                            onDelete={() => handleDelete(job)} />
                        ))}
                        {provided.placeholder}
                        {stageJobs.length === 0 && !snapshot.isDraggingOver && (
                          <div className="flex flex-col items-center justify-center py-8 text-center">
                            <p className="text-[10px] text-muted-foreground/50 mb-2">No applications</p>
                            <button onClick={() => handleAdd(stage.id)}
                              className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1 px-2 py-1 rounded-md border border-dashed border-border/50 hover:border-primary/30 transition-all">
                              <Plus className="size-3" /> Add one
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </Droppable>
                </div>
              );
            })}
          </div>
        </DragDropContext>
      </div>
      )}

      <JobFormModal open={modalOpen} onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit} initial={editingJob} defaultStage={addToStage} />
    </div>
  );
}
