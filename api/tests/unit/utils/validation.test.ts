import {
  createReportSchema,
  reportFiltersSchema,
  statsQuerySchema,
  geocodeSearchSchema,
  reportTypesEnum
} from '@/utils/validation';

describe('Validation Schemas', () => {
  describe('createReportSchema', () => {
    const validReport = {
      types: ['brown_water'],
      latitude: 52.2297,
      longitude: 21.0122,
      reportedAt: '2024-11-19T10:00:00.000Z',
    };

    it('should validate a valid report', () => {
      const result = createReportSchema.safeParse(validReport);
      expect(result.success).toBe(true);
    });

    it('should validate report with all optional fields', () => {
      const fullReport = {
        ...validReport,
        description: 'Test description',
        address: 'ul. Testowa 1, Warszawa',
        contactEmail: 'test@example.com',
        photos: [{ base64: 'data:image/png;base64,abc123', mimeType: 'image/png' }],
      };
      const result = createReportSchema.safeParse(fullReport);
      expect(result.success).toBe(true);
    });

    it('should reject report without types', () => {
      const { types, ...reportWithoutTypes } = validReport;
      const result = createReportSchema.safeParse(reportWithoutTypes);
      expect(result.success).toBe(false);
    });

    it('should reject report with empty types array', () => {
      const result = createReportSchema.safeParse({ ...validReport, types: [] });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('At least one type');
      }
    });

    it('should reject report with more than 3 types', () => {
      const result = createReportSchema.safeParse({
        ...validReport,
        types: ['brown_water', 'bad_smell', 'sediment', 'pressure'],
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('Maximum 3 types');
      }
    });

    it('should reject invalid report type', () => {
      const result = createReportSchema.safeParse({
        ...validReport,
        types: ['invalid_type'],
      });
      expect(result.success).toBe(false);
    });

    it('should reject invalid latitude (> 90)', () => {
      const result = createReportSchema.safeParse({
        ...validReport,
        latitude: 91,
      });
      expect(result.success).toBe(false);
    });

    it('should reject invalid latitude (< -90)', () => {
      const result = createReportSchema.safeParse({
        ...validReport,
        latitude: -91,
      });
      expect(result.success).toBe(false);
    });

    it('should reject invalid longitude (> 180)', () => {
      const result = createReportSchema.safeParse({
        ...validReport,
        longitude: 181,
      });
      expect(result.success).toBe(false);
    });

    it('should reject invalid email format', () => {
      const result = createReportSchema.safeParse({
        ...validReport,
        contactEmail: 'not-an-email',
      });
      expect(result.success).toBe(false);
    });

    it('should reject more than 5 photos', () => {
      const photos = Array(6).fill({ base64: 'data:image/png;base64,abc', mimeType: 'image/png' });
      const result = createReportSchema.safeParse({
        ...validReport,
        photos,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('Maximum 5 photos');
      }
    });

    it('should reject description longer than 2000 chars', () => {
      const result = createReportSchema.safeParse({
        ...validReport,
        description: 'a'.repeat(2001),
      });
      expect(result.success).toBe(false);
    });
  });

  describe('reportFiltersSchema', () => {
    it('should validate empty filters', () => {
      const result = reportFiltersSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it('should validate bounds filter', () => {
      const result = reportFiltersSchema.safeParse({
        bounds: '50.0,19.0,52.0,21.0',
      });
      expect(result.success).toBe(true);
    });

    it('should validate type filter as string', () => {
      const result = reportFiltersSchema.safeParse({
        type: 'brown_water',
      });
      expect(result.success).toBe(true);
    });

    it('should validate type filter as array', () => {
      const result = reportFiltersSchema.safeParse({
        type: ['brown_water', 'bad_smell'],
      });
      expect(result.success).toBe(true);
    });

    it('should validate date filters', () => {
      const result = reportFiltersSchema.safeParse({
        startDate: '2024-01-01T00:00:00.000Z',
        endDate: '2024-12-31T23:59:59.000Z',
      });
      expect(result.success).toBe(true);
    });

    it('should validate city filter', () => {
      const result = reportFiltersSchema.safeParse({
        city: 'Warszawa',
      });
      expect(result.success).toBe(true);
    });

    it('should validate limit filter', () => {
      const result = reportFiltersSchema.safeParse({
        limit: '100',
      });
      expect(result.success).toBe(true);
    });
  });

  describe('statsQuerySchema', () => {
    it('should validate valid periods', () => {
      const periods = ['week', 'month', 'year', 'all'];
      periods.forEach(period => {
        const result = statsQuerySchema.safeParse({ period });
        expect(result.success).toBe(true);
      });
    });

    it('should default to month when period not provided', () => {
      const result = statsQuerySchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.period).toBe('month');
      }
    });

    it('should reject invalid period', () => {
      const result = statsQuerySchema.safeParse({ period: 'invalid' });
      expect(result.success).toBe(false);
    });
  });

  describe('geocodeSearchSchema', () => {
    it('should validate valid query', () => {
      const result = geocodeSearchSchema.safeParse({ q: 'Warszawa' });
      expect(result.success).toBe(true);
    });

    it('should reject query shorter than 2 characters', () => {
      const result = geocodeSearchSchema.safeParse({ q: 'a' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('at least 2 characters');
      }
    });

    it('should reject missing query', () => {
      const result = geocodeSearchSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });

  describe('reportTypesEnum', () => {
    it('should contain all expected types', () => {
      expect(reportTypesEnum).toContain('brown_water');
      expect(reportTypesEnum).toContain('bad_smell');
      expect(reportTypesEnum).toContain('sediment');
      expect(reportTypesEnum).toContain('pressure');
      expect(reportTypesEnum).toContain('no_water');
      expect(reportTypesEnum).toContain('other');
    });

    it('should have exactly 6 types', () => {
      expect(reportTypesEnum.length).toBe(6);
    });
  });
});
