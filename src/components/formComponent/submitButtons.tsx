import React from 'react';
import { CodiconOpenPreview, PhFileCode } from '../icons';
import { ThreeDots } from 'react-loader-spinner';
import { Button } from '../button';

interface ISubmitButtonsProps {
  isLoadingSearch?: boolean;
  onPreviewClick: () => void;
  onGeneratingClick: () => void;
  collectionValue: string | null | undefined;
}

export const SubmitButtons: React.FC<ISubmitButtonsProps> = ({
  isLoadingSearch,
  onPreviewClick,
  onGeneratingClick,
  collectionValue
}) => {
  if (isLoadingSearch) {
    return (
      <div className="jp-EodagWidget-loader">
        <p>Generating</p>
        <ThreeDots />
      </div>
    );
  }

  return (
    <div className="jp-EodagWidget-form-buttons-wrapper">
      <Button
        startIcon={<CodiconOpenPreview />}
        label={'Preview results'}
        type={'submit'}
        tooltip={
          !collectionValue
            ? 'You need to select a collection to preview the results'
            : undefined
        }
        disabled={isLoadingSearch || !collectionValue}
        onClick={onPreviewClick}
      />
      <Button
        startIcon={<PhFileCode />}
        type={'submit'}
        label={'Generate code'}
        tooltip={
          !collectionValue
            ? 'You need to select a collection to generate the code'
            : undefined
        }
        disabled={isLoadingSearch || !collectionValue}
        onClick={onGeneratingClick}
      />
    </div>
  );
};
