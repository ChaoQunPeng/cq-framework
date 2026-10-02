import { message } from 'antd';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { errorConfig } from './requestErrorConfig';

vi.mock('antd', () => ({
  message: {
    warning: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('@umijs/max', () => ({
  getIntl: vi.fn(() => ({
    formatMessage: vi.fn(({ defaultMessage }) => defaultMessage),
  })),
}));

describe('requestErrorConfig', () => {
  // biome-ignore lint/style/noNonNullAssertion: config handlers are always defined
  const errorThrower = errorConfig.errorConfig!.errorThrower!;
  // biome-ignore lint/style/noNonNullAssertion: config handlers are always defined
  const errorHandler = errorConfig.errorConfig!.errorHandler!;

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('errorThrower', () => {
    it('should throw error when code is not success code', () => {
      const response = {
        code: 400,
        msg: 'Bad Request',
        data: {},
      };

      expect(() => {
        errorThrower(response);
      }).toThrow('Bad Request');
    });

    it('should not throw error when code is success code', () => {
      const response = {
        code: 1,
        msg: '',
        data: { id: 1 },
      };

      expect(() => {
        errorThrower(response);
      }).not.toThrow();
    });

    it('should throw BizError with correct info', () => {
      const response = {
        code: 403,
        msg: 'Forbidden',
        data: { detail: 'more info' },
      };

      expect.assertions(4);
      try {
        errorThrower(response);
      } catch (error: any) {
        expect(error.name).toBe('BizError');
        expect(error.info.code).toBe(403);
        expect(error.info.msg).toBe('Forbidden');
        expect(error.info.data).toEqual({ detail: 'more info' });
      }
    });
  });

  describe('errorHandler', () => {
    it('should rethrow error when skipErrorHandler is true', () => {
      const error = new Error('Test error');
      const opts = { skipErrorHandler: true };

      expect(() => {
        errorHandler(error, opts);
      }).toThrow('Test error');
    });

    it('should show msg from a business error', () => {
      const error: any = new Error('Business error');
      error.name = 'BizError';
      error.info = {
        code: 1003,
        msg: 'Business error',
        data: {},
      };

      errorHandler(error, {});

      expect(message.error).toHaveBeenCalledWith('Business error');
    });

    it('should handle axios response error', () => {
      const error: any = new Error('Axios error');
      error.response = {
        status: 500,
        data: {
          code: 500,
          msg: 'Server error',
          data: {},
        },
      };

      errorHandler(error, {});

      expect(message.error).toHaveBeenCalledWith('500 Server error');
    });

    it('should handle offline error', () => {
      const error: any = new Error('Network error');
      error.request = {};

      const originalOnLine = navigator.onLine;
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false,
      });

      try {
        errorHandler(error, {});

        expect(message.error).toHaveBeenCalledWith(
          'Network unavailable. Please check your connection and try again.',
        );
      } finally {
        Object.defineProperty(navigator, 'onLine', {
          writable: true,
          value: originalOnLine,
        });
      }
    });

    it('should handle request error with no response', () => {
      const error: any = new Error('Request error');
      error.request = {};

      errorHandler(error, {});

      expect(message.error).toHaveBeenCalledWith(
        'None response! Please retry.',
      );
    });

    it('should handle generic error', () => {
      const error: any = new Error('Generic error');

      errorHandler(error, {});

      expect(message.error).toHaveBeenCalledWith(
        'Request error, please retry.',
      );
    });
  });

  describe('requestInterceptors', () => {
    // The interceptor is registered as a plain function (not a tuple),
    // so narrow the union type to a callable for the test.
    const interceptor = errorConfig.requestInterceptors?.[0] as (config: {
      url?: string;
      method?: string;
      headers?: Record<string, string>;
    }) => { url?: string; headers?: Record<string, string> };

    it('should attach the current session token to API requests', () => {
      localStorage.setItem('cq_framework_access_token', 'test-token');
      const config = {
        url: 'https://api.example.com/users',
        method: 'GET',
      };

      const result = interceptor(config);

      expect(result.url).toBe('https://api.example.com/users');
      expect(result.headers?.Authorization).toBe('Bearer test-token');
    });

    it('should handle URL without config', () => {
      const config = {};

      const result = interceptor(config);

      expect(result.url).toBeUndefined();
    });
  });
});
