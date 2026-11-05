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

import useSWR from 'swr';
import { useEffect, useRef, useState } from 'react';
import { AlertSeverity } from '@/types/TileData';
import { getToken, invalidateAlertaToken, isAlertaAuthenticated } from '@/utils/alert';
import { subscribeAlertRefresh } from '@/utils/alertRefreshSignal';
import { registerBarrierParticipant, submitToBarrier } from '@/utils/alertCommitBarrier';

export type AlertaAlert = {
  id: string;
  event: string;
  text: string;
  lastReceiveTime: string;
  resource: string;
  severity: AlertSeverity;
};

export type AlertaListResponse = {
  alerts: AlertaAlert[];
  total?: number;
};

export type UseAlertListDataResult = {
  alertList: AlertaAlert[];
  alertTotal: number;
  alertListError: Error | undefined;
  alertListValidating: boolean;
  alertListResolved: boolean;
};

// When MSW mocking is enabled for Alerta Web, the OIDC silent auth flow (hidden
// iframe -> IdP) cannot be intercepted by the service worker, so no auth code is
// ever obtained. In that case we bypass the auth gating and use a dummy token so
// the SWR request reaches the mocked /alerts/count endpoint.
const isAlertaMocked = process.env.NEXT_PUBLIC_MSW_MOCK_ALERTA_WEB === 'true';

const API_CONFIG = {
  listApiUrl: `${process.env.NEXT_PUBLIC_URL_BE_ALERTA_WEB}/alerts?status=open&severity=critical&severity=warning&sort-by=lastReceiveTime&page-size=10`,
};

export const fetchAlertList = async (): Promise<AlertaListResponse> => {
  const token = await getToken();
  if (!token) {
    throw new Error('No authentication token available');
  }

  const doFetch = async (bearer: string) =>
    fetch(API_CONFIG.listApiUrl, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${bearer}`,
      },
    });

  let response = await doFetch(token);

  if (!response.ok) {
    if (response.status === 401) {
      invalidateAlertaToken();
      const newToken = await getToken();
      if (newToken) {
        response = await doFetch(newToken);
      }
    }
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }
  }

  return await response.json();
};

/**
 * Fetches the list of open Alerta alerts for display in the alerts detail
 * view opened from the bell icon.
 *
 * @param suppressFetch - Skip fetching, e.g. when a shared auth error from
 * the badge counter already indicates the request would fail.
 * @returns {@link UseAlertListDataResult}
 */
export const useAlertListData = (suppressFetch = false): UseAlertListDataResult => {
  const [hasAuth, setHasAuth] = useState(isAlertaAuthenticated());

  useEffect(() => {
    const checkAuthState = () => {
      setHasAuth(isAlertaAuthenticated());
    };

    checkAuthState();
    const interval = setInterval(checkAuthState, 1000);
    return () => clearInterval(interval);
  }, []);

  const swrKey = (hasAuth || isAlertaMocked) && !suppressFetch ? ['alerta-list', 'status=open'] : null;

  const { data, error, isValidating, mutate } = useSWR<AlertaListResponse>(swrKey, fetchAlertList);

  // Rendered result is gated behind a "committed" state so tick-driven updates
  // land together with the bell badge via the commit barrier, rather than as
  // soon as this request happens to return. The first delivery is shown
  // immediately (initial open shouldn't wait on the badge); only after that
  // does this hook join the barrier for subsequent rounds.
  const [committed, setCommitted] = useState<{ data?: AlertaListResponse; error?: Error }>({});
  const joinedBarrier = useRef(false);
  const unregisterBarrier = useRef<() => void>(() => {});

  useEffect(() => {
    if (joinedBarrier.current) return;
    if (data === undefined && error === undefined) return;
    joinedBarrier.current = true;
    setCommitted({ data, error: error as Error | undefined });
    unregisterBarrier.current = registerBarrierParticipant('list');
  }, [data, error]);

  useEffect(() => () => unregisterBarrier.current(), []);

  // On the badge poller's tick, refetch and commit together with the badge (see
  // alertCommitBarrier). mutate() resolves with the latest data even when it is
  // unchanged, so the barrier always advances.
  useEffect(
    () =>
      subscribeAlertRefresh(() => {
        mutate()
          .then((next) => submitToBarrier('list', () => setCommitted({ data: next, error: undefined })))
          .catch((err: unknown) =>
            submitToBarrier('list', () =>
              setCommitted({ data: undefined, error: err instanceof Error ? err : new Error(String(err)) })
            )
          );
      }),
    [mutate]
  );

  return {
    alertList: committed.data?.alerts ?? [],
    alertTotal: committed.data?.total ?? 0,
    alertListError: committed.error,
    alertListValidating: isValidating,
    alertListResolved: committed.data !== undefined || committed.error !== undefined,
  };
};
