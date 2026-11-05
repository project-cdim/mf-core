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

import { useCallback } from 'react';

import AlertaSilentGetCode from '@/components/AlertaSilentGetCode';
import { useAlertBadgePolling } from '@/utils/hooks/useAlertBadgePolling';
import { useAlertErrorModal } from '@/utils/hooks/useAlertErrorModal';

/**
 * Invisible component for the core (shell) window that keeps the Alerts bell
 * badge up to date: obtains an auth code via silent OIDC, then polls the
 * alert counts and publishes them into the shared badge state read by the
 * Luigi config (see utils/alertBadgeState.ts). Also pops the Alerts modal
 * open when the Alerta connection breaks.
 *
 * @returns The rendered (invisible) component.
 */
export default function AlertBadgeUpdater() {
  const { refresh } = useAlertBadgePolling();
  useAlertErrorModal();

  const handleError = useCallback((error: string) => {
    // `login_required` / `interaction_required` / `consent_required` are expected
    // outcomes of the silent (`prompt=none`) OIDC flow when there is no active SSO
    // session. Treat them as warnings to avoid surfacing them as runtime errors.
    const expectedSilentAuthErrors = ['login_required', 'interaction_required', 'consent_required'];
    if (expectedSilentAuthErrors.includes(error)) {
      console.warn('Silent auth not available:', error);
    } else {
      console.error('Alerta silent auth error:', error);
    }
  }, []);

  // Recovery from lost auth (token expired, code spent) is handled by
  // AlertaSilentGetCode's own re-auth watchdog; onCode fires refresh so the
  // badge updates as soon as a fresh code lands.
  return <AlertaSilentGetCode onCode={refresh} onError={handleError} />;
}
