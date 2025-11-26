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
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

export const REPORT_TYPE_LABELS: Record<string, string> = {
  brown_water: 'Brunatna woda',
  bad_smell: 'Nieprzyjemny zapach',
  sediment: 'Osad/zawiesiny',
  pressure: 'Niskie cisnienie',
  no_water: 'Brak wody',
  other: 'Inne',
};

export const STATUS_LABELS: Record<string, string> = {
  active: 'Aktywne',
  deleted: 'Usuniete',
  spam: 'Spam',
};
