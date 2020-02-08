# eodag-labextension

JupyterLab extension used to search remote sensed imagery from various image providers.

This extension is composed of to parts:

* a React client plugin adding a tab into Jupyter Lab left panel,
* a Python Jupyter notebook REST service consumed by the client and served at `/eodag/` or `/user/<username>/eodag/` for JupyterHub (a home page is available at that URL).

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
jupyter lab
# or
jupyterhub
```

and browse <http://localhost:8888> or <http://localhost:8000>.

*Adjust port number.*

## Contributing

```bash
npm install -g configurable-http-proxy

virtualenv -p `which python3.6` venv
venv/bin/activate
pip install -e .[dev]

# Enables extension: required if package installed in editable mode!
# --sys-prefix required if running into virtual env
jupyter serverextension enable --py eodag_labextension --sys-prefix

pre-commit install

# Into first terminal
jlpm run watch
# Into second terminal
jupyter lab --watch --no-browser --ip=0.0.0.0
```

then browse <http://localhost:8888>

Alternatively, plugin can be tested with JupyterHub with command `jupyterhub` at URL <http://localhost:8000>.

### Troubleshooting

On `jupyterhub` version upgrade and if `jupyterhub` command fails, it can be required to do a `jupyterhub upgrade-db`.

On build error, try running `npm prune && npm run clean && npm install`.

## Reference

[Distributing Jupyter Extensions as Python Packages](https://jupyter-notebook.readthedocs.io/en/latest/examples/Notebook/Distributing%20Jupyter%20Extensions%20as%20Python%20Packages.html#Distributing-Jupyter-Extensions-as-Python-Packages)
