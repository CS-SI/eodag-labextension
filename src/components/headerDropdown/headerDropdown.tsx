import React, { useMemo } from 'react';
import { IconButton } from '@mui/material';
import SettingsIcon from '@mui/icons-material/SettingsOutlined';
import EditIcon from '@mui/icons-material/EditOutlined';
import BookIcon from '@mui/icons-material/BookOutlined';
import GitHubIcon from '@mui/icons-material/GitHub';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import Copyright from '@mui/icons-material/Copyright';
import { DropdownMenu } from '../dropdownMenu/dropdownMenu';

export interface IHeaderDropdownItems {
  name: string;
  type: 'link' | 'onClick' | 'divider';
  link?: string;
  icon?: React.ReactElement;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
}

interface IHeaderDropdownProps {
  openSettings: () => void;
  openEodagConfigEditor: () => Promise<void>;
  version: string;
  labExtensionVersion: string;
}

export const HeaderDropdown: React.FC<IHeaderDropdownProps> = ({
  openSettings,
  openEodagConfigEditor,
  version,
  labExtensionVersion
}) => {
  const menuItems: IHeaderDropdownItems[] = useMemo(
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
        disabled: true,
        className: 'selectable'
      },
      {
        name: `EODAG LabExtension v${labExtensionVersion}`,
        type: 'link',
        disabled: true,
        className: 'selectable'
      }
    ],
    [openSettings, version]
  );

  const openingComponent = useMemo(
    () => (
      <IconButton
        aria-label="Options"
        size="small"
        sx={{
          color: '#000000'
        }}
      >
        <MoreHorizIcon sx={{ width: '1.25rem', height: '1.25rem' }} />
      </IconButton>
    ),
    []
  );

  return (
    <DropdownMenu OpeningComponent={openingComponent} options={menuItems} />
  );
};
