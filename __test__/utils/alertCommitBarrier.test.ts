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

import { registerBarrierParticipant, submitToBarrier } from '@/utils/alertCommitBarrier';

describe('alertCommitBarrier', () => {
  const BARRIER_KEY = '__mfAlertCommitBarrier__';

  beforeEach(() => {
    // Reset the shared singleton stored on window.top between tests.
    delete (window.top as unknown as Record<string, unknown>)[BARRIER_KEY];
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('an unregistered participant commits immediately', () => {
    const commit = jest.fn();
    submitToBarrier('ghost', commit);
    expect(commit).toHaveBeenCalledTimes(1);
  });

  test('a sole registered participant flushes as soon as it submits', () => {
    registerBarrierParticipant('badge');
    const commit = jest.fn();
    submitToBarrier('badge', commit);
    expect(commit).toHaveBeenCalledTimes(1);
  });

  test('two participants are flushed together only once both submit', () => {
    registerBarrierParticipant('badge');
    registerBarrierParticipant('list');

    const badgeCommit = jest.fn();
    const listCommit = jest.fn();

    submitToBarrier('badge', badgeCommit);
    expect(badgeCommit).not.toHaveBeenCalled();
    expect(listCommit).not.toHaveBeenCalled();

    submitToBarrier('list', listCommit);
    expect(badgeCommit).toHaveBeenCalledTimes(1);
    expect(listCommit).toHaveBeenCalledTimes(1);
  });

  test('the safety timeout flushes whatever is buffered when a participant never submits', () => {
    jest.useFakeTimers();
    registerBarrierParticipant('badge');
    registerBarrierParticipant('list');

    const badgeCommit = jest.fn();
    submitToBarrier('badge', badgeCommit);
    expect(badgeCommit).not.toHaveBeenCalled();

    jest.advanceTimersByTime(15_000);
    expect(badgeCommit).toHaveBeenCalledTimes(1);
  });

  test('unregistering the awaited participant releases a buffered one', () => {
    registerBarrierParticipant('badge');
    const unregisterList = registerBarrierParticipant('list');

    const badgeCommit = jest.fn();
    submitToBarrier('badge', badgeCommit);
    expect(badgeCommit).not.toHaveBeenCalled();

    unregisterList();
    expect(badgeCommit).toHaveBeenCalledTimes(1);
  });

  test('the latest committer per participant wins within a round', () => {
    registerBarrierParticipant('badge');
    registerBarrierParticipant('list');

    const stale = jest.fn();
    const fresh = jest.fn();
    submitToBarrier('badge', stale);
    submitToBarrier('badge', fresh);
    submitToBarrier('list', jest.fn());

    expect(stale).not.toHaveBeenCalled();
    expect(fresh).toHaveBeenCalledTimes(1);
  });

  test('falls back to the local barrier when window.top access throws', () => {
    const topDescriptor = Object.getOwnPropertyDescriptor(window, 'top');
    Object.defineProperty(window, 'top', {
      configurable: true,
      get() {
        throw new Error('cross-origin');
      },
    });

    try {
      registerBarrierParticipant('badge');
      const commit = jest.fn();
      submitToBarrier('badge', commit);
      expect(commit).toHaveBeenCalledTimes(1);
    } finally {
      if (topDescriptor) {
        Object.defineProperty(window, 'top', topDescriptor);
      }
    }
  });

  test('falls back to the local barrier when there is no window (SSR)', () => {
    const originalWindow = global.window;
    // @ts-expect-error -- simulate a server-side (no DOM) environment.
    delete global.window;

    try {
      registerBarrierParticipant('badge');
      const commit = jest.fn();
      submitToBarrier('badge', commit);
      expect(commit).toHaveBeenCalledTimes(1);
    } finally {
      global.window = originalWindow;
    }
  });

  test('falls back to the local barrier when window.top is absent', () => {
    const topDescriptor = Object.getOwnPropertyDescriptor(window, 'top');
    Object.defineProperty(window, 'top', { configurable: true, get: () => null });

    try {
      registerBarrierParticipant('badge');
      const commit = jest.fn();
      submitToBarrier('badge', commit);
      expect(commit).toHaveBeenCalledTimes(1);
    } finally {
      if (topDescriptor) {
        Object.defineProperty(window, 'top', topDescriptor);
      }
    }
  });
});
