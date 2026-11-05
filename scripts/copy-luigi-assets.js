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

/*
 * Copy @luigi-project/core/luigi.css and SAP theming fonts into public/luigi/
 * so the stylesheet can be served via <link> and bypass Next.js's PostCSS
 * pipeline (which fails on luigi.css's @font-face url() references and, in
 * earlier 2.x versions, on embedded Vite build markers).
 *
 * Layout in public/ is chosen so the css's relative url() paths
 *   ../../../Base/baseLib/baseTheme/fonts/<file>
 * resolve correctly. The stylesheet is served from
 *   /ui/luigi/vendor/@luigi-project/core/luigi.css
 * so ../../../ from that dir is /ui/luigi/, and fonts sit at /ui/luigi/Base/...
 */
const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const dest = path.join(repoRoot, 'public', 'luigi');

const cssSrc = path.join(repoRoot, 'node_modules', '@luigi-project', 'core', 'luigi.css');
const cssDest = path.join(dest, 'vendor', '@luigi-project', 'core', 'luigi.css');

// luigi.css references fonts via two relative roots:
//   ../../../Base/baseLib/baseTheme/fonts/<file>   (legacy)
//   baseTheme/fonts/<file>                          (current, sibling of luigi.css)
// We stage both, since some @font-face declarations use each variant.
const coreBaseThemeSrc = path.join(repoRoot, 'node_modules', '@luigi-project', 'core', 'baseTheme');
const coreBaseThemeDest = path.join(dest, 'vendor', '@luigi-project', 'core', 'baseTheme');

const fontsSrc = path.join(repoRoot, 'node_modules', '@sap-theming', 'theming-base-content', 'content', 'Base');
const fontsDest = path.join(dest, 'Base');

function copyCssWithoutSourceMap(src, dst) {
  fs.mkdirSync(path.dirname(dst), { recursive: true });
  const css = fs.readFileSync(src, 'utf8');
  // luigi.css concatenates several stylesheets, each ending with a `/*# sourceMappingURL=... */`
  // comment, but the referenced .map files are not shipped in the package. Leaving them causes
  // the browser to request non-existent maps (e.g. /luigi/.../fd_fiori.css.map -> 404).
  const stripped = css.replace(/\/\*#\s*sourceMappingURL=.*?\*\//g, '');
  fs.writeFileSync(dst, stripped);
}

function copyDir(src, dst) {
  fs.mkdirSync(dst, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dst, entry.name);
    if (entry.isDirectory()) copyDir(s, d);
    else if (entry.isFile()) fs.copyFileSync(s, d);
  }
}

if (!fs.existsSync(cssSrc)) {
  console.error(`[copy-luigi-assets] missing: ${cssSrc}`);
  process.exit(1);
}
if (!fs.existsSync(fontsSrc)) {
  console.error(`[copy-luigi-assets] missing: ${fontsSrc}`);
  process.exit(1);
}

fs.rmSync(dest, { recursive: true, force: true });
copyCssWithoutSourceMap(cssSrc, cssDest);
if (fs.existsSync(coreBaseThemeSrc)) {
  copyDir(coreBaseThemeSrc, coreBaseThemeDest);
}
copyDir(fontsSrc, fontsDest);
console.log(`[copy-luigi-assets] copied luigi.css and Base/ fonts into ${dest}`);
