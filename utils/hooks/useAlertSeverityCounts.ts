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

import { useEffect, useState } from 'react';

import { getAlertSeverityCounts } from '@/utils/alertBadgeState';
import { subscribeAlertPublished } from '@/utils/alertPublishSignal';

const isSameCounts = (a: Record<string, number> | undefined, b: Record<string, number> | undefined): boolean => {
  if (a === b) return true;
  if (!a || !b) return false;
  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);
  return aKeys.length === bKeys.length && aKeys.every((key) => a[key] === b[key]);
};

/**
 * Reads the per-severity open alert counts that the bell badge poller
 * publishes into the shared alert badge state on `window.top` (see
 * utils/alertBadgeState.ts). The dashboard alert tiles render from this
 * instead of fetching on their own, so tiles and bell always show the same
 * data and flip between number and error state together.
 *
 * @returns The last published severity counts, or undefined before the first
 *   successful fetch or while the poller is in an error state.
 */
export const useAlertSeverityCounts = (): Record<string, number> | undefined => {
  const [counts, setCounts] = useState<Record<string, number> | undefined>(() => getAlertSeverityCounts());

  useEffect(() => {
    const checkCounts = () => {
      setCounts((prev) => {
        const current = getAlertSeverityCounts();
        return isSameCounts(prev, current) ? prev : current;
      });
    };
    checkCounts();
    // Update on the poller's publish so tiles/modal flip together with the bell
    // badge and the alerts list, rather than on an independent timer.
    return subscribeAlertPublished(checkCounts);
  }, []);

  return counts;
};
