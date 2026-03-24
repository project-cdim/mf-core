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

import { NumberTileProps, useSetErrorInContext } from '@/components';

import { useAlertNumberData } from '@/utils/hooks/useAlertNumberData';
import { AlertSeverity } from '@/types/TileData';

/**
 * Custom hook for alert number tile.
 *
 * @param severity - The severity level of alerts to count
 * @returns The number tile props for alert counts, excluding 'title'
 */
export const useAlertNumberTile = (severity: AlertSeverity): Omit<NumberTileProps, 'title'> => {
  // const t = useTranslations();

  const { alertError, alertValidating, getAlertCount } = useAlertNumberData();

  /** Set error in context */
  useSetErrorInContext(`alerta-${severity}`, alertError);

  // Map severity to APPStatus for coloring
  // const severityStatusMap: Record<AlertSeverity, APPStatus> = {
  //   critical: 'Critical',
  //   major: 'Warning',
  //   minor: 'Warning',
  //   warning: 'Warning',
  //   indeterminate: 'OK',
  //   informational: 'OK',
  // };

  return {
    number: getAlertCount(severity),
    status: 'Critical', //severityStatusMap[severity],
    linkTitle: 'Alerta Web UI',
    link: `${process.env.NEXT_PUBLIC_URL_ALERTA_WEBUI || ''}/alerts?q=severity%3A${severity}#status:open`,
    linkTarget: '_blank',
    loading: alertValidating,
  };
};
