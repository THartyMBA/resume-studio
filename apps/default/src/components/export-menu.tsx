import { useState, useRef, useEffect, useCallback } from 'react';
import { useResumeStore } from '@/stores/resume-store';
import {
  exportPlainText,
  exportJsonBackup,
  readJsonBackup,
} from '@/lib/resume-export';
import {
  Download, ChevronDown, FileText, FileType, FileCode, Upload,
  Check, AlertCircle, FolderArchive,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface ExportMenuProps {
  onExportPDF: () => Promise<void>;
  onExportWord: () => Promise<void>;
  disabled?: boolean;
}

export function ExportMenu({ onExportPDF, onExportWord, disabled }: ExportMenuProps) {
  const { resume, versions, setResume } = useResumeStore();
  const [open, setOpen] = useState(false);
  const [exporting, setExporting] = useState<string | null>(null);
  const [importResult, setImportResult] = useState<'success' | 'error' | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(function () {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return function () { document.removeEventListener('mousedown', handleClick); };
  }, []);

  useEffect(function () {
    if (importResult) {
      const t = setTimeout(function () { setImportResult(null); }, 2000);
      return function () { clearTimeout(t); };
    }
  }, [importResult]);

  const handleExport = useCallback(async function (format: string) {
    setExporting(format);
    try {
      switch (format) {
        case 'pdf':
          await onExportPDF();
          break;
        case 'docx':
          await onExportWord();
          break;
        case 'txt':
          exportPlainText(resume);
          break;
        case 'json':
          exportJsonBackup(resume, versions);
          break;
      }
      toast.success(`Exported as ${format.toUpperCase()}`);
    } catch (err) {
      console.error(err);
      toast.error(`Export failed: ${(err as Error).message}`);
    } finally {
      setExporting(null);
      setOpen(false);
    }
  }, [resume, versions, onExportPDF, onExportWord]);

  const handleImport = useCallback(async function (e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const backup = await readJsonBackup(file);
      setResume(backup.currentResume);
      // Restore saved versions if any
      if (backup.savedVersions && backup.savedVersions.length > 0) {
        const store = useResumeStore.getState();
        for (const ver of backup.savedVersions) {
          // Check if version already exists
          const exists = store.versions.some(function (v) { return v.id === ver.id; });
          if (!exists) {
            store.saveVersion(ver.name, ver.targetRole);
          }
        }
      }
      setImportResult('success');
      toast.success('Resume restored from backup');
      setOpen(false);
    } catch (err) {
      console.error(err);
      setImportResult('error');
      toast.error((err as Error).message || 'Could not import file');
    } finally {
      // Reset input so same file can be re-selected
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }, [setResume]);

  const formats = [
    {
      id: 'pdf',
      icon: Download,
      label: 'PDF',
      desc: 'Direct download with template styling',
      color: 'text-red-500',
      bg: 'group-hover:bg-red-500/10',
    },
    {
      id: 'docx',
      icon: FileType,
      label: 'Word (.doc)',
      desc: 'Editable document with template styling',
      color: 'text-blue-500',
      bg: 'group-hover:bg-blue-500/10',
    },
    {
      id: 'txt',
      icon: FileText,
      label: 'Plain Text (.txt)',
      desc: 'ATS-friendly plain text format',
      color: 'text-emerald-500',
      bg: 'group-hover:bg-emerald-500/10',
    },
    {
      id: 'json',
      icon: FileCode,
      label: 'JSON Backup',
      desc: 'Full backup with all versions',
      color: 'text-violet-500',
      bg: 'group-hover:bg-violet-500/10',
    },
  ];

  return (
    <div ref={dropdownRef} className="relative">
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleImport}
        className="hidden"
      />

      <button
        onClick={function () { setOpen(!open); }}
        disabled={disabled}
        className={cn(
          'inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all',
          'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm',
          'disabled:opacity-50 disabled:pointer-events-none'
        )}
      >
        <Download className="size-3.5" />
        <span>Export</span>
        <ChevronDown className={cn('size-3 transition-transform', open && 'rotate-180')} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-[280px] bg-card border border-border/50 rounded-xl shadow-xl z-50 overflow-hidden"
          >
            {/* Export header */}
            <div className="px-4 py-2.5 border-b border-border/50">
              <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <FolderArchive className="size-3" /> Export Resume
              </h3>
            </div>

            {/* Format options */}
            <div className="py-1">
              {formats.map(function (fmt) {
                const Icon = fmt.icon;
                const isExporting = exporting === fmt.id;
                return (
                  <button
                    key={fmt.id}
                    onClick={function () { handleExport(fmt.id); }}
                    disabled={!!exporting}
                    className="group w-full flex items-center gap-3 px-4 py-2.5 hover:bg-muted/50 transition-colors disabled:opacity-50"
                  >
                    <div className={cn('size-8 rounded-lg flex items-center justify-center transition-colors bg-muted/50', fmt.bg)}>
                      {isExporting
                        ? <div className="size-3.5 border-2 border-current border-t-transparent rounded-full animate-spin text-muted-foreground" />
                        : <Icon className={cn('size-4', fmt.color)} />
                      }
                    </div>
                    <div className="text-left flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground">{fmt.label}</p>
                      <p className="text-[10px] text-muted-foreground">{fmt.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Divider */}
            <div className="border-t border-border/50" />

            {/* Import section */}
            <div className="py-1">
              <button
                onClick={function () { fileInputRef.current?.click(); }}
                className="group w-full flex items-center gap-3 px-4 py-2.5 hover:bg-muted/50 transition-colors"
              >
                <div className={cn(
                  'size-8 rounded-lg flex items-center justify-center transition-colors bg-muted/50 group-hover:bg-amber-500/10',
                  importResult === 'success' && 'bg-emerald-500/10',
                  importResult === 'error' && 'bg-red-500/10'
                )}>
                  {importResult === 'success'
                    ? <Check className="size-4 text-emerald-500" />
                    : importResult === 'error'
                      ? <AlertCircle className="size-4 text-red-500" />
                      : <Upload className="size-4 text-amber-500" />
                  }
                </div>
                <div className="text-left flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground">
                    {importResult === 'success' ? 'Restored!' : importResult === 'error' ? 'Import failed' : 'Import JSON Backup'}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {importResult ? 'Click to try again' : 'Restore resume from a backup file'}
                  </p>
                </div>
              </button>
            </div>

            {/* Footer */}
            <div className="px-4 py-2 border-t border-border/50 bg-muted/30">
              <p className="text-[9px] text-muted-foreground text-center">
                JSON backup includes all saved versions & settings
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
