# eodag-nbextension

## Setup

See [Distributing Jupyter Extensions as Python Packages](https://jupyter-notebook.readthedocs.io/en/latest/examples/Notebook/Distributing%20Jupyter%20Extensions%20as%20Python%20Packages.html#Distributing-Jupyter-Extensions-as-Python-Packages)

```bash
# For development
npm install -g configurable-http-proxy

# FIXME install from setup.py
pip install -r requirements.txt
pip install -e .

# Enables extension
# --sys-prefix if running into virtual env
jupyter serverextension enable --py eodag_nbextension --sys-prefix
```

## Run

```bash
jupyterhub
```

and browse http://localhost:8000
