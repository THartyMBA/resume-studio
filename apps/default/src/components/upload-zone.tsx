import { useState, useCallback } from 'react';
import { Upload, FileText, X, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useResumeStore } from '@/stores/resume-store';
import { motion, AnimatePresence } from 'framer-motion';

export function UploadZone({ onTextReady }: { onTextReady: (text: string) => void }) {
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState('');
  const [status, setStatus] = useState<'idle' | 'reading' | 'done' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const { setUploadedText } = useResumeStore();

  const readFile = useCallback(
    async (file: File) => {
      setFileName(file.name);
      setStatus('reading');
      setErrorMsg('');

      try {
        let text = '';

        if (file.type === 'text/plain' || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
          text = await file.text();
        } else {
          text = await file.text();
        }

        if (text.trim().length === 0) {
          setStatus('error');
          setErrorMsg('The file appears to be empty or unreadable. Try pasting your resume text directly in the chat.');
          return;
        }

        setUploadedText(text);
        onTextReady(text);
        setStatus('done');
      } catch {
        setStatus('error');
        setErrorMsg('Could not read the file. Try pasting your resume text directly in the chat instead.');
      }
    },
    [setUploadedText, onTextReady]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) readFile(file);
    },
    [readFile]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) readFile(file);
    },
    [readFile]
  );

  const reset = () => {
    setStatus('idle');
    setFileName('');
    setErrorMsg('');
  };

  return (
    <AnimatePresence mode="wait">
      {status === 'done' ? (
        <motion.div
          key="done"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4"
        >
          <CheckCircle2 className="size-5 text-emerald-500 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-emerald-400 truncate">{fileName}</p>
            <p className="text-xs text-muted-foreground">Resume uploaded — the coach is reviewing it now</p>
          </div>
          <Button variant="ghost" size="icon-sm" onClick={reset}>
            <X className="size-4" />
          </Button>
        </motion.div>
      ) : (
        <motion.div
          key="upload"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          <label
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={cn(
              'group relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-6 cursor-pointer transition-all duration-300',
              dragOver
                ? 'border-primary bg-primary/5 scale-[1.02]'
                : 'border-border/50 hover:border-primary/50 hover:bg-muted/30'
            )}
          >
            <input
              type="file"
              accept=".txt,.md,.text"
              onChange={handleFileSelect}
              className="sr-only"
            />

            <div
              className={cn(
                'rounded-full p-3 transition-all duration-300',
                dragOver ? 'bg-primary/20' : 'bg-muted group-hover:bg-primary/10'
              )}
            >
              {status === 'reading' ? (
                <FileText className="size-6 text-primary animate-pulse" />
              ) : (
                <Upload className="size-6 text-muted-foreground group-hover:text-primary transition-colors" />
              )}
            </div>

            <div className="text-center">
              <p className="text-sm font-medium">
                {status === 'reading' ? 'Reading resume...' : 'Drop your resume here'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                TXT or Markdown • Or paste text directly in the chat
              </p>
            </div>

            {status === 'error' && (
              <p className="text-xs text-destructive text-center mt-1">{errorMsg}</p>
            )}
          </label>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
