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
import { Card } from '@mantine/core';

import { DonutChartTile } from '@/components';
import { EditModeContext } from '@/app/[lng]/home/HomeContent';
import { formatEnergyValue } from '@/shared-modules/utils';

const meta: Meta<typeof DonutChartTile> = {
  title: 'mf-core/components/DonutChartTile',
  component: DonutChartTile,
  decorators: [
    (Story) => (
      <EditModeContext.Provider value={false}>
        <Card ta='center' w='300px' h='300px'>
          <Story />
        </Card>
      </EditModeContext.Provider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof DonutChartTile>;

const dummyDonutData = [
  { name: 'Critical', value: 25 },
  { name: 'Warning', value: 15 },
  { name: 'OK', value: 45 },
  { name: 'Disabled', value: 5 },
  { name: 'Unavailable', value: 5 },
];

export const Primary: Story = {
  args: {
    title: 'Energy Distribution',
    donutChartData: dummyDonutData,
    loading: false,
    linkTitle: 'View Details',
    link: '/energy/details',
    query: { tab: 'all' },
    valueFormatter: formatEnergyValue,
  },
};

export const Loading: Story = {
  args: {
    title: 'Energy Distribution',
    donutChartData: dummyDonutData,
    loading: true,
    linkTitle: 'View Details',
    link: '/energy/details',
    query: { tab: 'all' },
    valueFormatter: formatEnergyValue,
  },
};

export const NoData: Story = {
  args: {
    title: 'Energy Distribution',
    donutChartData: [],
    loading: false,
    linkTitle: 'View Details',
    link: '/energy/details',
    query: { tab: 'all' },
    valueFormatter: formatEnergyValue,
  },
};

export const WithZeroValues: Story = {
  args: {
    title: 'Energy Distribution\nWith Zero Values',
    donutChartData: [
      { name: 'Critical', value: 25 },
      { name: 'Warning', value: 0 },
      { name: 'OK', value: 45 },
      { name: 'Disabled', value: 0 },
      { name: 'Unavailable', value: 5 },
    ],
    loading: false,
    linkTitle: 'View Details',
    link: '/energy/details',
    query: { tab: 'all' },
    valueFormatter: formatEnergyValue,
  },
};

export const Simple: Story = {
  decorators: [
    (Story) => (
      <>
        <style>
          {`
            /* Simple story title mask */
            .simple-donut-title-mask .mantine-Title-root {
              color: #D0D0D0 !important;
            }
            /* Legend labels color */
            .simple-donut-title-mask .mantine-ChartLegend-legendItemName {
              color: #D0D0D0 !important;
            }

          `}
        </style>
        <div className='simple-donut-title-mask'>
          <Card ta='center' w='300px' h='300px' c='#D0D0D0'>
            <Story />
          </Card>
        </div>
      </>
    ),
  ],
  args: {
    title: '▆▆▆▆▆',
    donutChartData: [
      { name: '▆▆▆', value: 30 },
      { name: '▆▆▆', value: 25 },
      { name: '▆▆▆', value: 45 },
    ],
    loading: false,
    linkTitle: 'View Details',
    link: '/energy/details',
    query: { tab: 'all' },
    valueFormatter: formatEnergyValue,
  },
};

export const SimpleMaskedText: Story = {
  decorators: [
    (Story) => (
      <>
        <style>
          {`
            /* Simple story title mask */
            .simple-donut-title-mask .mantine-Title-root {
              color: #D0D0D0 !important;
            }
            /* Legend labels color */
            .simple-donut-title-mask .mantine-ChartLegend-legendItemName {
              color: #D0D0D0 !important;
            }
            /* Hide chart label (center total) */
            .simple-donut-title-mask .mantine-DonutChart-label {
              /* display: none !important; */
            }
          `}
        </style>
        <div className='simple-donut-title-mask'>
          <Card ta='center' w='300px' h='300px' c='#D0D0D0'>
            <Story />
          </Card>
        </div>
      </>
    ),
  ],
  args: {
    title: '▆▆▆▆▆',
    donutChartData: [
      { name: '▆▆▆', value: 30 },
      { name: '▆▆▆', value: 25 },
      { name: '▆▆▆', value: 45 },
    ],
    loading: false,
    linkTitle: 'View Details',
    link: '/energy/details',
    query: { tab: 'all' },
    valueFormatter: () => '▆▆▆',
    // valueFormatter: formatEnergyValue,
  },
};
