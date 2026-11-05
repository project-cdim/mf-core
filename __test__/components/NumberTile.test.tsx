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

import { MantineProvider } from '@mantine/core';
import { renderHook, screen } from '@testing-library/react';

import { render } from '@/shared-modules/__test__/test-utils';
import { PageLink } from '@/shared-modules/components';
import { APPStatus } from '@/shared-modules/types';

import { NumberTile, NumberTileProps, useBackgroundColor } from '@/components';

import { EditModeContext } from '@/app/[lng]/home/HomeContent';

jest.mock('@tabler/icons-react', () => ({
  ...jest.requireActual('@tabler/icons-react'),
  IconAlertTriangleFilled: () => <div data-testid='mockIconForWarning'></div>,
  IconAlertCircleFilled: () => <div data-testid='mockIconForCritical'></div>,
  IconCheck: () => <div data-testid='mockIconForOK_Available'></div>,
  IconBan: () => <div data-testid='mockIconForDisabled_Unavailable'></div>,
  IconPlayerPause: () => <div data-testid='mockIconForSuspended'></div>,
}));

jest.mock('@/shared-modules/components/', () => ({
  ...jest.requireActual('@/shared-modules/components/'),
  PageLink: jest.fn().mockImplementation(({ children }) => <div>{children}</div>),
}));

describe('NumberTile', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test.each([
    { title: 'title', status: 'dummy' as APPStatus, number: 0, loading: false },
    { title: 'title', status: '' as APPStatus, number: 5, loading: false },
    { title: 'title', status: undefined, number: undefined, loading: false },
  ])('render NumberTile in default variant', (props) => {
    render(<NumberTile {...props} />);

    const title = screen.getByRole('heading', { name: props.title });
    const num = screen.getByText(typeof props.number === 'number' ? props.number.toString() : '-');
    const okIcon = screen.queryByTestId('mockIconForOK_Available');
    const criticalIcon = screen.queryByTestId('mockIconForCritical');
    const warningIcon = screen.queryByTestId('mockIconForWarning');
    const disabledIcon = screen.queryByTestId('mockIconForDisabled_Unavailable');
    const suspendedIcon = screen.queryByTestId('mockIconForSuspended');

    expect(title).toBeVisible();
    expect(num).toBeVisible();
    expect(criticalIcon).toBeNull();
    expect(warningIcon).toBeNull();
    expect(okIcon).toBeNull();
    expect(disabledIcon).toBeNull();
    expect(suspendedIcon).toBeNull();
  });

  test('render NumberTile for Critical number', () => {
    const props = { title: 'title', status: 'Critical', number: 5, loading: false } as const satisfies NumberTileProps;
    render(<NumberTile {...props} />);
    const title = screen.getByRole('heading', { name: props.title });
    const number = screen.getByText(props.number.toString());
    const icon = screen.getByTestId('mockIconForCritical');
    const bg = 'background-color: rgb(255, 201, 201)';
    const root = title.parentElement as HTMLElement;
    expect(root).toHaveStyle(bg);

    expect(title).toBeVisible();
    expect(number).toBeVisible();
    expect(icon).toBeVisible();
  });

  test('render NumberTile for Warning number', () => {
    const props = { title: 'title', status: 'Warning', number: 5, loading: false } as const satisfies NumberTileProps;
    render(<NumberTile {...props} />);
    const title = screen.getByRole('heading', { name: props.title });
    const number = screen.getByText(props.number.toString());
    const icon = screen.getByTestId('mockIconForWarning');
    const bg = 'background-color: rgb(255, 236, 153)';

    const root = title.parentElement as HTMLElement;
    expect(root).toHaveStyle(bg);

    expect(title).toBeVisible();
    expect(number).toBeVisible();
    expect(icon).toBeVisible();
  });

  test('render NumberTile for OK Available number', () => {
    const props = { title: 'title', status: 'OK', number: 5, loading: false } as const satisfies NumberTileProps;
    render(<NumberTile {...props} />);
    const title = screen.getByRole('heading', { name: props.title });
    const number = screen.getByText(props.number.toString());
    const icon = screen.getByTestId('mockIconForOK_Available');
    const bg = 'background-color: white';

    const root = title.parentElement as HTMLElement;
    expect(root).toHaveStyle(bg);

    expect(title).toBeVisible();
    expect(number).toBeVisible();
    expect(icon).toBeVisible();
  });

  test('render NumberTile for Disabled Unavailable number', () => {
    const props = { title: 'title', status: 'Disabled', number: 5, loading: false } as const satisfies NumberTileProps;
    render(<NumberTile {...props} />);
    const title = screen.getByRole('heading', { name: props.title });
    const number = screen.getByText(props.number.toString());
    const icon = screen.getByTestId('mockIconForDisabled_Unavailable');
    const bg = 'background-color: white';

    const root = title.parentElement as HTMLElement;
    expect(root).toHaveStyle(bg);

    expect(title).toBeVisible();
    expect(number).toBeVisible();
    expect(icon).toBeVisible();
  });

  test('render NumberTile for Total number', () => {
    const props = { title: 'title', status: 'All', number: 5, loading: false } as const satisfies NumberTileProps;
    render(<NumberTile {...props} />);
    const title = screen.getByRole('heading', { name: props.title });
    const number = screen.getByText(props.number.toString());
    const bg = 'background-color: white';

    const root = title.parentElement as HTMLElement;
    expect(root).toHaveStyle(bg);
    expect(title).toBeVisible();
    expect(number).toBeVisible();

    const ok = screen.queryByTestId('mockIconForOK_Available');
    const critical = screen.queryByTestId('mockIconForCritical');
    const warning = screen.queryByTestId('mockIconForWarning');
    const disabled = screen.queryByTestId('mockIconForDisabled_Unavailable');
    const suspended = screen.queryByTestId('mockIconForSuspended');
    expect(ok).toBeNull();
    expect(critical).toBeNull();
    expect(warning).toBeNull();
    expect(disabled).toBeNull();
    expect(suspended).toBeNull();
  });

  test('render NumberTile for Suspended number', () => {
    const props = { title: 'title', status: 'Suspended', number: 5, loading: false } as const satisfies NumberTileProps;
    render(<NumberTile {...props} />);
    const title = screen.getByRole('heading', { name: props.title });
    const number = screen.getByText(props.number.toString());
    const icon = screen.getByTestId('mockIconForSuspended');
    const bg = 'background-color: rgb(255, 236, 153)';

    const root = title.parentElement as HTMLElement;
    expect(root).toHaveStyle(bg);

    expect(title).toBeVisible();
    expect(number).toBeVisible();
    expect(icon).toBeVisible();
  });

  test('render NumberTile with medium-size layout (4-digit number)', () => {
    // digits=4 triggers isMedium=true (threshold=6, thresholdMedium=4 for non-All status)
    const props = { title: 'title', status: 'Critical' as APPStatus, number: 1234, loading: false };
    render(<NumberTile {...props} />);
    expect(screen.getByText('1,234')).toBeVisible();
  });

  test('render NumberTile with large-size layout (6-digit number)', () => {
    // digits=6 triggers isLarge=true (threshold=6 for non-All status)
    const props = { title: 'title', status: 'Critical' as APPStatus, number: 123456, loading: false };
    render(<NumberTile {...props} />);
    expect(screen.getByText('123,456')).toBeVisible();
  });

  test('render NumberTile with medium-size layout for All status (5-digit number)', () => {
    // isAllStatus=true: threshold=7, thresholdMedium=5; digits=5 → isMedium=true
    const props = { title: 'title', status: 'All' as APPStatus, number: 12345, loading: false };
    render(<NumberTile {...props} />);
    expect(screen.getByText('12,345')).toBeVisible();
  });

  test('render NumberTile with large-size layout for All status (7-digit number)', () => {
    // isAllStatus=true: threshold=7; digits=7 → isLarge=true
    const props = { title: 'title', status: 'All' as APPStatus, number: 1234567, loading: false };
    render(<NumberTile {...props} />);
    expect(screen.getByText('1,234,567')).toBeVisible();
  });

  test('if loading render a loader', () => {
    const props: NumberTileProps = { title: 'title', status: 'OK', number: 5, loading: true };
    const { container } = render(<NumberTile {...props} />);
    expect(container.querySelector('.mantine-Indicator-indicator')).toBeInTheDocument();
  });

  test('render NumberTile in edit mode', () => {
    const props: NumberTileProps = { title: 'title', status: 'Suspended', number: 5, loading: false, link: 'link' };
    render(
      <EditModeContext.Provider value={true}>
        <NumberTile {...props} />
      </EditModeContext.Provider>
    );

    const linkProps = (PageLink as jest.Mock).mock.calls[0][0];
    expect(linkProps.path).toBeUndefined();
  });

  test('render NumberTile in reference mode', () => {
    const props: NumberTileProps = { title: 'title', status: 'Suspended', number: 5, loading: false, link: 'link' };
    render(
      <EditModeContext.Provider value={false}>
        <NumberTile {...props} />
      </EditModeContext.Provider>
    );

    const linkProps = (PageLink as jest.Mock).mock.calls[0][0];
    expect(linkProps.path).toBe(props.link);
  });
});

describe('useBackgroundColor', () => {
  test.each([
    ['Critical', '#ffc9c9'],
    ['Failed', '#ffc9c9'],
    ['Warning', '#ffec99'],
    ['Suspended', '#ffec99'],
    ['OK', undefined],
    ['Disabled', undefined],
    ['DesignAvailable', undefined],
    ['DesignUnavailable', '#dee2e6'],
    ['Maintenance', '#dee2e6'],
    ['All', undefined],
    [undefined, undefined],
  ])('return background color that matched status', (status, expected) => {
    const wrapper = ({ children }: { children: React.ReactNode }) => {
      return <MantineProvider>{children}</MantineProvider>;
    };
    const { result } = renderHook(() => useBackgroundColor(status as APPStatus), { wrapper });
    expect(result.current.bg).toBe(expected);
  });
});
