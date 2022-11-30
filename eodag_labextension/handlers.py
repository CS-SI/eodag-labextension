# -*- coding: utf-8 -*-
# Copyright 2022 CS GROUP - France, http://www.c-s.fr
# All rights reserved

"""Tornado web requests handlers"""

import json
import re

import tornado
from eodag.rest.server import app, run_swagger, stac_api_config
from eodag.rest.utils import eodag_api, get_product_types, search_products
from eodag.utils import parse_qs
from eodag.utils.exceptions import AuthenticationError, NoMatchingProductType, UnsupportedProductType, ValidationError
from jupyter_server.base.handlers import APIHandler
from jupyter_server.utils import url_path_join
from tornado.web import FallbackHandler
from tornado.wsgi import WSGIContainer


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


class PrefixMiddleware(object):
    """Appends a prefix to the WSGI container around Flask app"""

    def __init__(self, app, prefix=""):
        """Class init method"""
        self.app = app
        self.prefix = prefix

    def __call__(self, environ, start_response):
        """Call method"""
        if environ["PATH_INFO"].startswith(self.prefix):
            environ["PATH_INFO"] = environ["PATH_INFO"][len(self.prefix) :]
            environ["SCRIPT_NAME"] = self.prefix
            return self.app(environ, start_response)
        else:
            start_response("404", [("Content-Type", "text/plain")])
            return ["This url does not belong to the app.".encode()]


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
    home_pattern = url_path_join(base_url, url_path, r"?/")
    eodag_serve_services_pattern = url_path_join(
        base_url, url_path, r"(api|service-doc.*|service-static.*|conformance|collections.*|search.*)"
    )
    product_types_pattern = url_path_join(base_url, url_path, "product-types")
    guess_product_types_pattern = url_path_join(base_url, url_path, "guess-product-type")
    search_pattern = url_path_join(base_url, url_path, r"(?P<product_type>[\w-]+)")

    # WSGI container around eodag-serve app
    app.wsgi_app = PrefixMiddleware(app.wsgi_app, prefix=url_path_join(base_url, url_path))
    eodag_serve_container = WSGIContainer(app)

    # flasgger conf update with url prefix
    stac_api_config["info"]["description"] = stac_api_config["info"]["description"].replace(
        "(/collections", "(/%s" % url_path_join(url_path, "collections")
    )
    stac_api_new_paths = {f"/{url_path}{path}": path_conf for path, path_conf in stac_api_config["paths"].items()}
    stac_api_config["paths"] = stac_api_new_paths

    # run flasgger doc
    run_swagger(app=app, config=stac_api_config, merge=True)

    # handlers added for each pattern
    handlers = [
        (home_pattern, FallbackHandler, dict(fallback=eodag_serve_container)),
        (eodag_serve_services_pattern, FallbackHandler, dict(fallback=eodag_serve_container)),
        (product_types_pattern, ProductTypeHandler),
        (guess_product_types_pattern, GuessProductTypeHandler),
        (MethodAndPathMatch("POST", search_pattern), SearchHandler),
        (MethodAndPathMatch("GET", search_pattern), FallbackHandler, dict(fallback=eodag_serve_container)),
    ]
    web_app.add_handlers(host_pattern, handlers)
