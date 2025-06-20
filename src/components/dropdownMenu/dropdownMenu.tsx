import React, { cloneElement, MouseEvent, useMemo, useState } from 'react';
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
  className?: string;
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

  const menuItemsList = useMemo(() => {
    return options.map((option, index) => {
      switch (option.type) {
        case 'divider':
          return <Divider key={`divider-${index}`} />;
        case 'checkbox':
          return (
            <MenuItem
              key={option.value}
              className={`${'jp-EodagWidget-menuItem'} ${option.className}`}
              onClick={() => option.value && onToggleCheckbox?.(option.value)}
              disabled={option.disabled}
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
              className={`${'jp-EodagWidget-menuItem'} ${option.className}`}
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

  const openingComponent = cloneElement(OpeningComponent, {
    onClick: (e: MouseEvent<HTMLElement>) => {
      setAnchorEl(e.currentTarget);
    }
  });

  return (
    <>
      {openingComponent}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        transitionDuration={200}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left'
        }}
      >
        {menuItemsList}
      </Menu>
    </>
  );
};
