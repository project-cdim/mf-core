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

import { screen } from '@testing-library/react';

import { render } from '@/shared-modules/__test__/test-utils';
import { usePermission } from '@/shared-modules/utils/hooks';

import { TileDataItem } from '@/types/TileData';

import { AreaChartTile, DonutChartTile, NumberTile, Tile, BarChartTile } from '@/components';

jest.mock('@/shared-modules/utils/hooks', () => ({
  ...jest.requireActual('@/shared-modules/utils/hooks'),
  usePermission: jest.fn(),
}));
jest.mock('@/utils/hooks', () => ({
  ...jest.requireActual('@/utils/hooks'),
  useEnergyDonutChartTile: jest.fn(),
  useLayoutApplyNumberTile: jest.fn(),
  useNodeNumberTile: jest.fn(),
  useResourceNumberTile: jest.fn(),
  useResourceProgressTile: jest.fn(),
  useCompareBarChartTile: jest.fn(),
  useAlertNumberTile: jest.fn(),
}));

jest.mock('@/components', () => ({
  ...jest.requireActual('@/components'),
  BaseTile: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  AreaChartTile: (props: Parameters<typeof AreaChartTile>[0]) => <div>{props.deviceType}</div>,
  DonutChartTile: (props: Parameters<typeof DonutChartTile>[0]) => <div>{props.title}</div>,
  NumberTile: (props: Parameters<typeof NumberTile>[0]) => <div>{props.title}</div>,
  ProgressTile: (props: Parameters<typeof NumberTile>[0]) => <div>{props.title}</div>,
  BarChartTile: (props: Parameters<typeof BarChartTile>[0]) => (
    <div>
      {props.title} {props.subTitle}
    </div>
  ),
  useSetErrorInContext: jest.fn(),
}));

describe('Tile Component', () => {
  const deleteTile = jest.fn();
  beforeEach(() => {
    jest.clearAllMocks();
    (usePermission as jest.Mock).mockReturnValue(true);

    const mockHooks = require('@/utils/hooks');
    mockHooks.useAlertNumberTile.mockReturnValue({
      number: 3,
      status: 'Warning',
      loading: false,
    });
  });

  test('renders NodeNumberTile correctly', async () => {
    const tileData: TileDataItem = {
      tileType: 'number',
      targetData: 'node',
      state: 'all',
    };
    render(<Tile tileData={tileData} deleteTile={deleteTile} />);
    expect(screen.getByText('Total Nodes')).toBeInTheDocument();
  });

  test('renders ResourceNumberTile correctly', () => {
    const tileData: TileDataItem = {
      tileType: 'number',
      targetData: 'resource',
      state: 'all',
    };
    render(<Tile tileData={tileData} deleteTile={deleteTile} />);
    expect(screen.getByText('Total Resources')).toBeInTheDocument();
  });

  test('renders LayoutApplyNumberTile correctly', () => {
    const tileData: TileDataItem = {
      tileType: 'number',
      targetData: 'layout-apply',
      state: 'suspended',
    };
    render(<Tile tileData={tileData} deleteTile={deleteTile} />);
    expect(screen.getByText(/LayoutApplies\.number\s*\n*\(Suspended.status\)/)).toBeInTheDocument();
  });

  test('renders ResourceProgressTile correctly', () => {
    const tileData: TileDataItem = {
      tileType: 'progress',
      targetData: 'resource',
      state: 'allocated',
    };
    render(<Tile tileData={tileData} deleteTile={deleteTile} />);
    expect(screen.getByText('Allocated Resources')).toBeInTheDocument();
  });

  test('renders AreaChartTile correctly', () => {
    const tileData: TileDataItem = {
      tileType: 'area-chart',
      targetData: 'energy-consumptions',
      deviceType: 'all',
      period: 'month',
    };
    render(<Tile tileData={tileData} deleteTile={deleteTile} />);
    expect(screen.getByText('all')).toBeInTheDocument();
  });

  test('renders EnergyDonutChartTile correctly', () => {
    const tileData: TileDataItem = {
      tileType: 'donut-chart',
      targetData: 'energy-consumptions',
      deviceType: 'all',
      period: 'month',
    };
    render(<Tile tileData={tileData} deleteTile={deleteTile} />);
    expect(screen.getByText(/Energy Consumptions ratio by type\s*\(The past month\)/)).toBeInTheDocument();
  });

  test('renders CompareBarChartTile for year correctly', () => {
    const tileData: TileDataItem = {
      tileType: 'bar-chart',
      targetData: 'energy-consumptions',
      deviceType: 'all',
      period: 'year',
    };
    render(<Tile tileData={tileData} deleteTile={deleteTile} />);
    expect(screen.getByText('Energy Consumptions Year comparison')).toBeInTheDocument();
  });

  test('renders CompareBarChartTile for 28days correctly', () => {
    const tileData: TileDataItem = {
      tileType: 'bar-chart',
      targetData: 'energy-consumptions',
      deviceType: 'all',
      period: 'month',
    };
    render(<Tile tileData={tileData} deleteTile={deleteTile} />);
    expect(screen.getByText('Energy Consumptions 4 weeks comparison')).toBeInTheDocument();
  });

  test('renders Not Found for unknown tile type', () => {
    const tileData = {
      tileType: 'unknown',
    };
    render(<Tile tileData={tileData as TileDataItem} deleteTile={deleteTile} />);
    expect(screen.getByText('Not Found')).toBeInTheDocument();
  });

  test('renders AlertNumberTile correctly', () => {
    const tileData: TileDataItem = {
      tileType: 'number',
      targetData: 'alert',
      severity: 'critical',
    };
    render(<Tile tileData={tileData} deleteTile={deleteTile} />);
    expect(screen.getByText(/Alerts\s*\(Critical\)/)).toBeInTheDocument();
  });

  // Test different alert severities
  test('renders AlertNumberTile with major severity', () => {
    const tileData: TileDataItem = {
      tileType: 'number',
      targetData: 'alert',
      severity: 'major',
    };
    render(<Tile tileData={tileData} deleteTile={deleteTile} />);
    expect(screen.getByText(/Alerts\s*\(Major\)/)).toBeInTheDocument();
  });

  test('renders AlertNumberTile with warning severity', () => {
    const tileData: TileDataItem = {
      tileType: 'number',
      targetData: 'alert',
      severity: 'warning',
    };
    render(<Tile tileData={tileData} deleteTile={deleteTile} />);
    expect(screen.getByText(/Alerts\s*\(Warning\)/)).toBeInTheDocument();
  });

  test('renders AlertNumberTile with informational severity', () => {
    const tileData: TileDataItem = {
      tileType: 'number',
      targetData: 'alert',
      severity: 'informational',
    };
    render(<Tile tileData={tileData} deleteTile={deleteTile} />);
    expect(screen.getByText(/Alerts\s*\(Informational\)/)).toBeInTheDocument();
  });

  test('renders AlertNumberTile with minor severity', () => {
    const tileData: TileDataItem = {
      tileType: 'number',
      targetData: 'alert',
      severity: 'minor',
    };
    render(<Tile tileData={tileData} deleteTile={deleteTile} />);
    expect(screen.getByText(/Alerts\s*\(Minor\)/)).toBeInTheDocument();
  });

  test('renders AlertNumberTile with indeterminate severity', () => {
    const tileData: TileDataItem = {
      tileType: 'number',
      targetData: 'alert',
      severity: 'indeterminate',
    };
    render(<Tile tileData={tileData} deleteTile={deleteTile} />);
    expect(screen.getByText(/Alerts\s*\(Indeterminate\)/)).toBeInTheDocument();
  });

  describe('number tile - resource states', () => {
    test.each([
      'ok',
      'critical',
      'warning',
      'unallocated',
      'designAvailable',
      'designUnavailable',
      'maintenance',
    ] as const)('renders ResourceNumberTile with state "%s"', (state) => {
      const tileData: TileDataItem = {
        tileType: 'number',
        targetData: 'resource',
        state: state,
      };
      render(<Tile tileData={tileData} deleteTile={deleteTile} />);

      const expectedTitles = {
        ok: 'Healthy Resources',
        critical: 'Critical Resources',
        warning: 'Warning Resources',
        unallocated: 'Unallocated Resources',
        designAvailable: 'Design Available Resources',
        designUnavailable: 'Design Unavailable Resources',
        maintenance: 'Maintenance Resources',
      };
      expect(screen.getByText(expectedTitles[state])).toBeInTheDocument();
    });
  });

  describe('number tile - unknown targetData', () => {
    test('renders Not Found for unknown targetData', () => {
      const tileData = {
        tileType: 'number',
        targetData: 'unknown',
        state: 'all',
      };
      render(<Tile tileData={tileData as TileDataItem} deleteTile={deleteTile} />);
      expect(screen.getByText('Not Found')).toBeInTheDocument();
    });
  });
});
