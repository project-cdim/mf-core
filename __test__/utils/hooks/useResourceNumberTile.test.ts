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

import { renderHook } from '@testing-library/react';

import { useResourceNumbers } from '@/shared-modules/utils/hooks';

import { ResourceTileState } from '@/types/TileData';

import { useResourceNumberTile } from '@/utils/hooks';

jest.mock('@/shared-modules/utils/hooks', () => ({
  ...jest.requireActual('@/shared-modules/utils/hooks'),
  useResourceNumbers: jest.fn(),
}));

describe('useResourceNumberTile', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useResourceNumbers as jest.Mock).mockReturnValue({
      resourcesAll: 1024,
      resourcesOk: 979,
      resourcesCritical: 5,
      resourcesWarning: 6,
      resourcesUnallocated: 8,
      resourcesDesignAvailable: 9,
      resourcesDesignUnavailable: 10,
      resourcesMaintenance: 11,
      resourcesNotDetected: 12,
      resourcesValidating: false,
      resourcesError: null,
    });
  });
  test('All Resources', () => {
    const { result } = renderHook(() => useResourceNumberTile('all'));
    expect(result.current.status).toBe('All');
    expect(result.current.number).toBe(1024);
    expect(result.current.linkTitle).toBe('Resources.list');
    expect(result.current.link).toBe('/cdim/res-resource-list');
    expect(result.current.loading).toBe(false);
    expect(result.current.query).toEqual({});
  });
  test('OK Resources', () => {
    const { result } = renderHook(() => useResourceNumberTile('ok'));
    expect(result.current.status).toBe('OK');
    expect(result.current.number).toBe(979);
    expect(result.current.linkTitle).toBe('Resources.list');
    expect(result.current.link).toBe('/cdim/res-resource-list');
    expect(result.current.loading).toBe(false);
    expect(result.current.query).toEqual({ status: ['OK'] });
  });
  test('Critical Resources', () => {
    const { result } = renderHook(() => useResourceNumberTile('critical'));
    expect(result.current.status).toBe('Critical');
    expect(result.current.number).toBe(5);
    expect(result.current.linkTitle).toBe('Resources.list');
    expect(result.current.link).toBe('/cdim/res-resource-list');
    expect(result.current.loading).toBe(false);
    expect(result.current.query).toEqual({ status: ['Critical'] });
  });
  test('Warning Resources', () => {
    const { result } = renderHook(() => useResourceNumberTile('warning'));
    expect(result.current.status).toBe('Warning');
    expect(result.current.number).toBe(6);
    expect(result.current.linkTitle).toBe('Resources.list');
    expect(result.current.link).toBe('/cdim/res-resource-list');
    expect(result.current.loading).toBe(false);
    expect(result.current.query).toEqual({ status: ['Warning'] });
  });
  test('Unallocated Resources', () => {
    const { result } = renderHook(() => useResourceNumberTile('unallocated'));
    expect(result.current.status).toBe('Unallocated');
    expect(result.current.number).toBe(8);
    expect(result.current.linkTitle).toBe('Resources.list');
    expect(result.current.link).toBe('/cdim/res-resource-list');
    expect(result.current.loading).toBe(false);
    expect(result.current.query).toEqual({ allocatednode: ['Unallocated'] });
  });
  test('Design Available Resources', () => {
    const { result } = renderHook(() => useResourceNumberTile('designAvailable'));
    expect(result.current.status).toBe('DesignAvailable');
    expect(result.current.number).toBe(9);
    expect(result.current.linkTitle).toBe('Resources.list');
    expect(result.current.link).toBe('/cdim/res-resource-list');
    expect(result.current.loading).toBe(false);
    expect(result.current.query).toEqual({
      resourceAvailable: ['Available'],
      status: ['OK'],
      detection: ['Detected'],
    });
  });
  test('Design Unavailable Resources', () => {
    const { result } = renderHook(() => useResourceNumberTile('designUnavailable'));
    expect(result.current.status).toBe('DesignUnavailable');
    expect(result.current.number).toBe(10);
    expect(result.current.linkTitle).toBe('Resources.list');
    expect(result.current.link).toBeUndefined();
    expect(result.current.loading).toBe(false);
    expect(result.current.query).toBeUndefined();
  });
  test('Maintenance Resources', () => {
    const { result } = renderHook(() => useResourceNumberTile('maintenance'));
    expect(result.current.status).toBe('Maintenance');
    expect(result.current.number).toBe(11);
    expect(result.current.linkTitle).toBe('Resources.list');
    expect(result.current.link).toBe('/cdim/res-resource-list');
    expect(result.current.loading).toBe(false);
    expect(result.current.query).toEqual({ resourceAvailable: ['Unavailable'] });
  });
  test('default', () => {
    const { result } = renderHook(() => useResourceNumberTile('test' as ResourceTileState));
    expect(result.current.number).toBeUndefined();
    expect(result.current.linkTitle).toBe('Resources.list');
    expect(result.current.link).toBe('/cdim/res-resource-list');
    expect(result.current.loading).toBe(false);
    expect(result.current.status).toBeUndefined();
    expect(result.current.query).toBeUndefined();
  });
  test('Not Detected Resources', () => {
    const { result } = renderHook(() => useResourceNumberTile('notDetected'));
    expect(result.current.status).toBe('NotDetected');
    expect(result.current.number).toBe(12);
    expect(result.current.linkTitle).toBe('Resources.list');
    expect(result.current.link).toBe('/cdim/res-resource-list');
    expect(result.current.loading).toBe(false);
    expect(result.current.query).toEqual({ detection: ['Not Detected'] });
  });
});
