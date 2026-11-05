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

import { useEffect, useMemo, useState } from 'react';

import { AlertBadgeError, getAlertBadgeError } from '@/utils/alertBadgeState';
import { subscribeAlertPublished } from '@/utils/alertPublishSignal';

const isSameError = (a: AlertBadgeError | undefined, b: AlertBadgeError | undefined): boolean =>
  a?.name === b?.name && a?.message === b?.message;

/**
 * Reads the bell icon badge poller's last error from the shared alert badge
 * state on `window.top` (see utils/alertBadgeState.ts). Used so the Alerts
 * detail view can show the same auth/network error the badge already hit.
 *
 * @returns The badge poller's last error, or undefined if it last succeeded.
 */
export const useAlertBadgeError = (): Error | undefined => {
  const [error, setError] = useState<AlertBadgeError | undefined>(() => getAlertBadgeError());

  useEffect(() => {
    const checkError = () => {
      setError((prev) => {
        const current = getAlertBadgeError();
        return isSameError(prev, current) ? prev : current;
      });
    };
    checkError();
    // Update on the poller's publish so the modal's error flips together with
    // the bell badge and the alerts list, rather than on an independent timer.
    return subscribeAlertPublished(checkError);
  }, []);

  // Keep a stable Error reference across renders while the underlying
  // AlertBadgeError is unchanged — callers (e.g. useSetErrorInContext) depend
  // on this value in a useEffect, so a fresh object every render would loop.
  return useMemo(() => {
    if (!error) return undefined;
    const err = new Error(error.message);
    err.name = error.name;
    return err;
  }, [error?.name, error?.message]);
};
