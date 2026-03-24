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
 * Dummy data for Layout Apply list
 * Contains various apply statuses: IN_PROGRESS, FAILED, COMPLETED, CANCELING, CANCELED, SUSPENDED
 */
export const dummyLayoutApplyList = {
  count: 12,
  totalCount: 20,
  applyResults: [
    {
      applyID: 'afoi8ds0-sfa1-rsky',
      status: 'IN_PROGRESS',
      procedures: [],
      applyResult: [],
      startedAt: '2024/03/02 11:11:11',
    },
    {
      applyID: 'bfoi8ds0-sfa1-rskg',
      status: 'IN_PROGRESS',
      procedures: [],
      applyResult: [],
      startedAt: '2024/03/02 18:31:14',
    },
    {
      applyID: 'bifo123s-sfja-213t',
      status: 'FAILED',
      procedures: [],
      applyResult: [],
      startedAt: '2024/03/03 12:03:01',
      endedAt: '2024/03/04 17:24:28',
    },
    {
      applyID: 'c131sijf-2122-dfa',
      status: 'COMPLETED',
      procedures: [],
      applyResult: [],
      startedAt: '2024/03/03 11:23:22',
      endedAt: '2024/03/23 13:24:28',
    },
    {
      applyID: 'diso123s-sfja-2131',
      status: 'CANCELING',
      procedures: [],
      applyResult: [],
      startedAt: '2024/03/03 13:00:01',
    },
    {
      applyID: 'eif1123s-sfja-213a',
      status: 'CANCELED',
      procedures: [],
      applyResult: [],
      rollbackProcedures: [],
      startedAt: '2024/03/03 12:00:01',
      endedAt: '2024/03/23 21:24:28',
      canceledAt: '2024/03/23 21:24:28',
      executeRollback: true,
      rollbackStatus: 'COMPLETED',
    },
    {
      applyID: 'eif1123s-sfja-2132',
      status: 'CANCELED',
      procedures: [],
      applyResult: [],
      rollbackProcedures: [],
      startedAt: '2024/03/03 12:01:01',
      endedAt: '2024/03/23 21:24:28',
      canceledAt: '2024/03/23 21:24:28',
      executeRollback: true,
    },
    {
      applyID: 'eif1123s-sfja-2137',
      status: 'SUSPENDED',
      procedures: [],
      applyResult: [],
      rollbackProcedures: [],
      startedAt: '2024/03/03 12:02:01',
    },
    {
      applyID: '21fhf23s-sfja-2137',
      status: 'SUSPENDED',
      procedures: [],
      applyResult: [],
      rollbackProcedures: [],
      startedAt: '2024/03/03 13:02:01',
    },
    {
      applyID: 'afoi8ds0-sfa1-stl3',
      status: 'CANCELED',
      procedures: [],
      applyResult: [],
      rollbackProcedures: [],
      startedAt: '2024/03/02 22:11:11',
      endedAt: undefined,
      executeRollback: true,
      rollbackStatus: 'IN_PROGRESS',
    },
    {
      applyID: 'bfoi8ds0-sfa1-stl6',
      status: 'CANCELED',
      procedures: [],
      applyResult: [],
      rollbackProcedures: [],
      startedAt: '2024/03/02 19:32:15',
      endedAt: undefined,
      executeRollback: true,
      rollbackStatus: 'SUSPENDED',
    },
    {
      applyID: 'cfoi8ds0-sfa1-stl8',
      status: 'CANCELED',
      procedures: [],
      applyResult: [],
      rollbackProcedures: [],
      startedAt: '2024/03/02 19:32:15',
      endedAt: undefined,
      executeRollback: true,
      rollbackStatus: 'FAILED',
    },
  ],
};
