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

import { createContext, useContext, useState } from 'react';

import { GetStaticProps } from 'next';

import { Box, Button, Divider, Group, Stack, Text, Title } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import _ from 'lodash';
import { useTranslations } from 'next-intl';
import { Layout } from 'react-grid-layout';
import { SWRConfig } from 'swr';
import type { SWRConfiguration } from 'swr';

import { MessageBox } from '@/shared-modules/components';
import { fetcher } from '@/shared-modules/utils';

import { TileData, TileDataItem, TileSize } from '@/types/TileData';

import { AddTileModal, DashboardGrid, ErrorsContext, ErrorsContextProvider, Tile } from '@/components';

import { useGetLayout, useUserId } from '@/utils/hooks';

/**
 * Retrieves the static props for the Home page.
 *
 * @param context - The context object containing the locale.
 * @param context.locale - The locale of the page.
 * @returns  The static props object.
 */
export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    // You can get the messages from anywhere you like. The recommended
    // pattern is to put them in JSON files separated by locale and read
    // the desired one based on the `locale` received from Next.js.
    // messages: (await import(`../../messages/${locale}.json`)).default,
    messages: (await import(`@/shared-modules/public/locales/${locale}/common.json`)).default,
  },
});

export const EditModeContext = createContext<boolean>(false);

/**
 * Retrieves a number value from the environment variables.
 *
 * @param envName - The name of the environment variable.
 * @returns The number value from the environment variable, or undefined if the value is not a valid number.
 */
export const getNumberFromEnv = (envName: string): number | undefined => {
  const value = Number(process.env[envName]);

  if (Number.isNaN(value)) {
    return undefined;
  } else {
    return value;
  }
};

/**
 * Renders the Home component.
 *
 * @returns The rendered Home component.
 */
export default function Home() {
  const envInterval = getNumberFromEnv('NEXT_PUBLIC_DASHBOARD_INTERVAL_SECONDS');
  const DEFAULTINTERVAL = 60;
  const ONESECOND = 1000;
  const interval =
    envInterval != undefined && envInterval !== 0 ? envInterval * ONESECOND : DEFAULTINTERVAL * ONESECOND;

  const SWR_OPTIONS: SWRConfiguration = {
    fetcher: fetcher,
    refreshInterval: interval,
  };
  return (
    <SWRConfig value={SWR_OPTIONS}>
      <ErrorsContextProvider>
        <HomeMain />
      </ErrorsContextProvider>
    </SWRConfig>
  );
}

/**
 * Renders the main component for the home page.
 *
 * @returns The JSX element representing the home page.
 */
function HomeMain() {
  const [viewMode, setViewMode] = useState<boolean>(true);
  const [opened, handlers] = useDisclosure();
  const [layout, tileData, setLayout, setTileData] = useGetLayout();
  const [preLayout, setPreLayout] = useState<Layout[]>(_.cloneDeep(layout));
  const [preTileData, setPreTileData] = useState<TileData>(_.cloneDeep(tileData));
  const [showSuccessMessage, setShowSuccessMessage] = useState<boolean>(false);
  const userId = useUserId();
  const t = useTranslations();

  const saveLayout = () => {
    if (!userId) {
      return;
    }

    localStorage.setItem(`CDIM.${userId}.dashboard.layout`, JSON.stringify(layout));
    localStorage.setItem(`CDIM.${userId}.dashboard.tileData`, JSON.stringify(tileData));
    setViewMode(true);
    setShowSuccessMessage(true);
  };

  const cancelEdit = () => {
    setViewMode(true);
    setLayout(preLayout);
    setTileData(preTileData);
  };
  const addTile = (addData: { tileDataItem: TileDataItem; tileSize: TileSize }) => {
    const key = generateTileDataKey();
    // To insert a new tile at the bottom, set y to a larger value.
    setLayout([...layout, { i: key, x: 0, y: 100, ...addData.tileSize }]);
    setTileData({ ...tileData, [key]: addData.tileDataItem });
  };

  const generateTileDataKey = (): string => {
    let key = '';
    do {
      key = Date.now().toString(36).slice(-4);
    } while (key in tileData);
    return key;
  };

  const generateDeleteTile = (tileId: string) => {
    const deleteTile = () => {
      const tmpTileData = _.cloneDeep(tileData);
      delete tmpTileData[tileId];
      setTileData(tmpTileData);
      setLayout((prev) => [...prev.filter((l) => l.i !== tileId)]);
    };
    return deleteTile;
  };

  return (
    <EditModeContext.Provider value={!viewMode}>
      <Stack>
        <Group align='center' gap='md'>
          <Title size='1.5rem'>{t('Dashboard')}</Title>
          <Group align='center' gap='md' bg={viewMode ? undefined : '#f0f0f0'} p='xs'>
            {viewMode ? (
              <Button
                size='xs'
                variant='outline'
                color='dark'
                onClick={() => {
                  setViewMode(false);
                  setPreLayout(layout);
                  setPreTileData(tileData);
                  setShowSuccessMessage(false);
                }}
                disabled={!viewMode}
              >
                {t('Edit')}
              </Button>
            ) : (
              <Group gap='xs'>
                <Text c='dimmed' px='xs'>
                  {t('Editing')}
                </Text>
                <SaveButton saveLayout={saveLayout} />
                <CancelButton cancelEdit={cancelEdit} />
                <Divider orientation='vertical' color='gray.5' />
                <Button variant='default' bd='1px solid dark' onClick={() => handlers.open()} size='xs'>
                  {t('Add Tile')}
                </Button>
              </Group>
            )}
          </Group>
        </Group>
        <ErrorMessages />
        {showSuccessMessage && (
          <MessageBox
            type='success'
            title={t('The dashboard has been successfully saved')}
            message=''
            close={() => {
              setShowSuccessMessage(false);
            }}
          />
        )}
        <DashboardGrid layout={layout} setLayout={setLayout} viewMode={viewMode}>
          {Object.keys(tileData).map((key) => (
            <Box key={key}>
              <Tile tileData={tileData[key]} deleteTile={generateDeleteTile(key)} />
            </Box>
          ))}
        </DashboardGrid>
      </Stack>

      <AddTileModal
        isModalOpen={opened}
        closeModal={handlers.close}
        submit={(addData: { tileDataItem: TileDataItem; tileSize: TileSize }) => {
          addTile(addData);
          handlers.close();
          return;
        }}
      />
    </EditModeContext.Provider>
  );
}

export const ErrorMessages = () => {
  // We want to fetch data only when tiles which use data are rendered.
  // But if we call useSWR here, we always fetch data unintentionally, so we need to use useContext.
  const [errors] = useContext(ErrorsContext);

  return (
    <>
      {errors.map((error) => (
        <MessageBox key={error.apiName} type='error' title={error.title} message={error.message || ''} />
      ))}
    </>
  );
};

export const CancelButton = (props: { cancelEdit: () => void }) => {
  const t = useTranslations();
  const [, setErrorMessages] = useContext(ErrorsContext);

  return (
    <Button
      size='xs'
      variant='default'
      bd='1px solid dark'
      onClick={() => {
        props.cancelEdit();
        setErrorMessages((prev) => prev.filter((e) => e.apiName !== 'save'));
      }}
    >
      {t('Cancel')}
    </Button>
  );
};

export const SaveButton = (props: { saveLayout: () => void }) => {
  const { saveLayout } = props;
  const t = useTranslations();
  const [, setErrorMessages] = useContext(ErrorsContext);

  const save = () => {
    try {
      saveLayout();
      setErrorMessages((prev) => prev.filter((e) => e.apiName !== 'save'));
    } catch (error: any) {
      setErrorMessages((prev) => [
        ...prev.filter((e) => e.apiName !== 'save'),
        { title: t('Failed to save the dashboard data'), message: error.message ?? '', apiName: 'save' },
      ]);
      return;
    }
  };

  return (
    <Button onClick={() => save()} size='xs'>
      {t('Save')}
    </Button>
  );
};
