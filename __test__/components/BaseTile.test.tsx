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
import userEvent from '@testing-library/user-event';

import { render } from '@/shared-modules/__test__/test-utils';

import { BaseTile, BaseTileProps } from '@/components';

import { EditModeContext } from '@/pages/home';

describe('BaseTile', () => {
  test('With permission and edit mode, render children and icon', () => {
    const props: BaseTileProps = {
      tileTitle: 'BaseTile',
      deleteTile: jest.fn(),
      hasPermission: true,
      children: <div data-testid='children'>children</div>,
    };
    const { container } = render(
      <EditModeContext.Provider value={true}>
        <BaseTile {...props} />
      </EditModeContext.Provider>
    );

    const children = screen.getByTestId('children');
    expect(children).toBeVisible();
    expect(children).toHaveTextContent('children');

    const deleteIcon = screen.getByRole('button', { name: 'Delete' });
    expect(deleteIcon).toBeVisible();

    expect(container).not.toDisplayLoader();
  });

  test('Without permission and edit mode, render Unauthorized and icon', () => {
    const props: BaseTileProps = {
      tileTitle: 'BaseTile',
      deleteTile: jest.fn(),
      hasPermission: false,
      children: <div data-testid='children'>children</div>,
    };

    const { container } = render(
      <EditModeContext.Provider value={true}>
        <BaseTile {...props} />
      </EditModeContext.Provider>
    );

    const title = screen.getByRole('heading', { name: 'BaseTile' });
    expect(title).toBeVisible();

    const deleteIcon = screen.getByRole('button', { name: 'Delete' });
    expect(deleteIcon).toBeVisible();

    expect(container).not.toDisplayLoader();
    expect(screen.getByText('Unauthorized')).toBeVisible();
  });

  test('With permission and reference mode, render children and no icon', () => {
    const props: BaseTileProps = {
      tileTitle: 'BaseTile',
      deleteTile: jest.fn(),
      hasPermission: true,
      children: <div data-testid='children'>children</div>,
    };
    const { container } = render(
      <EditModeContext.Provider value={false}>
        <BaseTile {...props} />
      </EditModeContext.Provider>
    );

    const children = screen.getByTestId('children');
    expect(children).toBeVisible();
    expect(children).toHaveTextContent('children');

    const deleteIcon = screen.queryByRole('button', { name: 'Delete' });
    expect(deleteIcon).toBeNull();

    expect(container).not.toDisplayLoader();
  });

  test('With permission and reference mode, render Unauthorized and no icon', () => {
    const props: BaseTileProps = {
      tileTitle: 'BaseTile',
      deleteTile: jest.fn(),
      hasPermission: false,
      children: <div data-testid='children'>children</div>,
    };
    const { container } = render(
      <EditModeContext.Provider value={false}>
        <BaseTile {...props} />
      </EditModeContext.Provider>
    );

    const title = screen.getByRole('heading', { name: 'BaseTile' });
    expect(title).toBeVisible();

    const deleteIcon = screen.queryByRole('button', { name: 'Delete' });
    expect(deleteIcon).toBeNull();

    expect(container).not.toDisplayLoader();
    expect(screen.getByText('Unauthorized')).toBeVisible();
  });

  test('click delete icon', async () => {
    const mockDeleteTile = jest.fn();
    const props: BaseTileProps = {
      tileTitle: 'BaseTile',
      deleteTile: mockDeleteTile,
      hasPermission: true,
      children: <div data-testid='children'>children</div>,
    };

    render(
      <EditModeContext.Provider value={true}>
        <BaseTile {...props} />
      </EditModeContext.Provider>
    );

    const deleteIcon = screen.getByRole('button', { name: 'Delete' });
    expect(deleteIcon).toBeVisible();
    await userEvent.click(deleteIcon);
    expect(mockDeleteTile).toHaveBeenCalled();
  });
});
