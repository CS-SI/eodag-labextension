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

To be able to access path to eodag configuration file into environment, activate following setting into jupyterhub_config.py file:
```python
c.Spawner.env_keep = ['PATH', 'PYTHONPATH', 'CONDA_ROOT', 'CONDA_DEFAULT_ENV', 'VIRTUAL_ENV', 'LANG', 'LC_ALL', 'EODAG_CFG_FILE']
```

and add into yout bashrc:

```bash
export EODAG_CFG_FILE=path_to_eodag_cfg_file
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
