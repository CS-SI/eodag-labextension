# -*- coding: utf-8 -*-
# Copyright 2015-2017 CS Systemes d'Information (CS SI)
# All rights reserved
"""Jupyter Notebook server extension for eodag REST service"""

from eodag.rest.utils import get_home_page_content, get_templates_path
from notebook.base.handlers import IPythonHandler
from notebook.utils import url_path_join
from tornado import web

__version__ = "0.1.0"


def _jupyter_server_extension_paths():
    return [{"module": "eodag_labextension"}]


class EodagHandler(IPythonHandler):
    """HelloWorld test class"""

    @web.authenticated
    def get(self, cluster_id: str = "") -> None:
        """A get test method"""

        # Update templates_path for Jinja FileSystemLoader
        jinja_env = self.settings["jinja2_env"]
        for loader in jinja_env.loader.loaders:
            if hasattr(loader, "searchpath"):
                loader.searchpath.append(get_templates_path())

        base_url = "http://localhost/"
        self.write(
            self.render_template("index.html", content=get_home_page_content(base_url))
        )


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
    route_pattern = url_path_join(web_app.settings["base_url"], "/eodag")
    web_app.add_handlers(host_pattern, [(route_pattern, EodagHandler)])
