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

import { ReactElement, useContext } from 'react';

import { ActionIcon, Card, Stack, Text, Title } from '@mantine/core';
import { IconTrash } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';

import { Multiline } from '@/shared-modules/components';

import { EditModeContext } from '@/app/[lng]/home/HomeContent';
import tileClasses from '@/styles/tile.module.css';

/** Props for the BaseTile component. */
export type BaseTileProps = {
  /** props */
  tileTitle: string | undefined;
  deleteTile: CallableFunction;
  /** states */
  hasPermission: boolean;
  /** children */
  children: ReactElement;
};

/**
 * Renders a base tile component.
 *
 * @component
 * @param {BaseTileProps} props - The props for the BaseTile component.
 * @returns {JSX.Element} The rendered BaseTile component.
 */
export const BaseTile = (props: BaseTileProps) => {
  const t = useTranslations();
  const isEditMode = useContext(EditModeContext);

  return (
    <Card withBorder ta='center' h='100%' classNames={{ root: `${isEditMode && tileClasses.movable}` }}>
      {props.tileTitle === undefined ? (
        <Stack justify='center' gap='5px' h='100%'>
          <Title size='h6'>
            <div>{t('Not Found')}</div>
          </Title>
        </Stack>
      ) : props.hasPermission ? (
        props.children
      ) : (
        <TileNoPermissionContent tileTitle={props.tileTitle} />
      )}
      <DeleteActionIcon deleteTile={props.deleteTile} isEditMode={isEditMode} />
    </Card>
  );
};

/**
 * Renders a tile component when the user does not have permission.
 *
 * @param props - The component props.
 * @param props.tileTitle - The title of the tile.
 * @returns The rendered TileNoPermissionContent component.
 */
const TileNoPermissionContent = (props: { tileTitle: string }) => {
  const t = useTranslations();

  return (
    <Stack justify='center' gap='5px' h='100%'>
      <Title size='h6'>
        <Multiline text={props.tileTitle} />
      </Title>
      <Text>{t('Unauthorized')}</Text>
    </Stack>
  );
};

const DeleteActionIcon = (props: { deleteTile: CallableFunction; isEditMode: boolean }) => {
  const t = useTranslations();
  const isEditMode = useContext(EditModeContext);
  if (!isEditMode) return null;
  return (
    <ActionIcon
      size={30}
      title={t('Delete')}
      variant='default'
      bd='1px solid red'
      c='red'
      onClick={() => props.deleteTile()}
      style={{ position: 'absolute', top: '10px', right: '10px' }}
      className='draggableCancel'
    >
      <IconTrash />
    </ActionIcon>
  );
};
