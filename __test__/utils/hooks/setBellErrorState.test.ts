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

import { setBellErrorState } from '@/utils/hooks/useAlertBadgePolling';

/**
 * Unit tests for setBellErrorState function
 */
describe('setBellErrorState', () => {
  test('handles normal browser scenario', () => {
    const toggleSpy = jest.spyOn(document.body.classList, 'toggle');

    setBellErrorState(true);
    expect(toggleSpy).toHaveBeenCalledWith('alert-fetch-error', true);

    setBellErrorState(false);
    expect(toggleSpy).toHaveBeenCalledWith('alert-fetch-error', false);

    toggleSpy.mockRestore();
  });

  test('handles cross-origin error gracefully', () => {
    const originalTop = window.top;

    // Mock window.top to throw on document access
    Object.defineProperty(window, 'top', {
      get: () => {
        const mockTop: any = {
          get document() {
            throw new Error('Cross-origin access denied');
          },
        };
        return mockTop;
      },
      configurable: true,
    });

    // Should not throw despite cross-origin error
    expect(() => {
      setBellErrorState(true);
    }).not.toThrow();

    // Restore
    Object.defineProperty(window, 'top', {
      value: originalTop,
      configurable: true,
    });
  });

  test('handles null window.top gracefully', () => {
    const originalTop = window.top;

    // Mock window.top as null
    Object.defineProperty(window, 'top', {
      value: null,
      configurable: true,
    });

    // Should not throw
    expect(() => {
      setBellErrorState(true);
    }).not.toThrow();

    // Restore
    Object.defineProperty(window, 'top', {
      value: originalTop,
      configurable: true,
    });
  });

  test('no-ops in a non-browser (SSR) environment', () => {
    const originalWindow = global.window;
    // Simulate SSR where `window` is undefined.
    // @ts-expect-error - deliberately removing window for this test
    delete global.window;

    expect(() => {
      setBellErrorState(true);
    }).not.toThrow();

    global.window = originalWindow;
  });
});
