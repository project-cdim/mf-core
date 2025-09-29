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
        'Available',
        'Unavailable',
        'Unallocated',
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
      <Card withBorder={true} w={150} h={150}>
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
      <Card withBorder={true} w={150} h={150}>
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
      <Card withBorder={true} w={150} h={150}>
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
          'Available',
          'Unavailable',
          'Unallocated',
          'All',
          undefined,
        ].map((status) => (
          <Card withBorder key={status ?? 'undefined'} w={150} h={150}>
            <NumberTile {...args} title={`Status is ${status}`} status={status as APPStatus | undefined} />
          </Card>
        ))}
      </>
    );
  },
};
