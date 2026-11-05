/*
 * Copyright 2025-2026 NEC Corporation.
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
import useSWR from 'swr';

import { dummyAllMissing, generateValues, getAPIPromQLbyValues } from '@/utils/dummy-data/PromQL/energyComparison';
import { calcDiffAndRatio, useCompareBarChartData } from '@/utils/hooks';
import { fetcherForPromqlByPost, createPromQLParams } from '@/shared-modules/utils';

jest.mock('swr', () => ({
  __esModule: true,
  default: jest.fn(),
}));
jest.mock('@/shared-modules/utils', () => ({
  parseStringIntoNumber: jest.fn((value: string) => {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? null : parsed; // Return null if it's NaN
  }),
  fetcherForPromqlByPost: jest.fn(),
  createPromQLParams: jest.fn(),
}));

describe('useCompareBarChartData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  test('if fetched monthly data and contains neccesarry data, return parsed data', () => {
    const mockDate = new Date('2023-06-15T12:00:00');
    jest.useFakeTimers({ now: mockDate });
    const dummy56days = getAPIPromQLbyValues(generateValues(56));
    (useSWR as unknown as jest.Mock).mockImplementation(() => ({
      data: dummy56days,
      error: null,
      isValidating: false,
    }));

    const {
      result: {
        current: {
          barChartData,
          barChartError,
          barChartValidating,
          series,
          diff,
          diffPercent,
          lastTotal,
          previousTotal,
        },
      },
    } = renderHook(() => useCompareBarChartData('all', 'month'));

    expect(barChartData.length).toBe(28);
    expect(barChartData[0]).toEqual({
      'Last 4 weeks': 8000,
      'Previous 4 weeks': 10000,
      tooltipLabel: { 'Last 4 weeks': 'Thu, May 18, 2023', 'Previous 4 weeks': 'Thu, Apr 20, 2023' },
      xtics: null,
    });
    expect(barChartError).toBeDefined();
    expect(barChartValidating).toBeDefined();
    expect(series).toStrictEqual([
      { name: 'Previous 4 weeks', color: 'blue.2' },
      { name: 'Last 4 weeks', color: 'blue.6' },
    ]);
    expect(lastTotal).toBe(291200);
    expect(previousTotal).toBe(364000);
    expect(diff).toBe(-72800);
    expect(diffPercent).toBe(-20);
  });

  test('if fetched only previous monthly data and contains neccesarry data, return parsed data', () => {
    const mockDate = new Date('2023-06-15T12:00:00');
    jest.useFakeTimers({ now: mockDate });
    const values56days = generateValues(56);
    const dummyPreviousDays = getAPIPromQLbyValues(values56days.slice(0, 28));
    (useSWR as unknown as jest.Mock).mockImplementation(() => ({
      data: dummyPreviousDays,
      error: null,
      isValidating: false,
    }));

    const {
      result: {
        current: {
          barChartData,
          barChartError,
          barChartValidating,
          series,
          diff,
          diffPercent,
          lastTotal,
          previousTotal,
        },
      },
    } = renderHook(() => useCompareBarChartData('all', 'month'));

    expect(barChartData.length).toBe(28);
    expect(barChartData[0]).toEqual({
      'Last 4 weeks': null,
      'Previous 4 weeks': 10000,
      tooltipLabel: { 'Last 4 weeks': 'Thu, May 18, 2023', 'Previous 4 weeks': 'Thu, Apr 20, 2023' },
      xtics: null,
    });
    expect(barChartError).toBeDefined();
    expect(barChartValidating).toBeDefined();
    expect(series).toStrictEqual([
      { name: 'Previous 4 weeks', color: 'blue.2' },
      { name: 'Last 4 weeks', color: 'blue.6' },
    ]);
    expect(lastTotal).toBeDefined();
    expect(previousTotal).toBeDefined();
    expect(diff).toBeDefined();
    expect(diffPercent).toBeDefined();
  });

  test('if fetched only last monthly data and contains neccesarry data, return parsed data', () => {
    const mockDate = new Date('2023-06-15T12:00:00');
    jest.useFakeTimers({ now: mockDate });
    const values56days = generateValues(56);
    const dummyLastDays = getAPIPromQLbyValues(values56days.slice(28));
    (useSWR as unknown as jest.Mock).mockImplementation(() => ({
      data: dummyLastDays,
      error: null,
      isValidating: false,
    }));

    const {
      result: {
        current: {
          barChartData,
          barChartError,
          barChartValidating,
          series,
          diff,
          diffPercent,
          lastTotal,
          previousTotal,
        },
      },
    } = renderHook(() => useCompareBarChartData('all', 'month'));

    expect(barChartData.length).toBe(28);
    expect(barChartData[0]).toEqual({
      'Last 4 weeks': 8000,
      'Previous 4 weeks': null,
      tooltipLabel: { 'Last 4 weeks': 'Thu, May 18, 2023', 'Previous 4 weeks': 'Thu, Apr 20, 2023' },
      xtics: null,
    });
    expect(barChartError).toBeDefined();
    expect(barChartValidating).toBeDefined();
    expect(series).toStrictEqual([
      { name: 'Previous 4 weeks', color: 'blue.2' },
      { name: 'Last 4 weeks', color: 'blue.6' },
    ]);
    expect(lastTotal).toBeDefined();
    expect(previousTotal).toBeDefined();
    expect(diff).toBeDefined();
    expect(diffPercent).toBeDefined();
  });

  test('if not fetched monthly data(data is undefined), return empty array.', () => {
    (useSWR as unknown as jest.Mock).mockImplementation(() => ({
      data: undefined,
      error: null,
      isValidating: false,
    }));

    const {
      result: {
        current: {
          barChartData,
          barChartError,
          barChartValidating,
          series,
          diff,
          diffPercent,
          lastTotal,
          previousTotal,
        },
      },
    } = renderHook(() => useCompareBarChartData('all', 'month'));

    expect(barChartData).toEqual([]);
    expect(barChartError).toBeDefined();
    expect(barChartValidating).toBeDefined();
    expect(series).toStrictEqual([
      { name: 'Previous 4 weeks', color: 'blue.2' },
      { name: 'Last 4 weeks', color: 'blue.6' },
    ]);
    expect(lastTotal).toBe(null);
    expect(previousTotal).toBe(null);
    expect(diff).toBe(null);
    expect(diffPercent).toBe(null);
  });

  test('if not fetched monthly data(result is empty), return empty array.', () => {
    (useSWR as unknown as jest.Mock).mockImplementation(() => ({
      data: dummyAllMissing,
      error: null,
      isValidating: false,
    }));

    const {
      result: {
        current: {
          barChartData,
          barChartError,
          barChartValidating,
          series,
          diff,
          diffPercent,
          lastTotal,
          previousTotal,
        },
      },
    } = renderHook(() => useCompareBarChartData('all', 'month'));

    expect(barChartData).toEqual([]);
    expect(barChartError).toBeDefined();
    expect(barChartValidating).toBeDefined();
    expect(series).toStrictEqual([
      { name: 'Previous 4 weeks', color: 'blue.2' },
      { name: 'Last 4 weeks', color: 'blue.6' },
    ]);
    expect(lastTotal).toBe(null);
    expect(previousTotal).toBe(null);
    expect(diff).toBe(null);
    expect(diffPercent).toBe(null);
  });

  test.each([
    ['error', false],
    ['error', false],
    [undefined, true],
    [undefined, true],
  ])('if error or loading monthly state not falsy, return value: %o, %o', (error, loading) => {
    (useSWR as unknown as jest.Mock).mockImplementation(() => ({
      data: undefined,
      error: error,
      isValidating: loading,
    }));

    const {
      result: {
        current: { barChartData, barChartError, barChartValidating },
      },
    } = renderHook(() => useCompareBarChartData('all', 'month'));

    expect(barChartData).toEqual([]);
    expect(barChartError).toBe(error);
    expect(barChartValidating).toBe(loading);
  });

  test('if fetched yearly data and contains neccesarry data, return parsed data', () => {
    const mockDate = new Date('2023-06-15T12:00:00');
    jest.useFakeTimers({ now: mockDate });
    const dummy731days = getAPIPromQLbyValues(generateValues(365 * 2 + 1));

    (useSWR as unknown as jest.Mock).mockImplementation(() => ({
      data: dummy731days,
      error: null,
      isValidating: false,
    }));

    const {
      result: {
        current: {
          barChartData,
          barChartError,
          barChartValidating,
          series,
          diff,
          diffPercent,
          lastTotal,
          previousTotal,
        },
      },
    } = renderHook(() => useCompareBarChartData('all', 'year'));

    expect(barChartData.length).toBe(12);
    expect(barChartData[0]).toEqual({
      'Previous 12 months': 215000,
      'Last 12 months': 347600,
      tooltipLabel: { 'Previous 12 months': 'Jun 2021', 'Last 12 months': 'Jun 2022' },
      xtics: 'Jun',
    });
    expect(barChartError).toBeDefined();
    expect(barChartValidating).toBeDefined();
    expect(series).toStrictEqual([
      { name: 'Previous 12 months', color: 'blue.2' },
      { name: 'Last 12 months', color: 'blue.6' },
    ]);
    expect(lastTotal).toBe(3831600);
    expect(previousTotal).toBe(4571000);
    expect(diff).toBe(-739400);
    expect(diffPercent).toBe(-16.175891489827173);
  });

  test('if fetched only previous yearly data and contains neccesarry data, return parsed data', () => {
    const mockDate = new Date('2023-06-15T12:00:00');
    jest.useFakeTimers({ now: mockDate });
    const values731days = generateValues(
      365 * 2 + 1,
      new Date(mockDate.getFullYear(), mockDate.getMonth(), 1, 0, 0, 0)
    );
    // Get the last array of values731days
    const dummyPreviousDays = getAPIPromQLbyValues(values731days.slice(0, 365));

    (useSWR as unknown as jest.Mock).mockImplementation(() => ({
      data: dummyPreviousDays,
      error: null,
      isValidating: false,
    }));

    const {
      result: {
        current: {
          barChartData,
          barChartError,
          barChartValidating,
          series,
          diff,
          diffPercent,
          lastTotal,
          previousTotal,
        },
      },
    } = renderHook(() => useCompareBarChartData('all', 'year'));
    expect(barChartData.length).toBe(12);
    expect(barChartData[0]).toEqual({
      'Previous 12 months': 387000,
      'Last 12 months': null,
      tooltipLabel: { 'Previous 12 months': 'Jun 2021', 'Last 12 months': 'Jun 2022' },
      xtics: 'Jun',
    });
    expect(barChartError).toBeDefined();
    expect(barChartValidating).toBeDefined();
    expect(series).toStrictEqual([
      { name: 'Previous 12 months', color: 'blue.2' },
      { name: 'Last 12 months', color: 'blue.6' },
    ]);
    expect(lastTotal).toBeDefined();
    expect(previousTotal).toBeDefined();
    expect(diff).toBeDefined();
    expect(diffPercent).toBeDefined();
  });

  test('if fetched only last yearly data and contains neccesarry data, return parsed data', () => {
    const mockDate = new Date('2023-06-15T12:00:00');
    jest.useFakeTimers({ now: mockDate });
    const values731days = generateValues(
      365 * 2 + 1,
      new Date(mockDate.getFullYear(), mockDate.getMonth(), 1, 0, 0, 0)
    );
    // Get the last array of values731days
    const dummyLastDays = getAPIPromQLbyValues(values731days.slice(365));

    (useSWR as unknown as jest.Mock).mockImplementation(() => ({
      data: dummyLastDays,
      error: null,
      isValidating: false,
    }));

    const {
      result: {
        current: {
          barChartData,
          barChartError,
          barChartValidating,
          series,
          diff,
          diffPercent,
          lastTotal,
          previousTotal,
        },
      },
    } = renderHook(() => useCompareBarChartData('all', 'year'));
    expect(barChartData.length).toBe(12);
    expect(barChartData[0]).toEqual({
      'Previous 12 months': null,
      'Last 12 months': 311200,
      tooltipLabel: { 'Previous 12 months': 'Jun 2021', 'Last 12 months': 'Jun 2022' },
      xtics: 'Jun',
    });
    expect(barChartError).toBeDefined();
    expect(barChartValidating).toBeDefined();
    expect(series).toStrictEqual([
      { name: 'Previous 12 months', color: 'blue.2' },
      { name: 'Last 12 months', color: 'blue.6' },
    ]);
    expect(lastTotal).toBeDefined();
    expect(previousTotal).toBeDefined();
    expect(diff).toBeDefined();
    expect(diffPercent).toBeDefined();
  });

  test('if not fetched yearly data(data is undefined), return empty array.', () => {
    (useSWR as unknown as jest.Mock).mockImplementation(() => ({
      data: undefined,
      error: null,
      isValidating: false,
    }));

    const {
      result: {
        current: {
          barChartData,
          barChartError,
          barChartValidating,
          series,
          diff,
          diffPercent,
          lastTotal,
          previousTotal,
        },
      },
    } = renderHook(() => useCompareBarChartData('all', 'year'));

    expect(barChartData).toEqual([]);
    expect(barChartError).toBeDefined();
    expect(barChartValidating).toBeDefined();
    expect(series).toStrictEqual([
      { name: 'Previous 12 months', color: 'blue.2' },
      { name: 'Last 12 months', color: 'blue.6' },
    ]);
    expect(lastTotal).toBe(null);
    expect(previousTotal).toBe(null);
    expect(diff).toBe(null);
    expect(diffPercent).toBe(null);
  });

  test('if not fetched yearly data(result is empty), return empty array.', () => {
    (useSWR as unknown as jest.Mock).mockImplementation(() => ({
      data: dummyAllMissing,
      error: null,
      isValidating: false,
    }));

    const {
      result: {
        current: {
          barChartData,
          barChartError,
          barChartValidating,
          series,
          diff,
          diffPercent,
          lastTotal,
          previousTotal,
        },
      },
    } = renderHook(() => useCompareBarChartData('all', 'year'));

    expect(barChartData).toEqual([]);
    expect(barChartError).toBeDefined();
    expect(barChartValidating).toBeDefined();
    expect(series).toStrictEqual([
      { name: 'Previous 12 months', color: 'blue.2' },
      { name: 'Last 12 months', color: 'blue.6' },
    ]);
    expect(lastTotal).toBe(null);
    expect(previousTotal).toBe(null);
    expect(diff).toBe(null);
    expect(diffPercent).toBe(null);
  });
  test.each([
    ['error', false],
    ['error', false],
    [undefined, true],
    [undefined, true],
  ])('if error or loading yearly state not falsy, return value: %o, %o', (error, loading) => {
    (useSWR as unknown as jest.Mock).mockImplementation(() => ({
      data: undefined,
      error: error,
      isValidating: loading,
    }));

    const {
      result: {
        current: { barChartData, barChartError, barChartValidating },
      },
    } = renderHook(() => useCompareBarChartData('all', 'year'));

    expect(barChartData).toEqual([]);
    expect(barChartError).toBe(error);
    expect(barChartValidating).toBe(loading);
  });

  test('if failed parse the value to number, the value treat 0', () => {
    const mockDate = new Date('2023-06-15T12:00:00');
    jest.useFakeTimers({ now: mockDate });
    const dummyData = getAPIPromQLbyValues(generateValues(56).map((value) => [value[0], 'invalid'])); // 'invalid' will cause parseStringIntoNumber to return null
    (useSWR as unknown as jest.Mock).mockImplementation(() => ({
      data: dummyData,
      error: null,
      isValidating: false,
    }));

    const {
      result: {
        current: {
          barChartData,
          barChartError,
          barChartValidating,
          series,
          diff,
          diffPercent,
          lastTotal,
          previousTotal,
        },
      },
    } = renderHook(() => useCompareBarChartData('all', 'year'));

    expect(barChartData.length).toBe(12);
    expect(barChartData[0]).toEqual({
      'Last 12 months': null,
      'Previous 12 months': null,
      tooltipLabel: { 'Last 12 months': 'Jun 2022', 'Previous 12 months': 'Jun 2021' },
      xtics: 'Jun',
    });
    expect(barChartError).toBeDefined();
    expect(barChartValidating).toBeDefined();
    expect(series).toStrictEqual([
      { name: 'Previous 12 months', color: 'blue.2' },
      { name: 'Last 12 months', color: 'blue.6' },
    ]);
    expect(lastTotal).toBe(0);
    expect(previousTotal).toBe(null);
    expect(diff).toBe(null);
    expect(diffPercent).toBe(null);
  });
});

describe('calcDiffAndRatio', () => {
  test('should return correct diff and ratio when both numbers are provided', () => {
    const result = calcDiffAndRatio(10, 5);
    expect(result).toEqual({ diff: 5, ratio: 100 });
  });

  test('should return null diff and ratio when num1 is null', () => {
    const result = calcDiffAndRatio(null, 5);
    expect(result).toEqual({ diff: null, ratio: null });
  });

  test('should return null diff and ratio when num2 is null', () => {
    const result = calcDiffAndRatio(10, null);
    expect(result).toEqual({ diff: null, ratio: null });
  });

  test('should return null diff and ratio when both numbers are null', () => {
    const result = calcDiffAndRatio(null, null);
    expect(result).toEqual({ diff: null, ratio: null });
  });

  test('should return null ratio when num2 is zero', () => {
    const result = calcDiffAndRatio(10, 0);
    expect(result).toEqual({ diff: 10, ratio: null });
  });

  test('should return correct diff and ratio when both numbers are zero', () => {
    const result = calcDiffAndRatio(0, 0);
    expect(result).toEqual({ diff: 0, ratio: null });
  });
});

describe('fetcherForPromqlByPost execution verification', () => {
  test('should call fetcherForPromqlByPost with correct parameters when SWR fetcher is executed', async () => {
    const mockFetcher = jest.fn().mockResolvedValue({
      data: {
        result: [
          {
            values: [
              [1640995200, '100.5'],
              [1641081600, '200.3'],
            ],
          },
        ],
      },
    });

    (fetcherForPromqlByPost as jest.Mock).mockImplementation(mockFetcher);
    (createPromQLParams as jest.Mock).mockReturnValue({
      query: 'test_query',
      start: '2024-01-01T00:00:00.000Z',
      end: '2024-01-02T00:00:00.000Z',
      step: '1d',
    });

    let capturedFetcher: Function | null = null;

    (useSWR as unknown as jest.Mock).mockImplementation((key, fetcher) => {
      capturedFetcher = fetcher;
      return {
        data: {
          data: {
            result: [
              {
                values: [
                  [1640995200, '100.5'],
                  [1641081600, '200.3'],
                ],
              },
            ],
          },
        },
        error: null,
        isValidating: false,
      };
    });

    renderHook(() => useCompareBarChartData('all', 'month'));

    // Execute the captured fetcher function
    const testUrl = 'http://test-url/query_range';
    const testQuery = 'test_query';
    const testStart = '2024-01-01T00:00:00.000Z';
    const testEnd = '2024-01-02T00:00:00.000Z';
    const testStep = '1d';

    await capturedFetcher!([testUrl, testQuery, testStart, testEnd, testStep]);

    // Verify createPromQLParams was called with correct arguments
    expect(createPromQLParams as jest.Mock).toHaveBeenCalledWith(testQuery, testStart, testEnd, testStep);

    // Verify fetcherForPromqlByPost was called with correct arguments
    expect(fetcherForPromqlByPost as jest.Mock).toHaveBeenCalledWith(testUrl, {
      query: 'test_query',
      start: '2024-01-01T00:00:00.000Z',
      end: '2024-01-02T00:00:00.000Z',
      step: '1d',
    });
  });
});
describe('error boundaries and edge cases', () => {
  test('should handle null/undefined data in energy parsing', () => {
    (useSWR as unknown as jest.Mock).mockImplementation(() => ({
      data: {
        data: {
          result: [{ values: null }],
        },
      },
      error: null,
      isValidating: false,
    }));

    const { result } = renderHook(() => useCompareBarChartData('all', 'month'));

    expect(result.current.barChartData).toEqual([]);
    expect(result.current.diff).toBeNull();
    expect(result.current.diffPercent).toBeNull();
  });

  test('should handle empty result array', () => {
    (useSWR as unknown as jest.Mock).mockImplementation(() => ({
      data: {
        data: {
          result: [],
        },
      },
      error: null,
      isValidating: false,
    }));

    const { result } = renderHook(() => useCompareBarChartData('all', 'month'));

    expect(result.current.barChartData).toEqual([]);
    expect(result.current.lastTotal).toBeNull();
    expect(result.current.previousTotal).toBeNull();
  });

  test('should throw error for unsupported period', () => {
    expect(() => {
      renderHook(() => useCompareBarChartData('all', 'day' as any));
    }).toThrow("Period 'day' is not implemented yet");
  });
});
