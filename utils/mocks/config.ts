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

/**
 * Configuration for MSW mock handlers
 */
export type MSWMockConfig = {
  performanceManager: boolean;
  configurationManager: boolean;
  alertaWeb: boolean;
  layoutApply: boolean;
};

/**
 * Get MSW mock configuration from environment variables
 * @returns Configuration object indicating which handler groups are enabled
 */
export const getMSWMockConfig = (): MSWMockConfig => {
  return {
    performanceManager: process.env.NEXT_PUBLIC_MSW_MOCK_PERFORMANCE_MANAGER === 'true',
    configurationManager: process.env.NEXT_PUBLIC_MSW_MOCK_CONFIGURATION_MANAGER === 'true',
    alertaWeb: process.env.NEXT_PUBLIC_MSW_MOCK_ALERTA_WEB === 'true',
    layoutApply: process.env.NEXT_PUBLIC_MSW_MOCK_LAYOUT_APPLY === 'true',
  };
};

/**
 * Check if MSW is enabled
 * @returns True if MSW should be initialized
 */
export const isMSWEnabled = (): boolean => {
  return process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_USE_MSW === 'true';
};
