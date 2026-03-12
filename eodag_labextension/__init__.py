# -*- coding: utf-8 -*-
# Copyright 2022 CS GROUP - France, http://www.c-s.fr
# All rights reserved

"""Jupyter Notebook server extension for eodag REST service"""

from ._version import __version__  # noqa: F401
from .handlers import setup_handlers


def _jupyter_labextension_paths():
    return [{"src": "labextension", "dest": "eodag-labextension"}]


def _jupyter_server_extension_points():
    return [{"module": "eodag_labextension"}]


def _load_jupyter_server_extension(server_app):
    """Registers the API handler to receive HTTP requests from the frontend extension.

    Parameters
    ----------
    server_app: jupyterlab.labapp.LabApp
        JupyterLab application instance
    """
    url_path = "eodag"
    setup_handlers(server_app.web_app, url_path)
    server_app.log.info(f"Registered eodag_labextension extension at URL path /{url_path}")


# For backward compatibility with the classical notebook
load_jupyter_server_extension = _load_jupyter_server_extension
