# eodag-labextension

[![JupyterLab v3](https://badge.fury.io/py/eodag-labextension.svg)](https://badge.fury.io/py/eodag-labextension)
[![JupyterLab v3](https://img.shields.io/badge/jupyterlab-3.x-orange?logo=jupyter)](https://jupyter.org/)
[![Code style: black](https://img.shields.io/badge/code%20style-black-000000.svg)](https://github.com/psf/black)
[![Binder](https://mybinder.org/badge_logo.svg)](https://mybinder.org/v2/git/https%3A%2F%2Fgithub.com%2FCS-SI%2Feodag-labextension.git/master?urlpath=lab%2Ftree%2Fnotebooks%2Fbasic_usage.ipynb)

Searching and browsing remote sensed imagery directly from JupyterLab.

![screencast](https://raw.githubusercontent.com/CS-SI/eodag-labextension/develop/notebooks/images/eodag_labext_screencast.gif)

This extension is using the [eodag](https://github.com/CS-SI/eodag) library to efficiently search from various image
providers. It can transform search results to code cells into the active Python notebook to further process/visualize
the dataset.

The extension is composed of a Python package named `eodag-labextension`, and add a tab into the left panel of Jupyter
Lab. The package consist of a Python Jupyter notebook REST service consumed by the client and served at `/eodag/` or
`/user/<username>/eodag/` for JupyterHub (a home page is available at that URL).

- [Requirements](#Requirements)
- [Compatibility](#Compatibility)
- [Install](#Install)
  - [Configuration](#Configuration)
- [QuickStart](#QuickStart)
  - [Search](#Search)
  - [Results display](#Results-display)
  - [Apply to the Jupyter notebook](#Apply-to-the-Jupyter-notebook)
  - [User manual](#User-manual)
- [Contribute](#Contribute)
- [Troubleshooting](#Troubleshooting)
- [License](#License)

## Requirements

- pip >= 21.0

## Compatibility

- newest `eodag-labextension` versions are compatibles with JupyterLab v3
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

### Configuration

eodag configuration file should be localized at `~/.config/eodag/eodag.yaml` (see
[eodag documentation](https://eodag.readthedocs.io/en/latest/getting_started_guide/configure.html)).
Make sure that that file is configured properly.

## QuickStart

You can use `eodag-labextension` inside a Jupyter notebook. Start Jupyter lab with `jupyter lab`, and in Jupyter lab
open a notebook.

![extension logo](https://raw.githubusercontent.com/CS-SI/eodag-labextension/develop/notebooks/images/eodag_labext_form.png)

### Search

![extension logo](https://raw.githubusercontent.com/CS-SI/eodag-labextension/develop/notebooks/images/eodag_labext_icon.png)
Open the EODAG tab on the left side of the JupuytuerLab interface by clicking on that icon.

With displayed search form, you can enter select your data geographically and apply some search criteria:

- **Product type**: the searched product type. For each entry of the drop-down list, a tooltip is displayed at
  hovering time with corresponding description.
- **Start date**: minimal date of the search temporal window.
- **End date**: maximal date of the search temporal window.
- **Max cloud cover**: maximum cloud cover allowed in search results in percent.
- **Additional parameters**: used to enter key-value pairs criteria for the request.

You can draw multiple extents, or use none. Each extent can be a rectangle or a free polygon.
Product type is mandatory. Other criteria are optional.

Once search criteria are filled out, click on the "Search" button to proceed to next step. At the end of the search,
a popup opens and displays results.

### Results overview

The results overview popup is compopsed of 3 parts:

- a map showing products extent
- a table listing products
- a pane containing metadata for currently selected product.

The results table allows you to access product metadata by clicking on the desired product line. The magnifying glass
button allows you to zoom in on the product's in the map view. By scrolling down in the list of results, the search is
automatically restarted to retrieve the following results.

In the metadata view, clicking on the thumbnail displays it in native resolution. Clicking it again reduces its size
again.

### Apply to the Jupyter notebook

If the search result is correct, clicking on the "`Apply`" button will insert the Python eodag code in a new cell
after the selected cell of the currently open notebook. The popup is automatically closed. From there, it is possible
to work in the notebook on the search results by executing the eodag search.

Here is an example of generated code:

```python
from eodag import EODataAccessGateway, setup_logging

setup_logging(1) # 0: nothing, 1: only progress bars, 2: INFO, 3: DEBUG

dag = EODataAccessGateway()
geometry = "POLYGON ((0.550136 43.005451, 0.550136 44.151469, 2.572104 44.151469, 2.572104 43.005451, 0.550136 43.005451))"
search_results, total_count = dag.search(
  productType="S2_MSI_L1C",
  geom=geometry,
  start="2021-08-01",
  end="2021-08-11",
  cloudCover=17,
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

_Copyright 2021 CS GROUP - France
All rights reserved_
