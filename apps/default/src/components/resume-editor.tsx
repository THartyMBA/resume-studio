import { useResumeStore, type ResumeExperience, type ResumeEducation } from '@/stores/resume-store';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, GripVertical, User, Briefcase, GraduationCap, Wrench } from 'lucide-react';
import { cn } from '@/lib/utils';
import { v4 as uuid } from 'uuid';

export function ResumeEditor() {
  const { resume, setResume } = useResumeStore();

  const updateContact = (key: string, value: string) => {
    setResume({ contact: { ...resume.contact, [key]: value } });
  };

  const addExperience = () => {
    setResume({
      experience: [
        ...resume.experience,
        { id: uuid(), title: '', company: '', location: '', startDate: '', endDate: '', bullets: [''] },
      ],
    });
  };

  const updateExperience = (id: string, updates: Partial<ResumeExperience>) => {
    setResume({
      experience: resume.experience.map((e) => (e.id === id ? { ...e, ...updates } : e)),
    });
  };

  const removeExperience = (id: string) => {
    setResume({ experience: resume.experience.filter((e) => e.id !== id) });
  };

  const addBullet = (expId: string) => {
    const exp = resume.experience.find((e) => e.id === expId);
    if (exp) updateExperience(expId, { bullets: [...exp.bullets, ''] });
  };

  const updateBullet = (expId: string, index: number, value: string) => {
    const exp = resume.experience.find((e) => e.id === expId);
    if (exp) {
      const bullets = [...exp.bullets];
      bullets[index] = value;
      updateExperience(expId, { bullets });
    }
  };

  const removeBullet = (expId: string, index: number) => {
    const exp = resume.experience.find((e) => e.id === expId);
    if (exp) {
      updateExperience(expId, { bullets: exp.bullets.filter((_, i) => i !== index) });
    }
  };

  const addEducation = () => {
    setResume({
      education: [...resume.education, { id: uuid(), degree: '', school: '', graduationYear: '', details: '' }],
    });
  };

  const updateEducation = (id: string, updates: Partial<ResumeEducation>) => {
    setResume({
      education: resume.education.map((e) => (e.id === id ? { ...e, ...updates } : e)),
    });
  };

  const removeEducation = (id: string) => {
    setResume({ education: resume.education.filter((e) => e.id !== id) });
  };

  const updateSkills = (value: string) => {
    setResume({ skills: value.split(',').map((s) => s.trim()).filter(Boolean) });
  };

  return (
    <div className="h-full overflow-auto">
      <div className="max-w-2xl mx-auto p-6 space-y-8">
        {/* Contact */}
        <Section icon={User} title="Contact Information">
          <div className="grid grid-cols-2 gap-3">
            <FieldInput label="Full Name" value={resume.contact.fullName} onChange={(v) => updateContact('fullName', v)} className="col-span-2" />
            <FieldInput label="Email" value={resume.contact.email} onChange={(v) => updateContact('email', v)} />
            <FieldInput label="Phone" value={resume.contact.phone} onChange={(v) => updateContact('phone', v)} />
            <FieldInput label="Location" value={resume.contact.location} onChange={(v) => updateContact('location', v)} />
            <FieldInput label="LinkedIn" value={resume.contact.linkedin} onChange={(v) => updateContact('linkedin', v)} />
            <FieldInput label="Portfolio" value={resume.contact.portfolio} onChange={(v) => updateContact('portfolio', v)} className="col-span-2" />
          </div>
        </Section>

        {/* Summary */}
        <Section icon={User} title="Professional Summary">
          <Textarea
            value={resume.summary}
            onChange={(e) => setResume({ summary: e.target.value })}
            placeholder="A compelling 2-3 sentence summary of your professional background..."
            className="min-h-[80px] resize-none"
          />
        </Section>

        {/* Experience */}
        <Section icon={Briefcase} title="Work Experience">
          {resume.experience.map((exp) => (
            <div key={exp.id} className="p-4 rounded-xl bg-muted/30 border border-border/50 space-y-3 mb-3">
              <div className="flex items-start justify-between">
                <GripVertical className="size-4 text-muted-foreground mt-2.5 cursor-grab" />
                <div className="flex-1 grid grid-cols-2 gap-2 mx-3">
                  <FieldInput label="Job Title" value={exp.title} onChange={(v) => updateExperience(exp.id, { title: v })} />
                  <FieldInput label="Company" value={exp.company} onChange={(v) => updateExperience(exp.id, { company: v })} />
                  <FieldInput label="Start Date" value={exp.startDate} onChange={(v) => updateExperience(exp.id, { startDate: v })} placeholder="Jan 2022" />
                  <FieldInput label="End Date" value={exp.endDate} onChange={(v) => updateExperience(exp.id, { endDate: v })} placeholder="Present" />
                  <FieldInput label="Location" value={exp.location} onChange={(v) => updateExperience(exp.id, { location: v })} className="col-span-2" />
                </div>
                <Button variant="ghost" size="icon-sm" onClick={() => removeExperience(exp.id)}>
                  <Trash2 className="size-3.5 text-destructive" />
                </Button>
              </div>

              <div className="pl-7 space-y-2">
                <Label className="text-xs text-muted-foreground">Achievement Bullets</Label>
                {exp.bullets.map((bullet, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-muted-foreground text-xs">•</span>
                    <Input
                      value={bullet}
                      onChange={(e) => updateBullet(exp.id, i, e.target.value)}
                      placeholder="Led team of 8 engineers to deliver..."
                      className="text-sm h-8"
                    />
                    <Button variant="ghost" size="icon-sm" onClick={() => removeBullet(exp.id, i)}>
                      <Trash2 className="size-3 text-muted-foreground" />
                    </Button>
                  </div>
                ))}
                <Button variant="ghost" size="sm" onClick={() => addBullet(exp.id)} className="text-xs gap-1">
                  <Plus className="size-3" /> Add Bullet
                </Button>
              </div>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={addExperience} className="gap-1.5 w-full">
            <Plus className="size-3.5" /> Add Experience
          </Button>
        </Section>

        {/* Education */}
        <Section icon={GraduationCap} title="Education">
          {resume.education.map((edu) => (
            <div key={edu.id} className="p-4 rounded-xl bg-muted/30 border border-border/50 space-y-3 mb-3">
              <div className="flex items-start gap-3">
                <div className="flex-1 grid grid-cols-2 gap-2">
                  <FieldInput label="Degree" value={edu.degree} onChange={(v) => updateEducation(edu.id, { degree: v })} />
                  <FieldInput label="School" value={edu.school} onChange={(v) => updateEducation(edu.id, { school: v })} />
                  <FieldInput label="Year" value={edu.graduationYear} onChange={(v) => updateEducation(edu.id, { graduationYear: v })} />
                  <FieldInput label="Details" value={edu.details} onChange={(v) => updateEducation(edu.id, { details: v })} placeholder="GPA, honors..." />
                </div>
                <Button variant="ghost" size="icon-sm" onClick={() => removeEducation(edu.id)}>
                  <Trash2 className="size-3.5 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={addEducation} className="gap-1.5 w-full">
            <Plus className="size-3.5" /> Add Education
          </Button>
        </Section>

        {/* Skills */}
        <Section icon={Wrench} title="Skills">
          <Textarea
            value={resume.skills.join(', ')}
            onChange={(e) => updateSkills(e.target.value)}
            placeholder="React, TypeScript, Python, Leadership, Data Analysis..."
            className="min-h-[60px] resize-none"
          />
          <p className="text-[10px] text-muted-foreground mt-1">Separate skills with commas</p>
        </Section>
      </div>
    </div>
  );
}

function Section({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Icon className="size-4 text-primary" />
        <h3 className="text-sm font-semibold">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function FieldInput({
  label,
  value,
  onChange,
  placeholder,
  className,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={cn('space-y-1', className)}>
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || label}
        className="h-8 text-sm"
      />
    </div>
  );
}
