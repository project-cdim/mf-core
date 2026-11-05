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

import jwt from 'jsonwebtoken';

import { timeoutSignal } from '@/utils/timeoutSignal';
import { getNumberFromEnv } from '@/shared-modules/utils';

type AuthTokenResponse = {
  access_token: string;
};

type SharedAlertAuthState = {
  authToken: AuthTokenResponse | null;
  tokenExpiry: number;
  // Single in-flight code→token exchange, shared between concurrent callers
  // (badge polling + tile fetch). Auth codes are single-use at the IdP, so two
  // parallel exchanges of the same code would make the second one fail.
  tokenExchange: Promise<string | null> | null;
};

const SHARED_AUTH_KEY = '__mfAlertAuthState__';

// Local fallback used during SSR, or if `window.top` is unreachable (e.g.
// cross-origin shell). In that case state is not actually shared across
// frames, but this keeps the module usable without throwing.
const localAuthState: SharedAlertAuthState = { authToken: null, tokenExpiry: 0, tokenExchange: null };

// Shared token/expiry/in-flight-exchange state between the shell (core)
// window's badge poller (useAlertBadgePolling) and the alerts list running in
// its own Luigi content iframe (useAlertList). Both fetch the same Alerta Web
// API and would otherwise each run their own code→token exchange and hold an
// independent token, since a plain module-level variable is isolated per
// frame. Stored on `window.top` instead, following the same pattern as
// alertBadgeState.ts.
const getSharedAuthState = (): SharedAlertAuthState => {
  if (typeof window === 'undefined') return localAuthState;
  try {
    const top = window.top as (Window & { [SHARED_AUTH_KEY]?: SharedAlertAuthState }) | null;
    if (!top) return localAuthState;
    if (!top[SHARED_AUTH_KEY]) {
      top[SHARED_AUTH_KEY] = { authToken: null, tokenExpiry: 0, tokenExchange: null };
    }
    return top[SHARED_AUTH_KEY];
  } catch {
    return localAuthState;
  }
};

// Auth code is intentionally NOT shared: each frame runs its own silent OIDC
// flow (AlertaSilentGetCode) and obtains its own single-use code, which is
// exchanged for the shared token above.
let authCode: string | null = null;

// Abort a hanging token exchange (e.g. backend up but stalled) so callers get
// an error instead of waiting forever on a shared in-flight promise.
const EXCHANGE_TIMEOUT_MS = 10_000;

const CLOCK_SKEW_MS = 90_000; // Treat token as expired 90 seconds before actual expiry
const DEFAULT_TOKEN_LIFETIME_MS = 15 * 60 * 1000; // Fallback token lifetime (15 minutes)

// When MSW mocking is enabled for Alerta Web, the OIDC silent auth flow (hidden
// iframe -> IdP) cannot be intercepted by the service worker, so no auth code is
// ever obtained. In that case we bypass the auth gating and use a dummy token so
// the SWR request reaches the mocked /alerts/count endpoint.
const isAlertaMocked = process.env.NEXT_PUBLIC_MSW_MOCK_ALERTA_WEB === 'true';

// Single source of truth for how often alert data is refreshed. Both the bell
// badge poller (useAlertBadgePolling) and the alerts modal/list (useAlertList)
// use this so the badge count and the modal's alert list always update on the
// same cadence. Driven by NEXT_PUBLIC_ALERT_REFRESH_INTERVAL_SEC (seconds),
// falling back to 30s when unset, zero, or not a number.
const DEFAULT_ALERT_REFRESH_INTERVAL_SEC = 30;
const ONE_SECOND_MS = 1000;

export const getAlertRefreshIntervalMs = (): number => {
  const sec = getNumberFromEnv(process.env.NEXT_PUBLIC_ALERT_REFRESH_INTERVAL_SEC);
  return (sec != undefined && sec !== 0 ? sec : DEFAULT_ALERT_REFRESH_INTERVAL_SEC) * ONE_SECOND_MS;
};

const API_CONFIG = {
  tokenUrl: `${process.env.NEXT_PUBLIC_URL_BE_ALERTA_WEB}/auth/openid`,
  clientId: process.env.NEXT_PUBLIC_AUTH_CLIENT_ID || '',
  redirectUri: `${process.env.NEXT_PUBLIC_URL_CORE}/auth/alerta/silent-callback.html`,
};

export const setAlertaAuthCode = (code: string): void => {
  if (!code || code.length < 10) return;
  authCode = code;
};

export const startAlertaAuth = (): void => {
  authCode = null;
  const shared = getSharedAuthState();
  shared.authToken = null;
  shared.tokenExpiry = 0;
};

export const isAlertaAuthenticated = (): boolean => {
  const shared = getSharedAuthState();
  // A running code→token exchange counts as authenticated: the code is
  // already spent at that point, and reporting "no auth" for that window
  // would make pollers of this function flap.
  return (
    authCode !== null || shared.tokenExchange !== null || (shared.authToken !== null && shared.tokenExpiry > Date.now())
  );
};

export const invalidateAlertaToken = (): void => {
  const shared = getSharedAuthState();
  shared.authToken = null;
  shared.tokenExpiry = 0;
};

export const getJwtExpSeconds = (token: string): number | undefined => {
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

export const calcExpiryMsFromToken = (token: string): number => {
  const expSec = getJwtExpSeconds(token);
  if (typeof expSec === 'number') {
    const expMs = expSec * 1000;
    const adjusted = expMs - CLOCK_SKEW_MS;
    const minExpiry = Date.now() + 60_000;
    return Math.max(minExpiry, adjusted);
  }
  return Date.now() + DEFAULT_TOKEN_LIFETIME_MS - CLOCK_SKEW_MS;
};

const exchangeCodeForToken = async (code: string): Promise<string | null> => {
  try {
    const response = await fetch(API_CONFIG.tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientId: API_CONFIG.clientId,
        code,
        grant_type: 'authorization_code',
        redirectUri: API_CONFIG.redirectUri,
      }),
      signal: timeoutSignal(EXCHANGE_TIMEOUT_MS),
    });

    // The code reached the server, so it is spent either way — drop it so
    // isAlertaAuthenticated() reflects reality and a new silent auth can be
    // started instead of retrying with a code the IdP will reject as
    // already used.
    authCode = null;

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const token: string | undefined = data?.token;
    if (!token) {
      return null;
    }

    const expiresAt = calcExpiryMsFromToken(token);
    const shared = getSharedAuthState();
    shared.authToken = { access_token: token };
    shared.tokenExpiry = expiresAt;

    return shared.authToken.access_token;
  } catch {
    // Network error — the code may not have reached the server; keep it so
    // the next attempt can retry the exchange.
    return null;
  }
};

export const getToken = async (): Promise<string | null> => {
  if (isAlertaMocked) {
    return 'mock-access-token';
  }

  const shared = getSharedAuthState();

  if (shared.authToken && shared.tokenExpiry > Date.now()) {
    return shared.authToken.access_token;
  }

  if (shared.tokenExchange) {
    return shared.tokenExchange;
  }

  if (!authCode) {
    return null;
  }

  shared.tokenExchange = exchangeCodeForToken(authCode).finally(() => {
    shared.tokenExchange = null;
  });
  return shared.tokenExchange;
};

// ===== Test helpers (exported only for unit testing) =====
// These are intentionally exported to allow deterministic coverage of internal
// authentication state branches (e.g. tokenExpiry > Date.now()).
// They should NOT be used by production code.
export const __setAuthTestState = (state: { code?: string | null; token?: string | null; expiry?: number }) => {
  const shared = getSharedAuthState();
  if (state.code !== undefined) {
    authCode = state.code;
  }
  if (state.token !== undefined) {
    shared.authToken = state.token ? { access_token: state.token } : null;
  }
  if (typeof state.expiry === 'number') {
    shared.tokenExpiry = state.expiry;
  }
};

export const __getAuthTestState = () => {
  const shared = getSharedAuthState();
  return { authCode, authToken: shared.authToken, tokenExpiry: shared.tokenExpiry };
};
