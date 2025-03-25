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

import { useContext } from 'react';

import { Box, Group, LoadingOverlay, Stack, Text, Title } from '@mantine/core';

import { Icon, Multiline, PageLink } from '@/shared-modules/components';
import { useColorStyles } from '@/shared-modules/styles/styles';
import { APPStatus } from '@/shared-modules/types';

import { EditModeContext } from '@/pages/home';

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
  /** The request query.  */
  query?: {
    [key: string]: string | string[];
  };
  /** Loading state */
  loading: boolean;
};

/**
 * A component that displays a number tile with a title, number, and link.
 * @param props - The props for the NumberTile component.
 * @returns The rendered NumberTile component.
 */
export const NumberTile = (props: NumberTileProps) => {
  const { title, status, number, linkTitle, link, query, loading } = props;
  const isEditMode = useContext(EditModeContext);
  const { bg } = useBackgoundColor(status);

  return (
    <Box h='100%'>
      <LoadingOverlay visible={loading} />
      <Stack
        styles={{ root: { backgroundColor: `${bg || 'transparent'}` } }}
        justify='center'
        gap='5px'
        h='calc(100% + 32px)'
        m='-16px'
        p='md'
      >
        <Title size='h6'>
          <Multiline text={title} />
        </Title>
        <Group justify='center' align='end' gap='5px' wrap='nowrap'>
          <Icon status={status} />
          <PageLink
            title={linkTitle}
            path={isEditMode ? undefined : link}
            query={query}
            color='rgb(55 65 81 / var(--tw-text-opacity))'
            display='block'
            h='100%'
          >
            <Text fz='50px' fw={700} lh={1}>
              {Number.isInteger(number) ? number : '-'}
            </Text>
          </PageLink>
        </Group>
      </Stack>
    </Box>
  );
};

export const useBackgoundColor = (status?: APPStatus | undefined) => {
  const { red, yellow, gray } = useColorStyles();
  const map = new Map([
    ['Critical', red.backgroundColor],
    ['Failed', red.backgroundColor],
    ['Warning', yellow.backgroundColor],
    ['Suspended', yellow.backgroundColor],
    ['OK', null],
    ['Disabled', gray.backgroundColor],
    ['Available', null],
    ['Unavailable', gray.backgroundColor],
    ['ALL', null],
    [undefined, null],
  ]);
  return {
    bg: map.get(status) || undefined,
  };
};
