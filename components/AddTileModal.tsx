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

import NextImage, { StaticImageData } from 'next/image';

import { Button, Group, Image, Modal, Radio, ScrollArea, Stack, Text, Title } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useLocale, useTranslations } from 'next-intl';

import { TileDataItem, TileSize } from '@/types/TileData';

import tileClasses from '@/styles/tile.module.css';

import AreaChartEnergyComsumptionAllEnImg from '../public/images/en/areaChart-energyComsumption-all.png';
import DonutChartEnergyComsumptionAllEnImg from '../public/images/en/donutChart-energyComsumption-all.png';
import NumberLayoutApplyFailedEnImg from '../public/images/en/number-layoutApply-failed.png';
import NumberLayoutApplySuspendedEnImg from '../public/images/en/number-layoutApply-suspended.png';
import NumberNodeAllEnImg from '../public/images/en/number-node-all.png';
import NumberNodeCriticalEnImg from '../public/images/en/number-node-critical.png';
import NumberNodeDisabledEnImg from '../public/images/en/number-node-disabled.png';
import NumberNodeOkEnImg from '../public/images/en/number-node-ok.png';
import NumberNodeWarningEnImg from '../public/images/en/number-node-warning.png';
import NumberResourceAllEnImg from '../public/images/en/number-resource-all.png';
import NumberResourceAllocatedEnImg from '../public/images/en/number-resource-allocated.png';
import NumberResourceCriticalEnImg from '../public/images/en/number-resource-critical.png';
import NumberResourceDisabledEnImg from '../public/images/en/number-resource-disabled.png';
import NumberResourceExcludedEnImg from '../public/images/en/number-resource-excluded.png';
import NumberResourceIncludedEnImg from '../public/images/en/number-resource-included.png';
import NumberResourceOkEnImg from '../public/images/en/number-resource-ok.png';
import NumberResourceUnallocatedEnImg from '../public/images/en/number-resource-unallocated.png';
import NumberResourceWarningEnImg from '../public/images/en/number-resource-warning.png';
import AreaChartEnergyComsumptionAllImg from '../public/images/ja/areaChart-energyComsumption-all.png';
import DonutChartEnergyComsumptionAllImg from '../public/images/ja/donutChart-energyComsumption-all.png';
import BarChartEnergyComsumptionAllImg from '../public/images/tileImg/barChart-energyComsumption-all.png';
import NumberLayoutApplyFailedImg from '../public/images/ja/number-layoutApply-failed.png';
import NumberLayoutApplySuspendedImg from '../public/images/ja/number-layoutApply-suspended.png';
import NumberNodeAllImg from '../public/images/ja/number-node-all.png';
import NumberNodeCriticalImg from '../public/images/ja/number-node-critical.png';
import NumberNodeDisabledImg from '../public/images/ja/number-node-disabled.png';
import NumberNodeOkImg from '../public/images/ja/number-node-ok.png';
import NumberNodeWarningImg from '../public/images/ja/number-node-warning.png';
import NumberResourceAllImg from '../public/images/ja/number-resource-all.png';
import NumberResourceAllocatedImg from '../public/images/ja/number-resource-allocated.png';
import NumberResourceCriticalImg from '../public/images/ja/number-resource-critical.png';
import NumberResourceDisabledImg from '../public/images/ja/number-resource-disabled.png';
import NumberResourceExcludedImg from '../public/images/ja/number-resource-excluded.png';
import NumberResourceIncludedImg from '../public/images/ja/number-resource-included.png';
import NumberResourceOkImg from '../public/images/ja/number-resource-ok.png';
import NumberResourceUnallocatedImg from '../public/images/ja/number-resource-unallocated.png';
import NumberResourceWarningImg from '../public/images/ja/number-resource-warning.png';

/**
 * Modal to add a tile
 *
 * @component
 * @param {boolean} isModalOpen - Whether the modal is open.
 * @param {Function} closeModal - Function to close the modal.
 * @param {Function} submit - Function to submit the form.
 * @returns The AddTileModal component.
 */
export const AddTileModal = ({
  isModalOpen,
  closeModal,
  submit,
}: {
  isModalOpen: boolean;
  closeModal: () => void;
  submit: CallableFunction;
}) => {
  const t = useTranslations();
  const form = useForm<{ tileTitle: string }>({
    initialValues: { tileTitle: '' },
    validateInputOnChange: true,
  });

  const TILE_DATA_ITEMS: { [key: string]: TileDataItem } = {
    [t('Total Nodes')]: { tileType: 'number', targetData: 'node', state: 'all' },
    [t('Healthy Nodes')]: { tileType: 'number', targetData: 'node', state: 'ok' },
    [t('Critical Nodes')]: { tileType: 'number', targetData: 'node', state: 'critical' },
    [t('Warning Nodes')]: { tileType: 'number', targetData: 'node', state: 'warning' },
    [t('Disabled Nodes')]: { tileType: 'number', targetData: 'node', state: 'disabled' },
    [t('Total Resources')]: { tileType: 'number', targetData: 'resource', state: 'all' },
    [t('Healthy Resources')]: { tileType: 'number', targetData: 'resource', state: 'ok' },
    [t('Critical Resources')]: { tileType: 'number', targetData: 'resource', state: 'critical' },
    [t('Warning Resources')]: { tileType: 'number', targetData: 'resource', state: 'warning' },
    [t('Disabled Resources')]: { tileType: 'number', targetData: 'resource', state: 'disabled' },
    [t('Allocated Resources')]: { tileType: 'progress', targetData: 'resource', state: 'allocated' },
    [t('Unallocated Resources')]: { tileType: 'number', targetData: 'resource', state: 'unallocated' },
    [t('Included Resources')]: { tileType: 'number', targetData: 'resource', state: 'included' },
    [t('Excluded Resources')]: { tileType: 'number', targetData: 'resource', state: 'excluded' },
    [`${t('LayoutApplies.number')} ${t('Suspended.status')}`]: {
      tileType: 'number',
      targetData: 'layout-apply',
      state: 'suspended',
    },
    [`${t('LayoutApplies.number')} ${t('Failed')}`]: {
      tileType: 'number',
      targetData: 'layout-apply',
      state: 'failed',
    },
    [t('Energy Consumptions')]: {
      tileType: 'area-chart',
      targetData: 'energy-consumptions',
      deviceType: 'all',
      period: 'month',
    },
    [t('Energy Consumptions ratio by type')]: {
      tileType: 'donut-chart',
      targetData: 'energy-consumptions',
      deviceType: 'all',
      period: 'month',
    },
    [`${t('Energy Consumptions')} ${t('4 weeks comparison')}`]: {
      tileType: 'bar-chart',
      targetData: 'energy-consumptions',
      deviceType: 'all',
      period: 'month',
    },
    [`${t('Energy Consumptions')} ${t('Year comparison')}`]: {
      tileType: 'bar-chart',
      targetData: 'energy-consumptions',
      deviceType: 'all',
      period: 'year',
    },
  };

  const TILE_SIZES: { [key: string]: TileSize } = {
    [t('Total Nodes')]: { w: 2, h: 2 },
    [t('Healthy Nodes')]: { w: 2, h: 2 },
    [t('Critical Nodes')]: { w: 2, h: 2 },
    [t('Warning Nodes')]: { w: 2, h: 2 },
    [t('Disabled Nodes')]: { w: 2, h: 2 },
    [t('Total Resources')]: { w: 2, h: 2 },
    [t('Healthy Resources')]: { w: 2, h: 2 },
    [t('Critical Resources')]: { w: 2, h: 2 },
    [t('Warning Resources')]: { w: 2, h: 2 },
    [t('Disabled Resources')]: { w: 2, h: 2 },
    [t('Allocated Resources')]: { w: 2, h: 2 },
    [t('Unallocated Resources')]: { w: 2, h: 2 },
    [t('Included Resources')]: { w: 2, h: 2 },
    [t('Excluded Resources')]: { w: 2, h: 2 },
    [`${t('LayoutApplies.number')} ${t('Suspended.status')}`]: { w: 2, h: 2 },
    [`${t('LayoutApplies.number')} ${t('Failed')}`]: { w: 2, h: 2 },
    [t('Energy Consumptions')]: { w: 6, h: 4 },
    [t('Energy Consumptions ratio by type')]: { w: 4, h: 4 },
    [`${t('Energy Consumptions')} ${t('4 weeks comparison')}`]: { w: 16, h: 4 },
    [`${t('Energy Consumptions')} ${t('Year comparison')}`]: { w: 16, h: 4 },
  };

  const close = () => {
    closeModal();
    form.reset();
  };

  return (
    <Modal
      opened={isModalOpen}
      onClose={close}
      lockScroll={false}
      title={
        <Group>
          <Title order={3} fz='lg' fw={700}>
            {t('Add Tile')}
          </Title>
        </Group>
      }
      size={550}
    >
      <form
        onSubmit={form.onSubmit((values) => {
          submit({ tileDataItem: TILE_DATA_ITEMS[values.tileTitle], tileSize: TILE_SIZES[values.tileTitle] });
          form.reset();
        })}
      >
        <ScrollArea h={500}>
          <Radio.Group
            onChange={(title) => {
              form.setFieldValue('tileTitle', title);
            }}
          >
            <RadioCards />
          </Radio.Group>
        </ScrollArea>
        <Group gap={10} justify='end' pt={10}>
          <Button variant='outline' color='dark' onClick={close}>
            {t('Cancel')}
          </Button>
          <Button type='submit' disabled={!form.isDirty()}>
            {t('Add')}
          </Button>
        </Group>
      </form>
    </Modal>
  );
};

// eslint-disable-next-line complexity
const RadioCards = () => {
  const IMAGE_SIZE = 130;
  const t = useTranslations();
  const locale = useLocale();

  const SELECT_TILES: { img: StaticImageData; title: string; description: string }[] = [
    {
      img: locale === 'ja' ? NumberNodeAllImg : NumberNodeAllEnImg,
      title: t('Total Nodes'),
      description: t('Total number of nodes currently configured'),
    },
    {
      img: locale === 'ja' ? NumberNodeOkImg : NumberNodeOkEnImg,
      title: t('Healthy Nodes'),
      description: t('Number of nodes with all resources in a healthy (OK) state'),
    },
    {
      img: locale === 'ja' ? NumberNodeCriticalImg : NumberNodeCriticalEnImg,
      title: t('Critical Nodes'),
      description: t('Number of nodes with resources in a critical state'),
    },
    {
      img: locale === 'ja' ? NumberNodeWarningImg : NumberNodeWarningEnImg,
      title: t('Warning Nodes'),
      description: t('Number of nodes with resources in a warning state'),
    },
    {
      img: locale === 'ja' ? NumberNodeDisabledImg : NumberNodeDisabledEnImg,
      title: t('Disabled Nodes'),
      description: t('Number of nodes with resources in a disabled state'),
    },
    {
      img: locale === 'ja' ? NumberResourceAllImg : NumberResourceAllEnImg,
      title: t('Total Resources'),
      description: t('Number of managed resources'),
    },
    {
      img: locale === 'ja' ? NumberResourceOkImg : NumberResourceOkEnImg,
      title: t('Healthy Resources'),
      description: t('Number of resources in a healthy (OK) state'),
    },
    {
      img: locale === 'ja' ? NumberResourceCriticalImg : NumberResourceCriticalEnImg,
      title: t('Critical Resources'),
      description: t('Number of resources in a critical state'),
    },
    {
      img: locale === 'ja' ? NumberResourceWarningImg : NumberResourceWarningEnImg,
      title: t('Warning Resources'),
      description: t('Number of resources in a warning state'),
    },
    {
      img: locale === 'ja' ? NumberResourceDisabledImg : NumberResourceDisabledEnImg,
      title: t('Disabled Resources'),
      description: t('Number of resources in a disabled state'),
    },
    {
      img: locale === 'ja' ? NumberResourceAllocatedImg : NumberResourceAllocatedEnImg,
      title: t('Allocated Resources'),
      description: t('Number of resources allocated to nodes as a number and display the ratio in a graph'),
    },
    {
      img: locale === 'ja' ? NumberResourceUnallocatedImg : NumberResourceUnallocatedEnImg,
      title: t('Unallocated Resources'),
      description: t('Number of resources that are unallocated and unused'),
    },
    {
      img: locale === 'ja' ? NumberResourceIncludedImg : NumberResourceIncludedEnImg,
      title: t('Included Resources'),
      description: t('Number of resources that are available as a design target'),
    },
    {
      img: locale === 'ja' ? NumberResourceExcludedImg : NumberResourceExcludedEnImg,
      title: t('Excluded Resources'),
      description: t('Number of resources that are unavailable as a design target'),
    },
    {
      img: locale === 'ja' ? NumberLayoutApplySuspendedImg : NumberLayoutApplySuspendedEnImg,
      title: `${t('LayoutApplies.number')} ${t('Suspended.status')}`,
      description: t(
        'Number of layout applies that have stopped reflecting the design (an abnormality has occurred and the migration procedure has been stopped in the middle)'
      ),
    },
    {
      img: locale === 'ja' ? NumberLayoutApplyFailedImg : NumberLayoutApplyFailedEnImg,
      title: `${t('LayoutApplies.number')} ${t('Failed')}`,
      description: t('Number of layout applies that failed to reflect the design'),
    },
    {
      img: locale === 'ja' ? AreaChartEnergyComsumptionAllImg : AreaChartEnergyComsumptionAllEnImg,
      title: t('Energy Consumptions'),
      description: t('Display the total power consumption of resources in the last month in a time series graph'),
    },
    {
      img: locale === 'ja' ? DonutChartEnergyComsumptionAllImg : DonutChartEnergyComsumptionAllEnImg,
      title: t('Energy Consumptions ratio by type'),
      description: t(
        'Display the ratio of the total power consumption of each device type in the last month by resource type in a pie chart'
      ),
    },
    {
      img: BarChartEnergyComsumptionAllImg,
      title: `${t('Energy Consumptions')} ${t('4 weeks comparison')}`,
      description: t(
        'Display the power consumption of resources on a daily basis for the last 4 weeks and the previous 4 weeks in a graph'
      ),
    },
    {
      img: BarChartEnergyComsumptionAllImg,
      title: `${t('Energy Consumptions')} ${t('Year comparison')}`,
      description: t(
        'Display the power consumption of resources on a monthly basis for the last 12 months and the previous 12 months in a graph'
      ),
    },
  ];

  return (
    <Stack pb='1px' gap='xs'>
      {SELECT_TILES.map((tile) => (
        <Radio.Card radius='0' value={tile.title} key={tile.title} className={tileClasses.select}>
          <Group wrap='nowrap' align='center' justify='flex-start' pos='relative'>
            <Image radius='0' src={tile.img} h={IMAGE_SIZE} w={IMAGE_SIZE} component={NextImage} alt={tile.title} />
            <Stack gap='0' justify='flex-start' h='100%' pr='10px'>
              <Text fz='md' fw={600}>
                {tile.title}
              </Text>
              <Text>{tile.description}</Text>
            </Stack>
          </Group>
        </Radio.Card>
      ))}
    </Stack>
  );
};
