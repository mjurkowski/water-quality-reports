import { statsService } from '@/services/statsService';
import { prisma } from '@/db/client';

// Mock Prisma client
jest.mock('@/db/client', () => ({
  prisma: {
    report: {
      count: jest.fn(),
      findMany: jest.fn(),
      groupBy: jest.fn(),
    },
  },
}));

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('StatsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getStats', () => {
    const mockReportsData = [
      { types: ['brown_water', 'bad_smell'] },
      { types: ['brown_water'] },
      { types: ['sediment'] },
    ];

    const mockCityStats = [
      { city: 'Warszawa', _count: 5 },
      { city: 'Kraków', _count: 3 },
    ];

    const mockVoivodeshipStats = [
      { voivodeship: 'mazowieckie', _count: 10 },
      { voivodeship: 'małopolskie', _count: 5 },
    ];

    beforeEach(() => {
      (mockPrisma.report.count as jest.Mock).mockResolvedValue(10);
      (mockPrisma.report.findMany as jest.Mock).mockResolvedValue(mockReportsData);
      (mockPrisma.report.groupBy as jest.Mock)
        .mockResolvedValueOnce(mockCityStats)
        .mockResolvedValueOnce(mockVoivodeshipStats);
    });

    it('should return stats with default period (month)', async () => {
      const result = await statsService.getStats();

      expect(result).toHaveProperty('period', 'month');
      expect(result).toHaveProperty('total', 10);
      expect(result).toHaveProperty('recentCount');
      expect(result).toHaveProperty('byType');
      expect(result).toHaveProperty('byCity');
      expect(result).toHaveProperty('byVoivodeship');
    });

    it('should calculate byType correctly', async () => {
      const result = await statsService.getStats('month');

      expect(result.byType).toEqual({
        brown_water: 2,
        bad_smell: 1,
        sediment: 1,
      });
    });

    it('should format byCity correctly', async () => {
      const result = await statsService.getStats('month');

      expect(result.byCity).toEqual([
        { city: 'Warszawa', count: 5 },
        { city: 'Kraków', count: 3 },
      ]);
    });

    it('should format byVoivodeship correctly', async () => {
      const result = await statsService.getStats('month');

      expect(result.byVoivodeship).toEqual([
        { voivodeship: 'mazowieckie', count: 10 },
        { voivodeship: 'małopolskie', count: 5 },
      ]);
    });

    it('should filter by week period', async () => {
      await statsService.getStats('week');

      expect(mockPrisma.report.count).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'active',
            reportedAt: expect.objectContaining({
              gte: expect.any(Date),
            }),
          }),
        })
      );
    });

    it('should filter by year period', async () => {
      await statsService.getStats('year');

      expect(mockPrisma.report.count).toHaveBeenCalled();
    });

    it('should include all data for "all" period', async () => {
      await statsService.getStats('all');

      expect(mockPrisma.report.count).toHaveBeenCalled();
    });
  });
});
