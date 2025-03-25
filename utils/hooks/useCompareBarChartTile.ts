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

import { useTranslations } from 'next-intl';

import { APIDeviceType } from '@/shared-modules/types';
import { formatEnergyValue } from '@/shared-modules/utils';

import { BarChartTileProps, useSetErrorInContext } from '@/components';

import { useCompareBarChartData } from '@/utils/hooks';

/**
 * Custom hook to fetch and format data for a comparative bar chart tile.
 *
 * @param deviceType - The type of device to filter the data. Can be 'all' or a specific APIDeviceType.
 * @param period - The time period for which to fetch the data. Can be 'day', 'week', 'month', or 'year'.
 * @returns An object containing the formatted bar chart data and related properties, excluding 'title' and 'subTitle'.
 */
export const useCompareBarChartTile = (
  deviceType: 'all' | APIDeviceType,
  period: 'day' | 'week' | 'month' | 'year'
): Omit<BarChartTileProps, 'title' | 'subTitle'> => {
  const t = useTranslations();

  const { barChartData, barChartError, barChartValidating, series, diff, diffPercent, lastTotal, previousTotal } =
    useCompareBarChartData(deviceType, period);

  /** Set error in context */
  useSetErrorInContext('barChartApi', barChartError);

  return {
    barChartData,
    linkTitle: t('Summary'),
    link: '/cdim/res-summary',
    loading: barChartValidating,
    query: { tab: 'all' },
    valueFormatter: formatEnergyValue,
    series: series,
    diff: diff,
    diffPercent: diffPercent,
    lastTotal: lastTotal,
    previousTotal: previousTotal,
  };
};
