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

import { formatEnergyValue } from '@/shared-modules/utils';
import { useEnergyDonutChartData } from '@/shared-modules/utils/hooks';

import { DonutChartTileProps, useSetErrorInContext } from '@/components';

/**
 * Custom hook for a number tile.
 *
 * @param defaultValue - The default values for the number tile. {@link useNodeNumberTileProps}.
 * @returns An object containing the base props, unique props, state, and data for the number tile.
 */
export const useEnergyDonutChartTile = (): Omit<DonutChartTileProps, 'title'> => {
  const t = useTranslations();

  const { donutChartData, donutChartValidating, donutChartError } = useEnergyDonutChartData();

  /** Set error in context */
  useSetErrorInContext('donutChartApi', donutChartError);

  return {
    donutChartData,
    linkTitle: t('Summary'),
    link: '/cdim/res-summary',
    loading: donutChartValidating,
    query: { tab: 'all' },
    valueFormatter: formatEnergyValue,
  };
};
