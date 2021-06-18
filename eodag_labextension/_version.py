# -*- coding: utf-8 -*-
# Copyright 2021 CS GROUP - France, http://www.c-s.fr
# All rights reserved

import json
from pathlib import Path

__all__ = ["__version__"]


def _fetchVersion():
    HERE = Path(__file__).parent.resolve()

    for settings in HERE.rglob("package.json"):
        try:
            with settings.open() as f:
                return json.load(f)["version"]
        except FileNotFoundError:
            pass

    raise FileNotFoundError(f"Could not find package.json under dir {HERE!s}")


__version__ = _fetchVersion()
