import React from 'react';
import { CodiconOpenPreview, PhFileCode } from '../icons';
import { ThreeDots } from 'react-loader-spinner';
import { Button } from '../button';

interface ISubmitButtonsProps {
  isLoadingSearch?: boolean;
  onPreviewClick: () => void;
  onGeneratingClick: () => void;
  productTypeValue: string | null | undefined;
}

export const SubmitButtons: React.FC<ISubmitButtonsProps> = ({
  isLoadingSearch,
  onPreviewClick,
  onGeneratingClick,
  productTypeValue
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
          !productTypeValue
            ? 'You need to select a product type to preview the results'
            : undefined
        }
        disabled={isLoadingSearch || !productTypeValue}
        onClick={onPreviewClick}
      />
      <Button
        startIcon={<PhFileCode />}
        type={'submit'}
        label={'Generate code'}
        tooltip={
          !productTypeValue
            ? 'You need to select a product type to generate the code'
            : undefined
        }
        disabled={isLoadingSearch || !productTypeValue}
        onClick={onGeneratingClick}
      />
    </div>
  );
};
