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

import { act } from 'react';

import { Radio } from '@mantine/core';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useLocale } from 'next-intl';

import { render } from '@/shared-modules/__test__/test-utils';

import { AddTileModal } from '@/components';

jest.mock('@mantine/core', () => ({
  __esModule: true,
  ...jest.requireActual('@mantine/core'),
  Button: jest.fn((props) => {
    return <button {...props} />;
  }),
  Radio: {
    ...jest.requireActual('@mantine/core').Radio,
    Group: jest.fn(({ children }) => {
      return <>{children}</>;
    }),
  },
}));

describe('AddTileModal', () => {
  const mockCloseModal = jest.fn();
  const mockSubmit = jest.fn();

  const renderComponent = (isModalOpen: boolean) => {
    render(<AddTileModal isModalOpen={isModalOpen} closeModal={mockCloseModal} submit={mockSubmit} />);
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });
  test('renders the modal when isModalOpen is true', () => {
    renderComponent(true);
    expect(screen.getByText('Add')).toBeInTheDocument();
  });

  test('does not render the modal when isModalOpen is false', () => {
    renderComponent(false);
    expect(screen.queryByText('Add')).not.toBeInTheDocument();
  });

  test('calls closeModal and resets form when cancel button is clicked', async () => {
    renderComponent(true);
    await userEvent.click(screen.getByText('Cancel'));
    expect(mockCloseModal).toHaveBeenCalled();
  });

  test('calls submit with correct data when form is submitted', async () => {
    renderComponent(true);
    act(() => {
      (Radio.Group as unknown as jest.Mock).mock.calls[0][0].onChange('Total Nodes');
    });
    await userEvent.click(screen.getByText('Add'));
    expect(mockSubmit).toHaveBeenCalledWith({
      tileDataItem: {
        tileType: 'number',
        targetData: 'node',
        state: 'all',
      },
      tileSize: { w: 2, h: 2 },
    });
  });

  test('disables Add button when form is not dirty', () => {
    renderComponent(true);
    expect(screen.getByText('Add')).toBeDisabled();
  });

  test('enables Add button when form is dirty', async () => {
    renderComponent(true);
    act(() => {
      (Radio.Group as unknown as jest.Mock).mock.calls[0][0].onChange('Total Nodes');
    });
    expect(screen.getByText('Add')).toBeEnabled();
  });

  test('render ja tile images', () => {
    (useLocale as jest.Mock).mockReturnValue('ja');
    renderComponent(true);
    expect(screen.getByText('Add')).toBeInTheDocument();
    expect(screen.getByAltText('Total Nodes')).toBeInTheDocument();
    expect(screen.getByAltText('Healthy Nodes')).toBeInTheDocument();
    expect(screen.getByAltText('Critical Nodes')).toBeInTheDocument();
    expect(screen.getByAltText('Warning Nodes')).toBeInTheDocument();
    expect(screen.getByAltText('Total Resources')).toBeInTheDocument();
    expect(screen.getByAltText('Healthy Resources')).toBeInTheDocument();
    expect(screen.getByAltText('Critical Resources')).toBeInTheDocument();
    expect(screen.getByAltText('Warning Resources')).toBeInTheDocument();
    expect(screen.getByAltText('Allocated Resources')).toBeInTheDocument();
    expect(screen.getByAltText('Unallocated Resources')).toBeInTheDocument();
    expect(screen.getByAltText('Design Available Resources')).toBeInTheDocument();
    expect(screen.getByAltText('Design Unavailable Resources')).toBeInTheDocument();
    expect(screen.getByAltText('Maintenance Resources')).toBeInTheDocument();
    expect(screen.getByAltText('LayoutApplies.number Suspended.status')).toBeInTheDocument();
    expect(screen.getByAltText('LayoutApplies.number Failed')).toBeInTheDocument();
    expect(screen.getByAltText('Energy Consumptions')).toBeInTheDocument();
    expect(screen.getByAltText('Energy Consumptions ratio by type')).toBeInTheDocument();
    expect(screen.getByAltText('Energy Consumptions Year comparison')).toBeInTheDocument();
    expect(screen.getByAltText('Energy Consumptions 4 weeks comparison')).toBeInTheDocument();
  });
});
