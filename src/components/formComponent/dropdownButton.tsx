import React, { useMemo } from 'react';
import { IconButton } from '@mui/material';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { IOptionType } from '../../types';
import {
  DropdownMenu,
  IDropdownItem
} from '../genericDropdownMenu/genericDropdownMenu';

interface IDropdownButtonProps {
  options: IOptionType[];
  onSelect: (option: IOptionType) => void;
  selectedOptions: string[];
  buttonLabel?: string;
  disabled?: boolean;
}

export const DropdownButton: React.FC<IDropdownButtonProps> = ({
  options,
  onSelect,
  selectedOptions,
  buttonLabel = 'More parameters',
  disabled = false
}) => {
  const dropdownItems: IDropdownItem[] = useMemo(() => {
    return options.map(option => ({
      type: option.divider ? 'divider' : 'checkbox',
      name: option.label,
      value: option.value,
      checked: selectedOptions.includes(option.value)
    }));
  }, [options, selectedOptions]);

  return (
    <>
      <DropdownMenu
        OpeningComponent={
          <IconButton aria-label={buttonLabel} size="small" disabled={disabled}>
            <MoreHorizIcon sx={{ marginLeft: '5px' }} />
            {buttonLabel}
          </IconButton>
        }
        options={dropdownItems}
        onToggleCheckbox={(value: string) => {
          const option = options.find(opt => opt.value === value);
          if (option) {
            onSelect(option);
          }
        }}
      />
    </>
  );
};
