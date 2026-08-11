import { cn } from '@/lib/utils';
import { type BadgeData } from '@/hooks/use-nav-badges';

interface NavBadgeProps {
  badge: BadgeData | null;
  /** Compact mode for mobile nav (smaller sizing) */
  compact?: boolean;
}

/**
 * Renders a notification badge for nav tabs.
 *
 * Variants:
 * - `count`:  Blue pill with number (e.g. "3")
 * - `dot`:    Small pulsing dot to prompt discovery
 * - `alert`:  Orange/amber pill with number (needs attention)
 */
export function NavBadge({ badge, compact = false }: NavBadgeProps) {
  if (!badge) return null;

  if (badge.variant === 'dot') {
    return (
      <span
        className={cn(
          'relative flex shrink-0',
          compact ? 'size-1.5' : 'size-2'
        )}
        title={badge.hint}
      >
        <span className="absolute inset-0 rounded-full bg-primary/60 animate-ping" />
        <span className="relative inline-flex rounded-full size-full bg-primary" />
      </span>
    );
  }

  if (badge.variant === 'alert') {
    return (
      <span
        className={cn(
          'inline-flex items-center justify-center font-bold rounded-full shrink-0',
          'bg-amber-500 text-white',
          compact
            ? 'text-[7px] min-w-[14px] h-[14px] px-[3px]'
            : 'text-[8px] min-w-[16px] h-[16px] px-1'
        )}
        title={badge.hint}
      >
        {badge.value > 9 ? '9+' : badge.value}
      </span>
    );
  }

  // count variant
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center font-bold rounded-full shrink-0',
        'bg-primary/15 text-primary',
        compact
          ? 'text-[7px] min-w-[14px] h-[14px] px-[3px]'
          : 'text-[8px] min-w-[16px] h-[16px] px-1'
      )}
      title={badge.hint}
    >
      {badge.value > 99 ? '99+' : badge.value}
    </span>
  );
}
