import { prisma } from '@/db/client';
import { savePhoto } from '@/utils/photo';
import { geocodeService } from './geocodeService';
import { randomUUID } from 'crypto';

interface ReportFilters {
  bounds?: string;
  type?: string | string[];
  startDate?: string;
  endDate?: string;
  city?: string;
  limit?: string;
}

interface CreateReportData {
  types: string[];
  description?: string;
  latitude: number;
  longitude: number;
  address?: string;
  photos?: Array<{
    base64: string;
    mimeType: string;
  }>;
  contactEmail?: string;
  reportedAt: string;
  ipAddress?: string;
  userAgent?: string;
}

export const reportService = {
  async getAll(filters: ReportFilters) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {
      status: 'active',
    };

    // Parse bounds (minLat,minLng,maxLat,maxLng)
    if (filters.bounds) {
      const [minLat, minLng, maxLat, maxLng] = filters.bounds.split(',').map(Number);
      where.AND = [
        { latitude: { gte: minLat, lte: maxLat } },
        { longitude: { gte: minLng, lte: maxLng } },
      ];
    }

    // Filter by types (array overlap)
    if (filters.type) {
      const types = Array.isArray(filters.type) ? filters.type : [filters.type];
      where.types = { hasSome: types };
    }

    // Filter by date range
    if (filters.startDate || filters.endDate) {
      where.reportedAt = {};
      if (filters.startDate) {
        where.reportedAt.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        where.reportedAt.lte = new Date(filters.endDate);
      }
    }

    // Filter by city
    if (filters.city) {
      where.city = filters.city;
    }

    const limit = filters.limit ? Math.min(parseInt(filters.limit, 10), 1000) : 1000;

    const reports = await prisma.report.findMany({
      where,
      orderBy: { reportedAt: 'desc' },
      take: limit,
      select: {
        uuid: true,
        types: true,
        description: true,
        latitude: true,
        longitude: true,
        address: true,
        city: true,
        voivodeship: true,
        reportedAt: true,
        createdAt: true,
        photos: {
          select: {
            id: true,
            url: true,
            filename: true,
            mimeType: true,
          },
        },
      },
    });

    return {
      reports,
      total: reports.length,
    };
  },

  async getById(uuid: string) {
    return await prisma.report.findUnique({
      where: { uuid, status: 'active' },
      select: {
        uuid: true,
        types: true,
        description: true,
        latitude: true,
        longitude: true,
        address: true,
        city: true,
        voivodeship: true,
        postalCode: true,
        reportedAt: true,
        createdAt: true,
        photos: {
          select: {
            id: true,
            url: true,
            filename: true,
            size: true,
            mimeType: true,
            createdAt: true,
          },
        },
      },
    });
  },

  async create(data: CreateReportData) {
    // Validate max 5 photos
    if (data.photos && data.photos.length > 5) {
      throw new Error('Maximum 5 photos allowed');
    }

    // Save photos if provided
    const photoRecords = [];
    if (data.photos && data.photos.length > 0) {
      for (const photo of data.photos) {
        const savedPhoto = await savePhoto(photo.base64, photo.mimeType);
        photoRecords.push({
          url: savedPhoto.url,
          filename: savedPhoto.filename,
          size: savedPhoto.size,
          mimeType: photo.mimeType,
        });
      }
    }

    // Reverse geocode if no address
    let address = data.address;
    let city: string | undefined;
    let voivodeship: string | undefined;
    let postalCode: string | undefined;

    if (!address) {
      const geocodeResult = await geocodeService.reverse(data.latitude, data.longitude);
      address = geocodeResult.address;
      city = geocodeResult.city;
      voivodeship = geocodeResult.voivodeship;
      postalCode = geocodeResult.postalCode;
    }

    // Generate delete token
    const deleteToken = randomUUID();

    const report = await prisma.report.create({
      data: {
        types: data.types,
        description: data.description,
        latitude: data.latitude,
        longitude: data.longitude,
        address,
        city,
        voivodeship,
        postalCode,
        contactEmail: data.contactEmail,
        reportedAt: new Date(data.reportedAt),
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        deleteToken,
        photos: {
          create: photoRecords,
        },
      },
      include: {
        photos: true,
      },
    });

    return {
      uuid: report.uuid,
      deleteToken,
      message: 'Report created successfully',
    };
  },

  async delete(uuid: string, deleteToken: string) {
    const report = await prisma.report.findUnique({
      where: { uuid },
    });

    if (!report) {
      throw new Error('Report not found');
    }

    if (report.deleteToken !== deleteToken) {
      throw new Error('Invalid delete token');
    }

    // Check 24 hour window
    const hoursSinceCreation = (Date.now() - report.createdAt.getTime()) / (1000 * 60 * 60);
    if (hoursSinceCreation > 24) {
      throw new Error('Delete period expired (24 hours)');
    }

    // Soft delete
    await prisma.report.update({
      where: { uuid },
      data: { status: 'deleted' },
    });
  },
};
