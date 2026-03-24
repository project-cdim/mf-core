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

export type ResourceTileState =
  | 'all'
  | 'ok'
  | 'critical'
  | 'warning'
  | 'disabled'
  | 'unallocated'
  | 'designAvailable'
  | 'designUnavailable'
  | 'maintenance';
export type NumberTileDataResource = {
  tileType: 'number';
  targetData: 'resource';
  state: ResourceTileState;
};

export type NodeTileState = 'all' | 'ok' | 'critical' | 'warning' | 'disabled';
export type NumberTileDataNode = {
  tileType: 'number';
  targetData: 'node' | 'resource';
  state: NodeTileState;
};

export type LayoutApplyTileState = 'suspended' | 'failed';
export type NumberTileDataLayoutApply = {
  tileType: 'number';
  targetData: 'layout-apply';
  state: LayoutApplyTileState;
};

export type ChartTileData = {
  tileType: 'area-chart' | 'donut-chart' | 'bar-chart';
  targetData: 'energy-consumptions';
  deviceType: 'all';
  period: 'day' | 'week' | 'month' | 'year';
};

export type ProgressTileState = 'allocated' | 'unallocated';
export type ProgressTileData = {
  tileType: 'progress';
  targetData: 'resource';
  state: ProgressTileState;
};

export type AlertSeverity =
  | 'security'
  | 'critical'
  | 'major'
  | 'minor'
  | 'warning'
  | 'informational'
  | 'debug'
  | 'trace'
  | 'indeterminate'
  | 'cleared'
  | 'normal'
  | 'ok'
  | 'unknown';
export type NumberTileDataAlert = {
  tileType: 'number';
  targetData: 'alert';
  severity: AlertSeverity;
};

export type TileDataItem =
  | NumberTileDataResource
  | NumberTileDataNode
  | NumberTileDataLayoutApply
  | ChartTileData
  | ProgressTileData
  | NumberTileDataAlert;

export type TileData = {
  [key: string]: TileDataItem;
};

export type TileSize = {
  w: number;
  h: number;
};
