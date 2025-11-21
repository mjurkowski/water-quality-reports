import { logger } from '@/utils/logger';

describe('Logger', () => {
  let consoleSpy: {
    log: jest.SpyInstance;
    error: jest.SpyInstance;
    warn: jest.SpyInstance;
    debug: jest.SpyInstance;
  };

  beforeEach(() => {
    consoleSpy = {
      log: jest.spyOn(console, 'log').mockImplementation(),
      error: jest.spyOn(console, 'error').mockImplementation(),
      warn: jest.spyOn(console, 'warn').mockImplementation(),
      debug: jest.spyOn(console, 'debug').mockImplementation(),
    };
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('info', () => {
    it('should log info messages with [INFO] prefix', () => {
      logger.info('Test message');
      expect(consoleSpy.log).toHaveBeenCalledWith('[INFO] Test message');
    });

    it('should log info messages with additional arguments', () => {
      logger.info('Test message', { key: 'value' }, 123);
      expect(consoleSpy.log).toHaveBeenCalledWith('[INFO] Test message', { key: 'value' }, 123);
    });
  });

  describe('error', () => {
    it('should log error messages with [ERROR] prefix', () => {
      logger.error('Error message');
      expect(consoleSpy.error).toHaveBeenCalledWith('[ERROR] Error message');
    });

    it('should log error messages with error objects', () => {
      const error = new Error('Test error');
      logger.error('Error occurred', error);
      expect(consoleSpy.error).toHaveBeenCalledWith('[ERROR] Error occurred', error);
    });
  });

  describe('warn', () => {
    it('should log warning messages with [WARN] prefix', () => {
      logger.warn('Warning message');
      expect(consoleSpy.warn).toHaveBeenCalledWith('[WARN] Warning message');
    });
  });

  describe('debug', () => {
    it('should log debug messages in development environment', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      logger.debug('Debug message');
      expect(consoleSpy.debug).toHaveBeenCalledWith('[DEBUG] Debug message');

      process.env.NODE_ENV = originalEnv;
    });

    it('should not log debug messages in production environment', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      logger.debug('Debug message');
      expect(consoleSpy.debug).not.toHaveBeenCalled();

      process.env.NODE_ENV = originalEnv;
    });
  });
});
