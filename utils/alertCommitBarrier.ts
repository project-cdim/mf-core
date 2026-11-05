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

// Cross-frame commit barrier so the bell badge (shell window) and the alerts
// list (its own Luigi iframe) apply their freshly-fetched data at the same
// moment instead of whenever each request happens to return. Each side buffers
// its result and the barrier flushes them together once every registered
// participant has submitted. If a participant never submits, a safety timeout
// flushes whatever is buffered so nothing stalls.
//
// Like alertBadgeState, the shared state lives on `window.top` so both frames
// see one barrier rather than isolated per-frame module instances.

type Committer = () => void;

type BarrierState = {
  registered: Set<string>;
  buffered: Map<string, Committer>;
  timer: ReturnType<typeof setTimeout> | null;
};

const BARRIER_KEY = '__mfAlertCommitBarrier__';

// Longer than the fetch timeouts (10s) so a normally-completing round always
// flushes on its own; this only guards against a participant that never
// submits (e.g. its request hung past the abort).
const BARRIER_TIMEOUT_MS = 15_000;

// SSR / cross-origin-top fallback: a single-frame local barrier keeps the
// module usable (participants just aren't actually shared across frames).
const localState: BarrierState = { registered: new Set(), buffered: new Map(), timer: null };

const getState = (): BarrierState => {
  if (typeof window === 'undefined') return localState;
  try {
    const top = window.top as (Window & { [BARRIER_KEY]?: BarrierState }) | null;
    if (!top) return localState;
    if (!top[BARRIER_KEY]) {
      top[BARRIER_KEY] = { registered: new Set(), buffered: new Map(), timer: null };
    }
    return top[BARRIER_KEY];
  } catch {
    return localState;
  }
};

const clearTimer = (state: BarrierState): void => {
  if (state.timer !== null) {
    clearTimeout(state.timer);
    state.timer = null;
  }
};

const allBuffered = (state: BarrierState): boolean =>
  state.registered.size > 0 && Array.from(state.registered).every((name) => state.buffered.has(name));

const flush = (state: BarrierState): void => {
  clearTimer(state);
  const committers = Array.from(state.buffered.values());
  state.buffered.clear();
  for (const commit of committers) {
    try {
      commit();
    } catch {
      // Keep flushing the rest even if one committer throws.
    }
  }
};

/**
 * Registers a participant that will submit results via {@link submitToBarrier}.
 * The barrier waits for every registered participant before flushing.
 *
 * @param name - Unique participant id (e.g. 'badge', 'list').
 * @returns Unregister function; call on unmount so the barrier stops waiting on it.
 */
export const registerBarrierParticipant = (name: string): (() => void) => {
  const state = getState();
  state.registered.add(name);
  return () => {
    state.registered.delete(name);
    state.buffered.delete(name);
    // This participant may have been the one others were waiting on.
    if (state.buffered.size > 0 && allBuffered(state)) flush(state);
  };
};

/**
 * Buffers a participant's commit callback for the current round. Once every
 * registered participant has submitted, all buffered committers run together.
 * Unregistered participants commit immediately (they can't take part).
 *
 * @param name - The participant id used with {@link registerBarrierParticipant}.
 * @param commit - Applies this participant's freshly-fetched data.
 */
export const submitToBarrier = (name: string, commit: Committer): void => {
  const state = getState();
  if (!state.registered.has(name)) {
    commit();
    return;
  }
  state.buffered.set(name, commit);
  if (allBuffered(state)) {
    flush(state);
    return;
  }
  if (state.timer === null) {
    state.timer = setTimeout(() => flush(state), BARRIER_TIMEOUT_MS);
  }
};
