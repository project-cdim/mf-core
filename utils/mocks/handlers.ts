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

/* eslint-disable @typescript-eslint/no-unused-vars */
import { HttpResponse, http } from 'msw';

import { dummyCompareMonth1, dummyCompareYear1 } from '@/utils/dummy-data/PromQL/compareEnergyConsumption';
import {
  dummy56days,
  dummy56daysMissing,
  dummy56daysPrevious,
  dummy56daysLast,
  dummy56daysZero,
  dummy731days,
  dummy731daysMissing,
  dummy731daysPrevious,
  dummy731daysLast,
  dummy731daysZero,
  dummyAllMissing,
  dummyRandom,
  dummyDemo,
} from '@/utils/dummy-data/PromQL/energyComparison';
import { dummyQueryRange, dummyQueryRangeDonut } from '@/shared-modules/utils/dummy-data/PromQL/query_range';
import { dummyQuery } from '@/shared-modules/utils/dummy-data/PromQL/query';
import { dummyAPIresources } from '@/utils/dummy-data/resource-list/dummyAPIresources';
import { dummyAPInodes } from '@/utils/dummy-data/node-list/dummyAPInodes';
import { dummyLayoutApplyList } from '@/utils/dummy-data/layout-apply/dummyLayoutApplyList';

const performanceManagerUrl = process.env.NEXT_PUBLIC_URL_BE_PERFORMANCE_MANAGER;
const configurationManagerUrl = process.env.NEXT_PUBLIC_URL_BE_CONFIGURATION_MANAGER;
const alertaWebUrl = process.env.NEXT_PUBLIC_URL_BE_ALERTA_WEB;
const layoutApplyUrl = process.env.NEXT_PUBLIC_URL_BE_LAYOUT_APPLY;

// ===== Performance Manager Handlers =====
// Endpoints for dashboard energy charts:
// - POST /query_range (for energy area chart, donut chart, and bar chart)
// - POST /query (for single value queries)
const performanceManagerHandlers = [
  // Handler for query_range endpoint (time series data)
  http.post(`${performanceManagerUrl}/query_range`, async ({ request }) => {
    const body = await request.text();
    const params = new URLSearchParams(body);
    const step = params.get('step');
    const query = params.get('query');

    // Handle daily step (1d) - For energy comparison bar chart (day/week/month/year comparison)
    if (step === '1d') {
      // Can switch between different demo data patterns by uncommenting desired option:
      // return HttpResponse.json(dummyCompareMonth1);  // Month comparison pattern
      // return HttpResponse.json(dummyCompareYear1);   // Year comparison pattern
      // return HttpResponse.json(dummyAllMissing);     // All missing data pattern
      // return HttpResponse.json(dummy56days);         // 56 days pattern
      // return HttpResponse.json(dummy56daysMissing);  // 56 days with missing data
      // return HttpResponse.json(dummy56daysPrevious); // 56 days previous period
      // return HttpResponse.json(dummy56daysLast);     // 56 days last period
      // return HttpResponse.json(dummy56daysZero);     // 56 days with zero values
      // return HttpResponse.json(dummy731days);        // 731 days (2 years) pattern
      // return HttpResponse.json(dummy731daysMissing); // 731 days with missing data
      // return HttpResponse.json(dummy731daysPrevious);// 731 days previous period
      // return HttpResponse.json(dummy731daysLast);    // 731 days last period
      // return HttpResponse.json(dummy731daysZero);    // 731 days with zero values
      // return HttpResponse.json(dummyRandom);         // Random data pattern
      return HttpResponse.json(dummyDemo); // Default demo data
    }

    // Handle hourly step (1h) - For energy area chart and donut chart
    if (step === '1h') {
      if (query?.includes('.*_metricEnergyJoules_reading')) {
        // For energy area chart (total energy consumption over time)
        return HttpResponse.json(dummyQueryRange);
      }
      // For energy donut chart (energy distribution by device type)
      return HttpResponse.json(dummyQueryRangeDonut);
    }

    // Default fallback for other step values
    return HttpResponse.json(dummyQueryRange);
  }),

  // Handler for query endpoint (single value queries)
  http.post(`${performanceManagerUrl}/query`, async ({ request }) => {
    return HttpResponse.json(dummyQuery);
  }),
];

// ===== Configuration Manager Handlers =====
// Endpoints for dashboard resource tiles:
// - GET /resources?detail=true (for resource number tiles and progress tiles)
// - GET /nodes (for node number tiles)
const configurationManagerHandlers = [
  // Handler for resources endpoint
  http.get(`${configurationManagerUrl}/resources`, ({ request }) => {
    const url = new URL(request.url);
    const detail = url.searchParams.get('detail');

    if (detail === 'true') {
      return HttpResponse.json(dummyAPIresources);
    }

    // Return basic resource list if detail is not requested
    return HttpResponse.json(dummyAPIresources);
  }),

  // Handler for nodes endpoint
  http.get(`${configurationManagerUrl}/nodes`, ({ request }) => {
    return HttpResponse.json(dummyAPInodes);
  }),
];

// ===== Alerta Web Handlers =====
// Endpoints for dashboard alert tiles:
// - GET /alerts/count?status=open (for alert number tiles)
// let alertCountToggle = false;

let alertaReqCount = 0;
const alertaWebHandlers = [
  http.get(`${alertaWebUrl}/alerts/count`, ({ request }) => {
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    alertaReqCount++;
    if (status === 'open') {
      if (alertaReqCount % 2 === 0) {
        return HttpResponse.json(
          {
            code: 'ERROR',
            message: 'Error',
            details: 'Error',
          },
          { status: 500 }
        );
      } else {
        return HttpResponse.json({
          autoRefresh: true,
          severityCounts: {
            critical: 5,
            major: 0,
            minor: 0,
            warning: 3,
            indeterminate: 0,
            informational: 0,
          },
          status: 'ok',
          statusCounts: {
            open: 8,
          },
          total: 8,
        });
      }
    }

    // Return all alerts if status is not specified
    return HttpResponse.json({
      autoRefresh: true,
      severityCounts: {
        critical: 5,
        major: 0,
        minor: 0,
        warning: 0,
        indeterminate: 0,
        informational: 0,
      },
      status: 'ok',
      statusCounts: {
        open: 5,
      },
      total: 5,
    });
  }),
  http.get(`${alertaWebUrl}/alerts`, ({ request }) => {
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    if (status === 'open') {
      return HttpResponse.json({
        alerts: [
          {
            id: 'alert-001',
            event: 'Internal Server Error',
            text: 'Critical alert message',
            lastReceiveTime: '2026-02-03T11:56:31.910Z',
            resource: 'web01',
            severity: 'critical',
          },
          {
            id: 'alert-002',
            event: 'Configuration Manager: Database Connection Error',
            text: 'Failed to connect to the database. Please contact the administrator.',
            lastReceiveTime: '2026-01-27T21:00:13.070Z',
            resource: 'web01',
            severity: 'warning',
          },
          {
            id: 'alert-003',
            event: 'Disk Usage High',
            text: 'Disk usage exceeded 90% threshold.',
            lastReceiveTime: '2026-01-25T10:30:00.000Z',
            resource: 'storage01',
            severity: 'warning',
          },
        ],
        total: 3,
      });
    }
    return HttpResponse.json({ alerts: [], total: 0 });
  }),
  http.post(`${alertaWebUrl}/auth/openid`, ({ request }) => {
    // Simulate a successful authentication response with a dummy access token
    return HttpResponse.json({
      access_token: 'dummy_access_token',
    });
  }),
];

// ===== Layout Apply Handlers =====
// Endpoints for layout apply tiles:
// - GET /layout-apply?limit=1000 (for layout apply number tiles)
const layoutApplyHandlers = [
  http.get(`${layoutApplyUrl}/layout-apply`, ({ request }) => {
    return HttpResponse.json(dummyLayoutApplyList);
  }),
];

// Default export for backward compatibility
export const handlers = [
  ...performanceManagerHandlers,
  ...configurationManagerHandlers,
  ...alertaWebHandlers,
  ...layoutApplyHandlers,
];

/**
 * Create handlers based on configuration
 * @returns Array of enabled MSW request handlers
 */
export const createHandlers = () => {
  // Import config dynamically to avoid issues during module initialization
  const { getMSWMockConfig } = require('./config');
  const config = getMSWMockConfig();
  const handlers = [];

  if (config.performanceManager) handlers.push(...performanceManagerHandlers);
  if (config.configurationManager) handlers.push(...configurationManagerHandlers);
  if (config.alertaWeb) handlers.push(...alertaWebHandlers);
  if (config.layoutApply) handlers.push(...layoutApplyHandlers);

  return handlers;
};
