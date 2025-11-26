import { describe, it, expect } from 'vitest';
import { cn, formatDate, REPORT_TYPE_LABELS } from '@/lib/utils/utils';

describe('Utils', () => {
  describe('cn', () => {
    it('should merge class names', () => {
      expect(cn('foo', 'bar')).toBe('foo bar');
    });

    it('should handle conditional classes', () => {
      expect(cn('foo', false && 'bar', 'baz')).toBe('foo baz');
    });

    it('should merge tailwind classes', () => {
      expect(cn('px-2', 'px-4')).toBe('px-4');
    });
  });

  describe('formatDate', () => {
    it('should format date to Polish format', () => {
      const date = new Date('2024-01-15');
      const formatted = formatDate(date);
      expect(formatted).toMatch(/\d{2}\.\d{2}\.\d{4}/);
    });

    it('should handle string dates', () => {
      const formatted = formatDate('2024-01-15');
      expect(formatted).toMatch(/\d{2}\.\d{2}\.\d{4}/);
    });
  });

  describe('REPORT_TYPE_LABELS', () => {
    it('should have all report types', () => {
      expect(REPORT_TYPE_LABELS).toHaveProperty('brown_water');
      expect(REPORT_TYPE_LABELS).toHaveProperty('bad_smell');
      expect(REPORT_TYPE_LABELS).toHaveProperty('sediment');
      expect(REPORT_TYPE_LABELS).toHaveProperty('pressure');
      expect(REPORT_TYPE_LABELS).toHaveProperty('no_water');
      expect(REPORT_TYPE_LABELS).toHaveProperty('other');
    });
  });
});
