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

import { useContext } from 'react';

import { BarChart, ChartTooltip } from '@mantine/charts';
import { Box, Divider, Group, Indicator, Stack, Text, Title } from '@mantine/core';

import { NoData, PageLink } from '@/shared-modules/components';
import { formatPercentValue, valueToSiPrefix, signOfTheNumber, formatBySiPrefix } from '@/shared-modules/utils';

import { EditModeContext } from '@/app/[lng]/home/HomeContent';
import { compareBarChartDataType } from '@/utils/hooks';

export type BarChartTileProps = {
  title: string;
  subTitle: string;
  barChartData: compareBarChartDataType;
  loading: boolean;
  linkTitle?: string;
  link?: string;
  query?: {
    [key: string]: string | string[];
  };
  valueFormatter: (value: number | null | undefined) => string;
  series: { name: string; color: string }[];
  diff: number | null;
  diffPercent: number | null;
  lastTotal: number | null;
  previousTotal: number | null;
};

export const formatEnergyValueWithPrefix = (value: number | undefined | null, siPrefix: string = ''): string => {
  if (value === undefined || value === null) return '- Wh';
  siPrefix = siPrefix || valueToSiPrefix(value);
  return `${formatBySiPrefix(value, siPrefix)} ${siPrefix}Wh`;
};

/**
 * Renders an area chart tile component.
 *
 * @returns The rendered area chart tile component.
 */
export const BarChartTile = (props: BarChartTileProps) => {
  const {
    title,
    subTitle,
    barChartData,
    loading,
    linkTitle,
    link,
    query,
    valueFormatter,
    series,
    diff,
    diffPercent,
    lastTotal,
    previousTotal,
  } = props;
  const isEditMode = useContext(EditModeContext);

  const largerPrefix = valueToSiPrefix(Math.max(lastTotal ?? 0, previousTotal ?? 0));
  const percentage = `${signOfTheNumber(diffPercent)}${formatPercentValue(diffPercent)}`;
  const formattedDiff = `${signOfTheNumber(diff)}${formatEnergyValueWithPrefix(diff, largerPrefix)}`;

  return (
    <Indicator processing disabled={!loading} position='top-end' size={10} offset={4} h='100%' display='block'>
      <Box h='100%'>
        <Stack justify='flex-end' h={'100%'}>
          <PageLink
            title={linkTitle}
            path={isEditMode ? undefined : link}
            query={query}
            color='rgb(55 65 81 / var(--tw-text-opacity))'
          >
            <Group mih='2.90625rem' justify='space-between' align='end'>
              <Stack align='flex-start' gap='xs'>
                <Title order={3} size='h4'>
                  {title}
                </Title>
                <Text fz='sm' c='dimmed'>
                  {subTitle}
                </Text>
              </Stack>
              {previousTotal == null && lastTotal == null ? (
                <></>
              ) : (
                <Group mih='2.90625rem' justify='flex-end' align='end'>
                  <Text fz='1.875rem' fw={600}>
                    {percentage}
                  </Text>
                  <Text fz='1.875rem' fw={400}>
                    ({formattedDiff})
                  </Text>
                  <Stack h={50} align='flex-end' justify='center' gap='xs'>
                    <Text>
                      {series[0].name} : {formatEnergyValueWithPrefix(previousTotal, largerPrefix)}
                    </Text>
                    <Text>
                      {series[1].name} : {formatEnergyValueWithPrefix(lastTotal, largerPrefix)}
                    </Text>
                  </Stack>
                </Group>
              )}
            </Group>
          </PageLink>
          <Divider mb='auto' />
          <NoData isNoData={previousTotal == null && lastTotal == null}>
            <BarChart
              h={'80%'}
              data={barChartData}
              dataKey={'xtics'}
              series={series}
              withLegend
              valueFormatter={valueFormatter}
              barChartProps={{ barCategoryGap: '20%' }}
              tooltipProps={{
                content: ({ payload }) => (
                  // for changing each data label in tooltip.
                  <ChartTooltip
                    payload={payload?.map((item) => {
                      const value = item.payload[item.name];
                      const name = item.dataKey != null ? item.payload.tooltipLabel[item.dataKey] : '';
                      return {
                        ...item,
                        // to avoid increasing labels in tooltip
                        key: item.name,
                        // this is the key that will be used to display the label in the tooltip.
                        name: name,
                        payload: {
                          ...item.payload,
                          // display value in tooltip. key must be same as payload.name, so change to updated name.
                          [name]: value,
                        },
                      };
                    })}
                    series={series}
                    valueFormatter={valueFormatter}
                  />
                ),
              }}
            />
          </NoData>
        </Stack>
      </Box>
    </Indicator>
  );
};
