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

import { useLayoutApplyNumbers } from '@/shared-modules/utils/hooks';

import { LayoutApplyTileState } from '@/types/TileData';

import { useLayoutApplyNumberTile } from '@/utils/hooks';

jest.mock('@/shared-modules/utils/hooks', () => ({
  ...jest.requireActual('@/shared-modules/utils/hooks'),
  useLayoutApplyNumbers: jest.fn(),
}));

describe('useLayoutApplyNumberTile', () => {
  test('suspended', () => {
    (useLayoutApplyNumbers as jest.Mock).mockReturnValue({
      layoutApplyFaild: 5,
      layoutApplySuspended: 5,
      layoutApplyValidating: false,
      layoutApplyError: null,
    });
    const { result } = renderHook(() => useLayoutApplyNumberTile('suspended'));
    expect(result.current.status).toBe('Suspended');
    expect(result.current.number).toBe(5);
    expect(result.current.linkTitle).toBe('LayoutApplies.list');
    expect(result.current.link).toBe('/cdim/lay-layout-apply-list');
    expect(result.current.query).toEqual({ status: ['SUSPENDED'] });
    expect(result.current.loading).toBe(false);
  });

  test('failed', () => {
    (useLayoutApplyNumbers as jest.Mock).mockReturnValue({
      layoutApplyFailed: 10,
      layoutApplySuspended: 5,
      layoutApplyValidating: false,
      layoutApplyError: null,
    });
    const { result } = renderHook(() => useLayoutApplyNumberTile('failed'));
    expect(result.current.status).toBe('Failed');
    expect(result.current.number).toBe(10);
    expect(result.current.linkTitle).toBe('LayoutApplies.list');
    expect(result.current.link).toBe('/cdim/lay-layout-apply-list');
    expect(result.current.query).toEqual({ status: ['FAILED'] });
    expect(result.current.loading).toBe(false);
  });
  test('default', () => {
    (useLayoutApplyNumbers as jest.Mock).mockReturnValue({
      layoutApplyFailed: 10,
      layoutApplySuspended: 5,
      layoutApplyValidating: false,
      layoutApplyError: null,
    });
    const { result } = renderHook(() => useLayoutApplyNumberTile('test' as LayoutApplyTileState));
    expect(result.current.status).toBeUndefined();
    expect(result.current.number).toBeUndefined();
    expect(result.current.linkTitle).toBe('LayoutApplies.list');
    expect(result.current.link).toBe('/cdim/lay-layout-apply-list');
    expect(result.current.query).toBeUndefined();
    expect(result.current.loading).toBe(false);
  });
});
