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

import { render } from '@/shared-modules/__test__/test-utils';

import { DashboardGridBackground } from '@/components';

describe('DashboardGridBackground', () => {
  test('props.displayGrid:true can be received correctly', () => {
    const { container } = render(
      <DashboardGridBackground width={100} gridColumns={12} cellSize={85} displayGrid={true}>
        <div>children</div>
      </DashboardGridBackground>
    );

    const background = container.getElementsByClassName('dashboardGrid')[0];
    expect(background).toHaveStyle({ '--grid-layout-cell-color': '#f0f0f0' });
    expect(background).not.toHaveStyle({ '--grid-layout-cell-color': '#fff' });
  });
  test('props.displayGrid:false can be received correctly', () => {
    const { container } = render(
      <DashboardGridBackground width={100} gridColumns={12} cellSize={85} displayGrid={false}>
        <div>children</div>
      </DashboardGridBackground>
    );

    const background = container.getElementsByClassName('dashboardGrid')[0];
    expect(background).not.toHaveStyle({ '--grid-layout-cell-color': '#f0f0f0' });
    expect(background).toHaveStyle({ '--grid-layout-cell-color': '#fff' });
  });
});
