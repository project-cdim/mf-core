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

import { APIresource, APIresources } from '@/shared-modules/types';
import { findAllByDisplayValue } from '@testing-library/react';

// Dummy data source
const resourcesOrg: APIresource = {
  annotation: {
    available: true,
  },
  device: {
    deviceID: 'resTEST101',
    status: {
      health: 'OK',
      state: 'Enabled',
    },
    type: 'CPU',
    devicePortList: [{ switchID: 'CXLxxx' }],
    links: [
      {
        type: 'CPU',
        deviceID: 'xxx',
      },
    ],
    // totalCores: 8,
    // capacityMiB: 32 * 1024, // 32 GiB
    // driveCapacityBytes: 4 * 1024 * 1024 * 1024 * 1024, // 4 TiB
    powerState: 'On',
    powerCapability: true,
    constraints: {
      nonRemovableDevices: [
        {
          deviceID: 'string',
        },
      ],
    },
  },
  resourceGroupIDs: [],
  detected: true,
  nodeIDs: ['node01'],
  physicalLocation: {
    rack: {
      id: '00000000-0000-0000-0000-000000000111',
      name: 'rack001',
      // chassis: { id: '00000000-0000-0000-0000-000000000222', name: 'chassis001' },
      chassis: { id: 'ch1', name: 'Jupiter XXXXXXXX' },
    },
  },
  deviceUnit: {
    id: '00000000-0000-0000-0000-000000000333',
    annotation: {
      systemItems: {
        available: true,
      },
      // userItems: {
      //   [index: string]: string | number | boolean | undefined,
      // },
    },
  },
};

// dummy data
export const dummyAPIresources: APIresources = {
  count: 100,
  resources: [
    {
      ...resourcesOrg,
      device: {
        ...resourcesOrg.device,
        deviceID: 'resTEST101',
        type: 'CPU',
        totalCores: 8,
      },
    },
    {
      ...resourcesOrg,
      device: {
        ...resourcesOrg.device,
        deviceID: 'resTEST102',
        type: 'memory',
        capacityMiB: 32 * 1024, // 32GiB
      },
    },
    {
      ...resourcesOrg,
      device: {
        ...resourcesOrg.device,
        deviceID: 'resTEST103',
        type: 'storage',
        driveCapacityBytes: 4 * 1024 * 1024 * 1024 * 1024, // 4 TiB
      },
    },
    {
      ...resourcesOrg,
      device: {
        ...resourcesOrg.device,
        deviceID: 'resTEST104',
        type: 'networkInterface',
        links: [],
      },
      nodeIDs: [],
    },
    {
      ...resourcesOrg,
      device: {
        ...resourcesOrg.device,
        deviceID: 'resTEST105',
        type: 'CPU',
        totalCores: 16,
        links: [],
      },
      nodeIDs: [],
    },
    {
      ...resourcesOrg,
      device: {
        ...resourcesOrg.device,
        deviceID: 'resTEST106',
        type: 'memory',
        capacityMiB: 64 * 1024,
        links: [],
      },
      nodeIDs: [],
      physicalLocation: {
        rack: {
          id: '11100000-0000-0000-0000-000000000111',
          name: 'rack002',
          chassis: { id: '11100000-0000-0000-0000-000000000222', name: 'chassis002' },
        },
      },
      deviceUnit: {
        id: '11100000-0000-0000-0000-000000000333',
        annotation: {
          systemItems: {
            available: true,
          },
          // userItems: {
          //   [index: string]: string | number | boolean | undefined,
          // },
        },
      },
    },
    {
      ...resourcesOrg,
      device: {
        ...resourcesOrg.device,
        deviceID: 'resTEST107',
        type: 'storage',
        driveCapacityBytes: 8 * 1024 * 1024 * 1024 * 1024,
        links: [],
      },
      nodeIDs: [],
      physicalLocation: {
        rack: {
          id: '22200000-0000-0000-0000-000000000111',
          name: '',
          chassis: { id: '22200000-0000-0000-0000-000000000222', name: '' },
        },
      },
      deviceUnit: {
        id: '22200000-0000-0000-0000-000000000333',
        annotation: {
          systemItems: {
            available: false,
          },
          // userItems: {
          //   [index: string]: string | number | boolean | undefined,
          // },
        },
      },
    },
  ],
};
