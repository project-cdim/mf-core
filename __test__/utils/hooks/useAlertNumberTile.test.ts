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

import { renderHook } from '@testing-library/react';

import { useAlertNumberTile } from '@/utils/hooks/useAlertNumberTile';

// Mock environment variables for testing
const originalEnv = process.env;
beforeEach(() => {
  jest.resetModules();
  process.env = {
    ...originalEnv,
    NEXT_PUBLIC_URL_ALERTA_WEBUI: 'http://cdim-server:8020',
  };
});

afterEach(() => {
  process.env = originalEnv;
});

// Mock the necessary dependencies
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

// Mock useAlertBadgeError
jest.mock('@/utils/hooks/useAlertBadgeError');
const mockUseAlertBadgeError = require('@/utils/hooks/useAlertBadgeError')
  .useAlertBadgeError as jest.MockedFunction<any>;

// Mock useAlertSeverityCounts
jest.mock('@/utils/hooks/useAlertSeverityCounts');
const mockUseAlertSeverityCounts = require('@/utils/hooks/useAlertSeverityCounts')
  .useAlertSeverityCounts as jest.MockedFunction<any>;

// Mock useSetErrorInContext
jest.mock('@/components', () => ({
  useSetErrorInContext: jest.fn(),
}));

describe('useAlertNumberTile', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Mock useAlertBadgeError to return no error
    mockUseAlertBadgeError.mockReturnValue(null);

    // Mock useAlertSeverityCounts to return counts
    mockUseAlertSeverityCounts.mockReturnValue({
      critical: 5,
      major: 0,
      minor: 0,
      warning: 0,
      indeterminate: 0,
      informational: 0,
    });
  });
  test('should return the correct props for critical severity', () => {
    const { result } = renderHook(() => useAlertNumberTile('critical'));

    expect(result.current).toEqual({
      number: 5,
      status: 'Critical',
      linkTitle: 'Alerta Web UI',
      link: 'http://cdim-server:8020/alerts?q=severity%3Acritical#status:open',
      linkTarget: '_blank',
      loading: false,
    });
  });

  test('should return the correct props for warning severity', () => {
    const { result } = renderHook(() => useAlertNumberTile('warning'));

    expect(result.current).toEqual({
      number: 0,
      status: 'Warning',
      linkTitle: 'Alerta Web UI',
      link: 'http://cdim-server:8020/alerts?q=severity%3Awarning#status:open',
      linkTarget: '_blank',
      loading: false,
    });
  });

  test('should return the correct props for informational severity', () => {
    const { result } = renderHook(() => useAlertNumberTile('informational'));

    expect(result.current).toEqual({
      number: 0,
      status: undefined,
      linkTitle: 'Alerta Web UI',
      link: 'http://cdim-server:8020/alerts?q=severity%3Ainformational#status:open',
      linkTarget: '_blank',
      loading: false,
    });
  });

  test('should return 0 when severity count is 0', () => {
    // Mock useAlertSeverityCounts to return 0 for all severities
    mockUseAlertSeverityCounts.mockReturnValue({
      critical: 0,
      major: 0,
      minor: 0,
      warning: 0,
      indeterminate: 0,
      informational: 0,
    });

    const { result } = renderHook(() => useAlertNumberTile('critical'));

    expect(result.current.number).toBe(0);
  });

  test('should handle loading state correctly', () => {
    // Mock useAlertSeverityCounts to return undefined (loading state)
    mockUseAlertSeverityCounts.mockReturnValue(undefined);

    const { result } = renderHook(() => useAlertNumberTile('critical'));

    expect(result.current.loading).toBe(true);
    expect(result.current.number).toBeUndefined();
  });

  test('should handle missing severityCounts correctly', () => {
    // Mock useAlertSeverityCounts to return undefined
    mockUseAlertSeverityCounts.mockReturnValue(undefined);

    const { result } = renderHook(() => useAlertNumberTile('critical'));

    expect(result.current.number).toBeUndefined();
  });

  test('should handle error state correctly', () => {
    // Mock useAlertBadgeError to return an error
    mockUseAlertBadgeError.mockReturnValue(new Error('Test error'));

    const { result } = renderHook(() => useAlertNumberTile('critical'));

    expect(result.current.number).toBeUndefined();
    expect(result.current.loading).toBe(false);
  });

  test('should handle empty NEXT_PUBLIC_URL_ALERTA_WEBUI environment variable', () => {
    // Save original env var
    const originalEnv = process.env.NEXT_PUBLIC_URL_ALERTA_WEBUI;

    // Set env var to undefined to test the fallback
    delete process.env.NEXT_PUBLIC_URL_ALERTA_WEBUI;

    const { result } = renderHook(() => useAlertNumberTile('critical'));

    expect(result.current.link).toBe('/alerts?q=severity%3Acritical#status:open');

    // Restore original env var
    if (originalEnv !== undefined) {
      process.env.NEXT_PUBLIC_URL_ALERTA_WEBUI = originalEnv;
    }
  });

  test('should return 0 for missing severity in counts object', () => {
    // Mock useAlertSeverityCounts to return an object without the 'major' severity
    mockUseAlertSeverityCounts.mockReturnValue({
      critical: 5,
      warning: 2,
    });

    const { result } = renderHook(() => useAlertNumberTile('major' as any));

    expect(result.current.number).toBe(0);
  });
});
