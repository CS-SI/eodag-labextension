# -*- coding: utf-8 -*-
# Copyright 2020 CS GROUP - France, http://www.c-s.fr
# All rights reserved

"""Tornado web requests handlers"""

import json

from eodag.api.core import DEFAULT_ITEMS_PER_PAGE
from eodag.rest.utils import (
    get_home_page_content,
    get_templates_path,
    get_product_types,
    search_products,
)
from eodag.utils.exceptions import ValidationError, UnsupportedProductType
from jinja2.loaders import ChoiceLoader, FileSystemLoader
from notebook.base.handlers import IPythonHandler, APIHandler
from tornado import web

class RootHandler(IPythonHandler):
    """Home page request handler return HTML page"""

    @web.authenticated
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

    @web.authenticated
    def get(self):
        """Get endpoint"""

        self.write(json.dumps(get_product_types()))


class SearchHandler(APIHandler):
    """Search products handler"""

    @web.authenticated
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
