import * as React from 'react';
import classNames from 'classnames';
import { AutoSizer, SortDirection, Column, Table, InfiniteLoader } from 'react-virtualized';
import { get } from 'lodash'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearchPlus } from '@fortawesome/free-solid-svg-icons'

const TableSortLabelWithoutMUI = ( {active, direction, children }) => (
  <div>TableSortLabel</div>
)

export interface IMuiVirtualizedTableProps {
  classes: any;
  columns: any;
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
}

export interface IMuiVirtualizedTableState {
}

class MuiVirtualizedTable extends React.PureComponent<IMuiVirtualizedTableProps, IMuiVirtualizedTableState> {
  static defaultProps: Partial<IMuiVirtualizedTableProps> = {
    headerHeight: 56,
    rowHeight: 56,
  };
  getRowClassName = ({ index }) => {
    if (index < 0) {
      return " headerRow flexContainer";
    }
    return "tableRow flexContainer";
  };

  getRowStyle = ({ index, ...rowData}) => {
    if (index >= 0) {
      const { rowGetter, highlightFeature } = this.props
      const rowData = rowGetter({index})
      if (get(highlightFeature, 'id') === get(rowData, 'id')) {
        return {
          backgroundColor: '#eeeeee'
        }
      }
    }
    return {}
  };

  cellRenderer = ({ cellData, columnIndex = null }) => {
    const { columns } = this.props;
    let isPercent = false;
    if (columnIndex != null && columns[columnIndex].percent) {
      isPercent = columns[columnIndex].percent === true;
    }
    return (
      <div>{isPercent ? `${parseInt(cellData, 10)} %`: cellData}</div>
    );
  };

  buttonRenderer = ({ columnIndex = null, rowData }) => {
    const { columns } = this.props;
    // Retrieve event handler from column def
    let handleClick = (dataId) => {}
    if (columnIndex != null && columns[columnIndex].handleClick) {
      handleClick = columns[columnIndex].handleClick
    }
    return (
      <button onClick={() => {handleClick(rowData.id)}}>
        <FontAwesomeIcon icon={faSearchPlus} />
      </button> 
    );
  };

  selectorRenderer = ({ columnIndex = null }) => {
    // Not used right now
    return (
      <div>Cellule  selector</div>
    );
  };

  headerRenderer = ({ label, columnIndex, dataKey, sortBy, sortDirection }) => {
    const {  columns, sort } = this.props;
    const direction = {
      [SortDirection.ASC]: 'asc',
      [SortDirection.DESC]: 'desc',
    };

    const inner =
      !columns[columnIndex].disableSort && sort != null ? (
        <TableSortLabelWithoutMUI active={dataKey === sortBy} direction={direction[sortDirection]}>
          {label}
        </TableSortLabelWithoutMUI>
      ) : (
        label
      );

    return (
      <div> {inner} </div>
    );
  };

  render() {
    const { classes, columns, rowCount, displayedRowCount, isRowLoaded, isRetrievingMoreFeature, handleRetrieveMoreFeature, ...tableProps } = this.props;
    const loadMoreRows = () =>  {
      return isRetrievingMoreFeature()
      ? false
      : handleRetrieveMoreFeature()
    }
    return (
      <AutoSizer>
        {({ height, width }) => (
          <InfiniteLoader
            isRowLoaded={isRowLoaded}
            // @ts-ignore
            loadMoreRows={loadMoreRows}
            rowCount={rowCount}
          >
            {({ onRowsRendered, registerChild }) => (
              // @ts-ignore
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
                {columns.map(({ cellContentRenderer = null, className, dataKey, buttons, selector, ...other }, index) => {
                  let renderer;
                  if (cellContentRenderer != null) {
                    renderer = cellRendererProps =>
                      this.cellRenderer({
                        cellData: cellContentRenderer(cellRendererProps),
                        columnIndex: index,
                      });
                  } else if (buttons) {
                    renderer = this.buttonRenderer;
                  } else if (selector) {
                    renderer = this.selectorRenderer;
                  } else {
                    renderer = this.cellRenderer;
                  }

                  return (
                    // @ts-ignore
                    <Column
                      key={dataKey}
                      headerRenderer={headerProps =>
                        // @ts-ignore
                        this.headerRenderer({
                          ...headerProps,
                          columnIndex: index,
                        })
                      }
                      className={classNames(className)}
                      cellRenderer={renderer}
                      dataKey={dataKey}
                      {...other}
                    />
                  );
                })}
              </Table>
            )}
          </InfiniteLoader>
        )}
      </AutoSizer>
    );
  }
}

function BrowseComponent({ features, handleClickFeature, handleZoomFeature, handleHoverFeature, highlightFeature, isRetrievingMoreFeature, handleRetrieveMoreFeature }) {
  /**
   * Return an object with its id and all its properties
   */
  const getRowData = (features) => ({index}) => {
    if (index >= features.features.length) {
      return {}
    }
    return {
      ...features.features[index].properties,
      id: features.features[index].id
    }
  }
  const handleRowClick = ({rowData}) => {
    handleClickFeature(rowData.id)
  }
  const handleRowMouseOver = ({rowData}) => {
    handleHoverFeature(rowData.id)
  }
  const handleRowMouseOut = () => {
    handleHoverFeature(null)
  }
  const isRowLoaded = ({ index }) => {
    return index < features.features.length;
  }
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
          dataKey: 'startTimeFromAscendingNode',
        },
        {
          width: 100,
          flexGrow: 3.0,
          label: 'End time',
          dataKey: 'startTimeFromAscendingNode',
        },
        {
          width: 100,
          flexGrow: 1.0,
          label: 'Cloud cover',
          dataKey: 'cloudCover',
          percent: true,
        },
        {
          width: 100,
          flexGrow: 1.0,
          label: 'Actions',
          dataKey: '',
          buttons: true,
          handleClick: handleZoomFeature
        },
      ]}
    />
  );
}

export default BrowseComponent;
