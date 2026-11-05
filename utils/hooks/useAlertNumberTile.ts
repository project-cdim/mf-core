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

import { APPStatus } from '@/shared-modules/types';
import { NumberTileProps, useSetErrorInContext } from '@/components';

import { useAlertBadgeError } from '@/utils/hooks/useAlertBadgeError';
import { useAlertSeverityCounts } from '@/utils/hooks/useAlertSeverityCounts';
import { AlertSeverity } from '@/types/TileData';

/**
 * Custom hook for alert number tile.
 *
 * Renders from the shared alert badge state that the bell badge poller in the
 * core (shell) window publishes — the tile does not fetch by itself. Number
 * and error state therefore always flip together with the bell's badge and
 * error strike, on the poller's publish signal.
 *
 * @param severity - The severity level of alerts to count
 * @returns The number tile props for alert counts, excluding 'title'
 */
export const useAlertNumberTile = (severity: AlertSeverity): Omit<NumberTileProps, 'title'> => {
  const alertError = useAlertBadgeError();
  const severityCounts = useAlertSeverityCounts();

  /** Set error in context */
  useSetErrorInContext(`alerta-${severity}`, alertError);

  const severityStatusMap: Partial<Record<AlertSeverity, APPStatus>> = {
    critical: 'Critical',
    warning: 'Warning',
    //   major: 'Warning',
    //   minor: 'Warning',
    //   warning: 'Warning',
    //   indeterminate: 'OK',
    //   informational: 'OK',
  };

  // In error state the poller drops the counts, so the tile shows '-' (a
  // non-integer number renders as '-') in step with the bell's error strike.
  // Loading only before the very first publication (startup).
  return {
    number: alertError || !severityCounts ? undefined : (severityCounts[severity] ?? 0),
    status: severityStatusMap[severity],
    linkTitle: 'Alerta Web UI',
    link: `${process.env.NEXT_PUBLIC_URL_ALERTA_WEBUI || ''}/alerts?q=severity%3A${severity}#status:open`,
    linkTarget: '_blank',
    loading: !alertError && severityCounts === undefined,
  };
};
