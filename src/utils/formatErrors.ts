import { ICustomError } from '../types';

export const formatCustomError = (err: unknown): ICustomError => {
  if (typeof err === 'object' && err && 'error' in err) {
    return {
      name: 'SearchError',
      title: (err as any).error ?? 'Unknown error',
      details: (err as any).details ?? ''
    };
  }
  if (err instanceof Error) {
    return {
      name: err.name,
      title: err.message,
      details: ''
    };
  }
  return {
    name: 'UnknownError',
    title: 'An unexpected error occurred.',
    details: ''
  };
};
