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

// Mock useAlertNumberData
jest.mock('@/utils/hooks/useAlertNumberData');

const mockUseAlertNumberData = require('@/utils/hooks/useAlertNumberData')
  .useAlertNumberData as jest.MockedFunction<any>;

// Mock useSetErrorInContext
jest.mock('@/components', () => ({
  useSetErrorInContext: jest.fn(),
}));

describe('useAlertNumberTile', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    mockUseAlertNumberData.mockReturnValue({
      alertError: null,
      alertValidating: false,
      getAlertCount: jest.fn((severity: string) => {
        const severityCounts: Record<string, number> = {
          critical: 5,
          major: 0,
          minor: 0,
          warning: 0,
          indeterminate: 0,
          informational: 0,
        };
        return severityCounts[severity] || 0;
      }),
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
      status: 'Critical',
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
      status: 'Critical',
      linkTitle: 'Alerta Web UI',
      link: 'http://cdim-server:8020/alerts?q=severity%3Ainformational#status:open',
      linkTarget: '_blank',
      loading: false,
    });
  });

  test('should return 0 when data is null', () => {
    // Mock useAlertNumberData to return getAlertCount that returns 0
    mockUseAlertNumberData.mockReturnValue({
      alertError: null,
      alertValidating: false,
      getAlertCount: jest.fn(() => 0),
    });

    const { result } = renderHook(() => useAlertNumberTile('critical'));

    expect(result.current.number).toBe(0);
  });

  test('should handle loading state correctly', () => {
    // Mock useAlertNumberData to return validating state
    mockUseAlertNumberData.mockReturnValue({
      alertError: null,
      alertValidating: true,
      getAlertCount: jest.fn(() => 5),
    });

    const { result } = renderHook(() => useAlertNumberTile('critical'));

    expect(result.current.loading).toBe(true);
  });

  test('should handle missing severityCounts correctly', () => {
    // Mock useAlertNumberData to return getAlertCount that returns 0 for missing data
    mockUseAlertNumberData.mockReturnValue({
      alertError: null,
      alertValidating: false,
      getAlertCount: jest.fn(() => 0),
    });

    const { result } = renderHook(() => useAlertNumberTile('critical'));

    expect(result.current.number).toBe(0);
  });

  test('should handle empty NEXT_PUBLIC_URL_ALERTA_WEBUI environment variable', () => {
    // Save original env var
    const originalEnv = process.env.NEXT_PUBLIC_URL_ALERTA_WEBUI;

    // Set env var to undefined to test the fallback (covers line 50)
    delete process.env.NEXT_PUBLIC_URL_ALERTA_WEBUI;

    mockUseAlertNumberData.mockReturnValue({
      alertError: null,
      alertValidating: false,
      getAlertCount: jest.fn(() => 5),
    });

    const { result } = renderHook(() => useAlertNumberTile('critical'));

    expect(result.current.link).toBe('/alerts?q=severity%3Acritical#status:open');

    // Restore original env var
    if (originalEnv !== undefined) {
      process.env.NEXT_PUBLIC_URL_ALERTA_WEBUI = originalEnv;
    }
  });
});
