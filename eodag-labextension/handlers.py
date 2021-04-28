# -*- coding: utf-8 -*-
# Copyright 2020 CS GROUP - France, http://www.c-s.fr
# All rights reserved

"""Tornado web requests handlers"""

import json

import tornado
from eodag.api.core import DEFAULT_ITEMS_PER_PAGE
from eodag.rest.utils import get_home_page_content, get_product_types, get_templates_path, search_products
from eodag.utils.exceptions import UnsupportedProductType, ValidationError
from jinja2.loaders import ChoiceLoader, FileSystemLoader
from jupyter_server.base.handlers import APIHandler
from jupyter_server.utils import url_path_join
from notebook.base.handlers import IPythonHandler


class RootHandler(IPythonHandler):
    """Home page request handler return HTML page"""

    # The following decorator should be present on all verb methods (head, get, post,
    # patch, put, delete, options) to ensure only authorized user can request the
    # Jupyter server
    @tornado.web.authenticated
    def get(self):
        """Get endpoint"""
        # Update templates_path for Jinja FileSystemLoader
        jinja_env = self.settings["jinja2_env"]
        if hasattr(jinja_env.loader, "searchpath"):
            jinja_env.loader.searchpath.append(get_templates_path())
        else:
            if isinstance(jinja_env.loader, ChoiceLoader):
                fs_loader = FileSystemLoader(get_templates_path())
                jinja_env.loader.loaders.append(fs_loader)

        r = self.request
        base_url = f"{r.protocol}://{r.host}{r.path}"
        self.write(
            self.render_template(
                "index.html",
                content=get_home_page_content(base_url, DEFAULT_ITEMS_PER_PAGE),
            )
        )


class ProductTypeHandler(APIHandler):
    """Product type listing handler

    .. note::

        Product types endpoint filtered by provider not implemented"""

    @tornado.web.authenticated
    def get(self):
        """Get endpoint"""

        self.write(json.dumps(get_product_types()))


class SearchHandler(APIHandler):
    """Search products handler"""

    @tornado.web.authenticated
    def get(self, product_type):
        """Get endpoint"""

        # Transform dict values from list with unique element to string
        arguments = {k: v[0].decode() for k, v in self.request.arguments.items()}

        try:
            response = search_products(product_type, arguments)
        except ValidationError as e:
            self.set_status(400)
            self.write({"error": e.message})
            return
        except RuntimeError as e:
            self.set_status(400)
            self.write({"error": e})
            return
        except UnsupportedProductType as e:
            self.set_status(404)
            self.write({"error": "Not Found: {}".format(e.product_type)})
            return

        self.write(response)


def setup_handlers(web_app, url_path):
    """Configure the routes of web_app"""
    host_pattern = ".*$"

    base_url = web_app.settings["base_url"]
    # Prepend the base_url so that it works in a JupyterHub setting
    home_pattern = url_path_join(base_url, url_path)
    product_types_pattern = url_path_join(base_url, url_path, "product-types")
    search_pattern = url_path_join(base_url, url_path, r"(?P<product_type>[\w-]+)")
    handlers = [
        (home_pattern, RootHandler),
        (product_types_pattern, ProductTypeHandler),
        (search_pattern, SearchHandler),
    ]
    web_app.add_handlers(host_pattern, handlers)
