import type { ResumeData, ResumeVersion } from '@/stores/resume-store';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

// ─── Helpers ────────────────────────────────────────────────────

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function sanitize(name: string) {
  return name.replace(/[^a-zA-Z0-9_\- ]/g, '').trim().replace(/\s+/g, '_') || 'Resume';
}

const LETTER_WIDTH_PX = 816;
const LETTER_HEIGHT_PX = 1056;

async function withExportSurface<T>(source: HTMLElement, render: (surface: HTMLElement) => Promise<T>): Promise<T> {
  if ('fonts' in document) await document.fonts.ready;
  const surface = document.createElement('div');
  surface.setAttribute('aria-hidden', 'true');
  surface.style.cssText = [
    'position:fixed',
    'left:-10000px',
    'top:0',
    `width:${LETTER_WIDTH_PX}px`,
    `min-height:${LETTER_HEIGHT_PX}px`,
    'overflow:visible',
    'background:#fff',
    'z-index:-1',
  ].join(';');
  const clone = source.cloneNode(true) as HTMLElement;
  clone.style.width = `${LETTER_WIDTH_PX}px`;
  clone.style.minHeight = `${LETTER_HEIGHT_PX}px`;
  surface.appendChild(clone);
  document.body.appendChild(surface);
  try {
    await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
    return await render(surface);
  } finally {
    surface.remove();
  }
}

function inlineWordTextStyles(source: HTMLElement, clone: HTMLElement) {
  const sourceElements = [source, ...Array.from(source.querySelectorAll<HTMLElement>('*'))];
  const cloneElements = [clone, ...Array.from(clone.querySelectorAll<HTMLElement>('*'))];
  sourceElements.forEach((element, index) => {
    const target = cloneElements[index];
    if (!target) return;
    const computed = window.getComputedStyle(element);
    target.style.color = computed.color;
    target.style.fontFamily = computed.fontFamily;
  });
}

// ─── Plain Text Export ──────────────────────────────────────────

export function exportPlainText(resume: ResumeData) {
  const lines: string[] = [];
  const { contact, summary, experience, education, skills } = resume;

  // Header
  if (contact.fullName) lines.push(contact.fullName.toUpperCase(), '');
  const contactParts: string[] = [];
  if (contact.email) contactParts.push(contact.email);
  if (contact.phone) contactParts.push(contact.phone);
  if (contact.location) contactParts.push(contact.location);
  if (contactParts.length > 0) lines.push(contactParts.join(' | '), '');
  const linkParts: string[] = [];
  if (contact.linkedin) linkParts.push(contact.linkedin);
  if (contact.portfolio) linkParts.push(contact.portfolio);
  if (linkParts.length > 0) lines.push(linkParts.join(' | '), '');

  // Summary
  if (summary) {
    lines.push('─'.repeat(60));
    lines.push('PROFESSIONAL SUMMARY', '');
    lines.push(summary, '');
  }

  // Experience
  if (experience.length > 0) {
    lines.push('─'.repeat(60));
    lines.push('WORK EXPERIENCE', '');
    for (const exp of experience) {
      const titleLine = [exp.title, exp.company, exp.location].filter(Boolean).join(' | ');
      lines.push(titleLine);
      if (exp.startDate || exp.endDate) {
        lines.push(`${exp.startDate} – ${exp.endDate}`);
      }
      for (const bullet of exp.bullets) {
        lines.push(`  • ${bullet}`);
      }
      lines.push('');
    }
  }

  // Education
  if (education.length > 0) {
    lines.push('─'.repeat(60));
    lines.push('EDUCATION', '');
    for (const edu of education) {
      lines.push(edu.degree);
      const schoolLine = [edu.school, edu.graduationYear].filter(Boolean).join(' | ');
      if (schoolLine) lines.push(schoolLine);
      if (edu.details) lines.push(`  ${edu.details}`);
      lines.push('');
    }
  }

  // Skills
  if (skills.length > 0) {
    lines.push('─'.repeat(60));
    lines.push('SKILLS', '');
    lines.push(skills.join(', '), '');
  }

  const text = lines.join('\n');
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  downloadBlob(blob, `${sanitize(contact.fullName || 'Resume')}.txt`);
}

// ─── PDF / Word exports ────────────────────────────────────────

export async function exportPdf(resume: ResumeData, preview: HTMLElement) {
  await withExportSurface(preview, async (surface) => {
    const contentHeight = Math.max(surface.scrollHeight, LETTER_HEIGHT_PX);
    const canvas = await html2canvas(surface, {
      backgroundColor: '#ffffff',
      scale: 2,
      useCORS: true,
      logging: false,
      width: LETTER_WIDTH_PX,
      height: contentHeight,
      windowWidth: LETTER_WIDTH_PX,
      windowHeight: contentHeight,
    });
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'letter', compress: true });
    pdf.setProperties({ title: `${resume.contact.fullName || 'Resume'} — Resume` });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const pageHeightPixels = Math.floor(canvas.width * pageHeight / pageWidth);
    let offset = 0;
    let page = 0;
    while (offset < canvas.height) {
      const sliceHeight = Math.min(pageHeightPixels, canvas.height - offset);
      const slice = document.createElement('canvas');
      slice.width = canvas.width;
      slice.height = sliceHeight;
      const context = slice.getContext('2d');
      if (!context) throw new Error('Could not prepare the PDF canvas.');
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, slice.width, slice.height);
      context.drawImage(canvas, 0, offset, canvas.width, sliceHeight, 0, 0, canvas.width, sliceHeight);
      if (page > 0) pdf.addPage('letter', 'portrait');
      pdf.addImage(slice.toDataURL('image/jpeg', 0.96), 'JPEG', 0, 0, pageWidth, sliceHeight * pageWidth / canvas.width, undefined, 'FAST');
      offset += sliceHeight;
      page += 1;
    }
    pdf.save(`${sanitize(resume.contact.fullName || 'Resume')}.pdf`);
  });
}

export async function exportWord(resume: ResumeData, preview: HTMLElement) {
  const body = await withExportSurface(preview, async (surface) => {
    const source = surface.firstElementChild as HTMLElement;
    const clone = source.cloneNode(true) as HTMLElement;
    inlineWordTextStyles(source, clone);
    return clone.outerHTML;
  });
  const documentHtml = `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="utf-8"><title>${resume.contact.fullName || 'Resume'}</title>
<style>
@page ResumePage { size:8.5in 11in; margin:0; mso-page-orientation:portrait; }
body { margin:0; background:#fff; }
.resume-word-page { page:ResumePage; width:8.5in; min-height:11in; }
*, *::before, *::after { box-sizing:border-box; }
h1,h2,h3,p { margin:0; }
ul { padding-left:16px; }
</style></head><body><div class="resume-word-page">${body}</div></body></html>`;
  const blob = new Blob(['\ufeff', documentHtml], { type: 'application/msword;charset=utf-8' });
  downloadBlob(blob, `${sanitize(resume.contact.fullName || 'Resume')}.doc`);
}

// ─── JSON Backup / Restore ──────────────────────────────────────

export interface ResumeBackup {
  version: 1;
  exportedAt: string;
  currentResume: ResumeData;
  savedVersions: ResumeVersion[];
}

export function exportJsonBackup(resume: ResumeData, versions: ResumeVersion[]) {
  const backup: ResumeBackup = {
    version: 1,
    exportedAt: new Date().toISOString(),
    currentResume: resume,
    savedVersions: versions,
  };
  const json = JSON.stringify(backup, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const name = resume.contact.fullName || 'Resume';
  downloadBlob(blob, `${sanitize(name)}_backup.json`);
}

export function readJsonBackup(file: File): Promise<ResumeBackup> {
  return new Promise(function (resolve, reject) {
    const reader = new FileReader();
    reader.onload = function (e) {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (!data || typeof data !== 'object') {
          reject(new Error('Invalid backup file'));
          return;
        }
        // Support raw ResumeData (no wrapper)
        if (data.contact && data.experience) {
          resolve({
            version: 1,
            exportedAt: new Date().toISOString(),
            currentResume: data as ResumeData,
            savedVersions: [],
          });
          return;
        }
        if (data.version === 1 && data.currentResume) {
          resolve(data as ResumeBackup);
          return;
        }
        reject(new Error('Unrecognized backup format'));
      } catch {
        reject(new Error('Could not parse JSON file'));
      }
    };
    reader.onerror = function () { reject(new Error('Could not read file')); };
    reader.readAsText(file);
  });
}
