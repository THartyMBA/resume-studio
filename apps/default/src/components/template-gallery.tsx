import { useState, useMemo } from 'react';
import { useAuth } from 'react-oidc-context';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useResumeStore, type TemplateId } from '@/stores/resume-store';
import {
  TEMPLATES, CATEGORY_INFO, FREE_TEMPLATES, PREMIUM_TEMPLATES,
  type TemplateCategory, type TemplateDefinition,
} from '@/lib/template-registry';
import { useUserTier } from '@/hooks/use-user-tier';
import { redirectToCheckout } from '@/lib/stripe-checkout';
import {
  LayoutGrid, Search, Check, Columns2, FileText, Palette,
  Briefcase, Code2, GraduationCap, Sparkles, Lock, Crown, Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const CATEGORY_ICONS: Record<TemplateCategory, React.ElementType> = {
  professional: FileText, 'two-column': Columns2, creative: Palette,
  corporate: Briefcase, tech: Code2, academic: GraduationCap, elegant: Sparkles,
};
type TierFilter = 'all' | 'free' | 'premium';
const CATEGORIES: (TemplateCategory | 'all')[] = ['all','professional','two-column','creative','corporate','tech','academic','elegant'];

export function TemplateGallery() {
  const { resume, setResume } = useResumeStore();
  const { hasPremiumTemplates: isPremium } = useUserTier();
  const [open, setOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<TemplateCategory | 'all'>('all');
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState<TierFilter>('all');
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [previewTmpl, setPreviewTmpl] = useState<TemplateDefinition | null>(null);

  const filtered = useMemo(() => {
    let list = TEMPLATES;
    if (activeCategory !== 'all') list = list.filter(t => t.category === activeCategory);
    if (tierFilter === 'free') list = list.filter(t => !t.premium);
    if (tierFilter === 'premium') list = list.filter(t => t.premium);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(t => t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q) || t.bestFor.toLowerCase().includes(q) || t.tags.some(tag => tag.includes(q)));
    }
    return list;
  }, [activeCategory, tierFilter, search]);

  const handleSelect = (tmpl: TemplateDefinition) => {
    if (tmpl.premium && !isPremium) { setPreviewTmpl(tmpl); setUpgradeOpen(true); return; }
    setResume({ template: tmpl.id, accentColor: tmpl.defaultAccent || resume.accentColor });
    setOpen(false);
  };

  return (
    <>
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-all">
          <LayoutGrid className="size-3.5" />
          Templates
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-3">
          <DialogTitle className="text-lg">Choose a Template</DialogTitle>
          <p className="text-xs text-muted-foreground">
            {FREE_TEMPLATES.length} free + {PREMIUM_TEMPLATES.length} premium templates across 7 categories
            {isPremium && <span className="ml-2 inline-flex items-center gap-1 text-amber-500 font-medium"><Crown className="size-3" /> Premium Unlocked</span>}
          </p>
        </DialogHeader>

        {/* Search + Tier Toggle */}
        <div className="px-6 pb-3 flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search templates..." className="pl-9 h-8 text-sm" />
          </div>
          <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-0.5">
            {([{ id: 'all' as TierFilter, label: 'All' }, { id: 'free' as TierFilter, label: 'Free' }, { id: 'premium' as TierFilter, label: 'Premium' }]).map(t => (
              <button key={t.id} onClick={() => setTierFilter(t.id)}
                className={cn('flex items-center gap-1 px-2.5 py-1 text-[10px] font-medium rounded-md transition-all',
                  tierFilter === t.id ? (t.id === 'premium' ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-600 dark:text-amber-400 shadow-sm' : 'bg-background text-foreground shadow-sm') : 'text-muted-foreground hover:text-foreground')}>
                {t.id === 'premium' && <Crown className="size-2.5" />}{t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1 px-6 pb-3 overflow-x-auto scrollbar-none">
          {CATEGORIES.map(cat => {
            const isAll = cat === 'all';
            const Icon = isAll ? LayoutGrid : CATEGORY_ICONS[cat as TemplateCategory];
            const label = isAll ? 'All' : CATEGORY_INFO[cat as TemplateCategory].label;
            const count = isAll ? TEMPLATES.length : TEMPLATES.filter(t => t.category === cat).length;
            return (
              <button key={cat} onClick={() => setActiveCategory(cat)}
                className={cn('flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-all',
                  activeCategory === cat ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground hover:bg-muted')}>
                <Icon className="size-3.5" />{label}
                <span className={cn('text-[10px]', activeCategory === cat ? 'opacity-80' : 'opacity-50')}>{count}</span>
              </button>);
          })}
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-auto px-6 pb-6">
          {activeCategory !== 'all' && !search && (
            <p className="text-xs text-muted-foreground mb-3">{CATEGORY_INFO[activeCategory as TemplateCategory]?.emoji} {CATEGORY_INFO[activeCategory as TemplateCategory]?.description}</p>
          )}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {filtered.map(tmpl => (
              <TemplateCard key={tmpl.id} template={tmpl} selected={resume.template === tmpl.id}
                locked={!!tmpl.premium && !isPremium} onSelect={() => handleSelect(tmpl)} />
            ))}
          </div>
          {filtered.length === 0 && <div className="text-center py-12"><p className="text-sm text-muted-foreground">No templates match your search</p></div>}
        </div>
      </DialogContent>
    </Dialog>
    <UpgradeDialog open={upgradeOpen} onClose={() => { setUpgradeOpen(false); setPreviewTmpl(null); }} template={previewTmpl} />
    </>
  );
}

function TemplateCard({ template, selected, locked, onSelect }: { template: TemplateDefinition; selected: boolean; locked: boolean; onSelect: () => void }) {
  const [h, , b, a] = template.previewColors;
  return (
    <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} onClick={onSelect}
      className={cn('group relative flex flex-col rounded-xl border overflow-hidden text-left transition-all',
        selected ? 'border-primary ring-2 ring-primary/30 shadow-lg' : locked ? 'border-border/30 hover:border-amber-500/40 hover:shadow-md' : 'border-border/50 hover:border-primary/40 hover:shadow-md')}>
      <div className="relative h-28 bg-white overflow-hidden">
        {template.twoColumn ? (
          <div className="flex h-full">
            <div style={{ backgroundColor: h, width: '35%' }}><div className="p-2"><div className="h-2 w-12 rounded-sm mb-1" style={{ backgroundColor: 'rgba(255,255,255,0.5)' }} /><div className="h-1 w-8 rounded-sm" style={{ backgroundColor: 'rgba(255,255,255,0.3)' }} /><div className="mt-3 space-y-1">{[...Array(4)].map((_, i) => <div key={i} className="h-1 rounded-sm" style={{ backgroundColor: 'rgba(255,255,255,0.2)', width: `${60 + i * 8}%` }} />)}</div></div></div>
            <div style={{ backgroundColor: b }} className="flex-1 p-2"><div className="space-y-2"><div className="h-1.5 w-16 rounded-sm" style={{ backgroundColor: a, opacity: 0.6 }} />{[...Array(3)].map((_, i) => <div key={i} className="h-1 rounded-sm" style={{ backgroundColor: '#00000012', width: `${90 - i * 10}%` }} />)}<div className="h-1.5 w-14 rounded-sm mt-2" style={{ backgroundColor: a, opacity: 0.6 }} />{[...Array(2)].map((_, i) => <div key={i} className="h-1 rounded-sm" style={{ backgroundColor: '#00000012', width: `${85 - i * 12}%` }} />)}</div></div>
          </div>
        ) : (
          <div className="h-full flex flex-col" style={{ backgroundColor: b }}>
            <div style={{ backgroundColor: h, height: h === '#fff' || h === '#ffffff' ? '0' : '28%' }}><div className="p-2"><div className="h-2 w-16 rounded-sm" style={{ backgroundColor: h === '#0a0a0a' ? a : 'rgba(255,255,255,0.5)' }} /><div className="h-1 w-10 rounded-sm mt-1" style={{ backgroundColor: h === '#0a0a0a' ? `${a}66` : 'rgba(255,255,255,0.3)' }} /></div></div>
            <div className="flex-1 p-2">{(h === '#fff' || h === '#ffffff') && <div className="mb-1"><div className="h-2.5 w-20 rounded-sm" style={{ backgroundColor: a, opacity: 0.7 }} /><div className="h-1 w-14 rounded-sm mt-1" style={{ backgroundColor: '#00000015' }} /></div>}<div className="space-y-1.5 mt-1"><div className="h-1 w-12 rounded-sm" style={{ backgroundColor: a, opacity: 0.5 }} />{[...Array(3)].map((_, i) => <div key={i} className="h-0.5 rounded-sm" style={{ backgroundColor: '#00000010', width: `${95 - i * 8}%` }} />)}</div></div>
          </div>
        )}
        {locked && (
          <div className="absolute inset-0 bg-background/60 dark:bg-background/70 backdrop-blur-[2px] flex items-center justify-center transition-opacity group-hover:bg-background/50">
            <div className="flex flex-col items-center gap-1">
              <div className="size-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20"><Lock className="size-3.5 text-white" /></div>
              <span className="text-[9px] font-bold text-amber-600 dark:text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity">PREMIUM</span>
            </div>
          </div>
        )}
        {selected && <div className="absolute top-1.5 right-1.5 size-5 rounded-full bg-primary flex items-center justify-center"><Check className="size-3 text-primary-foreground" /></div>}
      </div>
      <div className="p-2.5 bg-card">
        <div className="flex items-center gap-1.5">
          <span className={cn('text-xs font-semibold truncate', locked && 'text-muted-foreground')}>{template.name}</span>
          {template.twoColumn && <span className="text-[9px] px-1.5 py-0.5 bg-primary/10 text-primary rounded font-medium">2-col</span>}
          {template.premium && <span className="text-[8px] px-1.5 py-0.5 bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-600 dark:text-amber-400 rounded font-bold flex items-center gap-0.5 shrink-0"><Crown className="size-2" />PRO</span>}
        </div>
        <p className={cn('text-[10px] mt-0.5 line-clamp-1', locked ? 'text-muted-foreground/60' : 'text-muted-foreground')}>{template.description}</p>
        <p className="text-[9px] text-muted-foreground/60 mt-1">Best for: {template.bestFor}</p>
      </div>
    </motion.button>
  );
}

function UpgradeDialog({ open, onClose, template }: { open: boolean; onClose: () => void; template: TemplateDefinition | null }) {
  const auth = useAuth();
  const [purchasing, setPurchasing] = useState(false);

  const handlePurchase = async () => {
    const sub = auth.user?.profile?.sub;
    const email = auth.user?.profile?.email as string;
    const name = (auth.user?.profile?.name || '') as string;
    if (!sub || !email) { toast.error('Please sign in to purchase.'); return; }
    setPurchasing(true);
    try {
      await redirectToCheckout({ userSub: sub, email, name, plan: 'premium_templates' });
    } catch (_err) {
      toast.error('Failed to start checkout. Please try again.');
      setPurchasing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-md p-0 overflow-hidden">
        <div className="relative bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 px-6 pt-8 pb-6 text-white">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_60%)]" />
          <div className="relative flex items-center gap-2">
            <div className="size-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center"><Crown className="size-5" /></div>
            <div><h3 className="text-lg font-bold">Premium Templates</h3><p className="text-xs text-white/80">Unlock all {PREMIUM_TEMPLATES.length} premium designs</p></div>
          </div>
        </div>
        <div className="px-6 py-5 space-y-4">
          {template && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 border border-border/50">
              <Lock className="size-4 text-amber-500 shrink-0" />
              <div><p className="text-xs font-semibold">"{template.name}" is a premium template</p><p className="text-[10px] text-muted-foreground">{template.description}</p></div>
            </div>
          )}
          <div className="space-y-2.5">
            {['Access to all 20 premium templates','New templates added regularly','One-time purchase — yours forever','Includes all 7 categories'].map(item => (
              <div key={item} className="flex items-center gap-2.5">
                <div className="size-5 rounded-full bg-emerald-500/15 flex items-center justify-center shrink-0"><Check className="size-3 text-emerald-500" /></div>
                <span className="text-xs">{item}</span>
              </div>
            ))}
          </div>
          <button
            onClick={handlePurchase}
            disabled={purchasing}
            className="w-full py-3 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-sm font-semibold shadow-lg shadow-amber-500/20 transition-all hover:shadow-xl disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {purchasing ? <><Loader2 className="size-4 animate-spin" /> Redirecting…</> : <><Crown className="size-4" /> Unlock Premium — $29</>}
          </button>
          <button onClick={onClose} className="w-full py-2.5 rounded-lg bg-muted text-sm font-medium hover:bg-muted/80 transition-colors">Browse Free Templates</button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
