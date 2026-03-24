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

import { useTranslations } from 'next-intl';

import { useResourceNumbers } from '@/shared-modules/utils/hooks';

import { ResourceTileState } from '@/types/TileData';

import { NumberTileProps, useSetErrorInContext } from '@/components';

/**
 * Custom hook for a number tile.
 *
 * @param defaultValue - The default values for the number tile. {@link useNodeNumberTileProps}.
 * @returns An object containing the base props, unique props, state, and data for the number tile.
 */
export const useResourceNumberTile = (state: ResourceTileState): Omit<NumberTileProps, 'title'> => {
  const t = useTranslations();
  const {
    resourcesAll,
    resourcesOk,
    resourcesCritical,
    resourcesWarning,
    resourcesDisabled,
    resourcesUnallocated,
    resourcesDesignAvailable,
    resourcesDesignUnavailable,
    resourcesMaintenance,
    resourcesValidating,
    resourcesError,
  } = useResourceNumbers();

  /** Set error in context */
  useSetErrorInContext('resourceNumbersApi', resourcesError);

  const returnProps: Omit<NumberTileProps, 'title'> = {
    number: undefined,
    linkTitle: t('Resources.list'),
    link: '/cdim/res-resource-list',
    loading: resourcesValidating,
  };
  switch (state) {
    case 'critical':
      returnProps.status = 'Critical';
      returnProps.number = resourcesCritical;
      returnProps.query = { health: ['Critical'] };
      break;
    case 'warning':
      returnProps.status = 'Warning';
      returnProps.number = resourcesWarning;
      returnProps.query = { health: ['Warning'] };
      break;
    case 'all':
      returnProps.status = 'All';
      returnProps.number = resourcesAll;
      returnProps.query = {};
      break;
    case 'ok':
      returnProps.status = 'OK';
      returnProps.number = resourcesOk;
      returnProps.query = { health: ['OK'] };
      break;
    case 'disabled':
      returnProps.status = 'Disabled';
      returnProps.number = resourcesDisabled;
      returnProps.query = { state: ['Disabled'] };
      break;
    case 'unallocated':
      returnProps.status = 'Unallocated';
      returnProps.number = resourcesUnallocated;
      returnProps.query = { allocatednode: ['Unallocated'] };
      break;
    case 'designAvailable':
      returnProps.status = 'DesignAvailable';
      returnProps.number = resourcesDesignAvailable;
      returnProps.query = {
        resourceAvailable: ['Available'],
        health: ['OK'],
        state: ['Enabled'],
        detection: ['Detected'],
      };
      break;
    case 'designUnavailable':
      returnProps.status = 'DesignUnavailable';
      returnProps.number = resourcesDesignUnavailable;
      returnProps.link = undefined;
      break;
    case 'maintenance':
      returnProps.status = 'Maintenance';
      returnProps.number = resourcesMaintenance;
      returnProps.query = { resourceAvailable: ['Unavailable'] };
      break;
    default:
      break;
  }
  return returnProps;
};
