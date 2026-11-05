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

import NextImage, { StaticImageData } from 'next/image';

import { Button, Group, Image, Modal, Radio, ScrollArea, Stack, Text, Title } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useTranslations } from 'next-intl';

import { TileDataItem, TileSize } from '@/types/TileData';

import tileClasses from '@/styles/tile.module.css';

import AreaChart from '../public/images/tileImg/areaChart.png';
import DonutChart from '../public/images/tileImg/donutChart.png';
import BarChart from '../public/images/tileImg/barChart.png';
import NumberWarning from '../public/images/tileImg/number-warning.png';
import NumberCritical from '../public/images/tileImg/number-critical.png';
import NumberPlain from '../public/images/tileImg/number-plain.png';
import NumberOk from '../public/images/tileImg/number-ok.png';
import NumberSuspended from '../public/images/tileImg/number-suspended.png';
import NumberUnavailable from '../public/images/tileImg/number-unavailable.png';
import NumberAllocated from '../public/images/tileImg/number-allocated.png';

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
    [t('Total Resources')]: { tileType: 'number', targetData: 'resource', state: 'all' },
    [t('Healthy Resources')]: { tileType: 'number', targetData: 'resource', state: 'ok' },
    [t('Critical Resources')]: { tileType: 'number', targetData: 'resource', state: 'critical' },
    [t('Warning Resources')]: { tileType: 'number', targetData: 'resource', state: 'warning' },
    [t('Not Detected Resources')]: { tileType: 'number', targetData: 'resource', state: 'notDetected' },
    [t('Allocated Resources')]: { tileType: 'progress', targetData: 'resource', state: 'allocated' },
    [t('Unallocated Resources')]: { tileType: 'number', targetData: 'resource', state: 'unallocated' },
    [t('Design Available Resources')]: { tileType: 'number', targetData: 'resource', state: 'designAvailable' },
    [t('Design Unavailable Resources')]: { tileType: 'number', targetData: 'resource', state: 'designUnavailable' },
    [t('Maintenance Resources')]: { tileType: 'number', targetData: 'resource', state: 'maintenance' },
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
    [`${t('Alerts')} (Critical)`]: { tileType: 'number', targetData: 'alert', severity: 'critical' },
    [`${t('Alerts')} (Warning)`]: { tileType: 'number', targetData: 'alert', severity: 'warning' },
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
    [t('Total Resources')]: { w: 2, h: 2 },
    [t('Healthy Resources')]: { w: 2, h: 2 },
    [t('Critical Resources')]: { w: 2, h: 2 },
    [t('Warning Resources')]: { w: 2, h: 2 },
    [t('Not Detected Resources')]: { w: 2, h: 2 },
    [t('Allocated Resources')]: { w: 2, h: 2 },
    [t('Unallocated Resources')]: { w: 2, h: 2 },
    [t('Design Available Resources')]: { w: 2, h: 2 },
    [t('Design Unavailable Resources')]: { w: 2, h: 2 },
    [t('Maintenance Resources')]: { w: 2, h: 2 },
    [`${t('LayoutApplies.number')} ${t('Suspended.status')}`]: { w: 2, h: 2 },
    [`${t('LayoutApplies.number')} ${t('Failed')}`]: { w: 2, h: 2 },
    [`${t('Alerts')} (Critical)`]: { w: 2, h: 2 },
    [`${t('Alerts')} (Warning)`]: { w: 2, h: 2 },
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
        <Stack gap={0}>
          <Text size='xs'>{t('Dashboard')}</Text>
          <Group>
            <Title order={3} fz='lg' fw={700}>
              {t('Add Tile')}
            </Title>
          </Group>
        </Stack>
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

const RadioCards = () => {
  const IMAGE_SIZE = 130;
  const t = useTranslations();

  const SELECT_TILES: { img: StaticImageData; title: string; description: string }[] = [
    {
      img: NumberPlain,
      title: t('Total Nodes'),
      description: t('Total number of nodes currently configured'),
    },
    {
      img: NumberOk,
      title: t('Healthy Nodes'),
      description: t('Number of nodes with all resources in a healthy (OK) state'),
    },
    {
      img: NumberCritical,
      title: t('Critical Nodes'),
      description: t('Number of nodes with resources in a critical state'),
    },
    {
      img: NumberWarning,
      title: t('Warning Nodes'),
      description: t('Number of nodes with resources in a warning state'),
    },
    {
      img: NumberPlain,
      title: t('Total Resources'),
      description: t('Number of managed resources'),
    },
    {
      img: NumberOk,
      title: t('Healthy Resources'),
      description: t('Number of resources in a healthy (OK) state'),
    },
    {
      img: NumberCritical,
      title: t('Critical Resources'),
      description: t('Number of resources in a critical state'),
    },
    {
      img: NumberWarning,
      title: t('Warning Resources'),
      description: t('Number of resources in a warning state'),
    },
    {
      img: NumberCritical,
      title: t('Not Detected Resources'),
      description: t('Number of resources in a not detected state'),
    },
    {
      img: NumberAllocated,
      title: t('Allocated Resources'),
      description: t('Number of resources allocated to nodes as a number and display the ratio in a graph'),
    },
    {
      img: NumberPlain,
      title: t('Unallocated Resources'),
      description: t('Number of resources that are unallocated and unused'),
    },
    {
      img: NumberOk,
      title: t('Design Available Resources'),
      description: t(
        'Number of resources available for layout design (resources that are healthy(OK), detectable resources, and not under maintenance)'
      ),
    },
    {
      img: NumberUnavailable,
      title: t('Design Unavailable Resources'),
      description: t('Number of resources that are unavailable as a design target'),
    },
    {
      img: NumberUnavailable,
      title: t('Maintenance Resources'),
      description: t('Number of resources that are under maintenance'),
    },
    {
      img: NumberSuspended,
      title: `${t('LayoutApplies.number')} ${t('Suspended.status')}`,
      description: t(
        'Number of layout applies that have stopped reflecting the design (an abnormality has occurred and the migration procedure has been stopped in the middle)'
      ),
    },
    {
      img: NumberCritical,
      title: `${t('LayoutApplies.number')} ${t('Failed')}`,
      description: t('Number of layout applies that failed to reflect the design'),
    },
    {
      img: NumberCritical,
      title: `${t('Alerts')} (Critical)`,
      description: t('Number of alerts (Critical)'),
    },
    {
      img: NumberWarning,
      title: `${t('Alerts')} (Warning)`,
      description: t('Number of alerts (Warning)'),
    },
    {
      img: AreaChart,
      title: t('Energy Consumptions'),
      description: t('Display the total power consumption of resources in the last month in a time series graph'),
    },
    {
      img: DonutChart,
      title: t('Energy Consumptions ratio by type'),
      description: t(
        'Display the ratio of the total power consumption of each device type in the last month by resource type in a pie chart'
      ),
    },
    {
      img: BarChart,
      title: `${t('Energy Consumptions')} ${t('4 weeks comparison')}`,
      description: t(
        'Display the power consumption of resources on a daily basis for the last 4 weeks and the previous 4 weeks in a graph'
      ),
    },
    {
      img: BarChart,
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
