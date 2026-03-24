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

import type { Meta, StoryObj } from '@storybook/react';

import { DashboardGrid } from '@/components/DashboardGrid';
import { Box } from '@mantine/core';

type Story = StoryObj<typeof DashboardGrid>;

const meta: Meta<typeof DashboardGrid> = {
  title: 'mf-core/Components/DashboardGrid',
  component: DashboardGrid,
};

export default meta;

const dummyProps = {
  children: (
    <Box key='1' bd='1px solid black'>
      card
    </Box>
  ),
  layout: [
    { i: '0', x: 0, y: 0, w: 1, h: 1 },
    { i: '1', x: 1, y: 0, w: 2, h: 2 },
  ],
  setLayout: () => {},
  viewMode: false,
} as const satisfies React.ComponentProps<typeof DashboardGrid>;

export const Standard: Story = {
  args: {
    ...dummyProps,
  },
  render: (args) => (
    <Box style={{ position: 'relative' }} w={'100%'} h={'500px'}>
      <DashboardGrid {...args} />
    </Box>
  ),
};
