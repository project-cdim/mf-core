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

import { screen } from '@testing-library/react';

import { render } from '@/shared-modules/__test__/test-utils';
import { PageLink } from '@/shared-modules/components';
import classes from '@/shared-modules/styles/styles.module.css';

import { CustomProgress, ProgressTile, ProgressTileProps } from '@/components';

import { EditModeContext } from '@/pages/home';

jest.mock('@/shared-modules/utils/hooks', () => ({
  ...jest.requireActual('@/shared-modules/utils/hooks'),
  useResourceNumbers: jest.fn(),
}));

jest.mock('@mantine/core', () => ({
  __esModule: true,
  ...jest.requireActual('@mantine/core'),
  Progress: () => <div data-testid='mockProgress'></div>,
}));

jest.mock('@/shared-modules/components/', () => ({
  ...jest.requireActual('@/shared-modules/components/'),
  PageLink: jest.fn().mockImplementation(({ children }) => <div>{children}</div>),
}));

describe('ProgressTile', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  test.each([
    [{ allValue: 10, value: 5 }, '5/10'],
    [{ allValue: 10, value: 0 }, '0/10'],
    [{ allValue: 0, value: 0 }, '0/0'],
    [{ allValue: 0, value: 5 }, '5/0'],
    [{ allValue: 10, value: undefined }, '- /10'],
    [{ allValue: undefined, value: 5 }, '5/ -'],
    [{ allValue: undefined, value: undefined }, '- / -'],
  ])('Render ProgressTile, value: %o, %s', (dummyData, numString) => {
    const props: ProgressTileProps = {
      title: 'TestProgressTile',
      value: dummyData.value,
      allValue: dummyData.allValue,
      loading: false,
    };

    render(<ProgressTile {...props} />);

    const title = screen.getByRole('heading', { name: 'TestProgressTile' });
    const numbers = title.nextSibling;
    const progress = screen.getByTestId('mockProgress');

    expect(title).toBeVisible();
    expect(numbers).toHaveTextContent(numString);
    expect(progress).toBeVisible();
  });

  test('Render ProgressTile with bg', () => {
    const props: ProgressTileProps = {
      title: 'TestProgressTile',
      value: 10,
      allValue: 100,
      loading: false,
      bg: 'red',
    };

    render(<ProgressTile {...props} />);

    const title = screen.getByRole('heading', { name: 'TestProgressTile' });
    const numbers = title.nextSibling;
    const progress = screen.getByTestId('mockProgress');

    expect(title).toBeVisible();
    expect(numbers).toHaveTextContent('10/100');
    expect(progress).toBeVisible();
    const stack = title.parentElement;
    expect(stack).toHaveClass(classes.red);
  });

  test('if loading render a loader', () => {
    const props: ProgressTileProps = {
      title: 'TestProgressTile',
      value: 10,
      allValue: 100,
      loading: true,
    };
    const { container } = render(<ProgressTile {...props} />);
    expect(container).toDisplayLoader();
  });

  test('render ProgressTile with reference mode', () => {
    const props: ProgressTileProps = {
      title: 'TestProgressTile',
      value: 10,
      allValue: 100,
      loading: false,
      link: '/cdim/res-summary',
    };

    render(
      <EditModeContext.Provider value={false}>
        <ProgressTile {...props} />
      </EditModeContext.Provider>
    );

    const linkProps = (PageLink as jest.Mock).mock.calls[0][0];
    expect(linkProps.path).toBe(props.link);
  });

  test('render ProgressTile with edit mode', () => {
    const props: ProgressTileProps = {
      title: 'TestProgressTile',
      value: 10,
      allValue: 100,
      loading: false,
      link: '/cdim/res-summary',
    };

    render(
      <EditModeContext.Provider value={true}>
        <ProgressTile {...props} />
      </EditModeContext.Provider>
    );

    const linkProps = (PageLink as jest.Mock).mock.calls[0][0];
    expect(linkProps.path).toBeUndefined();
  });
});

describe('CustomProgress', () => {
  test('render CustomProgress', () => {
    const { container } = render(<CustomProgress value={10} allValue={100} />);
    expect(container).toBeVisible();
  });
});
