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
import { useAlertSeverityCounts } from '@/utils/hooks/useAlertSeverityCounts';
import { emitAlertPublished } from '@/utils/alertPublishSignal';
import * as alertBadgeState from '@/utils/alertBadgeState';

jest.mock('@/utils/alertBadgeState');

const mockGetAlertSeverityCounts = alertBadgeState.getAlertSeverityCounts as jest.Mock;

// Trigger the poller's publish signal the hook subscribes to.
const publish = () => act(() => emitAlertPublished());

describe('useAlertSeverityCounts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should return undefined when there are no counts', () => {
    mockGetAlertSeverityCounts.mockReturnValue(undefined);

    const { result } = renderHook(() => useAlertSeverityCounts());

    expect(result.current).toBeUndefined();
  });

  test('should return severity counts when available', () => {
    const mockCounts = {
      critical: 5,
      warning: 3,
      major: 1,
    };
    mockGetAlertSeverityCounts.mockReturnValue(mockCounts);

    const { result } = renderHook(() => useAlertSeverityCounts());

    expect(result.current).toEqual(mockCounts);
  });

  test('should update on the poller publish signal', () => {
    mockGetAlertSeverityCounts.mockReturnValue(undefined);

    const { result } = renderHook(() => useAlertSeverityCounts());

    expect(result.current).toBeUndefined();

    // Change counts
    const mockCounts = {
      critical: 2,
      warning: 1,
    };
    mockGetAlertSeverityCounts.mockReturnValue(mockCounts);

    publish();

    expect(result.current).toEqual(mockCounts);
  });

  test('should maintain stable reference for same counts', () => {
    const mockCounts = {
      critical: 5,
      warning: 3,
    };
    mockGetAlertSeverityCounts.mockReturnValue(mockCounts);

    const { result, rerender } = renderHook(() => useAlertSeverityCounts());

    const firstCounts = result.current;

    rerender();

    const secondCounts = result.current;

    // Should be the same reference
    expect(firstCounts).toBe(secondCounts);
  });

  test('should update reference when counts change', () => {
    const mockCounts1 = {
      critical: 5,
      warning: 3,
    };
    mockGetAlertSeverityCounts.mockReturnValue(mockCounts1);

    const { result } = renderHook(() => useAlertSeverityCounts());

    const firstCounts = result.current;

    const mockCounts2 = {
      critical: 7,
      warning: 2,
    };
    mockGetAlertSeverityCounts.mockReturnValue(mockCounts2);

    publish();

    const secondCounts = result.current;

    // Should be different references
    expect(firstCounts).not.toBe(secondCounts);
    expect(secondCounts).toEqual(mockCounts2);
  });

  test('should detect when counts object keys change', () => {
    const mockCounts1 = {
      critical: 5,
    };
    mockGetAlertSeverityCounts.mockReturnValue(mockCounts1);

    const { result } = renderHook(() => useAlertSeverityCounts());

    const firstCounts = result.current;

    const mockCounts2 = {
      critical: 5,
      warning: 3,
    };
    mockGetAlertSeverityCounts.mockReturnValue(mockCounts2);

    publish();

    const secondCounts = result.current;

    // Should be different references because keys changed
    expect(firstCounts).not.toBe(secondCounts);
    expect(secondCounts).toEqual(mockCounts2);
  });

  test('should handle transition from undefined to counts', () => {
    mockGetAlertSeverityCounts.mockReturnValue(undefined);

    const { result } = renderHook(() => useAlertSeverityCounts());

    expect(result.current).toBeUndefined();

    const mockCounts = {
      critical: 5,
      warning: 3,
    };
    mockGetAlertSeverityCounts.mockReturnValue(mockCounts);

    publish();

    expect(result.current).toEqual(mockCounts);
  });

  test('should handle transition from counts to undefined', () => {
    const mockCounts = {
      critical: 5,
      warning: 3,
    };
    mockGetAlertSeverityCounts.mockReturnValue(mockCounts);

    const { result } = renderHook(() => useAlertSeverityCounts());

    expect(result.current).toEqual(mockCounts);

    mockGetAlertSeverityCounts.mockReturnValue(undefined);

    publish();

    expect(result.current).toBeUndefined();
  });

  test('should unsubscribe on unmount', () => {
    mockGetAlertSeverityCounts.mockReturnValue(undefined);

    const { result, unmount } = renderHook(() => useAlertSeverityCounts());

    unmount();

    // After unmount the listener is gone, so a later publish is ignored.
    mockGetAlertSeverityCounts.mockReturnValue({ critical: 9 });
    publish();

    expect(result.current).toBeUndefined();
  });
});
