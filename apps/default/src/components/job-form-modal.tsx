import { useState, useEffect } from 'react';
import { type JobApplication, type Stage, type Priority, STAGES } from '@/stores/job-tracker-store';
import { X, Briefcase, Building2, MapPin, DollarSign, Link2, StickyNote, Calendar, User, Mail, Flag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const PRIORITY_OPTIONS: { id: Priority; label: string; color: string }[] = [
  { id: 'high', label: 'High', color: 'bg-red-500' },
  { id: 'medium', label: 'Medium', color: 'bg-amber-500' },
  { id: 'low', label: 'Low', color: 'bg-gray-400' },
];

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<JobApplication, 'id'>) => void;
  initial?: JobApplication | null;
  defaultStage?: Stage;
}

export function JobFormModal({ open, onClose, onSubmit, initial, defaultStage }: Props) {
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [stage, setStage] = useState<Stage>(defaultStage || 'applied');
  const [salary, setSalary] = useState('');
  const [url, setUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [dateApplied, setDateApplied] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');

  useEffect(() => {
    if (initial) {
      setCompany(initial.company); setRole(initial.role); setStage(initial.stage);
      setSalary(initial.salary); setUrl(initial.url); setNotes(initial.notes);
      setDateApplied(initial.dateApplied); setContactName(initial.contactName);
      setContactEmail(initial.contactEmail); setPriority(initial.priority);
    } else {
      setCompany(''); setRole(''); setStage(defaultStage || 'applied');
      setSalary(''); setUrl(''); setNotes(''); setDateApplied(new Date().toISOString().slice(0, 10));
      setContactName(''); setContactEmail(''); setPriority('medium');
    }
  }, [initial, open, defaultStage]);

  if (!open) return null;

  const canSubmit = company.trim().length > 0 && role.trim().length > 0;

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit({ company: company.trim(), role: role.trim(), stage, salary, url, notes, dateApplied, contactName, contactEmail, priority });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative bg-card border border-border/50 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-auto">
        <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 border-b border-border/50 bg-card rounded-t-2xl">
          <h2 className="text-sm font-semibold">{initial ? 'Edit Application' : 'Add Application'}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted/50 transition-colors"><X className="size-4" /></button>
        </div>

        <div className="p-5 space-y-4">
          {/* Company + Role */}
          <div className="grid grid-cols-2 gap-3">
            <Field icon={Building2} label="Company *" value={company} onChange={setCompany} placeholder="e.g. Stripe" />
            <Field icon={Briefcase} label="Role *" value={role} onChange={setRole} placeholder="e.g. Senior SWE" />
          </div>

          {/* Stage */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5"><MapPin className="size-3" /> Stage</label>
            <div className="flex flex-wrap gap-1.5">
              {STAGES.map((s) => (
                <button key={s.id} onClick={() => setStage(s.id)}
                  className={cn('text-[11px] font-medium px-2.5 py-1.5 rounded-lg border transition-all', stage === s.id ? `${s.bg} ${s.border} ${s.color}` : 'bg-muted/30 border-border/30 text-muted-foreground hover:text-foreground')}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Priority */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5"><Flag className="size-3" /> Priority</label>
            <div className="flex gap-1.5">
              {PRIORITY_OPTIONS.map((p) => (
                <button key={p.id} onClick={() => setPriority(p.id)}
                  className={cn('flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1.5 rounded-lg border transition-all', priority === p.id ? 'bg-card border-primary/30 text-foreground shadow-sm' : 'bg-muted/30 border-border/30 text-muted-foreground hover:text-foreground')}>
                  <div className={cn('size-2 rounded-full', p.color)} /> {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Salary + Date */}
          <div className="grid grid-cols-2 gap-3">
            <Field icon={DollarSign} label="Salary Range" value={salary} onChange={setSalary} placeholder="$150k - $180k" />
            <Field icon={Calendar} label="Date Applied" value={dateApplied} onChange={setDateApplied} placeholder="YYYY-MM-DD" type="date" />
          </div>

          {/* URL */}
          <Field icon={Link2} label="Application URL" value={url} onChange={setUrl} placeholder="https://..." />

          {/* Contact */}
          <div className="grid grid-cols-2 gap-3">
            <Field icon={User} label="Contact Name" value={contactName} onChange={setContactName} placeholder="Recruiter name" />
            <Field icon={Mail} label="Contact Email" value={contactEmail} onChange={setContactEmail} placeholder="recruiter@co.com" />
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5"><StickyNote className="size-3" /> Notes</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any context, referrals, prep notes..."
              className="w-full text-sm px-3 py-2.5 rounded-lg bg-background border border-border/50 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all min-h-[80px] resize-none" />
          </div>
        </div>

        <div className="sticky bottom-0 flex items-center justify-end gap-2 px-5 py-4 border-t border-border/50 bg-card rounded-b-2xl">
          <button onClick={onClose} className="text-xs px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">Cancel</button>
          <button onClick={handleSubmit} disabled={!canSubmit}
            className="text-xs font-medium px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50">
            {initial ? 'Save Changes' : 'Add Application'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function Field({ icon: Icon, label, value, onChange, placeholder, type = 'text' }: {
  icon: any; label: string; value: string; onChange: (v: string) => void; placeholder: string; type?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5"><Icon className="size-3" /> {label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="w-full text-sm px-3 py-2.5 rounded-lg bg-background border border-border/50 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all" />
    </div>
  );
}
