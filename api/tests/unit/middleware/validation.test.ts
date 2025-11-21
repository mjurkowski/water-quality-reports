import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { validateRequest } from '@/middleware/validation';

describe('Validation Middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });
    mockReq = {
      body: {},
      query: {},
      params: {},
    };
    mockRes = {
      status: statusMock,
      json: jsonMock,
    };
    mockNext = jest.fn();
  });

  const testSchema = z.object({
    name: z.string().min(1),
    age: z.number().min(0),
  });

  describe('body validation', () => {
    it('should call next() when body is valid', () => {
      mockReq.body = { name: 'John', age: 25 };

      const middleware = validateRequest(testSchema, 'body');
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(statusMock).not.toHaveBeenCalled();
    });

    it('should return 400 when body is invalid', () => {
      mockReq.body = { name: '', age: -1 };

      const middleware = validateRequest(testSchema, 'body');
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Validation error',
          details: expect.any(Array),
        })
      );
    });

    it('should return validation error details', () => {
      mockReq.body = { age: 'not a number' };

      const middleware = validateRequest(testSchema, 'body');
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          details: expect.arrayContaining([
            expect.objectContaining({
              path: expect.any(String),
              message: expect.any(String),
            }),
          ]),
        })
      );
    });
  });

  describe('query validation', () => {
    const querySchema = z.object({
      page: z.string().optional(),
      limit: z.string().optional(),
    });

    it('should validate query parameters', () => {
      mockReq.query = { page: '1', limit: '10' };

      const middleware = validateRequest(querySchema, 'query');
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('params validation', () => {
    const paramsSchema = z.object({
      id: z.string().uuid(),
    });

    it('should validate route parameters', () => {
      mockReq.params = { id: '550e8400-e29b-41d4-a716-446655440000' };

      const middleware = validateRequest(paramsSchema, 'params');
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should reject invalid UUID', () => {
      mockReq.params = { id: 'not-a-uuid' };

      const middleware = validateRequest(paramsSchema, 'params');
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(statusMock).toHaveBeenCalledWith(400);
    });
  });

  describe('default source', () => {
    it('should default to body validation', () => {
      mockReq.body = { name: 'John', age: 25 };

      const middleware = validateRequest(testSchema);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });
  });
});
