# -*- coding: utf-8 -*-
# Copyright 2022 CS GROUP - France, http://www.c-s.fr
# All rights reserved

"""Tornado web requests handlers"""

import logging
import re

import orjson
import tornado
from eodag import EODataAccessGateway, SearchResult
from eodag.api.core import DEFAULT_ITEMS_PER_PAGE, DEFAULT_PAGE
from eodag.utils import parse_qs
from eodag.utils.exceptions import (
    AuthenticationError,
    NoMatchingProductType,
    UnsupportedProductType,
    UnsupportedProvider,
    ValidationError,
)
from eodag.utils.rest import get_datetime
from jupyter_server.base.handlers import APIHandler
from jupyter_server.utils import url_path_join
from shapely.geometry import shape

eodag_api = EODataAccessGateway()

logger = logging.getLogger("eodag-labextension.handlers")


class ProductTypeHandler(APIHandler):
    """Product type listing handler"""

    @tornado.web.authenticated
    def get(self):
        """Get endpoint"""
        query_dict = parse_qs(self.request.query)

        provider = None
        if "provider" in query_dict and isinstance(query_dict["provider"], list) and len(query_dict["provider"]) > 0:
            provider = query_dict.pop("provider")[0]
        provider = None if not provider or provider == "null" else provider

        try:
            product_types = eodag_api.list_product_types(provider=provider)
        except UnsupportedProvider as e:
            self.set_status(400)
            self.finish({"error": str(e)})
            return

        self.write(orjson.dumps(product_types))


class ReloadHandler(APIHandler):
    """EODAG API reload handler"""

    @tornado.web.authenticated
    def get(self):
        """Get endpoint"""
        eodag_api.__init__()


class ProvidersHandler(APIHandler):
    """Providers listing handler"""

    @tornado.web.authenticated
    def get(self):
        """Get endpoint"""

        available_providers_kwargs = {}
        query_dict = parse_qs(self.request.query)
        if (
            "product_type" in query_dict
            and isinstance(query_dict["product_type"], list)
            and len(query_dict["product_type"]) > 0
        ):
            available_providers_kwargs["product_type"] = query_dict["product_type"][0]
        available_providers = eodag_api.available_providers(**available_providers_kwargs)

        all_providers_list = [
            dict(
                provider=provider,
                priority=conf.priority,
                description=getattr(conf, "description", None),
                url=getattr(conf, "url", None),
            )
            for provider, conf in eodag_api.providers_config.items()
            if provider in available_providers
        ]
        all_providers_list.sort(key=lambda x: (x["priority"] * -1, x["provider"]))

        returned_providers = []
        if "keywords" in query_dict and isinstance(query_dict["keywords"], list) and len(query_dict["keywords"]) > 0:
            # 1. List providers starting with given keyword
            first_keyword = query_dict["keywords"][0].lower()
            returned_providers = [p for p in all_providers_list if p["provider"].lower().startswith(first_keyword)]
            providers_ids = [p["provider"] for p in returned_providers]

            # 2. List providers containing given keyword
            returned_providers += [
                p
                for p in all_providers_list
                if first_keyword in p["provider"].lower() and p["provider"] not in providers_ids
            ]
            providers_ids = [p["provider"] for p in returned_providers]

            # 3. List providers containing given keyword in decription
            returned_providers += [
                p
                for p in all_providers_list
                if first_keyword in (p["description"] or "").lower() and p["provider"] not in providers_ids
            ]
        else:
            returned_providers = all_providers_list

        self.write(orjson.dumps(returned_providers))


class GuessProductTypeHandler(APIHandler):
    """Guess product type method handler"""

    @tornado.web.authenticated
    def get(self):
        """Get endpoint"""

        query_dict = parse_qs(self.request.query)

        provider = None
        if "provider" in query_dict and isinstance(query_dict["provider"], list) and len(query_dict["provider"]) > 0:
            provider = query_dict.pop("provider")[0]
        provider = None if not provider or provider == "null" else provider

        returned_product_types = []
        try:
            # fetch all product types
            all_product_types = eodag_api.list_product_types(provider=provider)

            if (
                "keywords" in query_dict
                and isinstance(query_dict["keywords"], list)
                and len(query_dict["keywords"]) > 0
            ):
                # 1. List product types starting with given keywords
                first_keyword = query_dict["keywords"][0].lower()
                returned_product_types = [pt for pt in all_product_types if pt["ID"].lower().startswith(first_keyword)]
                returned_product_types_ids = [pt["ID"] for pt in returned_product_types]

                # 2. List product types containing keyword
                returned_product_types += [
                    pt
                    for pt in all_product_types
                    if first_keyword in pt["ID"].lower() and pt["ID"] not in returned_product_types_ids
                ]
                returned_product_types_ids += [pt["ID"] for pt in returned_product_types]

                # 3. Append guessed product types
                guess_kwargs = {}
                # ["aa bb", "cc-dd_ee"] to "*aa* AND *bb* AND *cc-dd_ee*"
                for k, v in query_dict.items():
                    guess_kwargs[k] = " AND ".join(re.sub(r"(\S+)", r"*\1*", " ".join(v)).split(" "))

                # guessed product types ids
                guessed_ids_list = eodag_api.guess_product_type(**guess_kwargs)
                # product types with full associated metadata
                returned_product_types += [
                    pt
                    for pt in all_product_types
                    if pt["ID"] in guessed_ids_list and pt["ID"] not in returned_product_types_ids
                ]
            else:
                returned_product_types = all_product_types

            self.write(orjson.dumps(returned_product_types))
        except NoMatchingProductType:
            self.write(orjson.dumps(returned_product_types))
        except UnsupportedProvider as e:
            self.set_status(400)
            self.finish({"error": str(e)})
            return


class SearchHandler(APIHandler):
    """Search products handler"""

    @tornado.web.authenticated
    def post(self, product_type):
        """Post endpoint"""

        arguments = orjson.loads(self.request.body)

        # geom
        geom = arguments.pop("geom", None)
        try:
            arguments["geom"] = shape(geom) if geom else None
        except Exception:
            self.set_status(400)
            self.finish({"error": f"Invalid geometry: {str(geom)}"})
            return

        # dates
        try:
            arguments["start"], arguments["end"] = get_datetime(arguments)
        except ValidationError as e:
            self.set_status(400)
            self.finish({"error": str(e)})
            return

        # provider
        provider = arguments.pop("provider", None)
        if provider and provider != "null":
            arguments["provider"] = provider
            # only raise error if provider selected, if not enable search fallback
            arguments["raise_errors"] = True

        # We remove potential None values to use the default values of the search method
        arguments = dict((k, v) for k, v in arguments.items() if v is not None)

        try:
            products = eodag_api.search(productType=product_type, count=True, **arguments)
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

        response = SearchResult(products).as_geojson_object()
        response.update(
            {
                "properties": {
                    "page": int(arguments.get("page", DEFAULT_PAGE)),
                    "itemsPerPage": DEFAULT_ITEMS_PER_PAGE,
                    "totalResults": products.number_matched,
                }
            }
        )

        self.finish(response)


class NotFoundHandler(APIHandler):
    """Not found handler"""

    @tornado.web.authenticated
    def post(self):
        """Post endpoint"""
        self.set_status(404)
        self.finish({"error": f"No matching handler for {self.request.uri}"})

    @tornado.web.authenticated
    def get(self):
        """Get endpoint"""
        self.set_status(404)
        self.finish({"error": f"No matching handler for {self.request.uri}"})


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


class QueryablesHandler(APIHandler):
    """EODAG queryables handler"""

    @tornado.web.authenticated
    def get(self):
        """Get endpoint"""
        query_dict = parse_qs(self.request.query)

        queryables_kwargs = {key: value[0] for key, value in query_dict.items()}
        queryables_dict = eodag_api.list_queryables(**queryables_kwargs)
        json_schema = queryables_dict.get_model().model_json_schema()
        self._remove_null_defaults(json_schema)
        json_schema["additionalProperties"] = queryables_dict.additional_properties
        self.finish(json_schema)

    def _remove_null_defaults(self, json_schema):
        for item in json_schema["properties"].values():
            if item.get("default") is None:
                item.pop("default", None)


def setup_handlers(web_app, url_path):
    """Configure the routes of web_app"""

    # Prepend the base_url so that it works in a JupyterHub setting
    base_url = web_app.settings["base_url"]

    # matching patterns
    host_pattern = r".*$"
    product_types_pattern = url_path_join(base_url, url_path, "product-types")
    reload_pattern = url_path_join(base_url, url_path, "reload")
    providers_pattern = url_path_join(base_url, url_path, "providers")
    guess_product_types_pattern = url_path_join(base_url, url_path, "guess-product-type")
    queryables_pattern = url_path_join(base_url, url_path, "queryables")
    search_pattern = url_path_join(base_url, url_path, r"(?P<product_type>[\w\-\.]+)")
    default_pattern = url_path_join(base_url, url_path, r".*")

    # handlers added for each pattern
    handlers = [
        (product_types_pattern, ProductTypeHandler),
        (reload_pattern, ReloadHandler),
        (providers_pattern, ProvidersHandler),
        (guess_product_types_pattern, GuessProductTypeHandler),
        (queryables_pattern, QueryablesHandler),
        (MethodAndPathMatch("POST", search_pattern), SearchHandler),
        (default_pattern, NotFoundHandler),
    ]
    web_app.add_handlers(host_pattern, handlers)
