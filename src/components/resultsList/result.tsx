import React from 'react';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import CloudIcon from '@mui/icons-material/Cloud';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import { IFeature } from '../../types';

interface IResultProps {
  rowData: IFeature;
  isSelected: boolean;
  isHighlighted: boolean;
  onClick: (id: string) => void;
  onZoom: (id: string) => void;
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
  onZoom,
  onHover,
  style
}) => {
  const preview = rowData.thumbnail
    ? rowData.thumbnail
    : rowData.quicklook
      ? rowData.quicklook
      : null;

  return (
    <div className={'result_wrapper'} style={style} role="row" tabIndex={0}>
      <div className={'result_preview'}>
        {preview ? <img src={preview} alt={'data preview'} /> : null}
      </div>
      <div
        onMouseEnter={() => onHover(rowData.id)}
        onMouseLeave={() => onHover(null)}
        role="row"
        onClick={() => onClick(rowData.id)}
        className={'result_row'}
        style={{
          border:
            isSelected || isHighlighted
              ? '2px solid #007AFF'
              : '2px solid transparent'
        }}
      >
        <div className={'result_infos'}>
          {/* Move this condition under the result_tags div when other infos might come */}
          {rowData.cloudCover ? (
            <div className={'result_tags'}>
              <Chip
                className={'jp-EodagWidget-chip'}
                icon={<CloudIcon />}
                label={`${Number(rowData.cloudCover).toFixed(2)}%`}
                size={'small'}
              />
            </div>
          ) : null}
          <span className={'result_id'}>{rowData.id}</span>
          {rowData.startTimeFromAscendingNode ? (
            <span className={'result_time'}>
              {`${formatDate(rowData.startTimeFromAscendingNode)} (UTC)`}
            </span>
          ) : null}
          <IconButton
            size={'small'}
            className={'result_zoom_button'}
            onClick={e => {
              e.stopPropagation();
              return onZoom(rowData.id);
            }}
          >
            <ZoomInIcon fontSize={'inherit'} />
          </IconButton>
        </div>
      </div>
    </div>
  );
};
