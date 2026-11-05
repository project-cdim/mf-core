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

// Cross-frame "refresh now" tick so the bell badge and the alerts list update
// on the same moment. The badge poller owns the single master timer and runs
// in the shell (top) window; the alerts list runs in a separate Luigi content
// iframe. Like alertBadgeState, coordination goes through `window.top` so both
// frames share one channel rather than isolated per-frame module instances.
const REFRESH_EVENT = '__mfAlertRefresh__';

const getTopWindow = (): Window | null => {
  if (typeof window === 'undefined') return null;
  try {
    return window.top;
  } catch {
    // Cross-origin top window — cannot coordinate across frames.
    return null;
  }
};

/** Broadcasts a refresh tick to all frames listening via {@link subscribeAlertRefresh}. */
export const emitAlertRefresh = (): void => {
  const top = getTopWindow();
  if (!top) return;
  try {
    top.dispatchEvent(new Event(REFRESH_EVENT));
  } catch {
    // Ignore: coordination is best-effort.
  }
};

/**
 * Subscribes to refresh ticks emitted by {@link emitAlertRefresh}.
 *
 * @param listener - Called on each tick.
 * @returns Unsubscribe function.
 */
export const subscribeAlertRefresh = (listener: () => void): (() => void) => {
  const top = getTopWindow();
  if (!top) return () => {};
  try {
    top.addEventListener(REFRESH_EVENT, listener);
    return () => top.removeEventListener(REFRESH_EVENT, listener);
  } catch {
    return () => {};
  }
};
