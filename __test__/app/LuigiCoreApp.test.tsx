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

import React from 'react';

import { render } from '@testing-library/react';

import LuigiCoreApp from '@/app/LuigiCoreApp';

jest.mock('@luigi-project/core/luigi.js', () => ({}));
jest.mock('@/public/luigi-config', () => ({}));

describe('LuigiCoreApp', () => {
  const originalPushState = History.prototype.pushState;
  const originalReplaceState = History.prototype.replaceState;

  beforeEach(() => {
    delete (window as typeof window & { __luigiHistoryStateGuard?: boolean }).__luigiHistoryStateGuard;
  });

  afterEach(() => {
    // The guard installs accessor properties directly on the `window.history` instance.
    // Remove them so each test starts from the unguarded prototype methods.
    delete (window.history as Partial<History>).pushState;
    delete (window.history as Partial<History>).replaceState;
    History.prototype.pushState = originalPushState;
    History.prototype.replaceState = originalReplaceState;
    delete (window as typeof window & { __luigiHistoryStateGuard?: boolean }).__luigiHistoryStateGuard;
  });

  test('coerces primitive state passed to history.pushState', () => {
    const pushStateSpy = jest.fn();
    History.prototype.pushState = pushStateSpy as unknown as History['pushState'];

    render(<LuigiCoreApp />);

    window.history.pushState('', '', '/foo');

    expect(pushStateSpy).toHaveBeenCalledWith({}, '', '/foo');
  });

  test('normalizes primitive state even when history is patched after the guard installs', () => {
    render(<LuigiCoreApp />);

    // Simulate Next.js' App Router patching pushState *after* the guard is installed: it reads
    // the current (guarded) method and reassigns its own patch that assigns an internal `__NA`
    // property to the state — which would throw on a primitive without normalization.
    const captured = window.history.pushState;
    const receivedStates: unknown[] = [];
    const nextPatch = jest.fn(function (this: History, state: unknown, unused: string, url?: string | URL | null) {
      (state as Record<string, unknown>).__NA = true;
      receivedStates.push(state);
      return captured.call(window.history, state, unused, url);
    });
    window.history.pushState = nextPatch as unknown as History['pushState'];

    expect(() => window.history.pushState('', '', '/bar')).not.toThrow();
    expect(nextPatch).toHaveBeenCalledTimes(1);
    expect(typeof receivedStates[0]).toBe('object');
    expect(receivedStates[0]).not.toBeNull();
  });

  test('coerces primitive state passed to history.replaceState', () => {
    const replaceStateSpy = jest.fn();
    History.prototype.replaceState = replaceStateSpy as unknown as History['replaceState'];

    render(<LuigiCoreApp />);

    window.history.replaceState('', '', '/baz');

    expect(replaceStateSpy).toHaveBeenCalledWith({}, '', '/baz');
  });

  test('coerces null state to an empty object', () => {
    const pushStateSpy = jest.fn();
    History.prototype.pushState = pushStateSpy as unknown as History['pushState'];

    render(<LuigiCoreApp />);

    window.history.pushState(null, '', '/qux');

    expect(pushStateSpy).toHaveBeenCalledWith({}, '', '/qux');
  });

  test('installs the guard only once across multiple renders', () => {
    const pushStateSpy = jest.fn();
    History.prototype.pushState = pushStateSpy as unknown as History['pushState'];

    render(<LuigiCoreApp />);
    // A second render re-runs the effect; the guard should detect it is already
    // installed and return early without re-wrapping the history methods.
    render(<LuigiCoreApp />);

    window.history.pushState('', '', '/once');

    expect(pushStateSpy).toHaveBeenCalledTimes(1);
    expect(pushStateSpy).toHaveBeenCalledWith({}, '', '/once');
  });
});
