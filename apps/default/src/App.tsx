import { useState } from 'react';
import { useAuth } from 'react-oidc-context';
import { useResumeStore } from '@/stores/resume-store';
import { ChatPanel } from '@/components/chat-panel';
import { ResumePreview } from '@/components/resume-preview';
import { ResumeEditor } from '@/components/resume-editor';
import { CoverLetterPage } from '@/components/cover-letter-page';
import { ATSCheckerPage } from '@/components/ats-checker-page';
import { LinkedInOptimizerPage } from '@/components/linkedin-optimizer-page';
import { InterviewPrepPage } from '@/components/interview-prep-page';
import { SalaryPrepPage } from '@/components/salary-prep-page';
import { ComparePage } from '@/components/compare-page';
import { JobTrackerPage } from '@/components/job-tracker-page';
import { SkillsGapPage } from '@/components/skills-gap-page';
import { DashboardPage } from '@/components/dashboard-page';
import { VersionManager } from '@/components/version-manager';
import { LandingHero } from '@/components/landing-hero';
import { Button } from '@/components/ui/button';
import {
  MessageSquare, Edit3, Eye, Sun, Moon, FileText, PenLine,
  ShieldCheck, Linkedin, Mic, DollarSign, GitCompareArrows,
  Kanban, Target, LogOut, Loader2, LayoutDashboard,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/lib/theme-provider';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavBadges } from '@/hooks/use-nav-badges';
import { NavBadge } from '@/components/nav-badge';
import { PaymentGate } from '@/components/payment-gate';

const App: React.FC = function () {
  // ── ALL hooks must be called before any conditional returns ──
  const auth = useAuth();
  const activeView = useResumeStore((s) => s.activeView);
  const setActiveView = useResumeStore((s) => s.setActiveView);
  const { theme, setTheme } = useTheme();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const badges = useNavBadges();

  // ── Conditional returns (after all hooks) ──
  if (auth.isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="size-8 text-primary animate-spin" />
          <p className="text-sm text-muted-foreground">Loading…</p>
        </div>
      </div>
    );
  }

  if (!auth.isAuthenticated) {
    return <LandingHero onGetStarted={() => auth.signinRedirect()} />;
  }

  const userProfile = auth.user?.profile;
  const userName = String(userProfile?.name || userProfile?.preferred_username || 'User');
  const userEmail = String(userProfile?.email || '');
  const userInitial = userName.charAt(0).toUpperCase();
  const isDark = theme === 'dark';
  const views = [
    { id: 'dashboard' as const, icon: LayoutDashboard, label: 'Home' },
    { id: 'chat' as const, icon: MessageSquare, label: 'Coach' },
    { id: 'editor' as const, icon: Edit3, label: 'Editor' },
    { id: 'preview' as const, icon: Eye, label: 'Preview' },
    { id: 'cover-letter' as const, icon: PenLine, label: 'Cover Letter' },
    { id: 'ats' as const, icon: ShieldCheck, label: 'ATS Score' },
    { id: 'linkedin' as const, icon: Linkedin, label: 'LinkedIn' },
    { id: 'interview' as const, icon: Mic, label: 'Interview' },
    { id: 'salary' as const, icon: DollarSign, label: 'Salary' },
    { id: 'compare' as const, icon: GitCompareArrows, label: 'Compare' },
    { id: 'tracker' as const, icon: Kanban, label: 'Tracker' },
    { id: 'skills-gap' as const, icon: Target, label: 'Skills Gap' },
  ];

  const renderView = () => {
    switch (activeView) {
      case 'dashboard': return <DashboardPage />;
      case 'cover-letter': return <CoverLetterPage />;
      case 'ats': return <ATSCheckerPage />;
      case 'linkedin': return <LinkedInOptimizerPage />;
      case 'interview': return <InterviewPrepPage />;
      case 'salary': return <SalaryPrepPage />;
      case 'compare': return <ComparePage />;
      case 'tracker': return <JobTrackerPage />;
      case 'skills-gap': return <SkillsGapPage />;
      default: return null;
    }
  };

  const isFullPage = ['dashboard','cover-letter','ats','linkedin','interview','salary','compare','tracker','skills-gap'].includes(activeView);

  return (
    <PaymentGate>
    <div className="flex flex-col h-screen bg-background">
      <header className="flex items-center justify-between px-4 py-2 border-b border-border/50 bg-card/50 backdrop-blur-sm z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => setActiveView('dashboard')} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="size-7 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center">
              <FileText className="size-3.5 text-white" />
            </div>
            <span className="font-semibold text-sm">ResumeForge</span>
          </button>
        </div>
        <nav className="hidden md:flex items-center gap-1 bg-muted/50 rounded-lg p-1">
          {views.map((v) => {
            const badge = badges[v.id];
            const isActive = activeView === v.id;
            return (
              <button key={v.id} onClick={() => setActiveView(v.id)}
                className={cn('relative flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-medium rounded-md transition-all',
                  isActive ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground')}>
                <v.icon className="size-3.5" />
                {v.label}
                <NavBadge badge={badge} />
              </button>
            );
          })}
        </nav>
        <div className="flex items-center gap-2">
          <VersionManager />
          <Button variant="ghost" size="icon-sm" onClick={() => setTheme(isDark ? 'light' : 'dark')}>
            {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </Button>
          <div className="relative">
            <button onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="size-8 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center text-white text-xs font-bold hover:opacity-90 transition-opacity ring-2 ring-transparent hover:ring-violet-500/30"
              title={userName}>
              {userInitial}
            </button>
            <AnimatePresence>
              {userMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                  <motion.div initial={{ opacity: 0, y: -4, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -4, scale: 0.95 }} transition={{ duration: 0.15 }}
                    className="absolute right-0 top-10 z-50 w-56 rounded-xl border border-border/50 bg-card shadow-xl overflow-hidden">
                    <div className="px-4 py-3 border-b border-border/30">
                      <div className="flex items-center gap-2.5">
                        <div className="size-9 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                          {userInitial}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold truncate">{userName}</p>
                          {userEmail && <p className="text-[10px] text-muted-foreground truncate">{userEmail}</p>}
                        </div>
                      </div>
                    </div>
                    <div className="p-1.5">
                      <button onClick={() => { setUserMenuOpen(false); auth.signoutRedirect(); }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-red-600 dark:text-red-400 rounded-lg hover:bg-red-500/10 transition-colors">
                        <LogOut className="size-3.5" /> Sign out
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      <div className="hidden md:flex flex-1 overflow-hidden">
        {isFullPage ? (
          <div className="flex-1 overflow-hidden">{renderView()}</div>
        ) : (
          <>
            <div className={cn('border-r border-border/50 transition-all duration-300 overflow-hidden', activeView === 'chat' ? 'w-[420px]' : 'w-0')}>
              <div className="w-[420px] h-full"><ChatPanel /></div>
            </div>
            <div className={cn('border-r border-border/50 transition-all duration-300 overflow-hidden', activeView === 'editor' ? 'flex-1' : 'w-0')}>
              <ResumeEditor />
            </div>
            <div className="flex-1 overflow-hidden"><ResumePreview /></div>
          </>
        )}
      </div>

      <div className="flex-1 overflow-hidden md:hidden">
        <AnimatePresence mode="wait">
          <motion.div key={activeView} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }} className="h-full">
            {activeView === 'dashboard' && <DashboardPage />}
            {activeView === 'chat' && <ChatPanel />}
            {activeView === 'editor' && <ResumeEditor />}
            {activeView === 'preview' && <ResumePreview />}
            {activeView === 'cover-letter' && <CoverLetterPage />}
            {activeView === 'ats' && <ATSCheckerPage />}
            {activeView === 'linkedin' && <LinkedInOptimizerPage />}
            {activeView === 'interview' && <InterviewPrepPage />}
            {activeView === 'salary' && <SalaryPrepPage />}
            {activeView === 'compare' && <ComparePage />}
            {activeView === 'tracker' && <JobTrackerPage />}
            {activeView === 'skills-gap' && <SkillsGapPage />}
          </motion.div>
        </AnimatePresence>
      </div>

      <nav className="md:hidden flex items-center overflow-x-auto border-t border-border/50 bg-card/80 backdrop-blur-sm py-2 px-1 gap-1 scrollbar-none">
        {views.map((v) => {
          const badge = badges[v.id];
          const isActive = activeView === v.id;
          return (
            <button key={v.id} onClick={() => setActiveView(v.id)}
              className={cn('relative flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-all shrink-0',
                isActive ? 'text-primary' : 'text-muted-foreground')}>
              <span className="relative">
                <v.icon className="size-4" />
                {badge && <span className="absolute -top-1.5 -right-2.5"><NavBadge badge={badge} compact /></span>}
              </span>
              <span className="text-[9px] font-medium whitespace-nowrap">{v.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
    </PaymentGate>
  );
};

export default App;
