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

import { useTranslations } from 'next-intl';

import { VIEW_LAYOUT, VIEW_RESOURCE } from '@/shared-modules/constant';
import { APIDeviceType } from '@/shared-modules/types';
import { usePermission } from '@/shared-modules/utils/hooks';
import _ from 'lodash';

import {
  AlertSeverity,
  LayoutApplyTileState,
  NodeTileState,
  ProgressTileState,
  ResourceTileState,
  TileDataItem,
} from '@/types/TileData';

import { AreaChartTile, BarChartTile, BaseTile, DonutChartTile, NumberTile, ProgressTile } from '@/components';

import {
  useCompareBarChartTile,
  useEnergyDonutChartTile,
  useLayoutApplyNumberTile,
  useNodeNumberTile,
  useResourceNumberTile,
  useResourceProgressTile,
} from '@/utils/hooks';
import { useAlertNumberTile } from '@/utils/hooks/useAlertNumberTile';

/**
 * Renders a number tile based on the target data type.
 */
const renderNumberTile = (
  tileData: TileDataItem & { tileType: 'number' },
  deleteTile: CallableFunction,
  t: ReturnType<typeof useTranslations>,
  hasViewResource: boolean,
  hasViewLayout: boolean
) => {
  switch (tileData.targetData) {
    case 'node': {
      const state = tileData.state;
      const title: Record<NodeTileState, string> = {
        all: t('Total Nodes'),
        ok: t('Healthy Nodes'),
        critical: t('Critical Nodes'),
        warning: t('Warning Nodes'),
        disabled: t('Disabled Nodes'),
      };
      return (
        <BaseTile tileTitle={title[state]} deleteTile={deleteTile} hasPermission={hasViewResource}>
          <NodeNumberTile title={title[state]} state={state} />
        </BaseTile>
      );
    }
    case 'resource': {
      const state = tileData.state;
      const title: Record<ResourceTileState, string> = {
        all: t('Total Resources'),
        ok: t('Healthy Resources'),
        critical: t('Critical Resources'),
        warning: t('Warning Resources'),
        disabled: t('Disabled Resources'),
        unallocated: t('Unallocated Resources'),
        designAvailable: t('Design Available Resources'),
        designUnavailable: t('Design Unavailable Resources'),
        maintenance: t('Maintenance Resources'),
      };
      return (
        <BaseTile tileTitle={title[state]} deleteTile={deleteTile} hasPermission={hasViewResource}>
          <ResourceNumberTile title={title[state]} state={state} />
        </BaseTile>
      );
    }
    case 'layout-apply': {
      const state = tileData.state;
      const title: Record<LayoutApplyTileState, string> = {
        suspended: `${t('LayoutApplies.number')}\n(${t('Suspended.status')})`,
        failed: `${t('LayoutApplies.number')}\n(${t('Failed')})`,
      };
      return (
        <BaseTile tileTitle={title[state]} deleteTile={deleteTile} hasPermission={hasViewLayout}>
          <LayoutApplyNumberTile title={title[state]} state={state} />
        </BaseTile>
      );
    }
    case 'alert': {
      const severity = tileData.severity;
      const title = `${t('Alerts')}\n(${_.upperFirst(severity)})`;
      return (
        <BaseTile tileTitle={title} deleteTile={deleteTile} hasPermission={hasViewResource}>
          <AlertNumberTile title={title} severity={severity} />
        </BaseTile>
      );
    }
    default: {
      return (
        <BaseTile tileTitle={undefined} deleteTile={deleteTile} hasPermission={false}>
          <div>{t('Not Found')}</div>
        </BaseTile>
      );
    }
  }
};

/**
 * Renders a tile component based on the provided tile data.
 *
 * @param props - The props for the Tile component.
 * @param props.tileData - The data for the tile.
 * @param props.deleteTile - The function to delete the tile.
 * @returns The rendered tile component.
 */
export const Tile = (props: { tileData: TileDataItem; deleteTile: CallableFunction }) => {
  const t = useTranslations();
  const hasViewResource = usePermission(VIEW_RESOURCE);
  const hasViewLayout = usePermission(VIEW_LAYOUT);
  switch (props.tileData.tileType) {
    case 'number': {
      return renderNumberTile(props.tileData, props.deleteTile, t, hasViewResource, hasViewLayout);
    }
    case 'progress': {
      const title = t(`Allocated Resources`);
      return (
        <BaseTile tileTitle={title} deleteTile={props.deleteTile} hasPermission={hasViewResource}>
          <ResourceProgressTile title={title} state={props.tileData.state} />
        </BaseTile>
      );
    }
    case 'area-chart': {
      return (
        <BaseTile tileTitle={t('Energy Consumptions')} deleteTile={props.deleteTile} hasPermission={hasViewResource}>
          <AreaChartTile deviceType={'all'} period={'month'} />
        </BaseTile>
      );
    }
    case 'donut-chart': {
      const title = `${t('Energy Consumptions ratio by type')}\n(${t('The past month')})`;
      return (
        <BaseTile tileTitle={title} deleteTile={props.deleteTile} hasPermission={hasViewResource}>
          <EnergyDonutChartTile title={title} />
        </BaseTile>
      );
    }
    case 'bar-chart': {
      const title = `${t('Energy Consumptions')}`;
      const subTitle = `${props.tileData.period === 'month' ? t('4 weeks comparison') : t('Year comparison')}`;
      const baseTitle = `${title} ${subTitle}`;
      return (
        <BaseTile tileTitle={baseTitle} deleteTile={props.deleteTile} hasPermission={hasViewResource}>
          <CompareBarChartTile title={title} subTitle={subTitle} deviceType='all' period={props.tileData.period} />
        </BaseTile>
      );
    }
    default:
      // return <div>{t('Not Found')}</div>;
      return (
        <BaseTile tileTitle={undefined} deleteTile={props.deleteTile} hasPermission={false}>
          <div>{t('Not Found')}</div>
        </BaseTile>
      );
  }
};

/**
 * Renders a tile component for displaying a number.
 *
 * @param props - The props for the NodeNumberTile component.
 * @returns The rendered NodeNumberTile component.
 */
const NodeNumberTile = (props: { title: string; state: NodeTileState }) => {
  const numberTileProps = useNodeNumberTile(props.state);

  return <NumberTile {...numberTileProps} title={props.title} />;
};

/**
 * Renders a tile component for displaying a number.
 *
 * @param props - The props for the ResourceNumberTile component.
 * @returns The rendered ResourceNumberTile component.
 */
const ResourceNumberTile = (props: { title: string; state: ResourceTileState }) => {
  const numberTileProps = useResourceNumberTile(props.state);

  return <NumberTile {...numberTileProps} title={props.title} />;
};

/**
 * Renders a tile component for displaying a number.
 *
 * @param props - The props for the ResourceProgressTile component.
 * @returns The rendered ResourceProgressTile component.
 */
const ResourceProgressTile = (props: { title: string; state: ProgressTileState }) => {
  const progressTileProps = useResourceProgressTile(props.state);

  return <ProgressTile {...progressTileProps} title={props.title} />;
};

/**
 * A component that displays a donut chart tile with a title, number, and link.
 * @param props - The props for the EnergyDonutChartTile component.
 * @returns The rendered EnergyDonutChartTile component.
 */
const EnergyDonutChartTile = (props: { title: string }) => {
  const donutChartTileProps = useEnergyDonutChartTile();

  return <DonutChartTile {...donutChartTileProps} title={props.title} />;
};

/**
 * A component that displays a number tile with a title, number, and link.
 * @param props - The props for the LayoutApplyNumberTile component.
 * @returns The rendered LayoutApplyNumberTile component.
 */
const LayoutApplyNumberTile = (props: { title: string; state: LayoutApplyTileState }) => {
  const numberTileProps = useLayoutApplyNumberTile(props.state);

  return <NumberTile {...numberTileProps} title={props.title} />;
};

const CompareBarChartTile = (props: {
  title: string;
  subTitle: string;
  deviceType: 'all' | APIDeviceType;
  period: 'day' | 'week' | 'month' | 'year';
}) => {
  const { deviceType, period } = props;
  const barChartTileProps = useCompareBarChartTile(deviceType, period);

  return <BarChartTile {...barChartTileProps} title={props.title} subTitle={props.subTitle} />;
};

/**
 * A component that displays a number tile for alert counts.
 * @param props - The props for the AlertNumberTile component.
 * @returns The rendered AlertNumberTile component.
 */
const AlertNumberTile = (props: { title: string; severity: AlertSeverity }) => {
  const numberTileProps = useAlertNumberTile(props.severity);

  return <NumberTile {...numberTileProps} title={props.title} />;
};
