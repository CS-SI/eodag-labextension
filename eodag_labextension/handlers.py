# -*- coding: utf-8 -*-
# Copyright 2022 CS GROUP - France, http://www.c-s.fr
# All rights reserved

"""Tornado web requests handlers"""

import json
import re

import tornado
from eodag.rest.utils import eodag_api, get_product_types, search_products
from eodag.utils import parse_qs
from eodag.utils.exceptions import AuthenticationError, NoMatchingProductType, UnsupportedProductType, ValidationError
from jupyter_server.base.handlers import APIHandler
from jupyter_server.utils import url_path_join


class ProductTypeHandler(APIHandler):
    """Product type listing handler

    .. note::

        Product types endpoint filtered by provider not implemented"""

    @tornado.web.authenticated
    def get(self):
        """Get endpoint"""

        self.write(json.dumps(get_product_types()))


class GuessProductTypeHandler(APIHandler):
    """Guess product type method handler"""

    @tornado.web.authenticated
    def get(self):
        """Get endpoint"""

        query_dict = parse_qs(self.request.query)
        guess_kwargs = {}

        # ["aa bb", "cc-dd_ee"] to "*aa* *bb* *cc* **dd* *ee*"
        for k, v in query_dict.items():
            guess_kwargs[k] = re.sub(r"(\S+)", r"*\1*", " ".join(v).replace("-", " ").replace("_", " "))

        try:
            # guessed product types ids
            guessed_ids_list = eodag_api.guess_product_type(**guess_kwargs)
            # product types with full associated metadata
            guessed_list = [
                dict({"ID": k}, **v) for k, v in eodag_api.product_types_config.source.items() if k in guessed_ids_list
            ]

            self.write(json.dumps(guessed_list))
        except NoMatchingProductType:
            self.write(json.dumps([]))


class SearchHandler(APIHandler):
    """Search products handler"""

    @tornado.web.authenticated
    def post(self, product_type):
        """Post endpoint"""

        arguments = json.loads(self.request.body)

        # move geom to intersects parameter
        geom = arguments.pop("geom", None)
        if geom:
            arguments["intersects"] = geom

        try:
            response = search_products(product_type, arguments, stac_formatted=False)
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


class MethodAndPathMatch(tornado.routing.PathMatches):
    """Wrapper around `tornado.routing.PathMatches` adding http method matching"""

    def __init__(self, method, path_pattern):
        """Class init method"""
        super().__init__(path_pattern)
        self.method = method

    def match(self, request):
        """Wrapper around `PathMatches.match` method"""
        if request.method != self.method:
            return None

        return super().match(request)


def setup_handlers(web_app, url_path):
    """Configure the routes of web_app"""

    # Prepend the base_url so that it works in a JupyterHub setting
    base_url = web_app.settings["base_url"]

    # matching patterns
    host_pattern = ".*$"
    product_types_pattern = url_path_join(base_url, url_path, "product-types")
    guess_product_types_pattern = url_path_join(base_url, url_path, "guess-product-type")
    search_pattern = url_path_join(base_url, url_path, r"(?P<product_type>[\w-]+)")

    # handlers added for each pattern
    handlers = [
        (product_types_pattern, ProductTypeHandler),
        (guess_product_types_pattern, GuessProductTypeHandler),
        (MethodAndPathMatch("POST", search_pattern), SearchHandler),
    ]
    web_app.add_handlers(host_pattern, handlers)
