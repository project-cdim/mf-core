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

import jwt from 'jsonwebtoken';

import {
  setAlertaAuthCode,
  startAlertaAuth,
  isAlertaAuthenticated,
  invalidateAlertaToken,
  getJwtExpSeconds,
  calcExpiryMsFromToken,
  getToken,
  getAlertRefreshIntervalMs,
  __setAuthTestState,
  __getAuthTestState,
} from '@/utils/alert';

// Mock timeoutSignal
jest.mock('@/utils/timeoutSignal', () => ({
  timeoutSignal: jest.fn(() => undefined),
}));

// Mock fetch
global.fetch = jest.fn();

describe('alert authentication', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset auth state
    startAlertaAuth();
  });

  describe('setAlertaAuthCode', () => {
    test('sets auth code with valid code', () => {
      setAlertaAuthCode('valid-code-123');
      const state = __getAuthTestState();
      expect(state.authCode).toBe('valid-code-123');
    });

    test('ignores invalid codes (too short)', () => {
      setAlertaAuthCode('short');
      const state = __getAuthTestState();
      expect(state.authCode).toBeNull();
    });

    test('ignores empty code', () => {
      setAlertaAuthCode('');
      const state = __getAuthTestState();
      expect(state.authCode).toBeNull();
    });
  });

  describe('__setAuthTestState', () => {
    test('clears the token when passed null', () => {
      __setAuthTestState({ token: 'seeded-token', expiry: Date.now() + 10000 });
      __setAuthTestState({ token: null });

      expect(__getAuthTestState().authToken).toBeNull();
    });
  });

  describe('startAlertaAuth', () => {
    test('resets all auth state', () => {
      __setAuthTestState({ code: 'test-code', token: 'test-token', expiry: Date.now() + 10000 });

      startAlertaAuth();

      const state = __getAuthTestState();
      expect(state.authCode).toBeNull();
      expect(state.authToken).toBeNull();
      expect(state.tokenExpiry).toBe(0);
    });
  });

  describe('isAlertaAuthenticated', () => {
    test('returns true when auth code exists', () => {
      __setAuthTestState({ code: 'test-code' });
      expect(isAlertaAuthenticated()).toBe(true);
    });

    test('returns true when token is valid', () => {
      __setAuthTestState({ token: 'test-token', expiry: Date.now() + 10000 });
      expect(isAlertaAuthenticated()).toBe(true);
    });

    test('returns false when token is expired', () => {
      __setAuthTestState({ token: 'test-token', expiry: Date.now() - 1000 });
      expect(isAlertaAuthenticated()).toBe(false);
    });

    test('returns false when no auth state', () => {
      expect(isAlertaAuthenticated()).toBe(false);
    });
  });

  describe('invalidateAlertaToken', () => {
    test('clears token and expiry', () => {
      __setAuthTestState({ token: 'test-token', expiry: Date.now() + 10000 });

      invalidateAlertaToken();

      const state = __getAuthTestState();
      expect(state.authToken).toBeNull();
      expect(state.tokenExpiry).toBe(0);
    });
  });

  describe('getJwtExpSeconds', () => {
    test('extracts expiry from valid JWT', () => {
      // JWT with exp: 1234567890
      const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjEyMzQ1Njc4OTB9.xxx';
      const exp = getJwtExpSeconds(token);
      expect(exp).toBe(1234567890);
    });

    test('returns undefined for token without exp', () => {
      const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.xxx';
      const exp = getJwtExpSeconds(token);
      expect(exp).toBeUndefined();
    });

    test('returns undefined for invalid token', () => {
      const exp = getJwtExpSeconds('invalid-token');
      expect(exp).toBeUndefined();
    });

    test('returns undefined for token with non-number exp', () => {
      const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOiJub3QtYS1udW1iZXIifQ.xxx';
      const exp = getJwtExpSeconds(token);
      expect(exp).toBeUndefined();
    });

    test('returns undefined for token with invalid exp value', () => {
      const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjB9.xxx';
      const exp = getJwtExpSeconds(token);
      expect(exp).toBeUndefined();
    });

    test('returns undefined when decoding throws', () => {
      const spy = jest.spyOn(jwt, 'decode').mockImplementation(() => {
        throw new Error('decode failure');
      });

      expect(getJwtExpSeconds('any-token')).toBeUndefined();

      spy.mockRestore();
    });
  });

  describe('calcExpiryMsFromToken', () => {
    test('calculates expiry with valid JWT', () => {
      const futureExp = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
      const token = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(JSON.stringify({ exp: futureExp }))}.xxx`;

      const expiry = calcExpiryMsFromToken(token);

      // Should be future time minus clock skew
      expect(expiry).toBeGreaterThan(Date.now());
      expect(expiry).toBeLessThan(futureExp * 1000);
    });

    test('uses default lifetime for token without exp', () => {
      const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0In0.xxx';

      const expiry = calcExpiryMsFromToken(token);

      // Should be current time + default lifetime - clock skew
      expect(expiry).toBeGreaterThan(Date.now());
    });

    test('enforces minimum expiry time', () => {
      const pastExp = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago
      const token = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(JSON.stringify({ exp: pastExp }))}.xxx`;

      const beforeCall = Date.now();
      const expiry = calcExpiryMsFromToken(token);

      // Should enforce minimum 1 minute from now (captured before the call to
      // avoid flakiness from Date.now() advancing between the two calls)
      expect(expiry).toBeGreaterThanOrEqual(beforeCall + 60000);
    });
  });

  describe('getToken', () => {
    test('returns mock token when MSW mocking is enabled', async () => {
      // isAlertaMocked is evaluated at module load time, so re-import the module
      // in isolation with the env var set to exercise the mocked-token branch.
      const original = process.env.NEXT_PUBLIC_MSW_MOCK_ALERTA_WEB;
      process.env.NEXT_PUBLIC_MSW_MOCK_ALERTA_WEB = 'true';

      let mockedToken: string | null = null;
      await jest.isolateModulesAsync(async () => {
        const mod = await import('@/utils/alert');
        mockedToken = await mod.getToken();
      });

      expect(mockedToken).toBe('mock-access-token');

      process.env.NEXT_PUBLIC_MSW_MOCK_ALERTA_WEB = original;
    });

    test('falls back to empty clientId when env var is unset', async () => {
      // clientId is resolved at module load via `|| ''`; re-import in isolation
      // with the env var removed to exercise the empty-string fallback branch.
      const original = process.env.NEXT_PUBLIC_AUTH_CLIENT_ID;
      delete process.env.NEXT_PUBLIC_AUTH_CLIENT_ID;

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ token: undefined }),
      });

      await jest.isolateModulesAsync(async () => {
        const mod = await import('@/utils/alert');
        mod.setAlertaAuthCode('test-auth-code');
        await mod.getToken();
      });

      const body = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);
      expect(body.clientId).toBe('');

      process.env.NEXT_PUBLIC_AUTH_CLIENT_ID = original;
    });

    test('returns existing valid token', async () => {
      __setAuthTestState({ token: 'existing-token', expiry: Date.now() + 10000 });

      const token = await getToken();

      expect(token).toBe('existing-token');
      expect(global.fetch).not.toHaveBeenCalled();
    });

    test('returns null when no auth code', async () => {
      const token = await getToken();

      expect(token).toBeNull();
    });

    test('exchanges auth code for token successfully', async () => {
      const mockToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 }))}.xxx`;

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ token: mockToken }),
      });

      __setAuthTestState({ code: 'test-auth-code' });

      const token = await getToken();

      expect(token).toBe(mockToken);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })
      );
    });

    test('handles failed token exchange (non-ok response)', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
      });

      __setAuthTestState({ code: 'test-auth-code' });

      const token = await getToken();

      expect(token).toBeNull();
    });

    test('handles token exchange with missing token in response', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      __setAuthTestState({ code: 'test-auth-code' });

      const token = await getToken();

      expect(token).toBeNull();
    });

    test('handles network error during token exchange', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      __setAuthTestState({ code: 'test-auth-code' });

      const token = await getToken();

      expect(token).toBeNull();
      // Code should be kept on network error
      const state = __getAuthTestState();
      expect(state.authCode).toBe('test-auth-code');
    });

    test('shares in-flight token exchange between concurrent calls', async () => {
      const mockToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 }))}.xxx`;

      let resolveExchange: (value: any) => void;
      const exchangePromise = new Promise((resolve) => {
        resolveExchange = resolve;
      });

      (global.fetch as jest.Mock).mockReturnValueOnce(
        exchangePromise.then(() => ({
          ok: true,
          json: async () => ({ token: mockToken }),
        }))
      );

      __setAuthTestState({ code: 'test-auth-code' });

      // Start two concurrent token requests
      const promise1 = getToken();
      const promise2 = getToken();

      // Resolve the exchange
      resolveExchange!({
        ok: true,
        json: async () => ({ token: mockToken }),
      });

      const [token1, token2] = await Promise.all([promise1, promise2]);

      // Both should get the same token
      expect(token1).toBe(mockToken);
      expect(token2).toBe(mockToken);

      // Fetch should only be called once
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('getAlertRefreshIntervalMs', () => {
    const original = process.env.NEXT_PUBLIC_ALERT_REFRESH_INTERVAL_SEC;

    afterEach(() => {
      process.env.NEXT_PUBLIC_ALERT_REFRESH_INTERVAL_SEC = original;
    });

    test('uses the configured interval in seconds', () => {
      process.env.NEXT_PUBLIC_ALERT_REFRESH_INTERVAL_SEC = '5';
      expect(getAlertRefreshIntervalMs()).toBe(5000);
    });

    test('falls back to 30s when unset', () => {
      delete process.env.NEXT_PUBLIC_ALERT_REFRESH_INTERVAL_SEC;
      expect(getAlertRefreshIntervalMs()).toBe(30000);
    });

    test('falls back to 30s when zero', () => {
      process.env.NEXT_PUBLIC_ALERT_REFRESH_INTERVAL_SEC = '0';
      expect(getAlertRefreshIntervalMs()).toBe(30000);
    });

    test('falls back to 30s when not a number', () => {
      process.env.NEXT_PUBLIC_ALERT_REFRESH_INTERVAL_SEC = 'abc';
      expect(getAlertRefreshIntervalMs()).toBe(30000);
    });
  });

  describe('getSharedAuthState', () => {
    test('falls back to local state when window.top access throws (cross-origin)', () => {
      const originalTop = window.top;
      Object.defineProperty(window, 'top', {
        get: () => {
          throw new Error('Cross-origin access denied');
        },
        configurable: true,
      });

      try {
        // All auth functions must work without throwing, using local fallback
        expect(() => isAlertaAuthenticated()).not.toThrow();
        expect(isAlertaAuthenticated()).toBe(false);
      } finally {
        Object.defineProperty(window, 'top', {
          value: originalTop,
          configurable: true,
        });
      }
    });

    test('falls back to local state when window is undefined (SSR)', () => {
      const originalWindow = global.window;
      delete (global as any).window;

      try {
        expect(() => isAlertaAuthenticated()).not.toThrow();
        expect(isAlertaAuthenticated()).toBe(false);
      } finally {
        (global as any).window = originalWindow;
      }
    });

    test('falls back to local state when window.top is null', () => {
      const originalTop = window.top;
      Object.defineProperty(window, 'top', {
        value: null,
        configurable: true,
      });

      try {
        expect(() => isAlertaAuthenticated()).not.toThrow();
        expect(isAlertaAuthenticated()).toBe(false);
      } finally {
        Object.defineProperty(window, 'top', {
          value: originalTop,
          configurable: true,
        });
      }
    });
  });
});
