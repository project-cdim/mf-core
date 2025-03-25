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

import { useNodeNumbers } from '@/shared-modules/utils/hooks';

import { NodeTileState } from '@/types/TileData';

import { NumberTileProps, useSetErrorInContext } from '@/components';

/**
 * Custom hook for a number tile.
 *
 * @param defaultValue - The default values for the number tile. {@link useNodeNumberTileProps}.
 * @returns An object containing the base props, unique props, state, and data for the number tile.
 */
export const useNodeNumberTile = (state: NodeTileState): Omit<NumberTileProps, 'title'> => {
  const t = useTranslations();
  const { nodesAll, nodesOk, nodesCritical, nodesWarning, nodesDisabled, nodesValidating, nodesError } =
    useNodeNumbers();

  /** Set error in context */
  useSetErrorInContext('nodeNumbersApi', nodesError);

  const returnProps: Omit<NumberTileProps, 'title'> = {
    number: undefined,
    linkTitle: t('Nodes'),
    link: '/cdim/res-node-list',
    loading: nodesValidating,
  };
  switch (state) {
    case 'critical':
      returnProps.status = 'Critical';
      returnProps.number = nodesCritical;
      returnProps.query = { critical: ['exist'] };
      break;
    case 'warning':
      returnProps.status = 'Warning';
      returnProps.number = nodesWarning;
      returnProps.query = { warning: ['exist'] };
      break;
    case 'all':
      returnProps.status = 'All';
      returnProps.number = nodesAll;
      returnProps.query = {};
      break;
    case 'ok':
      returnProps.status = 'OK';
      returnProps.number = nodesOk;
      returnProps.query = { critical: ['notExist'], warning: ['notExist'] };
      break;
    case 'disabled':
      returnProps.status = 'Disabled';
      returnProps.number = nodesDisabled;
      returnProps.query = { disabled: ['exist'] };
      break;
    default:
      break;
  }
  return returnProps;
};
