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

import { DonutChart } from '@mantine/charts';
import { screen } from '@testing-library/react';

import { render } from '@/shared-modules/__test__/test-utils';
import { PageLink } from '@/shared-modules/components';
import { CHART_COLORS } from '@/shared-modules/constant';
import { formatEnergyValue } from '@/shared-modules/utils';

import { DonutChartTile, DonutChartTileProps } from '@/components';

import { EditModeContext } from '@/pages/home';

jest.mock('@mantine/charts', () => ({
  __esModule: true,
  ...jest.requireActual('@mantine/charts'),
  DonutChart: jest.fn().mockReturnValue(<div data-testid='mockDonutChart'></div>),
}));

jest.mock('@mantine/core', () => ({
  __esModule: true,
  ...jest.requireActual('@mantine/core'),
  LoadingOverlay: ({ visible }: { visible: boolean }) => {
    return visible ? <div data-testid='mockLoading'></div> : null;
  },
}));

jest.mock('@/shared-modules/utils/hooks', () => ({
  ...jest.requireActual('@/shared-modules/utils/hooks'),
  useEnergyDonutChartData: jest.fn(),
}));

jest.mock('@/shared-modules/components/', () => ({
  ...jest.requireActual('@/shared-modules/components/'),
  PageLink: jest.fn().mockImplementation(({ children }) => <div>{children}</div>),
}));

describe('DonutChartTileWithAuth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('Render DonutChartTile', () => {
    const dummyData = [
      { value: 10, name: 'CPU' },
      { value: 15, name: 'memory' },
      { value: 0, name: 'networkInterface' },
      { value: undefined, name: 'Storage' },
    ];
    const props: DonutChartTileProps = {
      title: 'TestDonutChartTile',
      donutChartData: dummyData,
      linkTitle: 'Summary',
      link: '/cdim/res-summary',
      loading: false,
      query: { tab: 'all' },
      valueFormatter: formatEnergyValue,
    };

    render(<DonutChartTile {...props} />);

    const loading = screen.queryByTestId('mockLoading');
    const title = screen.getByRole('heading', { name: 'TestDonutChartTile' });
    const chart = screen.getByTestId('mockDonutChart');
    const legend = chart.nextSibling;

    expect(loading).toBeNull();
    expect(title).toBeVisible();
    expect(chart).toBeVisible();
    expect(legend).toHaveTextContent('CPU');
    expect(legend).toHaveTextContent('memory');
    expect(legend).not.toHaveTextContent('networkInterface');
    expect(legend).not.toHaveTextContent('Storage');

    const chartProps = (DonutChart as unknown as jest.Mock).mock.calls[0][0];
    expect(chartProps.data).toEqual([
      { value: 10, name: 'CPU', color: CHART_COLORS[0] },
      { value: 15, name: 'memory', color: CHART_COLORS[1] },
    ]);
  });

  test('If No Data, render No Data Text', () => {
    const dummyData = [
      { value: 0, name: 'CPU' },
      { value: undefined, name: 'memory' },
      { value: 0, name: 'networkInterface' },
      { value: undefined, name: 'Storage' },
    ];
    const props: DonutChartTileProps = {
      title: 'TestDonutChartTile',
      donutChartData: dummyData,
      linkTitle: 'Summary',
      link: '/cdim/res-summary',
      loading: false,
      query: { tab: 'all' },
      valueFormatter: formatEnergyValue,
    };

    render(<DonutChartTile {...props} />);

    const loading = screen.queryByTestId('mockLoading');
    const title = screen.getByRole('heading', { name: 'TestDonutChartTile' });
    const chart = screen.queryByTestId('mockDonutChart');

    expect(loading).toBeNull();
    expect(title).toBeVisible();
    expect(chart).toBeNull();

    // labels should not be visible
    expect(screen.queryByText('CPU')).toBeNull();
    expect(screen.queryByText('memory')).toBeNull();
    expect(screen.queryByText('networkInterface')).toBeNull();
    expect(screen.queryByText('Storage')).toBeNull();

    const noDataText = screen.getByText('No data');
    expect(noDataText).toBeVisible();
  });

  test('if loading render loading', () => {
    const dummyData = [
      { value: 10, name: 'CPU' },
      { value: 15, name: 'memory' },
      { value: 0, name: 'networkInterface' },
      { value: undefined, name: 'Storage' },
    ];
    const props: DonutChartTileProps = {
      title: 'TestDonutChartTile',
      donutChartData: dummyData,
      linkTitle: 'Summary',
      link: '/cdim/res-summary',
      loading: true,
      query: { tab: 'all' },
      valueFormatter: formatEnergyValue,
    };

    render(<DonutChartTile {...props} />);

    const loading = screen.getByTestId('mockLoading');

    expect(loading).toBeVisible();
  });

  test('Render DonutChartTile with edit mode', () => {
    const dummyData = [
      { value: 10, name: 'CPU' },
      { value: 15, name: 'memory' },
      { value: 0, name: 'networkInterface' },
      { value: undefined, name: 'Storage' },
    ];
    const props: DonutChartTileProps = {
      title: 'TestDonutChartTile',
      donutChartData: dummyData,
      linkTitle: 'Summary',
      link: '/cdim/res-summary',
      loading: false,
      query: { tab: 'all' },
      valueFormatter: formatEnergyValue,
    };

    render(
      <EditModeContext.Provider value={true}>
        <DonutChartTile {...props} />
      </EditModeContext.Provider>
    );

    const chartProps = (PageLink as jest.Mock).mock.calls[0][0];
    expect(chartProps.path).toBeUndefined();
  });

  test('Render DonutChartTile with reference mode', () => {
    const dummyData = [
      { value: 10, name: 'CPU' },
      { value: 15, name: 'memory' },
      { value: 0, name: 'networkInterface' },
      { value: undefined, name: 'Storage' },
    ];
    const props: DonutChartTileProps = {
      title: 'TestDonutChartTile',
      donutChartData: dummyData,
      linkTitle: 'Summary',
      link: '/cdim/res-summary',
      loading: false,
      query: { tab: 'all' },
      valueFormatter: formatEnergyValue,
    };

    render(
      <EditModeContext.Provider value={false}>
        <DonutChartTile {...props} />
      </EditModeContext.Provider>
    );

    const chartProps = (PageLink as jest.Mock).mock.calls[0][0];
    expect(chartProps.path).toBe(props.link);
  });
});
