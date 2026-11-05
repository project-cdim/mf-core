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

import { useEffect, useRef } from 'react';

import { i18nProvider } from '@/public/i18n/i18n-provider';
import { useAlertBadgeError } from '@/utils/hooks/useAlertBadgeError';

// Keep in sync with the alerts node's openNodeInModal settings in
// public/luigi-config.ts — openAsModal() does not pick those up by itself.
const MODAL_WIDTH = '600px';
const MODAL_HEIGHT = '90vh';

const openAlertsModal = (): void => {
  const luigi = (window as any).Luigi;
  if (!luigi?.navigation) return;

  let title = 'Alerts';
  try {
    const locale = luigi.i18n?.().getCurrentLocale?.();
    title = i18nProvider.getTranslation('Alerts', undefined, locale) || title;
  } catch {
    // i18n not initialized yet — fall back to the untranslated title.
  }

  luigi.navigation().openAsModal('/alerts', {
    title,
    width: MODAL_WIDTH,
    height: MODAL_HEIGHT,
  });
};

/**
 * Opens the Alerts modal automatically when the badge poller reports that
 * the Alerta connection is broken, so the failure is surfaced to the user
 * immediately instead of only as the bell's error strike.
 *
 * Opens only for the first error in the session: after the modal has been
 * auto-opened once, it is never auto-opened again, even if the connection
 * recovers and fails again. The user can still open it manually via the bell.
 *
 * Mount once in the core (shell) window — see components/AlertBadgeUpdater.tsx.
 */
export const useAlertErrorModal = (): void => {
  const error = useAlertBadgeError();
  const hasOpenedOnce = useRef(false);

  useEffect(() => {
    if (error && !hasOpenedOnce.current) {
      hasOpenedOnce.current = true;
      openAlertsModal();
    }
  }, [error]);
};
