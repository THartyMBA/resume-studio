import { useRef, useState } from 'react';
import { useResumeStore } from '@/stores/resume-store';
import { ResumeTemplate } from '@/components/templates';
import { TemplateGallery } from '@/components/template-gallery';
import { ACCENT_COLORS, FONT_OPTIONS, FONT_SIZES, getTemplateById } from '@/lib/template-registry';
import { ExportMenu } from '@/components/export-menu';
import { Palette, Type, FileText, ChevronDown, ALargeSmall } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import type { FontFamily } from '@/stores/resume-store';

export function ResumePreview() {
  const { resume, setResume } = useResumeStore();
  const previewRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);
  const [showColors, setShowColors] = useState(false);
  const [showFonts, setShowFonts] = useState(false);

  const currentTmpl = getTemplateById(resume.template);

  const handleExportPDF = async () => {
    setExporting(true);
    try {
      const el = previewRef.current;
      if (!el) return;
      const printWindow = window.open('', '_blank');
      if (!printWindow) return;
      printWindow.document.write(`<!DOCTYPE html><html><head><title>${resume.contact.fullName || 'Resume'}</title><style>*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}@page{margin:0.4in;size:letter}body{font-family:'Segoe UI',system-ui,sans-serif;color:#1a1a1a;line-height:1.5;font-size:11px}h1,h2{margin:0}ul{padding-left:16px}li{margin-bottom:1px}</style></head><body>${el.innerHTML}</body></html>`);
      printWindow.document.close();
      setTimeout(() => { printWindow.print(); printWindow.close(); }, 300);
    } finally { setExporting(false); }
  };

  const hasContent = resume.contact.fullName || resume.summary || resume.experience.length > 0;

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 p-3 border-b border-border/50 bg-card/30">
        {/* Template Picker */}
        <TemplateGallery />

        {/* Current Template Label */}
        <span className="text-[10px] text-muted-foreground hidden sm:inline">
          {currentTmpl?.name}
        </span>

        <div className="w-px h-5 bg-border/50 hidden sm:block" />

        {/* Color Picker */}
        <div className="relative">
          <button onClick={() => { setShowColors(!showColors); setShowFonts(false); }} className="flex items-center gap-1 px-2 py-1 text-xs rounded-lg hover:bg-muted transition-all">
            <div className="size-4 rounded-full border border-border/50" style={{ backgroundColor: resume.accentColor }} />
            <Palette className="size-3 text-muted-foreground" />
            <ChevronDown className="size-2.5 text-muted-foreground" />
          </button>
          {showColors && (
            <div className="absolute top-full left-0 mt-1 p-3 bg-popover border border-border rounded-xl shadow-xl z-50 w-56">
              <p className="text-[10px] text-muted-foreground font-medium mb-2">Accent Color</p>
              <div className="grid grid-cols-6 gap-1.5">
                {ACCENT_COLORS.map(c => (
                  <button key={c} onClick={() => { setResume({ accentColor: c }); setShowColors(false); }}
                    className={cn('size-7 rounded-full border-2 transition-all hover:scale-110', resume.accentColor === c ? 'border-foreground scale-110' : 'border-transparent')}
                    style={{ backgroundColor: c }} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Font Picker */}
        <div className="relative">
          <button onClick={() => { setShowFonts(!showFonts); setShowColors(false); }} className="flex items-center gap-1 px-2 py-1 text-xs rounded-lg hover:bg-muted transition-all">
            <Type className="size-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground hidden sm:inline">{FONT_OPTIONS.find(f => f.id === resume.fontFamily)?.label}</span>
            <ChevronDown className="size-2.5 text-muted-foreground" />
          </button>
          {showFonts && (
            <div className="absolute top-full left-0 mt-1 p-2 bg-popover border border-border rounded-xl shadow-xl z-50 w-44">
              <p className="text-[10px] text-muted-foreground font-medium mb-1.5 px-1">Font Family</p>
              {FONT_OPTIONS.map(f => (
                <button key={f.id} onClick={() => { setResume({ fontFamily: f.id as FontFamily }); setShowFonts(false); }}
                  className={cn('w-full text-left px-2 py-1 text-xs rounded-md transition-all', resume.fontFamily === f.id ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted')}
                  style={{ fontFamily: f.css }}>{f.label}</button>
              ))}
              <div className="border-t border-border/50 mt-2 pt-2 px-1">
                <p className="text-[10px] text-muted-foreground font-medium mb-1.5">Font Size</p>
                <div className="flex gap-1">
                  {FONT_SIZES.map(s => (
                    <button key={s.id} onClick={() => setResume({ fontSize: s.id })}
                      className={cn('flex-1 px-2 py-1 text-[10px] rounded-md transition-all', resume.fontSize === s.id ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted text-muted-foreground')}>
                      <ALargeSmall className="size-3 mx-auto mb-0.5" style={{ transform: s.id === 'sm' ? 'scale(0.8)' : s.id === 'lg' ? 'scale(1.2)' : 'scale(1)' }} />
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex-1" />

        <ExportMenu onExportPDF={handleExportPDF} disabled={!hasContent} />
      </div>

      {/* Preview Area */}
      <div className="flex-1 overflow-auto bg-muted/30 p-4 sm:p-8" onClick={() => { setShowColors(false); setShowFonts(false); }}>
        {hasContent ? (
          <motion.div
            key={resume.template}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="mx-auto max-w-[8.5in] bg-white shadow-2xl shadow-black/10 rounded-sm overflow-hidden"
            style={{ minHeight: '11in' }}
          >
            <div ref={previewRef} className="resume-preview-content">
              <ResumeTemplate resume={resume} />
            </div>
          </motion.div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center gap-4">
            <div className="rounded-full bg-muted p-6">
              <FileText className="size-10 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-1">No resume data yet</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                Chat with the Resume Coach to build your resume, or upload an existing one to get started.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
