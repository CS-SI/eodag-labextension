# -*- coding: utf-8 -*-
# Copyright 2024 CS GROUP - France, http://www.c-s.fr
# All rights reserved
import json
from unittest import mock

from notebook.notebookapp import NotebookApp
from tornado.testing import AsyncHTTPTestCase
from tornado.web import authenticated

from eodag_labextension import load_jupyter_server_extension
from eodag_labextension.handlers import APIHandler


class MockUser:
    name = "test"


class TestEodagLabExtensionHandler(AsyncHTTPTestCase):
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
        response = self.fetch(url)
        self.assertEqual(response.code, 200)
        return json.loads(response.body.decode("utf-8"))

    def test_product_types(self):
        # all product types
        results = self.fetch_results("/eodag/product-types")
        self.assertIn("S2_MSI_L1C", [pt["ID"] for pt in results])

        # single provider product types
        less_results = self.fetch_results("/eodag/product-types?provider=peps")
        self.assertGreater(len(less_results), 0)
        self.assertLess(len(less_results), len(results))

    def test_providers(self):
        # all providers
        results = self.fetch_results("/eodag/providers")
        self.assertIn("peps", [res["provider"] for res in results])

        less_results = self.fetch_results("/eodag/providers?product_type=S2_MSI_L1C")
        self.assertGreater(len(less_results), 0)
        self.assertLess(len(less_results), len(results))

    def test_guess_product_types(self):
        all_results = self.fetch_results("/eodag/guess-product-type")
        self.assertIn("S2_MSI_L1C", [pt["ID"] for pt in all_results])

        one_result = self.fetch_results("/eodag/guess-product-type?keywords=S2_MSI_L1C")
        self.assertEqual(len(one_result), 1)
        self.assertEqual(one_result[0]["ID"], "S2_MSI_L1C")

        another_result = self.fetch_results("/eodag/guess-product-type?keywords=Sentinel2%20L1C")
        self.assertEqual(len(another_result), 1)
        self.assertEqual(another_result[0]["ID"], "S2_MSI_L1C")

        more_results = self.fetch_results("/eodag/guess-product-type?keywords=Sentinel")
        self.assertGreater(len(more_results), 1)
        self.assertLess(len(more_results), len(all_results))
        self.assertTrue(more_results[0]["ID"].lower().startswith("sentinel"))
        self.assertIn("S2_MSI_L1C", [pt["ID"] for pt in more_results])
