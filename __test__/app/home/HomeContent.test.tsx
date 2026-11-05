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

import { act, useContext, useEffect } from 'react';

import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Layout } from 'react-grid-layout';
import { SWRConfig } from 'swr';

import { render } from '@/shared-modules/__test__/test-utils';
import {
  useEnergyDonutChartData,
  useLayoutApplyNumbers,
  useNodeNumbers,
  usePermission,
  useResourceNumbers,
} from '@/shared-modules/utils/hooks';

import { TileDataItem, TileSize } from '@/types/TileData';

import { AddTileModal, ErrorsContext, ErrorsContextProvider } from '@/components';

import Home, { CancelButton, EditModeContext, ErrorMessages, SaveButton } from '@/app/[lng]/home/HomeContent';

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
  useMSW: jest.fn(),
}));

jest.mock('@/utils/hooks', () => ({
  ...jest.requireActual('@/utils/hooks'),
  useUserId: jest.fn().mockReturnValue('mockUserId'),
}));

jest.mock('swr', () => ({
  __esModule: true,
  ...jest.requireActual('swr'),
  SWRConfig: jest.fn().mockImplementation(({ children }: any) => <>{children}</>),
}));

global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
  })
) as jest.Mock;

const mockXHR = { open: jest.fn(), send: jest.fn(), setRequestHeader: jest.fn() } as any;
global.XMLHttpRequest = jest.fn(() => mockXHR) as any;

// ─────────────────────────────────────────────────────────────────────────────
// Home + HomeMain
// ─────────────────────────────────────────────────────────────────────────────

describe('Home', () => {
  const removeExtraKeyFromLayout = (layout: Layout[]) => layout.map(({ i, x, y, w, h }) => ({ i, x, y, w, h }));

  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
    (useUserId as jest.Mock).mockReturnValue('mockUserId');
    (useNodeNumbers as jest.Mock).mockReturnValue({
      nodesAll: 10,
      nodesCritical: 2,
      nodesWarning: 3,
      nodesError: undefined,
      nodesValidation: false,
    });
    (useResourceNumbers as jest.Mock).mockReturnValue({
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
    (useLayoutApplyNumbers as jest.Mock).mockReturnValue({
      layoutApplyAll: 30,
      layoutApplyFailed: 10,
      layoutApplySuspended: 5,
      layoutApplyError: undefined,
      layoutApplyValidating: false,
    });
    (useEnergyDonutChartData as jest.Mock).mockReturnValue({
      donutChartData: undefined,
      donutChartError: undefined,
      donutChartValidating: false,
    });
    (usePermission as jest.Mock).mockReturnValue(true);
  });

  describe('SWR refresh interval', () => {
    test.each(['1', '1.5'])(
      'uses the env value as the interval when NEXT_PUBLIC_DASHBOARD_INTERVAL_SECONDS is a valid number: %s',
      (n) => {
        const envMock = jest.replaceProperty(process, 'env', {
          ...process.env,
          NEXT_PUBLIC_DASHBOARD_INTERVAL_SECONDS: n,
        });
        render(<Home />);
        const interval = (SWRConfig as unknown as jest.Mock).mock.calls[0][0].value.refreshInterval;
        expect(interval).toBe(parseFloat(n) * 1000);
        envMock.restore();
      }
    );

    test.each(['', undefined, '0'])(
      'uses the default 30s interval when NEXT_PUBLIC_DASHBOARD_INTERVAL_SECONDS is zero or falsy: %s',
      (n) => {
        const envMock = jest.replaceProperty(process, 'env', {
          ...process.env,
          NEXT_PUBLIC_DASHBOARD_INTERVAL_SECONDS: n,
        });
        render(<Home />);
        const interval = (SWRConfig as unknown as jest.Mock).mock.calls[0][0].value.refreshInterval;
        expect(interval).toBe(30000);
        envMock.restore();
      }
    );

    test.each([undefined, 'dummy'])(
      'uses the default 30s interval when NEXT_PUBLIC_DASHBOARD_INTERVAL_SECONDS is not a number: %s',
      (n) => {
        const envMock = jest.replaceProperty(process, 'env', {
          ...process.env,
          NEXT_PUBLIC_DASHBOARD_INTERVAL_SECONDS: n,
        });
        render(<Home />);
        const interval = (SWRConfig as unknown as jest.Mock).mock.calls[0][0].value.refreshInterval;
        expect(interval).toBe(30000);
        envMock.restore();
      }
    );
  });

  test('renders tiles in view mode', () => {
    render(<Home />);
    expect(screen.getByTestId('mockProgressTile')).toBeVisible();
    expect(screen.getByTestId('mockDonutChartTile')).toBeVisible();
    expect(screen.getByTestId('mockAreaChartTile')).toBeVisible();
    expect(screen.getAllByTestId('mockNumberTile')).toHaveLength(7);
  });

  test('enters edit mode when Edit button is clicked', async () => {
    (usePermission as jest.Mock).mockReturnValue(false);
    render(<Home />);
    await userEvent.click(screen.getByRole('button', { name: 'Edit' }));
    expect(screen.getByText('Editing')).toBeInTheDocument();
    expect(screen.getByText('Save')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Add Tile')).toBeInTheDocument();
    expect(screen.getAllByTitle('Delete')[0]).toBeInTheDocument();
  });

  test('saves layout, shows success message, and closes it on dismiss', async () => {
    localStorage.clear();
    render(<Home />);
    await userEvent.click(screen.getByRole('button', { name: 'Edit' }));
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));

    const savedLayout = removeExtraKeyFromLayout(
      JSON.parse(localStorage.getItem('CDIM.mockUserId.dashboard.layout') ?? '')
    );
    const sortedDefault = [...DEFAULT_LAYOUT].sort((a, b) => (a.y !== b.y ? a.y - b.y : a.x - b.x));
    expect(savedLayout).toEqual(sortedDefault);
    expect(JSON.parse(localStorage.getItem('CDIM.mockUserId.dashboard.tileData') ?? '')).toEqual(DEFAULT_TILE_DATA);

    const successMsg = screen.getByText('The dashboard has been successfully saved');
    expect(successMsg).toBeInTheDocument();
    const closeBtn = successMsg.closest('div')?.parentElement?.nextSibling as HTMLButtonElement;
    await userEvent.click(closeBtn);
    expect(successMsg).not.toBeInTheDocument();
  });

  test('does not write to localStorage when userId is not set', async () => {
    (useUserId as jest.Mock).mockReturnValue(undefined);
    localStorage.clear();
    render(<Home />);
    await userEvent.click(screen.getByRole('button', { name: 'Edit' }));
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(localStorage.getItem('CDIM.mockUserId.dashboard.layout')).toBeNull();
  });

  test('cancels edit and returns to view mode', async () => {
    render(<Home />);
    await userEvent.click(screen.getByRole('button', { name: 'Edit' }));
    expect(screen.getByText('Editing')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.queryByText('Editing')).not.toBeInTheDocument();
  });

  test('deletes a tile and saves the updated tileData', async () => {
    (usePermission as jest.Mock).mockReturnValue(false);
    localStorage.clear();
    render(<Home />);
    await userEvent.click(screen.getByRole('button', { name: 'Edit' }));
    await userEvent.click(screen.getAllByTitle('Delete')[0]);
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));

    const saved = JSON.parse(localStorage.getItem('CDIM.mockUserId.dashboard.tileData') ?? '');
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { d001, ...expected } = DEFAULT_TILE_DATA;
    expect(saved).toEqual(expected);
  });

  test('adds a tile and saves the updated layout and tileData', async () => {
    (usePermission as jest.Mock).mockReturnValue(false);
    localStorage.clear();
    const mockDateNow = jest.spyOn(Date, 'now').mockReturnValue(new Date('2025-01-01T00:00:00').getTime());

    render(<Home />);
    await userEvent.click(screen.getByRole('button', { name: 'Edit' }));
    await userEvent.click(screen.getByRole('button', { name: 'Add Tile' }));
    expect(screen.getByTestId('mockAddTileModal')).toBeInTheDocument();

    const newTile: TileDataItem = { tileType: 'number', targetData: 'resource', state: 'ok' };
    const newSize: TileSize = { w: 1, h: 1 };
    const submitFunc = (AddTileModal as jest.Mock).mock.calls[0][0].submit;
    act(() => {
      submitFunc({ tileDataItem: newTile, tileSize: newSize });
    });

    await userEvent.click(screen.getByRole('button', { name: 'Save' }));
    const savedTileData = JSON.parse(localStorage.getItem('CDIM.mockUserId.dashboard.tileData') ?? '');
    expect(savedTileData).toEqual({ ...DEFAULT_TILE_DATA, ruo0: newTile });

    mockDateNow.mockRestore();
  });

  test('generates a new key when the first candidate already exists in tileData (collision)', async () => {
    (usePermission as jest.Mock).mockReturnValue(false);
    const timestamp1 = new Date('2025-01-01T00:00:00').getTime(); // produces 'ruo0'
    const timestamp2 = new Date('2026-01-01T00:00:00').getTime(); // produces a different key

    // Seed localStorage so the initial tileData already contains 'ruo0' (collision target)
    localStorage.setItem(
      'CDIM.mockUserId.dashboard.layout',
      JSON.stringify([...DEFAULT_LAYOUT, { i: 'ruo0', x: 0, y: 0, w: 1, h: 1 }])
    );
    localStorage.setItem(
      'CDIM.mockUserId.dashboard.tileData',
      JSON.stringify({ ...DEFAULT_TILE_DATA, ruo0: { tileType: 'number', targetData: 'node', state: 'all' } })
    );

    const dateSpy = jest
      .spyOn(Date, 'now')
      .mockReturnValueOnce(timestamp1) // first attempt → 'ruo0' → collision
      .mockReturnValueOnce(timestamp2); // second attempt → new unique key

    render(<Home />);
    await userEvent.click(screen.getByRole('button', { name: 'Edit' }));
    await userEvent.click(screen.getByRole('button', { name: 'Add Tile' }));

    // Use the latest AddTileModal call to get the closure capturing the updated tileData
    const submitFunc = (AddTileModal as jest.Mock).mock.calls.at(-1)![0].submit;
    act(() => {
      submitFunc({
        tileDataItem: { tileType: 'number', targetData: 'node', state: 'all' },
        tileSize: { w: 1, h: 1 },
      });
    });

    // Date.now called twice: first generated 'ruo0' (collision), second generated a unique key
    expect(dateSpy).toHaveBeenCalledTimes(2);
    dateSpy.mockRestore();
  });

  test('renders error alert with title and detail message', () => {
    (useNodeNumbers as jest.Mock).mockReturnValue({
      nodesError: { message: 'Node Error', response: { data: { message: 'Detail' } } },
      nodesValidation: false,
    });
    render(<Home />);
    const alert = screen.getByRole('alert');
    expect(within(alert).getByText('Node Error')).toBeVisible();
    expect(within(alert).getByText('Detail')).toBeVisible();
  });

  test('renders error alert with title only when no detail message', () => {
    (useNodeNumbers as jest.Mock).mockReturnValue({
      nodesError: { message: 'Node Error' },
      nodesValidation: false,
    });
    render(<Home />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// ErrorMessages
// ─────────────────────────────────────────────────────────────────────────────

describe('ErrorMessages', () => {
  test('renders error messages provided via context', () => {
    const TestComponent = () => {
      const [, setErrors] = useContext(ErrorsContext);
      useEffect(() => {
        setErrors([{ title: 'Error Title', message: 'Error Detail', apiName: 'api' }]);
      }, [setErrors]);
      return (
        <EditModeContext.Provider value={false}>
          <ErrorMessages />
        </EditModeContext.Provider>
      );
    };
    render(
      <ErrorsContextProvider>
        <TestComponent />
      </ErrorsContextProvider>
    );
    expect(screen.getByText('Error Title')).toBeVisible();
    expect(screen.getByText('Error Detail')).toBeVisible();
  });

  test('renders nothing when the error list is empty', () => {
    render(
      <ErrorsContextProvider>
        <EditModeContext.Provider value={false}>
          <ErrorMessages />
        </EditModeContext.Provider>
      </ErrorsContextProvider>
    );
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  test('renders an empty message body when error.message is undefined', () => {
    const TestComponent = () => {
      const [, setErrors] = useContext(ErrorsContext);
      useEffect(() => {
        setErrors([{ title: 'Error Title', message: undefined, apiName: 'api' }]);
      }, [setErrors]);
      return (
        <EditModeContext.Provider value={false}>
          <ErrorMessages />
        </EditModeContext.Provider>
      );
    };
    render(
      <ErrorsContextProvider>
        <TestComponent />
      </ErrorsContextProvider>
    );
    expect(screen.getByText('Error Title')).toBeVisible();
    expect(screen.queryByText('Error Detail')).not.toBeInTheDocument();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// CancelButton
// ─────────────────────────────────────────────────────────────────────────────

describe('CancelButton', () => {
  test('calls cancelEdit and removes save-related errors on click', async () => {
    const cancelEdit = jest.fn();
    let capturedErrors: any[] = [];

    const TestComponent = () => {
      const [errors, setErrors] = useContext(ErrorsContext);
      capturedErrors = errors;
      useEffect(() => {
        setErrors([
          { title: 'save err', message: 'msg', apiName: 'save' },
          { title: 'other err', message: 'msg', apiName: 'other' },
        ]);
      }, [setErrors]);
      return (
        <EditModeContext.Provider value={true}>
          <CancelButton cancelEdit={cancelEdit} />
        </EditModeContext.Provider>
      );
    };
    render(
      <ErrorsContextProvider>
        <TestComponent />
      </ErrorsContextProvider>
    );

    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(cancelEdit).toHaveBeenCalled();
    expect(capturedErrors.find((e: any) => e.apiName === 'save')).toBeUndefined();
    expect(capturedErrors.find((e: any) => e.apiName === 'other')).toBeDefined();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// SaveButton
// ─────────────────────────────────────────────────────────────────────────────

describe('SaveButton', () => {
  test('calls saveLayout and clears previous save errors on success', async () => {
    const saveLayout = jest.fn();
    let capturedErrors: any[] = [];

    const TestComponent = () => {
      const [errors, setErrors] = useContext(ErrorsContext);
      capturedErrors = errors;
      useEffect(() => {
        setErrors([{ title: 'old', message: 'old', apiName: 'save' }]);
      }, [setErrors]);
      return <SaveButton saveLayout={saveLayout} />;
    };
    render(
      <ErrorsContextProvider>
        <TestComponent />
      </ErrorsContextProvider>
    );

    await userEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(saveLayout).toHaveBeenCalled();
    expect(capturedErrors).toEqual([]);
  });

  test('preserves errors from other APIs when saving successfully', async () => {
    const saveLayout = jest.fn();
    let capturedErrors: any[] = [];

    const TestComponent = () => {
      const [errors, setErrors] = useContext(ErrorsContext);
      capturedErrors = errors;
      useEffect(() => {
        setErrors([{ title: 'other', message: 'other', apiName: 'other' }]);
      }, [setErrors]);
      return <SaveButton saveLayout={saveLayout} />;
    };
    render(
      <ErrorsContextProvider>
        <TestComponent />
      </ErrorsContextProvider>
    );

    await userEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(capturedErrors).toEqual([{ title: 'other', message: 'other', apiName: 'other' }]);
  });

  test('shows an error message when saveLayout throws with a message', async () => {
    const saveLayout = jest.fn(() => {
      throw new Error('save failed');
    });
    let capturedErrors: any[] = [];

    const TestComponent = () => {
      const [errors] = useContext(ErrorsContext);
      capturedErrors = errors;
      return <SaveButton saveLayout={saveLayout} />;
    };
    render(
      <ErrorsContextProvider>
        <TestComponent />
      </ErrorsContextProvider>
    );

    await userEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(capturedErrors).toEqual([
      { title: 'Failed to save the dashboard data', message: 'save failed', apiName: 'save' },
    ]);
  });

  test('shows an error message with empty detail when saveLayout throws without a message', async () => {
    const saveLayout = jest.fn(() => {
      throw { message: undefined };
    });
    let capturedErrors: any[] = [];

    const TestComponent = () => {
      const [errors] = useContext(ErrorsContext);
      capturedErrors = errors;
      return <SaveButton saveLayout={saveLayout} />;
    };
    render(
      <ErrorsContextProvider>
        <TestComponent />
      </ErrorsContextProvider>
    );

    await userEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(capturedErrors).toEqual([{ title: 'Failed to save the dashboard data', message: '', apiName: 'save' }]);
  });

  test('replaces an existing save error when saveLayout throws again', async () => {
    const saveLayout = jest.fn(() => {
      throw new Error('new error');
    });
    let capturedErrors: any[] = [];

    const TestComponent = () => {
      const [errors, setErrors] = useContext(ErrorsContext);
      capturedErrors = errors;
      useEffect(() => {
        setErrors([{ title: 'old save error', message: 'old', apiName: 'save' }]);
      }, [setErrors]);
      return <SaveButton saveLayout={saveLayout} />;
    };
    render(
      <ErrorsContextProvider>
        <TestComponent />
      </ErrorsContextProvider>
    );

    await userEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(capturedErrors).toEqual([
      { title: 'Failed to save the dashboard data', message: 'new error', apiName: 'save' },
    ]);
  });
});
