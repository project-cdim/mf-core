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

import { emitAlertRefresh, subscribeAlertRefresh } from '@/utils/alertRefreshSignal';

describe('alertRefreshSignal', () => {
  const withTopThrowing = (fn: () => void): void => {
    const descriptor = Object.getOwnPropertyDescriptor(window, 'top');
    Object.defineProperty(window, 'top', {
      configurable: true,
      get() {
        throw new Error('cross-origin');
      },
    });
    try {
      fn();
    } finally {
      if (descriptor) {
        Object.defineProperty(window, 'top', descriptor);
      }
    }
  };

  test('a subscribed listener is notified on emit and stops after unsubscribe', () => {
    const listener = jest.fn();
    const unsubscribe = subscribeAlertRefresh(listener);

    emitAlertRefresh();
    expect(listener).toHaveBeenCalledTimes(1);

    unsubscribe();
    emitAlertRefresh();
    expect(listener).toHaveBeenCalledTimes(1);
  });

  test('emitAlertRefresh does nothing when the top window is inaccessible', () => {
    withTopThrowing(() => {
      expect(() => emitAlertRefresh()).not.toThrow();
    });
  });

  test('subscribeAlertRefresh returns a no-op unsubscribe when the top window is inaccessible', () => {
    withTopThrowing(() => {
      const listener = jest.fn();
      const unsubscribe = subscribeAlertRefresh(listener);
      expect(() => unsubscribe()).not.toThrow();
      expect(listener).not.toHaveBeenCalled();
    });
  });

  test('emitAlertRefresh swallows dispatchEvent errors', () => {
    const top = window.top as Window;
    const spy = jest.spyOn(top, 'dispatchEvent').mockImplementation(() => {
      throw new Error('dispatch failed');
    });

    expect(() => emitAlertRefresh()).not.toThrow();

    spy.mockRestore();
  });

  test('subscribeAlertRefresh returns a no-op unsubscribe when addEventListener throws', () => {
    const top = window.top as Window;
    const spy = jest.spyOn(top, 'addEventListener').mockImplementation(() => {
      throw new Error('listener failed');
    });

    const unsubscribe = subscribeAlertRefresh(jest.fn());
    expect(() => unsubscribe()).not.toThrow();

    spy.mockRestore();
  });

  test('is inert when there is no window (SSR)', () => {
    const originalWindow = global.window;
    // @ts-expect-error -- simulate a server-side (no DOM) environment.
    delete global.window;

    try {
      expect(() => emitAlertRefresh()).not.toThrow();
      const listener = jest.fn();
      const unsubscribe = subscribeAlertRefresh(listener);
      expect(() => unsubscribe()).not.toThrow();
      expect(listener).not.toHaveBeenCalled();
    } finally {
      global.window = originalWindow;
    }
  });
});
