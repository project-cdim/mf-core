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

import { useLayoutApplyNumbers } from '@/shared-modules/utils/hooks';

import { LayoutApplyTileState } from '@/types/TileData';

import { NumberTileProps, useSetErrorInContext } from '@/components';

/**
 * Custom hook for a number tile.
 *
 * @param defaultValue - The default values for the number tile. {@link useNodeNumberTileProps}.
 * @returns An object containing the base props, unique props, state, and data for the number tile.
 */
export const useLayoutApplyNumberTile = (state: LayoutApplyTileState): Omit<NumberTileProps, 'title'> => {
  const t = useTranslations();
  const { layoutApplyFailed, layoutApplySuspended, layoutApplyValidating, layoutApplyError } = useLayoutApplyNumbers();

  /** Set error in context */
  useSetErrorInContext('layoutApplyApi', layoutApplyError);

  const returnProps: Omit<NumberTileProps, 'title'> = {
    number: undefined,
    linkTitle: t('LayoutApplies.list'),
    link: '/cdim/lay-layout-apply-list',
    loading: layoutApplyValidating,
  };
  switch (state) {
    case 'failed':
      returnProps.status = 'Failed';
      returnProps.number = layoutApplyFailed;
      returnProps.query = { status: ['FAILED'] };
      break;
    case 'suspended':
      returnProps.status = 'Suspended';
      returnProps.number = layoutApplySuspended;
      returnProps.query = { status: ['SUSPENDED'] };
      break;
    default:
      break;
  }
  return returnProps;
};
