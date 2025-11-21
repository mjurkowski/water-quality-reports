import { prisma } from '@/db/client';

type Period = 'week' | 'month' | 'year' | 'all';

export const statsService = {
  async getStats(period: Period = 'month') {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      case 'all':
      default:
        startDate = new Date(0); // From beginning
        break;
    }

    // Total reports
    const totalReports = await prisma.report.count({
      where: {
        status: 'active',
        reportedAt: { gte: startDate },
      },
    });

    // Reports by type
    const allReports = await prisma.report.findMany({
      where: {
        status: 'active',
        reportedAt: { gte: startDate },
      },
      select: {
        types: true,
      },
    });

    // Count by type (flatten array and count)
    const typeCount: Record<string, number> = {};
    allReports.forEach((report: { types: string[] }) => {
      report.types.forEach((type: string) => {
        typeCount[type] = (typeCount[type] || 0) + 1;
      });
    });

    // Reports by city (top 10)
    const cityStats = await prisma.report.groupBy({
      by: ['city'],
      where: {
        status: 'active',
        reportedAt: { gte: startDate },
        city: { not: null },
      },
      _count: true,
      orderBy: {
        _count: {
          city: 'desc',
        },
      },
      take: 10,
    });

    // Reports by voivodeship
    const voivodeshipStats = await prisma.report.groupBy({
      by: ['voivodeship'],
      where: {
        status: 'active',
        reportedAt: { gte: startDate },
        voivodeship: { not: null },
      },
      _count: true,
      orderBy: {
        _count: {
          voivodeship: 'desc',
        },
      },
    });

    // Recent reports count (last 24h)
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const recentReports = await prisma.report.count({
      where: {
        status: 'active',
        createdAt: { gte: last24h },
      },
    });

    return {
      period,
      total: totalReports,
      recentCount: recentReports,
      byType: typeCount,
      byCity: cityStats.map((s: { city: string | null; _count: number }) => ({
        city: s.city,
        count: s._count,
      })),
      byVoivodeship: voivodeshipStats.map((s: { voivodeship: string | null; _count: number }) => ({
        voivodeship: s.voivodeship,
        count: s._count,
      })),
    };
  },
};
