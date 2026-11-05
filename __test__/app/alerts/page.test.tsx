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

import React from 'react';

import { fireEvent, screen, waitFor } from '@testing-library/react';

import { render } from '@/shared-modules/__test__/test-utils';

let silentAuthError: string | null = null;

const hideLoadingIndicator = jest.fn();
const useAlertListDataMock = jest.fn();
const useAlertBadgeErrorMock = jest.fn();
const useAlertSeverityCountsMock = jest.fn();

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string, values?: { count?: number; all?: number }) => {
    if (key === 'Showing {count} of {all} alerts') {
      return `Showing ${values?.count} of ${values?.all} alerts`;
    }
    return key;
  },
}));

jest.mock('@mantine/core', () => {
  const actual = jest.requireActual('@mantine/core');
  return {
    ...actual,
    LoadingOverlay: ({ visible }: { visible?: boolean }) => (visible ? <div data-testid='loading-overlay' /> : null),
  };
});

jest.mock('@/components/AlertaSilentGetCode', () => {
  const React = require('react');
  const MockAlertaSilentGetCode = ({
    onCode,
    onError,
  }: {
    onCode: (code: string) => void;
    onError: (error: string) => void;
  }) => {
    React.useEffect(() => {
      if (silentAuthError) {
        onError(silentAuthError);
        return;
      }
      onCode('mock-code');
    }, [onCode, onError]);

    return <div data-testid='silent-auth' />;
  };
  return {
    __esModule: true,
    default: MockAlertaSilentGetCode,
  };
});

jest.mock('@/shared-modules/components', () => ({
  DatetimeString: ({ date }: { date: Date }) => <time data-testid='datetime'>{date.toISOString()}</time>,
  ExternalLink: ({ children, title, url }: { children: React.ReactNode; title?: string; url: string }) => (
    <a data-testid='external-link' href={url} title={title}>
      {children}
    </a>
  ),
  IconWithInfo: ({ label }: { label: string }) => <span data-testid='icon-with-info'>{label}</span>,
  LongSentences: ({ text }: { text: string }) => <span>{text}</span>,
  MessageBox: ({ title, message }: { title: string; message: React.ReactNode }) => (
    <div data-testid='message-box'>
      <strong>{title}</strong>
      <span>{message}</span>
    </div>
  ),
}));

jest.mock('@/shared-modules/contexts/LuigiClientProvider', () => ({
  useInitializedLuigiClient: () => ({
    luigiClient: {
      uxManager: () => ({
        hideLoadingIndicator,
      }),
    },
  }),
}));

jest.mock('@/utils/hooks/useAlertList', () => ({
  useAlertListData: (...args: unknown[]) => useAlertListDataMock(...args),
}));

jest.mock('@/utils/hooks/useAlertBadgeError', () => ({
  useAlertBadgeError: () => useAlertBadgeErrorMock(),
}));

jest.mock('@/utils/hooks/useAlertSeverityCounts', () => ({
  useAlertSeverityCounts: () => useAlertSeverityCountsMock(),
}));

import Alerts from '@/app/[lng]/alerts/page';

describe('alerts page', () => {
  const originalRequestAnimationFrame = window.requestAnimationFrame;
  const originalCancelAnimationFrame = window.cancelAnimationFrame;
  const originalAlertaWebUiUrl = process.env.NEXT_PUBLIC_URL_ALERTA_WEBUI;

  beforeEach(() => {
    silentAuthError = null;
    hideLoadingIndicator.mockClear();
    useAlertListDataMock.mockReset();
    useAlertBadgeErrorMock.mockReset();
    useAlertBadgeErrorMock.mockReturnValue(undefined);
    useAlertSeverityCountsMock.mockReset();
    useAlertSeverityCountsMock.mockReturnValue(undefined);
    process.env.NEXT_PUBLIC_URL_ALERTA_WEBUI = 'https://alerts.example.com';

    window.requestAnimationFrame = ((callback: FrameRequestCallback) => {
      callback(0);
      return 1;
    }) as typeof window.requestAnimationFrame;
    window.cancelAnimationFrame = jest.fn() as typeof window.cancelAnimationFrame;
  });

  afterEach(() => {
    window.requestAnimationFrame = originalRequestAnimationFrame;
    window.cancelAnimationFrame = originalCancelAnimationFrame;
    process.env.NEXT_PUBLIC_URL_ALERTA_WEBUI = originalAlertaWebUiUrl;
  });

  test('shows the loading overlay while alert data is unresolved', () => {
    useAlertListDataMock.mockReturnValue({
      alertList: [],
      alertTotal: 0,
      alertListError: undefined,
      alertListValidating: true,
      alertListResolved: false,
    });

    render(<Alerts />);

    expect(screen.getByTestId('loading-overlay')).toBeInTheDocument();
    expect(screen.queryByText('No alerts')).not.toBeInTheDocument();
    expect(hideLoadingIndicator).not.toHaveBeenCalled();
  });

  test('shows the empty state when there are no visible alerts', () => {
    useAlertListDataMock.mockReturnValue({
      alertList: [],
      alertTotal: 0,
      alertListError: undefined,
      alertListValidating: false,
      alertListResolved: true,
    });

    render(<Alerts />);

    expect(screen.getByText('No alerts')).toBeInTheDocument();
    expect(screen.getByTestId('external-link')).toHaveTextContent('View & Manage Alerts (0)');
    expect(hideLoadingIndicator).toHaveBeenCalled();
  });

  test('shows alerts while revalidating, without the loading overlay', () => {
    useAlertListDataMock.mockReturnValue({
      alertList: [
        {
          id: 'alert-001',
          event: 'Event 1',
          text: 'Text 1',
          lastReceiveTime: '2026-01-01T00:00:00.000Z',
          resource: 'web01',
          severity: 'critical',
        },
      ],
      alertTotal: 1,
      alertListError: undefined,
      alertListValidating: true,
      alertListResolved: true,
    });

    render(<Alerts />);

    expect(screen.queryByTestId('loading-overlay')).not.toBeInTheDocument();
    expect(screen.getByText('Event 1')).toBeInTheDocument();
  });

  test('falls back to a relative Alerta Web UI URL when the env var is unset', () => {
    delete process.env.NEXT_PUBLIC_URL_ALERTA_WEBUI;
    useAlertListDataMock.mockReturnValue({
      alertList: [
        {
          id: 'alert-001',
          event: 'Event 1',
          text: 'Text 1',
          lastReceiveTime: '2026-01-01T00:00:00.000Z',
          resource: 'web01',
          severity: 'critical',
        },
      ],
      alertTotal: 1,
      alertListError: undefined,
      alertListValidating: false,
      alertListResolved: true,
    });

    render(<Alerts />);

    expect(screen.getByText('Event 1')).toBeInTheDocument();
    expect(screen.getByTestId('external-link')).toHaveAttribute(
      'href',
      '/alerts?q=severity%3Acritical%20OR%20severity%3Awarning#status:open'
    );
  });

  test('renders alert cards and opens the selected alert', async () => {
    useAlertListDataMock.mockReturnValue({
      alertList: [
        {
          id: 'alert-001',
          event: 'Event 1',
          text: 'Text 1',
          lastReceiveTime: '2026-01-01T00:00:00.000Z',
          resource: 'web01',
          severity: 'critical',
        },
        {
          id: 'alert-002',
          event: 'Event 2',
          text: 'Text 2',
          lastReceiveTime: '2026-01-02T00:00:00.000Z',
          resource: 'web02',
          severity: 'warning',
        },
        {
          id: 'alert-003',
          event: 'Ignored info alert',
          text: 'Ignored',
          lastReceiveTime: '2026-01-03T00:00:00.000Z',
          resource: 'web03',
          severity: 'informational',
        },
      ],
      alertTotal: 3,
      alertListError: undefined,
      alertListValidating: false,
      alertListResolved: true,
    });

    render(<Alerts />);

    expect(screen.getByText('Event 1')).toBeInTheDocument();
    expect(screen.getByText('Event 2')).toBeInTheDocument();
    expect(screen.queryByText('Ignored info alert')).not.toBeInTheDocument();

    // Each alert row carries the Alert Detail View tooltip (spec 5.4.2.1).
    expect(screen.getAllByTitle('Alerta Web UI(Alert Detail View) [External Web Site]')).toHaveLength(2);
    // The manage link carries the Alert Summary List tooltip (spec 5.4.2.1).
    expect(screen.getByTestId('external-link')).toHaveAttribute('title', 'Alerta Web UI(Alert Summary List)');

    fireEvent.mouseEnter(screen.getByText('Event 1'));
    fireEvent.mouseLeave(screen.getByText('Event 1'));

    // Spies are only installed after the container is attached to
    // `document.body` (which testing-library's `render()` does internally),
    // so they don't interfere with rendering and only capture the anchor
    // element created by the click handler.
    const appendedAnchors: HTMLAnchorElement[] = [];
    const appendChildSpy = jest.spyOn(document.body, 'appendChild').mockImplementation((node: Node) => {
      appendedAnchors.push(node as HTMLAnchorElement);
      return node;
    });
    const removeChildSpy = jest.spyOn(document.body, 'removeChild').mockImplementation((node: Node) => node);
    const anchorClickSpy = jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);

    try {
      fireEvent.click(screen.getByText('Event 1'));

      await waitFor(() => {
        expect(anchorClickSpy).toHaveBeenCalledTimes(1);
      });
      expect(appendedAnchors[0]?.href).toBe('https://alerts.example.com/alert/alert-001');
      expect(appendChildSpy).toHaveBeenCalled();
      expect(removeChildSpy).toHaveBeenCalled();
    } finally {
      appendChildSpy.mockRestore();
      removeChildSpy.mockRestore();
      anchorClickSpy.mockRestore();
    }
  });

  test('shows the shared badge error when it already exists', () => {
    useAlertBadgeErrorMock.mockReturnValue(new Error('badge failed'));
    useAlertListDataMock.mockReturnValue({
      alertList: [],
      alertTotal: 0,
      alertListError: undefined,
      alertListValidating: false,
      alertListResolved: true,
    });

    render(<Alerts />);

    expect(screen.getByTestId('message-box')).toHaveTextContent('Failed to fetch alert information');
    expect(screen.getByTestId('message-box')).toHaveTextContent('badge failed');
    expect(screen.getByTestId('external-link')).toHaveTextContent('View & Manage Alerts');
    expect(screen.getByTestId('external-link')).not.toHaveTextContent('(');
  });

  test('shows the auth error reported by silent auth', () => {
    silentAuthError = 'login_required';
    useAlertListDataMock.mockReturnValue({
      alertList: [],
      alertTotal: 0,
      alertListError: undefined,
      alertListValidating: false,
      alertListResolved: true,
    });

    render(<Alerts />);

    expect(screen.getByTestId('message-box')).toHaveTextContent('Failed to fetch alert information');
    expect(screen.getByTestId('message-box')).toHaveTextContent('login_required');
  });

  test('shows the shared badge count instead of the list total', () => {
    // The list endpoint lags with a stale total (2) while the bell badge's
    // shared severity counts hold the correct value (critical 5 + warning 3).
    useAlertSeverityCountsMock.mockReturnValue({ critical: 5, warning: 3 });
    useAlertListDataMock.mockReturnValue({
      alertList: [
        {
          id: 'alert-001',
          event: 'Event 1',
          text: 'Text 1',
          lastReceiveTime: '2026-01-01T00:00:00.000Z',
          resource: 'web01',
          severity: 'critical',
        },
      ],
      alertTotal: 2,
      alertListError: undefined,
      alertListValidating: false,
      alertListResolved: true,
    });

    render(<Alerts />);

    expect(screen.getByText('Showing 1 of 8 alerts')).toBeInTheDocument();
    expect(screen.getByTestId('external-link')).toHaveTextContent('(8)');
  });

  test('activates an alert row via keyboard Enter key', async () => {
    useAlertListDataMock.mockReturnValue({
      alertList: [
        {
          id: 'alert-001',
          event: 'Event 1',
          text: 'Text 1',
          lastReceiveTime: '2026-01-01T00:00:00.000Z',
          resource: 'web01',
          severity: 'critical',
        },
      ],
      alertTotal: 1,
      alertListError: undefined,
      alertListValidating: false,
      alertListResolved: true,
    });

    render(<Alerts />);

    const appendedAnchors: HTMLAnchorElement[] = [];
    const appendChildSpy = jest.spyOn(document.body, 'appendChild').mockImplementation((node: Node) => {
      appendedAnchors.push(node as HTMLAnchorElement);
      return node;
    });
    const removeChildSpy = jest.spyOn(document.body, 'removeChild').mockImplementation((node: Node) => node);
    const anchorClickSpy = jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);

    try {
      fireEvent.keyDown(screen.getByText('Event 1').closest('[tabindex="0"]')!, { key: 'Enter' });

      await waitFor(() => {
        expect(anchorClickSpy).toHaveBeenCalledTimes(1);
      });
      expect(appendedAnchors[0]?.href).toBe('https://alerts.example.com/alert/alert-001');
    } finally {
      appendChildSpy.mockRestore();
      removeChildSpy.mockRestore();
      anchorClickSpy.mockRestore();
    }
  });

  test('activates an alert row via keyboard Space key', async () => {
    useAlertListDataMock.mockReturnValue({
      alertList: [
        {
          id: 'alert-002',
          event: 'Event 2',
          text: 'Text 2',
          lastReceiveTime: '2026-01-02T00:00:00.000Z',
          resource: 'web02',
          severity: 'warning',
        },
      ],
      alertTotal: 1,
      alertListError: undefined,
      alertListValidating: false,
      alertListResolved: true,
    });

    render(<Alerts />);

    const appendedAnchors: HTMLAnchorElement[] = [];
    const appendChildSpy = jest.spyOn(document.body, 'appendChild').mockImplementation((node: Node) => {
      appendedAnchors.push(node as HTMLAnchorElement);
      return node;
    });
    const removeChildSpy = jest.spyOn(document.body, 'removeChild').mockImplementation((node: Node) => node);
    const anchorClickSpy = jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);

    try {
      fireEvent.keyDown(screen.getByText('Event 2').closest('[tabindex="0"]')!, { key: ' ' });

      await waitFor(() => {
        expect(anchorClickSpy).toHaveBeenCalledTimes(1);
      });
      expect(appendedAnchors[0]?.href).toBe('https://alerts.example.com/alert/alert-002');
    } finally {
      appendChildSpy.mockRestore();
      removeChildSpy.mockRestore();
      anchorClickSpy.mockRestore();
    }
  });

  test('ignores non-activation keys on alert row keyboard handler', () => {
    useAlertListDataMock.mockReturnValue({
      alertList: [
        {
          id: 'alert-001',
          event: 'Event 1',
          text: 'Text 1',
          lastReceiveTime: '2026-01-01T00:00:00.000Z',
          resource: 'web01',
          severity: 'critical',
        },
      ],
      alertTotal: 1,
      alertListError: undefined,
      alertListValidating: false,
      alertListResolved: true,
    });

    render(<Alerts />);

    const anchorClickSpy = jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);

    try {
      fireEvent.keyDown(screen.getByText('Event 1').closest('[tabindex="0"]')!, { key: 'Tab' });
      expect(anchorClickSpy).not.toHaveBeenCalled();
    } finally {
      anchorClickSpy.mockRestore();
    }
  });

  test('treats missing severity counts as zero', () => {
    useAlertSeverityCountsMock.mockReturnValue({});
    useAlertListDataMock.mockReturnValue({
      alertList: [
        {
          id: 'alert-001',
          event: 'Event 1',
          text: 'Text 1',
          lastReceiveTime: '2026-01-01T00:00:00.000Z',
          resource: 'web01',
          severity: 'critical',
        },
      ],
      alertTotal: 2,
      alertListError: undefined,
      alertListValidating: false,
      alertListResolved: true,
    });

    render(<Alerts />);

    expect(screen.getByText('Showing 1 of 0 alerts')).toBeInTheDocument();
    expect(screen.getByTestId('external-link')).toHaveTextContent('(0)');
  });
});
