/**
 * Copyright 2022 CS GROUP - France, http://www.c-s.fr
 * All rights reserved
 */

import * as React from 'react';
import classNames from 'classnames';
import {
  AutoSizer,
  SortDirection,
  Column,
  Table,
  InfiniteLoader,
  TableCellProps,
  TableHeaderProps,
  ColumnProps
} from 'react-virtualized';
import { get } from 'lodash';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearchPlus } from '@fortawesome/free-solid-svg-icons';

const TableSortLabelWithoutMUI = ({
  active,
  direction,
  children
}: {
  active: any;
  direction: any;
  children: any;
}) => <div>TableSortLabel</div>;

interface IMuiColumnProps extends ColumnProps {
  cellContentRenderer?: any;
  buttons?: any;
  selector?: any;
  percent?: boolean;
  handleClick?: (id: number | string) => void;
}

export interface IMuiVirtualizedTableProps {
  classes: any;
  columns: IMuiColumnProps[];
  headerHeight: any;
  onRowClick: any;
  onRowMouseOver: any;
  onRowMouseOut: any;
  rowClassName: any;
  rowHeight: any;
  sort: any;
  rowGetter: any;
  highlightFeature: any;
  rowCount: any;
  isRowLoaded: any;
  isRetrievingMoreFeature: any;
  handleRetrieveMoreFeature: any;
  displayedRowCount: any;
  selectedFeature: any;
}

class MuiVirtualizedTable extends React.PureComponent<IMuiVirtualizedTableProps> {
  static defaultProps: Partial<IMuiVirtualizedTableProps> = {
    headerHeight: 56,
    rowHeight: 56
  };
  getRowClassName = ({ index }: { index: number }) => {
    if (index < 0) {
      return ' headerRow flexContainer';
    }
    return 'tableRow flexContainer';
  };

  getRowStyle = ({ index }: { index: number }) => {
    if (index >= 0) {
      const { rowGetter, highlightFeature, selectedFeature } = this.props;
      const rowData = rowGetter({ index });
      if (
        get(selectedFeature, 'id') !== get(highlightFeature, 'id') &&
        get(highlightFeature, 'id') === get(rowData, 'id')
      ) {
        return {
          backgroundColor: '#eeeeee'
        };
      }
      if (get(selectedFeature, 'id') === get(rowData, 'id')) {
        return {
          backgroundColor: '#757575'
        };
      }
    }
    return {};
  };

  cellRenderer = ({ cellData, columnIndex = null }: TableCellProps) => {
    const { columns } = this.props;
    let isPercent = false;
    if (
      columnIndex !== null &&
      columnIndex !== undefined &&
      columns[columnIndex].percent
    ) {
      isPercent = columns[columnIndex].percent === true;
    }
    if (cellData !== undefined && cellData !== null) {
      return <div>{isPercent ? `${parseInt(cellData, 10)} %` : cellData}</div>;
    } else {
      return <div></div>;
    }
  };

  buttonRenderer = ({ columnIndex = null, rowData }: TableCellProps) => {
    const { columns } = this.props;
    // Retrieve event handler from column def
    let handleClick = (dataId: number | string) => {
      // do nothing.
    };
    if (
      columnIndex !== null &&
      columnIndex !== undefined &&
      columns[columnIndex].handleClick
    ) {
      handleClick = columns[columnIndex].handleClick;
    }
    return (
      <button
        onClick={() => {
          handleClick(rowData.id);
        }}
      >
        <FontAwesomeIcon icon={faSearchPlus} />
      </button>
    );
  };

  selectorRenderer = ({ columnIndex = null }) => {
    // Not used right now
    return <div>Cellule selector</div>;
  };

  headerRenderer = ({
    label,
    disableSort,
    dataKey,
    sortBy,
    sortDirection
  }: TableHeaderProps) => {
    const { sort } = this.props;
    const direction = {
      [SortDirection.ASC]: 'asc',
      [SortDirection.DESC]: 'desc'
    };

    const inner =
      !disableSort && sort !== null && sort !== undefined ? (
        <TableSortLabelWithoutMUI
          active={dataKey === sortBy}
          direction={direction[sortDirection]}
        >
          {label}
        </TableSortLabelWithoutMUI>
      ) : (
        label
      );

    return <div> {inner} </div>;
  };

  render() {
    const {
      columns,
      rowCount,
      displayedRowCount,
      isRowLoaded,
      isRetrievingMoreFeature,
      handleRetrieveMoreFeature,
      ...tableProps
    } = this.props;
    const loadMoreRows = () => {
      return isRetrievingMoreFeature() ? false : handleRetrieveMoreFeature();
    };
    return (
      <AutoSizer>
        {({ height, width }) => (
          <InfiniteLoader
            isRowLoaded={isRowLoaded}
            loadMoreRows={loadMoreRows}
            rowCount={rowCount}
          >
            {({ onRowsRendered, registerChild }) => (
              <Table
                ref={registerChild}
                onRowsRendered={onRowsRendered}
                key="table"
                className="table"
                height={height}
                width={width}
                {...tableProps}
                rowClassName={this.getRowClassName}
                rowStyle={this.getRowStyle}
                rowCount={displayedRowCount}
              >
                {columns.map(
                  (
                    {
                      cellContentRenderer = null,
                      className,
                      dataKey,
                      buttons,
                      selector,
                      ...other
                    }: IMuiColumnProps,
                    index: number
                  ) => {
                    let renderer;
                    if (
                      cellContentRenderer !== null &&
                      cellContentRenderer !== undefined
                    ) {
                      renderer = (cellRendererProps: TableCellProps) =>
                        this.cellRenderer({
                          cellData: cellContentRenderer(cellRendererProps),
                          columnIndex: index
                        } as TableCellProps);
                    } else if (buttons) {
                      renderer = this.buttonRenderer;
                    } else if (selector) {
                      renderer = this.selectorRenderer;
                    } else {
                      renderer = this.cellRenderer;
                    }

                    return (
                      <Column
                        key={dataKey}
                        headerRenderer={headerProps =>
                          this.headerRenderer({
                            ...headerProps,
                            disableSort: columns[index].disableSort
                          })
                        }
                        className={classNames(className)}
                        cellRenderer={renderer}
                        dataKey={dataKey}
                        {...other}
                      />
                    );
                  }
                )}
              </Table>
            )}
          </InfiniteLoader>
        )}
      </AutoSizer>
    );
  }
}

export interface IBrowseComponentProps {
  features: any;
  handleClickFeature: any;
  handleZoomFeature: any;
  handleHoverFeature: any;
  highlightFeature: any;
  isRetrievingMoreFeature: () => boolean;
  handleRetrieveMoreFeature: () => Promise<void>;
  selectedFeature: any;
}

function BrowseComponent({
  features,
  handleClickFeature,
  handleZoomFeature,
  handleHoverFeature,
  highlightFeature,
  isRetrievingMoreFeature,
  handleRetrieveMoreFeature,
  selectedFeature
}: IBrowseComponentProps) {
  /**
   * Return an object with its id and all its properties
   */
  const getRowData =
    (features: { features: string | any[] }) =>
    ({ index }: { index: number }) => {
      if (index >= features.features.length) {
        return {};
      }
      return {
        ...features.features[index].properties,
        id: features.features[index].id
      };
    };
  const handleRowClick = ({ rowData }: { rowData: any }) => {
    handleClickFeature(rowData.id);
  };
  const handleRowMouseOver = ({ rowData }: { rowData: any }) => {
    handleHoverFeature(rowData.id);
  };
  const handleRowMouseOut = () => {
    handleHoverFeature(null);
  };
  const isRowLoaded = ({ index }: { index: number }) => {
    return index < features.features.length;
  };
  return (
    <MuiVirtualizedTable
      rowCount={features.properties.totalResults}
      displayedRowCount={features.features.length}
      rowGetter={getRowData(features)}
      onRowClick={handleRowClick}
      onRowMouseOver={handleRowMouseOver}
      onRowMouseOut={handleRowMouseOut}
      isRowLoaded={isRowLoaded}
      highlightFeature={highlightFeature}
      isRetrievingMoreFeature={isRetrievingMoreFeature}
      handleRetrieveMoreFeature={handleRetrieveMoreFeature}
      selectedFeature={selectedFeature}
      columns={[
        // {
        //   width: 100,
        //   flexGrow: 2.0,
        //   label: '',
        //   dataKey: '',
        //   selector: true,
        // },
        {
          width: 100,
          flexGrow: 3.0,
          label: 'Start time',
          dataKey: 'startTimeFromAscendingNode'
        },
        {
          width: 100,
          flexGrow: 3.0,
          label: 'End time',
          dataKey: 'startTimeFromAscendingNode'
        },
        {
          width: 100,
          flexGrow: 1.0,
          label: 'Cloud cover',
          dataKey: 'cloudCover',
          percent: true
        },
        {
          width: 100,
          flexGrow: 1.0,
          label: 'Actions',
          dataKey: '',
          buttons: true,
          handleClick: handleZoomFeature
        }
      ]}
    />
  );
}

export default BrowseComponent;
