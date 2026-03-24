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

/* eslint-disable complexity */

import '@mantine/core/styles.css';
import type { Meta, StoryObj } from '@storybook/react';
import { Card, LoadingOverlay } from '@mantine/core';
import { NextIntlClientProvider } from 'next-intl';

import '@/styles/globals.css';

import { EditModeContext } from '@/pages/home';
import { GraphViewData, GraphViewInner, GraphViewProps } from '@/shared-modules/components';
import { formatEnergyValue } from '@/shared-modules/utils';

// Import Japanese translations
import jaMessages from '@/shared-modules/public/locales/ja/common.json';

// This is sample raw data that would come from the API
// Format: Array of [timestamp (seconds), value (string)]
// Data covers approximately 30 days with hourly intervals (730 data points)
const generateSampleData = (): GraphViewData => {
  const baseTimestamp = 1760839200; // Starting timestamp
  const hourlyInterval = 3600; // 1 hour in seconds
  const dataPoints = 730; // ~30 days of hourly data
  const mainPeakIndex = Math.floor(dataPoints * 0.7); // Main peak at 70% position
  const midPeak1Index = Math.floor(dataPoints * 0.3); // Mid peak at 30% position
  const midPeak2Index = Math.floor(dataPoints * 0.5); // Mid peak at 50% position
  const midPeak3Index = Math.floor(dataPoints * 0.85); // Mid peak at 85% position

  return Array.from({ length: dataPoints }, (_, i) => {
    const timestamp = baseTimestamp + i * hourlyInterval;
    let value;
    const distanceFromMainPeak = Math.abs(i - mainPeakIndex);
    const distanceFromMidPeak1 = Math.abs(i - midPeak1Index);
    const distanceFromMidPeak2 = Math.abs(i - midPeak2Index);
    const distanceFromMidPeak3 = Math.abs(i - midPeak3Index);

    if (i === mainPeakIndex) {
      value = 1.5; // Main peak value
    } else if (distanceFromMainPeak <= 5) {
      // Values close to main peak (within 5 hours): 0.8-1.2
      value = 0.8 + Math.random() * 0.4;
    } else if (distanceFromMainPeak <= 15) {
      // Values near main peak (within 15 hours): 0.5-0.8
      value = 0.5 + Math.random() * 0.3;
    } else if (i === midPeak1Index || i === midPeak2Index || i === midPeak3Index) {
      // Mid peaks: 0.9-1.1
      value = 0.9 + Math.random() * 0.2;
    } else if (distanceFromMidPeak1 <= 3 || distanceFromMidPeak2 <= 3 || distanceFromMidPeak3 <= 3) {
      // Values close to mid peaks (within 3 hours): 0.6-0.8
      value = 0.6 + Math.random() * 0.2;
    } else if (distanceFromMidPeak1 <= 8 || distanceFromMidPeak2 <= 8 || distanceFromMidPeak3 <= 8) {
      // Values near mid peaks (within 8 hours): 0.4-0.6
      value = 0.4 + Math.random() * 0.2;
    } else {
      // Small baseline values with slight variation
      value = 0.25 + Math.random() * 0.15 + Math.sin(i / 24) * 0.05;
    }

    return {
      date: new Date(timestamp * 1000).toLocaleString('en-US', {
        month: 'numeric',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      All: parseFloat(value.toFixed(4)),
    };
  });
};

const dummyChartData: GraphViewData = generateSampleData();

// Data with decreasing trend at the end (183 data points)
// const generateSparseDecreasingData = (): GraphViewData => {
//   const baseTimestamp = 1760839200;
//   const dayInterval = 24 * 3600; // 1 day interval
//   const dataPoints = 300;
//   const peakEndPoint = Math.floor(dataPoints * 0.15); // Peak maintained until 15%
//   const middleDropStart = Math.floor(dataPoints * 0.3); // Start dropping at 30%
//   const middleStableEnd = Math.floor(dataPoints * 0.7); // Maintain middle level until 70%
//   const decreaseStartPoint = middleStableEnd; // Start final decrease at 70%

//   return Array.from({ length: dataPoints }, (_, i) => {
//     const timestamp = baseTimestamp + i * dayInterval;
//     let value;

//     if (i <= peakEndPoint) {
//       // Initial peak period (0-15%)
//       const baseValue = 1.5;
//       const variation = Math.random() * 0.2 - 0.1 + Math.sin(i / 10) * 0.08;
//       value = Math.max(1.3, Math.min(1.7, baseValue + variation));
//     } else if (i < middleDropStart) {
//       // Transition from peak to middle (15-30%)
//       const progress = (i - peakEndPoint) / (middleDropStart - peakEndPoint);
//       const baseValue = 1.5 - progress * 0.4; // Drop from 1.5 to 1.1
//       const variation = Math.random() * 0.2 - 0.1 + Math.sin(i / 15) * 0.08;
//       value = Math.max(1.0, Math.min(1.6, baseValue + variation));
//     } else if (i < decreaseStartPoint) {
//       // Middle stable period (30-70%)
//       const baseValue = 1.1;
//       const variation = Math.random() * 0.2 - 0.1 + Math.sin(i / 20) * 0.08;
//       value = Math.max(0.9, Math.min(1.3, baseValue + variation));
//     } else {
//       // Final decreasing trend from 70% onwards
//       const progressInDecrease = (i - decreaseStartPoint) / (dataPoints - decreaseStartPoint);
//       const baseValue = 1.1 - progressInDecrease * 0.85; // Decrease from 1.1 to 0.25
//       const variation = Math.random() * 0.15 - 0.075 + Math.sin(i / 20) * 0.06;
//       value = Math.max(0.2, baseValue + variation);
//     }

//     return {
//       date: new Date(timestamp * 1000).toLocaleString('en-US', {
//         month: 'numeric',
//         day: 'numeric',
//         hour: '2-digit',
//         minute: '2-digit',
//       }),
//       All: parseFloat(value.toFixed(4)),
//     };
//   });
// };

// const sparseDecreasingData: GraphViewData = generateSparseDecreasingData();

// Data with shorter initial peak (200 data points)
// const generateShortPeakDecreasingData = (): GraphViewData => {
//   const baseTimestamp = 1760839200;
//   const dayInterval = 24 * 3600; // 1 day interval
//   const dataPoints = 730;
//   const peakEndPoint = Math.floor(dataPoints * 0.05); // Peak maintained until 5%
//   const middleDropStart = Math.floor(dataPoints * 0.2); // Start dropping at 20%
//   const middleStableEnd = Math.floor(dataPoints * 0.7); // Maintain middle level until 70%
//   const decreaseStartPoint = middleStableEnd; // Start final decrease at 70%

//   return Array.from({ length: dataPoints }, (_, i) => {
//     const timestamp = baseTimestamp + i * dayInterval;
//     let value;

//     if (i <= peakEndPoint) {
//       // Initial peak period (0-5%)
//       const baseValue = 1.5;
//       const variation = Math.random() * 0.2 - 0.1 + Math.sin(i / 10) * 0.08;
//       value = Math.max(1.3, Math.min(1.7, baseValue + variation));
//     } else if (i < middleDropStart) {
//       // Transition from peak to middle (5-20%)
//       const progress = (i - peakEndPoint) / (middleDropStart - peakEndPoint);
//       const baseValue = 1.5 - progress * 0.4; // Drop from 1.5 to 1.1
//       const variation = Math.random() * 0.2 - 0.1 + Math.sin(i / 15) * 0.08;
//       value = Math.max(1.0, Math.min(1.6, baseValue + variation));
//     } else if (i < decreaseStartPoint) {
//       // Middle stable period (20-70%)
//       const baseValue = 1.1;
//       const variation = Math.random() * 0.2 - 0.1 + Math.sin(i / 20) * 0.08;
//       value = Math.max(0.9, Math.min(1.3, baseValue + variation));
//     } else {
//       // Final decreasing trend from 70% onwards
//       const progressInDecrease = (i - decreaseStartPoint) / (dataPoints - decreaseStartPoint);
//       const baseValue = 1.1 - progressInDecrease * 0.85; // Decrease from 1.1 to 0.25
//       const variation = Math.random() * 0.15 - 0.075 + Math.sin(i / 20) * 0.06;
//       value = Math.max(0.2, baseValue + variation);
//     }

//     return {
//       date: new Date(timestamp * 1000).toLocaleString('en-US', {
//         month: 'numeric',
//         day: 'numeric',
//         hour: '2-digit',
//         minute: '2-digit',
//       }),
//       All: parseFloat(value.toFixed(4)),
//     };
//   });
// };

// const shortPeakDecreasingData: GraphViewData = generateShortPeakDecreasingData();

const dummyDateRange: [Date, Date] = [new Date(1760839200 * 1000), new Date((1760839200 + 729 * 3600) * 1000)];

// Wrapper component to bypass the hook
const AreaChartTileStory = (props: GraphViewProps & { loading?: boolean; editMode?: boolean }) => {
  const { loading = false, editMode = false, ...graphViewProps } = props;

  return (
    <NextIntlClientProvider locale='ja' messages={jaMessages}>
      <EditModeContext.Provider value={editMode}>
        <LoadingOverlay visible={loading} />
        <GraphViewInner {...graphViewProps} loading={loading} />
      </EditModeContext.Provider>
    </NextIntlClientProvider>
  );
};

const meta: Meta<typeof AreaChartTileStory> = {
  title: 'mf-core/components/AreaChartTile',
  component: AreaChartTileStory,

  decorators: [
    (Story) => (
      <Card ta='center' w='500px' h='250px' withBorder>
        <Story />
      </Card>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof AreaChartTileStory>;

export const Primary: Story = {
  args: {
    title: '電力消費量',
    data: dummyChartData,
    valueFormatter: formatEnergyValue,
    linkTitle: 'Summary',
    link: undefined,
    query: { tab: 'all' },
    dateRange: [new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000), new Date()],
    showMenu: false,
    loading: false,
    editMode: false,
  },
};

export const Loading: Story = {
  args: {
    title: 'Energy Consumptions',
    data: dummyChartData,
    valueFormatter: formatEnergyValue,
    linkTitle: 'Summary',
    link: '/cdim/res-summary',
    query: { tab: 'all' },
    dateRange: dummyDateRange,
    loading: true,
    editMode: false,
  },
};

export const NoData: Story = {
  args: {
    title: 'Energy Consumptions',
    data: [],
    valueFormatter: formatEnergyValue,
    linkTitle: 'Summary',
    link: '/cdim/res-summary',
    query: { tab: 'all' },
    dateRange: dummyDateRange,
    loading: false,
    editMode: false,
  },
};

/** Link disabled */
export const EditMode: Story = {
  args: {
    title: '電力消費量',
    data: dummyChartData,
    valueFormatter: formatEnergyValue,
    linkTitle: 'Summary',
    link: undefined,
    query: { tab: 'all' },
    // dateRange: dummyDateRange,
    dateRange: [new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000), new Date()],
    loading: false,
    editMode: true,
    showMenu: false,
  },
};

export const CPUDevice: Story = {
  args: {
    title: 'Energy Consumptions',
    data: dummyChartData.map((item) => ({
      date: item.date,
      CPU: item.All,
    })),
    valueFormatter: formatEnergyValue,
    linkTitle: 'Summary',
    link: '/cdim/res-summary',
    query: { tab: 'CPU' },
    dateRange: dummyDateRange,
    loading: false,
    editMode: false,
  },
};
