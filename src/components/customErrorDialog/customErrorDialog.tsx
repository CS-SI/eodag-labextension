import { Dialog, ReactWidget, showDialog } from '@jupyterlab/apputils';
import React, { useEffect, useState } from 'react';
import { IconButton, Tooltip } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { ICustomError } from '../../types';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

interface ICustomDialogContent {
  error: ICustomError;
}

const CustomDialogContent: React.FC<ICustomDialogContent> = ({ error }) => {
  const [isCopied, setIsCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    setIsCopied(false);
  }, [error]);

  const onIconButtonClick = async () => {
    const textToCopy = [
      error.title ?? 'Unknown error',
      error.details ?? ''
    ].join('\n\n');

    try {
      await navigator.clipboard.writeText(textToCopy);
      setIsCopied(true);
    } catch (err) {
      setIsCopied(false);
      console.warn('Copy to clipboard failed:', err);
    }
  };

  return (
    <div className={'jp-EodagWidget-customErrorMessage'}>
      <div className={'jp-EodagWidget-customErrorMessage-header'}>
        <h3>{error.title}</h3>
        <Tooltip
          title={isCopied ? 'Copied ! ' : 'Copy error in clipboard'}
          placement="bottom"
        >
          <IconButton
            color={'primary'}
            size={'small'}
            onClick={onIconButtonClick}
          >
            <ContentCopyIcon fontSize={'small'} />
          </IconButton>
        </Tooltip>
      </div>
      {error.details && (
        <pre
          className={`jp-EodagWidget-customErrorMessage-content ${
            isExpanded ? 'isExpanded' : ''
          }`}
        >
          {!isExpanded && (
            <div
              className={
                'jp-EodagWidget-customErrorMessage-showDetails-container'
              }
              role={'button'}
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <ExpandMoreIcon fontSize={'small'} />
              {'Show details'}
            </div>
          )}
          {error.details}
        </pre>
      )}
    </div>
  );
};

export const showCustomErrorDialog = async (
  error: ICustomError,
  title?: string
) => {
  await showDialog({
    title: title ?? 'EODAG Labextension - error',
    body: ReactWidget.create(<CustomDialogContent error={error} />),
    buttons: [Dialog.okButton()]
  });
};
