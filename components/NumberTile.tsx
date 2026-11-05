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
import { useLocale } from 'next-intl';

import { Box, Group, Indicator, Stack, Text, Title } from '@mantine/core';

import { Icon, Multiline, PageLink } from '@/shared-modules/components';
import { useColorStyles } from '@/shared-modules/styles/styles';
import { APPStatus } from '@/shared-modules/types';

import { EditModeContext } from '@/app/[lng]/home/HomeContent';

/** Props for the NumberTile component. */
export type NumberTileProps = {
  /** The title of the NumberTile. Line breaks should be represented as `\n`.  They will be converted to `<br />`. */
  title: string;
  /** The status of the NumberTile. */
  status?: APPStatus;
  /** The number value to be displayed in the NumberTile. */
  number: number | undefined;
  /** The title for the link associated with the NumberTile. */
  linkTitle?: string;
  /** The URL link associated with the NumberTile. */
  link?: string;
  /** Target for link, e.g. '_blank' to open in a new tab */
  linkTarget?: string;
  /** The request query.  */
  query?: {
    [key: string]: string | string[];
  };
  /** Loading state */
  loading: boolean;
};

const getNumberTileSizes = (digits: number, isAllStatus: boolean) => {
  const threshold = isAllStatus ? 7 : 6;
  const thresholdMedium = isAllStatus ? 5 : 4;
  const isLarge = digits >= threshold;
  const isMedium = !isLarge && digits >= thresholdMedium;
  return {
    fz: isLarge ? '30px' : isMedium ? '36px' : '50px',
    iconSize: isLarge ? 26 : isMedium ? 30 : 40,
    gap: isLarge ? 15 : isMedium ? 10 : 5,
  };
};

/**
 * A component that displays a number tile with a title, number, and link.
 * @param props - The props for the NumberTile component.
 * @returns The rendered NumberTile component.
 */
export const NumberTile = (props: NumberTileProps) => {
  const { title, status, number, linkTitle, link, linkTarget, query, loading } = props;
  const isEditMode = useContext(EditModeContext);
  const displayStatus = Number.isInteger(number) && number === 0 ? undefined : status;
  const { bg } = useBackgroundColor(displayStatus);
  const locale = useLocale();

  const digits = Number.isInteger(number) ? String(number).length : 1;
  const { fz, iconSize, gap } = getNumberTileSizes(digits, displayStatus === ('All' as APPStatus));

  return (
    <Indicator processing disabled={!loading} position='top-end' size={10} offset={4} h='100%' display='block'>
      <Box h='100%'>
        <Stack
          styles={{ root: { backgroundColor: `${bg || 'white'}` } }}
          justify='center'
          gap={gap}
          h='calc(100% + 32px)'
          m='-16px'
          p='md'
        >
          <Title size='h6'>
            <Multiline text={title} />
          </Title>
          <Group justify='center' align='center' gap='5px' wrap='nowrap'>
            <Icon status={displayStatus} size={iconSize} />
            <PageLink
              title={linkTitle}
              path={isEditMode ? undefined : link}
              query={query}
              color='rgb(55 65 81 / var(--tw-text-opacity))'
              display='block'
              h='100%'
              target={linkTarget}
            >
              <Text fz={fz} fw={700} lh="1" h='100%' style={{ display: "flex", alignItems: "center" }}>
                {Number.isInteger(number) ? (number as number).toLocaleString(locale) : '-'}
              </Text>
            </PageLink>
          </Group>
        </Stack>
      </Box>
    </Indicator>
  );
};

export const useBackgroundColor = (status?: APPStatus | undefined) => {
  const { red, yellow, gray } = useColorStyles();
  const map: Map<APPStatus | undefined, string | null> = new Map<APPStatus | undefined, string | null>([
    ['Critical', red.backgroundColor],
    ['Failed', red.backgroundColor],
    ['Warning', yellow.backgroundColor],
    ['Suspended', yellow.backgroundColor],
    ['OK', null],
    ['NotDetected', red.backgroundColor],
    ['DesignAvailable', null],
    ['DesignUnavailable', gray.backgroundColor],
    ['Maintenance', gray.backgroundColor],
    ['All', null],
    [undefined, null],
  ]);
  return {
    bg: map.get(status) || undefined,
  };
};
