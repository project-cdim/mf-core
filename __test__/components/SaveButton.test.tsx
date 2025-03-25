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

import React, { useContext, useEffect } from 'react';

import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { render } from '@/shared-modules/__test__/test-utils';

import { ErrorMessageContextType, ErrorsContext, ErrorsContextProvider } from '@/components';

import { EditModeContext, SaveButton } from '@/pages/home';

describe('SaveButton', () => {
  test('click save button', async () => {
    const testFn = jest.fn();
    const { container } = render(
      <ErrorsContextProvider>
        <SaveButton saveLayout={testFn} />
      </ErrorsContextProvider>
    );

    expect(container).toBeVisible();
    await userEvent.click(screen.getByRole('button'));
    expect(testFn).toHaveBeenCalled();
  });
  test('click save button with prev message from another API', async () => {
    const testFn = jest.fn();
    let msg: ErrorMessageContextType[] = [];

    const TestComponent = () => {
      const [errorMessages, setErrorMessages] = useContext(ErrorsContext);
      useEffect(() => {
        setErrorMessages([{ title: 'error', message: 'error', apiName: 'xxxx' }]);
      }, [setErrorMessages]);
      msg = errorMessages;

      return (
        <EditModeContext.Provider value={false}>
          <SaveButton saveLayout={testFn} />
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
    expect(msg).toEqual([{ title: 'error', message: 'error', apiName: 'xxxx' }]);
  });

  test('save error with prev message from same API', async () => {
    const testFn = jest.fn(() => {
      throw Error('error');
    });
    let msg: ErrorMessageContextType[] = [];
    const TestComponent = () => {
      const [errorMessages, setErrorMessages] = useContext(ErrorsContext);
      useEffect(() => {
        setErrorMessages([{ title: 'error', message: 'error', apiName: 'save' }]);
      }, [setErrorMessages]);
      msg = errorMessages;
      return (
        <EditModeContext.Provider value={false}>
          <SaveButton saveLayout={testFn} />
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
    expect(msg).toEqual([{ title: 'Failed to save the dashboard data', message: 'error', apiName: 'save' }]);
    expect(testFn).toHaveBeenCalled();
  });

  test('save error without error message', async () => {
    const testFn = jest.fn(() => {
      throw { message: undefined };
    });
    const { container } = render(
      <ErrorsContextProvider>
        <SaveButton saveLayout={testFn} />
      </ErrorsContextProvider>
    );

    await expect(container).toBeVisible();
    await userEvent.click(screen.getByRole('button'));
    await expect(testFn).toHaveBeenCalled();
  });
});
