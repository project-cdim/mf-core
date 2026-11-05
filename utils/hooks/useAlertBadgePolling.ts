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

import { useCallback, useEffect, useRef } from 'react';

import { getToken, invalidateAlertaToken, isAlertaAuthenticated, getAlertRefreshIntervalMs } from '@/utils/alert';
import { setAlertBadgeCount, setAlertBadgeError, setAlertSeverityCounts } from '@/utils/alertBadgeState';
import { emitAlertRefresh } from '@/utils/alertRefreshSignal';
import { emitAlertPublished } from '@/utils/alertPublishSignal';
import { registerBarrierParticipant, submitToBarrier } from '@/utils/alertCommitBarrier';
import { timeoutSignal } from '@/utils/timeoutSignal';
import type { AlertSeverity } from '@/types/TileData';

export type AlertaCountResponse = {
  autoRefresh?: boolean;
  severityCounts?: Record<AlertSeverity, number>;
  status?: string;
  statusCounts?: Record<string, number>;
  total?: number;
};

// Abort badge API calls that hang, e.g. when the Alerta backend is up but its
// DB is down and the request is held open instead of being rejected. Without
// this the badge would silently keep its stale value.
const FETCH_TIMEOUT_MS = 10_000;

// All severities, not just critical: the same response feeds both the bell
// badge (critical count) and the dashboard alert tiles (per-severity counts)
// via the shared badge state, so both always flip together.
const COUNT_URL = `${process.env.NEXT_PUBLIC_URL_BE_ALERTA_WEB}/alerts/count?status=open`;

// Body-level state class driving the red diagonal strike over the bell icon
// (see styles/globals.css). The bell itself stays visible — the strike is
// drawn on top of it. The class goes on the top window's <body> (not the icon
// element) because Luigi rebuilds the top-nav DOM on updateTopNavigation(),
// which would drop any class added to the icon directly.
const ALERTA_ERROR_CLASS = 'alert-fetch-error';

export const setBellErrorState = (hasError: boolean): void => {
  if (typeof window === 'undefined') return;
  try {
    window.top?.document.body.classList.toggle(ALERTA_ERROR_CLASS, hasError);
  } catch {
    // Cross-origin top window — nothing we can do.
  }
};

const publishResult = (data: AlertaCountResponse | undefined, error: Error | undefined): void => {
  if (error) {
    setAlertBadgeError({ name: error.name, message: error.message });
    setBellErrorState(true);
    // Zero the count and drop the severity counts so the badge disappears and
    // the tiles show '-': while Alerta is unreachable nothing shows a stale
    // number, only the bell's error strike.
    setAlertBadgeCount(0);
    setAlertSeverityCounts(undefined);
  } else {
    setAlertBadgeError(undefined);
    setBellErrorState(false);
    const severityCounts = data?.severityCounts;
    setAlertSeverityCounts(severityCounts);
    // Bell badge shows critical + warning combined, matching the alerts
    // list/modal which also surfaces both severities (not critical-only).
    setAlertBadgeCount(severityCounts ? (severityCounts.critical ?? 0) + (severityCounts.warning ?? 0) : 0);
  }
  // Notify the state's React consumers (dashboard tiles, alerts modal count/
  // error) so they re-read and re-render on this same commit, in step with the
  // bell badge (updateTopNavigation below) and the alerts list.
  emitAlertPublished();
  // Ask Luigi to re-render the top nav so badgeCounter.count() re-reads the
  // shared state. Optional chaining: Luigi may not be initialized yet.
  (window as any).Luigi?.navigation?.().updateTopNavigation();
};

const fetchAlertCounts = async (): Promise<AlertaCountResponse> => {
  const token = await getToken();
  if (!token) {
    throw new Error('No authentication token available');
  }

  const doFetch = async (bearer: string) =>
    fetch(COUNT_URL, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${bearer}`,
      },
      signal: timeoutSignal(FETCH_TIMEOUT_MS),
    });

  let response = await doFetch(token);

  if (!response.ok && response.status === 401) {
    invalidateAlertaToken();
    const newToken = await getToken();
    if (newToken) {
      response = await doFetch(newToken);
    }
  }
  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  return (await response.json()) as AlertaCountResponse;
};

/**
 * Polls the open alert counts on an interval and publishes the result
 * (count + connection error state) into the shared alert badge state read by
 * the Luigi config's badgeCounter, toggling the bell's error strike as well.
 *
 * Mount once in the core (shell) window, alongside an `AlertaSilentGetCode`
 * that supplies the auth code; pass the returned `refresh` as its `onCode`
 * so the first fetch fires as soon as auth is ready.
 *
 * @param intervalMs - The polling interval in milliseconds. Defaults to
 * NEXT_PUBLIC_ALERT_REFRESH_INTERVAL_SEC (seconds) if set, else 30s.
 * @returns refresh - Fetches and publishes the badge state immediately.
 */
export const useAlertBadgePolling = (intervalMs?: number): { refresh: () => void } => {
  const inFlight = useRef(false);

  const resolvedIntervalMs = intervalMs ?? getAlertRefreshIntervalMs();

  const refresh = useCallback(() => {
    // Broadcast the tick first so the alerts list (in its own Luigi iframe)
    // revalidates in the same JS turn as this badge poll — both fetch together
    // instead of drifting apart on independent timers.
    emitAlertRefresh();
    // Before auth is ready a fetch can only fail; skip quietly instead of
    // striking the bell during normal startup. Lost auth (token expired, code
    // spent) is re-established by AlertaSilentGetCode's re-auth watchdog.
    if (!isAlertaAuthenticated() || inFlight.current) {
      // Nothing to publish this round; release the barrier so the alerts list
      // can still commit its own update without waiting on us.
      submitToBarrier('badge', () => {});
      return;
    }
    inFlight.current = true;
    fetchAlertCounts()
      // Buffer the publish so the badge and the alerts list flip together (see
      // alertCommitBarrier); when the modal is closed the badge is the only
      // participant, so this flushes immediately.
      .then((data) => submitToBarrier('badge', () => publishResult(data, undefined)))
      .catch((error: unknown) =>
        submitToBarrier('badge', () =>
          publishResult(undefined, error instanceof Error ? error : new Error(String(error)))
        )
      )
      .finally(() => {
        inFlight.current = false;
      });
  }, []);

  useEffect(() => registerBarrierParticipant('badge'), []);

  useEffect(() => {
    refresh();
    const timer = setInterval(refresh, resolvedIntervalMs);
    return () => clearInterval(timer);
  }, [refresh, resolvedIntervalMs]);

  return { refresh };
};
