# eodag-labextension

## Setup

See [Distributing Jupyter Extensions as Python Packages](https://jupyter-notebook.readthedocs.io/en/latest/examples/Notebook/Distributing%20Jupyter%20Extensions%20as%20Python%20Packages.html#Distributing-Jupyter-Extensions-as-Python-Packages)

```bash
# For development
npm install -g configurable-http-proxy

# FIXME install from setup.py
pip install -r requirements.txt
pip install -e .

# Enables extension: required if package installed in editable mode!
# --sys-prefix if running into virtual env
jupyter serverextension enable --py eodag_labextension --sys-prefix
```

## Run

```bash
jupyterhub
```

and browse http://localhost:8000

## Contributing

```bash
pre-commit install
```
