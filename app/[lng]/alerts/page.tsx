/*
 * Copyright 2026 NEC Corporation.
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

'use client';

import { useCallback, useEffect, useState } from 'react';

import { Box, Card, Grid, Group, ScrollArea, Space, Stack, Text, Title, LoadingOverlay } from '@mantine/core';
import { useTranslations } from 'next-intl';

import { DatetimeString, ExternalLink, IconWithInfo, LongSentences, MessageBox } from '@/shared-modules/components';
import { useInitializedLuigiClient } from '@/shared-modules/contexts/LuigiClientProvider';
import { useColorStyles } from '@/shared-modules/styles/styles';

import AlertaSilentGetCode from '@/components/AlertaSilentGetCode';
import { AlertaAlert, useAlertListData } from '@/utils/hooks/useAlertList';
import { useAlertBadgeError } from '@/utils/hooks/useAlertBadgeError';
import { useAlertSeverityCounts } from '@/utils/hooks/useAlertSeverityCounts';

const MAX_VISIBLE_ALERTS = 10;
const ALERT_LIST_MAX_HEIGHT = 'calc(100dvh - 126px)';
const VISIBLE_SEVERITIES = ['critical', 'warning'];

/**
 * Combined critical + warning count from the shared badge state, matching the
 * bell badge exactly. Falls back to the list endpoint's total until the badge
 * state is first published.
 */
const resolveBadgeTotal = (severityCounts: Record<string, number> | undefined, fallbackTotal: number): number =>
  severityCounts ? (severityCounts.critical ?? 0) + (severityCounts.warning ?? 0) : fallbackTotal;

/**
 * Renders a single alert row linking out to the Alerta Web UI.
 *
 * @param props - The alert fields to display.
 * @returns The rendered alert row.
 */
function AlertRow({ id, event, text, lastReceiveTime, resource, severity }: AlertaAlert) {
  const t = useTranslations();
  const { gray } = useColorStyles();
  const [isHovered, setIsHovered] = useState(false);
  const baseUrl = process.env.NEXT_PUBLIC_URL_ALERTA_WEBUI || '';
  // Ensure base URL doesn't have trailing slash
  const alertaUrl = `${baseUrl.replace(/\/$/, '')}/alert/${id}`;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Create a temporary anchor element to trigger download/navigation
    // This bypasses some iframe restrictions and ensures proper navigation
    const anchor = document.createElement('a');
    anchor.href = alertaUrl;
    anchor.target = '_blank';
    anchor.rel = 'noopener noreferrer';
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  };

  return (
    <Card.Section
      inheritPadding
      px='md'
      withBorder
      title={`Alerta Web UI(Alert Detail View) [${t('External Web Site')}]`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
      style={{
        cursor: 'pointer',
        backgroundColor: isHovered ? '#f8f9fa' : 'transparent',
        transition: 'background-color 0.15s ease',
      }}
    >
      <Box style={{ display: 'block' }}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            handleClick(e as unknown as React.MouseEvent);
          }
        }}
      >
        <Group wrap='nowrap' gap='xs' justify='flex-start'>
          <Box style={{ flexShrink: 0 }}>
            <IconWithInfo
              label={t(severity === 'critical' ? 'Critical' : 'Warning')}
              type={severity as 'critical' | 'warning'}
              size={30}
            />
          </Box>
          <Box p='sm' style={{ flexGrow: 1 }}>
            <Grid grow gutter='0' justify='space-between'>
              <Grid.Col span={12}>
                <Title size={20} order={3} fw={700} c='black'>
                  <LongSentences text={event} lines={1} truncate={true} />
                </Title>
              </Grid.Col>
              <Grid.Col span={12}>
                <Text size='sm' fw={700} c='black'>
                  <LongSentences text={text} lines={1} truncate={true} />
                </Text>
              </Grid.Col>
              <Grid.Col span={6}>
                <Text size='xs' c={gray.color}>
                  <DatetimeString date={new Date(lastReceiveTime)} />
                </Text>
              </Grid.Col>
              <Grid.Col span={6}>
                <Text size='xs' c={gray.color} ta='right'>
                  {resource}
                </Text>
              </Grid.Col>
            </Grid>
          </Box>
        </Group>
      </Box>
    </Card.Section>
  );
}

/**
 * Renders the alert details view, opened from the bell icon in the top
 * navigation. Shows critical and warning alerts.
 *
 * @returns The rendered Alerts component.
 */
export default function Alerts() {
  const t = useTranslations();
  const { luigiClient } = useInitializedLuigiClient();

  // This page runs inside a separate Luigi content iframe from the shell
  // that computes the bell icon's badge count, so error state is read back
  // from shared top-window state rather than re-deriving it here.
  const passedError = useAlertBadgeError();

  const { alertList, alertTotal, alertListValidating, alertListResolved, alertListError } = useAlertListData(
    Boolean(passedError)
  );
  // Show the same count as the bell badge (critical + warning from the shared
  // /alerts/count state) rather than the list endpoint's own total, so the two
  // can never diverge.
  const severityCounts = useAlertSeverityCounts();
  const badgeTotal = resolveBadgeTotal(severityCounts, alertTotal);
  // If silent auth itself fails, no fetch ever starts, so surface the error
  // here too — otherwise `loading` would never settle below.
  const [authError, setAuthError] = useState<Error | undefined>(undefined);
  const displayError = passedError ?? alertListError ?? authError;

  const [, setAuthReady] = useState(false);
  const handleCode = useCallback(() => {
    setAuthReady(true);
  }, []);
  const handleAuthError = useCallback((error: string) => {
    setAuthError(new Error(error));
  }, []);

  const displayAlerts = alertList
    .filter((alert) => VISIBLE_SEVERITIES.includes(alert.severity))
    .slice(0, MAX_VISIBLE_ALERTS);
  const loading = !displayError && (!alertListResolved || (alertListValidating && displayAlerts.length === 0));

  // The node's loadingIndicator.hideAutomatically is false, so Luigi keeps its
  // modal spinner up until we dismiss it here — once data (or an error) is in.
  // This replaces a page-side spinner, avoiding two loading indicators in a row.
  useEffect(() => {
    if (loading) return;
    // The effect fires on commit, before the browser has painted the list
    // (ScrollArea.Autosize also needs a ResizeObserver pass to size itself).
    // Wait two frames so the cards are actually visible when the spinner goes.
    let rafId2: number | undefined;
    const rafId1 = requestAnimationFrame(() => {
      rafId2 = requestAnimationFrame(() => {
        luigiClient?.uxManager().hideLoadingIndicator();
      });
    });
    return () => {
      cancelAnimationFrame(rafId1);
      if (rafId2 !== undefined) cancelAnimationFrame(rafId2);
    };
  }, [loading, luigiClient]);

  const renderAlertList = () => {
    if (loading) {
      // Luigi's modal spinner is still covering the view; keep the space blank.
      return (
        <Box h={290}>
          <LoadingOverlay visible />
        </Box>
      );
    }

    if (displayAlerts.length === 0) {
      return (
        <Stack h={290} justify='center' align='center'>
          <Text p='lg'>{t('No alerts')}</Text>
        </Stack>
      );
    }

    return (
      <>
        <Group justify='flex-end' w='100%'>
          <Text size='sm' c='gray.6'>
            {t('Showing {count} of {all} alerts', { count: displayAlerts.length, all: badgeTotal })}
          </Text>
        </Group>
        <Card padding='0' mb='md' withBorder radius='md'>
          <ScrollArea.Autosize
            mah={ALERT_LIST_MAX_HEIGHT}
            type='auto'
            scrollbars='y'
            styles={{ viewport: { overflowX: 'hidden' } }}
          >
            {displayAlerts.map((alert) => (
              <AlertRow key={alert.id} {...alert} />
            ))}
          </ScrollArea.Autosize>
        </Card>
      </>
    );
  };

  return (
    <Box style={{ overflow: 'hidden', paddingBottom: 16 }}>
      <AlertaSilentGetCode onCode={handleCode} onError={handleAuthError} />
      {displayError && (
        <MessageBox title={t('Failed to fetch alert information')} message={displayError.message} type='error' />
      )}
      <Stack gap='xs' align='center' justify='flex-start'>
        {displayError ? <Space h='md' /> : renderAlertList()}
        <ExternalLink
          url={`${process.env.NEXT_PUBLIC_URL_ALERTA_WEBUI || ''}/alerts?q=severity%3Acritical%20OR%20severity%3Awarning#status:open`}
          title='Alerta Web UI(Alert Summary List)'
        >
          {t('View & Manage Alerts')}
          {!displayError && ` (${badgeTotal})`}
        </ExternalLink>
      </Stack>
    </Box>
  );
}
