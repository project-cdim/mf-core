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

import { BarChart } from '@mantine/charts';
import { screen } from '@testing-library/react';

import { render } from '@/shared-modules/__test__/test-utils';
import { PageLink } from '@/shared-modules/components';
import { formatEnergyValue } from '@/shared-modules/utils';

import { BarChartTile, BarChartTileProps, formatEnergyValueWithPrefix } from '@/components';

import { EditModeContext } from '@/app/[lng]/home/HomeContent';
import { compareBarChartDataType } from '@/utils/hooks';

jest.mock('@mantine/charts', () => ({
  __esModule: true,
  ...jest.requireActual('@mantine/charts'),
  BarChart: jest.fn().mockReturnValue(<div data-testid='mockBarChart'></div>),
}));

jest.mock('@/utils/hooks', () => ({
  ...jest.requireActual('@/utils/hooks'),
  useCompareBarChartData: jest.fn(),
}));

jest.mock('@/shared-modules/components/', () => ({
  ...jest.requireActual('@/shared-modules/components/'),
  PageLink: jest.fn().mockImplementation(({ children }) => <div>{children}</div>),
}));

describe('BarChartTileWithAuth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('Render BarChartTile', () => {
    const dummyData: compareBarChartDataType = [
      { last: 15, previous: 25, tooltipLabel: {}, xtics: null },
      { last: 20, previous: 30, tooltipLabel: {}, xtics: null },
      { last: 10, previous: 20, tooltipLabel: {}, xtics: null },
    ];
    const props: BarChartTileProps = {
      title: 'TestBarChartTile',
      subTitle: 'TestSubTitle',
      barChartData: dummyData,
      linkTitle: 'Summary',
      link: '/cdim/res-summary',
      loading: false,
      query: { tab: 'all' },
      valueFormatter: formatEnergyValue,
      series: [
        { name: 'previous', color: 'blue.2' },
        { name: 'last', color: 'blue.6' },
      ],
      diff: 10,
      diffPercent: 20,
      lastTotal: 100,
      previousTotal: 90,
    };

    render(<BarChartTile {...props} />);

    const title = screen.getByRole('heading', { name: 'TestBarChartTile' });
    const subTitle = screen.getByText('TestSubTitle');
    const chart = screen.getByTestId('mockBarChart');
    const diff = screen.getByText('(+10 Wh)');
    const diffPercent = screen.getByText('+20.00 %');
    const previousTotal = screen.getByText('previous : 90 Wh');
    const lastTotal = screen.getByText('last : 100 Wh');

    expect(title).toBeVisible();
    expect(subTitle).toBeVisible();
    expect(chart).toBeVisible();
    expect(diff).toBeVisible();
    expect(diffPercent).toBeVisible();
    expect(previousTotal).toBeVisible();
    expect(lastTotal).toBeVisible();

    const chartProps = (BarChart as unknown as jest.Mock).mock.calls[0][0];
    expect(chartProps.data).toEqual([
      { last: 15, previous: 25, tooltipLabel: {}, xtics: null },
      { last: 20, previous: 30, tooltipLabel: {}, xtics: null },
      { last: 10, previous: 20, tooltipLabel: {}, xtics: null },
    ]);
  });

  test('If same data, display +- 0 sign', () => {
    const dummyData = [
      { last: 10, previous: 10, tooltipLabel: {}, xtics: null },
      { last: 15, previous: 15, tooltipLabel: {}, xtics: null },
      { last: 20, previous: 20, tooltipLabel: {}, xtics: null },
    ];
    const props: BarChartTileProps = {
      title: 'TestBarChartTile',
      subTitle: 'TestSubTitle',
      barChartData: dummyData,
      linkTitle: 'Summary',
      link: '/cdim/res-summary',
      loading: false,
      query: { tab: 'all' },
      valueFormatter: formatEnergyValue,
      series: [
        { name: 'previous', color: 'blue.2' },
        { name: 'last', color: 'blue.6' },
      ],
      diff: 0,
      diffPercent: 0,
      lastTotal: 100,
      previousTotal: 90,
    };

    render(<BarChartTile {...props} />);

    const title = screen.getByRole('heading', { name: 'TestBarChartTile' });
    const subTitle = screen.getByText('TestSubTitle');
    const chart = screen.getByTestId('mockBarChart');
    const diff = screen.getByText('(±0 Wh)');
    const diffPercent = screen.getByText('±0.00 %');
    const previousTotal = screen.getByText('previous : 90 Wh');
    const lastTotal = screen.getByText('last : 100 Wh');

    expect(title).toBeVisible();
    expect(subTitle).toBeVisible();
    expect(chart).toBeVisible();
    expect(diff).toBeVisible();
    expect(diffPercent).toBeVisible();
    expect(previousTotal).toBeVisible();
    expect(lastTotal).toBeVisible();
  });

  test('If No Data, render No Data Text', () => {
    const dummyData: compareBarChartDataType = [];
    const props: BarChartTileProps = {
      title: 'TestBarChartTile',
      subTitle: 'TestSubTitle',
      barChartData: dummyData,
      linkTitle: 'Summary',
      link: '/cdim/res-summary',
      loading: false,
      query: { tab: 'all' },
      valueFormatter: formatEnergyValue,
      series: [
        { name: 'previous', color: 'blue.2' },
        { name: 'last', color: 'blue.6' },
      ],
      diff: null,
      diffPercent: null,
      lastTotal: null,
      previousTotal: null,
    };

    render(<BarChartTile {...props} />);

    const title = screen.getByRole('heading', { name: 'TestBarChartTile' });
    const subTitle = screen.getByText('TestSubTitle');
    const chart = screen.queryByTestId('mockBarChart');

    const diff = screen.queryByText('(- Wh)');
    const diffPercent = screen.queryByText('- %');
    const previousTotal = screen.queryByText('previous : - Wh');
    const lastTotal = screen.queryByText('last : - Wh');

    expect(title).toBeVisible();
    expect(subTitle).toBeVisible();
    expect(chart).toBeNull();

    expect(diff).toBeNull();
    expect(diffPercent).toBeNull();
    expect(previousTotal).toBeNull();
    expect(lastTotal).toBeNull();

    const noDataText = screen.getByText('No data');
    expect(noDataText).toBeVisible();
  });

  test('if loading render loading', () => {
    const dummyData = [
      { last: 10, previous: 20, tooltipLabel: {}, xtics: null },
      { last: 15, previous: 25, tooltipLabel: {}, xtics: null },
      { last: 20, previous: 30, tooltipLabel: {}, xtics: null },
    ];
    const props: BarChartTileProps = {
      title: 'TestBarChartTile',
      subTitle: 'TestSubTitle',
      barChartData: dummyData,
      linkTitle: 'Summary',
      link: '/cdim/res-summary',
      loading: true,
      query: { tab: 'all' },
      valueFormatter: formatEnergyValue,
      series: [
        { name: 'previous', color: 'blue.2' },
        { name: 'last', color: 'blue.6' },
      ],
      diff: null,
      diffPercent: null,
      lastTotal: null,
      previousTotal: null,
    };

    const { container } = render(<BarChartTile {...props} />);

    expect(container.querySelector('.mantine-Indicator-indicator')).toBeInTheDocument();
  });

  test('Render BarChartTile with edit mode', () => {
    const dummyData = [
      { last: 10, previous: 20, tooltipLabel: {}, xtics: null },
      { last: 15, previous: 25, tooltipLabel: {}, xtics: null },
      { last: 20, previous: 30, tooltipLabel: {}, xtics: null },
    ];
    const props: BarChartTileProps = {
      title: 'TestBarChartTile',
      subTitle: 'TestSubTitle',
      barChartData: dummyData,
      linkTitle: 'Summary',
      link: '/cdim/res-summary',
      loading: true,
      query: { tab: 'all' },
      valueFormatter: formatEnergyValue,
      series: [
        { name: 'previous', color: 'blue.2' },
        { name: 'last', color: 'blue.6' },
      ],
      diff: null,
      diffPercent: null,
      lastTotal: null,
      previousTotal: null,
    };

    render(
      <EditModeContext.Provider value={true}>
        <BarChartTile {...props} />
      </EditModeContext.Provider>
    );

    const chartProps = (PageLink as jest.Mock).mock.calls[0][0];
    expect(chartProps.path).toBeUndefined();
  });

  test('Render BarChartTile with reference mode', () => {
    const dummyData = [
      { last: 10, previous: 20, tooltipLabel: {}, xtics: null },
      { last: 15, previous: 25, tooltipLabel: {}, xtics: null },
      { last: 20, previous: 30, tooltipLabel: {}, xtics: null },
    ];
    const props: BarChartTileProps = {
      title: 'TestBarChartTile',
      subTitle: 'TestSubTitle',
      barChartData: dummyData,
      linkTitle: 'Summary',
      link: '/cdim/res-summary',
      loading: true,
      query: { tab: 'all' },
      valueFormatter: formatEnergyValue,
      series: [
        { name: 'previous', color: 'blue.2' },
        { name: 'last', color: 'blue.6' },
      ],
      diff: null,
      diffPercent: null,
      lastTotal: null,
      previousTotal: null,
    };

    render(
      <EditModeContext.Provider value={false}>
        <BarChartTile {...props} />
      </EditModeContext.Provider>
    );

    const chartProps = (PageLink as jest.Mock).mock.calls[0][0];
    expect(chartProps.path).toBe(props.link);
  });

  test('Render BarChart Tooltips', () => {
    const dummyData: compareBarChartDataType = [
      { last: 10, previous: 20, tooltipLabel: { last: '2024/12/31', previous: '2024/11/30' }, xtics: null },
      { last: 15, previous: 25, tooltipLabel: { last: '2024/12/30', previous: '2024/11/29' }, xtics: null },
      { last: 20, previous: 30, tooltipLabel: { last: '2024/12/29', previous: '2024/11/28' }, xtics: null },
    ];
    const props: BarChartTileProps = {
      title: 'TestBarChartTile',
      subTitle: 'TestSubTitle',
      barChartData: dummyData,
      linkTitle: 'Summary',
      link: '/cdim/res-summary',
      loading: false,
      query: { tab: 'all' },
      valueFormatter: formatEnergyValue,
      series: [
        { name: 'previous', color: 'blue.2' },
        { name: 'last', color: 'blue.6' },
      ],
      diff: 10,
      diffPercent: 20,
      lastTotal: 100,
      previousTotal: 90,
    };

    render(<BarChartTile {...props} />);

    const chartProps = (BarChart as unknown as jest.Mock).mock.calls[0][0];
    const tooltipRenderer = chartProps.tooltipProps.content;
    const payload = [
      {
        className: 'mantine-BarChart-bar',
        style: {},
        name: 'previouse',
        fill: 'var(--mantine-color-blue-2)',
        stroke: 'var(--mantine-color-blue-2)',
        fillOpacity: 1,
        strokeOpacity: 0,
        dataKey: 'previouse',
        color: 'var(--mantine-color-blue-2)',
        value: '4.581423611111111',
        payload: {
          tooltipLabel: {
            last: '2025/01/13',
            previouse: '2024/12/16',
          },
          xtics: null,
          previouse: '4.581423611111111',
          last: '4.644328703703704',
        },
        hide: false,
      },
      {
        className: 'mantine-BarChart-bar',
        style: {},
        name: 'last',
        fill: 'var(--mantine-color-blue-6)',
        stroke: 'var(--mantine-color-blue-6)',
        fillOpacity: 1,
        strokeOpacity: 0,
        dataKey: 'last',
        color: 'var(--mantine-color-blue-6)',
        value: '4.644328703703704',
        payload: {
          tooltipLabel: {
            last: '2025/01/13',
            previouse: '2024/12/16',
          },
          xtics: null,
          previouse: '4.581423611111111',
          last: '4.644328703703704',
        },
        hide: false,
      },
    ];
    render(tooltipRenderer({ payload: payload }));

    expect(screen.getByText('2024/12/16')).toBeVisible();
    expect(screen.getByText('4.58 Wh')).toBeVisible();
    expect(screen.getByText('2025/01/13')).toBeVisible();
    expect(screen.getByText('4.64 Wh')).toBeVisible();
  });

  test('Render BarChart Tooltips no dataKey', () => {
    const dummyData = [
      { last: 10, previous: 20, tooltipLabel: { last: '2024/12/31', previous: '2024/11/30' }, xtics: null },
      { last: 15, previous: 25, tooltipLabel: { last: '2024/12/30', previous: '2024/11/29' }, xtics: null },
      { last: 20, previous: 30, tooltipLabel: { last: '2024/12/29', previous: '2024/11/28' }, xtics: null },
    ];
    const props: BarChartTileProps = {
      title: 'TestBarChartTile',
      subTitle: 'TestSubTitle',
      barChartData: dummyData,
      linkTitle: 'Summary',
      link: '/cdim/res-summary',
      loading: false,
      query: { tab: 'all' },
      valueFormatter: formatEnergyValue,
      series: [
        { name: 'previous', color: 'blue.2' },
        { name: 'last', color: 'blue.6' },
      ],
      diff: 10,
      diffPercent: 20,
      lastTotal: 100,
      previousTotal: 90,
    };

    render(<BarChartTile {...props} />);

    const chartProps = (BarChart as unknown as jest.Mock).mock.calls[0][0];
    const tooltipRenderer = chartProps.tooltipProps.content;
    const payload = [
      {
        className: 'mantine-BarChart-bar',
        style: {},
        name: 'previouse',
        fill: 'var(--mantine-color-blue-2)',
        stroke: 'var(--mantine-color-blue-2)',
        fillOpacity: 1,
        strokeOpacity: 0,
        // dataKey: 'previouse',
        color: 'var(--mantine-color-blue-2)',
        value: '4.581423611111111',
        payload: {
          tooltipLabel: {
            last: '2025/01/13',
            previouse: '2024/12/16',
          },
          xtics: null,
          previouse: '4.581423611111111',
          last: '4.644328703703704',
        },
        hide: false,
      },
      {
        className: 'mantine-BarChart-bar',
        style: {},
        name: 'last',
        fill: 'var(--mantine-color-blue-6)',
        stroke: 'var(--mantine-color-blue-6)',
        fillOpacity: 1,
        strokeOpacity: 0,
        dataKey: 'last',
        color: 'var(--mantine-color-blue-6)',
        value: '4.644328703703704',
        payload: {
          tooltipLabel: {
            last: '2025/01/13',
            previouse: '2024/12/16',
          },
          xtics: null,
          previouse: '4.581423611111111',
          last: '4.644328703703704',
        },
        hide: false,
      },
    ];
    render(tooltipRenderer({ payload: payload }));
    expect(screen.queryByText('2024/12/16')).toBeNull();
    expect(screen.getByText('4.58 Wh')).toBeVisible();
    expect(screen.getByText('2025/01/13')).toBeVisible();
    expect(screen.getByText('4.64 Wh')).toBeVisible();
  });
});

describe('formatEnergyValueWithPrefix function', () => {
  test('should format no prefix', () => {
    const value = 150000;
    const formattedValue = formatEnergyValueWithPrefix(value);
    expect(formattedValue).toBe('150.00 kWh');
  });

  test('should format kilo prefix', () => {
    const value = 150000;
    const formattedValue = formatEnergyValueWithPrefix(value, 'M');
    expect(formattedValue).toBe('0.15 MWh');
  });

  test('should format undefined and null correctly', () => {
    expect(formatEnergyValue(undefined)).toBe('- Wh');
    expect(formatEnergyValue(null)).toBe('- Wh');
  });
});
