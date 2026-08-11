import { motion } from 'framer-motion';
import { Sparkles, FileText, MessageSquare, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LandingHeroProps {
  onGetStarted: () => void;
}

export function LandingHero({ onGetStarted }: LandingHeroProps) {
  const steps = [
    { icon: FileText, label: 'Upload', desc: 'Upload or paste your existing resume' },
    { icon: MessageSquare, label: 'Chat', desc: 'AI coach interviews you for details' },
    { icon: Download, label: 'Export', desc: 'Download a beautifully formatted PDF' },
    { icon: FileText, label: 'Cover Letter', desc: 'AI-generated letter for any job posting' },
  ];

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen px-6 overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-transparent to-violet-600/5 dark:from-blue-600/10 dark:to-violet-600/10" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="text-center max-w-3xl mx-auto"
      >
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium mb-8"
        >
          <Sparkles className="size-3.5" />
          AI-Powered Resume Builder
        </motion.div>

        {/* Heading */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-tight">
          Your career story,{' '}
          <span className="bg-gradient-to-r from-blue-500 to-violet-500 bg-clip-text text-transparent">
            perfectly told
          </span>
        </h1>

        <p className="mt-6 text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
          Upload your resume or start from scratch. Our AI coach conducts a professional interview, 
          then crafts a polished, ATS-optimized PDF resume tailored to your dream job.
        </p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Button
            size="lg"
            onClick={onGetStarted}
            className="gap-2 px-8 py-6 text-base bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 shadow-lg shadow-blue-500/25 transition-all hover:shadow-xl hover:shadow-blue-500/30 hover:scale-[1.02]"
          >
            <Sparkles className="size-4" />
            Get Started — Sign In
          </Button>
        </motion.div>
      </motion.div>

      {/* Steps */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.6 }}
        className="mt-20 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl w-full"
      >
        {steps.map((step, i) => (
          <motion.div
            key={step.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 + i * 0.15 }}
            className="flex flex-col items-center text-center p-6 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/30 transition-all hover:shadow-lg hover:shadow-primary/5"
          >
            <div className="size-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-violet-500/20 flex items-center justify-center mb-3">
              <step.icon className="size-5 text-primary" />
            </div>
            <span className="text-xs font-bold text-primary/60 uppercase tracking-widest mb-1">
              Step {i + 1}
            </span>
            <h3 className="font-semibold text-sm">{step.label}</h3>
            <p className="text-xs text-muted-foreground mt-1">{step.desc}</p>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
