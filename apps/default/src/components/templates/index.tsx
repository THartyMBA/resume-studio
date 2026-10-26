import type { ResumeData, TemplateId } from '@/stores/resume-store';
import { ModernTemplate, ClassicTemplate, MinimalTemplate, ExecutiveTemplate, BoldTemplate, GradientTemplate, InkTemplate, NeonTemplate } from './single-column';
import { CorporateTemplate, BankingTemplate, LegalTemplate, ConsultingTemplate, DeveloperTemplate, TerminalTemplate, StartupTemplate, AcademicTemplate, ResearchTemplate, ScholarlyTemplate, SerifTemplate, EditorialTemplate, LuxeTemplate } from './single-column-ext';
import { SplitTemplate, SidebarLeftTemplate, SidebarRightTemplate, MetroTemplate, BlueprintTemplate, MagazineTemplate } from './two-column';
import { getTextColor } from './shared';
import type { CSSProperties } from 'react';

const TEMPLATE_MAP: Record<TemplateId, React.FC<{ resume: ResumeData }>> = {
  modern: ModernTemplate,
  classic: ClassicTemplate,
  minimal: MinimalTemplate,
  executive: ExecutiveTemplate,
  split: SplitTemplate,
  'sidebar-left': SidebarLeftTemplate,
  'sidebar-right': SidebarRightTemplate,
  metro: MetroTemplate,
  bold: BoldTemplate,
  gradient: GradientTemplate,
  ink: InkTemplate,
  neon: NeonTemplate,
  corporate: CorporateTemplate,
  banking: BankingTemplate,
  legal: LegalTemplate,
  consulting: ConsultingTemplate,
  developer: DeveloperTemplate,
  terminal: TerminalTemplate,
  blueprint: BlueprintTemplate,
  startup: StartupTemplate,
  academic: AcademicTemplate,
  research: ResearchTemplate,
  scholarly: ScholarlyTemplate,
  serif: SerifTemplate,
  editorial: EditorialTemplate,
  magazine: MagazineTemplate,
  luxe: LuxeTemplate,
};

export function ResumeTemplate({ resume }: { resume: ResumeData }) {
  const Component = TEMPLATE_MAP[resume.template] || ModernTemplate;
  const textColor = getTextColor(resume);
  const style = { '--resume-text-color': textColor, color: textColor, minHeight: '100%' } as CSSProperties;
  return <div className="resume-template-root" style={style}><Component resume={resume} /></div>;
}
