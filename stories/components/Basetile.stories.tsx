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

import type { Meta, StoryObj } from '@storybook/react';
import { BaseTile, BaseTileProps } from '@/components/BaseTile';
import { EditModeContext } from '@/app/[lng]/home/HomeContent';
import { Box, Card } from '@mantine/core';

const meta = {
  title: 'mf-core/Components/BaseTile',
  component: BaseTile,
  tags: ['autodocs'],
  argTypes: {
    tileTitle: { control: 'text' },
    hasPermission: { control: 'boolean' },
    deleteTile: { action: 'deleteTile' },
    children: { control: false },
    isEditMode: { control: 'boolean' },
  },
  args: {
    tileTitle: 'Default Tile',
    hasPermission: true,
    deleteTile: () => alert('Tile deleted'),
    children: <Card>Tile Content</Card>,
    isEditMode: false,
  },
} satisfies Meta<BaseTileProps & { isEditMode?: boolean }>;

export default meta;

type Story = StoryObj<BaseTileProps & { isEditMode: boolean }>;

export const Default: Story = {
  args: {
    tileTitle: 'Default Tile',
    hasPermission: true,
    deleteTile: () => alert('Tile deleted'),
    children: <>Tile Content</>,
    isEditMode: false,
  },
  render: (args) => (
    <EditModeContext.Provider value={args.isEditMode}>
      <Box w={150} h={150}>
        <BaseTile {...args} />
      </Box>
    </EditModeContext.Provider>
  ),
};

export const NoPermission: Story = {
  args: {
    tileTitle: 'Restricted Tile',
    hasPermission: false,
    deleteTile: () => alert('Tile deleted'),
    children: <>Restricted Content</>,
    isEditMode: false,
  },
  render: (args) => (
    <EditModeContext.Provider value={args.isEditMode}>
      <Box w={150} h={150}>
        <BaseTile {...args} />
      </Box>
    </EditModeContext.Provider>
  ),
};

export const EditMode: Story = {
  args: {
    tileTitle: 'Editable Tile',
    hasPermission: true,
    deleteTile: () => alert('Tile deleted'),
    children: <>Editable Content</>,
    isEditMode: true,
  },
  render: (args) => (
    <EditModeContext.Provider value={args.isEditMode}>
      <Box w={150} h={150}>
        <BaseTile {...args} />
      </Box>
    </EditModeContext.Provider>
  ),
};
