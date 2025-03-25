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

import translation_en from '@/shared-modules/public/locales/en/common.json';
import translation_ja from '@/shared-modules/public/locales/ja/common.json';

class I18nProvider {
  init() {
    // Could also be an Ajax based implementation.
    this.translationTable = {
      en: translation_en,
      ja: translation_ja,
    };
    return Promise.resolve();
  }

  afterInit() {
    this.currentLanguage = Luigi.i18n().getCurrentLocale();
    Luigi.i18n().addCurrentLocaleChangeListener((locale) => {
      this.currentLanguage = locale;
    });
  }

  // This function will be used by Luigi Core for translation
  getTranslation(key, interpolations = undefined, locale = undefined) {
    if (!key) return '';
    this.currentLanguage = locale || this.currentLanguage || Luigi.i18n().getCurrentLocale();
    const result = this.findTranslation(
      key,
      this.translationTable[this.currentLanguage] || this.translationTable['en'],
      interpolations
    );
    return result ? result : key;
  }

  /**
   * @private
   * Finds the translated value based on given key.
   * @param {string} key key to be translated
   * @param {*} obj translation table
   */
  findTranslation(key, obj, interpolations) {
    if (!obj) return undefined;
    let splitted = key.split('.');
    for (let i = 0; i < splitted.length; i++) {
      let key = splitted[i];
      if (obj.hasOwnProperty(key) && typeof obj[key] === 'object') {
        obj = obj[key];
      } else {
        if (interpolations) return this.findInterpolations(obj[key], interpolations);
        return obj[key];
      }
    }
  }

  /**
   * @private
   * Replaces values that are defiend in translation strings
   * @param {string} key key to be translated
   * @param {*} interpolations translation table
   * @example
   * findInterpolations('Environment {num}', {num: 1})
   */
  findInterpolations(value, interpolations) {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    Object.keys(interpolations).forEach((item) => {
    });
    return value;
  }
}

export const i18nProvider = new I18nProvider();
