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

// Cross-frame "state published" signal fired the moment the badge poller writes
// a fresh result into the shared alert badge state (see useAlertBadgePolling's
// publishResult). Consumers that render from that state — the dashboard alert
// tiles and the alerts modal's count/error — subscribe to this so they re-read
// and re-render on the same commit as the bell badge and the alerts list,
// instead of drifting on their own polling timer. Like alertBadgeState, the
// channel lives on `window.top` so all frames share it.
const PUBLISHED_EVENT = '__mfAlertPublished__';

const getTopWindow = (): Window | null => {
  if (typeof window === 'undefined') return null;
  try {
    return window.top;
  } catch {
    // Cross-origin top window — cannot coordinate across frames.
    return null;
  }
};

/** Notifies all frames listening via {@link subscribeAlertPublished} that the shared badge state changed. */
export const emitAlertPublished = (): void => {
  const top = getTopWindow();
  if (!top) return;
  try {
    top.dispatchEvent(new Event(PUBLISHED_EVENT));
  } catch {
    // Ignore: coordination is best-effort.
  }
};

/**
 * Subscribes to shared badge state publishes emitted by {@link emitAlertPublished}.
 *
 * @param listener - Called on each publish.
 * @returns Unsubscribe function.
 */
export const subscribeAlertPublished = (listener: () => void): (() => void) => {
  const top = getTopWindow();
  if (!top) return () => {};
  try {
    top.addEventListener(PUBLISHED_EVENT, listener);
    return () => top.removeEventListener(PUBLISHED_EVENT, listener);
  } catch {
    return () => {};
  }
};
