import React from 'react';
import Chip from '@mui/material/Chip';

interface IResultProps {
  rowData: {
    id: string;
    startTimeFromAscendingNode?: string;
    endTimeFromAscendingNode?: string;
    thumbnail?: string;
    cloudCover?: number;
  };
  isSelected: boolean;
  isHighlighted: boolean;
  onClick: (id: string) => void;
  onHover: (id: string | null) => void;
  style: React.CSSProperties;
}

const formatDate = (date: string) =>
  new Date(date).toLocaleString('en-EN', {
    timeZone: 'UTC',
    year: 'numeric',
    month: 'long',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

export const Result: React.FC<IResultProps> = ({
  rowData,
  isSelected,
  isHighlighted,
  onClick,
  onHover,
  style
}) => {
  console.log('rowData : ', rowData);
  return (
    <div
      className={'result_row'}
      style={{
        ...style,
        backgroundColor: isSelected
          ? '#757575'
          : isHighlighted
            ? '#eeeeee'
            : 'white'
      }}
      onClick={() => onClick(rowData.id)}
      onMouseEnter={() => onHover(rowData.id)}
      onMouseLeave={() => onHover(null)}
      role="row"
      tabIndex={0}
    >
      <div className={'result_preview'}>
        <img src={rowData.thumbnail} alt={'data preview'} />
      </div>
      <div className={'result_infos'}>
        <div className={'result_tags'}>
          {rowData.cloudCover && (
            <Chip
              label={`${Number(rowData.cloudCover).toFixed(2)} %`}
              size={'small'}
            />
          )}
        </div>
        <span className={'result_id'}>{rowData.id}</span>
        {rowData.startTimeFromAscendingNode ? (
          <span className={'result_time'}>
            {`${formatDate(rowData.startTimeFromAscendingNode)} (UTC)`}
          </span>
        ) : null}
      </div>
      {/*<div style={{ flex: 3 }}>{rowData.endTimeFromAscendingNode || '-'}</div>*/}
      {/*<div style={{ flex: 1, textAlign: 'right' }}>*/}
      {/*  {rowData.cloudCover !== undefined*/}
      {/*    ? `${parseInt(rowData.cloudCover, 10)} %`*/}
      {/*    : '-'}*/}
      {/*</div>*/}
      {/*<div style={{ flex: 1, textAlign: 'center' }}>*/}
      {/*  <button*/}
      {/*    onClick={e => {*/}
      {/*      e.stopPropagation();*/}
      {/*      alert(`Zoom sur feature ${rowData.id}`);*/}
      {/*    }}*/}
      {/*  >*/}
      {/*    🔍*/}
      {/*  </button>*/}
      {/*</div>*/}
    </div>
  );
};
