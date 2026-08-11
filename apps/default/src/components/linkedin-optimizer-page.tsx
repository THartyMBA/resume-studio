import { useState } from 'react';
import { useResumeStore, type LinkedInResult } from '@/stores/resume-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Linkedin,
  FileText,
  Sparkles,
  Loader2,
  AlertCircle,
  Copy,
  Check,
  Target,
  User,
  Briefcase,
  Award,
  Lightbulb,
  ArrowUp,
  Minus,
  ArrowDown,
  Star,
  Hash,
  Zap,
  MessageSquare,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const HEADLINE_STYLE_META: Record<string, { icon: typeof Zap; color: string; label: string }> = {
  'keyword-rich': { icon: Hash, color: 'text-blue-500 bg-blue-500/10', label: 'Keyword Rich' },
  'story-driven': { icon: MessageSquare, color: 'text-violet-500 bg-violet-500/10', label: 'Story Driven' },
  'achievement-focused': { icon: Award, color: 'text-amber-500 bg-amber-500/10', label: 'Achievement' },
};

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={handleCopy} className="flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-md bg-muted/50 hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
      {copied ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

export function LinkedInOptimizerPage() {
  const { resume, linkedinTargetRole, linkedinResult, linkedinGenerating, setLinkedinTargetRole, setLinkedinResult, setLinkedinGenerating } = useResumeStore();
  const [error, setError] = useState('');

  const hasResume = resume.contact.fullName || resume.summary || resume.experience.length > 0;
  const canGenerate = hasResume && !linkedinGenerating;

  const formatExperience = () =>
    resume.experience.map((e) => `${e.title} at ${e.company} (${e.startDate} - ${e.endDate})\n${e.bullets.map((b) => '• ' + b).join('\n')}`).join('\n\n');

  const formatEducation = () =>
    resume.education.map((e) => `${e.degree} - ${e.school} (${e.graduationYear}) ${e.details}`).join('\n');

  const handleGenerate = async () => {
    setError('');
    setLinkedinGenerating(true);
    setLinkedinResult(null);
    try {
      const resp = await axios.post('/api/taskade/webhooks/01KQWNXCNQ9S7E641NVFYQHFZ1/run', {
        fullName: resume.contact.fullName,
        summary: resume.summary,
        experience: formatExperience(),
        skills: resume.skills.join(', '),
        education: formatEducation(),
        targetRole: linkedinTargetRole || 'general professional',
      });
      const raw = resp.data?.output?.result || resp.data?.result;
      if (!raw) { setError('Empty response from AI. Try again.'); return; }
      const parsed: LinkedInResult = typeof raw === 'string' ? JSON.parse(raw) : raw;
      setLinkedinResult(parsed);
    } catch (e: any) {
      console.error(e);
      setError(e?.response?.data?.message || 'Generation failed. Please try again.');
    } finally { setLinkedinGenerating(false); }
  };

  return (
    <div className="flex flex-col md:flex-row h-full overflow-hidden">
      {/* Left: Input Panel */}
      <div className="w-full md:w-[380px] lg:w-[420px] border-r border-border/50 flex flex-col overflow-hidden">
        <div className="px-5 py-4 border-b border-border/50">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-full bg-gradient-to-br from-[#0077B5] to-[#00A0DC] flex items-center justify-center">
              <Linkedin className="size-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-semibold">LinkedIn Optimizer</h2>
              <p className="text-[10px] text-muted-foreground">Transform your resume into a LinkedIn magnet</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-5 space-y-5">
          {/* Resume Status */}
          <div className={cn('flex items-start gap-3 p-3 rounded-xl border', hasResume ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-amber-500/30 bg-amber-500/5')}>
            <FileText className={cn('size-4 mt-0.5 shrink-0', hasResume ? 'text-emerald-500' : 'text-amber-500')} />
            <div>
              <p className={cn('text-xs font-medium', hasResume ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400')}>
                {hasResume ? `Using ${resume.contact.fullName}'s resume` : 'No resume data yet'}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {hasResume ? `${resume.experience.length} roles • ${resume.skills.length} skills • ${resume.education.length} degrees` : 'Build your resume with the Coach first'}
              </p>
            </div>
          </div>

          {/* Target Role */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Target className="size-3" /> Target Optimization
            </h3>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Target Role / Industry (optional)</Label>
              <Input
                value={linkedinTargetRole}
                onChange={(e) => setLinkedinTargetRole(e.target.value)}
                placeholder="e.g. Product Management, FinTech"
                className="h-8 text-sm"
              />
              <p className="text-[10px] text-muted-foreground">
                Specifying a target helps the AI optimize keywords for your industry
              </p>
            </div>
          </div>

          {/* What You Get */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="size-3" /> What You'll Get
            </h3>
            <div className="space-y-1.5">
              {[
                { icon: Zap, label: '3 optimized headline options', color: 'text-amber-500' },
                { icon: User, label: 'Full About section in first-person', color: 'text-blue-500' },
                { icon: Briefcase, label: 'LinkedIn-optimized experience entries', color: 'text-violet-500' },
                { icon: Award, label: 'Top 15 skills for the algorithm', color: 'text-emerald-500' },
                { icon: Lightbulb, label: 'Profile optimization tips', color: 'text-orange-500' },
              ].map(({ icon: Icon, label, color }) => (
                <div key={label} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Icon className={cn('size-3.5', color)} />
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="flex items-start gap-2 p-3 rounded-xl border border-destructive/30 bg-destructive/5">
                <AlertCircle className="size-4 text-destructive shrink-0 mt-0.5" />
                <p className="text-xs text-destructive">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Generate */}
          <Button onClick={handleGenerate} disabled={!canGenerate}
            className="w-full gap-2 h-10 bg-gradient-to-r from-[#0077B5] to-[#00A0DC] hover:from-[#005f8f] hover:to-[#0088bb] text-white shadow-md shadow-[#0077B5]/20">
            {linkedinGenerating ? (
              <><Loader2 className="size-4 animate-spin" />Optimizing profile...</>
            ) : (
              <><Linkedin className="size-4" />{linkedinResult ? 'Re-optimize' : 'Optimize for LinkedIn'}</>
            )}
          </Button>
        </div>
      </div>

      {/* Right: Results */}
      <div className="flex-1 overflow-auto bg-muted/30">
        <AnimatePresence mode="wait">
          {linkedinGenerating ? (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center h-full gap-4">
              <div className="size-16 rounded-2xl bg-gradient-to-br from-[#0077B5]/20 to-[#00A0DC]/20 flex items-center justify-center">
                <Linkedin className="size-7 text-[#0077B5] animate-pulse" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium">Crafting your LinkedIn presence...</p>
                <p className="text-xs text-muted-foreground mt-1">Generating headlines, about section, and optimized experience</p>
              </div>
            </motion.div>
          ) : linkedinResult ? (
            <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <LinkedInResults result={linkedinResult} userName={resume.contact.fullName} />
            </motion.div>
          ) : (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center h-full text-center gap-4">
              <div className="rounded-full bg-muted p-6"><Linkedin className="size-10 text-muted-foreground" /></div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">Your optimized LinkedIn will appear here</h3>
                <p className="text-sm text-muted-foreground max-w-sm">Click Optimize to transform your resume into a recruiter-magnet LinkedIn profile.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function LinkedInResults({ result, userName }: { result: LinkedInResult; userName: string }) {
  const priorityIcon = (p: string) => p === 'high' ? <ArrowUp className="size-3 text-red-500" /> : p === 'medium' ? <Minus className="size-3 text-amber-500" /> : <ArrowDown className="size-3 text-blue-400" />;

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* Headlines */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="p-5 rounded-2xl bg-card border border-border/50">
        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
          <Zap className="size-4 text-amber-500" /> Headline Options
        </h3>
        <div className="space-y-3">
          {result.headlines.map((h, i) => {
            const meta = HEADLINE_STYLE_META[h.style] || HEADLINE_STYLE_META['keyword-rich'];
            const Icon = meta.icon;
            return (
              <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * i }}
                className="group p-4 rounded-xl border border-border/50 bg-background hover:border-[#0077B5]/30 transition-all">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <span className={cn('text-[9px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1', meta.color)}>
                    <Icon className="size-2.5" /> {meta.label}
                  </span>
                  <CopyButton text={h.text} />
                </div>
                <p className="text-sm font-medium text-foreground leading-relaxed">{h.text}</p>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* About Section */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="p-5 rounded-2xl bg-card border border-border/50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <User className="size-4 text-[#0077B5]" /> About Section
          </h3>
          <CopyButton text={result.about} />
        </div>
        {/* LinkedIn-style preview */}
        <div className="rounded-xl border border-border/50 overflow-hidden">
          <div className="bg-gradient-to-r from-[#0077B5]/10 to-[#00A0DC]/10 px-5 py-3 border-b border-border/30">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full bg-gradient-to-br from-[#0077B5] to-[#00A0DC] flex items-center justify-center text-white font-bold text-sm">
                {userName.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
              <div>
                <p className="text-sm font-semibold">{userName}</p>
                <p className="text-[10px] text-muted-foreground">LinkedIn Preview</p>
              </div>
            </div>
          </div>
          <div className="p-5 bg-background">
            <p className="text-xs text-foreground leading-relaxed whitespace-pre-line">{result.about}</p>
          </div>
        </div>
      </motion.div>

      {/* Experience */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="p-5 rounded-2xl bg-card border border-border/50">
        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
          <Briefcase className="size-4 text-violet-500" /> Experience
          <span className="text-[10px] font-normal text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{result.experiences.length} roles</span>
        </h3>
        <div className="space-y-4">
          {result.experiences.map((exp, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35 + i * 0.08 }}
              className="p-4 rounded-xl border border-border/50 bg-background">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <p className="text-sm font-semibold">{exp.title}</p>
                  <p className="text-xs text-muted-foreground">{exp.company}</p>
                </div>
                <CopyButton text={exp.description} />
              </div>
              <p className="text-xs text-foreground/80 leading-relaxed whitespace-pre-line">{exp.description}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Skills */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
        className="p-5 rounded-2xl bg-card border border-border/50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Award className="size-4 text-emerald-500" /> Top Skills
            <span className="text-[10px] font-normal text-muted-foreground bg-muted px-1.5 py-0.5 rounded">Ordered by algorithm priority</span>
          </h3>
          <CopyButton text={result.topSkills.join(', ')} />
        </div>
        <div className="flex flex-wrap gap-2">
          {result.topSkills.map((skill, i) => {
            const isTop5 = i < 5;
            return (
              <motion.span key={i} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + i * 0.03 }}
                className={cn('text-[11px] px-2.5 py-1 rounded-full border flex items-center gap-1',
                  isTop5 ? 'bg-[#0077B5]/10 text-[#0077B5] dark:text-[#00A0DC] border-[#0077B5]/20 font-medium' : 'bg-muted/50 text-foreground/70 border-border/50'
                )}>
                {isTop5 && <Star className="size-2.5 fill-current" />}
                {skill}
              </motion.span>
            );
          })}
        </div>
        <p className="text-[10px] text-muted-foreground mt-3">★ Top 5 skills are prioritized by the LinkedIn algorithm for search visibility</p>
      </motion.div>

      {/* Profile Tips */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
        className="p-5 rounded-2xl bg-card border border-border/50">
        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
          <Lightbulb className="size-4 text-orange-500" /> Profile Optimization Tips
        </h3>
        <div className="space-y-2.5">
          {result.profileTips.map((tip, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.65 + i * 0.08 }}
              className={cn('flex items-start gap-3 p-3 rounded-xl border',
                tip.impact === 'high' ? 'border-red-500/20 bg-red-500/5' : tip.impact === 'medium' ? 'border-amber-500/20 bg-amber-500/5' : 'border-blue-500/20 bg-blue-500/5'
              )}>
              <div className="mt-0.5">{priorityIcon(tip.impact)}</div>
              <div className="flex-1">
                <span className={cn('text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded',
                  tip.impact === 'high' ? 'bg-red-500/10 text-red-500' : tip.impact === 'medium' ? 'bg-amber-500/10 text-amber-500' : 'bg-blue-500/10 text-blue-400'
                )}>{tip.impact} impact</span>
                <p className="text-xs text-foreground leading-relaxed mt-1">{tip.tip}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
