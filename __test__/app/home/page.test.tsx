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

import { screen } from '@testing-library/react';

import { render } from '@/shared-modules/__test__/test-utils';

import Home from '@/app/[lng]/home/page';

// Mock the Home component from HomeContent so that page.tsx is tested in isolation.
jest.mock('@/app/[lng]/home/HomeContent', () => ({
  __esModule: true,
  default: () => <div data-testid='mock-home'>Home</div>,
}));

describe('home page', () => {
  test('renders the Home component', () => {
    render(<Home />);
    expect(screen.getByTestId('mock-home')).toBeVisible();
  });

  test('exports dynamic as force-dynamic', () => {
    // page.tsx sets `export const dynamic = 'force-dynamic'` to opt out of
    // static prerendering. Verify the value is correct.

    const mod = require('@/app/[lng]/home/page');
    expect(mod.dynamic).toBe('force-dynamic');
  });
});
