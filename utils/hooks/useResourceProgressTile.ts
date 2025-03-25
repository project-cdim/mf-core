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

import { useTranslations } from 'next-intl';

import { ResourceListQuery } from '@/shared-modules/types';
import { useResourceNumbers } from '@/shared-modules/utils/hooks';

import { ProgressTileState } from '@/types/TileData';

import { useSetErrorInContext } from '@/components';
import { ProgressTileProps } from '@/components/ProgressTile';

/**
 * Custom hook for a number tile.
 *
 * @param defaultValue - The default values for the number tile. {@link useNodeNumberTileProps}.
 * @returns An object containing the base props, unique props, state, and data for the number tile.
 */
export const useResourceProgressTile = (state: ProgressTileState): Omit<ProgressTileProps, 'title'> => {
  const t = useTranslations();

  const { resourcesAll, resourcesAllocated, resourcesValidating, resourcesError } = useResourceNumbers();

  /** Set error in context */
  useSetErrorInContext('resourceNumbersApi', resourcesError);

  const returnProps: Omit<ProgressTileProps, 'title'> = {
    value: undefined,
    allValue: undefined,
    linkTitle: t('Resources.list'),
    link: '/cdim/res-resource-list',
    loading: resourcesValidating,
  };
  switch (state) {
    case 'allocated':
      returnProps.value = resourcesAllocated;
      returnProps.allValue = resourcesAll;
      returnProps.query = { allocatednode: ['Allocated'] } as ResourceListQuery;
      break;
    default:
      break;
  }
  return returnProps;
};
