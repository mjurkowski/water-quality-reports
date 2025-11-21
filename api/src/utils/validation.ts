import { z } from 'zod';

// Report types enum
export const reportTypesEnum = [
  'brown_water',
  'bad_smell',
  'sediment',
  'pressure',
  'no_water',
  'other'
] as const;

// Create report schema
export const createReportSchema = z.object({
  types: z.array(z.enum(reportTypesEnum)).min(1, 'At least one type is required').max(3, 'Maximum 3 types allowed'),
  description: z.string().max(2000).optional(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  address: z.string().max(500).optional(),
  photos: z.array(z.object({
    base64: z.string(),
    mimeType: z.string()
  })).max(5, 'Maximum 5 photos allowed').optional(),
  contactEmail: z.string().email().optional(),
  reportedAt: z.string().datetime()
});

// Report filters schema (query parameters)
export const reportFiltersSchema = z.object({
  bounds: z.string().optional(),
  type: z.union([z.string(), z.array(z.string())]).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  city: z.string().optional(),
  limit: z.string().optional()
});

// Delete report schema
export const deleteReportSchema = z.object({
  uuid: z.string().uuid(),
  deleteToken: z.string().uuid()
});

// Stats period schema
export const statsQuerySchema = z.object({
  period: z.enum(['week', 'month', 'year', 'all']).optional().default('month')
});

// Geocode search schema
export const geocodeSearchSchema = z.object({
  q: z.string().min(2, 'Query must be at least 2 characters')
});
