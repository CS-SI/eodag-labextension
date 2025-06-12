import React, { useMemo, useState } from 'react';
import { Divider, IconButton, Menu, MenuItem } from '@mui/material';
import SettingsIcon from '@mui/icons-material/SettingsOutlined';
import EditIcon from '@mui/icons-material/EditOutlined';
import BookIcon from '@mui/icons-material/BookOutlined';
import GitHubIcon from '@mui/icons-material/GitHub';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import Copyright from '@mui/icons-material/Copyright';

export interface IOptionsMenuDropdownItems {
  name: string;
  type: 'link' | 'onClick' | 'divider';
  link?: string;
  icon?: React.ReactElement;
  disabled?: boolean;
  onClick?: () => void;
}

interface IOptionsMenuDropdownProps {
  openSettings: () => void;
  openEodagConfigEditor: () => Promise<void>;
  version: string;
  labExtensionVersion: string;
}

export const OptionsMenuDropdown: React.FC<IOptionsMenuDropdownProps> = ({
  openSettings,
  openEodagConfigEditor,
  version,
  labExtensionVersion
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const menuItems: IOptionsMenuDropdownItems[] = useMemo(
    () => [
      {
        name: 'Labextension settings',
        type: 'onClick',
        icon: <SettingsIcon />,
        onClick: () => openSettings()
      },
      {
        name: 'Edit EODAG user configuration',
        icon: <EditIcon />,
        type: 'onClick',
        onClick: () => openEodagConfigEditor()
      },
      {
        name: '',
        type: 'divider'
      },
      {
        name: 'Documentation',
        type: 'link',
        icon: <BookIcon />,
        link: 'https://github.com/CS-SI/eodag-labextension/blob/develop/README.md'
      },
      {
        name: 'Github repository',
        icon: <GitHubIcon />,
        type: 'link',
        link: 'https://github.com/CS-SI/eodag-labextension'
      },
      {
        name: 'Copyright CS GROUP - France',
        icon: <Copyright />,
        type: 'link',
        link: 'https://www.cs-soprasteria.com'
      },
      {
        name: '',
        type: 'divider'
      },
      {
        name: `EODAG v${version}`,
        type: 'link',
        disabled: true
      },
      {
        name: `EODAG LabExtension v${labExtensionVersion}`,
        type: 'link',
        disabled: true
      }
    ],
    [openSettings, version]
  );

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const menuItemsList = useMemo(
    () =>
      menuItems.map(item => {
        switch (item.type) {
          case 'divider':
            return <Divider />;
          case 'onClick':
          case 'link':
            return (
              <MenuItem
                disabled={item.disabled}
                className={'jp-EodagWidget-menuItem'}
                onClick={
                  item.link
                    ? () => window.open(item.link, '_blank')
                    : item.onClick
                      ? item.onClick
                      : undefined
                }
                key={item.name}
                sx={{
                  fontSize: '.75rem',
                  display: 'flex',
                  gap: '.5rem',
                  '> svg': {
                    width: '1.25rem',
                    height: '1.25rem'
                  }
                }}
              >
                {item.icon ? item.icon : null}
                {item.name}
              </MenuItem>
            );
        }
      }),
    [menuItems]
  );

  return (
    <>
      <IconButton aria-label="Options" onClick={handleClick} size="small">
        <MoreHorizIcon
          sx={{ width: '1.25rem', height: '1.25rem', color: '#000000' }}
        />
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        onClick={handleClose}
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
