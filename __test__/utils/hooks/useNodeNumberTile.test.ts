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

import { useNodeNumbers } from '@/shared-modules/utils/hooks';

import { NodeTileState } from '@/types/TileData';

import { useNodeNumberTile } from '@/utils/hooks';

jest.mock('@/shared-modules/utils/hooks', () => ({
  ...jest.requireActual('@/shared-modules/utils/hooks'),
  useNodeNumbers: jest.fn(),
}));

describe('useNodeNumberTile', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useNodeNumbers as jest.Mock).mockReturnValue({
      // nodesAll, nodesOk, nodesCritical, nodesWarning, nodesDisabled, nodesValidating, nodesError
      nodesAll: 46,
      nodesOk: 30,
      nodesCritical: 5,
      nodesWarning: 5,
      nodesDisabled: 6,
      nodesValidating: false,
      nodesError: null,
    });
  });

  test('All Nodes', () => {
    const { result } = renderHook(() => useNodeNumberTile('all'));
    expect(result.current.number).toBe(46);
    expect(result.current.linkTitle).toBe('Nodes');
    expect(result.current.link).toBe('/cdim/res-node-list');
    expect(result.current.loading).toBe(false);
    expect(result.current.status).toBe('All');
    expect(result.current.query).toEqual({});
  });
  test('OK Nodes', () => {
    const { result } = renderHook(() => useNodeNumberTile('ok'));
    expect(result.current.number).toBe(30);
    expect(result.current.linkTitle).toBe('Nodes');
    expect(result.current.link).toBe('/cdim/res-node-list');
    expect(result.current.loading).toBe(false);
    expect(result.current.status).toBe('OK');
    expect(result.current.query).toEqual({ critical: ['notExist'], warning: ['notExist'] });
  });
  test('Critical Nodes', () => {
    const { result } = renderHook(() => useNodeNumberTile('critical'));
    expect(result.current.number).toBe(5);
    expect(result.current.linkTitle).toBe('Nodes');
    expect(result.current.link).toBe('/cdim/res-node-list');
    expect(result.current.loading).toBe(false);
    expect(result.current.status).toBe('Critical');
    expect(result.current.query).toEqual({ critical: ['exist'] });
  });
  test('Warning Nodes', () => {
    const { result } = renderHook(() => useNodeNumberTile('warning'));
    expect(result.current.number).toBe(5);
    expect(result.current.linkTitle).toBe('Nodes');
    expect(result.current.link).toBe('/cdim/res-node-list');
    expect(result.current.loading).toBe(false);
    expect(result.current.status).toBe('Warning');
    expect(result.current.query).toEqual({ warning: ['exist'] });
  });
  test('Disabled Nodes', () => {
    const { result } = renderHook(() => useNodeNumberTile('disabled'));
    expect(result.current.number).toBe(6);
    expect(result.current.linkTitle).toBe('Nodes');
    expect(result.current.link).toBe('/cdim/res-node-list');
    expect(result.current.loading).toBe(false);
    expect(result.current.status).toBe('Disabled');
    expect(result.current.query).toEqual({ disabled: ['exist'] });
  });
  test('default', () => {
    const { result } = renderHook(() => useNodeNumberTile('test' as NodeTileState));
    expect(result.current.number).toBeUndefined();
    expect(result.current.linkTitle).toBe('Nodes');
    expect(result.current.link).toBe('/cdim/res-node-list');
    expect(result.current.loading).toBe(false);
    expect(result.current.status).toBeUndefined();
    expect(result.current.query).toBeUndefined();
  });
});
