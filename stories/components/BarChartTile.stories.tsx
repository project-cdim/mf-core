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

import '@mantine/core/styles.css';
import type { Meta, StoryObj } from '@storybook/react';
import { formatEnergyValue } from '@/shared-modules/utils';

import '@/styles/globals.css';

import { BarChartTile } from '@/components';
import { EditModeContext } from '@/pages/home';
import { compareBarChartDataType } from '@/utils/hooks';
import { Card } from '@mantine/core';

const meta: Meta<typeof BarChartTile> = {
  title: 'mf-core/components/BarChartTile',
  component: BarChartTile,
  decorators: [
    (Story) => (
      <EditModeContext.Provider value={false}>
        <Story />
      </EditModeContext.Provider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof BarChartTile>;

const dummyData: compareBarChartDataType = [
  { last: 15, previous: 25, tooltipLabel: {}, xtics: null },
  { last: 25, previous: 30, tooltipLabel: {}, xtics: null },
  { last: 15, previous: 20, tooltipLabel: {}, xtics: null },
];

export const Primary: Story = {
  args: {
    title: 'TestBarChartTile',
    subTitle: 'TestSubTitle',
    barChartData: dummyData,
    linkTitle: 'Summary',
    link: '/cdim/res-summary',
    loading: false,
    query: { tab: 'all' },
    valueFormatter: formatEnergyValue,
    series: [
      { name: 'previous', color: 'blue.2' },
      { name: 'last', color: 'blue.6' },
    ],
    diff: -10,
    diffPercent: -20,
    lastTotal: 100,
    previousTotal: 90,
  },
};

export const AddTileImg: Story = {
  decorators: [
    (Story) => (
      <Card ta='center' w='500px' h='500px'>
        <Story />
      </Card>
    ),
  ],
  args: {
    title: 'xxx',
    subTitle: 'xxx',
    barChartData: dummyData,
    linkTitle: 'Summary',
    link: '/cdim/res-summary',
    loading: false,
    query: { tab: 'all' },
    valueFormatter: formatEnergyValue,
    series: [
      { name: 'previous', color: 'blue.2' },
      { name: 'last', color: 'blue.6' },
    ],
    diff: -10,
    diffPercent: -20,
    lastTotal: 100,
    previousTotal: 90,
  },
};
