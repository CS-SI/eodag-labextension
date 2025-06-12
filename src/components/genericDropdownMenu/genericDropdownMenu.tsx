import React, { useMemo, useState } from 'react';
import { Checkbox, Divider, Menu, MenuItem } from '@mui/material';

export type DropdownItemType = 'link' | 'onClick' | 'divider' | 'checkbox';

export interface IDropdownItem {
  name?: string;
  type: DropdownItemType;
  link?: string;
  icon?: React.ReactElement;
  disabled?: boolean;
  onClick?: () => void;
  checked?: boolean;
  value?: string;
}

interface IDropdownMenuProps {
  options: IDropdownItem[];
  OpeningComponent: React.ReactElement;
  onToggleCheckbox?: (value: string) => void;
}

export const DropdownMenu: React.FC<IDropdownMenuProps> = ({
  options,
  OpeningComponent,
  onToggleCheckbox
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const menuItemsList = useMemo(() => {
    return options.map((option, index) => {
      switch (option.type) {
        case 'divider':
          return <Divider key={`divider-${index}`} />;
        case 'checkbox':
          return (
            <MenuItem
              key={option.value}
              className={'jp-EodagWidget-menuItem'}
              onClick={() => option.value && onToggleCheckbox?.(option.value)}
              disabled={option.disabled}
              sx={{ fontSize: '0.875rem' }}
            >
              <Checkbox
                edge="start"
                size="small"
                checked={!!option.checked}
                tabIndex={-1}
                disableRipple
                sx={{
                  padding: '0 0 0 .5rem'
                }}
              />
              {option.name}
            </MenuItem>
          );
        case 'onClick':
        case 'link':
          return (
            <MenuItem
              disabled={option.disabled}
              className={'jp-EodagWidget-menuItem'}
              onClick={
                option.link
                  ? () => window.open(option.link, '_blank')
                  : option.onClick
                    ? option.onClick
                    : undefined
              }
              key={option.name}
            >
              {option.icon ? option.icon : null}
              {option.name}
            </MenuItem>
          );
      }
    });
  }, [options, onToggleCheckbox]);

  const openingComponent = React.cloneElement(OpeningComponent, {
    onClick: handleClick
  });

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      {openingComponent}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left'
        }}
        PaperProps={{
          elevation: 4,
          sx: {
            mt: 1,
            minWidth: 200
          }
        }}
      >
        {menuItemsList}
      </Menu>
    </>
  );
};
