import React from 'react';
import { useFieldArray, UseFormReturn } from 'react-hook-form';
import { Tooltip } from 'react-tooltip';
import { CarbonAddFilled, CarbonInformation, CarbonTrashCan } from '../icones';
import { IFormInput } from '../types';
import { tooltipDark, tooltipTop, tooltipWarning } from './FormComponent';

export interface AdditionalParameterFieldsProps
  extends Partial<UseFormReturn<IFormInput>> {
  additionalParameters: boolean;
}

const AdditionalParameterFields = ({
  control,
  register,
  resetField,
  additionalParameters
}: AdditionalParameterFieldsProps) => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'additionnalParameters'
  });
  fields[0] = { name: '', value: '', id: '999' };

  const clearInput = (index: number): void => {
    resetField(`additionnalParameters.${index}.name`);
    resetField(`additionnalParameters.${index}.value`);
  };
  return (
    <div className="jp-EodagWidget-additionnalParameters">
      <div className="jp-EodagWidget-additionnalParameters-label-icon-wrapper">
        <p className="jp-EodagWidget-input-name">Additional Parameters</p>
        <a
          href="https://eodag.readthedocs.io/en/stable/add_provider.html#opensearch-parameters-csv"
          target="_blank"
          rel="noopener noreferrer"
          data-tooltip-id="parameters-information"
          data-tooltip-content="Click to check queryable metadata in parameters documentation"
          data-tooltip-variant={tooltipDark}
          data-tooltip-place={tooltipTop}
        >
          <CarbonInformation height="20" width="20" />
          <Tooltip id="parameters-information" className="jp-Eodag-tooltip" />
        </a>
      </div>

      {additionalParameters &&
        fields.map((field, index) => {
          return (
            <div key={field.id}>
              <section className={'section'} key={field.id}>
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
                    fields.length === 1 ? clearInput(index) : remove(index)
                  }
                  data-tooltip-id="parameters-delete"
                  data-tooltip-content="remove additionnal parameter"
                  data-tooltip-variant={tooltipWarning}
                  data-tooltip-place={tooltipTop}
                >
                  <CarbonTrashCan height="20" width="20" />
                  <Tooltip
                    id="parameters-delete"
                    className="jp-Eodag-tooltip"
                  />
                </button>
                <button
                  type="button"
                  className="jp-EodagWidget-additionnalParameters-addbutton"
                  onClick={() => append({ name: '', value: '' })}
                  data-tooltip-id="parameters-add"
                  data-tooltip-content="add a new additionnal parameter"
                  data-tooltip-variant={tooltipDark}
                  data-tooltip-place={tooltipTop}
                >
                  <CarbonAddFilled height="20" width="20" />
                  <Tooltip id="parameters-add" className="jp-Eodag-tooltip" />
                </button>
              </section>
            </div>
          );
        })}
    </div>
  );
};

export default AdditionalParameterFields;
