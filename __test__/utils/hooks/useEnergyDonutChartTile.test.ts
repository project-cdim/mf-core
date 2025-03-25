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

import { formatEnergyValue } from '@/shared-modules/utils';
import { useEnergyDonutChartData } from '@/shared-modules/utils/hooks';

import { useEnergyDonutChartTile } from '@/utils/hooks';

jest.mock('@/shared-modules/utils/hooks', () => ({
  ...jest.requireActual('@/shared-modules/utils/hooks'),
  useEnergyDonutChartData: jest.fn(),
}));

describe('useEnergyDonutChartTile', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('useEnergyDonutChartData', () => {
    (useEnergyDonutChartData as jest.Mock).mockReturnValue({
      donutChartData: [],
      donutChartValidating: false,
      donutChartError: null,
    });

    const { result } = renderHook(() => useEnergyDonutChartTile());

    expect(result.current.donutChartData).toEqual([]);
    expect(result.current.linkTitle).toBe('Summary');
    expect(result.current.link).toBe('/cdim/res-summary');
    expect(result.current.loading).toBe(false);
    expect(result.current.query).toEqual({ tab: 'all' });
    expect(result.current.valueFormatter).toBe(formatEnergyValue);
  });
});
