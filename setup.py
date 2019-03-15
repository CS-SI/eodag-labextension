# -*- coding: utf-8 -*-
# Copyright 2015-2017 CS Systemes d'Information (CS SI)
# All rights reserved

from setuptools import setup
from setuptools import find_packages
from codecs import open
from os import path

from eodag_nbextension import __version__

here = path.abspath(path.dirname(__file__))

# Get the long description from the README file
with open(path.join(here, 'README.md'), encoding='utf-8') as f:
    description_from_readme = f.read()

setup(
    name='eodag-nbextension',
    version=__version__,
    description='Jupyter notebook eodag service extension',
    long_description=description_from_readme,
    url='http://www.c-s.fr',
    classifiers=[
        'Topic :: Utilities',
        'Operating System :: OS Independent',
        'Programming Language :: Python :: 3.6'
    ],
    packages=find_packages(),
    install_requires=[
        ],
    # Install with: pip install -e .[tests]
    extras_require={
        'tests': [
        ],
    },
)
