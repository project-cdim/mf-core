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
