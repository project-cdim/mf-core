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

import { useContext, useMemo } from 'react';

import { ChartLegend, DonutChart } from '@mantine/charts';
import { Divider, LoadingOverlay, Stack, Title, getThemeColor, useMantineTheme } from '@mantine/core';
import { Payload } from 'recharts/types/component/DefaultLegendContent';

import { Multiline, NoData, PageLink } from '@/shared-modules/components';
import { CHART_COLORS } from '@/shared-modules/constant';
import { donutChartDataType } from '@/shared-modules/utils/hooks/useEnergyDonutChartData';

import { EditModeContext } from '@/pages/home';

export type DonutChartTileProps = {
  /** The title of the NumberTile. Line breaks should be represented as `\n`. */
  title: string;
  /** donutChartData */
  donutChartData: donutChartDataType;
  /** Loading state */
  loading: boolean;
  /** The title for the link associated with the NumberTile. */
  linkTitle?: string;
  /** The URL link associated with the NumberTile. */
  link?: string;
  /** The query for the ResourceList.  */
  query?: {
    [key: string]: string | string[];
  };
  valueFormatter: (value: number) => string;
};
/**
 * Renders a tile with a donut chart.
 *
 * @returns The JSX element representing the DonutChartTile component.
 */
export const DonutChartTile = (props: DonutChartTileProps) => {
  const { title, donutChartData, linkTitle, link, query, valueFormatter, loading } = props;
  const theme = useMantineTheme();
  const isEditMode = useContext(EditModeContext);

  // Exclude data whose value is 0 or undefined, because data whose value is falsy is not displayed in the graph
  const isValue = (d: { value?: number; name: string }): d is { value: number; name: string } =>
    typeof d.value === 'number' && d.value !== 0;
  // Sort data in descending order of value
  const filteredData = useMemo(
    () =>
      donutChartData
        .filter((d) => isValue(d))
        // @ts-ignore
        .sort((a, b) => a.value - b.value)
        .map((d, idx) => ({ ...d, color: CHART_COLORS[idx] })),
    [donutChartData]
  ) as {
    name: string;
    value: number;
    color: string;
  }[];

  const totalEnergy = filteredData?.reduce((acc, cur) => acc + cur.value, 0);
  const totalEnergyString = valueFormatter(totalEnergy);

  // istanbul ignore next
  const doNothing = () => void {};

  return (
    <>
      <LoadingOverlay visible={loading} />
      <Stack justify='space-between' gap='10px' h='100%'>
        <PageLink
          title={linkTitle}
          path={isEditMode ? undefined : link}
          query={query}
          color='rgb(55 65 81 / var(--tw-text-opacity))'
        >
          <Title order={4} ta='center'>
            <Multiline text={title} />
          </Title>
        </PageLink>
        <Divider />
        <NoData isNoData={filteredData.length <= 0}>
          <DonutChart
            data={filteredData}
            tooltipDataSource='segment'
            chartLabel={totalEnergyString}
            valueFormatter={valueFormatter}
            size={160}
            startAngle={90}
            endAngle={450}
            h='100%'
            mx='auto'
          />
          <ChartLegend
            payload={
              filteredData
                .map((d) => ({
                  color: getThemeColor(d.color, theme),
                  dataKey: d.name,
                  value: d.name,
                }))
                .reverse() as Payload[]
            }
            onHighlight={doNothing}
            legendPosition='middle'
            centered
            series={filteredData}
          />
        </NoData>
      </Stack>
    </>
  );
};
