# -*- coding: utf-8 -*-
# Copyright 2022 CS GROUP - France, http://www.c-s.fr
# All rights reserved

"""Tornado web requests handlers"""

import asyncio
import logging
import os
import re
import shutil
from functools import partial
from typing import Any

import orjson
import tornado
from eodag import EODataAccessGateway, SearchResult, setup_logging
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

from eodag_labextension.config import Settings

eodag_api = None

eodag_lock = tornado.locks.Lock()

logger = logging.getLogger("eodag-labextension.handlers")


if Settings().debug:
    setup_logging(3)


def set_conf_symlink(eodag_api):
    """Check and create eodag-config symlink to user conf directory"""
    try:
        userconf_env = os.getenv("EODAG_CFG_FILE")
        userconf_src = userconf_env or os.path.join(eodag_api.conf_dir, "eodag.yml")
        # check if exists
        if os.path.islink("eodag-config"):
            userdir_dst = os.readlink("eodag-config")
            if os.path.isdir(userdir_dst):
                userconf_dst = os.path.join(userdir_dst, "eodag.yml")
                if userconf_src == userconf_dst:
                    logger.debug("Re-using existing eodag-config symlink to user configuration")
                    return
        # remove existing
        if os.path.islink("eodag-config") or os.path.isfile("eodag-config"):
            logger.debug("remove existing eodag-config symlink")
            os.remove("eodag-config")
        if os.path.isdir("eodag-config"):
            logger.debug("remove existing eodag-config directory")
            shutil.rmtree("eodag-config")

        # create symlink
        if userconf_env:
            logger.debug(f"Creating eodag-config symlink to custom user configuration {userconf_env}")
            os.mkdir("eodag-config")
            os.symlink(userconf_env, os.path.join("eodag-config", "eodag.yml"))
        else:
            logger.debug("Creating eodag-config symlink to user configuration")
            os.symlink(eodag_api.conf_dir, "eodag-config")
    except OSError as err:
        logger.error("Could not create eodag-config symlink to user configuration: " + str(err))


async def get_eodag_api():
    """EODataAccessGateway on-demand instanciation"""
    global eodag_api

    current_loop = asyncio.get_running_loop()
    async with eodag_lock:
        if eodag_api is None:
            eodag_api = await current_loop.run_in_executor(None, EODataAccessGateway)
            set_conf_symlink(eodag_api)
        return eodag_api


class ProductTypeHandler(APIHandler):
    """Product type listing handler"""

    @tornado.web.authenticated
    async def get(self):
        """Get endpoint"""
        query_dict = parse_qs(self.request.query)

        provider = None
        if "provider" in query_dict and isinstance(query_dict["provider"], list) and len(query_dict["provider"]) > 0:
            provider = query_dict.pop("provider")[0]
        provider = None if not provider or provider == "null" else provider

        try:
            dag = await get_eodag_api()
            current_loop = asyncio.get_running_loop()
            product_types = await current_loop.run_in_executor(None, partial(dag.list_product_types, provider=provider))
        except UnsupportedProvider as e:
            self.set_status(400)
            self.finish({"error": str(e)})
            return

        self.finish(orjson.dumps(product_types))


class ReloadHandler(APIHandler):
    """EODAG API reload handler"""

    @tornado.web.authenticated
    async def get(self):
        """Get endpoint"""
        dag = await get_eodag_api()
        current_loop = asyncio.get_running_loop()
        async with eodag_lock:
            await current_loop.run_in_executor(None, dag.__init__)


class InfoHandler(APIHandler):
    """EODAG info handler"""

    @tornado.web.authenticated
    async def get(self):
        """Get endpoint"""
        current_loop = asyncio.get_running_loop()
        result = await current_loop.run_in_executor(None, lambda: Settings().model_dump())
        self.finish(orjson.dumps(result))


class ProvidersHandler(APIHandler):
    """Providers listing handler"""

    @tornado.web.authenticated
    async def get(self):
        """Get endpoint"""

        available_providers_kwargs = {}
        query_dict = parse_qs(self.request.query)

        dag = await get_eodag_api()

        if isinstance(pt_list := query_dict.get("product_type", []), list) and pt_list:
            try:
                available_providers_kwargs["product_type"] = dag.get_product_type_from_alias(pt_list[0])
            except NoMatchingProductType:
                available_providers_kwargs["product_type"] = pt_list[0]

        current_loop = asyncio.get_running_loop()
        available_providers = await current_loop.run_in_executor(
            None, partial(dag.available_providers, **available_providers_kwargs)
        )

        all_providers_list = [
            dict(
                provider=provider,
                priority=conf.priority,
                description=getattr(conf, "description", None),
                url=getattr(conf, "url", None),
            )
            for provider, conf in dag.providers_config.items()
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

        self.finish(orjson.dumps(returned_providers))


class GuessProductTypeHandler(APIHandler):
    """Guess product type method handler"""

    @tornado.web.authenticated
    async def get(self):
        """Get endpoint"""

        query_dict = parse_qs(self.request.query)

        provider = None
        if "provider" in query_dict and isinstance(query_dict["provider"], list) and len(query_dict["provider"]) > 0:
            provider = query_dict.pop("provider")[0]
        provider = None if not provider or provider == "null" else provider

        dag = await get_eodag_api()
        current_loop = asyncio.get_running_loop()

        returned_product_types = []
        try:
            # fetch all product types
            all_product_types = await current_loop.run_in_executor(
                None, partial(dag.list_product_types, provider=provider)
            )

            if (
                "keywords" in query_dict
                and isinstance(query_dict["keywords"], list)
                and len(query_dict["keywords"]) > 0
            ):
                # 1. List product types starting with given keywords
                first_keyword = query_dict["keywords"][0].lower()
                returned_product_types = [
                    {"ID": pt["ID"], "title": pt.get("title")}
                    for pt in all_product_types
                    if pt["ID"].lower().startswith(first_keyword)
                ]
                returned_product_types_ids = [pt["ID"] for pt in returned_product_types]

                # 2. List product types containing keyword
                returned_product_types += [
                    {"ID": pt["ID"], "title": pt.get("title")}
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
                guessed_ids_list = await current_loop.run_in_executor(
                    None, partial(dag.guess_product_type, **guess_kwargs)
                )
                # product types with full associated metadata
                returned_product_types += [
                    {"ID": pt["ID"], "title": pt.get("title")}
                    for pt in all_product_types
                    if pt["ID"] in guessed_ids_list and pt["ID"] not in returned_product_types_ids
                ]
            else:
                returned_product_types = [{"ID": pt["ID"], "title": pt.get("title")} for pt in all_product_types]

            self.finish(orjson.dumps(returned_product_types))
        except NoMatchingProductType:
            self.finish(orjson.dumps(returned_product_types))
        except UnsupportedProvider as e:
            self.set_status(400)
            self.finish({"error": str(e)})
            return


class SearchHandler(APIHandler):
    """Search products handler"""

    @tornado.web.authenticated
    async def post(self, product_type):
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
            dag = await get_eodag_api()
            current_loop = asyncio.get_running_loop()
            products = await current_loop.run_in_executor(
                None, partial(dag.search, productType=product_type, count=True, **arguments)
            )
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
    async def get(self):
        """Get endpoint"""
        query_dict = parse_qs(self.request.query, keep_blank_values=True)
        queryables_kwargs = {
            key: value[0].split(",") if "," in value[0] else value[0]
            for key, value in query_dict.items()
            if not key.isdigit()
        }
        logger.error(queryables_kwargs)
        try:
            dag = await get_eodag_api()
            current_loop = asyncio.get_running_loop()
            queryables_dict = await current_loop.run_in_executor(
                None, partial(dag.list_queryables, fetch_providers=False, **queryables_kwargs)
            )
            json_schema = queryables_dict.get_model().model_json_schema()
            self._remove_null_defaults(json_schema)
            json_schema["additionalProperties"] = queryables_dict.additional_properties
            self.finish(json_schema)
        except Exception as e:
            self.set_status(400)
            self.finish({"error": str(e)})

    def _remove_null_defaults(self, json_schema: Any):
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
    info_pattern = url_path_join(base_url, url_path, "info")
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
        (info_pattern, InfoHandler),
        (MethodAndPathMatch("POST", search_pattern), SearchHandler),
        (default_pattern, NotFoundHandler),
    ]
    web_app.add_handlers(host_pattern, handlers)
