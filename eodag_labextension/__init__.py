# -*- coding: utf-8 -*-
# Copyright 2015-2017 CS Systemes d'Information (CS SI)
# All rights reserved
"""Jupyter Notebook server extension for eodag REST service"""
import json

from eodag.rest.utils import (
    get_home_page_content,
    get_templates_path,
    get_product_types,
)
from notebook.base.handlers import IPythonHandler, APIHandler
from notebook.utils import url_path_join
from tornado import web

__version__ = "0.1.0"


def _jupyter_server_extension_paths():
    return [{"module": "eodag_labextension"}]


class RootHandler(IPythonHandler):
    """Home page request handler return HTML page"""

    @web.authenticated
    def get(self, cluster_id: str = "") -> None:
        """Get endpoint"""

        # Update templates_path for Jinja FileSystemLoader
        jinja_env = self.settings["jinja2_env"]
        for loader in jinja_env.loader.loaders:
            if hasattr(loader, "searchpath"):
                loader.searchpath.append(get_templates_path())

        r = self.request
        base_url = f"{r.protocol}://{r.host}{r.path}/"
        self.write(
            self.render_template("index.html", content=get_home_page_content(base_url))
        )


class ProductTypeHandler(APIHandler):
    """Product type listing handler"""

    @web.authenticated
    def get(self, cluster_id: str = "") -> None:
        """Get endpoint"""

        self.write(json.dumps(get_product_types()))


def load_jupyter_server_extension(nb_server_app):
    """
    Called when the extension is loaded.

    Args:
        nb_server_app (NotebookWebApplication): handle to the Notebook webserver instance.
    """

    # Printed into JupyterHub console logs
    log = f"{__package__} enabled!"
    nb_server_app.log.info("#" * len(log))
    nb_server_app.log.info(log)
    nb_server_app.log.info("#" * len(log))

    web_app = nb_server_app.web_app
    host_pattern = ".*$"
    home_pattern = url_path_join(web_app.settings["base_url"], "/eodag")
    product_types_pattern = url_path_join(
        web_app.settings["base_url"], "/eodag/product-types"
    )

    handlers = [
        (home_pattern, RootHandler),
        (product_types_pattern, ProductTypeHandler),
    ]

    web_app.add_handlers(host_pattern, handlers)
