import type { ResumeData, ResumeVersion } from '@/stores/resume-store';

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

// ─── DOCX Export ────────────────────────────────────────────────

function escapeXml(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function docxParagraph(text: string, opts?: { bold?: boolean; size?: number; heading?: boolean; spacing?: number }) {
  const sz = (opts?.size || 22) * 2;
  const bold = opts?.bold ? '<w:b/><w:bCs/>' : '';
  const spacing = opts?.spacing != null ? `<w:spacing w:after="${opts.spacing}"/>` : '<w:spacing w:after="60"/>';
  return `<w:p><w:pPr>${spacing}<w:rPr>${bold}<w:sz w:val="${sz}"/><w:szCs w:val="${sz}"/></w:rPr></w:pPr><w:r><w:rPr>${bold}<w:sz w:val="${sz}"/><w:szCs w:val="${sz}"/></w:rPr><w:t xml:space="preserve">${escapeXml(text)}</w:t></w:r></w:p>`;
}

function docxBullet(text: string) {
  return `<w:p><w:pPr><w:spacing w:after="40"/><w:ind w:left="360"/><w:rPr><w:sz w:val="20"/><w:szCs w:val="20"/></w:rPr></w:pPr><w:r><w:rPr><w:sz w:val="20"/><w:szCs w:val="20"/></w:rPr><w:t xml:space="preserve">• ${escapeXml(text)}</w:t></w:r></w:p>`;
}

function docxHr() {
  return `<w:p><w:pPr><w:pBdr><w:bottom w:val="single" w:sz="4" w:space="1" w:color="CCCCCC"/></w:pBdr><w:spacing w:after="120"/></w:pPr></w:p>`;
}

export function exportDocx(resume: ResumeData) {
  const { contact, summary, experience, education, skills } = resume;
  const body: string[] = [];

  // Header
  if (contact.fullName) {
    body.push(docxParagraph(contact.fullName, { bold: true, size: 16, heading: true, spacing: 40 }));
  }
  const contactLine = [contact.email, contact.phone, contact.location].filter(Boolean).join(' | ');
  if (contactLine) body.push(docxParagraph(contactLine, { size: 9, spacing: 20 }));
  const linkLine = [contact.linkedin, contact.portfolio].filter(Boolean).join(' | ');
  if (linkLine) body.push(docxParagraph(linkLine, { size: 9, spacing: 80 }));

  // Summary
  if (summary) {
    body.push(docxHr());
    body.push(docxParagraph('PROFESSIONAL SUMMARY', { bold: true, size: 11, spacing: 60 }));
    body.push(docxParagraph(summary, { size: 10, spacing: 120 }));
  }

  // Experience
  if (experience.length > 0) {
    body.push(docxHr());
    body.push(docxParagraph('WORK EXPERIENCE', { bold: true, size: 11, spacing: 60 }));
    for (const exp of experience) {
      const title = [exp.title, exp.company, exp.location].filter(Boolean).join(' | ');
      body.push(docxParagraph(title, { bold: true, size: 10, spacing: 20 }));
      if (exp.startDate || exp.endDate) {
        body.push(docxParagraph(`${exp.startDate} – ${exp.endDate}`, { size: 9, spacing: 40 }));
      }
      for (const b of exp.bullets) {
        body.push(docxBullet(b));
      }
      body.push(docxParagraph('', { size: 6, spacing: 60 }));
    }
  }

  // Education
  if (education.length > 0) {
    body.push(docxHr());
    body.push(docxParagraph('EDUCATION', { bold: true, size: 11, spacing: 60 }));
    for (const edu of education) {
      body.push(docxParagraph(edu.degree, { bold: true, size: 10, spacing: 20 }));
      const school = [edu.school, edu.graduationYear].filter(Boolean).join(' | ');
      if (school) body.push(docxParagraph(school, { size: 9, spacing: 20 }));
      if (edu.details) body.push(docxParagraph(edu.details, { size: 9, spacing: 60 }));
    }
  }

  // Skills
  if (skills.length > 0) {
    body.push(docxHr());
    body.push(docxParagraph('SKILLS', { bold: true, size: 11, spacing: 60 }));
    body.push(docxParagraph(skills.join(', '), { size: 10 }));
  }

  // Build the minimal DOCX (single-file flat OPC XML)
  const docXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<?mso-application progid="Word.Document"?>
<w:wordDocument xmlns:w="http://schemas.microsoft.com/office/word/2003/wordml"
  xmlns:v="urn:schemas-microsoft-com:vml"
  xmlns:wx="http://schemas.microsoft.com/office/word/2003/auxHint">
  <w:body>${body.join('')}</w:body>
</w:wordDocument>`;

  const blob = new Blob([docXml], { type: 'application/vnd.ms-word' });
  downloadBlob(blob, `${sanitize(contact.fullName || 'Resume')}.doc`);
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
