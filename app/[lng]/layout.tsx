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

import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';

import { ErrorBoundary, Layout } from '@/shared-modules/components';

import { routing } from '@/i18n/routing';

/**
 * Pre-generates the localized route segments at build time.
 *
 * @returns The list of supported locale params.
 */
export function generateStaticParams() {
  return routing.locales.map((lng) => ({ lng }));
}

/**
 * Locale-scoped layout. Provides i18n messages and the shared application chrome.
 *
 * @param props.children - The page content to render.
 * @param props.params - The dynamic route params containing the locale.
 * @returns The localized layout.
 */
export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lng: string }>;
}) {
  const { lng } = await params;

  if (!routing.locales.includes(lng as (typeof routing.locales)[number])) {
    notFound();
  }

  setRequestLocale(lng);

  const messages = await getMessages();

  return (
    <NextIntlClientProvider locale={lng} messages={messages}>
      <ErrorBoundary>
        <Layout>{children}</Layout>
      </ErrorBoundary>
    </NextIntlClientProvider>
  );
}
