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

import { APIPromQLRange } from '@/shared-modules/types';

export const generateValues = (days: number, baseDate: Date = new Date()): [number, string][] => {
  const values: [number, string][] = [];
  const start = new Date(baseDate);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  start.setDate(start.getDate() - (days - 1)); // Set to days ago
  for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
    const passed = Math.floor((date.getTime() - start.getTime()) / 86400000);
    const timestamp = Math.floor(date.getTime() / 1000);
    const value = (passed % 7) * 1000 + 10000;
    if (passed < days / 2) values.push([timestamp, value.toString()]);
    else values.push([timestamp, (value * 0.8).toString()]);
  }
  return values;
};

// Return APIPromQLRange by passing values array as an argument
export const getAPIPromQLbyValues = (values: [number, string][]): APIPromQLRange => ({
  status: 'success',
  data: {
    resultType: 'matrix',
    result: [
      {
        metric: {
          data_label: 'all_energy',
        },
        values: values,
      },
    ],
  },
  stats: {
    seriesFetched: '1',
  },
});

/** No data */
export const dummyAllMissing: APIPromQLRange = {
  status: 'success',
  data: {
    resultType: 'matrix',
    result: [],
  },
  stats: {
    seriesFetched: '1',
  },
};

const values56days = generateValues(56);

/** 60 days of data */
export const dummy56days: APIPromQLRange = getAPIPromQLbyValues(values56days);

/** Remove data other than 21-25 and 36-40 */
export const dummy56daysMissing: APIPromQLRange = getAPIPromQLbyValues(
  values56days.slice(20, 25).concat(values56days.slice(35, 40))
);
/** Split data into previous */
export const dummy56daysPrevious: APIPromQLRange = getAPIPromQLbyValues(values56days.slice(0, 28));
/** Split data into last */
export const dummy56daysLast: APIPromQLRange = getAPIPromQLbyValues(values56days.slice(28));

/** Change values other than 21-25 and 36-40 to 0 */
export const dummy56daysZero: APIPromQLRange = getAPIPromQLbyValues(
  values56days.map((value, index) => {
    if ((index >= 20 && index < 25) || (index >= 35 && index < 40)) {
      return value;
    }
    return [value[0], '0'];
  })
);

const values731days = generateValues(
  365 * 2 + 1,
  new Date(new Date().getFullYear(), new Date().getMonth(), 1, 0, 0, 0)
);

/** 731 days of data */
export const dummy731days: APIPromQLRange = getAPIPromQLbyValues(values731days);

/** Remove some data */
export const dummy731daysMissing: APIPromQLRange = getAPIPromQLbyValues(
  values731days.slice(60, 120).concat(values731days.slice(610, 670))
);
/** Split data into previous */
export const dummy731daysPrevious: APIPromQLRange = getAPIPromQLbyValues(values731days.slice(0, 365));
/** Split data into last */
export const dummy731daysLast: APIPromQLRange = getAPIPromQLbyValues(values731days.slice(365));

/** Change some values to 0 */
export const dummy731daysZero: APIPromQLRange = getAPIPromQLbyValues(
  values731days.map((value, index) => {
    if ((index >= 60 && index < 120) || (index >= 610 && index < 670)) {
      return value;
    }
    return [value[0], '0'];
  })
);

// Generate random values
const generateRandomValues = (days: number): [number, string][] => {
  const values: [number, string][] = [];
  const startDate = new Date();
  startDate.setHours(0, 0, 0, 0);
  const end = new Date(startDate);
  startDate.setDate(startDate.getDate() - (days - 1)); // Set to days ago
  for (let date = new Date(startDate); date <= end; date.setDate(date.getDate() + 1)) {
    // Do not push the value with a probability of 1/10
    if (Math.random() < 0.1) {
      continue;
    }
    // Set the value to 0 with a probability of 1/10
    if (Math.random() < 0.1) {
      values.push([Math.floor(date.getTime() / 1000), '0']);
      continue;
    }
    const timestamp = Math.floor(date.getTime() / 1000);
    const value = Math.floor(Math.random() * 100000);
    values.push([timestamp, value.toString()]);
  }
  return values;
};

export const dummyRandom: APIPromQLRange = getAPIPromQLbyValues(generateRandomValues(1000));

// Generate demo values
export const generateDemoValues = (days: number): [number, string][] => {
  const values: [number, string][] = [];
  const startDate = new Date();
  startDate.setHours(0, 0, 0, 0);
  const end = new Date(startDate);
  startDate.setDate(startDate.getDate() - (days - 1)); // Set to days ago
  for (let date = new Date(startDate); date <= end; date.setDate(date.getDate() + 1)) {
    const passed = Math.floor((date.getTime() - startDate.getTime()) / 86400000);
    const timestamp = Math.floor(date.getTime() / 1000);
    const value = 10000 - passed * 5 + Math.floor(Math.random() * 1000);
    values.push([timestamp, value.toString()]);
  }
  return values;
};
export const dummyDemo: APIPromQLRange = getAPIPromQLbyValues(generateDemoValues(1000));
