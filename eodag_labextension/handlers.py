# -*- coding: utf-8 -*-
# Copyright 2021 CS GROUP - France, http://www.c-s.fr
# All rights reserved

"""Tornado web requests handlers"""

import json

import tornado
from eodag.api.core import DEFAULT_ITEMS_PER_PAGE
from eodag.rest.utils import get_home_page_content, get_product_types, get_templates_path, search_products
from eodag.utils.exceptions import AuthenticationError, UnsupportedProductType, ValidationError
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
    def post(self, product_type):
        """Post endpoint"""

        arguments = json.loads(self.request.body)

        try:
            response = search_products(product_type, arguments)
        except ValidationError as e:
            self.set_status(400)
            self.finish({"error": e.message})
            return
        except RuntimeError as e:
            self.set_status(400)
            self.finish({"error": e})
            return
        except UnsupportedProductType as e:
            self.set_status(404)
            self.finish({"error": "Not Found: {}".format(e.product_type)})
            return
        except AuthenticationError as e:
            self.set_status(403)
            self.finish({"error": f"AuthenticationError: Please check your credentials ({e})"})
            return
        except Exception as e:
            self.set_status(502)
            self.finish({"error": str(e)})
            return

        self.finish(response)


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
