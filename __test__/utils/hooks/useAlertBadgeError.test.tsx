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

import { renderHook, act } from '@testing-library/react';
import { useAlertBadgeError } from '@/utils/hooks/useAlertBadgeError';
import { emitAlertPublished } from '@/utils/alertPublishSignal';
import * as alertBadgeState from '@/utils/alertBadgeState';

jest.mock('@/utils/alertBadgeState');

const mockGetAlertBadgeError = alertBadgeState.getAlertBadgeError as jest.Mock;

// Trigger the poller's publish signal the hook subscribes to.
const publish = () => act(() => emitAlertPublished());

describe('useAlertBadgeError', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should return undefined when there is no error', () => {
    mockGetAlertBadgeError.mockReturnValue(undefined);

    const { result } = renderHook(() => useAlertBadgeError());

    expect(result.current).toBeUndefined();
  });

  test('should return Error object when there is an error', () => {
    const mockError = {
      name: 'AuthError',
      message: 'Authentication failed',
    };
    mockGetAlertBadgeError.mockReturnValue(mockError);

    const { result } = renderHook(() => useAlertBadgeError());

    expect(result.current).toBeInstanceOf(Error);
    expect(result.current?.name).toBe('AuthError');
    expect(result.current?.message).toBe('Authentication failed');
  });

  test('should update on the poller publish signal', () => {
    mockGetAlertBadgeError.mockReturnValue(undefined);

    const { result } = renderHook(() => useAlertBadgeError());

    expect(result.current).toBeUndefined();

    // Change error state
    const mockError = {
      name: 'NetworkError',
      message: 'Network request failed',
    };
    mockGetAlertBadgeError.mockReturnValue(mockError);

    publish();

    expect(result.current).toBeInstanceOf(Error);
    expect(result.current?.name).toBe('NetworkError');
    expect(result.current?.message).toBe('Network request failed');
  });

  test('should maintain stable Error reference for same error', () => {
    const mockError = {
      name: 'TestError',
      message: 'Test error message',
    };
    mockGetAlertBadgeError.mockReturnValue(mockError);

    const { result, rerender } = renderHook(() => useAlertBadgeError());

    const firstError = result.current;

    rerender();

    const secondError = result.current;

    // Should be the same reference
    expect(firstError).toBe(secondError);
  });

  test('should update Error reference when error changes', () => {
    const mockError1 = {
      name: 'Error1',
      message: 'First error',
    };
    mockGetAlertBadgeError.mockReturnValue(mockError1);

    const { result } = renderHook(() => useAlertBadgeError());

    const firstError = result.current;

    const mockError2 = {
      name: 'Error2',
      message: 'Second error',
    };
    mockGetAlertBadgeError.mockReturnValue(mockError2);

    publish();

    const secondError = result.current;

    // Should be different references
    expect(firstError).not.toBe(secondError);
    expect(secondError?.name).toBe('Error2');
    expect(secondError?.message).toBe('Second error');
  });

  test('should unsubscribe on unmount', () => {
    mockGetAlertBadgeError.mockReturnValue(undefined);

    const { result, unmount } = renderHook(() => useAlertBadgeError());

    unmount();

    // After unmount the listener is gone, so a later publish is ignored.
    mockGetAlertBadgeError.mockReturnValue({ name: 'LateError', message: 'ignored' });
    publish();

    expect(result.current).toBeUndefined();
  });
});
