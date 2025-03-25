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

import React, { useMemo } from 'react';

import { screen, render as testingLibraryRender, within } from '@testing-library/react';

import { ErrorsContext, ErrorsContextProvider, useSetErrorInContext } from '@/components';

function render(ui: React.ReactNode) {
  return testingLibraryRender(<>{ui}</>, {
    wrapper: ({ children }: { children: React.ReactNode }) => <ErrorsContextProvider>{children}</ErrorsContextProvider>,
  });
}

describe('ErrorsContextProvider', () => {
  test('if not set error, renders children without errors', () => {
    render(<ChildComponentWithoutSetter />);

    const childComponent = screen.getByTestId('child-component');
    expect(childComponent).toBeInTheDocument();
    const title = screen.queryAllByTestId('error-title');
    expect(title).toHaveLength(0);
  });

  test.each([
    [
      'api-not-default',
      { message: 'Error Title', response: { data: { message: 'Error Message' } } },
      { title: 'Error Title', message: 'Error Message' },
    ],
    ['api-not-default', { message: 'Error Title' }, { title: 'Error Title', message: '' }],
  ])(
    'if new error of not default api, add  new error into context value with saving default error value: %s, %o, %o',
    (apiName, error, expected) => {
      render(<ChildComponentWithSetter apiName={apiName} error={error} />);

      const defaultError = screen.getByTestId('api-default');
      const notDefaultError = screen.getByTestId('api-not-default');

      expect(defaultError).toBeInTheDocument();
      expect(notDefaultError).toBeInTheDocument();

      const defaultErrorTitle = within(defaultError).getByTestId('title');
      const defaultErrorMessage = within(defaultError).getByTestId('message');

      expect(defaultErrorTitle).toHaveTextContent('Default Title');
      expect(defaultErrorMessage).toHaveTextContent('Default Message');

      const notDefaultErrorTitle = within(notDefaultError).getByTestId('title');
      const notDefaultErrorMessage = within(notDefaultError).getByTestId('message');

      expect(notDefaultErrorTitle).toHaveTextContent(expected.title);
      expect(notDefaultErrorMessage).toHaveTextContent(expected.message);
    }
  );

  test.each([
    ['api-not-default', null],
    ['api-not-default', undefined],
  ])(
    'if new error of not default api but not object, not add new error into context value with saving default error value: %s, %o, %o',
    (apiName, error) => {
      render(<ChildComponentWithSetter apiName={apiName} error={error} />);

      const defaultError = screen.getByTestId('api-default');
      const errorTitles = screen.getAllByRole('heading');

      expect(defaultError).toBeInTheDocument();
      expect(errorTitles).toHaveLength(1);
    }
  );

  test.each([
    [
      'api-default',
      { message: 'Error Title', response: { data: { message: 'Error Message' } } },
      { title: 'Error Title', message: 'Error Message' },
    ],
    ['api-default', { message: 'Error Title' }, { title: 'Error Title', message: '' }],
  ])(
    'if new error of default api , updates default api error of context value: %s, %o, %o',
    (apiName, error, expected) => {
      render(<ChildComponentWithSetter apiName={apiName} error={error} />);

      const defaultError = screen.getByTestId('api-default');

      expect(defaultError).toBeInTheDocument();

      const defaultErrorTitle = within(defaultError).getByTestId('title');
      const defaultErrorMessage = within(defaultError).getByTestId('message');

      expect(defaultErrorTitle).toHaveTextContent(expected.title);
      expect(defaultErrorMessage).toHaveTextContent(expected.message);
    }
  );

  test.each([
    ['api-default', null],
    ['api-default', undefined],
  ])(
    'if new error of default api but not object , delete default api error of context value: %s, %o, %o',
    (apiName, error) => {
      render(<ChildComponentWithSetter apiName={apiName} error={error} />);

      const defaultError = screen.queryByTestId('api-default');
      expect(defaultError).not.toBeInTheDocument();

      const errorTitles = screen.queryAllByRole('heading');
      expect(errorTitles).toHaveLength(0);
    }
  );
});

function ChildComponentWithoutSetter() {
  const [errorMessages] = React.useContext(ErrorsContext);
  return (
    <div data-testid='child-component'>
      {errorMessages.map((e) => (
        <div key={e.apiName} data-testid={e.apiName}>
          <h1 data-testid='error-title'>{e.title}</h1>
          <p>{e.message}</p>
          <span>{e.apiName}</span>
        </div>
      ))}
    </div>
  );
}

function ChildComponentWithSetter(props: {
  apiName: string;
  error: null | undefined | { message: string; response?: { data: { message: string } } };
}) {
  const defaultError = useMemo(
    () => ({ message: 'Default Title', response: { data: { message: 'Default Message' } } }),
    []
  );
  useSetErrorInContext('api-default', defaultError);
  useSetErrorInContext(props.apiName, props.error);
  const [errorMessages] = React.useContext(ErrorsContext);

  return (
    <div data-testid='child-component'>
      {errorMessages.map((e) => (
        <div key={e.apiName} data-testid={e.apiName}>
          <h1 data-testid='title'>{e.title}</h1>
          <p data-testid='message'>{e.message}</p>
          <span data-testid='apiName'>{e.apiName}</span>
        </div>
      ))}
    </div>
  );
}
