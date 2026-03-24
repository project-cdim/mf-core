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

import { render } from '@/shared-modules/__test__/test-utils';
import { screen } from '@testing-library/react';
import AlertaSilentGetCode from '@/components/AlertaSilentGetCode';
import { setAlertaAuthCode, startAlertaAuth } from '@/utils/hooks/useAlertNumberData';

// Mock the useAlertNumberData hooks
jest.mock('@/utils/hooks/useAlertNumberData', () => ({
  setAlertaAuthCode: jest.fn(),
  startAlertaAuth: jest.fn(),
}));

const mockSetAlertaAuthCode = setAlertaAuthCode as jest.Mock;
const mockStartAlertaAuth = startAlertaAuth as jest.Mock;

// Mock sessionStorage
const mockSessionStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, 'sessionStorage', {
  value: mockSessionStorage,
});

// Mock window.addEventListener and removeEventListener
const mockAddEventListener = jest.fn();
const mockRemoveEventListener = jest.fn();
Object.defineProperty(window, 'addEventListener', { value: mockAddEventListener });
Object.defineProperty(window, 'removeEventListener', { value: mockRemoveEventListener });

describe('AlertaSilentGetCode', () => {
  const mockOnCode = jest.fn();
  const mockOnError = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockSessionStorage.getItem.mockReturnValue('test-state');
  });

  test('should render iframe', () => {
    render(<AlertaSilentGetCode onCode={mockOnCode} onError={mockOnError} />);

    const iframe = screen.getByTitle('Alerta Silent Auth');
    expect(iframe).toBeDefined();
  });

  test('should call startAlertaAuth on mount', () => {
    render(<AlertaSilentGetCode onCode={mockOnCode} onError={mockOnError} />);

    expect(mockStartAlertaAuth).toHaveBeenCalledTimes(1);
  });

  test('should store state in sessionStorage', () => {
    render(<AlertaSilentGetCode onCode={mockOnCode} onError={mockOnError} />);

    expect(mockSessionStorage.setItem).toHaveBeenCalledWith('al_state', expect.any(String));
  });

  test('should add message event listener', () => {
    render(<AlertaSilentGetCode onCode={mockOnCode} onError={mockOnError} />);

    expect(mockAddEventListener).toHaveBeenCalledWith('message', expect.any(Function));
  });

  test('should handle successful authentication', () => {
    render(<AlertaSilentGetCode onCode={mockOnCode} onError={mockOnError} />);

    // Get the message handler
    const calls = mockAddEventListener.mock.calls;
    const messageCall = calls.find((call) => call[0] === 'message');
    const messageHandler = messageCall[1];

    // Get iframe and create a mock contentWindow
    const iframe = screen.getByTitle('Alerta Silent Auth') as HTMLIFrameElement;
    const mockContentWindow = {};
    Object.defineProperty(iframe, 'contentWindow', {
      value: mockContentWindow,
      configurable: true,
    });

    // Extract the redirect URI from the iframe src to get the expected origin
    const iframeSrc = iframe.src;
    const redirectUriMatch = iframeSrc.match(/redirect_uri=([^&]+)/);
    const redirectUri = redirectUriMatch ? decodeURIComponent(redirectUriMatch[1]) : '';
    const expectedOrigin = redirectUri ? new URL(redirectUri).origin : 'http://localhost:3000';

    const mockEvent = {
      data: {
        __al_silent__: true,
        code: 'auth-code-12345',
        state: 'test-state',
      },
      origin: expectedOrigin,
      source: mockContentWindow,
    } as MessageEvent;

    messageHandler(mockEvent);

    expect(mockSetAlertaAuthCode).toHaveBeenCalledWith('auth-code-12345');
    expect(mockOnCode).toHaveBeenCalledWith('auth-code-12345');
    expect(mockOnError).not.toHaveBeenCalled();
  });

  test('should handle authentication error', () => {
    render(<AlertaSilentGetCode onCode={mockOnCode} onError={mockOnError} />);

    const calls = mockAddEventListener.mock.calls;
    const messageCall = calls.find((call) => call[0] === 'message');
    const messageHandler = messageCall[1];

    const iframe = screen.getByTitle('Alerta Silent Auth') as HTMLIFrameElement;
    const mockContentWindow = {};
    Object.defineProperty(iframe, 'contentWindow', {
      value: mockContentWindow,
      configurable: true,
    });

    // Extract the expected origin from iframe src
    const iframeSrc = iframe.src;
    const redirectUriMatch = iframeSrc.match(/redirect_uri=([^&]+)/);
    const redirectUri = redirectUriMatch ? decodeURIComponent(redirectUriMatch[1]) : '';
    const expectedOrigin = redirectUri ? new URL(redirectUri).origin : 'http://localhost:3000';

    const mockEvent = {
      data: {
        __al_silent__: true,
        error: 'login_required',
        state: 'test-state',
      },
      origin: expectedOrigin,
      source: mockContentWindow,
    } as MessageEvent;

    messageHandler(mockEvent);

    expect(mockOnError).toHaveBeenCalledWith('login_required');
    expect(mockOnCode).not.toHaveBeenCalled();
    expect(mockSetAlertaAuthCode).not.toHaveBeenCalled();
  });

  test('should ignore invalid messages', () => {
    render(<AlertaSilentGetCode onCode={mockOnCode} onError={mockOnError} />);

    const calls = mockAddEventListener.mock.calls;
    const messageCall = calls.find((call) => call[0] === 'message');
    const messageHandler = messageCall[1];

    const mockEvent = {
      data: {
        code: 'auth-code-12345',
        state: 'test-state',
      },
      origin: 'http://localhost:3000',
      source: {},
    } as MessageEvent;

    messageHandler(mockEvent);

    expect(mockOnCode).not.toHaveBeenCalled();
    expect(mockOnError).not.toHaveBeenCalled();
    expect(mockSetAlertaAuthCode).not.toHaveBeenCalled();
  });

  test('should cleanup on unmount', () => {
    const { unmount } = render(<AlertaSilentGetCode onCode={mockOnCode} onError={mockOnError} />);

    const calls = mockAddEventListener.mock.calls;
    const messageCall = calls.find((call) => call[0] === 'message');
    const messageHandler = messageCall[1];

    unmount();

    expect(mockRemoveEventListener).toHaveBeenCalledWith('message', messageHandler);
  });

  test('should handle missing code error', () => {
    render(<AlertaSilentGetCode onCode={mockOnCode} onError={mockOnError} />);

    const calls = mockAddEventListener.mock.calls;
    const messageCall = calls.find((call) => call[0] === 'message');
    const messageHandler = messageCall[1];

    const iframe = screen.getByTitle('Alerta Silent Auth') as HTMLIFrameElement;
    const mockContentWindow = {};
    Object.defineProperty(iframe, 'contentWindow', {
      value: mockContentWindow,
      configurable: true,
    });

    const iframeSrc = iframe.src;
    const redirectUriMatch = iframeSrc.match(/redirect_uri=([^&]+)/);
    const redirectUri = redirectUriMatch ? decodeURIComponent(redirectUriMatch[1]) : '';
    const expectedOrigin = redirectUri ? new URL(redirectUri).origin : 'http://localhost:3000';

    const mockEvent = {
      data: {
        __al_silent__: true,
        state: 'test-state',
      },
      origin: expectedOrigin,
      source: mockContentWindow,
    } as MessageEvent;

    messageHandler(mockEvent);

    expect(mockOnError).toHaveBeenCalledWith('No authorization code received');
    expect(mockOnCode).not.toHaveBeenCalled();
    expect(mockSetAlertaAuthCode).not.toHaveBeenCalled();
  });

  test('should handle state mismatch error', () => {
    mockSessionStorage.getItem.mockReturnValue('different-state');

    render(<AlertaSilentGetCode onCode={mockOnCode} onError={mockOnError} />);

    const calls = mockAddEventListener.mock.calls;
    const messageCall = calls.find((call) => call[0] === 'message');
    const messageHandler = messageCall[1];

    const iframe = screen.getByTitle('Alerta Silent Auth') as HTMLIFrameElement;
    const mockContentWindow = {};
    Object.defineProperty(iframe, 'contentWindow', {
      value: mockContentWindow,
      configurable: true,
    });

    const iframeSrc = iframe.src;
    const redirectUriMatch = iframeSrc.match(/redirect_uri=([^&]+)/);
    const redirectUri = redirectUriMatch ? decodeURIComponent(redirectUriMatch[1]) : '';
    const expectedOrigin = redirectUri ? new URL(redirectUri).origin : 'http://localhost:3000';

    const mockEvent = {
      data: {
        __al_silent__: true,
        code: 'auth-code-12345',
        state: 'test-state',
      },
      origin: expectedOrigin,
      source: mockContentWindow,
    } as MessageEvent;

    messageHandler(mockEvent);

    expect(mockOnError).toHaveBeenCalledWith('State parameter mismatch');
    expect(mockOnCode).not.toHaveBeenCalled();
    expect(mockSetAlertaAuthCode).not.toHaveBeenCalled();
  });

  test('should work without onError prop', () => {
    render(<AlertaSilentGetCode onCode={mockOnCode} />);

    const calls = mockAddEventListener.mock.calls;
    const messageCall = calls.find((call) => call[0] === 'message');
    const messageHandler = messageCall[1];

    const iframe = screen.getByTitle('Alerta Silent Auth') as HTMLIFrameElement;
    const mockContentWindow = {};
    Object.defineProperty(iframe, 'contentWindow', {
      value: mockContentWindow,
      configurable: true,
    });

    const iframeSrc = iframe.src;
    const redirectUriMatch = iframeSrc.match(/redirect_uri=([^&]+)/);
    const redirectUri = redirectUriMatch ? decodeURIComponent(redirectUriMatch[1]) : '';
    const expectedOrigin = redirectUri ? new URL(redirectUri).origin : 'http://localhost:3000';

    const mockEvent = {
      data: {
        __al_silent__: true,
        error: 'login_required',
        state: 'test-state',
      },
      origin: expectedOrigin,
      source: mockContentWindow,
    } as MessageEvent;

    expect(() => messageHandler(mockEvent)).not.toThrow();
    expect(mockOnCode).not.toHaveBeenCalled();
  });

  test('should ignore messages from wrong source', () => {
    render(<AlertaSilentGetCode onCode={mockOnCode} onError={mockOnError} />);

    const calls = mockAddEventListener.mock.calls;
    const messageCall = calls.find((call) => call[0] === 'message');
    const messageHandler = messageCall[1];

    const iframe = screen.getByTitle('Alerta Silent Auth') as HTMLIFrameElement;
    const mockContentWindow = {};
    Object.defineProperty(iframe, 'contentWindow', {
      value: mockContentWindow,
      configurable: true,
    });

    const iframeSrc = iframe.src;
    const redirectUriMatch = iframeSrc.match(/redirect_uri=([^&]+)/);
    const redirectUri = redirectUriMatch ? decodeURIComponent(redirectUriMatch[1]) : '';
    const expectedOrigin = redirectUri ? new URL(redirectUri).origin : 'http://localhost:3000';

    const mockEvent = {
      data: {
        __al_silent__: true,
        code: 'auth-code-12345',
        state: 'test-state',
      },
      origin: expectedOrigin,
      source: {}, // Different source
    } as MessageEvent;

    messageHandler(mockEvent);

    expect(mockOnCode).not.toHaveBeenCalled();
    expect(mockOnError).not.toHaveBeenCalled();
    expect(mockSetAlertaAuthCode).not.toHaveBeenCalled();
  });

  test('should ignore messages from wrong origin', () => {
    render(<AlertaSilentGetCode onCode={mockOnCode} onError={mockOnError} />);

    const calls = mockAddEventListener.mock.calls;
    const messageCall = calls.find((call) => call[0] === 'message');
    const messageHandler = messageCall[1];

    const iframe = screen.getByTitle('Alerta Silent Auth') as HTMLIFrameElement;
    const mockContentWindow = {};
    Object.defineProperty(iframe, 'contentWindow', {
      value: mockContentWindow,
      configurable: true,
    });

    const mockEvent = {
      data: {
        __al_silent__: true,
        code: 'auth-code-12345',
        state: 'test-state',
      },
      origin: 'http://malicious-site.com',
      source: mockContentWindow,
    } as MessageEvent;

    messageHandler(mockEvent);

    expect(mockOnCode).not.toHaveBeenCalled();
    expect(mockOnError).not.toHaveBeenCalled();
    expect(mockSetAlertaAuthCode).not.toHaveBeenCalled();
  });

  test('should handle server-side rendering scenario', () => {
    // Mock window as undefined to test the ternary operator on line 23
    const originalWindow = global.window;

    // Mock Object.defineProperty to temporarily make window undefined
    Object.defineProperty(global, 'window', {
      value: undefined,
      configurable: true,
    });

    // Import fresh module to trigger the SSR code path
    jest.resetModules();
    delete require.cache[require.resolve('@/components/AlertaSilentGetCode')];

    // This should execute the typeof window !== 'undefined' check and return empty string
    const AlertaSilentGetCodeModule = require('@/components/AlertaSilentGetCode');

    // Restore window
    Object.defineProperty(global, 'window', {
      value: originalWindow,
      configurable: true,
    });

    // Verify the module was loaded without errors
    expect(AlertaSilentGetCodeModule.default).toBeDefined();
  });
});
