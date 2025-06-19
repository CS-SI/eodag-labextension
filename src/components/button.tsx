import React, { useMemo } from 'react';
import { Button as MuiButton, ButtonProps, Tooltip } from '@mui/material';

interface IButtonProps {
  label: string;
  startIcon?: React.ReactNode;
  tooltip?: string;
  className?: string;
  color?: ButtonProps['color'];
  variant?: ButtonProps['variant'];
  onClick?: () => void;
  disabled?: boolean;
  type?: 'submit' | 'reset' | 'button' | undefined;
}

export const Button: React.FC<IButtonProps> = ({
  label,
  startIcon,
  tooltip,
  className,
  color = 'primary',
  type = 'button',
  onClick,
  variant = 'contained',
  disabled = false
}) => {
  const content = useMemo(
    () => (
      <MuiButton
        disabled={disabled}
        onClick={onClick}
        type={type}
        variant={variant}
        className={`jp-EodagButton ${className}`}
        color={color}
      >
        {startIcon}
        <span>{label}</span>
      </MuiButton>
    ),
    [label, startIcon, disabled, onClick, variant, className, color]
  );

  if (tooltip) {
    return (
      <Tooltip placement={'top'} arrow title={tooltip}>
        {content}
      </Tooltip>
    );
  }

  return content;
};
