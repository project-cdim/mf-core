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
import { useEffect, useState } from 'react';
import jwt from 'jsonwebtoken';
import { AlertSeverity } from '@/types/TileData';

export type AlertaCountResponse = {
  autoRefresh?: boolean;
  severityCounts?: Record<AlertSeverity, number>;
  status?: string;
  statusCounts?: Record<string, number>;
  total?: number;
};

export type UseAlertNumberDataResult = {
  alertData: AlertaCountResponse | undefined;
  alertError: Error | undefined;
  alertValidating: boolean;
  getAlertCount: (severity: AlertSeverity) => number | undefined;
  refetch: () => void;
};

type AuthTokenResponse = {
  access_token: string;
};

// Global authentication state
let authCode: string | null = null;
let authToken: AuthTokenResponse | null = null;
let tokenExpiry = 0;

const CLOCK_SKEW_MS = 90_000; // Treat token as expired 90 seconds before actual expiry
const DEFAULT_TOKEN_LIFETIME_MS = 15 * 60 * 1000; // Fallback token lifetime (15 minutes)

const API_CONFIG = {
  tokenUrl: `${process.env.NEXT_PUBLIC_URL_BE_ALERTA_WEB}/auth/openid`,
  clientId: process.env.NEXT_PUBLIC_AUTH_CLIENT_ID || '',
  redirectUri: `${process.env.NEXT_PUBLIC_URL_CORE}/auth/alerta/silent-callback.html`,
  apiUrl: `${process.env.NEXT_PUBLIC_URL_BE_ALERTA_WEB}/alerts/count?status=open`,
};

export const setAlertaAuthCode = (code: string): void => {
  if (!code || code.length < 10) return;
  authCode = code;
};

export const startAlertaAuth = (): void => {
  authCode = null;
  authToken = null;
  tokenExpiry = 0;
};

const getJwtExpSeconds = (token: string): number | undefined => {
  try {
    const decoded = jwt.decode(token, { json: true });
    if (decoded && typeof decoded === 'object' && 'exp' in decoded) {
      const exp = decoded.exp;
      if (typeof exp === 'number' && isFinite(exp) && exp > 0) {
        return exp;
      }
    }
    return undefined;
  } catch {
    return undefined;
  }
};

const calcExpiryMsFromToken = (token: string): number => {
  const expSec = getJwtExpSeconds(token);
  if (typeof expSec === 'number') {
    const expMs = expSec * 1000;
    const adjusted = expMs - CLOCK_SKEW_MS;
    const minExpiry = Date.now() + 60_000;
    return Math.max(minExpiry, adjusted);
  }
  return Date.now() + DEFAULT_TOKEN_LIFETIME_MS - CLOCK_SKEW_MS;
};

const getToken = async (): Promise<string | null> => {
  if (authToken && tokenExpiry > Date.now()) {
    return authToken.access_token;
  }

  if (!authCode) {
    return null;
  }

  try {
    const response = await fetch(API_CONFIG.tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientId: API_CONFIG.clientId,
        code: authCode,
        grant_type: 'authorization_code',
        redirectUri: API_CONFIG.redirectUri,
      }),
    });

    if (!response.ok) {
      authCode = null;
      return null;
    }

    const data = await response.json();
    const token: string | undefined = data?.token;
    if (!token) {
      authCode = null;
      return null;
    }

    const expiresAt = calcExpiryMsFromToken(token);
    authToken = { access_token: token };
    tokenExpiry = expiresAt;

    return authToken.access_token;
  } catch {
    return null;
  }
};

const fetchAlertData = async (): Promise<AlertaCountResponse> => {
  const token = await getToken();
  if (!token) {
    throw new Error('No authentication token available');
  }

  const doFetch = async (bearer: string) =>
    fetch(API_CONFIG.apiUrl, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${bearer}`,
      },
    });

  let response = await doFetch(token);

  if (!response.ok) {
    if (response.status === 401) {
      authToken = null;
      tokenExpiry = 0;
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

export const useAlertNumberData = (): UseAlertNumberDataResult => {
  const [currentAuthCode, setCurrentAuthCode] = useState<string | null>(null);
  const [currentAuthToken, setCurrentAuthToken] = useState<AuthTokenResponse | null>(null);

  useEffect(() => {
    const checkAuthState = () => {
      if (authCode !== currentAuthCode) {
        setCurrentAuthCode(authCode);
      }
      if (authToken !== currentAuthToken) {
        setCurrentAuthToken(authToken);
      }
    };

    checkAuthState();
    const interval = setInterval(checkAuthState, 1000);
    return () => clearInterval(interval);
  }, [currentAuthCode, currentAuthToken]);

  const hasAuth = currentAuthCode !== null || (currentAuthToken !== null && tokenExpiry > Date.now());
  const swrKey = hasAuth ? ['alerta-data', 'status=open'] : null;

  const { data, error, isValidating, mutate } = useSWR<AlertaCountResponse>(swrKey, fetchAlertData);

  const getAlertCount = (severity: AlertSeverity): number | undefined => {
    if (!data?.severityCounts) return undefined;
    return data.severityCounts[severity] ?? 0;
  };

  return {
    alertData: data,
    alertError: error as Error | undefined,
    alertValidating: isValidating,
    getAlertCount,
    refetch: mutate,
  };
};

// ===== Test helpers (exported only for unit testing) =====
// These are intentionally exported to allow deterministic coverage of internal
// authentication state branches (e.g. tokenExpiry > Date.now()).
// They should NOT be used by production code.
export const __setAuthTestState = (state: { code?: string | null; token?: string | null; expiry?: number }) => {
  if (state.code !== undefined) {
    authCode = state.code;
  }
  if (state.token !== undefined) {
    authToken = state.token ? { access_token: state.token } : null;
  }
  if (typeof state.expiry === 'number') {
    tokenExpiry = state.expiry;
  }
};

export const __getAuthTestState = () => ({ authCode, authToken, tokenExpiry });
