# eodag-labextension

[![EODAG-Labextension](https://badge.fury.io/py/eodag-labextension.svg)](https://badge.fury.io/py/eodag-labextension)
[![JupyterLab v4](https://img.shields.io/badge/jupyterlab-4.x-orange?logo=jupyter)](https://jupyter.org/)
[![Code style: black](https://img.shields.io/badge/code%20style-black-000000.svg)](https://github.com/psf/black)
[![Binder](https://mybinder.org/badge_logo.svg)](https://mybinder.org/v2/git/https%3A%2F%2Fgithub.com%2FCS-SI%2Feodag-labextension.git/master?urlpath=lab%2Ftree%2Fnotebooks%2Fbasic_usage.ipynb)

Searching and browsing remote sensed imagery directly from JupyterLab.

![screencast](https://raw.githubusercontent.com/CS-SI/eodag-labextension/develop/notebooks/images/eodag_labext_screencast.gif)

> _v3.7.0 screencast_

This extension is using the [eodag](https://github.com/CS-SI/eodag) library to efficiently search from various image
providers. It can transform search results to code cells into the active Python notebook to further process/visualize
the dataset.

The extension is composed of a Python package named `eodag-labextension`, and add a tab into the left panel of Jupyter
Lab. The package consist of a Python Jupyter notebook REST service consumed by the client and served at `/eodag/` or
`/user/<username>/eodag/` for JupyterHub (a home page is available at that URL).

- [Requirements](#requirements)
- [Compatibility](#compatibility)
- [Install](#install)
  - [System configuration](#system-configuration)
- [QuickStart](#quickstart)
  - [Search](#search)
  - [Settings](#settings)
    - [EODAG user settings through environment variables](#eodag-user-settings-through-environment-variables)
  - [Results overview](#results-overview)
  - [Apply to the Jupyter notebook](#apply-to-the-jupyter-notebook)
  - [User manual](#user-manual)
- [Contribute](#contribute)
- [Troubleshooting](#troubleshooting)
- [License](#license)

## Requirements

- pip >= 21.0

## Compatibility

- newest `eodag-labextension` versions are compatibles with JupyterLab v4
- v4.0.0 is the latest version compatible with JupyterLab v3
- v3.1.3 is the latest version compatible with JupyterLab v2
- v2.1.3 is the latest version compatible with JupyterLab v1

## Install

```bash
pip install eodag-labextension
```

You can also uninstall it quite simply.

```bash
pip uninstall eodag-labextension
```

### System configuration

EODAG Labextension can be configured using the following environment variables:

- `EODAG_LABEXTENSION__DEBUG` (`bool`, default: `False`): whether to print
  [EODAG logging](https://eodag.readthedocs.io/en/stable/notebooks/api_user_guide/3_configuration.html#Logging) at DEBUG
  level or not.
- `EODAG_LABEXTENSION__MAP__TILE_URL` (`str`, default: `https://a.tile.openstreetmap.org/{z}/{x}/{y}.png`): Map tile URL.
- `EODAG_LABEXTENSION__MAP__TILE_ATTRIBUTION` (`str`, default: "&copy; [OpenStreetMap](http://osm.org/copyright) contributors"):
  Map tile attribution.
- `EODAG_LABEXTENSION__MAP__ZOOM_OFFSET` (`int`, default: `0`): Map zoom offset.

## QuickStart

You can use `eodag-labextension` inside a Jupyter notebook. Start Jupyter lab with `jupyter lab`, and in Jupyter lab
open a notebook.

### Search

![extension logo](https://raw.githubusercontent.com/CS-SI/eodag-labextension/develop/notebooks/images/eodag_labext_icon.png)
Click on this icon in the left of JupyterLab interface to open EODAG-Labextension tab.

![form](https://raw.githubusercontent.com/CS-SI/eodag-labextension/develop/notebooks/images/eodag_labext_form.png)

With displayed search form, you can enter search extent and following search criteria:

- **Provider**: the provider on which to perform the search. If no provider is selected, search will loop on providers
  by [priority](https://eodag.readthedocs.io/en/stable/getting_started_guide/configure.html#priority-setting), and
  return the first non empty results.
- **Product type**: the searched product type. List filtering is performed using product types description keywords.
  For each entry of the drop-down list, a tooltip is displayed at hovering time with corresponding title.
  ![product types](https://raw.githubusercontent.com/CS-SI/eodag-labextension/develop/notebooks/images/eodag_labext_product_types.png)

- **Date range**: minimal and maximal dates of the search temporal window.
- **Parameters**: Select a product type to unlock parameters. Click on _"More parameters"_, select desired parameters
  and set their associated value that should be sent as search criteria.
- **Custom parameters**: used to enter key-value pairs criteria for the request that are not available as queryable
  through _"Parameters"_.

As **search geometry** you can draw multiple extents, or use none. Each extent can be a rectangle or a free polygon.

_Product type is mandatory. Other criteria are optional._

Once search criteria are filled out, click on:

- `Generate Code` to automatically generate and insert the corresponding eodag search code bellow the active cell.
- `Preview Results` to perform a search in background, display results, and generate search code in a second step.

### Settings

![reload logo](https://raw.githubusercontent.com/CS-SI/eodag-labextension/develop/notebooks/images/eodag_labext_reload_icon.png)
Click on this icon to reload [EODAG configuration](https://eodag.readthedocs.io/en/stable/getting_started_guide/configure.html)
and take into account your updated credentials or providers settings.

![settings logo](https://raw.githubusercontent.com/CS-SI/eodag-labextension/develop/notebooks/images/eodag_labext_settings_icon.png)
Click on this icon to open EODAG-Labextension settings menu.

![settings tab](https://raw.githubusercontent.com/CS-SI/eodag-labextension/develop/notebooks/images/eodag_labext_settings_map.png)

You will be enable to:

- Configure Labextension through its settings:

  - choose whether newly inserted code should replace existing search code or not;
  - enable search count, which would significantly slow down search requests for some providers, and might be
    unavailable for some others;
  - configure the default map settings.

- Edit [EODAG user configuration file](https://eodag.readthedocs.io/en/stable/getting_started_guide/configure.html#yaml-user-configuration-file),
  to set provider credentials, download directories, or other settings. Default file path is `~/.config/eodag/eodag.yaml`.
  EODAG environment automatically reloads on file save.
- Open Labextension [Documentation](https://github.com/CS-SI/eodag-labextension/blob/develop/README.md),
  [Github repository](https://github.com/CS-SI/eodag-labextension), or [CS GROUP](https://www.cs-soprasteria.com) page.
- View EODAG packages versions.

#### EODAG user settings through environment variables

EODAG [environment variable configuration](https://eodag.readthedocs.io/en/stable/getting_started_guide/configure.html#environment-variable-configuration)
can be set by storing variables in a `.env` file in the jupyterlab working directory:

```sh
echo "EODAG_CFG_FILE=/path/to/custom.yml" >> .env
```

Hit the reload ![reload logo](https://raw.githubusercontent.com/CS-SI/eodag-labextension/develop/notebooks/images/eodag_labext_reload_icon.png)
button to update current EODAG environment with updated `.env` file.

### Results overview

![extension popup](https://raw.githubusercontent.com/CS-SI/eodag-labextension/develop/notebooks/images/eodag_labext_popup.png)

The results overview popup is compopsed of 3 parts:

- a map showing products extent,
- a table listing products,
- a pane containing metadata for currently selected product.

The results table allows you to access product metadata by clicking on the desired product line. The magnifying glass
button allows you to zoom in on the product's in the map view. By scrolling down in the list of results, the search is
automatically restarted to retrieve the following results.

In the metadata view, clicking on the _Quicklook_ displays it in native resolution. Clicking it again reduces its size
again.

### Apply to the Jupyter notebook

If the search result is correct, clicking on the "`Generate code`" button will insert the Python eodag code in a new cell
after the selected cell of the currently open notebook. The popup is automatically closed. From there, it is possible
to work in the notebook on the search results by executing the eodag search.

Here is an example of generated code:

```python
from eodag import EODataAccessGateway, setup_logging

setup_logging(1) # 0: nothing, 1: only progress bars, 2: INFO, 3: DEBUG

dag = EODataAccessGateway()
geometry = "POLYGON ((0.550136 43.005451, 0.550136 44.151469, 2.572104 44.151469, 2.572104 43.005451, 0.550136 43.005451))"
search_results = dag.search(
  provider="cop_dataspace",
  productType="S2_MSI_L1C",
  geom=geometry,
  start="2025-04-01",
  end="2025-04-05",
  cloudCover=51,
)
```

### User manual

Please refer to the
[user manual notebook](https://github.com/CS-SI/eodag-labextension/blob/develop/notebooks/user_manual.ipynb)
for results usage examples.

## Contribute

Have you observed a bug while running `eodag-labextension`?
Do you have a suggestion for a new feature?

Don't hesitate and open an issue or submit a pull request, contributions are most welcome!

For guidance on setting up a development environment and how to make a
contribution to `eodag-labextension`, see the
[contributing guidelines](https://github.com/CS-SI/eodag-labextension/blob/develop/CONTRIBUTING.md).

## Troubleshooting

If you are seeing the frontend extension, but it is not working, check
that the server extension is enabled:

```bash
jupyter server extension list
```

If the server extension is installed and enabled, but you are not seeing
the frontend extension, check the frontend extension is installed:

```bash
jupyter labextension list
```

To submit an issue, please go to [github issues](https://github.com/CS-SI/eodag-labextension/issues).

## License

This software is licensed under Apache License v2.0.
See LICENSE file for details.

_Copyright 2022 CS GROUP - France
All rights reserved_
