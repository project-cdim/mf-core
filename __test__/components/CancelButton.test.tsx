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

import React, { useContext, useEffect } from 'react';

import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { render } from '@/shared-modules/__test__/test-utils';

import { ErrorsContext, ErrorsContextProvider } from '@/components';

import { CancelButton, EditModeContext } from '@/app/[lng]/home/HomeContent';

describe('CancelButton', () => {
  test('click cancel button', async () => {
    const testFn = jest.fn();

    const TestComponent = () => {
      const [, setErrorMessages] = useContext(ErrorsContext);
      useEffect(() => {
        setErrorMessages([{ title: 'error', message: 'error', apiName: 'error' }]);
      }, [setErrorMessages]);
      return (
        <EditModeContext.Provider value={false}>
          <CancelButton cancelEdit={testFn} />
        </EditModeContext.Provider>
      );
    };

    const { container } = render(
      <ErrorsContextProvider>
        <TestComponent />
      </ErrorsContextProvider>
    );

    expect(container).toBeVisible();
    await userEvent.click(screen.getByRole('button'));
    expect(testFn).toHaveBeenCalled();
  });
});
