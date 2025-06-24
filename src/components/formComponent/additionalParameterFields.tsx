import React from 'react';
import { useFieldArray, UseFormReturn } from 'react-hook-form';
import { IFormInput } from '../../types';
import { isUndefined } from 'lodash';
import { NoParamsAlert } from './noParamsAlert';
import { IconButton, Tooltip } from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import AddIcon from '@mui/icons-material/Add';

export interface IAdditionalParameterFieldsProps
  extends Partial<UseFormReturn<IFormInput, any, IFormInput>> {
  productType: string | null | undefined;
  additionalParameters: boolean;
}

export const AdditionalParameterFields = ({
  control,
  register,
  resetField,
  productType,
  additionalParameters
}: IAdditionalParameterFieldsProps) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'additionalParameters'
  });
  fields[0] = { name: '', value: '', id: '999' };

  let clearInput: (index: number) => void;
  if (!isUndefined(resetField)) {
    clearInput = (index: number): void => {
      resetField(`additionalParameters.${index}.name`);
      resetField(`additionalParameters.${index}.value`);
    };
  }

  return (
    <div className="jp-EodagWidget-additionalParameters">
      <div className={'jp-EodagWidget-additionalParameters-title'}>
        <p>Custom Parameters</p>
        <Tooltip title={'Add a new custom parameter'} placement={'top'}>
          <IconButton
            size={'small'}
            onClick={() => append({ name: '', value: '' })}
          >
            <AddIcon fontSize={'small'} />
          </IconButton>
        </Tooltip>
      </div>

      {!productType || isUndefined(register) ? (
        <NoParamsAlert
          label={'Select a product type to unlock custom parameters'}
        />
      ) : additionalParameters ? (
        fields.map((field, index) => (
          <section className={'section'} key={field.id}>
            <input
              placeholder="Name"
              {...register(`additionalParameters.${index}.name` as const)}
            />
            <input
              placeholder="Value"
              {...register(`additionalParameters.${index}.value` as const)}
            />
            <Tooltip title={'Remove custom parameter'} placement={'right'}>
              <IconButton
                size={'small'}
                onClick={() =>
                  fields.length === 1 && clearInput
                    ? clearInput(index)
                    : remove(index)
                }
              >
                <ClearIcon fontSize={'small'} />
              </IconButton>
            </Tooltip>
          </section>
        ))
      ) : (
        <p className="jp-EodagWidget-noParametersMessage">
          Custom parameters are not allowed with this product type.
        </p>
      )}
    </div>
  );
};
