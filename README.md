# eodag-labextension

JupyterLab extension used to search remote sensed imagery from various image providers.

The products search is based on the [eodag](https://bitbucket.org/geostorm/eodag) library.

## Prerequisites

* JupyterLab

## Setup

See [Distributing Jupyter Extensions as Python Packages](https://jupyter-notebook.readthedocs.io/en/latest/examples/Notebook/Distributing%20Jupyter%20Extensions%20as%20Python%20Packages.html#Distributing-Jupyter-Extensions-as-Python-Packages)

```bash
pip install eodag-labextension
jupyter labextension install eodag-labextension
```

### Configuration

To be able to access path to eodag configuration file into environment, activate following setting into jupyterhub_config.py file:
```python
c.Spawner.env_keep = ['PATH', 'PYTHONPATH', 'CONDA_ROOT', 'CONDA_DEFAULT_ENV', 'VIRTUAL_ENV', 'LANG', 'LC_ALL', 'EODAG_CFG_FILE']
```

and add into your bashrc file:

```bash
export EODAG_CFG_FILE=path_to_eodag_cfg_file
```

## Run

```bash
jupyterhub
```

and browse http://localhost:8000

## Contributing

### Server notebook extension

```bash
pre-commit install

npm install -g configurable-http-proxy

pip install -e .[dev]

# Enables extension: required if package installed in editable mode!
# --sys-prefix if running into virtual env
jupyter serverextension enable --py eodag_labextension --sys-prefix
```

### Client JupyterLab plugin

For a development install (requires npm version 4 or later), do the following in the repository directory:

```bash
npm install
npm run build
jupyter labextension link .
```

To rebuild the package and the JupyterLab app:

```bash
npm run build
jupyter lab build
```
