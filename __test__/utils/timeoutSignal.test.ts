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

import { timeoutSignal } from '@/utils/timeoutSignal';

describe('timeoutSignal', () => {
  test('returns AbortSignal when AbortSignal.timeout is available', () => {
    // Mock AbortSignal.timeout if it doesn't exist in test environment
    const mockTimeout = jest.fn(() => ({
      aborted: false,
      reason: undefined,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
      onabort: null,
    }));

    if (typeof AbortSignal.timeout !== 'function') {
      (AbortSignal as any).timeout = mockTimeout;
    }

    const result = timeoutSignal(5000);

    // Should return a signal or mock
    expect(result).toBeDefined();

    // Clean up
    if (mockTimeout.mock.calls.length > 0) {
      delete (AbortSignal as any).timeout;
    }
  });

  test('returns undefined when AbortSignal is not available', () => {
    // Save original AbortSignal
    const originalAbortSignal = global.AbortSignal;

    // Remove AbortSignal
    (global as any).AbortSignal = undefined;

    const result = timeoutSignal(5000);

    expect(result).toBeUndefined();

    // Restore
    (global as any).AbortSignal = originalAbortSignal;
  });

  test('returns undefined when AbortSignal.timeout is not a function', () => {
    // Save original
    const originalTimeout = AbortSignal.timeout;

    // Remove timeout function
    delete (AbortSignal as any).timeout;

    const result = timeoutSignal(5000);

    expect(result).toBeUndefined();

    // Restore
    (AbortSignal as any).timeout = originalTimeout;
  });
});
