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
import { NumberTile } from '@/components';
import { Card, Group } from '@mantine/core';
import { APPStatus } from '@/shared-modules/types';

const meta: Meta = {
  title: 'mf-core/Components/NumberTile',
  component: NumberTile,
  tags: ['autodocs'],
  argTypes: {
    // title: string;
    status: {
      options: [
        'Critical',
        'Failed',
        'Warning',
        'Suspended',
        'OK',
        'Disabled',
        'DesignAvailable',
        'DesignUnavailable',
        'Unallocated',
        'Maintenance',
        'All',
        undefined,
      ],
      type: 'string',
      control: 'select',
    },
    // number: number | undefined;
    // linkTitle?: string;
    // link?: string;
    // query?: {
    //   [key: string]: string | string[];
    // };
    // loading: boolean;
  },
  args: {
    title: 'Title',
    status: 'OK',
    number: 10,
    loading: false,
  },
} satisfies Meta<typeof NumberTile>;

export default meta;

type Story = StoryObj<typeof NumberTile>;

/** The demo is displayed together with the Card component. */
export const Default: Story = {
  args: {
    status: 'OK',
  },
  decorators: [
    (Story) => (
      <Card withBorder={true} w={150} h={150} ta='center'>
        <Story />
      </Card>
    ),
  ],
};

/** The demo is displayed together with the Card component.
 *
 * The title of the NumberTile. Line breaks should be represented as `\n`. They will be converted to `<br />`.
 */
export const MultiLineTitle: Story = {
  args: {
    title: 'Title\nLine 2',
  },
  decorators: [
    (Story) => (
      <Card withBorder={true} w={150} h={150} ta='center'>
        <Story />
      </Card>
    ),
  ],
};

/** The demo is displayed together with the Card component. */
export const LinkTitle: Story = {
  args: {
    link: 'https://www.google.com',
    linkTitle: 'Google',
    query: { q: 'CDMI' },
  },
  decorators: [
    (Story) => (
      <Card withBorder={true} w={150} h={150} ta='center'>
        <Story />
      </Card>
    ),
  ],
};

/** The demo is displayed together with the Card and the Group component. */
export const StatusList: Story = {
  decorators: [
    (Story) => (
      <Group>
        <Story />
      </Group>
    ),
  ],
  render: function Componet(args) {
    return (
      <>
        {[
          'Critical',
          'Failed',
          'Warning',
          'Suspended',
          'OK',
          'Disabled',
          'DesignAvailable',
          'DesignUnavailable',
          'Unallocated',
          'Maintenance',
          'All',
          undefined,
        ].map((status) => (
          <Card withBorder key={status ?? 'undefined'} w={150} h={150} ta='center'>
            <NumberTile {...args} title={`Status is ${status}`} status={status as APPStatus} />
          </Card>
        ))}
      </>
    );
  },
};

// Display of abstracted tiles
export const Simple: Story = {
  args: {
    title: '',
    status: 'All',
    number: 51,
    loading: false,
  },

  // Original form
  // decorators: [
  //   (Story) => (
  //     <Group>
  //       <Story />
  //     </Group>
  //   ),
  // ],

  // By changing the way the contents of decorators are written, the color is forcibly changed
  decorators: [
    (Story) => (
      <>
        {/* Story-local style: only affect elements inside .simple-tile-wrapper */}
        <style>
          {`
            .simple-tile-wrapper .mantine-Title-root {
              color: #D0D0D0 !important; /* gray sample */
              text-align: center;
            }
          `}
        </style>
        <Group className='simple-tile-wrapper'>
          <Story />
        </Group>
      </>
    ),
  ],

  //  If the appearance of the tiles is the same, only one is displayed as a representative
  // (Example: 'Critical' and 'Failed' have the same appearance, so only 'Critical' is displayed)
  render: function Componet(args) {
    return (
      <>
        {[
          'Critical',
          // 'Failed',
          'Warning',
          'Suspended',
          'OK',
          'Disabled',
          // 'DesignAvailable',
          'DesignUnavailable',
          // 'Unallocated',
          // 'Maintenance',
          // 'All',
          undefined,
        ].map((status) => (
          <Card withBorder key={status ?? 'undefined'} w={150} h={150} ta='center'>
            {/* <NumberTile {...args} title={`▇▇▇▇▇▇▇`} status={status as APPStatus} /> */}
            <NumberTile {...args} title={`▇▇\u00A0\u00A0▇▇▇▇▇`} status={status as APPStatus} />
          </Card>
        ))}
      </>
    );
  },
};
