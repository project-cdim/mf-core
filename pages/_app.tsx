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

import React from 'react';

import { AppProps } from 'next/app';
import { useRouter } from 'next/router';

import '@luigi-project/core/luigi.css';
import { MantineProvider } from '@mantine/core';
import '@mantine/core/styles.css';
import { NextIntlClientProvider } from 'next-intl';

import { ErrorBoundary, Layout } from '@/shared-modules/components';

import '@/styles/globals.css';

import Index from '.';

// Global error handler for Luigi localStorage errors (must be set before Luigi loads)
if (typeof window !== 'undefined') {
  const isStorageRelatedError = (error: any): boolean => {
    if (!error) return false;

    /* istanbul ignore next */
    const errorName = error.name || '';
    /* istanbul ignore next */
    const errorMsg = String(error.message || error).toLowerCase();

    const storageErrorNames = ['QuotaExceededError', 'DataCloneError'];
    if (storageErrorNames.includes(errorName)) return true;

    const keywords = ['quota', 'storage', 'setitem', 'removeitem', 'getitem', 'luigi', 'postmessage', 'cloned'];
    return keywords.some((keyword) => errorMsg.includes(keyword));
  };

  window.addEventListener(
    'unhandledrejection',
    (event: PromiseRejectionEvent) => {
      if (isStorageRelatedError(event.reason)) {
        event.preventDefault();
        // event.stopPropagation();
        // event.stopImmediatePropagation();
      }
    },
    { capture: true }
  );

  window.addEventListener(
    'error',
    (event: ErrorEvent) => {
      if (isStorageRelatedError(event.error)) {
        event.preventDefault();
        // event.stopPropagation();
        // event.stopImmediatePropagation();
      }
    },
    { capture: true }
  );

  const originalConsoleError = console.error;
  console.error = (...args: any[]) => {
    const errorMsg = args.map((arg) => String(arg)).join(' ');

    if (
      errorMsg.includes('QuotaExceededError') ||
      errorMsg.includes('DataCloneError') ||
      (errorMsg.includes('postMessage') && errorMsg.includes('cloned'))
    ) {
      return;
    }

    originalConsoleError.apply(console, args);
  };
}

/**
 * Renders the main application component.
 *
 * @param props {@link Props}
 * @returns JSX.Element, The rendered component.
 */
function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  return (
    <NextIntlClientProvider locale={router.locale} timeZone={timeZone} messages={pageProps.messages || {}}>
      <MantineProvider>
        <ErrorBoundary>
          {Component === Index ? (
            <Component {...pageProps} />
          ) : (
            <Layout>
              <Component {...pageProps} />
            </Layout>
          )}
        </ErrorBoundary>
      </MantineProvider>
    </NextIntlClientProvider>
  );
}

export default MyApp;
