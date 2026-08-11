import { useState, useRef, useEffect } from 'react';
import { useResumeStore } from '@/stores/resume-store';
import {
  GitBranch, Plus, Save, Trash2, Pencil, Check, X, ChevronDown,
  Clock, Briefcase, Copy, FileText,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export function VersionManager() {
  const {
    versions, activeVersionId, resume,
    saveVersion, loadVersion, deleteVersion, renameVersion, updateCurrentVersion,
  } = useResumeStore();
  const [open, setOpen] = useState(false);
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [saveRole, setSaveRole] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeVersion = versions.find((v) => v.id === activeVersionId);
  const hasResume = resume.contact.fullName || resume.summary || resume.experience.length > 0;
  const hasVersions = versions.length > 0;

  useEffect(function () {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
        setShowSaveForm(false);
        setEditingId(null);
        setConfirmDeleteId(null);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return function () { document.removeEventListener('mousedown', handleClick); };
  }, []);

  function handleSave() {
    if (!saveName.trim()) return;
    saveVersion(saveName.trim(), saveRole.trim());
    setSaveName('');
    setSaveRole('');
    setShowSaveForm(false);
  }

  function handleDuplicate(id: string) {
    const ver = versions.find((v) => v.id === id);
    if (!ver) return;
    const parsed = JSON.parse(JSON.stringify(ver.resume));
    useResumeStore.getState().setResume(parsed);
    saveVersion(ver.name + ' (copy)', ver.targetRole);
  }

  function handleRename(id: string) {
    if (!editName.trim()) return;
    renameVersion(id, editName.trim(), editRole.trim());
    setEditingId(null);
  }

  function handleAutoSave() {
    if (activeVersionId) updateCurrentVersion();
  }

  function formatDate(iso: string) {
    const d = new Date(iso);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return mins + 'm ago';
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return hrs + 'h ago';
    const days = Math.floor(hrs / 24);
    if (days < 7) return days + 'd ago';
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={function () { setOpen(!open); }}
        className={cn(
          'flex items-center gap-1.5 px-2 py-1.5 text-[11px] font-medium rounded-lg border transition-all',
          activeVersion
            ? 'border-primary/30 bg-primary/5 text-primary hover:bg-primary/10'
            : 'border-border/50 bg-card/50 text-muted-foreground hover:text-foreground hover:bg-muted/50'
        )}
      >
        <GitBranch className="size-3.5" />
        <span className="max-w-[100px] truncate hidden sm:inline">
          {activeVersion ? activeVersion.name : 'Versions'}
        </span>
        {hasVersions && (
          <span className="text-[9px] px-1 py-0.5 rounded-full bg-muted">{versions.length}</span>
        )}
        <ChevronDown className={cn('size-3 transition-transform', open && 'rotate-180')} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-[340px] bg-card border border-border/50 rounded-xl shadow-xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-border/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GitBranch className="size-4 text-primary" />
                <h3 className="text-xs font-semibold">Resume Versions</h3>
                {hasVersions && (
                  <span className="text-[9px] text-muted-foreground px-1.5 py-0.5 rounded-full bg-muted">{versions.length} saved</span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {activeVersionId && (
                  <button onClick={handleAutoSave} title="Save changes to active version"
                    className="flex items-center gap-1 px-2 py-1 text-[10px] font-medium rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                    <Save className="size-3" /> Save
                  </button>
                )}
                <button
                  onClick={function () { setShowSaveForm(!showSaveForm); }}
                  disabled={!hasResume}
                  className="flex items-center gap-1 px-2 py-1 text-[10px] font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  <Plus className="size-3" /> New
                </button>
              </div>
            </div>

            {/* Save Form */}
            <AnimatePresence>
              {showSaveForm && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden">
                  <div className="px-4 py-3 bg-primary/5 border-b border-border/50 space-y-2">
                    <input
                      value={saveName}
                      onChange={function (e) { setSaveName(e.target.value); }}
                      placeholder="Version name (e.g. Frontend Engineer v2)"
                      className="w-full text-xs px-3 py-2 rounded-lg bg-background border border-border/50 focus:outline-none focus:ring-1 focus:ring-primary/50"
                      autoFocus
                      onKeyDown={function (e) { if (e.key === 'Enter') handleSave(); }}
                    />
                    <input
                      value={saveRole}
                      onChange={function (e) { setSaveRole(e.target.value); }}
                      placeholder="Target role (e.g. Senior React Developer)"
                      className="w-full text-xs px-3 py-2 rounded-lg bg-background border border-border/50 focus:outline-none focus:ring-1 focus:ring-primary/50"
                      onKeyDown={function (e) { if (e.key === 'Enter') handleSave(); }}
                    />
                    <div className="flex justify-end gap-2">
                      <button onClick={function () { setShowSaveForm(false); setSaveName(''); setSaveRole(''); }}
                        className="text-[10px] px-2 py-1 rounded-md text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
                      <button onClick={handleSave} disabled={!saveName.trim()}
                        className="text-[10px] px-3 py-1 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50">
                        Save Version
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Version List */}
            <div className="max-h-[320px] overflow-auto">
              {!hasVersions ? (
                <div className="px-4 py-8 text-center">
                  <FileText className="size-8 text-muted-foreground/40 mx-auto mb-2" />
                  <p className="text-xs font-medium text-muted-foreground">No saved versions</p>
                  <p className="text-[10px] text-muted-foreground/70 mt-0.5 max-w-[200px] mx-auto">
                    Save your resume as a named version to easily switch between variants
                  </p>
                </div>
              ) : (
                <div className="py-1">
                  {versions.map(function (ver) {
                    const isActive = ver.id === activeVersionId;
                    const isEditing = editingId === ver.id;
                    const isDeleting = confirmDeleteId === ver.id;

                    return (
                      <div key={ver.id}
                        className={cn(
                          'px-4 py-2.5 border-b border-border/30 last:border-0 transition-colors',
                          isActive ? 'bg-primary/5' : 'hover:bg-muted/30'
                        )}
                      >
                        {isEditing ? (
                          <div className="space-y-1.5">
                            <input value={editName} onChange={function (e) { setEditName(e.target.value); }}
                              className="w-full text-xs px-2 py-1 rounded bg-background border border-border/50 focus:outline-none focus:ring-1 focus:ring-primary/50"
                              autoFocus onKeyDown={function (e) { if (e.key === 'Enter') handleRename(ver.id); if (e.key === 'Escape') setEditingId(null); }} />
                            <input value={editRole} onChange={function (e) { setEditRole(e.target.value); }}
                              placeholder="Target role"
                              className="w-full text-xs px-2 py-1 rounded bg-background border border-border/50 focus:outline-none focus:ring-1 focus:ring-primary/50"
                              onKeyDown={function (e) { if (e.key === 'Enter') handleRename(ver.id); if (e.key === 'Escape') setEditingId(null); }} />
                            <div className="flex justify-end gap-1">
                              <button onClick={function () { setEditingId(null); }} className="p-1 rounded text-muted-foreground hover:text-foreground"><X className="size-3" /></button>
                              <button onClick={function () { handleRename(ver.id); }} className="p-1 rounded text-primary hover:text-primary/80"><Check className="size-3" /></button>
                            </div>
                          </div>
                        ) : isDeleting ? (
                          <div className="flex items-center justify-between">
                            <p className="text-[10px] text-destructive font-medium">Delete "{ver.name}"?</p>
                            <div className="flex items-center gap-1">
                              <button onClick={function () { setConfirmDeleteId(null); }}
                                className="text-[9px] px-2 py-0.5 rounded bg-muted text-muted-foreground hover:text-foreground">No</button>
                              <button onClick={function () { deleteVersion(ver.id); setConfirmDeleteId(null); }}
                                className="text-[9px] px-2 py-0.5 rounded bg-destructive text-destructive-foreground hover:bg-destructive/90">Yes</button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-start justify-between gap-2">
                            <button onClick={function () { loadVersion(ver.id); setOpen(false); }}
                              className="flex-1 text-left min-w-0">
                              <div className="flex items-center gap-1.5">
                                {isActive && <div className="size-1.5 rounded-full bg-primary shrink-0" />}
                                <span className={cn('text-xs font-medium truncate', isActive ? 'text-primary' : 'text-foreground')}>{ver.name}</span>
                              </div>
                              {ver.targetRole && (
                                <div className="flex items-center gap-1 mt-0.5">
                                  <Briefcase className="size-2.5 text-muted-foreground" />
                                  <span className="text-[10px] text-muted-foreground truncate">{ver.targetRole}</span>
                                </div>
                              )}
                              <div className="flex items-center gap-1 mt-0.5">
                                <Clock className="size-2.5 text-muted-foreground/60" />
                                <span className="text-[9px] text-muted-foreground/60">{formatDate(ver.updatedAt)}</span>
                              </div>
                            </button>
                            <div className="flex items-center gap-0.5 shrink-0">
                              <button onClick={function () { setEditingId(ver.id); setEditName(ver.name); setEditRole(ver.targetRole); }}
                                title="Rename" className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
                                <Pencil className="size-3" />
                              </button>
                              <button onClick={function () { handleDuplicate(ver.id); }}
                                title="Duplicate" className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
                                <Copy className="size-3" />
                              </button>
                              <button onClick={function () { setConfirmDeleteId(ver.id); }}
                                title="Delete" className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
                                <Trash2 className="size-3" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer tip */}
            {hasVersions && (
              <div className="px-4 py-2 border-t border-border/50 bg-muted/30">
                <p className="text-[9px] text-muted-foreground text-center">Click a version to load it \u2022 Active version shown with dot</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
