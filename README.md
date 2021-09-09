# eodag-labextension

[![JupyterLab v3](https://badge.fury.io/py/eodag-labextension.svg)](https://badge.fury.io/py/eodag-labextension)
[![JupyterLab v3](https://img.shields.io/badge/jupyterlab-3.x-orange?logo=jupyter)](https://jupyter.org/)
[![Code style: black](https://img.shields.io/badge/code%20style-black-000000.svg)](https://github.com/psf/black)

Searching and browsing remote sensed imagery directly from
JupyterLab.

This extension is using EODAG to efficiently search from various image providers. It can transform search result to code cells into the active Python notebook to further process/visualize the dataset.

The extension is composed of a Python package named `eodag-labextension`, and add a tab into the left panel of Jupyter Lab. The package consist of a Python Jupyter notebook REST service consumed by the client and served at `/eodag/` or `/user/<username>/eodag/` for JupyterHub (a home page is available at that URL).

The products search is based on the [eodag](https://eodag.readthedocs.io) library.

## Requirements

- pip >= 21.0

## Compatibility

- v2.1.3 is the latest version compatible with JupyterLab v1
- v3.1.3 is the latest version compatible with JupyterLab v2
- next versions are compatibles with JupyterLab v3

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

You can use eodag-labextension inside a Jupyter notebook. Start Jupyter lab with `jupyter lab`, and in Jupyter lab open a notebook.

### Search

Open the EODAG tab on the left side of the JupuytuerLab interface.

With displayed search form, you can enter select your data geographically and apply some search criteria:

- **Product type**: the searched product type. For each entry of the drop-down list, a tooltip is displayed at hovering time with corresponding description.
- **Start date**: minimal date of the search temporal window.
- **End date**: maximal date of the search temporal window.
- **Max cloud cover**: maximum cloud cover allowed in search results in percent.
- **Additional parameters**: used to enter key-value pairs criteria for the request.

You can draw multiple extents, or use none. Each extent can be a rectangle or a free polygon.
Product type is mandatory. Other criterias are optional.

Extent and product type are mandatory. Other criteria are optional.

Once search criteria are filled out, click on the "Search" button to proceed to next step. At the end of the search, a popup opens and displays results.

> Note: The AI4GEO STAC Catalog is now searchable with the plugin. Its product types are now displayed in the dropdown list.

### Results display

The results display popup is compopsed of 3 parts:

- a map showing products extent
- a table listing products
- a pane containing metadata for currently selected product.

The results table allows you to access product metadata by clicking on the desired product line. The magnifying glass button allows you to zoom in on the product's in the map view. By scrolling down in the list of results, the search is automatically restarted to retrieve the following results.

In the metadata view, clicking on the thumbnail displays it in native resolution. Clicking it again reduces its size again.

### Apply to the Jupyter notebook

If the search result is correct, clicking on the "Apply" button will insert the Python eodag code in a new cell after the selected cell of the currently open notebook. The popup is automatically closed. From there, it is possible to work in the notebook on the search results by executing the eodag search.

Here is an example of generated code:

```python
from eodag import EODataAccessGateway
dag = EODataAccessGateway()
product_type = 'S2_MSI_L1C'
footprint = {'lonmin': 0.660957, 'latmin': 43.149093, 'lonmax': 2.388008, 'latmax': 44.190082}
cloud_cover = 15
start, end = '2019-02-01', '2019-02-15'
search_results, estimated_total_nbr_of_results = dag.search(
    productType=product_type,
    geometry=footprint,
    startTimeFromAscendingNode=start,
    completionTimeFromAscendingNode=end,
    cloudCover=cloud_cover,
)
```

The eodag configuration file should be located at `$HOME/.config/eodag/eodag.yml`. See [eodag documentation](https://eodag.readthedocs.io/en/latest/intro.html#how-to-configure-authentication-for-available-providers) for further informations.

You may want to enforce usage of a particular provider. To do so, use set_preferred_provider and then execute a query like previously:

```python
dag = EODataAccessGateway()
dag.set_preferred_provider("theia")
```

### Using results

Here are some examples about how to use search results into a notebook:

```python
 from pprint import pprint

# Display results list
pprint(search_results)

# Display products access paths
pprint([p.location for p in search_results])
```

#### Extract producsts extent

```python
from eodag.api.search_result import SearchResult
results_geojson = SearchResult(search_results).as_geojson_object()

from shapely.geometry import shape, GeometryCollection
features = results_geojson['features']
features = GeometryCollection([shape(feature["geometry"]).buffer(0) for feature in features])
features
```

#### Display products extent on a slippy map

```python
import folium
from folium import plugins
ext = features.bounds
bounds = [[ext[1], ext[0]], [ext[3], ext[2]]]
m = folium.Map(
    tiles='Stamen Terrain',
    control_scale=True,
)
folium.GeoJson(results_geojson).add_to(m)
m.fit_bounds(bounds)
folium.Figure(width=500, height=300).add_child(m)
```

### Downloading products

To download products from the search request into a sub-directory called `download`, run:

```python
dag.download_all(search_results)
```

### Verbosity

Eodag verbosity can be increased with following call with levels:

- **INFO**: `verbose=1`
- **DEBUG**: `verbose=3`

```python
from eodag.utils.logging import setup_logging
setup_logging(verbose=3)
```

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

## License

This software is licensed under Apache License v2.0.
See LICENSE file for details.

_Copyright 2021 CS GROUP - France
All rights reserved_
