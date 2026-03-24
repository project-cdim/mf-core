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

import { getMSWMockConfig, isMSWEnabled } from '@/utils/mocks/config';

describe('getMSWMockConfig', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...OLD_ENV };
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  test('returns all false when no env vars set', () => {
    delete process.env.NEXT_PUBLIC_MSW_MOCK_PERFORMANCE_MANAGER;
    delete process.env.NEXT_PUBLIC_MSW_MOCK_CONFIGURATION_MANAGER;
    delete process.env.NEXT_PUBLIC_MSW_MOCK_ALERTA_WEB;
    delete process.env.NEXT_PUBLIC_MSW_MOCK_LAYOUT_APPLY;

    const cfg = getMSWMockConfig();
    expect(cfg.performanceManager).toBe(false);
    expect(cfg.configurationManager).toBe(false);
    expect(cfg.alertaWeb).toBe(false);
    expect(cfg.layoutApply).toBe(false);
  });

  test('returns all true when all env vars are "true"', () => {
    process.env.NEXT_PUBLIC_MSW_MOCK_PERFORMANCE_MANAGER = 'true';
    process.env.NEXT_PUBLIC_MSW_MOCK_CONFIGURATION_MANAGER = 'true';
    process.env.NEXT_PUBLIC_MSW_MOCK_ALERTA_WEB = 'true';
    process.env.NEXT_PUBLIC_MSW_MOCK_LAYOUT_APPLY = 'true';

    const cfg = getMSWMockConfig();
    expect(cfg.performanceManager).toBe(true);
    expect(cfg.configurationManager).toBe(true);
    expect(cfg.alertaWeb).toBe(true);
    expect(cfg.layoutApply).toBe(true);
  });

  test('parses true strings to booleans per-key', () => {
    process.env.NEXT_PUBLIC_MSW_MOCK_PERFORMANCE_MANAGER = 'true';
    process.env.NEXT_PUBLIC_MSW_MOCK_CONFIGURATION_MANAGER = 'false';
    process.env.NEXT_PUBLIC_MSW_MOCK_ALERTA_WEB = 'true';
    process.env.NEXT_PUBLIC_MSW_MOCK_LAYOUT_APPLY = 'false';

    const cfg = getMSWMockConfig();
    expect(cfg.performanceManager).toBe(true);
    expect(cfg.configurationManager).toBe(false);
    expect(cfg.alertaWeb).toBe(true);
    expect(cfg.layoutApply).toBe(false);
  });

  test('returns false for non-"true" string values', () => {
    process.env.NEXT_PUBLIC_MSW_MOCK_PERFORMANCE_MANAGER = 'TRUE';
    process.env.NEXT_PUBLIC_MSW_MOCK_CONFIGURATION_MANAGER = '1';
    process.env.NEXT_PUBLIC_MSW_MOCK_ALERTA_WEB = 'yes';
    process.env.NEXT_PUBLIC_MSW_MOCK_LAYOUT_APPLY = '';

    const cfg = getMSWMockConfig();
    expect(cfg.performanceManager).toBe(false);
    expect(cfg.configurationManager).toBe(false);
    expect(cfg.alertaWeb).toBe(false);
    expect(cfg.layoutApply).toBe(false);
  });
});

describe('isMSWEnabled', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...OLD_ENV };
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  test('returns true when NODE_ENV is development', () => {
    Object.defineProperty(process.env, 'NODE_ENV', { value: 'development', writable: true });
    delete process.env.NEXT_PUBLIC_USE_MSW;
    expect(isMSWEnabled()).toBe(true);
  });

  test('returns true when NEXT_PUBLIC_USE_MSW is "true"', () => {
    Object.defineProperty(process.env, 'NODE_ENV', { value: 'production', writable: true });
    process.env.NEXT_PUBLIC_USE_MSW = 'true';
    expect(isMSWEnabled()).toBe(true);
  });

  test('returns false when NODE_ENV is production and NEXT_PUBLIC_USE_MSW is not "true"', () => {
    Object.defineProperty(process.env, 'NODE_ENV', { value: 'production', writable: true });
    delete process.env.NEXT_PUBLIC_USE_MSW;
    expect(isMSWEnabled()).toBe(false);
  });

  test('returns false when NODE_ENV is production and NEXT_PUBLIC_USE_MSW is "false"', () => {
    Object.defineProperty(process.env, 'NODE_ENV', { value: 'production', writable: true });
    process.env.NEXT_PUBLIC_USE_MSW = 'false';
    expect(isMSWEnabled()).toBe(false);
  });

  test('returns false when NODE_ENV is test and NEXT_PUBLIC_USE_MSW is not set', () => {
    Object.defineProperty(process.env, 'NODE_ENV', { value: 'test', writable: true });
    delete process.env.NEXT_PUBLIC_USE_MSW;
    expect(isMSWEnabled()).toBe(false);
  });

  test('returns true when NODE_ENV is test and NEXT_PUBLIC_USE_MSW is "true"', () => {
    Object.defineProperty(process.env, 'NODE_ENV', { value: 'test', writable: true });
    process.env.NEXT_PUBLIC_USE_MSW = 'true';
    expect(isMSWEnabled()).toBe(true);
  });
});
