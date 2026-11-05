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

import type { Metadata } from 'next';

// luigi.css is served as a static asset via <link> below
// (copied by scripts/copy-luigi-assets.js) to bypass Next.js's PostCSS pipeline.
import { ColorSchemeScript, MantineProvider, mantineHtmlProps } from '@mantine/core';
import '@mantine/core/styles.css';

import '@/styles/globals.css';

import LuigiErrorSuppressor from './LuigiErrorSuppressor';

export const metadata: Metadata = {
  icons: {
    icon: '/ui/favicon.ico',
  },
};

/**
 * Root layout shared by every route.
 *
 * @param props.children - The page content to render.
 * @returns The root HTML document shell.
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript defaultColorScheme='auto' />
        {/* eslint-disable-next-line @next/next/no-css-tags */}
        <link rel='stylesheet' href='/ui/luigi/vendor/@luigi-project/core/luigi.css' />
      </head>
      <body>
        <LuigiErrorSuppressor />
        <MantineProvider>{children}</MantineProvider>
      </body>
    </html>
  );
}
