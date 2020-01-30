# eodag-labextension

JupyterLab extension used to search remote sensed imagery from various image providers.

This extension is composed of to parts:

* a React client plugin adding a tab into Jupyter Lab left panel,
* a Python Jupyter notebook REST service consumed by the client and served at `/user/<username>/eodag/` (a home page is available at that URL).

The products search is based on the [eodag](https://eodag.readthedocs.io) library.

## Setup

```bash
pip install .
yarn install # or npm install
jupyter labextension install .
```

### Configuration

eodag configuration file should be localized at `.config/eodag/eodag.yaml` (see [eodag documentation](https://eodag.readthedocs.io/en/latest/intro.html?highlight=eodag.yml#how-to-configure-authentication-for-available-providers)).
Make sure that that file is configured properly.

## Run

```bash
jupyterhub
```

and browse <http://localhost:8000>

## Contributing

### Server notebook extension

```bash
npm install -g configurable-http-proxy

virtualenv -p `which python3.6` venv
venv/bin/activate
pip install -e .[dev]

# Enables extension: required if package installed in editable mode!
# --sys-prefix required if running into virtual env
jupyter serverextension enable --py eodag_labextension --sys-prefix

pre-commit install
```

#### Troubleshooting

On `jupyterhub` version upgrade and if `jupyterhub` command fails, it can be required to do a `jupyterhub upgrade-db`.

On build error, try running `npm prune && npm run clean && npm install`.

### Client JupyterLab plugin

Link to repository [Eodag Plugin](https://odin.si.c-s.fr/plugins/git/ia3d-demo/eodag-labextension)
For a development install (requires npm version 4 or later), do the following in the repository directory:

Create the container:

```bash
docker-compose up -d
```

Connect to the container with

```bash
docker exec -ti [container_name] bash
```

Then install eodag plugin:

```bash
cd /plugin
jlpm install
jupyter labextension install . --no-build
jupyter labextension link .
jupyter labextension list
jlpm run watch
```

List result should be like this:

```bash
JupyterLab v0.35.6
Known labextensions:
   app dir: /usr/local/share/jupyter/lab
        eodag-labextension v0.1.0  enabled  OK*

   local extensions:
        eodag-labextension: /plugin
```

Once you finished this installation you can watch docker's logs

```bash
docker-compose logs -f
```

Finally when you develop eodag plugin just run this to watch changes:

```bash
cd /plugin
jlpm run watch
```

## Launch Jupyter with eodag & watch

### First install

1. `cd <your-extension-repository>`
2. `docker-compose -f docker-compose.yml up -d`
3. `sudo docker exec -ti jupyterlab bash`
4. `cd /plugin/`
5. `pip install jupyterlab`
6. `pip install .`
7. `jupyter labextension install .`
8. `jupyter lab --allow-root --watch --no-browser --ip=0.0.0.0`
9. Set a new password for jupyter user :
10. `docker exec -ti jupyterlab passwd jupyter`
11. Open [http://localhost:8000/](http://localhost:8000/)  and connect yourself

#### Second console

1. `sudo docker exec -ti jupyterlab bash`
2. `cd /plugin/`
3. `jlpm run watch`

### Relaunch (already installed)

1. `docker-compose -f docker-compose.yml up -d`
2. In two different console : `sudo docker exec -ti jupyterlab bash`
3. Then in both console `cd /plugin/`
     1. Console 1 `jlpm run watch`
     2. Console 2 `jupyter lab --allow-root --watch --no-browser --ip=0.0.0.0`
4. Open [http://localhost:8000/](http://localhost:8000/) and connect yourself

## Reference

[Distributing Jupyter Extensions as Python Packages](https://jupyter-notebook.readthedocs.io/en/latest/examples/Notebook/Distributing%20Jupyter%20Extensions%20as%20Python%20Packages.html#Distributing-Jupyter-Extensions-as-Python-Packages)
