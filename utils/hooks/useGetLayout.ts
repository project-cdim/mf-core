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

import { Dispatch, SetStateAction, useContext, useEffect, useState } from 'react';

import _ from 'lodash';
import { useTranslations } from 'next-intl';
import { Layout } from 'react-grid-layout';

import { TileData } from '@/types/TileData';

import { ErrorsContext } from '@/components';

import { useUserId } from '@/utils/hooks';

export const DEFAULT_LAYOUT: Layout[] = [
  { i: 'd001', x: 0, y: 0, w: 2, h: 2 }, // node-critical
  { i: 'd002', x: 2, y: 0, w: 2, h: 2 }, // node-warning
  { i: 'd003', x: 4, y: 0, w: 2, h: 2 }, // node-all
  { i: 'd004', x: 6, y: 0, w: 2, h: 2 }, // resource-critical
  { i: 'd005', x: 8, y: 0, w: 2, h: 2 }, // resource-warning
  { i: 'd006', x: 10, y: 0, w: 2, h: 2 }, // resource-all
  { i: 'd007', x: 0, y: 2, w: 2, h: 2 }, // resource-allocated
  { i: 'd008', x: 0, y: 4, w: 2, h: 2 }, // layout-apply
  { i: 'd009', x: 2, y: 2, w: 6, h: 4 }, // energy-consumptions-area-chart
  { i: 'd010', x: 8, y: 2, w: 4, h: 4 }, //  energy-consumptions-per-types
];

export const DEFAULT_TILE_DATA: TileData = {
  d001: { tileType: 'number', targetData: 'node', state: 'critical' },
  d002: { tileType: 'number', targetData: 'node', state: 'warning' },
  d003: { tileType: 'number', targetData: 'node', state: 'all' },
  d004: { tileType: 'number', targetData: 'resource', state: 'critical' },
  d005: { tileType: 'number', targetData: 'resource', state: 'warning' },
  d006: { tileType: 'number', targetData: 'resource', state: 'all' },
  d007: { tileType: 'progress', targetData: 'resource', state: 'allocated' },
  d008: { tileType: 'number', targetData: 'layout-apply', state: 'suspended' },
  d009: { tileType: 'area-chart', targetData: 'energy-consumptions', deviceType: 'all', period: 'month' },
  d010: { tileType: 'donut-chart', targetData: 'energy-consumptions', deviceType: 'all', period: 'month' },
};

export const useGetLayout = (): [
  Layout[],
  TileData,
  Dispatch<SetStateAction<Layout[]>>,
  Dispatch<SetStateAction<TileData>>,
] => {
  const [, setErrorMessages] = useContext(ErrorsContext);
  const [layout, setLayout] = useState<Layout[]>(_.cloneDeep(DEFAULT_LAYOUT));
  const [tileData, setTileData] = useState<TileData>(_.cloneDeep(DEFAULT_TILE_DATA));
  const t = useTranslations();
  const userId = useUserId();

  useEffect(() => {
    if (userId) {
      try {
        const localLayout = localStorage.getItem(`CDIM.${userId}.dashboard.layout`);
        if (localLayout) {
          setLayout(JSON.parse(localLayout));
        }
        const localTileData = localStorage.getItem(`CDIM.${userId}.dashboard.tileData`);
        if (localTileData) {
          setTileData(JSON.parse(localTileData));
        }
        setErrorMessages((prev) => prev.filter((p) => p.apiName !== 'get'));
      } catch (error: any) {
        setErrorMessages((prev) => [
          ...prev,
          { title: t('Failed to get the dashboard data'), message: error.message ?? '', apiName: 'get' },
        ]);
      }
    }
  }, [userId, setErrorMessages]);

  return [layout, tileData, setLayout, setTileData];
};
