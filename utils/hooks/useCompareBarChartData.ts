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

import { useLocale, useTranslations } from 'next-intl';
import useSWRImmutable from 'swr/immutable';

import { APIDeviceType, APIPromQLMetrics, APIPromQLRange } from '@/shared-modules/types';
import { fetcher, parseStringIntoNumber } from '@/shared-modules/utils';
// import { useMSW } from '@/shared-modules/utils/hooks';

const previousColor = 'blue.2';
const lastColor = 'blue.6';

export type compareBarChartDataType = {
  tooltipLabel: { [key: string]: string };
  last?: number;
  previous?: number;
  xtics: null | string;
}[];

export const calcDiffAndRatio = (num1: number | null, num2: number | null) => {
  const diff = num1 != null && num2 != null ? num1 - num2 : null;
  const ratio = num2 === 0 || num2 == null || diff == null ? null : (diff / num2) * 100;
  return { diff, ratio };
};

/** Convert a timestamp to a Date object. If the local time is 0:00:00, the date is the day before. */
const getAdjustedDate = (timestamp: number) => {
  const date = new Date(timestamp);
  if (date.getHours() === 0 && date.getMinutes() === 0 && date.getSeconds() === 0 && date.getMilliseconds() === 0) {
    date.setDate(date.getDate() - 1);
  }
  return date;
};

/** Create data for comparison on a yearly basis, on a monthly basis. */
const parseForYear = (
  data: APIPromQLMetrics,
  start: Date,
  end: Date,
  locale: string,
  series: { name: string; color: string }[]
) => {
  // Create a Map to sum up APIPromQLMetrics on a "year-month" basis
  //   e.g. "202401" -> 1234.56
  const getMonthlyMapKey = (date: Date) => date.getFullYear() * 100 + (date.getMonth() + 1);
  const monthlyMap = new Map<number, number>();
  data.forEach(([timestamp, metric]) => {
    const dateObj = getAdjustedDate(timestamp * 1000);
    const key = getMonthlyMapKey(dateObj);
    const currentVal = monthlyMap.get(key) ?? 0;
    monthlyMap.set(key, currentVal + (parseStringIntoNumber(metric) ?? 0));
  });

  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short' };
  let previousTotal = 0;
  let lastTotal = 0;
  let allPreviousNull = true;
  let allLastNull = true;
  const chartData: compareBarChartDataType = [];
  const previousLabel = series[0].name;
  const lastLabel = series[1].name;

  const lastStart = new Date(start);
  lastStart.setMonth(lastStart.getMonth() + 12);
  for (let lastDate = new Date(lastStart); lastDate < end; lastDate.setMonth(lastDate.getMonth() + 1)) {
    // 'previousDate' is 1 year before 'date'
    const previousDate = new Date(lastDate);
    previousDate.setFullYear(previousDate.getFullYear() - 1);

    // Get the total value for the corresponding month from monthlyMap (if it doesn't exist, return null)
    const previousValue = monthlyMap.get(getMonthlyMapKey(previousDate)) ?? null;
    const lastValue = monthlyMap.get(getMonthlyMapKey(lastDate)) ?? null;
    if (lastValue !== null) {
      lastTotal += lastValue;
      allLastNull = false;
    }
    if (previousValue !== null) {
      previousTotal += previousValue;
      allPreviousNull = false;
    }
    chartData.push({
      [previousLabel]: previousValue,
      [lastLabel]: lastValue,
      xtics: lastDate.toLocaleDateString(locale, { month: 'short' }),
      tooltipLabel: {
        [previousLabel]: previousDate.toLocaleDateString(locale, options),
        [lastLabel]: lastDate.toLocaleDateString(locale, options),
      },
    });
  }
  return {
    chartData,
    previousTotal: allPreviousNull ? null : previousTotal,
    lastTotal: allLastNull ? null : lastTotal,
  };
};

// Create data for comparison on a monthly basis
const parseForMonth = (
  data: APIPromQLMetrics,
  start: Date,
  end: Date,
  locale: string,
  series: { name: string; color: string }[]
) => {
  // Create a Map to sum up APIPromQLMetrics on a "year-month-day" basis
  //   e.g. "20240101" -> 1234.56
  const getMapKey = (date: Date) => date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
  const dataMap = new Map(
    data.map(([timestamp, metric]: [number, string]) => [
      getMapKey(getAdjustedDate(timestamp * 1000)),
      parseStringIntoNumber(metric),
    ])
  );
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    weekday: 'short',
  };
  let previousTotal = 0;
  let lastTotal = 0;
  let allPreviousNull = true;
  let allLastNull = true;
  const chartData: compareBarChartDataType = [];
  const previousLabel = series[0].name;
  const lastLabel = series[1].name;

  const lastStart = new Date(start);
  lastStart.setDate(lastStart.getDate() + 28);
  for (let lastDate = lastStart; lastDate < end; lastDate.setDate(lastDate.getDate() + 1)) {
    // 'previousDate' is 28 days before 'date'
    const previousDate = new Date(lastDate);
    previousDate.setDate(previousDate.getDate() - 28);

    // Get the total value for the corresponding date from dataMap (if it doesn't exist, return null)
    const previousValue = dataMap.get(getMapKey(previousDate)) ?? null;
    const lastValue = dataMap.get(getMapKey(lastDate)) ?? null;
    if (previousValue !== null) {
      previousTotal += previousValue;
      allPreviousNull = false;
    }
    if (lastValue !== null) {
      lastTotal += lastValue;
      allLastNull = false;
    }
    chartData.push({
      [previousLabel]: previousValue,
      [lastLabel]: lastValue,
      xtics: null,
      tooltipLabel: {
        [previousLabel]: previousDate.toLocaleDateString(locale, options),
        [lastLabel]: lastDate.toLocaleDateString(locale, options),
      },
    });
  }
  return {
    chartData,
    previousTotal: allPreviousNull ? null : previousTotal,
    lastTotal: allLastNull ? null : lastTotal,
  };
};

const parseCompareBarChartData = (
  data: APIPromQLMetrics | undefined,
  period: 'day' | 'week' | 'month' | 'year',
  series: { name: string; color: string }[],
  locale: string,
  start: Date,
  end: Date
) => {
  if (!data || data.length === 0) {
    return {
      barChartData: [],
      diff: null,
      diffPercent: null,
      lastTotal: null,
      previousTotal: null,
    };
  }
  let parsed: {
    chartData: compareBarChartDataType;
    previousTotal: number | null;
    lastTotal: number | null;
  } = {
    chartData: [],
    previousTotal: null,
    lastTotal: null,
  };
  switch (period) {
    case 'year':
      parsed = parseForYear(data, start, end, locale, series);
      break;
    case 'month':
      parsed = parseForMonth(data, start, end, locale, series);
      break;
    // case 'day':
    //   result = parseForDay(values, start, end, locale);
    //   break;
    // case 'week':
    //   result = parseForWeek(values, start, end, locale);
    //   break;
  }
  const { diff, ratio: diffPercent } = calcDiffAndRatio(parsed.lastTotal, parsed.previousTotal);
  return {
    barChartData: parsed.chartData,
    diff: diff,
    diffPercent: diffPercent,
    lastTotal: parsed.lastTotal,
    previousTotal: parsed.previousTotal,
  };
};

/**
 * Custom hook for retrieving energy comparison bar chart data.
 * @returns An object containing the area chart properties, error status, and validation status.
 */
export const useCompareBarChartData = (
  deviceType: 'all' | APIDeviceType,
  period: 'day' | 'week' | 'month' | 'year'
) => {
  // const mswInitializing = useMSW();
  const mswInitializing = false; // Do not use MSW
  const t = useTranslations();
  const locale = useLocale();

  let step = '';
  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  let series: { name: string; color: string }[] = [];

  switch (period) {
    // case 'day':
    //   end.setHours(now.getHours()); // XX:00:00.000
    //   start.setHours(end.getHours() - 24);
    //   step = '1h';
    //   break;
    // case 'week':
    //   start.setDate(end.getDate() - 7);
    //   step = '1d';
    //   break;
    case 'month':
      start.setDate(end.getDate() - 56);
      step = '1d';
      series = [
        { name: t('Previous 4 weeks'), color: previousColor },
        { name: t('Last 4 weeks'), color: lastColor },
      ];
      break;
    case 'year':
      end.setDate(1); // Set the first day of the month
      start.setDate(1); // Set the first day of the month
      start.setMonth(start.getMonth() - 24); // set 24 months ago
      step = '1d';
      series = [
        { name: t('Previous 12 months'), color: previousColor },
        { name: t('Last 12 months'), color: lastColor },
      ];
      break;
  }
  // Convert to ISO 8601 format string, (Request in the UI time zone.)
  const startStr = start.toISOString();
  const endStr = end.toISOString();
  const periodQuery = `&start=${startStr}&end=${endStr}&step=${step}`;
  // NOTE: Conversion factor is 86400 if step is 1d, otherwise 3600 if step is 1h.
  // const convFactor = step === '1d' ? '86400' : '3600';
  const convFactor = '86400';
  const QUERY = `label_replace(sum(increase({__name__=~".*_metricEnergyJoules_reading",job=~".*"}[${step}])/${convFactor}),"data_label","${deviceType}_energy","","")${periodQuery}`;

  const { data, error, isValidating } = useSWRImmutable<APIPromQLRange & { url?: string }>(
    !mswInitializing && `${process.env.NEXT_PUBLIC_URL_BE_PERFORMANCE_MANAGER}/query_range?query=${QUERY}`,
    fetcher
  );

  const energy = data?.data?.result?.[0]?.values;
  const { barChartData, diff, diffPercent, lastTotal, previousTotal } = parseCompareBarChartData(
    energy,
    period,
    series,
    locale,
    start,
    end
  );

  return {
    barChartData,
    barChartError: error,
    barChartValidating: isValidating,
    series,
    diff,
    diffPercent,
    lastTotal,
    previousTotal,
  };
};
