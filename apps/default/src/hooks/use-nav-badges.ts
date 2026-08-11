import { useMemo } from 'react';
import { useResumeStore } from '@/stores/resume-store';
import { useJobTrackerStore } from '@/stores/job-tracker-store';

export type BadgeVariant = 'count' | 'dot' | 'alert';

export interface BadgeData {
  value: number;
  variant: BadgeVariant;
  /** Tooltip hint explaining why the badge is shown */
  hint: string;
}

type ViewId =
  | 'dashboard' | 'chat' | 'editor' | 'preview'
  | 'cover-letter' | 'ats' | 'linkedin' | 'interview'
  | 'salary' | 'compare' | 'tracker' | 'skills-gap';

/**
 * Computes notification badges for each nav tab.
 *
 * Badge philosophy:
 * - Counts show actionable items (jobs at a stage, versions saved)
 * - Dots prompt the user to try an unused feature
 * - Alerts flag something that needs attention (low ATS score)
 */
export function useNavBadges(): Record<ViewId, BadgeData | null> {
  const resume = useResumeStore((s) => s.resume);
  const versions = useResumeStore((s) => s.versions);
  const atsResult = useResumeStore((s) => s.atsResult);
  const coverLetter = useResumeStore((s) => s.coverLetter);
  const linkedinResult = useResumeStore((s) => s.linkedinResult);
  const interviewResult = useResumeStore((s) => s.interviewResult);
  const salaryResult = useResumeStore((s) => s.salaryResult);
  const skillsGapResult = useResumeStore((s) => s.skillsGapResult);
  const jobs = useJobTrackerStore((s) => s.jobs);

  return useMemo(() => {
    const hasResume = !!(resume.contact.fullName || resume.summary || resume.experience.length);

    const interviewJobs = jobs.filter((j) => j.stage === 'interview').length;
    const offerJobs = jobs.filter((j) => j.stage === 'offer').length;
    const activeJobs = jobs.filter((j) => j.stage !== 'rejected').length;

    const badges: Record<ViewId, BadgeData | null> = {
      dashboard: null,
      chat: null,
      preview: null,
      compare: null,

      // Editor — show version count if any
      editor: versions.length > 0
        ? { value: versions.length, variant: 'count', hint: `${versions.length} saved version${versions.length === 1 ? '' : 's'}` }
        : null,

      // Cover Letter — prompt if resume exists but no letter yet
      'cover-letter': hasResume && !coverLetter.body
        ? { value: 1, variant: 'dot', hint: 'Generate a cover letter' }
        : null,

      // ATS — alert if score is low, prompt if not checked yet
      ats: atsResult
        ? (atsResult.overallScore < 70
          ? { value: atsResult.improvements.length, variant: 'alert', hint: `${atsResult.improvements.length} improvement${atsResult.improvements.length === 1 ? '' : 's'} suggested` }
          : null)
        : (hasResume
          ? { value: 1, variant: 'dot', hint: 'Run an ATS compatibility check' }
          : null),

      // LinkedIn — prompt if not optimized yet
      linkedin: hasResume && !linkedinResult
        ? { value: 1, variant: 'dot', hint: 'Optimize your LinkedIn profile' }
        : null,

      // Interview — show count of jobs at interview stage
      interview: interviewJobs > 0
        ? { value: interviewJobs, variant: 'count', hint: `${interviewJobs} upcoming interview${interviewJobs === 1 ? '' : 's'}` }
        : (hasResume && !interviewResult
          ? { value: 1, variant: 'dot', hint: 'Prepare for interviews' }
          : null),

      // Salary — show offer count
      salary: offerJobs > 0
        ? { value: offerJobs, variant: 'count', hint: `${offerJobs} offer${offerJobs === 1 ? '' : 's'} to negotiate` }
        : null,

      // Tracker — show active application count
      tracker: activeJobs > 0
        ? { value: activeJobs, variant: 'count', hint: `${activeJobs} active application${activeJobs === 1 ? '' : 's'}` }
        : null,

      // Skills Gap — prompt if not analyzed yet
      'skills-gap': hasResume && !skillsGapResult
        ? { value: 1, variant: 'dot', hint: 'Analyze your skills gap' }
        : null,
    };

    return badges;
  }, [resume, versions, atsResult, coverLetter, linkedinResult, interviewResult, salaryResult, skillsGapResult, jobs]);
}
