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

import commonDict from '@/shared-modules/public/locales/en/common.json';

import getRequestConfig from '@/i18n/request';

// Treat getRequestConfig as an identity wrapper so the inner config callback
// can be invoked directly in the test environment.
jest.mock('next-intl/server', () => ({
  getRequestConfig: (fn: unknown) => fn,
}));

describe('request config', () => {
  const resolveRequestConfig = (requestLocale: string | undefined) =>
    (
      getRequestConfig as unknown as (params: {
        requestLocale: Promise<string | undefined>;
      }) => Promise<{ locale: string; messages: unknown; timeZone: string }>
    )({
      requestLocale: Promise.resolve(requestLocale),
    });

  test('returns locale/messages/timeZone for a valid locale', async () => {
    const config = await resolveRequestConfig('en');

    expect(config.locale).toBe('en');
    expect(config.messages).toEqual(commonDict);
    expect(typeof config.timeZone).toBe('string');
    expect(config.timeZone.length).toBeGreaterThan(0);
  });

  test('falls back to default locale when requestLocale is undefined', async () => {
    const config = await resolveRequestConfig(undefined);

    expect(config.locale).toBe('en');
    expect(config.messages).toEqual(commonDict);
  });

  test('falls back to default locale when requestLocale is not supported', async () => {
    const config = await resolveRequestConfig('fr');

    expect(config.locale).toBe('en');
    expect(config.messages).toEqual(commonDict);
  });
});
