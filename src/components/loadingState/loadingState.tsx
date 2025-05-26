import React, { useEffect, useState } from 'react';
import { Loader } from './loader';

interface ILoadingStateProps {
  disabled: boolean;
  withIcon?: boolean;
  children: React.ReactElement;
}

export const LoadingState: React.FC<ILoadingStateProps> = ({
  disabled = false,
  withIcon = true,
  children
}) => {
  const [showLoader, setShowLoader] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    if (!disabled) {
      // We wait 500 ms before fading out the loader
      const fadeTimeout = setTimeout(() => {
        setFadeOut(true);
      }, 500);

      // And we hide the loader from the dom after 750 ms (500 ms delay + 250 ms animation)
      const hideTimeout = setTimeout(() => {
        setShowLoader(false);
      }, 750);

      return () => {
        clearTimeout(fadeTimeout);
        clearTimeout(hideTimeout);
      };
    } else {
      // If we go back to the disabled state, we show the loader again
      setShowLoader(true);
      setFadeOut(false);
    }
  }, [disabled]);

  return (
    <div className={'loading-state'}>
      {showLoader && (
        <div className={`loader-container ${fadeOut ? 'fade-out' : ''}`}>
          {withIcon && <Loader className={'loader-icon'} />}
        </div>
      )}
      {children}
    </div>
  );
};
