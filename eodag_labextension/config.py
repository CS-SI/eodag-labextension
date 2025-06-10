# -*- coding: utf-8 -*-
# Copyright 2025 CS GROUP - France, http://www.c-s.fr
# All rights reserved

"""EODAG Labextension configuration"""

from __future__ import annotations

from importlib.metadata import distributions
from typing import Optional

from pydantic import BaseModel, computed_field
from pydantic_settings import BaseSettings, SettingsConfigDict


class MapInfo(BaseModel):
    """Map info model"""

    tile_url: Optional[str] = None
    tile_attribution: Optional[str] = None
    zoom_offset: Optional[int] = None


class PackageInfo(BaseModel):
    """Package info model"""

    version: str


class Settings(BaseSettings):
    """EODAG Labextension config"""

    model_config = SettingsConfigDict(env_prefix="eodag_labextension__", env_nested_delimiter="__")

    debug: bool = False

    map: MapInfo = MapInfo()

    @computed_field
    def packages(self) -> dict[str, PackageInfo]:
        """Get packages info"""
        infos: dict[str, PackageInfo] = {}

        installed_packages = distributions()
        for package in installed_packages:
            package_name = package.metadata["Name"]
            if package_name.startswith("eodag"):
                infos[package_name] = PackageInfo(version=package.version)
        return infos
