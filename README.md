# eodag-labextension

![Github Actions Status](https://odin.si.c-s.fr/plugins/git/ia3d-demo/eodag-labextension.git/workflows/Build/badge.svg)
[![Code style: black](https://img.shields.io/badge/code%20style-black-000000.svg)](https://github.com/psf/black)

Searching remote sensed imagery from various image providers

This extension is composed of a Python package named `eodag-labextension`
for the server extension and a NPM package named `eodag-labextension`
for the frontend extension.

- Frontend extension consist in adding a tab into Jupyter Lab left panel.
- Backend extension consist of a Python Jupyter notebook REST service consumed
  by the client and served at `/eodag/` or `/user/<username>/eodag/` for
  JupyterHub (a home page is available at that URL).

The products search is based on the [eodag](https://eodag.readthedocs.io) library.

## Requirements

- JupyterLab >= 3.0

## Install

```bash
pip install eodag-labextension
```

### Configuration

eodag configuration file should be localized at `.config/eodag/eodag.yaml` (see [eodag documentation](https://eodag.readthedocs.io/en/latest/intro.html?highlight=eodag.yml#how-to-configure-authentication-for-available-providers)).
Make sure that that file is configured properly.

## Troubleshoot

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

## Contributing

### Development install

Note: You will need NodeJS to build the extension package.

The `jlpm` command is JupyterLab's pinned version of
[yarn](https://yarnpkg.com/) that is installed with JupyterLab. You may use
`yarn` or `npm` in lieu of `jlpm` below.

```bash
# Clone the repo to your local environment
# Change directory to the eodag-labextension directory
# If you want to work in a virtual environment
virtualenv -p `which python3.6` venv
venv/bin/activate
# Install package in development mode
pip install -e .[dev]
# Link your development version of the extension with JupyterLab
jupyter labextension develop . --overwrite
# Rebuild extension Typescript source after making changes
jlpm run build
```

You can watch the source directory and run JupyterLab at the same time in
different terminals to watch for changes in the extension's source and
automatically rebuild the extension.

```bash
# Watch the source directory in one terminal, automatically rebuilding when
# needed
jlpm run watch
# Run JupyterLab in another terminal
jupyter lab
```

With the watch command running, every saved change will immediately be built
locally and available in your running JupyterLab. Refresh JupyterLab to load
the change in your browser (you may need to wait several seconds for the
extension to be rebuilt).

By default, the `jlpm run build` command generates the source maps for this
extension to make it easier to debug using the browser dev tools. To also
generate source maps for the JupyterLab core extensions, you can run the
following command:

```bash
jupyter lab build --minimize=False
```

### Commit

Before commiting run (need to be run only once):

```bash
pre-commit install
```

### Uninstall

```bash
pip uninstall eodag-labextension
```

_Copyright 2020 CS GROUP - France
All rights reserved_
