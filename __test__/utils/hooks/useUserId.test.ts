/*
 * Copyright 2025-2026 NEC Corporation.
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

import { getToken } from '@luigi-project/client';
import { renderHook } from '@testing-library/react';

import { useUserId } from '@/utils/hooks';

const dummyToken =
  /**
   * encoded token
   *
   * const header = {
   *   alg: 'HS256',
   *   typ: 'JWT',
   * };
   * const payload = {
   * sub: '1234567890',
   * name: 'John Doe',
   * iat: 1516239022,
   * };
   */
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

const mockGetToken = getToken as jest.Mock;

describe('useUserId', () => {
  beforeEach(() => {
    // Run before each test
    jest.clearAllMocks();
  });

  test('should return the user id', () => {
    mockGetToken.mockReturnValue(dummyToken);
    const { result } = renderHook(() => useUserId());
    expect(result.current).toBe('1234567890');
  });

  test('When the result of getToken is an empty string', () => {
    mockGetToken.mockReturnValue('');
    const { result } = renderHook(() => useUserId());
    expect(result.current).toBeUndefined();
  });
});
