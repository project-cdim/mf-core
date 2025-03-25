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

import { useViewportSize } from '@mantine/hooks';
import GridLayout from 'react-grid-layout';

import { render } from '@/shared-modules/__test__/test-utils';

import { DashboardGrid } from '@/components';

jest.mock('react-grid-layout', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('@mantine/hooks', () => ({
  ...jest.requireActual('@mantine/hooks'),
  useViewportSize: jest.fn(),
}));

describe('DashboardGrid', () => {
  beforeEach(() => {
    (useViewportSize as jest.Mock).mockReset();
    (useViewportSize as jest.Mock).mockReturnValue({ width: 1920, height: 1080 });
  });

  test.each([
    [[360, 640], 12, 1075], // smartphone
    [[1366, 768], 15, 1345], // laptop
    [[1920, 1080], 21, 1885], // desktop(fullHD)
    [[3840, 2160], 42, 3775], // desktop(4K)
  ])('Change cols and width depends on viewport width: %p', (viewport, expectedCols, expectedWidth) => {
    (useViewportSize as jest.Mock).mockReturnValue({ width: viewport[0], height: viewport[1] });
    // @ts-ignore
    const { container } = render(<DashboardGrid defaultLayout={[]} />);
    const gridLayoutProps = (GridLayout as unknown as jest.Mock).mock.lastCall[0];
    expect(gridLayoutProps.cols).toBe(expectedCols);
    expect(gridLayoutProps.width).toBe(expectedWidth);

    const background = container.getElementsByClassName('dashboardGrid')[0];
    expect(background).toHaveStyle({ '--grid-columns': `${expectedCols}` });
  });

  test('background grid is shown in edit mode', () => {
    (useViewportSize as jest.Mock).mockReturnValue({ width: 1920, height: 1080 });
    const layout = [{ i: '1', x: 0, y: 0, w: 1, h: 1 }];
    const setLayout: jest.Mock = jest.fn();
    const viewMode = false;
    const children = <div>children</div>;

    const { container } = render(
      <DashboardGrid layout={layout} setLayout={setLayout} viewMode={viewMode}>
        {children}
      </DashboardGrid>
    );

    const gridLayoutProps = (GridLayout as unknown as jest.Mock).mock.lastCall[0];

    const background = container.getElementsByClassName('dashboardGrid')[0];

    expect(gridLayoutProps.isDraggable).toBe(true);
    expect(background).toHaveStyle({ '--grid-layout-cell-color': '#f0f0f0' });
    expect(background).not.toHaveStyle({ '--grid-layout-cell-color': '#fff' });
  });

  test('background grid is not shown in view mode', () => {
    (useViewportSize as jest.Mock).mockReturnValue({ width: 1920, height: 1080 });
    // @ts-ignore
    const layout = [{ i: '1', x: 0, y: 0, w: 1, h: 1 }];
    const setLayout: jest.Mock = jest.fn();
    const viewMode = true;
    const children = <div>children</div>;

    const { container } = render(
      <DashboardGrid layout={layout} setLayout={setLayout} viewMode={viewMode}>
        {children}
      </DashboardGrid>
    );

    const background = container.getElementsByClassName('dashboardGrid')[0];
    // reference mode
    expect(background).toHaveStyle({ '--grid-layout-cell-color': '#fff' });
    expect(background).not.toHaveStyle({ '--grid-layout-cell-color': '#f0f0f0' });
  });

  test('setLayout function can be passed correctly to GridLayout', () => {
    (useViewportSize as jest.Mock).mockReturnValue({ width: 1920, height: 1080 });
    // @ts-ignore
    const layout = [{ i: '1', x: 0, y: 0, w: 1, h: 1 }];
    const setLayout: jest.Mock = jest.fn();
    const viewMode = false;
    (GridLayout as unknown as jest.Mock).mockImplementation(({ children }) => {
      return <>{children}</>;
    });
    render(
      <DashboardGrid layout={layout} setLayout={setLayout} viewMode={viewMode}>
        children
      </DashboardGrid>
    );
    const gridLayoutProps = (GridLayout as unknown as jest.Mock).mock.lastCall[0];
    expect(gridLayoutProps.onLayoutChange).toBe(setLayout);
  });
});
