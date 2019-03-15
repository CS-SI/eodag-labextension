# -*- coding: utf-8 -*-
# Copyright 2015-2017 CS Systemes d'Information (CS SI)
# All rights reserved

from notebook.utils import url_path_join
from notebook.base.handlers import IPythonHandler


__version__ = "0.1.0"


def _jupyter_server_extension_paths():
    return [{"module": "eodag_labextension"}]


class HelloWorldHandler(IPythonHandler):
    def get(self):
        self.finish("Hello, world!")


def load_jupyter_server_extension(nb_server_app):
    """
    Called when the extension is loaded.

    Args:
        nb_server_app (NotebookWebApplication): handle to the Notebook webserver instance.
    """

    # XXX Printed into JupyterHub console logs
    nb_server_app.log.info("my module enabled!")
    nb_server_app.log.info(100 * "#")

    # XXX dummy service
    web_app = nb_server_app.web_app
    host_pattern = ".*$"
    route_pattern = url_path_join(web_app.settings["base_url"], "/hello")
    web_app.add_handlers(host_pattern, [(route_pattern, HelloWorldHandler)])
