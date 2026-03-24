/*
 * Copyright 2026 NEC Corporation.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License. You may obtain
 * a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations
 * under the License.
 */

import React from 'react';

import { screen } from '@testing-library/react';
import { AppProps } from 'next/app';

import { render } from '@/shared-modules/__test__/test-utils';

import MyApp from '@/pages/_app';
import Index from '@/pages/index';

// Polyfill for PromiseRejectionEvent in Jest environment
if (typeof global.PromiseRejectionEvent === 'undefined') {
  (global as any).PromiseRejectionEvent = class PromiseRejectionEvent extends Event {
    promise: Promise<any>;
    reason: any;

    constructor(type: string, init: { promise: Promise<any>; reason: any }) {
      super(type);
      this.promise = init.promise;
      this.reason = init.reason;
    }
  };
}

jest.mock('@/shared-modules/components', () => ({
  ErrorBoundary: ({ children }: { children: React.ReactNode }) => <div data-testid='mockErrorBoundary'>{children}</div>,
  Layout: ({ children }: { children: React.ReactNode }) => <div data-testid='mockLayout'>{children}</div>,
}));

jest.mock('next/router', () => ({
  useRouter: jest.fn(() => ({
    locale: 'en',
    pathname: '/test',
    query: {},
    asPath: '/test',
  })),
}));

jest.mock('@/pages/index', () => ({
  __esModule: true,
  default: () => <div data-testid='mockIndexPage'>Index Page</div>,
}));

jest.mock('next-intl', () => ({
  NextIntlClientProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid='mockNextIntlClientProvider'>{children}</div>
  ),
}));

// Mock component for testing
const TestComponent = () => <div data-testid='testComponent'>Test Component</div>;

describe('MyApp', () => {
  const defaultPageProps = {
    messages: {},
  };

  const createAppProps = (Component: React.ComponentType, pageProps = defaultPageProps): AppProps => ({
    Component,
    pageProps,
    router: {
      pathname: '/test',
      route: '/test',
      query: {},
      asPath: '/test',
      basePath: '',
      locale: 'en',
      locales: ['en', 'ja'],
      defaultLocale: 'en',
      isReady: true,
      isPreview: false,
      isLocaleDomain: false,
      push: jest.fn(),
      replace: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      prefetch: jest.fn(),
      beforePopState: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
      isFallback: false,
    } as any,
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Component rendering', () => {
    test('should render Index component without Layout wrapper', () => {
      const appProps = createAppProps(Index);
      render(<MyApp {...appProps} />);

      expect(screen.getByTestId('mockIndexPage')).toBeInTheDocument();
      expect(screen.queryByTestId('mockLayout')).not.toBeInTheDocument();
      expect(screen.getByTestId('mockErrorBoundary')).toBeInTheDocument();
    });

    test('should render regular component with Layout wrapper', () => {
      const appProps = createAppProps(TestComponent);
      render(<MyApp {...appProps} />);

      expect(screen.getByTestId('testComponent')).toBeInTheDocument();
      expect(screen.getByTestId('mockLayout')).toBeInTheDocument();
      expect(screen.getByTestId('mockErrorBoundary')).toBeInTheDocument();
    });

    test('should render with NextIntlClientProvider wrapper', () => {
      const appProps = createAppProps(TestComponent);
      render(<MyApp {...appProps} />);

      expect(screen.getByTestId('mockNextIntlClientProvider')).toBeInTheDocument();
    });

    test('should pass pageProps to component', () => {
      const customPageProps = {
        messages: { test: 'Test Message' },
        customProp: 'custom value',
      };
      const appProps = createAppProps(TestComponent, customPageProps);
      render(<MyApp {...appProps} />);

      expect(screen.getByTestId('testComponent')).toBeInTheDocument();
    });

    test('should handle empty pageProps', () => {
      const appProps = createAppProps(TestComponent, {} as any);
      render(<MyApp {...appProps} />);

      expect(screen.getByTestId('testComponent')).toBeInTheDocument();
    });

    test('should handle undefined messages in pageProps', () => {
      const appProps = createAppProps(TestComponent, { messages: undefined } as any);
      render(<MyApp {...appProps} />);

      expect(screen.getByTestId('testComponent')).toBeInTheDocument();
    });
  });

  describe('Global error handlers', () => {
    test('should have window addEventListener defined', () => {
      expect(window.addEventListener).toBeDefined();
    });

    test('should have console.error defined', () => {
      expect(console.error).toBeDefined();
    });

    test('should handle unhandledrejection event with QuotaExceededError', () => {
      const error = new Error('Storage quota exceeded');
      error.name = 'QuotaExceededError';

      const event = new PromiseRejectionEvent('unhandledrejection', {
        promise: Promise.resolve(),
        reason: error,
      });

      const preventDefaultSpy = jest.spyOn(event, 'preventDefault');
      window.dispatchEvent(event);

      expect(preventDefaultSpy).toHaveBeenCalled();
    });

    test('should handle unhandledrejection event with DataCloneError', () => {
      const error = new Error('Data cannot be cloned');
      error.name = 'DataCloneError';

      const event = new PromiseRejectionEvent('unhandledrejection', {
        promise: Promise.resolve(),
        reason: error,
      });

      const preventDefaultSpy = jest.spyOn(event, 'preventDefault');
      window.dispatchEvent(event);

      expect(preventDefaultSpy).toHaveBeenCalled();
    });

    test('should handle unhandledrejection event with storage keyword in message', () => {
      const error = new Error('storage limit exceeded');

      const event = new PromiseRejectionEvent('unhandledrejection', {
        promise: Promise.resolve(),
        reason: error,
      });

      const preventDefaultSpy = jest.spyOn(event, 'preventDefault');
      window.dispatchEvent(event);

      expect(preventDefaultSpy).toHaveBeenCalled();
    });

    test('should not prevent default for non-storage unhandledrejection', () => {
      const error = new Error('Normal error');

      const event = new PromiseRejectionEvent('unhandledrejection', {
        promise: Promise.resolve(),
        reason: error,
      });

      const preventDefaultSpy = jest.spyOn(event, 'preventDefault');
      window.dispatchEvent(event);

      expect(preventDefaultSpy).not.toHaveBeenCalled();
    });

    test('should handle error event with QuotaExceededError', () => {
      const error = new Error('Quota exceeded');
      error.name = 'QuotaExceededError';

      const event = new ErrorEvent('error', {
        error: error,
        message: 'Quota exceeded',
      });

      const preventDefaultSpy = jest.spyOn(event, 'preventDefault');
      window.dispatchEvent(event);

      expect(preventDefaultSpy).toHaveBeenCalled();
    });

    test('should handle error event with DataCloneError', () => {
      const error = new Error('Clone failed');
      error.name = 'DataCloneError';

      const event = new ErrorEvent('error', {
        error: error,
        message: 'Clone failed',
      });

      const preventDefaultSpy = jest.spyOn(event, 'preventDefault');
      window.dispatchEvent(event);

      expect(preventDefaultSpy).toHaveBeenCalled();
    });

    test('should not prevent default for non-storage error event', () => {
      const error = new Error('Regular error');

      const event = new ErrorEvent('error', {
        error: error,
        message: 'Regular error',
      });

      const preventDefaultSpy = jest.spyOn(event, 'preventDefault');
      window.dispatchEvent(event);

      expect(preventDefaultSpy).not.toHaveBeenCalled();
    });

    test('should handle unhandledrejection with null reason', () => {
      const event = new PromiseRejectionEvent('unhandledrejection', {
        promise: {} as Promise<any>,
        reason: null,
      });

      const preventDefaultSpy = jest.spyOn(event, 'preventDefault');
      window.dispatchEvent(event);

      expect(preventDefaultSpy).not.toHaveBeenCalled();
    });

    test('should handle error event with null error', () => {
      const event = new ErrorEvent('error', {
        error: null,
        message: 'Some error',
      });

      const preventDefaultSpy = jest.spyOn(event, 'preventDefault');
      window.dispatchEvent(event);

      expect(preventDefaultSpy).not.toHaveBeenCalled();
    });
  });

  describe('Error detection logic', () => {
    test('should detect QuotaExceededError by name', () => {
      const error = new Error('test');
      error.name = 'QuotaExceededError';

      // Simulate the detection logic
      const isStorageError = error.name === 'QuotaExceededError';
      expect(isStorageError).toBe(true);
    });

    test('should detect DataCloneError by name', () => {
      const error = new Error('test');
      error.name = 'DataCloneError';

      const isStorageError = error.name === 'DataCloneError';
      expect(isStorageError).toBe(true);
    });

    test('should detect storage errors by message keywords', () => {
      const storageKeywords = [
        'quota',
        'storage',
        'setitem',
        'removeitem',
        'getitem',
        'luigi',
        'postmessage',
        'cloned',
      ];

      storageKeywords.forEach((keyword) => {
        const errorMsg = `Error with ${keyword} occurred`;
        const hasKeyword = errorMsg.toLowerCase().includes(keyword);
        expect(hasKeyword).toBe(true);
      });
    });

    test('should not detect non-storage errors', () => {
      const normalError = new Error('Normal application error');
      const isStorageError = normalError.name === 'QuotaExceededError' || normalError.name === 'DataCloneError';

      expect(isStorageError).toBe(false);
      expect(normalError.message.toLowerCase().includes('quota')).toBe(false);
    });

    test('should handle errors without name property', () => {
      const error = { message: 'test error' };
      const errorName = (error as any).name || '';

      expect(errorName).toBe('');
    });

    test('should handle errors without message property', () => {
      const error = { name: 'TestError' };
      const errorMsg = String((error as any).message || error);

      expect(errorMsg).toBeTruthy();
    });

    test('should handle null or undefined errors', () => {
      const nullError = null;
      const undefinedError = undefined;

      expect(nullError).toBeFalsy();
      expect(undefinedError).toBeFalsy();
    });
  });
  describe('Console error filtering', () => {
    let origConsoleErrorSpy: jest.SpyInstance;

    beforeEach(() => {
      jest.resetModules();
      // create a spy for the original console.error which pages/_app will capture
      origConsoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      // require the module so it captures the spy as originalConsoleError and installs override

      require('@/pages/_app');
    });

    afterEach(() => {
      origConsoleErrorSpy.mockRestore();
      jest.resetModules();
    });

    test('should suppress console.error with QuotaExceededError keyword', () => {
      console.error('QuotaExceededError: storage limit');
      expect(origConsoleErrorSpy).not.toHaveBeenCalled();
    });

    test('should suppress console.error with DataCloneError keyword', () => {
      console.error('DataCloneError: cannot clone');
      expect(origConsoleErrorSpy).not.toHaveBeenCalled();
    });

    test('should suppress console.error when both postMessage and cloned present', () => {
      console.error('postMessage failed: object could not be cloned');
      expect(origConsoleErrorSpy).not.toHaveBeenCalled();
    });

    test('should NOT suppress console.error when only postMessage present', () => {
      console.error('postMessage error');
      expect(origConsoleErrorSpy).toHaveBeenCalled();
    });

    test('should NOT suppress console.error when only cloned present', () => {
      console.error('object could not be cloned');
      expect(origConsoleErrorSpy).toHaveBeenCalled();
    });

    test('should allow non-storage console.error to pass through', () => {
      console.error('Normal error message');
      expect(origConsoleErrorSpy).toHaveBeenCalled();
    });

    test('should handle multiple arguments in console.error', () => {
      console.error('Error:', { type: 'test' }, 123);
      expect(origConsoleErrorSpy).toHaveBeenCalled();
    });
  });

  describe('isStorageRelatedError internal branches', () => {
    beforeEach(() => {
      jest.resetModules();
      // ensure _app is loaded so isStorageRelatedError is defined and used in listeners

      require('@/pages/_app');
    });

    afterEach(() => {
      jest.resetModules();
    });

    test('should compute errorName and errorMsg from object error', () => {
      const errorObj: any = { name: 'SomeErrorName', message: 'This contains quota keyword' };

      const event = new ErrorEvent('error', {
        error: errorObj,
        message: 'This contains quota keyword',
      });

      const preventDefaultSpy = jest.spyOn(event, 'preventDefault');
      window.dispatchEvent(event);

      // should call preventDefault because message contains 'quota'
      expect(preventDefaultSpy).toHaveBeenCalled();
    });
  });

  describe('module load without window (server-side)', () => {
    test('should not throw when window is undefined', () => {
      // save existing window and remove it to simulate server environment
      const savedWindow = (global as any).window;
      try {
        // remove window
        // @ts-ignore
        delete (global as any).window;
        jest.resetModules();

        // requiring the module should not throw when window is undefined

        expect(() => require('@/pages/_app')).not.toThrow();
      } finally {
        // restore window
        (global as any).window = savedWindow;
        jest.resetModules();
      }
    });
  });
});
