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

// `utils/mocks/handlers.ts` imports `http`/`HttpResponse` from the real `msw`
// package. Requiring the real package under Jest triggers `msw`'s
// `experimental/setup-api` module, which imports the ESM-only `rettime`
// package and fails with "Cannot use import statement outside a module".
// To keep this test isolated from that packaging issue, `msw` is replaced
// with a minimal stand-in that just captures each handler's URL/resolver so
// the resolver functions can be invoked directly, without needing MSW's
// actual request-matching/execution engine.
jest.mock('msw', () => {
  const createMethod = (method: string) => (url: string, resolver: MockResolver) =>
    ({ method, url, resolver }) as MockHandler;

  return {
    http: {
      get: createMethod('GET'),
      post: createMethod('POST'),
    },
    HttpResponse: {
      json: (body: unknown, init?: { status?: number }) => ({
        status: init?.status ?? 200,
        json: async () => body,
      }),
    },
  };
});

type MockResponse = { status: number; json: () => Promise<unknown> };
type MockRequest = { url: string; text: () => Promise<string> };
type MockResolver = (info: { request: MockRequest }) => MockResponse | Promise<MockResponse>;
type MockHandler = { method: 'GET' | 'POST'; url: string; resolver: MockResolver };

const createRequest = (url: string, body = ''): MockRequest => ({
  url,
  text: async () => body,
});

describe('MSW handlers', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_URL_BE_PERFORMANCE_MANAGER: 'https://performance.example.com',
      NEXT_PUBLIC_URL_BE_CONFIGURATION_MANAGER: 'https://configuration.example.com',
      NEXT_PUBLIC_URL_BE_ALERTA_WEB: 'https://alerta.example.com',
      NEXT_PUBLIC_URL_BE_LAYOUT_APPLY: 'https://layout.example.com',
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  const disableAllFlags = () => {
    delete process.env.NEXT_PUBLIC_MSW_MOCK_PERFORMANCE_MANAGER;
    delete process.env.NEXT_PUBLIC_MSW_MOCK_CONFIGURATION_MANAGER;
    delete process.env.NEXT_PUBLIC_MSW_MOCK_ALERTA_WEB;
    delete process.env.NEXT_PUBLIC_MSW_MOCK_LAYOUT_APPLY;
  };

  test('returns no handlers when all mock flags are disabled', () => {
    disableAllFlags();

    const { createHandlers } = require('@/utils/mocks/handlers');

    expect(createHandlers()).toEqual([]);
  });

  test('creates only the performance manager handlers when enabled', () => {
    disableAllFlags();
    process.env.NEXT_PUBLIC_MSW_MOCK_PERFORMANCE_MANAGER = 'true';

    const { createHandlers } = require('@/utils/mocks/handlers');
    const handlers = createHandlers() as MockHandler[];

    expect(handlers.map((h) => h.url)).toEqual([
      'https://performance.example.com/query_range',
      'https://performance.example.com/query',
    ]);
  });

  test('creates only the configuration manager handlers when enabled', () => {
    disableAllFlags();
    process.env.NEXT_PUBLIC_MSW_MOCK_CONFIGURATION_MANAGER = 'true';

    const { createHandlers } = require('@/utils/mocks/handlers');
    const handlers = createHandlers() as MockHandler[];

    expect(handlers.map((h) => h.url)).toEqual([
      'https://configuration.example.com/resources',
      'https://configuration.example.com/nodes',
    ]);
  });

  test('creates only the alerta web handlers when enabled', () => {
    disableAllFlags();
    process.env.NEXT_PUBLIC_MSW_MOCK_ALERTA_WEB = 'true';

    const { createHandlers } = require('@/utils/mocks/handlers');
    const handlers = createHandlers() as MockHandler[];

    expect(handlers.map((h) => h.url)).toEqual([
      'https://alerta.example.com/alerts/count',
      'https://alerta.example.com/alerts',
      'https://alerta.example.com/auth/openid',
    ]);
  });

  test('creates only the layout apply handlers when enabled', () => {
    disableAllFlags();
    process.env.NEXT_PUBLIC_MSW_MOCK_LAYOUT_APPLY = 'true';

    const { createHandlers } = require('@/utils/mocks/handlers');
    const handlers = createHandlers() as MockHandler[];

    expect(handlers.map((h) => h.url)).toEqual(['https://layout.example.com/layout-apply']);
  });

  test('exports the flat handlers array containing every handler group', () => {
    const { handlers } = require('@/utils/mocks/handlers');

    // 2 performance + 2 configuration + 3 alerta + 1 layout apply = 8
    expect(handlers).toHaveLength(8);
  });

  describe('performance manager handlers', () => {
    let queryRangeHandler: MockHandler;
    let queryHandler: MockHandler;

    beforeEach(() => {
      const { handlers } = require('@/utils/mocks/handlers');
      queryRangeHandler = (handlers as MockHandler[]).find((h) => h.url.endsWith('/query_range'))!;
      queryHandler = (handlers as MockHandler[]).find((h) => h.url.endsWith('/query'))!;
    });

    test('returns the demo dataset for a daily step', async () => {
      const request = createRequest('https://performance.example.com/query_range', 'step=1d&query=some_query');
      const response = await queryRangeHandler.resolver({ request });
      expect(response.status).toBe(200);
      expect(await response.json()).toBeDefined();
    });

    test('returns the energy query range dataset for an hourly energy query', async () => {
      const request = createRequest(
        'https://performance.example.com/query_range',
        `step=1h&query=${encodeURIComponent('node.*_metricEnergyJoules_reading')}`
      );
      const response = await queryRangeHandler.resolver({ request });
      expect(response.status).toBe(200);
      expect(await response.json()).toBeDefined();
    });

    test('returns the donut dataset for an hourly non-energy query', async () => {
      const request = createRequest('https://performance.example.com/query_range', 'step=1h&query=other_query');
      const response = await queryRangeHandler.resolver({ request });
      expect(response.status).toBe(200);
      expect(await response.json()).toBeDefined();
    });

    test('falls back to the query range dataset for other step values', async () => {
      const request = createRequest('https://performance.example.com/query_range', 'step=5m&query=other_query');
      const response = await queryRangeHandler.resolver({ request });
      expect(response.status).toBe(200);
      expect(await response.json()).toBeDefined();
    });

    test('returns the single value query dataset', async () => {
      const request = createRequest('https://performance.example.com/query', 'query=some_query');
      const response = await queryHandler.resolver({ request });
      expect(response.status).toBe(200);
      expect(await response.json()).toBeDefined();
    });
  });

  describe('configuration manager handlers', () => {
    let resourcesHandler: MockHandler;
    let nodesHandler: MockHandler;

    beforeEach(() => {
      const { handlers } = require('@/utils/mocks/handlers');
      resourcesHandler = (handlers as MockHandler[]).find((h) => h.url.endsWith('/resources'))!;
      nodesHandler = (handlers as MockHandler[]).find((h) => h.url.endsWith('/nodes'))!;
    });

    test('returns resources when detail is requested', async () => {
      const request = createRequest('https://configuration.example.com/resources?detail=true');
      const response = await resourcesHandler.resolver({ request });
      expect(response.status).toBe(200);
      expect(await response.json()).toBeDefined();
    });

    test('returns resources when detail is not requested', async () => {
      const request = createRequest('https://configuration.example.com/resources');
      const response = await resourcesHandler.resolver({ request });
      expect(response.status).toBe(200);
      expect(await response.json()).toBeDefined();
    });

    test('returns nodes', async () => {
      const request = createRequest('https://configuration.example.com/nodes');
      const response = await nodesHandler.resolver({ request });
      expect(response.status).toBe(200);
      expect(await response.json()).toBeDefined();
    });
  });

  describe('alerta web handlers', () => {
    let countHandler: MockHandler;
    let alertsHandler: MockHandler;
    let authHandler: MockHandler;

    beforeEach(() => {
      const { handlers } = require('@/utils/mocks/handlers');
      countHandler = (handlers as MockHandler[]).find((h) => h.url.endsWith('/alerts/count'))!;
      alertsHandler = (handlers as MockHandler[]).find((h) => h.url.endsWith('/alerts'))!;
      authHandler = (handlers as MockHandler[]).find((h) => h.url.endsWith('/auth/openid'))!;
    });

    test('alternates between success and error responses for open alert counts', async () => {
      const request = createRequest('https://alerta.example.com/alerts/count?status=open');

      const first = await countHandler.resolver({ request });
      expect(first.status).toBe(200);
      await expect(first.json()).resolves.toMatchObject({ status: 'ok', total: 8 });

      const second = await countHandler.resolver({ request });
      expect(second.status).toBe(500);
      await expect(second.json()).resolves.toMatchObject({ code: 'ERROR' });

      const third = await countHandler.resolver({ request });
      expect(third.status).toBe(200);
    });

    test('returns total counts when status is not specified', async () => {
      const request = createRequest('https://alerta.example.com/alerts/count');
      const response = await countHandler.resolver({ request });
      expect(response.status).toBe(200);
      await expect(response.json()).resolves.toMatchObject({ total: 5 });
    });

    test('returns open alerts list when status=open', async () => {
      const request = createRequest('https://alerta.example.com/alerts?status=open');
      const response = await alertsHandler.resolver({ request });
      const body = (await response.json()) as { alerts: unknown[]; total: number };
      expect(body.total).toBe(3);
      expect(body.alerts).toHaveLength(3);
    });

    test('returns an empty alerts list when status is not open', async () => {
      const request = createRequest('https://alerta.example.com/alerts');
      const response = await alertsHandler.resolver({ request });
      await expect(response.json()).resolves.toEqual({ alerts: [], total: 0 });
    });

    test('returns a dummy access token for the openid auth endpoint', async () => {
      const request = createRequest('https://alerta.example.com/auth/openid', 'grant_type=client_credentials');
      const response = await authHandler.resolver({ request });
      await expect(response.json()).resolves.toEqual({ access_token: 'dummy_access_token' });
    });
  });

  describe('layout apply handlers', () => {
    test('returns the layout apply dataset', async () => {
      const { handlers } = require('@/utils/mocks/handlers');
      const layoutApplyHandler = (handlers as MockHandler[]).find((h) => h.url.endsWith('/layout-apply'))!;

      const request = createRequest('https://layout.example.com/layout-apply?limit=1000');
      const response = await layoutApplyHandler.resolver({ request });
      expect(response.status).toBe(200);
      expect(await response.json()).toBeDefined();
    });
  });
});
