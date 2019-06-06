# eodag-labextension

JupyterLab extension used to search remote sensed imagery from various image providers.

This extension is composed of to parts:

* a React client plugin adding a tab into Jupyter Lab left panel,
* a Python Jupyter notebook REST service consumed by the client and served at `/user/<username>/eodag/` (a home page is available at that URL).

The products search is based on the [eodag](https://eodag.readthedocs.io) library.

## Setup

```bash
pip install .
jupyter labextension install .
```

### Configuration

eodag configuration file should be localized at `.config/eodag/eodag.yaml` (see [eodag documentation](https://eodag.readthedocs.io/en/latest/intro.html?highlight=eodag.yml#how-to-configure-authentication-for-available-providers)).
Make sure that that file is configured properly.

## Run

```bash
jupyterhub
```

and browse http://localhost:8000

## Contributing

### Server notebook extension

```bash
npm install -g configurable-http-proxy

pip install -e .[dev]

# Enables extension: required if package installed in editable mode!
# --sys-prefix required if running into virtual env
jupyter serverextension enable --py eodag_labextension --sys-prefix

pre-commit install
```

### Client JupyterLab plugin

For a development install (requires npm version 4 or later), do the following in the repository directory:

With host computer run this in the repository:
```bash
npm install
npm run build
```

Create the container:
```bash
docker-compose up -d
```

Connect to the container with 
```bash
docker exec -ti [container_name] bash
```

Go to /plugin and connect eodag plugin:
```bash
jupyter labextension link .
```

On host computer to watch the change you're making:
```bash
npm run watch
```

To rebuild the package and the JupyterLab app:

```bash
npm run build
jupyter lab build
```


## Reference

[Distributing Jupyter Extensions as Python Packages](https://jupyter-notebook.readthedocs.io/en/latest/examples/Notebook/Distributing%20Jupyter%20Extensions%20as%20Python%20Packages.html#Distributing-Jupyter-Extensions-as-Python-Packages)
