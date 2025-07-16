# -*- coding: utf-8 -*-
# Copyright 2022 CS GROUP - France, http://www.c-s.fr
# All rights reserved

"""Tornado web requests handlers"""

import asyncio
import logging
import os
import re
import shutil
import traceback
from functools import partial
from typing import Any

import orjson
import tornado
from dotenv import dotenv_values
from eodag import EODataAccessGateway, SearchResult, setup_logging
from eodag.api.core import DEFAULT_ITEMS_PER_PAGE, DEFAULT_PAGE
from eodag.utils import parse_qs
from eodag.utils.exceptions import (
    AuthenticationError,
    MisconfiguredError,
    NoMatchingProductType,
    NotAvailableError,
    RequestError,
    TimeOutError,
    UnsupportedProductType,
    UnsupportedProvider,
    ValidationError,
)
from eodag.utils.rest import get_datetime
from importlib_metadata import PackageNotFoundError, version
from jupyter_server.base.handlers import APIHandler
from jupyter_server.utils import url_path_join
from shapely.geometry import shape

from eodag_labextension.config import Settings

eodag_api = None
dotenv_vars = None

eodag_lock = tornado.locks.Lock()

results_iterator = None

logger = logging.getLogger("eodag-labextension.handlers")


if Settings().debug:
    setup_logging(3)


def exception_handler(func):
    """Decorator to handle exceptions in Tornado handlers"""

    async def inner_function(handler, *args, **kwargs):
        try:
            return await func(handler, *args, **kwargs)
        except (
            ValidationError,
            UnsupportedProvider,
            UnsupportedProductType,
            RequestError,
            RuntimeError,
            MisconfiguredError,
        ) as e:
            tb = traceback.format_exc()
            handler.set_status(400)
            handler.finish({"error": str(e), "details": tb})
            logger.error(tb)
            return
        except (NotAvailableError, NoMatchingProductType) as e:
            tb = traceback.format_exc()
            handler.set_status(404)
            handler.finish({"error": str(e), "details": tb})
            logger.error(tb)
            return
        except AuthenticationError as e:
            tb = traceback.format_exc()
            handler.set_status(403)
            handler.finish({"error": f"AuthenticationError: Please check your credentials ({e})", "details": tb})
            logger.error(tb)
            return
        except TimeOutError as e:
            tb = traceback.format_exc()
            handler.set_status(504)
            handler.finish({"error": str(e), "details": tb})
            logger.error(tb)
            return
        except Exception as e:
            tb = traceback.format_exc()
            handler.set_status(500)
            handler.finish({"error": str(e), "details": tb})
            logger.error(tb)
            return

    return inner_function


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


def load_dotenv():
    """Load EODAG environment variables from .env file and update os.environ."""
    global dotenv_vars

    env_path = os.path.join(os.getcwd(), ".env")
    eodag_env_vars = None
    if os.path.isfile(env_path):
        logger.debug(f"Loading environment variables from {env_path}")
        env_vars = dotenv_values(env_path)
        eodag_env_vars = {key: value for key, value in env_vars.items() if key.startswith("EODAG_")}
        os.environ.update(eodag_env_vars)
    else:
        logger.debug(f"No .env file found at {env_path}, skipping loading environment variables.")

    # remove vars previously set
    for v in dotenv_vars or {}:
        if eodag_env_vars is None or v not in eodag_env_vars:
            logger.debug(f"Removing {v} from os.environ")
            os.environ.pop(v, None)
    dotenv_vars = eodag_env_vars


async def get_eodag_api():
    """EODataAccessGateway on-demand instanciation"""
    global eodag_api

    current_loop = asyncio.get_running_loop()
    async with eodag_lock:
        if eodag_api is None:
            load_dotenv()
            eodag_api = await current_loop.run_in_executor(None, EODataAccessGateway)
            set_conf_symlink(eodag_api)
        return eodag_api


class ProductTypeHandler(APIHandler):
    """Product type listing handler"""

    @exception_handler
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
        product_types = await current_loop.run_in_executor(None, partial(dag.list_product_types, provider=provider))

        self.finish(orjson.dumps(product_types))


class ReloadHandler(APIHandler):
    """EODAG API reload handler"""

    @exception_handler
    @tornado.web.authenticated
    async def get(self):
        """Get endpoint"""
        global eodag_api
        async with eodag_lock:
            eodag_api = None
        load_dotenv()
        await get_eodag_api()
        self.finish(orjson.dumps({"status": "done"}))


class InfoHandler(APIHandler):
    """EODAG info handler"""

    @exception_handler
    @tornado.web.authenticated
    async def get(self):
        """Get endpoint"""
        await self._check_installed_packages()
        current_loop = asyncio.get_running_loop()
        result = await current_loop.run_in_executor(None, lambda: Settings().model_dump())
        self.finish(orjson.dumps(result))

    async def _check_installed_packages(self):
        """Check if not-required packages are installed and have the correct version."""
        try:
            dep_version = version("ipyleaflet")
            if dep_version < "0.18.0":
                pkg_versions = "; ".join(
                    f"{k}: {v['version']}"
                    for k, v in Settings().model_dump().get("packages", {}).items()
                    if "version" in v
                )
                raise ImportError(
                    f"If installed, ipyleaflet >= 0.18.0 is required, found version {dep_version} ({pkg_versions})"
                )
        except PackageNotFoundError:
            # Dependency is optional; continue silently
            pass


class ProvidersHandler(APIHandler):
    """Providers listing handler"""

    @exception_handler
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

    @exception_handler
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


class SearchHandler(APIHandler):
    """Search products handler"""

    @exception_handler
    @tornado.web.authenticated
    async def post(self, product_type):
        """Post endpoint"""
        global results_iterator

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
        arguments["start"], arguments["end"] = get_datetime(arguments)

        # provider
        provider = arguments.pop("provider", None)
        if provider and provider != "null":
            arguments["provider"] = provider
            # only raise error if provider selected, if not enable search fallback
            arguments["raise_errors"] = True

        # We remove potential None values to use the default values of the search method
        arguments = dict((k, v) for k, v in arguments.items() if v is not None)

        dag = await get_eodag_api()
        current_loop = asyncio.get_running_loop()
        page = int(arguments.pop("page", DEFAULT_PAGE))
        if int(page) == DEFAULT_PAGE:
            # first search
            results_iterator = await current_loop.run_in_executor(
                None, partial(dag.search_iter_page, productType=product_type, **arguments)
            )
        if results_iterator is None:
            raise ValidationError(
                f"Please perform an initial search on {product_type} before iterating to page {page}."
            )
        products = await current_loop.run_in_executor(None, partial(next, results_iterator, None))

        response = SearchResult(products).as_geojson_object()
        response.update(
            {
                "properties": {
                    "page": page,
                    "itemsPerPage": DEFAULT_ITEMS_PER_PAGE,
                    "totalResults": getattr(products, "number_matched", None),
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

    @exception_handler
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

        dag = await get_eodag_api()
        current_loop = asyncio.get_running_loop()
        queryables_dict = await current_loop.run_in_executor(
            None, partial(dag.list_queryables, fetch_providers=False, **queryables_kwargs)
        )
        json_schema = queryables_dict.get_model().model_json_schema()
        self._remove_null_defaults(json_schema)
        json_schema["additionalProperties"] = queryables_dict.additional_properties
        self.finish(json_schema)

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
