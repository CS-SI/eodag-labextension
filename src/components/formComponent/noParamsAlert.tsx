import React from 'react';
import { Alert } from '@mui/material';

interface INoParamsAlertProps {
  label: string;
}

export const NoParamsAlert: React.FC<INoParamsAlertProps> = ({ label }) => (
  <Alert severity={'info'} className={'jp-EodagWidget-alert'}>
    {label}
  </Alert>
);
