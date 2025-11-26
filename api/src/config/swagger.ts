import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Cola z Kranu API',
      version: '1.0.0',
      description: 'API dla platformy zgłaszania problemów z jakością wody w Polsce',
      contact: {
        name: 'API Support',
        email: 'support@colazkreanu.pl',
      },
    },
    servers: [
      {
        url: 'http://localhost:3001/api',
        description: 'Development server',
      },
      {
        url: 'https://api.colazkreanu.pl/api',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT token from /admin/auth/login',
        },
      },
      schemas: {
        Report: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            uuid: { type: 'string', format: 'uuid' },
            types: {
              type: 'array',
              items: {
                type: 'string',
                enum: ['brown_water', 'bad_smell', 'sediment', 'pressure', 'no_water', 'other'],
              },
              minItems: 1,
              maxItems: 3,
            },
            description: { type: 'string', nullable: true },
            latitude: { type: 'number', minimum: -90, maximum: 90 },
            longitude: { type: 'number', minimum: -180, maximum: 180 },
            address: { type: 'string', nullable: true },
            city: { type: 'string', nullable: true },
            voivodeship: { type: 'string', nullable: true },
            reportedAt: { type: 'string', format: 'date-time' },
            createdAt: { type: 'string', format: 'date-time' },
            status: { type: 'string', enum: ['active', 'deleted', 'spam'] },
            photos: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'integer' },
                  url: { type: 'string' },
                  mimeType: { type: 'string' },
                  size: { type: 'integer' },
                },
              },
            },
          },
        },
        CreateReportRequest: {
          type: 'object',
          required: ['types', 'latitude', 'longitude', 'reportedAt'],
          properties: {
            types: {
              type: 'array',
              items: {
                type: 'string',
                enum: ['brown_water', 'bad_smell', 'sediment', 'pressure', 'no_water', 'other'],
              },
              minItems: 1,
              maxItems: 3,
            },
            description: { type: 'string', maxLength: 2000 },
            latitude: { type: 'number', minimum: -90, maximum: 90 },
            longitude: { type: 'number', minimum: -180, maximum: 180 },
            address: { type: 'string' },
            city: { type: 'string' },
            voivodeship: { type: 'string' },
            reportedAt: { type: 'string', format: 'date-time' },
            contactEmail: { type: 'string', format: 'email' },
            photos: {
              type: 'array',
              items: { type: 'string' },
              maxItems: 5,
            },
          },
        },
        CreateReportResponse: {
          type: 'object',
          properties: {
            uuid: { type: 'string', format: 'uuid' },
            deleteToken: { type: 'string', format: 'uuid' },
            message: { type: 'string' },
          },
        },
        ReportsListResponse: {
          type: 'object',
          properties: {
            reports: {
              type: 'array',
              items: { $ref: '#/components/schemas/Report' },
            },
            total: { type: 'integer' },
          },
        },
        Stats: {
          type: 'object',
          properties: {
            period: { type: 'string', enum: ['week', 'month', 'year', 'all'] },
            total: { type: 'integer' },
            recentCount: { type: 'integer' },
            byType: {
              type: 'object',
              additionalProperties: { type: 'integer' },
            },
            byCity: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  city: { type: 'string' },
                  count: { type: 'integer' },
                },
              },
            },
            byVoivodeship: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  voivodeship: { type: 'string' },
                  count: { type: 'integer' },
                },
              },
            },
          },
        },
        GeocodeResult: {
          type: 'object',
          properties: {
            lat: { type: 'number' },
            lon: { type: 'number' },
            display_name: { type: 'string' },
          },
        },
        GeocodeResponse: {
          type: 'object',
          properties: {
            results: {
              type: 'array',
              items: { $ref: '#/components/schemas/GeocodeResult' },
            },
          },
        },
        HealthResponse: {
          type: 'object',
          properties: {
            status: { type: 'string', enum: ['healthy', 'unhealthy'] },
            timestamp: { type: 'string', format: 'date-time' },
            database: { type: 'string', enum: ['connected', 'disconnected'] },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            message: { type: 'string' },
            details: { type: 'array', items: { type: 'object' } },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
