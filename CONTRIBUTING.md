# Contributing

## Prerequisites

- NodeJS
- Python version between 3.9 and 3.12 included (3.13 not yet supported)
- Cargo (Rust package manager)

## Development install

The `jlpm` command is JupyterLab's pinned version of
[yarn](https://yarnpkg.com/) that is installed with JupyterLab. You may use
`yarn` or `npm` in lieu of `jlpm` below.

```bash
# Clone the repo to your local environment
# Change directory to the eodag-labextension directory
# If you want to work in a virtual environment
virtualenv -p `which python3` venv
source venv/bin/activate
# Install package in development mode
pip install -r requirements-dev.txt
# Link your development version of the extension with JupyterLab
jlpm install
jupyter labextension develop . --overwrite
# Rebuild extension Typescript source after making changes
jlpm run build
# You need to enable the extension
jupyter server extension enable eodag_labextension
```

You can watch the source directory and run JupyterLab at the same time in
different terminals to watch for changes in the extension's source and
automatically rebuild the extension.

```bash
# Watch the source directory in one terminal
# automatically rebuilding when needed
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

You can set `EODAG_LABEXTENSION__DEBUG=true` environment variable to display EODAG
logging at `DEBUG` level.

## Commit

### Pre-commit

Before commiting run (need to be run only once):

```bash
pre-commit install
```

### Conventional Commit

This project uses the convention named "Conventional Commit". You can find more about it
on [conventionalcommits.org](https://www.conventionalcommits.org/en/v1.0.0/), and you must follow it.

Commit format :

```txt
<type>(<scope>): <message>
```

The scope is optional, you can find a simplier form:

```txt
<type>: <subject>
```

List of types: feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert

Example of commits:

- `feat: update EODAG to x.x.x`
- `fix: correct bug #x`
- `docs: add Y section to README`
