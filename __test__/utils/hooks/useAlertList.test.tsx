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

import { fetchAlertList, useAlertListData } from '@/utils/hooks/useAlertList';

const mockUseSWR = jest.fn();
const mockGetToken = jest.fn();
const mockInvalidateAlertaToken = jest.fn();
const mockIsAlertaAuthenticated = jest.fn();
const mockMutate = jest.fn();
const mockSubscribeAlertRefresh = jest.fn();
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const mockRegisterBarrierParticipant = jest.fn((_: string) => jest.fn()) as jest.Mock<jest.Mock, [string]>;
const mockSubmitToBarrier = jest.fn();

jest.mock('swr', () => ({
  __esModule: true,
  default: (...args: unknown[]) => mockUseSWR(...args),
}));

jest.mock('@/utils/alert', () => ({
  getToken: () => mockGetToken(),
  invalidateAlertaToken: () => mockInvalidateAlertaToken(),
  isAlertaAuthenticated: () => mockIsAlertaAuthenticated(),
}));

jest.mock('@/utils/alertRefreshSignal', () => ({
  subscribeAlertRefresh: (listener: () => void) => mockSubscribeAlertRefresh(listener),
}));

jest.mock('@/utils/alertCommitBarrier', () => ({
  registerBarrierParticipant: (name: string) => mockRegisterBarrierParticipant(name),
  submitToBarrier: (name: string, commit: () => void) => mockSubmitToBarrier(name, commit),
}));

const fetchMock = jest.fn();
global.fetch = fetchMock as unknown as typeof fetch;

describe('useAlertList', () => {
  beforeEach(() => {
    mockUseSWR.mockReset();
    mockGetToken.mockReset();
    mockInvalidateAlertaToken.mockReset();
    mockIsAlertaAuthenticated.mockReset();
    mockMutate.mockReset();
    mockMutate.mockResolvedValue({ alerts: [], total: 0 });
    mockSubscribeAlertRefresh.mockReset();
    mockSubscribeAlertRefresh.mockReturnValue(() => {});
    mockRegisterBarrierParticipant.mockReset();
    mockRegisterBarrierParticipant.mockReturnValue(jest.fn());
    mockSubmitToBarrier.mockReset();
    // Model a barrier flush by committing immediately.
    mockSubmitToBarrier.mockImplementation((_name: string, commit: () => void) => commit());
    fetchMock.mockReset();
    mockUseSWR.mockReturnValue({
      data: undefined,
      error: undefined,
      isValidating: false,
      mutate: mockMutate,
    });
    mockIsAlertaAuthenticated.mockReturnValue(false);
  });

  test('fetchAlertList returns data after successful request', async () => {
    mockGetToken.mockResolvedValue('token');
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        alerts: [
          {
            id: 'alert-001',
            event: 'Event',
            text: 'Text',
            lastReceiveTime: '2026-01-01T00:00:00.000Z',
            resource: 'web01',
            severity: 'critical',
          },
        ],
        total: 1,
      }),
    } as Response);

    await expect(fetchAlertList()).resolves.toEqual({
      alerts: [
        {
          id: 'alert-001',
          event: 'Event',
          text: 'Text',
          lastReceiveTime: '2026-01-01T00:00:00.000Z',
          resource: 'web01',
          severity: 'critical',
        },
      ],
      total: 1,
    });
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining(
        '/alerts?status=open&severity=critical&severity=warning&sort-by=lastReceiveTime&page-size=10'
      ),
      expect.objectContaining({
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer token',
        },
      })
    );
  });

  test('fetchAlertList retries after 401 and invalidates the token', async () => {
    mockGetToken.mockResolvedValueOnce('token').mockResolvedValueOnce('new-token');
    fetchMock.mockResolvedValueOnce({ ok: false, status: 401 } as Response).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ alerts: [], total: 0 }),
    } as Response);

    const { fetchAlertList } = require('@/utils/hooks/useAlertList');
    await expect(fetchAlertList()).resolves.toEqual({ alerts: [], total: 0 });
    expect(mockInvalidateAlertaToken).toHaveBeenCalledTimes(1);
    expect(mockGetToken).toHaveBeenCalledTimes(2);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  test('fetchAlertList throws when no token is available', async () => {
    const { fetchAlertList } = require('@/utils/hooks/useAlertList');
    await expect(fetchAlertList()).rejects.toThrow('No authentication token available');
  });

  test('fetchAlertList throws when the API request fails', async () => {
    mockGetToken.mockResolvedValue('token');
    fetchMock.mockResolvedValueOnce({ ok: false, status: 500 } as Response);

    const { fetchAlertList } = require('@/utils/hooks/useAlertList');
    await expect(fetchAlertList()).rejects.toThrow('API request failed: 500');
  });

  test('useAlertListData skips fetching while unauthenticated', () => {
    const { result } = renderHook(() => useAlertListData());

    expect(mockUseSWR).toHaveBeenCalledWith(null, expect.any(Function));
    expect(result.current).toEqual({
      alertList: [],
      alertTotal: 0,
      alertListError: undefined,
      alertListValidating: false,
      alertListResolved: false,
    });
  });

  test('useAlertListData returns the fetched alert list and cleans up its timer', async () => {
    jest.useFakeTimers();
    mockIsAlertaAuthenticated.mockReturnValue(true);
    mockUseSWR.mockReturnValue({
      data: {
        alerts: [],
        total: 3,
      },
      error: undefined,
      isValidating: true,
      mutate: mockMutate,
    });

    const clearIntervalSpy = jest.spyOn(global, 'clearInterval');

    const { result, unmount } = renderHook(() => useAlertListData());

    await waitFor(() => {
      expect(result.current.alertTotal).toBe(3);
      expect(result.current.alertListResolved).toBe(true);
      expect(result.current.alertListValidating).toBe(true);
    });

    unmount();
    expect(clearIntervalSpy).toHaveBeenCalled();
    clearIntervalSpy.mockRestore();
    jest.useRealTimers();
  });

  test('useAlertListData honors suppressFetch', () => {
    mockIsAlertaAuthenticated.mockReturnValue(true);

    renderHook(() => useAlertListData(true));

    expect(mockUseSWR).toHaveBeenCalledWith(null, expect.any(Function));
  });

  test('useAlertListData reports an error state from SWR', () => {
    mockIsAlertaAuthenticated.mockReturnValue(true);
    const error = new Error('network down');
    mockUseSWR.mockReturnValue({
      data: undefined,
      error,
      isValidating: false,
      mutate: mockMutate,
    });

    const { result } = renderHook(() => useAlertListData());

    expect(result.current.alertListError).toBe(error);
    expect(result.current.alertListResolved).toBe(true);
  });

  test('useAlertListData commits refreshed data via the barrier when the refresh signal fires', async () => {
    mockIsAlertaAuthenticated.mockReturnValue(true);
    mockUseSWR.mockReturnValue({
      data: { alerts: [], total: 1 },
      error: undefined,
      isValidating: false,
      mutate: mockMutate,
    });
    mockMutate.mockResolvedValue({ alerts: [], total: 5 });

    const { result } = renderHook(() => useAlertListData());

    // First delivery shows immediately and joins the barrier.
    expect(result.current.alertTotal).toBe(1);
    expect(mockRegisterBarrierParticipant).toHaveBeenCalledWith('list');

    expect(mockSubscribeAlertRefresh).toHaveBeenCalledTimes(1);
    const listener = mockSubscribeAlertRefresh.mock.calls[0][0] as () => void;
    listener();

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledTimes(1);
      expect(mockSubmitToBarrier).toHaveBeenCalledWith('list', expect.any(Function));
      expect(result.current.alertTotal).toBe(5);
    });
  });

  test('useAlertListData commits an error via the barrier when the refresh mutate rejects', async () => {
    mockIsAlertaAuthenticated.mockReturnValue(true);
    mockUseSWR.mockReturnValue({
      data: { alerts: [], total: 1 },
      error: undefined,
      isValidating: false,
      mutate: mockMutate,
    });
    mockMutate.mockRejectedValue(new Error('refresh failed'));

    const { result } = renderHook(() => useAlertListData());

    expect(result.current.alertTotal).toBe(1);

    const listener = mockSubscribeAlertRefresh.mock.calls[0][0] as () => void;
    listener();

    await waitFor(() => {
      expect(mockSubmitToBarrier).toHaveBeenCalledWith('list', expect.any(Function));
      expect(result.current.alertListError).toEqual(new Error('refresh failed'));
    });
  });

  test('useAlertListData wraps a non-Error rejection from the refresh mutate', async () => {
    mockIsAlertaAuthenticated.mockReturnValue(true);
    mockUseSWR.mockReturnValue({
      data: { alerts: [], total: 1 },
      error: undefined,
      isValidating: false,
      mutate: mockMutate,
    });
    mockMutate.mockRejectedValue('boom');

    const { result } = renderHook(() => useAlertListData());

    const listener = mockSubscribeAlertRefresh.mock.calls[0][0] as () => void;
    listener();

    await waitFor(() => {
      expect(result.current.alertListError).toEqual(new Error('boom'));
    });
  });

  test('useAlertListData joins the barrier only once across re-renders', () => {
    mockIsAlertaAuthenticated.mockReturnValue(true);
    mockUseSWR.mockReturnValue({
      data: { alerts: [], total: 1 },
      error: undefined,
      isValidating: false,
      mutate: mockMutate,
    });

    const { rerender } = renderHook(() => useAlertListData());
    expect(mockRegisterBarrierParticipant).toHaveBeenCalledTimes(1);

    mockUseSWR.mockReturnValue({
      data: { alerts: [], total: 2 },
      error: undefined,
      isValidating: false,
      mutate: mockMutate,
    });
    rerender();

    // The join guard prevents re-registering on subsequent data changes.
    expect(mockRegisterBarrierParticipant).toHaveBeenCalledTimes(1);
  });
});
