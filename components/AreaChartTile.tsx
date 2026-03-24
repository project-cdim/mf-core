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

import { LoadingOverlay } from '@mantine/core';

import { GraphViewInner } from '@/shared-modules/components';
import { APIDeviceType } from '@/shared-modules/types';
import { useGraphViewPropsOfAll } from '@/shared-modules/utils/hooks';

import { useSetErrorInContext } from '@/components';

import { EditModeContext } from '@/pages/home';

/**
 * Renders an area chart tile component.
 *
 * @returns The rendered area chart tile component.
 */
export const AreaChartTile = (props: {
  deviceType: 'all' | APIDeviceType;
  period: 'day' | 'week' | 'month' | 'year';
}) => {
  const { areaChartProps, areaChartError, areaChartValidating } = useGraphViewPropsOfAll(
    props.deviceType,
    props.period
  );
  useSetErrorInContext('areaChartApi', areaChartError);
  const isEditMode = useContext(EditModeContext);

  if (isEditMode) {
    areaChartProps.link = undefined;
  }

  return (
    <>
      <LoadingOverlay visible={areaChartValidating} />
      <GraphViewInner {...areaChartProps} loading={areaChartValidating} showMenu={false} />
    </>
  );
};
