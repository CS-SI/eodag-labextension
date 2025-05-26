import React from 'react';
import BeatLoader from 'react-spinners/BeatLoader';

export const Loader = ({ className }: { className?: string }) => (
  <BeatLoader className={className} />
);
