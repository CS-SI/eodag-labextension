# -*- coding: utf-8 -*-
# Copyright 2015-2017 CS Systemes d'Information (CS SI)
# All rights reserved
"""Jupyter Notebook server extension for eodag REST service"""

from notebook.base.handlers import IPythonHandler
from notebook.utils import url_path_join

__version__ = "0.1.0"


def _jupyter_server_extension_paths():
    return [{"module": "eodag_labextension"}]


class HelloWorldHandler(IPythonHandler):
    """HelloWorld test class"""

    def get(self):
        """A get test method"""
        self.finish("Hello, world!")


def load_jupyter_server_extension(nb_server_app):
    """
    Called when the extension is loaded.

    Args:
        nb_server_app (NotebookWebApplication): handle to the Notebook webserver instance.
    """

    # Printed into JupyterHub console logs
    nb_server_app.log.info("#" * 25)
    nb_server_app.log.info(f"{__package__} enabled!")
    nb_server_app.log.info("#" * 25)

    # XXX dummy service
    web_app = nb_server_app.web_app
    host_pattern = ".*$"
    route_pattern = url_path_join(web_app.settings["base_url"], "/hello")
    web_app.add_handlers(host_pattern, [(route_pattern, HelloWorldHandler)])
