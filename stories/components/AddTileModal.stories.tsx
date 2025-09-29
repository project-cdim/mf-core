import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { AddTileModal } from '@/components/AddTileModal';
import { Button } from '@mantine/core';
import { TileDataItem, TileSize } from '@/types/TileData';

type SubmitData = {
  tileDataItem: TileDataItem;
  tileSize: TileSize;
};

const meta: Meta<typeof AddTileModal> = {
  title: 'mf-core/Components/AddTileModal',
  component: AddTileModal,
  tags: ['autodocs'],
  argTypes: {
    closeModal: { action: 'closeModal' },
    submit: { action: 'submit' },
  },
  args: {
    submit: (data: SubmitData) => {
      const text = `SUBMIT
tileDataItem.tileType: ${data.tileDataItem.tileType},
tileDataItem.targetData: ${data.tileDataItem.targetData},
tileSize.w: ${data.tileSize.w},
tileSize.w: ${data.tileSize.w}`;
      alert(text);
    },
  },
} satisfies Meta<typeof AddTileModal>;

export default meta;

type Story = StoryObj<typeof AddTileModal>;

export const Default: Story = {
  render: function Component(args) {
    const [isModalOpen, setModalOpen] = useState(false);

    return (
      <>
        <Button onClick={() => setModalOpen(true)}>Open AddTileModal</Button>
        <AddTileModal {...args} isModalOpen={isModalOpen} closeModal={() => setModalOpen(false)} />
      </>
    );
  },
};
