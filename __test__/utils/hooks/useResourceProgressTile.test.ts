/*
 * Copyright 2025 NEC Corporation.
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

import { renderHook } from '@testing-library/react';

import { useResourceNumbers } from '@/shared-modules/utils/hooks';

import { ProgressTileState } from '@/types/TileData';

import { useResourceProgressTile } from '@/utils/hooks';

jest.mock('@/shared-modules/utils/hooks', () => ({
  ...jest.requireActual('@/shared-modules/utils/hooks'),
  useResourceNumbers: jest.fn(),
}));

describe('useResourceProgressTile', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useResourceNumbers as jest.Mock).mockReturnValue({
      resourcesAll: 1024,
      resourcesAllocated: 180,
      resourcesValidating: false,
      resourcesError: null,
    });
  });
  test('Allocated Resources', () => {
    const { result } = renderHook(() => useResourceProgressTile('allocated'));
    expect(result.current.value).toBe(180);
    expect(result.current.allValue).toBe(1024);
    expect(result.current.linkTitle).toBe('Resources.list');
    expect(result.current.link).toBe('/cdim/res-resource-list');
    expect(result.current.loading).toBe(false);
    expect(result.current.query).toEqual({ allocatednode: ['Allocated'] });
  });

  test('default', () => {
    const { result } = renderHook(() => useResourceProgressTile('test' as ProgressTileState));
    expect(result.current.value).toBeUndefined();
    expect(result.current.allValue).toBeUndefined();
    expect(result.current.linkTitle).toBe('Resources.list');
    expect(result.current.link).toBe('/cdim/res-resource-list');
    expect(result.current.loading).toBe(false);
    expect(result.current.query).toBeUndefined();
  });
});
