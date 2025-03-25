/*
 * Copyright 2025 NEC Corporation.
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

import { ErrorsContext } from '@/components';

import { useUserId } from '@/utils/hooks';
import { DEFAULT_LAYOUT, DEFAULT_TILE_DATA, useGetLayout } from '@/utils/hooks/useGetLayout';

jest.mock('@/utils/hooks', () => ({
  useUserId: jest.fn(),
}));

describe('useGetLayout', () => {
  const setErrorMessages = jest.fn();

  beforeEach(() => {
    (useUserId as jest.Mock).mockReturnValue('testUserId');
    localStorage.clear();
    jest.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <ErrorsContext.Provider value={[[], setErrorMessages]}>{children}</ErrorsContext.Provider>
  );

  test('should return default layout and tile data when no local storage data is present', () => {
    const { result } = renderHook(() => useGetLayout(), { wrapper });

    expect(result.current[0]).toEqual(DEFAULT_LAYOUT);
    expect(result.current[1]).toEqual(DEFAULT_TILE_DATA);
  });

  test('should load layout and tile data from local storage if present', () => {
    const mockLayout = JSON.stringify([{ i: 'd011', x: 0, y: 0, w: 1, h: 1 }]);
    const mockTileData = JSON.stringify({ d011: { tileType: 'number', targetData: 'test', state: 'test' } });

    localStorage.setItem('CDIM.testUserId.dashboard.layout', mockLayout);
    localStorage.setItem('CDIM.testUserId.dashboard.tileData', mockTileData);

    const { result } = renderHook(() => useGetLayout(), { wrapper });

    expect(result.current[0]).toEqual(JSON.parse(mockLayout));
    expect(result.current[1]).toEqual(JSON.parse(mockTileData));
  });

  test('should handle errors and set error messages when local storage data is invalid', () => {
    localStorage.setItem('CDIM.testUserId.dashboard.layout', 'invalid layout');
    localStorage.setItem('CDIM.testUserId.dashboard.tileData', 'invalid tileData');

    renderHook(() => useGetLayout(), { wrapper });

    expect(setErrorMessages).toHaveBeenCalledWith(expect.any(Function));

    const updateFunction = setErrorMessages.mock.calls[0][0]; // Get the updater function
    const prevErrors: never[] = [];
    const newErrors = updateFunction(prevErrors); // Execute the function with previous state

    expect(newErrors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          title: 'Failed to get the dashboard data',
          message: expect.any(String),
          apiName: 'get',
        }),
      ])
    );
  });
  test('should remove errors with apiName "get" from error messages', () => {
    (useUserId as jest.Mock).mockReturnValue('testUserId');
    localStorage.setItem('CDIM.testUserId.dashboard.layout', JSON.stringify(DEFAULT_LAYOUT));
    localStorage.setItem('CDIM.testUserId.dashboard.tileData', JSON.stringify(DEFAULT_TILE_DATA));

    const previousErrors = [
      { title: 'Some error', message: 'An error occurred', apiName: 'get' },
      { title: 'Another error', message: 'Another error occurred', apiName: 'other' },
    ];

    const setErrorMessages = jest.fn();
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ErrorsContext.Provider value={[previousErrors, setErrorMessages]}>{children}</ErrorsContext.Provider>
    );

    renderHook(() => useGetLayout(), { wrapper });

    expect(setErrorMessages).toHaveBeenCalledWith(expect.any(Function));

    const updateFunction = setErrorMessages.mock.calls[0][0];
    const newErrors = updateFunction(previousErrors);

    expect(newErrors).toEqual([{ title: 'Another error', message: 'Another error occurred', apiName: 'other' }]);
  });
  test('should handle errors when error.message is undefined', () => {
    // Mock JSON.parse to throw an error with undefined message
    jest.spyOn(JSON, 'parse').mockImplementation(() => {
      throw { message: undefined }; // throw an error with undefined message
    });

    localStorage.setItem('CDIM.testUserId.dashboard.layout', 'invalid json');
    localStorage.setItem('CDIM.testUserId.dashboard.tileData', 'invalid json');

    renderHook(() => useGetLayout(), { wrapper });

    expect(setErrorMessages).toHaveBeenCalledWith(expect.any(Function));

    const updateFunction = setErrorMessages.mock.calls[0][0];
    const prevErrors: never[] = [];
    const newErrors = updateFunction(prevErrors);

    expect(newErrors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          title: 'Failed to get the dashboard data',
          message: '', // Verify that the message is an empty string when error.message is undefined
          apiName: 'get',
        }),
      ])
    );

    // Restore the mock of JSON.parse
    (JSON.parse as jest.Mock).mockRestore();
  });
});
