# -*- coding: utf-8 -*-
# Copyright 2024 CS GROUP - France, http://www.c-s.fr
# All rights reserved
import json
import os
import re
from unittest import mock

from notebook.notebookapp import NotebookApp
from tornado.testing import AsyncHTTPTestCase
from tornado.web import authenticated

from eodag_labextension import load_jupyter_server_extension
from eodag_labextension.handlers import APIHandler


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

    def get_app(self):
        # Create a new NotebookApp instance
        app = NotebookApp()
        app.initialize(argv=[])

        # Load extension
        load_jupyter_server_extension(app)

        return app.web_app

    @mock.patch.object(APIHandler, "get_current_user", return_value=MockUser())
    @mock.patch.object(authenticated, "__call__", return_value=lambda x: x)
    def fetch_results(self, url, mock_auth, mock_user):
        """Check that request status is 200 and return the json result as dict"""
        response = self.fetch(url)
        self.assertEqual(response.code, 200)
        return json.loads(response.body.decode("utf-8"))

    @mock.patch.object(APIHandler, "get_current_user", return_value=MockUser())
    @mock.patch.object(authenticated, "__call__", return_value=lambda x: x)
    def fetch_results_err400(self, url, mock_auth, mock_user):
        """Check that request returns a 400 error"""
        response = self.fetch(url)
        self.assertEqual(response.code, 400)
        return json.loads(response.body.decode("utf-8"))

    def test_product_types(self):
        # all product types
        results = self.fetch_results("/eodag/product-types")
        self.assertIn("S2_MSI_L1C", [pt["ID"] for pt in results])

        # single provider product types
        less_results = self.fetch_results("/eodag/product-types?provider=peps")
        self.assertGreater(len(less_results), 0)
        self.assertLess(len(less_results), len(results))

        # unknown provider
        self.fetch_results_err400("/eodag/product-types?provider=foo")

    def test_providers(self):
        # all providers
        results = self.fetch_results("/eodag/providers")
        self.assertIn("peps", [res["provider"] for res in results])

        less_results = self.fetch_results("/eodag/providers?product_type=S2_MSI_L1C")
        self.assertGreater(len(less_results), 0)
        self.assertLess(len(less_results), len(results))

        result_with_name = self.fetch_results("/eodag/providers?keywords=peps")
        self.assertEqual(len(result_with_name), 1)
        self.assertEqual(result_with_name[0]["provider"], "peps")

        result_with_description = self.fetch_results("/eodag/providers?keywords=cop")
        self.assertGreater(len(result_with_description), 2)
        self.assertEqual(result_with_description[0]["provider"], "cop_ads")

        no_result = self.fetch_results("/eodag/providers?product_type=foo")
        self.assertEqual(len(no_result), 0)

    def test_guess_product_types(self):
        all_results = self.fetch_results("/eodag/guess-product-type")
        self.assertIn("S2_MSI_L1C", [pt["ID"] for pt in all_results])

        one_provider_results = self.fetch_results("/eodag/guess-product-type?provider=creodias")
        self.assertLess(len(one_provider_results), len(all_results))
        self.assertIn("COP_DEM_GLO90_DGED", [pt["ID"] for pt in all_results])

        one_result = self.fetch_results("/eodag/guess-product-type?keywords=S2_MSI_L1C")
        self.assertEqual(len(one_result), 1)
        self.assertEqual(one_result[0]["ID"], "S2_MSI_L1C")

        another_result = self.fetch_results("/eodag/guess-product-type?keywords=Sentinel2%20L1C")
        self.assertEqual(len(another_result), 1)
        self.assertEqual(another_result[0]["ID"], "S2_MSI_L1C")

        more_results = self.fetch_results("/eodag/guess-product-type?keywords=Sentinel")
        self.assertGreater(len(more_results), 1)
        self.assertLess(len(more_results), len(all_results))
        self.assertIn("S2_MSI_L1C", [pt["ID"] for pt in more_results])

        less_results = self.fetch_results("/eodag/guess-product-type?keywords=Sentinel&provider=peps")
        self.assertGreater(len(more_results), 1)
        self.assertLess(len(less_results), len(more_results))
        self.assertEqual(less_results[0]["ID"], "S1_SAR_GRD")

        other_results = self.fetch_results("/eodag/guess-product-type?keywords=cop")
        self.assertGreater(len(other_results), 1)
        self.assertLess(len(other_results), len(all_results))
        self.assertTrue(other_results[0]["ID"].lower().startswith("cop"))

        self.fetch_results_err400("/eodag/guess-product-type?provider=foo")
