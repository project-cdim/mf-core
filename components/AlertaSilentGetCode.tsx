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

import { useEffect, useRef, useState } from 'react';
import { isAlertaAuthenticated, setAlertaAuthCode, startAlertaAuth } from '@/utils/alert';
import { getNumberFromEnv } from '@/shared-modules/utils';

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
  // Set once a code has been delivered; gates the re-auth watchdog so it
  // doesn't fire during the initial flow before auth was ever established.
  const deliveredOnce = useRef(false);
  // Bumped by the watchdog to re-run the silent auth flow below.
  const [reauthNonce, setReauthNonce] = useState(0);

  // How often to check whether previously established auth has been lost
  // (token expired, auth code spent) and the silent auth flow needs to run again.
  const reauthCheckIntervalSec = getNumberFromEnv(process.env.NEXT_PUBLIC_ALERTA_REAUTH_CHECK_INTERVAL_SECONDS);
  const DEFAULTINTERVAL = 30;
  const ONESECOND = 1000;
  const reauthCheckIntervalMs =
    reauthCheckIntervalSec != undefined && reauthCheckIntervalSec !== 0
      ? reauthCheckIntervalSec * ONESECOND
      : DEFAULTINTERVAL * ONESECOND;

  useEffect(() => {
    const timer = setInterval(() => {
      if (deliveredOnce.current && !isAlertaAuthenticated()) {
        setReauthNonce((n) => n + 1);
      }
    }, reauthCheckIntervalMs);
    return () => clearInterval(timer);
  }, [reauthCheckIntervalMs]);

  useEffect(() => {
    if (isAlertaAuthenticated()) {
      // Another frame (typically the shell's badge poller, which mounts
      // once at startup) already holds a valid shared token/auth code.
      // Skip our own silent OIDC round trip entirely — otherwise every
      // mount of this component (e.g. each time the alerts dialog is
      // opened, which remounts this component in its own iframe) would
      // call startAlertaAuth() below and wipe the shared token, forcing a
      // needless re-exchange against /auth/openid. Mark delivered so the
      // watchdog above can still react if auth is later lost while this
      // instance stays mounted.
      deliveredOnce.current = true;
      return;
    }

    startAlertaAuth();

    const stateBytes = new Uint8Array(16);
    crypto.getRandomValues(stateBytes);
    const state = Array.from(stateBytes, (b) => b.toString(16).padStart(2, '0')).join('');

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

      if (returnedState !== state) {
        onError?.('State parameter mismatch');
        return;
      }

      setAlertaAuthCode(code);
      deliveredOnce.current = true;
      onCode(code);
    };

    window.addEventListener('message', handleMessage);

    if (iframeRef.current) {
      iframeRef.current.src = authUrl.toString();
    }

    return () => window.removeEventListener('message', handleMessage);
  }, [onCode, onError, reauthNonce]);

  return <iframe ref={iframeRef} style={{ display: 'none' }} title='Alerta Silent Auth' />;
};

export default AlertaSilentGetCode;
