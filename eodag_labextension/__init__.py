# -*- coding: utf-8 -*-
# Copyright 2019 CS Systemes d'Information (CS SI)
# All rights reserved
"""Jupyter Notebook server extension for eodag REST service"""

from eodag_labextension.handlers import RootHandler, ProductTypeHandler, SearchHandler
from notebook.utils import url_path_join


def _jupyter_server_extension_paths():
    return [{"module": "eodag_labextension"}]


def load_jupyter_server_extension(nb_server_app):
    """
    Called when the extension is loaded.

    Args:
        nb_server_app (NotebookWebApplication): handle to the Notebook webserver instance.
    """

    # Printed into JupyterHub console logs
    log = f"[{__package__}] jupyter lab extension enabled"
    nb_server_app.log.info(log)

    web_app = nb_server_app.web_app
    host_pattern = ".*$"
    home_pattern = url_path_join(web_app.settings["base_url"], "/eodag/")
    nb_server_app.log.info(
        f"[{__package__}] eodag service starting at '{home_pattern}'"
    )

    product_types_pattern = url_path_join(
        web_app.settings["base_url"], "/eodag/product-types/"
    )
    search_pattern = url_path_join(
        web_app.settings["base_url"], "/eodag/" + r"(?P<product_type>[\w-]+)/"
    )

    handlers_list = [
        (home_pattern, RootHandler),
        (product_types_pattern, ProductTypeHandler),
        (search_pattern, SearchHandler),
    ]

    web_app.add_handlers(host_pattern, handlers_list)
