import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind utility classes while preserving deduplication semantics.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

