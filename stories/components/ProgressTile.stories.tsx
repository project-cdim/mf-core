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

import '@mantine/core/styles.css';
import type { Meta, StoryObj } from '@storybook/react';

import '@/styles/globals.css';

import { ProgressTile } from '@/components';
import { Icon } from '@/shared-modules/components/Icon';
import { EditModeContext } from '@/app/[lng]/home/HomeContent';
import { Card } from '@mantine/core';

const meta: Meta<typeof ProgressTile> = {
  title: 'mf-core/components/ProgressTile',
  component: ProgressTile,
  decorators: [
    (Story) => (
      <EditModeContext.Provider value={false}>
        <Story />
      </EditModeContext.Provider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ProgressTile>;

export const Primary: Story = {
  args: {
    title: 'ProgressTile',
    value: 10,
    allValue: 100,
    loading: false,
    icon: <Icon status='All' />,
    // bg: 'red',
  },
  render: function Componet(args) {
    return (
      <Card withBorder w={150} h={150}>
        <ProgressTile {...args} />
      </Card>
    );
  },
};

export const Simple: Story = {
  args: {
    title: 'ProgressTile',
    value: 61,
    allValue: 100,
    loading: false,
    icon: <Icon status='All' />,
    // bg: 'red',
  },

  decorators: [
    (Story) => (
      <>
        <style>
          {`
            .simple-tile-wrapper .mantine-Title-root {
              color: #D0D0D0 !important; /* gray sample */
            }
          `}
        </style>
        <div className='simple-tile-wrapper'>
          <Story />
        </div>
      </>
    ),
  ],
  render: function Componet(args) {
    return (
      <Card withBorder w={150} h={150} ta='center'>
        <ProgressTile {...args} title={`▇▇\u00A0\u00A0▇▇▇▇▇`} />
      </Card>
    );
  },
};
