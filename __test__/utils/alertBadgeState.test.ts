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

import {
  getAlertBadgeCount,
  setAlertBadgeCount,
  getAlertBadgeError,
  setAlertBadgeError,
  getAlertSeverityCounts,
  setAlertSeverityCounts,
  AlertBadgeError,
} from '@/utils/alertBadgeState';

describe('alertBadgeState', () => {
  const SHARED_STATE_KEY = '__mfAlertBadgeState__';

  beforeEach(() => {
    // Reset the shared state before each test
    if (window.top) {
      delete (window.top as any)[SHARED_STATE_KEY];
    }
  });

  describe('Alert Badge Count', () => {
    test('should get default count as 0', () => {
      const count = getAlertBadgeCount();
      expect(count).toBe(0);
    });

    test('should set and get alert badge count', () => {
      setAlertBadgeCount(5);
      const count = getAlertBadgeCount();
      expect(count).toBe(5);
    });

    test('should update alert badge count', () => {
      setAlertBadgeCount(3);
      expect(getAlertBadgeCount()).toBe(3);

      setAlertBadgeCount(7);
      expect(getAlertBadgeCount()).toBe(7);
    });
  });

  describe('Alert Badge Error', () => {
    test('should get undefined error by default', () => {
      const error = getAlertBadgeError();
      expect(error).toBeUndefined();
    });

    test('should set and get alert badge error', () => {
      const mockError: AlertBadgeError = {
        name: 'NetworkError',
        message: 'Failed to fetch alerts',
      };

      setAlertBadgeError(mockError);
      const error = getAlertBadgeError();

      expect(error).toEqual(mockError);
    });

    test('should clear alert badge error', () => {
      const mockError: AlertBadgeError = {
        name: 'AuthError',
        message: 'Authentication failed',
      };

      setAlertBadgeError(mockError);
      expect(getAlertBadgeError()).toEqual(mockError);

      setAlertBadgeError(undefined);
      expect(getAlertBadgeError()).toBeUndefined();
    });
  });

  describe('Alert Severity Counts', () => {
    test('should get undefined severity counts by default', () => {
      const counts = getAlertSeverityCounts();
      expect(counts).toBeUndefined();
    });

    test('should set and get alert severity counts', () => {
      const mockCounts = {
        critical: 5,
        warning: 3,
        major: 1,
      };

      setAlertSeverityCounts(mockCounts);
      const counts = getAlertSeverityCounts();

      expect(counts).toEqual(mockCounts);
    });

    test('should clear alert severity counts', () => {
      const mockCounts = {
        critical: 5,
        warning: 3,
      };

      setAlertSeverityCounts(mockCounts);
      expect(getAlertSeverityCounts()).toEqual(mockCounts);

      setAlertSeverityCounts(undefined);
      expect(getAlertSeverityCounts()).toBeUndefined();
    });

    test('should update alert severity counts', () => {
      const mockCounts1 = {
        critical: 5,
        warning: 3,
      };

      setAlertSeverityCounts(mockCounts1);
      expect(getAlertSeverityCounts()).toEqual(mockCounts1);

      const mockCounts2 = {
        critical: 7,
        warning: 1,
        major: 2,
      };

      setAlertSeverityCounts(mockCounts2);
      expect(getAlertSeverityCounts()).toEqual(mockCounts2);
    });
  });

  describe('SSR and Cross-Origin Handling', () => {
    test('should handle SSR scenario when window is undefined', () => {
      // Save original window
      const originalWindow = global.window;

      // Mock window as undefined (SSR scenario)
      delete (global as any).window;

      // Force module reload to trigger SSR path
      jest.resetModules();
      const alertBadgeStateSSR = require('@/utils/alertBadgeState');

      expect(() => {
        alertBadgeStateSSR.getAlertBadgeCount();
        alertBadgeStateSSR.getAlertBadgeError();
        alertBadgeStateSSR.getAlertSeverityCounts();
      }).not.toThrow();

      // Verify it returns default values
      expect(alertBadgeStateSSR.getAlertBadgeCount()).toBe(0);
      expect(alertBadgeStateSSR.getAlertBadgeError()).toBeUndefined();
      expect(alertBadgeStateSSR.getAlertSeverityCounts()).toBeUndefined();

      // Restore window
      (global as any).window = originalWindow;
    });

    test('should handle null window.top gracefully', () => {
      // Save original top
      const originalTop = window.top;

      // Mock window.top as null
      Object.defineProperty(window, 'top', {
        value: null,
        configurable: true,
      });

      expect(() => {
        setAlertBadgeCount(5);
        const count = getAlertBadgeCount();
        expect(count).toBe(5);
      }).not.toThrow();

      // Restore original window.top
      Object.defineProperty(window, 'top', {
        value: originalTop,
        configurable: true,
      });
    });

    test('should handle cross-origin scenarios gracefully', () => {
      // Mock window.top to throw (simulating cross-origin restriction)
      const originalTop = window.top;
      Object.defineProperty(window, 'top', {
        get: () => {
          throw new Error('Cross-origin access denied');
        },
        configurable: true,
      });

      expect(() => {
        setAlertBadgeCount(5);
        getAlertBadgeCount();
      }).not.toThrow();

      // Restore original window.top
      Object.defineProperty(window, 'top', {
        value: originalTop,
        configurable: true,
      });
    });
  });

  describe('Shared State Isolation', () => {
    test('should share state across multiple accesses', () => {
      setAlertBadgeCount(10);
      setAlertBadgeError({ name: 'TestError', message: 'Test message' });
      setAlertSeverityCounts({ critical: 5, warning: 3 });

      expect(getAlertBadgeCount()).toBe(10);
      expect(getAlertBadgeError()).toEqual({ name: 'TestError', message: 'Test message' });
      expect(getAlertSeverityCounts()).toEqual({ critical: 5, warning: 3 });
    });
  });
});
