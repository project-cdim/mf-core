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

// home.tsx のテスト
import { act } from 'react';

import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Layout } from 'react-grid-layout';
import { SWRConfig } from 'swr';

import { render } from '@/shared-modules/__test__/test-utils';
import commonDict from '@/shared-modules/public/locales/en/common.json';
import {
  useEnergyDonutChartData,
  useLayoutApplyNumbers,
  useNodeNumbers,
  usePermission,
  useResourceNumbers,
} from '@/shared-modules/utils/hooks';

import { TileDataItem, TileSize } from '@/types/TileData';

import { AddTileModal } from '@/components';

import Home, { getNumberFromEnv, getStaticProps } from '@/pages/home';
import { DEFAULT_LAYOUT, DEFAULT_TILE_DATA, useUserId } from '@/utils/hooks';

jest.mock('@/components/AreaChartTile', () => ({
  __esModule: true,
  AreaChartTile: () => <div data-testid='mockAreaChartTile'>AreaChartTile</div>,
}));
jest.mock('@/components/DonutChartTile', () => ({
  __esModule: true,
  DonutChartTile: () => <div data-testid='mockDonutChartTile'>DonutChartTile</div>,
}));
jest.mock('@/components/ProgressTile', () => ({
  __esModule: true,
  ProgressTile: () => <div data-testid='mockProgressTile'>ProgressTile</div>,
}));
jest.mock('@/components/NumberTile', () => ({
  __esModule: true,
  NumberTile: () => <div data-testid='mockNumberTile'>NumberTile</div>,
}));
jest.mock('@/components/AddTileModal', () => ({
  __esModule: true,
  AddTileModal: jest.fn().mockImplementation(() => <div data-testid='mockAddTileModal'>AddTileModal</div>),
}));

jest.mock('@/shared-modules/utils/hooks', () => ({
  ...jest.requireActual('@/shared-modules/utils/hooks'),
  useNodeNumbers: jest.fn(),
  useResourceNumbers: jest.fn(),
  useLayoutApplyNumbers: jest.fn(),
  useEnergyDonutChartData: jest.fn(),
  usePermission: jest.fn(),
}));

jest.mock('@/utils/hooks', () => ({
  ...jest.requireActual('@/utils/hooks'),
  useUserId: jest.fn().mockReturnValue('mockUserId'),
}));

jest.mock('swr', () => ({
  __esModule: true,
  ...jest.requireActual('swr'),
  SWRConfig: jest.fn().mockImplementation(({ children }) => <>{children}</>),
}));

describe('Home', () => {
  const removeExtraKeyFromLayout = (layout: Layout[]) => {
    const removed = [];
    for (const l of layout) {
      removed.push({ i: l.i, x: l.x, y: l.y, w: l.w, h: l.h });
    }
    return removed;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useNodeNumbers as jest.Mock).mockReset().mockReturnValue({
      nodesAll: 10,
      nodesCritical: 2,
      nodesWarning: 3,
      nodesError: undefined,
      nodesValidation: false,
    });
    (useResourceNumbers as jest.Mock).mockReset().mockReturnValue({
      resourcesAll: 100,
      resourcesOk: 50,
      resourcesUnallocated: 20,
      resourcesAllocated: 25,
      resourcesCritical: 5,
      resourcesWarning: 10,
      resourcesDisabled: 15,
      resourcesAvailable: 30,
      resourcesUnavailable: 40,
      resourcesError: undefined,
      resourcesValidating: false,
    });
    (useLayoutApplyNumbers as jest.Mock).mockReset().mockReturnValue({
      layoutApplyAll: 30,
      layoutApplyFailed: 10,
      layoutApplySuspended: 5,
      layoutApplyError: undefined,
      layoutApplyValidating: false,
    });
    (useEnergyDonutChartData as jest.Mock).mockReset().mockReturnValue({
      donutChartData: undefined,
      donutChartError: undefined,
      donutChartValidating: false,
    });
    (usePermission as jest.Mock).mockReturnValue(true);
  });

  test('should be able to retrieve dictionary using getStaticProps', async () => {
    const locale = 'en';
    const { props } = (await getStaticProps({ locale })) as {
      props: {
        messages: string;
      };
    };
    expect(props.messages).toEqual(commonDict);
  });

  test.each(['1', '1.5'])(
    'if NEXT_PUBLIC_DASHBOARD_INTERVAL_SECONDS is castable to number use it as interval: %s',
    (n) => {
      const envMock = jest.replaceProperty(process, 'env', {
        ...process.env,
        NEXT_PUBLIC_DASHBOARD_INTERVAL_SECONDS: n,
      });
      render(<Home />);
      const swrConfigProps = (SWRConfig as unknown as jest.Mock).mock.calls[0][0];
      const interval = swrConfigProps.value.refreshInterval;
      expect(interval).toBe(parseFloat(n) * 1000);
      envMock.restore();
    }
  );
  test.each(['', undefined, '0'])(
    'if NEXT_PUBLIC_DASHBOARD_INTERVAL_SECONDS is castable to number but zero, use default interval: %s',
    (n) => {
      const envMock = jest.replaceProperty(process, 'env', {
        ...process.env,
        NEXT_PUBLIC_DASHBOARD_INTERVAL_SECONDS: n,
      });
      render(<Home />);
      const swrConfigProps = (SWRConfig as unknown as jest.Mock).mock.calls[0][0];
      const interval = swrConfigProps.value.refreshInterval;
      expect(interval).toBe(60000);
      envMock.restore();
    }
  );

  test.each([undefined, 'dummy'])(
    'if NEXT_PUBLIC_DASHBOARD_INTERVAL_SECONDS is not castable to number use default interval: %s',
    (n) => {
      const envMock = jest.replaceProperty(process, 'env', {
        ...process.env,
        NEXT_PUBLIC_DASHBOARD_INTERVAL_SECONDS: n,
      });
      render(<Home />);
      const swrConfigProps = (SWRConfig as unknown as jest.Mock).mock.calls[0][0];
      const interval = swrConfigProps.value.refreshInterval;
      expect(interval).toBe(60000);
      envMock.restore();
    }
  );

  test('if error contains message, render error with title and message', () => {
    // Need to call useSetErrorInContext under Home Component, so we need to render any of actual component which calls useSetErrorInContext.
    (useNodeNumbers as jest.Mock).mockReturnValue({
      nodesError: { message: 'Title', response: { data: { message: 'Error Message' } } },
      nodesValidation: false,
    });
    render(<Home />);

    const alertDialog: HTMLElement = screen.getByRole('alert');

    const title = within(alertDialog).getByText('Title');
    expect(title).toBeVisible();

    const message = within(alertDialog).getByText('Error Message');
    expect(message).toBeVisible();
  });

  test('if error does not contains message, render error with only title', () => {
    // Need to call useSetErrorInContext under Home Component, so we need to render any of actual component which calls useSetErrorInContext.
    (useNodeNumbers as jest.Mock).mockReturnValue({
      nodesError: { message: 'Title' },
      nodesValidation: false,
    });
    render(<Home />);

    const alertDialog: HTMLElement = screen.getByRole('alert');

    const title = within(alertDialog).getByText('Title');
    expect(title).toBeVisible();

    const message = alertDialog.firstChild?.childNodes[1].childNodes[1];
    expect(message).toBeUndefined();
  });

  test('render tiles', () => {
    render(<Home />);
    expect(screen.getByTestId('mockProgressTile')).toBeVisible();
    expect(screen.getByTestId('mockDonutChartTile')).toBeVisible();
    expect(screen.getByTestId('mockAreaChartTile')).toBeVisible();
    expect(screen.getAllByTestId('mockNumberTile')).toHaveLength(7);
  });

  test('render tiles in edit mode', async () => {
    (usePermission as jest.Mock).mockReturnValue(false);
    render(<Home />);
    await userEvent.click(screen.getByRole('button', { name: 'Edit' }));
    const editing = screen.getByText('Editing');
    await expect(editing).toBeInTheDocument();
    await expect(screen.getByText('Cancel')).toBeInTheDocument();
    await expect(screen.getByText('Add Tile')).toBeInTheDocument();
    // Check that we are in edit mode by verifying the presence of Mantine classes
    const parentElement = editing.parentElement;
    expect(parentElement).toHaveClass('mantine-Group-root');

    // is delete button
    const deleteButton = screen.getAllByTitle('Delete')[0] as HTMLButtonElement;
    await expect(deleteButton).toBeInTheDocument();
  });

  test('save layout', async () => {
    (usePermission as jest.Mock).mockReturnValue(true);
    localStorage.clear();
    const layoutKey = `CDIM.mockUserId.dashboard.layout`;
    const tileDataKey = `CDIM.mockUserId.dashboard.tileData`;

    render(<Home />);

    await userEvent.click(screen.getByRole('button', { name: 'Edit' }));
    await expect(screen.getByText('Editing')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));

    const savedLayout = localStorage.getItem(layoutKey) ?? '';
    const removedLayout = removeExtraKeyFromLayout(JSON.parse(savedLayout));
    // Sort expected layout by y position first, then by x position (same as saveLayout function)
    const sortedDefaultLayout = [...DEFAULT_LAYOUT].sort((a, b) => {
      if (a.y !== b.y) return a.y - b.y;
      return a.x - b.x;
    });
    await expect(removedLayout).toEqual(sortedDefaultLayout);

    const savedTileData = localStorage.getItem(tileDataKey) ?? '';
    await expect(JSON.parse(savedTileData)).toEqual(DEFAULT_TILE_DATA);

    const succeeded = screen.getByText('The dashboard has been successfully saved');
    await expect(succeeded).toBeInTheDocument();
    const deleteSuccessMessageButton = succeeded.closest('div')?.parentElement?.nextSibling as HTMLButtonElement;
    await userEvent.click(deleteSuccessMessageButton);
    await expect(succeeded).not.toBeInTheDocument();
  });

  test('save layout without user id', async () => {
    (useUserId as jest.Mock).mockReturnValue(undefined);
    localStorage.clear();
    const layoutKey = `CDIM.mockUserId.dashboard.layout`;
    const tileDataKey = `CDIM.mockUserId.dashboard.tileData`;

    render(<Home />);

    await userEvent.click(screen.getByRole('button', { name: 'Edit' }));
    await expect(screen.getByText('Editing')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));
    const savedLayout = localStorage.getItem(layoutKey) ?? '';
    await expect(savedLayout).toBe('');

    const savedTileData = localStorage.getItem(tileDataKey) ?? '';
    await expect(savedTileData).toBe('');
  });

  test('cancel edit', async () => {
    localStorage.clear();

    render(<Home />);

    await userEvent.click(screen.getByRole('button', { name: 'Edit' }));
    await expect(screen.getByText('Editing')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    await expect(screen.queryByText('Editing')).not.toBeInTheDocument();
  });

  test('delete tile', async () => {
    (useUserId as jest.Mock).mockReturnValue('mockUserId');
    localStorage.clear();
    (usePermission as jest.Mock).mockReturnValue(false);
    const tileDataKey = `CDIM.mockUserId.dashboard.tileData`;
    expect(localStorage.getItem(tileDataKey)).toBeNull();

    render(<Home />);
    await userEvent.click(screen.getByRole('button', { name: 'Edit' }));
    // is delete button
    const deleteButton = screen.getAllByTitle('Delete')[0] as HTMLButtonElement;
    await expect(deleteButton).toBeInTheDocument();

    // delete
    await userEvent.click(deleteButton);
    // save
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));
    const savedTileData = localStorage.getItem(tileDataKey) ?? '';

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { d001, ...deletedTileData } = DEFAULT_TILE_DATA;
    await expect(JSON.parse(savedTileData)).toEqual(deletedTileData);
  });

  test('add tile', async () => {
    // setup
    (useUserId as jest.Mock).mockReturnValue('mockUserId');
    localStorage.clear();
    (usePermission as jest.Mock).mockReturnValue(false);
    const layoutKey = `CDIM.mockUserId.dashboard.layout`;
    const tileDataKey = `CDIM.mockUserId.dashboard.tileData`;
    expect(localStorage.getItem(tileDataKey)).toBeNull();

    // Mock Date.now() to return a fixed time
    const mockDateNow = jest.spyOn(Date, 'now').mockReturnValue(new Date('2025-01-01T00:00:00').getTime());

    render(<Home />);

    // open AddTileModal
    await userEvent.click(screen.getByRole('button', { name: 'Edit' }));
    expect(screen.getByText('Add Tile')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Add Tile' }));
    expect(screen.getByText('AddTileModal')).toBeInTheDocument();

    // Add new tile
    const submitFunc = (AddTileModal as jest.Mock).mock.calls[0][0].submit;
    expect(submitFunc).toBeDefined();

    const testTileDataItem: TileDataItem = {
      tileType: 'number',
      targetData: 'resource',
      state: 'ok',
    };
    const testTileSize: TileSize = {
      w: 1,
      h: 1,
    };
    const testAddData = {
      tileDataItem: testTileDataItem,
      tileSize: testTileSize,
    };
    act(() => {
      submitFunc(testAddData);
    });

    // check new tile in localStorage
    // save
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));
    // check layout
    const addedLayout = localStorage.getItem(layoutKey) ?? '';
    const layout = removeExtraKeyFromLayout(JSON.parse(addedLayout));
    // Sort expected layout by y position first, then by x position (same as saveLayout function)
    // addTile sets y to 100 for new tiles, but react-grid-layout may adjust it
    const tmpLayout = [...DEFAULT_LAYOUT, { i: 'ruo0', x: 0, y: 6, w: 1, h: 1 }].sort((a, b) => {
      if (a.y !== b.y) return a.y - b.y;
      return a.x - b.x;
    });
    await expect(layout).toEqual(tmpLayout);

    // check tile data
    const addedTileData = localStorage.getItem(tileDataKey) ?? '';
    const tileData = JSON.parse(addedTileData);
    const tmpTileData = { ...DEFAULT_TILE_DATA, ruo0: testTileDataItem };
    await expect(tileData).toEqual(tmpTileData);

    // Restore Date.now()
    mockDateNow.mockRestore();
  });
});

describe('getNumberFromEnv', () => {
  test('is a number', () => {
    const result = getNumberFromEnv('USER_GID');
    expect(result).toBe(1000);
  });

  test('is not a number', () => {
    const result = getNumberFromEnv('NEXT_PUBLIC_URL_RESOURCE');
    expect(result).toBeUndefined();
  });
});
