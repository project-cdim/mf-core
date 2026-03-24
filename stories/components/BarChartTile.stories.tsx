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
        <Card ta='center' w='750px' h='250px' withBorder>
          <Story />
        </Card>
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

export const Loading: Story = {
  args: {
    title: 'TestBarChartTile',
    subTitle: 'TestSubTitle',
    barChartData: dummyData,
    linkTitle: 'Summary',
    link: '/cdim/res-summary',
    loading: true,
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

export const NoData: Story = {
  args: {
    title: 'TestBarChartTile',
    subTitle: 'TestSubTitle',
    barChartData: [],
    linkTitle: 'Summary',
    link: '/cdim/res-summary',
    loading: false,
    query: { tab: 'all' },
    valueFormatter: formatEnergyValue,
    // series: [
    //   { name: 'previous', color: 'blue.2' },
    //   { name: 'last', color: 'blue.6' },
    // ],
    // diff: -10,
    // diffPercent: -20,
    // lastTotal: 100,
    // previousTotal: 90,
  },
};

// export const AddTileImg: Story = {
//   decorators: [
//     (Story) => (
//       <Card ta='center' w='500px' h='500px'>
//         <Story />
//       </Card>
//     ),
//   ],
//   args: {
//     title: 'xxx',
//     subTitle: 'xxx',
//     barChartData: dummyData,
//     linkTitle: 'Summary',
//     link: '/cdim/res-summary',
//     loading: false,
//     query: { tab: 'all' },
//     valueFormatter: formatEnergyValue,
//     series: [
//       { name: 'previous', color: 'blue.2' },
//       { name: 'last', color: 'blue.6' },
//     ],
//     diff: -10,
//     diffPercent: -20,
//     lastTotal: 100,
//     previousTotal: 90,
//   },
// };

// const maskedDummyData: compareBarChartDataType = dummyData.map((d) => ({
//   // Copy existing values to mask keys
//   '▆▆▆▆': d.previous,
//   '▆▆▆': d.last,
//   // If "tooltipLabel" also necessary to match Key
//   tooltipLabel: {
//     '▆▆▆▆': '▆▆▆▆',
//     '▆▆▆': '▆▆▆',
//   },
//   xtics: d.xtics,
// }));

// export const Simple: Story = {
//   decorators: [
//     (Story) => (
//       <>
//         <style>
//           {`
//             .simple-bar-chart-gray .mantine-Title-root {
//               color: #D0D0D0 !important;
//               font-size: 0 !important;
//             }
//             .simple-bar-chart-gray .mantine-Title-root::before {
//               content: '▇▇\u00A0\u00A0▇▇▇▇▇';
//               font-size: 1.5rem;
//             }
//             .simple-bar-chart-gray .mantine-Text-root:not(.mantine-ChartLegend-legendItemName) {
//               display: none !important;
//             }
//             .simple-bar-chart-gray .mantine-ChartLegend-legendItemName {
//               color: #D0D0D0 !important;
//             }
//             .simple-bar-chart-gray .recharts-cartesian-axis-tick {
//               display: none !important;
//             }
//             .simple-bar-chart-gray .recharts-cartesian-axis-line {
//               stroke: #e0e0e0 !important;
//             }
//             .simple-bar-chart-gray .recharts-wrapper {
//               margin-left: -40px !important;
//               margin-bottom: -20px !important;
//             }
//             .simple-bar-chart-gray .recharts-surface {
//               overflow: visible !important;
//             }
//             .simple-bar-chart-gray .recharts-cartesian-grid {
//               display: none !important;
//             }
//           `}
//         </style>
//         <div className='simple-bar-chart-gray'>
//           <Card ta='center' w='500px' h='500px'>
//             <Story />
//           </Card>
//         </div>
//       </>
//     ),
//   ],
//   args: {
//     title: '▇▇\u00A0\u00A0▇▇▇▇▇',
//     subTitle: '',
//     barChartData: maskedDummyData,
//     linkTitle: 'Summary',
//     link: '/cdim/res-summary',
//     loading: false,
//     query: { tab: 'all' },
//     valueFormatter: formatEnergyValue,
//     series: [
//       { name: '▆▆▆▆', color: 'blue.2' },
//       { name: '▆▆▆', color: 'blue.6' },
//     ],
//     diff: -10,
//     diffPercent: -20,
//     lastTotal: 80,
//     previousTotal: 90,
//   },
// };
