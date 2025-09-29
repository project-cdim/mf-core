import type { Meta, StoryObj } from '@storybook/react';
import { BaseTile, BaseTileProps } from '@/components/BaseTile';
import { EditModeContext } from '@/pages/home';
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
