import { useTheme } from "@/lib/theme-provider"

/**
 * Compatibility shim: LLMs often generate `import { useTheme } from '@/hooks/use-theme'`.
 * This re-exports our custom theme provider.
 *
 * Preferred usage: import { useTheme } from "@/lib/theme-provider" directly.
 */
export { useTheme }
