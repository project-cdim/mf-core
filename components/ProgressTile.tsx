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

import { JSX, useContext } from 'react';
import { useLocale } from 'next-intl';

import { Box, Group, Indicator, Progress, Stack, Text, Title } from '@mantine/core';

import { Multiline, PageLink } from '@/shared-modules/components';
import classes from '@/shared-modules/styles/styles.module.css';

import { EditModeContext } from '@/app/[lng]/home/HomeContent';

export type ProgressTileProps = {
  /** The title of the ProgressTile. */
  title: string;
  /** The icon to be displayed in the NumberTile. The icon should be a JSX element. */
  icon?: JSX.Element | undefined;
  /** The number value to be displayed in the NumberTile. */
  value: number | undefined;
  /** The denominator value of the NumberTile. The denominator value should be a number. */
  allValue: number | undefined;
  /** The background color of the NumberTile. The color should be a CSS color string. */
  bg?: string | undefined;
  /** Loading state */
  loading: boolean;
  /** The title for the link associated with the NumberTile. */
  linkTitle?: string;
  /** The URL link associated with the NumberTile. */
  link?: string;
  /** The URL link associated with the NumberTile. */
  query?: {
    [key: string]: string | string[];
  };
};

const getProgressTileSizes = (totalDigits: number) => {
  const isCompact = totalDigits >= 12;
  const isMedium = !isCompact && totalDigits >= 8;
  return {
    valueFz: isCompact ? '20px' : isMedium ? '28px' : '40px',
    allValueFz: isCompact ? 'sm' : isMedium ? 'md' : ('xl' as const),
    gap: isCompact ? 15 : isMedium ? 10 : 5,
  };
};

/**
 * A component that displays the progress resources.
 *
 * @param props
 * @returns The JSX element representing the ProgressTile component.
 */
export const ProgressTile = (props: ProgressTileProps) => {
  const isEditMode = useContext(EditModeContext);
  const { title, value, allValue, bg, icon, linkTitle, link, query, loading } = props;

  const totalDigits = Number.isInteger(value) && Number.isInteger(allValue) ? String(value).length + String(allValue).length : 1;
  const { valueFz, allValueFz, gap } = getProgressTileSizes(totalDigits);

  const locale = useLocale();

  return (
    <Indicator processing disabled={!loading} position='top-end' size={10} offset={4} h='100%' display='block'>
      <Box h='100%'>
        <Stack className={`${bg && classes[bg]}`} justify='center' gap='5px' h='calc(100% + 32px)' m='-16px' p='md'>
          <Title size='h6'>
            <Multiline text={title} />
          </Title>
          <Stack justify='center' gap={gap}>
            <Group align='baseline' justify='center' gap={0} wrap='nowrap'>
              {icon}
              <PageLink
                title={linkTitle}
                path={isEditMode ? undefined : link}
                query={query}
                color='rgb(55 65 81 / var(--tw-text-opacity))'
                display='block'
              >
                <Text fz={valueFz} fw={700} lh={1}>
                  {Number.isInteger(value) ? (value as number).toLocaleString(locale) : '-'}
                </Text>
              </PageLink>
              <Text
                fz={allValueFz}
                fw={500}
                lh={1}
                styles={{
                  root: {
                    whiteSpace: 'nowrap',
                  },
                }}
              >
                {`/${Number.isInteger(allValue) ? (allValue as number).toLocaleString(locale) : '-'}`}
              </Text>
            </Group>
            <CustomProgress value={value} allValue={allValue} />
          </Stack>
        </Stack>
      </Box>
    </Indicator>
  );
};

/**
 * CustomProgress component.
 *
 * @component
 * @param {number} value - The current value.
 * @param {number} allValue - The total value.
 * @returns {JSX.Element} The rendered CustomProgress component.
 */
export const CustomProgress = ({ value, allValue }: { value?: number; allValue?: number }) => {
  if (!Number.isInteger(value)) return <Progress h={15} value={0} size='xl' />;
  if (!Number.isInteger(allValue)) return <Progress h={15} value={0} size='xl' />;

  const percentage = (value as number) / (allValue as number);
  const PERCENT = 100;
  return <Progress h={15} value={percentage * PERCENT} size='xl' />;
};
