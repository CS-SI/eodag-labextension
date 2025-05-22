import React from 'react';
import { useFieldArray, UseFormReturn } from 'react-hook-form';
import { Tooltip } from 'react-tooltip';
import { CarbonAddFilled, CarbonTrashCan } from '../icones';
import { IFormInput } from '../types';
import { tooltipDark, tooltipTop, tooltipWarning } from './FormComponent';
import { isUndefined } from 'lodash';

export interface IAdditionalParameterFieldsProps
  extends Partial<UseFormReturn<IFormInput>> {
  productType: string;
  additionalParameters: boolean;
}

const AdditionalParameterFields = ({
  control,
  register,
  resetField,
  productType,
  additionalParameters
}: IAdditionalParameterFieldsProps) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'additionnalParameters'
  });
  fields[0] = { name: '', value: '', id: '999' };

  let clearInput: (index: number) => void;
  if (!isUndefined(resetField)) {
    clearInput = (index: number): void => {
      resetField(`additionnalParameters.${index}.name`);
      resetField(`additionnalParameters.${index}.value`);
    };
  }

  return (
    <div className="jp-EodagWidget-additionnalParameters">
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
                {...register(`additionnalParameters.${index}.name` as const)}
              />
              <input
                placeholder="Value"
                {...register(`additionnalParameters.${index}.value` as const)}
              />
              <button
                type="button"
                className="jp-EodagWidget-additionnalParameters-deletebutton"
                onClick={() =>
                  fields.length === 1 && clearInput
                    ? clearInput(index)
                    : remove(index)
                }
                data-tooltip-id="parameters-delete"
                data-tooltip-content="remove custom parameter"
                data-tooltip-variant={tooltipWarning}
                data-tooltip-place={tooltipTop}
              >
                <CarbonTrashCan height="20" width="20" />
                <Tooltip id="parameters-delete" className="jp-Eodag-tooltip" />
              </button>
              <button
                type="button"
                className="jp-EodagWidget-additionnalParameters-addbutton"
                onClick={() => append({ name: '', value: '' })}
                data-tooltip-id="parameters-add"
                data-tooltip-content="add a new custom parameter"
                data-tooltip-variant={tooltipDark}
                data-tooltip-place={tooltipTop}
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

export default AdditionalParameterFields;
