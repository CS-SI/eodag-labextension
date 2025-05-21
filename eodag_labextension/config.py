# -*- coding: utf-8 -*-
# Copyright 2025 CS GROUP - France, http://www.c-s.fr
# All rights reserved

"""EODAG Labextension configuration"""

from __future__ import annotations

import re
from importlib.metadata import distributions
from typing import Optional

from pydantic import BaseModel
from pydantic_settings import BaseSettings, SettingsConfigDict


class PackageInfo(BaseModel):
    """Package info model"""

    version: str


def get_packages_info(filter: Optional[str] = None) -> dict[str, PackageInfo]:
    """Get packages info"""
    infos: dict[str, PackageInfo] = {}

    pattern = re.compile(filter) if filter else None

    installed_packages = distributions()
    for package in installed_packages:
        package_name = package.metadata["Name"]
        if pattern is None or (pattern is not None and pattern.fullmatch(package_name)):
            infos[package_name] = PackageInfo(version=package.version)
    return infos


class Settings(BaseSettings):
    """EODAG Labextension config"""

    model_config = SettingsConfigDict(env_prefix="eodag_labextension__")

    debug: bool = False

    packages: dict[str, PackageInfo] = get_packages_info("^eodag.*$")
