import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('pl-PL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(date));
}

export const REPORT_TYPE_LABELS: Record<string, string> = {
  brown_water: 'Brunatna woda',
  bad_smell: 'Nieprzyjemny zapach',
  sediment: 'Osad/zawiesiny',
  pressure: 'Niskie ciśnienie',
  no_water: 'Brak wody',
  other: 'Inne',
};
