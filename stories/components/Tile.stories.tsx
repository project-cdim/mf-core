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

import { Tile } from '@/components';
import { EditModeContext } from '@/pages/home';
import { Box } from '@mantine/core';

const meta: Meta<typeof Tile> = {
  title: 'mf-core/components/Tile',
  component: Tile,
};

export default meta;
type Story = StoryObj<typeof Tile>;

export const Primary: Story = {
  args: {
    tileData: {
      tileType: 'number',
      targetData: 'resource',
      state: 'critical',
    },
    deleteTile: () => {
      alert('deleteTile');
    },
  },
  render: function Componet(args) {
    return (
      <EditModeContext.Provider value={false}>
        <Box w={150} h={150}>
          <Tile {...args} />
        </Box>
      </EditModeContext.Provider>
    );
  },
};

export const EditMode: Story = {
  args: {
    tileData: {
      tileType: 'number',
      targetData: 'resource',
      state: 'critical',
    },
    deleteTile: () => {
      alert('deleteTile');
    },
  },
  render: function Componet(args) {
    return (
      <EditModeContext.Provider value={true}>
        <Box w={150} h={150}>
          <Tile {...args} />
        </Box>
      </EditModeContext.Provider>
    );
  },
};
