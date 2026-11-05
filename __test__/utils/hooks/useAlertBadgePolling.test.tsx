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

import { renderHook, waitFor } from '@testing-library/react';

const mockGetToken = jest.fn();
const mockInvalidateAlertaToken = jest.fn();
const mockIsAlertaAuthenticated = jest.fn();
const mockSetAlertBadgeCount = jest.fn();
const mockSetAlertBadgeError = jest.fn();
const mockSetAlertSeverityCounts = jest.fn();
const mockTimeoutSignal = jest.fn();
const mockEmitAlertRefresh = jest.fn();
const mockEmitAlertPublished = jest.fn();

jest.mock('@/utils/alert', () => ({
  getToken: () => mockGetToken(),
  invalidateAlertaToken: () => mockInvalidateAlertaToken(),
  isAlertaAuthenticated: () => mockIsAlertaAuthenticated(),
  getAlertRefreshIntervalMs: () => {
    const num = Number(process.env.NEXT_PUBLIC_ALERT_REFRESH_INTERVAL_SEC);
    const sec = Number.isNaN(num) ? undefined : num;
    return (sec != undefined && sec !== 0 ? sec : 30) * 1000;
  },
}));

jest.mock('@/utils/alertRefreshSignal', () => ({
  emitAlertRefresh: () => mockEmitAlertRefresh(),
}));

jest.mock('@/utils/alertPublishSignal', () => ({
  emitAlertPublished: () => mockEmitAlertPublished(),
}));

jest.mock('@/utils/alertCommitBarrier', () => ({
  registerBarrierParticipant: () => () => {},
  // Model a barrier flush by committing immediately, so publishResult runs
  // exactly as before when the badge is the sole participant.
  submitToBarrier: (_name: string, commit: () => void) => commit(),
}));

jest.mock('@/utils/alertBadgeState', () => ({
  setAlertBadgeCount: (...args: unknown[]) => mockSetAlertBadgeCount(...args),
  setAlertBadgeError: (...args: unknown[]) => mockSetAlertBadgeError(...args),
  setAlertSeverityCounts: (...args: unknown[]) => mockSetAlertSeverityCounts(...args),
}));

jest.mock('@/utils/timeoutSignal', () => ({
  timeoutSignal: (...args: unknown[]) => mockTimeoutSignal(...args),
}));

const fetchMock = jest.fn();
global.fetch = fetchMock as unknown as typeof fetch;

describe('useAlertBadgePolling', () => {
  const updateTopNavigation = jest.fn();

  beforeEach(() => {
    jest.useFakeTimers();
    mockGetToken.mockReset();
    mockInvalidateAlertaToken.mockReset();
    mockIsAlertaAuthenticated.mockReset();
    mockSetAlertBadgeCount.mockReset();
    mockSetAlertBadgeError.mockReset();
    mockSetAlertSeverityCounts.mockReset();
    mockTimeoutSignal.mockReset();
    fetchMock.mockReset();
    updateTopNavigation.mockReset();
    mockEmitAlertPublished.mockReset();
    mockTimeoutSignal.mockReturnValue(undefined);
    mockIsAlertaAuthenticated.mockReturnValue(false);
    (window as typeof window & { Luigi?: { navigation: () => { updateTopNavigation: jest.Mock } } }).Luigi = {
      navigation: () => ({ updateTopNavigation }),
    };
    jest.spyOn(document.body.classList, 'toggle').mockImplementation(() => true);
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
    delete (window as typeof window & { Luigi?: unknown }).Luigi;
  });

  test('skips polling when authentication is not ready', () => {
    const { useAlertBadgePolling } = require('@/utils/hooks/useAlertBadgePolling');
    const clearIntervalSpy = jest.spyOn(global, 'clearInterval');

    const { unmount } = renderHook(() => useAlertBadgePolling(1000));

    expect(fetchMock).not.toHaveBeenCalled();
    expect(mockSetAlertBadgeCount).not.toHaveBeenCalled();

    unmount();
    expect(clearIntervalSpy).toHaveBeenCalled();
    clearIntervalSpy.mockRestore();
  });

  test('publishes successful alert counts', async () => {
    mockIsAlertaAuthenticated.mockReturnValue(true);
    mockGetToken.mockResolvedValue('access-token');
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        severityCounts: {
          critical: 5,
          warning: 3,
          major: 0,
          minor: 0,
          indeterminate: 0,
          informational: 0,
        },
        total: 8,
      }),
    } as Response);

    const { useAlertBadgePolling } = require('@/utils/hooks/useAlertBadgePolling');
    renderHook(() => useAlertBadgePolling(1000));

    await waitFor(() => {
      expect(mockSetAlertBadgeError).toHaveBeenCalledWith(undefined);
      expect(mockSetAlertBadgeCount).toHaveBeenCalledWith(8);
      expect(mockSetAlertSeverityCounts).toHaveBeenCalledWith({
        critical: 5,
        warning: 3,
        major: 0,
        minor: 0,
        indeterminate: 0,
        informational: 0,
      });
    });

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/alerts/count?status=open'),
      expect.objectContaining({
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer access-token',
        },
      })
    );
    expect(updateTopNavigation).toHaveBeenCalledTimes(1);
    expect(mockEmitAlertPublished).toHaveBeenCalledTimes(1);
  });

  test('retries once after 401 and invalidates the token', async () => {
    mockIsAlertaAuthenticated.mockReturnValue(true);
    mockGetToken.mockResolvedValueOnce('token').mockResolvedValueOnce('new-token');
    fetchMock.mockResolvedValueOnce({ ok: false, status: 401 } as Response).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        severityCounts: {
          critical: 1,
          warning: 2,
          major: 0,
          minor: 0,
          indeterminate: 0,
          informational: 0,
        },
        total: 3,
      }),
    } as Response);

    const { useAlertBadgePolling } = require('@/utils/hooks/useAlertBadgePolling');
    renderHook(() => useAlertBadgePolling(1000));

    await waitFor(() => {
      expect(mockInvalidateAlertaToken).toHaveBeenCalledTimes(1);
      expect(mockGetToken).toHaveBeenCalledTimes(2);
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });
  });

  test('publishes an error state when polling fails', async () => {
    mockIsAlertaAuthenticated.mockReturnValue(true);
    mockGetToken.mockResolvedValue('access-token');
    fetchMock.mockRejectedValue(new Error('network down'));
    jest.spyOn(document.body.classList, 'toggle').mockImplementation(() => {
      throw new Error('cross-origin');
    });

    const { useAlertBadgePolling } = require('@/utils/hooks/useAlertBadgePolling');
    renderHook(() => useAlertBadgePolling(1000));

    await waitFor(() => {
      expect(mockSetAlertBadgeError).toHaveBeenCalledWith({ name: 'Error', message: 'network down' });
      expect(mockSetAlertBadgeCount).toHaveBeenCalledWith(0);
      expect(mockSetAlertSeverityCounts).toHaveBeenCalledWith(undefined);
    });
  });

  test('publishes an error state when no authentication token is available', async () => {
    mockIsAlertaAuthenticated.mockReturnValue(true);
    mockGetToken.mockResolvedValue(undefined);

    const { useAlertBadgePolling } = require('@/utils/hooks/useAlertBadgePolling');
    renderHook(() => useAlertBadgePolling(1000));

    await waitFor(() => {
      expect(fetchMock).not.toHaveBeenCalled();
      expect(mockSetAlertBadgeError).toHaveBeenCalledWith({
        name: 'Error',
        message: 'No authentication token available',
      });
    });
  });

  test('publishes an error state when the request fails with a non-401 status', async () => {
    mockIsAlertaAuthenticated.mockReturnValue(true);
    mockGetToken.mockResolvedValue('access-token');
    fetchMock.mockResolvedValue({ ok: false, status: 500 } as Response);

    const { useAlertBadgePolling } = require('@/utils/hooks/useAlertBadgePolling');
    renderHook(() => useAlertBadgePolling(1000));

    await waitFor(() => {
      expect(mockSetAlertBadgeError).toHaveBeenCalledWith({
        name: 'Error',
        message: 'API request failed: 500',
      });
    });
    expect(mockInvalidateAlertaToken).not.toHaveBeenCalled();
  });

  test('publishes a zero count when the response has no severity counts', async () => {
    mockIsAlertaAuthenticated.mockReturnValue(true);
    mockGetToken.mockResolvedValue('access-token');
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({}),
    } as Response);

    const { useAlertBadgePolling } = require('@/utils/hooks/useAlertBadgePolling');
    renderHook(() => useAlertBadgePolling(1000));

    await waitFor(() => {
      expect(mockSetAlertBadgeCount).toHaveBeenCalledWith(0);
      expect(mockSetAlertSeverityCounts).toHaveBeenCalledWith(undefined);
    });
  });

  test('ignores a second refresh while a fetch is already in flight', async () => {
    mockIsAlertaAuthenticated.mockReturnValue(true);
    mockGetToken.mockResolvedValue('access-token');

    let resolveFetch: (value: Response) => void;
    const pendingFetch = new Promise<Response>((resolve) => {
      resolveFetch = resolve;
    });
    fetchMock.mockReturnValue(pendingFetch);

    const { useAlertBadgePolling } = require('@/utils/hooks/useAlertBadgePolling');
    const { result } = renderHook(() => useAlertBadgePolling(1000));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });
    result.current.refresh();
    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    resolveFetch!({
      ok: true,
      json: async () => ({
        severityCounts: {
          critical: 0,
          warning: 0,
          major: 0,
          minor: 0,
          indeterminate: 0,
          informational: 0,
        },
        total: 0,
      }),
    } as Response);

    await waitFor(() => {
      expect(mockSetAlertBadgeCount).toHaveBeenCalledWith(0);
    });
  });

  test('uses default interval when no interval is provided', () => {
    const { useAlertBadgePolling } = require('@/utils/hooks/useAlertBadgePolling');
    const { result } = renderHook(() => useAlertBadgePolling());

    expect(result.current.refresh).toBeDefined();
  });

  test('handles non-Error exceptions gracefully', async () => {
    mockIsAlertaAuthenticated.mockReturnValue(true);
    mockGetToken.mockResolvedValue('access-token');
    fetchMock.mockRejectedValue('String error message');

    const { useAlertBadgePolling } = require('@/utils/hooks/useAlertBadgePolling');
    renderHook(() => useAlertBadgePolling(1000));

    await waitFor(() => {
      expect(mockSetAlertBadgeError).toHaveBeenCalledWith({
        name: 'Error',
        message: 'String error message',
      });
    });
  });

  test('calculates badge count correctly when severityCounts has critical but no warning', async () => {
    mockIsAlertaAuthenticated.mockReturnValue(true);
    mockGetToken.mockResolvedValue('access-token');
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        severityCounts: {
          critical: 5,
          major: 2,
        },
        total: 7,
      }),
    } as Response);

    const { useAlertBadgePolling } = require('@/utils/hooks/useAlertBadgePolling');
    renderHook(() => useAlertBadgePolling(1000));

    await waitFor(() => {
      expect(mockSetAlertBadgeCount).toHaveBeenCalledWith(5);
    });
  });

  test('calculates badge count correctly when severityCounts has warning but no critical', async () => {
    mockIsAlertaAuthenticated.mockReturnValue(true);
    mockGetToken.mockResolvedValue('access-token');
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        severityCounts: {
          warning: 3,
          major: 1,
        },
        total: 4,
      }),
    } as Response);

    const { useAlertBadgePolling } = require('@/utils/hooks/useAlertBadgePolling');
    renderHook(() => useAlertBadgePolling(1000));

    await waitFor(() => {
      expect(mockSetAlertBadgeCount).toHaveBeenCalledWith(3);
    });
  });

  test('handles errors that trigger setBellErrorState with cross-origin protection', async () => {
    // Save original classList.toggle
    const originalToggle = document.body.classList.toggle.bind(document.body.classList);
    const toggleSpy = jest.fn(originalToggle);
    document.body.classList.toggle = toggleSpy;

    mockIsAlertaAuthenticated.mockReturnValue(true);
    mockGetToken.mockResolvedValue('access-token');
    fetchMock.mockRejectedValue(new Error('Network error'));

    const { useAlertBadgePolling } = require('@/utils/hooks/useAlertBadgePolling');
    renderHook(() => useAlertBadgePolling(1000));

    await waitFor(() => {
      expect(mockSetAlertBadgeError).toHaveBeenCalled();
    });

    // Verify classList.toggle was called for error state
    expect(toggleSpy).toHaveBeenCalledWith('alert-fetch-error', true);

    // Restore
    document.body.classList.toggle = originalToggle;
  });

  test('handles successful fetch that clears error state', async () => {
    // Save original classList.toggle
    const originalToggle = document.body.classList.toggle.bind(document.body.classList);
    const toggleSpy = jest.fn(originalToggle);
    document.body.classList.toggle = toggleSpy;

    mockIsAlertaAuthenticated.mockReturnValue(true);
    mockGetToken.mockResolvedValue('access-token');
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        severityCounts: {
          critical: 2,
          warning: 1,
        },
        total: 3,
      }),
    } as Response);

    const { useAlertBadgePolling } = require('@/utils/hooks/useAlertBadgePolling');
    renderHook(() => useAlertBadgePolling(1000));

    await waitFor(() => {
      expect(mockSetAlertBadgeCount).toHaveBeenCalled();
    });

    // Verify classList.toggle was called to clear error state
    expect(toggleSpy).toHaveBeenCalledWith('alert-fetch-error', false);

    // Restore
    document.body.classList.toggle = originalToggle;
  });

  describe('default refresh interval from env', () => {
    test.each(['1', '1.5'])(
      'uses the env value as the interval when NEXT_PUBLIC_ALERT_REFRESH_INTERVAL_SEC is a valid number: %s',
      (n) => {
        const envMock = jest.replaceProperty(process, 'env', {
          ...process.env,
          NEXT_PUBLIC_ALERT_REFRESH_INTERVAL_SEC: n,
        });
        const setIntervalSpy = jest.spyOn(global, 'setInterval');
        const { useAlertBadgePolling } = require('@/utils/hooks/useAlertBadgePolling');
        renderHook(() => useAlertBadgePolling());
        expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), parseFloat(n) * 1000);
        setIntervalSpy.mockRestore();
        envMock.restore();
      }
    );

    test.each(['', undefined, '0'])(
      'uses the default 30s interval when NEXT_PUBLIC_ALERT_REFRESH_INTERVAL_SEC is zero or falsy: %s',
      (n) => {
        const envMock = jest.replaceProperty(process, 'env', {
          ...process.env,
          NEXT_PUBLIC_ALERT_REFRESH_INTERVAL_SEC: n,
        });
        const setIntervalSpy = jest.spyOn(global, 'setInterval');
        const { useAlertBadgePolling } = require('@/utils/hooks/useAlertBadgePolling');
        renderHook(() => useAlertBadgePolling());
        expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), 30000);
        setIntervalSpy.mockRestore();
        envMock.restore();
      }
    );

    test.each([undefined, 'dummy'])(
      'uses the default 30s interval when NEXT_PUBLIC_ALERT_REFRESH_INTERVAL_SEC is not a number: %s',
      (n) => {
        const envMock = jest.replaceProperty(process, 'env', {
          ...process.env,
          NEXT_PUBLIC_ALERT_REFRESH_INTERVAL_SEC: n,
        });
        const setIntervalSpy = jest.spyOn(global, 'setInterval');
        const { useAlertBadgePolling } = require('@/utils/hooks/useAlertBadgePolling');
        renderHook(() => useAlertBadgePolling());
        expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), 30000);
        setIntervalSpy.mockRestore();
        envMock.restore();
      }
    );
  });
});
