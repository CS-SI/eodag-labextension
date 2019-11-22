# -*- coding: utf-8 -*-
# Copyright 2015-2017 CS Systemes d'Information (CS SI)
# All rights reserved
"""Setup file"""

import os
from codecs import open
from os import path

from setuptools import find_packages
from setuptools import setup

HERE = path.abspath(path.dirname(__file__))

metadata = {}
with open(os.path.join(HERE, "eodag_labextension", "__meta__.py"), "r") as f:
    exec(f.read(), metadata)

# Get the long description from the README file
with open(path.join(HERE, "README.md"), encoding="utf-8") as f:
    description_from_readme = f.read()

setup(
    name="eodag-labextension",
    version=metadata["__version__"],
    description="JupyterLab eodag service extension",
    long_description=description_from_readme,
    url="http://www.c-s.fr",
    classifiers=[
        "Topic :: Utilities",
        "Operating System :: OS Independent",
        "Programming Language :: Python :: 3.6",
    ],
    python_requires=">=3.6",
    include_package_data=True,
    data_files=[
        (
            "etc/jupyter/jupyter_notebook_config.d",
            ["jupyter-config/jupyter_notebook_config.d/eodag_labextension.json"],
        )
    ],
    packages=find_packages(),
    install_requires=["tornado", "notebook", "eodag>=1.2.3"],
    extras_require={
        "dev": [
            "jupyterhub==0.9.4",
            "jupyterlab==0.35.4",
            "jupyter_contrib_nbextensions==0.5.1",
            "black==19.3b0",
            "pre-commit==1.14.4",
        ]
    },
    zip_safe=False,
)
