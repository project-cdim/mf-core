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

import { dummyAPIresources } from '@/utils/dummy-data/resource-list/dummyAPIresources';

/**
 * Generate dummy APInodes data from dummyAPIresources
 * Creates nodes by grouping resources based on their nodeIDs
 */
const generateDummyAPINodes = () => {
  const nodes: any[] = [];
  const nodeIds = new Set<string>();

  // Extract unique nodes from resources
  dummyAPIresources.resources?.forEach((resource) => {
    resource.nodeIDs?.forEach((nodeId) => {
      if (!nodeIds.has(nodeId)) {
        nodeIds.add(nodeId);
        // Create a node with this resource
        nodes.push({
          id: nodeId,
          resources: [resource],
        });
      } else {
        // Add resource to existing node
        const node = nodes.find((n) => n.id === nodeId);
        if (node) {
          node.resources.push(resource);
        }
      }
    });
  });

  // Add some sample nodes for demonstration
  if (nodes.length === 0) {
    nodes.push(
      {
        id: 'node001',
        resources: dummyAPIresources.resources?.slice(0, 3) || [],
      },
      {
        id: 'node002',
        resources: dummyAPIresources.resources?.slice(3, 6) || [],
      },
      {
        id: 'node003',
        resources: dummyAPIresources.resources?.slice(6, 9) || [],
      }
    );
  }

  return {
    count: nodes.length,
    nodes: nodes,
  };
};

export const dummyAPInodes = generateDummyAPINodes();
