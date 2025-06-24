import { useForm, useWatch } from 'react-hook-form';
import { IFormInput } from '../types';

const defaultStartDate: Date | undefined = undefined;
const defaultEndDate: Date | undefined = undefined;

const defaultValues = {
  productType: null,
  provider: null,
  startDate: defaultStartDate,
  endDate: defaultEndDate
};

export const useProductsForm = () => {
  const form = useForm<IFormInput>({
    mode: 'all',
    defaultValues
  });

  const formValues = useWatch({
    control: form.control
  });

  return {
    formValues,
    form
  };
};
