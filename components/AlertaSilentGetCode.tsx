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

import { useEffect, useRef } from 'react';
import { setAlertaAuthCode, startAlertaAuth } from '@/utils/hooks/useAlertNumberData';

const AUTH_ENDPOINT = `${process.env.NEXT_PUBLIC_URL_IDP}/realms/${process.env.NEXT_PUBLIC_IDP_REALMS}/protocol/openid-connect/auth`;
const CLIENT_ID = `${process.env.NEXT_PUBLIC_AUTH_CLIENT_ID}`;
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_URL_CORE}/auth/alerta/silent-callback.html`;
const APP_ORIGIN = typeof window !== 'undefined' ? new URL(REDIRECT_URI).origin : '';

const AlertaSilentGetCode = ({
  onCode,
  onError,
}: {
  onCode: (code: string) => void;
  onError?: (e: string) => void;
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    startAlertaAuth();

    const state = Date.now().toString(36) + Math.random().toString(36).substr(2);
    sessionStorage.setItem('al_state', state);

    const authUrl = new URL(AUTH_ENDPOINT);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('client_id', CLIENT_ID);
    authUrl.searchParams.set('redirect_uri', REDIRECT_URI);
    authUrl.searchParams.set('scope', 'openid');
    authUrl.searchParams.set('state', state);
    authUrl.searchParams.set('prompt', 'none');

    const validateMessage = (event: MessageEvent): boolean => {
      if (!event.data?.__al_silent__) return false;
      if (event.origin !== APP_ORIGIN) return false;
      if (event.source !== iframeRef.current?.contentWindow) return false;
      return true;
    };

    const handleMessage = (event: MessageEvent) => {
      if (!validateMessage(event)) return;

      window.removeEventListener('message', handleMessage);
      const { code, state: returnedState, error } = event.data;

      if (error) {
        onError?.(error);
        return;
      }

      if (!code) {
        onError?.('No authorization code received');
        return;
      }

      if (returnedState !== sessionStorage.getItem('al_state')) {
        onError?.('State parameter mismatch');
        return;
      }

      setAlertaAuthCode(code);
      onCode(code);
    };

    window.addEventListener('message', handleMessage);

    if (iframeRef.current) {
      iframeRef.current.src = authUrl.toString();
    }

    return () => window.removeEventListener('message', handleMessage);
  }, [onCode, onError]);

  return <iframe ref={iframeRef} style={{ display: 'none' }} title='Alerta Silent Auth' />;
};

export default AlertaSilentGetCode;
