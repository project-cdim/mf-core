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

import { screen } from '@testing-library/react';

import { render } from '@/shared-modules/__test__/test-utils';
import { GraphViewInner } from '@/shared-modules/components';
import { useGraphViewPropsOfAll } from '@/shared-modules/utils/hooks';

import { AreaChartTile } from '@/components';

import { EditModeContext } from '@/pages/home';

jest.mock('@mantine/core', () => ({
  __esModule: true,
  ...jest.requireActual('@mantine/core'),
}));

jest.mock('@/shared-modules/components', () => ({
  ...jest.requireActual('@/shared-modules/components'),
  GraphViewInner: jest.fn().mockReturnValue(<div data-testid='mockGraphViewInner'></div>),
}));

jest.mock('@/shared-modules/utils/hooks', () => ({
  ...jest.requireActual('@/shared-modules/utils/hooks'),
  useGraphViewPropsOfAll: jest.fn(),
}));

describe('AreaChartTileWithAuth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('render AreaChartTile', () => {
    const dummyData = {
      title: 'title',
      data: [],
      unit: 'unit',
      loading: false,
      linkTitle: 'linkTitle',
      link: 'link',
      query: {},
    };
    (useGraphViewPropsOfAll as jest.Mock).mockReturnValue({
      areaChartProps: dummyData,
      areaChartValidating: false,
    });

    const { container } = render(
      <EditModeContext.Provider value={false}>
        <AreaChartTile deviceType='all' period='month' />
      </EditModeContext.Provider>
    );

    const chart = screen.getByTestId('mockGraphViewInner');
    expect(chart).toBeVisible();
    expect(container).not.toDisplayLoader();

    const chartProps = (GraphViewInner as jest.Mock).mock.calls[0][0];
    expect(chartProps).toEqual(dummyData);
  });

  test('render AreaChartTile with reference mode', () => {
    const dummyData = {
      title: 'title',
      data: [],
      unit: 'unit',
      loading: false,
      linkTitle: 'linkTitle',
      link: 'link',
      query: {},
    };
    (useGraphViewPropsOfAll as jest.Mock).mockReturnValue({
      areaChartProps: dummyData,
      areaChartValidating: false,
    });

    const { container } = render(
      <EditModeContext.Provider value={true}>
        <AreaChartTile deviceType='all' period='month' />
      </EditModeContext.Provider>
    );

    const chart = screen.getByTestId('mockGraphViewInner');
    expect(chart).toBeVisible();
    expect(container).not.toDisplayLoader();

    const chartProps = (GraphViewInner as jest.Mock).mock.calls[0][0];
    expect(chartProps).toEqual({ ...dummyData, link: undefined });
  });

  test('if loading render a loader', () => {
    const dummyData = {
      title: 'title',
      data: [],
      unit: 'unit',
      loading: true,
      linkTitle: 'linkTitle',
      link: 'link',
      query: {},
    };
    (useGraphViewPropsOfAll as jest.Mock).mockReturnValue({
      areaChartProps: dummyData,
      areaChartValidating: true,
    });
    const { container } = render(<AreaChartTile deviceType='all' period='month' />);
    expect(container).toDisplayLoader();
  });
});
