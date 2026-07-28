/**
 * Tailwind class merger, originally added by shadcn. The shadcn components
 * themselves are gone — visual components use the BPL DS (`bp-*` classes)
 * instead — but `cn` is still used where Tailwind utilities are composed
 * conditionally (AdminBar, the root layout's font variables).
 */

import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
