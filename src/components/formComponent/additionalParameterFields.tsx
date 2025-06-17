import React from 'react';
import { useFieldArray, UseFormReturn } from 'react-hook-form';
import { Tooltip } from 'react-tooltip';
import { CarbonAddFilled, CarbonTrashCan } from '../icons';
import { IFormInput } from '../../types';
import { isUndefined } from 'lodash';

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
      <p
        className="jp-EodagWidget-section-title"
        style={{ marginBottom: '10px' }}
      >
        Custom Parameters
      </p>

      {!productType || isUndefined(register) ? (
        <p className="jp-EodagWidget-noParametersMessage">
          Select a product type to unlock custom parameters.
        </p>
      ) : additionalParameters ? (
        fields.map((field, index) => (
          <div key={field.id}>
            <section className={'section'}>
              <input
                placeholder="Name"
                {...register(`additionalParameters.${index}.name` as const)}
              />
              <input
                placeholder="Value"
                {...register(`additionalParameters.${index}.value` as const)}
              />
              <button
                type="button"
                className="jp-EodagWidget-additionalParameters-deletebutton"
                onClick={() =>
                  fields.length === 1 && clearInput
                    ? clearInput(index)
                    : remove(index)
                }
                data-tooltip-id="parameters-delete"
                data-tooltip-content="remove custom parameter"
                data-tooltip-variant={'warning'}
                data-tooltip-place={'top'}
              >
                <CarbonTrashCan height="20" width="20" />
                <Tooltip id="parameters-delete" className="jp-Eodag-tooltip" />
              </button>
              <button
                type="button"
                className="jp-EodagWidget-additionalParameters-addbutton"
                onClick={() => append({ name: '', value: '' })}
                data-tooltip-id="parameters-add"
                data-tooltip-content="add a new custom parameter"
                data-tooltip-variant={'dark'}
                data-tooltip-place={'top'}
              >
                <CarbonAddFilled height="20" width="20" />
                <Tooltip id="parameters-add" className="jp-Eodag-tooltip" />
              </button>
            </section>
          </div>
        ))
      ) : (
        <p className="jp-EodagWidget-noParametersMessage">
          Custom parameters are not allowed with this product type.
        </p>
      )}
    </div>
  );
};
