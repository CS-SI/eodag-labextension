import React, { useMemo } from 'react';
import { IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { IOptionType } from '../../types';
import { DropdownMenu, IDropdownItem } from '../dropdownMenu/dropdownMenu';

interface IDropdownButtonProps {
  options: IOptionType[];
  onSelect: (option: IOptionType) => void;
  selectedOptions: string[];
  disabled?: boolean;
}

export const MoreParametersDropdown: React.FC<IDropdownButtonProps> = ({
  options,
  onSelect,
  selectedOptions,
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
    <DropdownMenu
      OpeningComponent={
        <IconButton
          aria-label={'More parameters'}
          size="small"
          color={'primary'}
          disabled={disabled}
          sx={{
            display: 'flex',
            gap: '0.25rem',
            fontSize: '0.75rem'
          }}
        >
          <AddIcon fontSize={'small'} />
          {'More parameters'}
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
  );
};
