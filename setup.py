# -*- coding: utf-8 -*-
# Copyright 2022 CS GROUP - France, http://www.c-s.fr
# All rights reserved
"""eodag_labextension setup."""

import json
from pathlib import Path

import setuptools
from jupyter_packaging import combine_commands, create_cmdclass, ensure_targets, install_npm, skip_if_exists

HERE = Path(__file__).parent.resolve()

# The name of the project
name = "eodag_labextension"

lab_path = HERE / name / "labextension"

# Representative files that should exist after a successful build
jstargets = [str(lab_path / "package.json")]

package_data_spec = {name: ["*"]}

labext_name = "eodag-labextension"

data_files_spec = [
    ("share/jupyter/labextensions/%s" % labext_name, str(lab_path), "**"),
    ("share/jupyter/labextensions/%s" % labext_name, str(HERE), "install.json"),
    ("etc/jupyter/jupyter_notebook_config.d", "jupyter-config/jupyter_notebook_config.d", "eodag_labextension.json"),
    ("etc/jupyter/jupyter_server_config.d", "jupyter-config/jupyter_server_config.d", "eodag_labextension.json"),
]

cmdclass = create_cmdclass("jsdeps", package_data_spec=package_data_spec, data_files_spec=data_files_spec)

js_command = combine_commands(install_npm(HERE, build_cmd="build:prod", npm=["jlpm"]), ensure_targets(jstargets))

is_repo = (HERE / ".git").exists()
if is_repo:
    cmdclass["jsdeps"] = js_command
else:
    cmdclass["jsdeps"] = skip_if_exists(jstargets, js_command)

long_description = (HERE / "README.md").read_text()

# Get the package info from package.json
pkg_json = json.loads((HERE / "package.json").read_bytes())

setup_args = dict(
    name=name,
    version=pkg_json["version"],
    url=pkg_json["homepage"],
    author=pkg_json["author"]["name"],
    author_email=pkg_json["author"]["email"],
    description=pkg_json["description"],
    license=pkg_json["license"],
    long_description=long_description,
    long_description_content_type="text/markdown",
    cmdclass=cmdclass,
    packages=setuptools.find_packages(),
    install_requires=[
        "jupyterlab~=4.0",
        "tornado>=6.4.1,<7.0.0",
        "notebook>=6.0.3,<7.0.0",
        "eodag[notebook]>=3.5.1",
        "orjson",
        "pydantic",
        "pydantic-settings",
        "python-dotenv",
    ],
    extras_require={
        "dev": [
            "black",
            "pre-commit",
            "pytest",
            "shapely",
        ]
    },
    zip_safe=False,
    include_package_data=True,
    python_requires=">=3.9",
    platforms="Linux, Mac OS X, Windows",
    keywords=["Jupyter", "JupyterLab", "JupyterLab3"],
    classifiers=[
        "License :: OSI Approved :: Apache Software License",
        "Programming Language :: Python",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
        "Framework :: Jupyter",
    ],
)


if __name__ == "__main__":
    setuptools.setup(**setup_args)
