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
} from '@/utils/dummy-data/PromQL/energyComparison';

export const handlers = [
  // GET /query_range?query=
  http.get(`${process.env.NEXT_PUBLIC_URL_BE_PERFORMANCE_MANAGER}/query_range`, () => {
    // return HttpResponse.json(dummyCompareMonth1);
    // return HttpResponse.json(dummyCompareYear1);
    // return HttpResponse.json(dummyAllMissing); // []
    // return HttpResponse.json(dummy56days);
    // return HttpResponse.json(dummy56daysMissing);
    // return HttpResponse.json(dummy56daysPrevious);
    // return HttpResponse.json(dummy56daysLast);
    // return HttpResponse.json(dummy56daysZero);
    return HttpResponse.json(dummy731days);
    // return HttpResponse.json(dummy731daysMissing);
    // return HttpResponse.json(dummy731daysPrevious);
    // return HttpResponse.json(dummy731daysLast);
    // return HttpResponse.json(dummy731daysZero);
    // return HttpResponse.json(dummyRandom);
  }),
];
