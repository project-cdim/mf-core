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

export type AlertBadgeError = {
  name: string;
  message: string;
};

type SharedAlertBadgeState = {
  count: number;
  error?: AlertBadgeError;
  // Per-severity open alert counts from the poller's last successful fetch;
  // undefined until the first fetch succeeds or while in error state.
  severityCounts?: Record<string, number>;
};

const SHARED_STATE_KEY = '__mfAlertBadgeState__';

// Local fallback used during SSR, or if `window.top` is unreachable (e.g. cross-origin
// shell). In that case state is not actually shared across frames, but this keeps the
// module usable without throwing.
const localState: SharedAlertBadgeState = { count: 0, error: undefined };

// Shared alert badge state between the non-React Luigi config (which reads it in
// `badgeCounter.count`) and the React code that writes it (`useAlertBadgePolling`).
// Writers can run in the top-level core window OR in a nested Luigi
// micro-frontend iframe (e.g. the Alerts list page), so the state is stored on
// `window.top` rather than as a plain module-level variable — otherwise each
// frame would get its own isolated module instance and updates from one frame
// would be invisible to the others.
const getSharedState = (): SharedAlertBadgeState => {
  if (typeof window === 'undefined') return localState;
  try {
    const top = window.top as (Window & { [SHARED_STATE_KEY]?: SharedAlertBadgeState }) | null;
    if (!top) return localState;
    if (!top[SHARED_STATE_KEY]) {
      top[SHARED_STATE_KEY] = { count: 0, error: undefined };
    }
    return top[SHARED_STATE_KEY];
  } catch {
    return localState;
  }
};

export const getAlertBadgeCount = (): number => getSharedState().count;

export const setAlertBadgeCount = (count: number): void => {
  getSharedState().count = count;
};

export const getAlertBadgeError = (): AlertBadgeError | undefined => getSharedState().error;

export const setAlertBadgeError = (error: AlertBadgeError | undefined): void => {
  getSharedState().error = error;
};

export const getAlertSeverityCounts = (): Record<string, number> | undefined => getSharedState().severityCounts;

export const setAlertSeverityCounts = (counts: Record<string, number> | undefined): void => {
  getSharedState().severityCounts = counts;
};
