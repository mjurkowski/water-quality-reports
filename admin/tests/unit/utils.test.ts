import { describe, it, expect } from 'vitest';
import { cn, formatDate, REPORT_TYPE_LABELS, STATUS_LABELS } from '@/lib/utils/utils';

describe('Utils', () => {
  describe('cn', () => {
    it('should merge class names', () => {
      expect(cn('foo', 'bar')).toBe('foo bar');
    });
  });

  describe('formatDate', () => {
    it('should format date with time', () => {
      const date = new Date('2024-01-15T10:30:00');
      const formatted = formatDate(date);
      expect(formatted).toMatch(/\d{2}\.\d{2}\.\d{4}, \d{2}:\d{2}/);
    });
  });

  describe('REPORT_TYPE_LABELS', () => {
    it('should have all report types', () => {
      expect(REPORT_TYPE_LABELS).toHaveProperty('brown_water');
      expect(REPORT_TYPE_LABELS.brown_water).toBe('Brunatna woda');
    });
  });

  describe('STATUS_LABELS', () => {
    it('should have all statuses', () => {
      expect(STATUS_LABELS).toHaveProperty('active');
      expect(STATUS_LABELS).toHaveProperty('deleted');
      expect(STATUS_LABELS).toHaveProperty('spam');
    });
  });
});
