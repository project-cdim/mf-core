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

import { Dispatch, ReactNode, SetStateAction, useMemo } from 'react';

import { Box } from '@mantine/core';
import { useViewportSize } from '@mantine/hooks';
import GridLayout, { Layout } from 'react-grid-layout';

import classes from '@/styles/dashboardGrid.module.css';

import '/node_modules/react-grid-layout/css/styles.css';
import '/node_modules/react-resizable/css/styles.css';

/** Props for the DashboardGridBackground component.  */
type DashboardGridBackgroundProps = {
  children: ReactNode;
  width: number;
  gridColumns: number;
  cellSize: number;
  displayGrid: boolean;
  minWidth?: number;
};

/** Props for the DashboardGrid component. */
type DashboardGridProps = {
  children: ReactNode;
  layout: Layout[];
  setLayout: Dispatch<SetStateAction<Layout[]>>;
  viewMode: boolean;
};

/**
 * Component for the dashboard grid, receives tile layout information and tile components via props
 *
 * @component
 * @param props - The props for the DashboardGrid component.
 * @returns JSX.Element,The rendered DashboardGrid component.
 */
export const DashboardGrid = (props: DashboardGridProps) => {
  const MARGIN_X = 5;
  const MARGIN_Y = 5;
  const GRIDSIZE = 85;

  const RESETPADDING: [number, number] = [0, 0];
  const viewPortSize = useViewportSize();
  /** Calculates the number of columns and the width of the dashboard based on the grid size and viewport size.  */
  const [cols, dashboardWidth] = useMemo(() => {
    const MINCOLS = 12;
    const cols = Math.max(MINCOLS, Math.floor((viewPortSize.width + MARGIN_X) / (GRIDSIZE + MARGIN_X)));
    return [cols, (GRIDSIZE + MARGIN_X) * cols - MARGIN_X];
  }, [viewPortSize.width]);

  return (
    <Box display={'inline-block'}>
      <DashboardGridBackground
        gridColumns={cols}
        displayGrid={!props.viewMode}
        cellSize={GRIDSIZE}
        width={dashboardWidth}
      >
        <GridLayout
          className='layout'
          layout={props.layout}
          cols={cols}
          rowHeight={GRIDSIZE}
          width={dashboardWidth}
          isResizable={false}
          isDraggable={!props.viewMode}
          margin={[MARGIN_X, MARGIN_Y]}
          containerPadding={RESETPADDING}
          draggableCancel='.draggableCancel'
          compactType='vertical' //'vertical' | 'horizontal' | null
          onLayoutChange={props.setLayout}
        >
          {props.children}
        </GridLayout>
      </DashboardGridBackground>
    </Box>
  );
};

/**
 * Renders a background for the dashboard grid.
 *
 * @param props - The component props.
 * @param props.children - The content to be rendered inside the background.
 * @param props.width - The width of the background.
 * @param props.gridColumns - The number of grid columns.
 * @param props.cellSize - The size of each grid cell.
 * @param props.displayGrid - Determines whether to display the grid or not.
 * @param props.minWidth - The minimum width of the background.
 * @returns The rendered background component.
 */
export const DashboardGridBackground = ({
  children,
  width,
  gridColumns,
  cellSize,
  displayGrid,
  minWidth = 1075,
}: DashboardGridBackgroundProps) => {
  const cellColor = displayGrid ? '#f0f0f0' : '#fff';
  const gutterColor = displayGrid ? '#fff' : '#fff';
  const GRID_MARGIN = 5;
  return (
    <Box
      w={width}
      className={classes.dashboardGrid}
      style={{
        '--grid-columns': gridColumns,
        '--grid-layout-cell-size': `${cellSize}px`,
        '--grid-layout-cell-and-gutter-size': `${cellSize + GRID_MARGIN}px`,
        '--min-width': `${minWidth}px`,
        '--grid-layout-cell-color': cellColor,
        '--grid-layout-gutter-color': gutterColor,
      }}
    >
      {children}
    </Box>
  );
};
