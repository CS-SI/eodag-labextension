# -*- coding: utf-8 -*-
# Copyright 2024 CS GROUP - France, http://www.c-s.fr
# All rights reserved
import json
import os
import re
from pathlib import Path
from tempfile import TemporaryDirectory
from unittest import mock

from eodag import SearchResult
from eodag import __version__ as eodag_version
from eodag.api.core import DEFAULT_ITEMS_PER_PAGE
from eodag.types.queryables import QueryablesDict
from notebook.notebookapp import NotebookApp
from shapely.geometry import shape
from tornado.httpclient import HTTPClientError
from tornado.testing import AsyncHTTPTestCase, gen_test
from tornado.web import authenticated

from eodag_labextension import __version__ as labextension_version
from eodag_labextension import load_jupyter_server_extension
from eodag_labextension.handlers import APIHandler, get_eodag_api, set_conf_symlink


class MockUser:
    name = "test"


class TestEodagLabExtensionHandler(AsyncHTTPTestCase):
    @classmethod
    def setUpClass(cls):
        # backup os.environ as it will be modified by tests
        cls.eodag_env_pattern = re.compile(r"EODAG_\w+")
        cls.eodag_env_backup = {k: v for k, v in os.environ.items() if cls.eodag_env_pattern.match(k)}
        # disable product types fetch
        os.environ["EODAG_EXT_PRODUCT_TYPES_CFG_FILE"] = ""

    @classmethod
    def tearDownClass(cls):
        super(TestEodagLabExtensionHandler, cls).tearDownClass()
        # restore os.environ
        for k, v in os.environ.items():
            if cls.eodag_env_pattern.match(k):
                os.environ.pop(k)
        os.environ.update(cls.eodag_env_backup)

    def setUp(self):
        super().setUp()
        self.patcher_xsrf = mock.patch.object(APIHandler, "check_xsrf_cookie", return_value=MockUser())
        self.patcher_user = mock.patch.object(APIHandler, "get_current_user", return_value=MockUser())
        self.patcher_auth = mock.patch.object(authenticated, "__call__", return_value=lambda x: x)
        self.mock_xsrf = self.patcher_xsrf.start()
        self.mock_user = self.patcher_user.start()
        self.mock_auth = self.patcher_auth.start()

    def tearDown(self):
        super().tearDown()
        self.patcher_xsrf.stop()
        self.patcher_user.stop()
        self.patcher_auth.stop()

    def get_app(self):
        # Create a new NotebookApp instance
        app = NotebookApp()
        app.initialize(argv=[])

        # Load extension
        load_jupyter_server_extension(app)

        return app.web_app

    async def fetch_results(self, url, **kwargs):
        """Check that request status is 200 and return the json result as dict"""
        response = await self.http_client.fetch(self.get_url(url), **kwargs)
        self.assertEqual(response.code, 200)
        return json.loads(response.body.decode("utf-8"))

    async def fetch_results_error(self, url, error_code=None, **kwargs):
        """Check that request returns a 400 error"""
        # with self.assertRaises(HTTPClientError) as err:
        try:
            response = await self.http_client.fetch(self.get_url(url), **kwargs)
        except HTTPClientError as err:
            if error_code:
                self.assertEqual(err.code, error_code)
        else:
            self.fail(f"Expected {response} to raise HTTP {error_code}")

    @gen_test
    async def test_product_types(self):
        # all product types
        results = await self.fetch_results("/eodag/product-types")
        self.assertIn("S2_MSI_L1C", [pt["ID"] for pt in results])

        # single provider product types
        less_results = await self.fetch_results("/eodag/product-types?provider=peps")
        self.assertGreater(len(less_results), 0)
        self.assertLess(len(less_results), len(results))

        # unknown provider
        await self.fetch_results_error("/eodag/product-types?provider=foo", 400)

    @gen_test
    async def test_providers(self):
        # all providers
        results = await self.fetch_results("/eodag/providers")
        self.assertIn("peps", [res["provider"] for res in results])

        less_results = await self.fetch_results("/eodag/providers?product_type=S2_MSI_L1C")
        self.assertGreater(len(less_results), 0)
        self.assertLess(len(less_results), len(results))

        result_with_name = await self.fetch_results("/eodag/providers?keywords=peps")
        self.assertEqual(len(result_with_name), 1)
        self.assertEqual(result_with_name[0]["provider"], "peps")

        result_with_description = await self.fetch_results("/eodag/providers?keywords=cop")
        self.assertGreater(len(result_with_description), 2)
        providers = [r["provider"] for r in result_with_description]
        self.assertIn("cop_marine", providers)

        no_result = await self.fetch_results("/eodag/providers?product_type=foo")
        self.assertEqual(len(no_result), 0)

    @gen_test
    async def test_guess_product_types(self):
        all_results = await self.fetch_results("/eodag/guess-product-type")
        self.assertIn("S2_MSI_L1C", [pt["ID"] for pt in all_results])
        self.assertListEqual(sorted(list(all_results[0].keys())), ["ID", "title"])

        one_provider_results = await self.fetch_results("/eodag/guess-product-type?provider=creodias")
        self.assertLess(len(one_provider_results), len(all_results))
        self.assertIn("COP_DEM_GLO90_DGED", [pt["ID"] for pt in all_results])
        self.assertListEqual(sorted(list(one_provider_results[0].keys())), ["ID", "title"])

        one_result = await self.fetch_results("/eodag/guess-product-type?keywords=S2_MSI_L1C")
        self.assertEqual(len(one_result), 1)
        self.assertEqual(one_result[0]["ID"], "S2_MSI_L1C")
        self.assertListEqual(sorted(list(one_result[0].keys())), ["ID", "title"])

        another_result = await self.fetch_results("/eodag/guess-product-type?keywords=Sentinel2%20L1C")
        self.assertEqual(len(another_result), 1)
        self.assertEqual(another_result[0]["ID"], "S2_MSI_L1C")
        self.assertListEqual(sorted(list(another_result[0].keys())), ["ID", "title"])

        more_results = await self.fetch_results("/eodag/guess-product-type?keywords=Sentinel")
        self.assertGreater(len(more_results), 1)
        self.assertLess(len(more_results), len(all_results))
        self.assertIn("S2_MSI_L1C", [pt["ID"] for pt in more_results])
        self.assertListEqual(sorted(list(more_results[0].keys())), ["ID", "title"])

        less_results = await self.fetch_results("/eodag/guess-product-type?keywords=Sentinel&provider=peps")
        self.assertGreater(len(more_results), 1)
        self.assertLess(len(less_results), len(more_results))
        self.assertEqual(less_results[0]["ID"], "S1_SAR_GRD")
        self.assertListEqual(sorted(list(less_results[0].keys())), ["ID", "title"])

        other_results = await self.fetch_results("/eodag/guess-product-type?keywords=cop")
        self.assertGreater(len(other_results), 1)
        self.assertLess(len(other_results), len(all_results))
        self.assertTrue(other_results[0]["ID"].lower().startswith("cop"))
        self.assertListEqual(sorted(list(other_results[0].keys())), ["ID", "title"])

        await self.fetch_results_error("/eodag/guess-product-type?provider=foo", 400)

    @gen_test
    async def test_get_not_found(self):
        await self.fetch_results_error("/eodag/foo", 404)

    @gen_test
    async def test_post_not_found(self):
        await self.fetch_results_error("/eodag/foo/bar", 404, method="POST", body=json.dumps({}))

    @mock.patch("eodag.api.core.EODataAccessGateway.search_iter_page", autospec=True)
    @gen_test(timeout=120)
    async def test_search(self, mock_search):
        mock_search.return_value = mock.MagicMock()
        mock_search.return_value.__next__.return_value = SearchResult([], 0)

        geom_dict = {
            "type": "Polygon",
            "coordinates": [[[0, 2], [0, 3], [1, 3], [1, 2], [0, 2]]],
        }
        # full example
        result = await self.fetch_results(
            "/eodag/S2_MSI_L1C",
            method="POST",
            body=json.dumps(
                {
                    "dtstart": "2024-01-01",
                    "dtend": "2024-01-02",
                    "page": 1,
                    "geom": geom_dict,
                    "cloudCover": 50,
                    "foo": "bar",
                    "provider": "cop_dataspace",
                    "count": False,
                }
            ),
        )
        mock_search.assert_called_once_with(
            mock.ANY,
            productType="S2_MSI_L1C",
            start="2024-01-01T00:00:00",
            end="2024-01-02T00:00:00",
            geom=shape(geom_dict),
            cloudCover=50,
            foo="bar",
            provider="cop_dataspace",
            count=False,
            raise_errors=True,
        )
        self.assertDictEqual(
            result,
            {
                "type": "FeatureCollection",
                "features": [],
                "properties": {
                    "page": 1,
                    "itemsPerPage": DEFAULT_ITEMS_PER_PAGE,
                    "totalResults": 0,
                },
            },
        )

        # minimal example
        mock_search.reset_mock()
        result = await self.fetch_results(
            "/eodag/S2_MSI_L1C",
            method="POST",
            body=json.dumps({}),
        )
        mock_search.assert_called_once_with(
            mock.ANY,
            productType="S2_MSI_L1C",
        )

        # date error
        mock_search.reset_mock()
        await self.fetch_results_error(
            "/eodag/S2_MSI_L1C",
            400,
            method="POST",
            body=json.dumps({"dtstart": "2024-015-01"}),
        )

        # geom error
        mock_search.reset_mock()
        await self.fetch_results_error(
            "/eodag/S2_MSI_L1C",
            400,
            method="POST",
            body=json.dumps({"geom": {"foo": "bar"}}),
        )

    @mock.patch(
        "eodag.api.core.EODataAccessGateway.list_queryables",
        autospec=True,
        return_value=QueryablesDict(additional_properties=False),
    )
    @gen_test
    async def test_queryables(self, mock_list_queryables):
        results = await self.fetch_results(
            "/eodag/queryables?"
            "provider=some_provider&productType=some_product_type"
            "&param1=paramValue1&param2=paramValue2"
        )
        self.assertEqual(results["properties"], {})
        self.assertFalse(results["additionalProperties"])
        mock_list_queryables.assert_called_with(
            mock.ANY,
            fetch_providers=False,
            provider="some_provider",
            productType="some_product_type",
            param1="paramValue1",
            param2="paramValue2",
        )

    @gen_test
    async def test_info(self):
        infos = await self.fetch_results("/eodag/info")
        self.assertIn("packages", infos)
        self.assertEqual(infos["packages"]["eodag"]["version"], eodag_version)
        self.assertEqual(infos["packages"]["eodag_labextension"]["version"], labextension_version)

    @mock.patch.dict(os.environ, {"EODAG_LABEXTENSION__DEBUG": "true"})
    @gen_test
    async def test_debug(self):
        infos = await self.fetch_results("/eodag/info")
        self.assertTrue(infos["debug"])

    @mock.patch.dict(
        os.environ,
        {
            "EODAG_LABEXTENSION__MAP__TILE_URL": "http://foo.bar",
            "EODAG_LABEXTENSION__MAP__TILE_ATTRIBUTION": "Foo attribution",
            "EODAG_LABEXTENSION__MAP__ZOOM_OFFSET": "2",
        },
    )
    @gen_test
    async def test_map_info(self):
        infos = await self.fetch_results("/eodag/info")
        self.assertEqual(infos["map"]["tile_url"], "http://foo.bar")
        self.assertEqual(infos["map"]["tile_attribution"], "Foo attribution")
        self.assertEqual(infos["map"]["zoom_offset"], 2)

    @gen_test(timeout=120)
    async def test_set_conf_symlink(self):
        with TemporaryDirectory() as tmpdir:
            custom_cfg_file = Path(tmpdir) / "foo.yml"
            custom_cfg_file.touch()
            custom_cfg_file_str = str(custom_cfg_file.absolute())
            local_cfg_file = Path("eodag-config") / "eodag.yml"

            # custom config file
            with mock.patch.dict(os.environ, {"EODAG_CFG_FILE": custom_cfg_file_str}):
                eodag_api = await get_eodag_api()
                set_conf_symlink(eodag_api)
                self.assertTrue(os.path.isdir("eodag-config"))
                self.assertTrue(os.path.islink(str(local_cfg_file)))
                self.assertEqual(custom_cfg_file, Path(os.readlink(str(local_cfg_file))))

            # default config file
            set_conf_symlink(eodag_api)
            self.assertTrue(os.path.islink("eodag-config"))
            self.assertEqual(Path(eodag_api.conf_dir) / "eodag.yml", Path(os.readlink("eodag-config")) / "eodag.yml")

    @gen_test(timeout=120)
    async def test_reload_dotenv(self):
        with TemporaryDirectory() as tmpdir:
            cwd = Path.cwd()
            try:
                # temp dir as labextension dir
                os.chdir(tmpdir)

                # default conf
                eodag_api = await get_eodag_api()
                self.assertNotEqual(eodag_api.conf_dir, tmpdir)

                # Create a custom .env file with customized conf dir
                custom_env_file = Path(tmpdir) / ".env"
                custom_env_file.write_text(f"EODAG_CFG_DIR={tmpdir}\n")

                await self.fetch_results("/eodag/reload")
                eodag_api = await get_eodag_api()
                self.assertEqual(eodag_api.conf_dir, tmpdir)

                # remove .env and reload again
                custom_env_file.unlink()
                await self.fetch_results("/eodag/reload")
                eodag_api = await get_eodag_api()
                self.assertNotEqual(eodag_api.conf_dir, tmpdir)

            finally:
                # restore cwd
                os.chdir(cwd)
