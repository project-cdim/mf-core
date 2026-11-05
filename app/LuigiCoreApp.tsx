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

"use client";

import { useEffect } from "react";

/**
 * Guards `history.pushState` / `history.replaceState` against non-object state arguments.
 *
 * Luigi's auth-oidc plugin calls `history.pushState('', ...)` with an empty-string state.
 * Next.js' App Router patches these methods and assigns an internal `__NA` property to the
 * state object, which throws `TypeError: Cannot create property '__NA' on string ''` when the
 * state is a primitive.
 *
 * Ordering matters: Next.js patches these methods in its own effect, which runs *after* this
 * component's effect (React runs child effects before parent effects). A plain wrapper installed
 * here would therefore be the *inner* method, and Next.js' patch (the outer one) would still
 * receive the raw primitive state and throw before our normalization runs.
 *
 * To stay ordering-independent we install an accessor on `window.history.pushState` /
 * `replaceState`:
 *  - the getter always returns our normalizing wrapper, so every caller (Luigi, Next.js) sees it;
 *  - the setter captures whatever Next.js later assigns, so its patch still runs.
 * A re-entrancy guard routes the nested call Next.js makes back to the native method, preventing
 * an infinite loop while ensuring Next.js' patch executes exactly once with a normalized state.
 */
function installHistoryStateGuard() {
  const w = window as typeof window & { __luigiHistoryStateGuard?: boolean };
  if (w.__luigiHistoryStateGuard) return;
  w.__luigiHistoryStateGuard = true;

  const normalizeState = (state: unknown) => {
    return typeof state === "object" && state !== null ? state : {};
  };

  const guard = (method: "pushState" | "replaceState") => {
    const native = History.prototype[method];
    // Current effective implementation (native unless something patched it before us).
    let inner: History[typeof method] = window.history[method];
    let depth = 0;

    const outer = function (this: History, state: unknown, unused: string, url?: string | URL | null) {
      const normalized = normalizeState(state);
      // Re-entrant call: Next.js' patch is calling back the method it captured (our `outer`).
      // Route straight to the native implementation to avoid recursing through `inner` again.
      if (depth > 0) {
        return native.call(window.history, normalized, unused, url);
      }
      depth++;
      try {
        return inner.call(window.history, normalized, unused, url);
      } finally {
        depth--;
      }
    } as History[typeof method];

    Object.defineProperty(window.history, method, {
      configurable: true,
      enumerable: true,
      get: () => outer,
      set: (fn: History[typeof method]) => {
        inner = fn;
      },
    });
  };

  guard("pushState");
  guard("replaceState");
}

/**
 * Renders the Luigi App component.
 *
 * @returns null
 */
export default function LuigiCoreApp() {
  useEffect(() => {
    installHistoryStateGuard();
    require("@luigi-project/core/luigi.js");
    require("@/public/luigi-config");
  }, []);

  return null;
}
