# Release history

## v5.0.0 (2025-05-28)

### Refactoring

- [v5.0.0b1] Jupyterlab v4 upgrade ([#161](https://github.com/CS-SI/eodag-labextension/pull/161),
  [`06bbd4d`](https://github.com/CS-SI/eodag-labextension/commit/06bbd4d7503c331193237e06c0dca03da9ca3d64))

- **handlers**: Do not return unnecessary product types fields
  ([#201](https://github.com/CS-SI/eodag-labextension/pull/201),
  [`d5443fc`](https://github.com/CS-SI/eodag-labextension/commit/d5443fca95650cfe67bba86c2af34cf55509b5cc))

### Features

- **autocomplete**: Add options virtualization on Autocomplete component
  ([#196](https://github.com/CS-SI/eodag-labextension/pull/196),
  [`5c77582`](https://github.com/CS-SI/eodag-labextension/commit/5c7758292961205951be7087bdcc1078a9223241))

- **main form**: Async handlers and loading state that disables the selects when fetchs are loading
  ([#188](https://github.com/CS-SI/eodag-labextension/pull/188),
  [`80420b3`](https://github.com/CS-SI/eodag-labextension/commit/80420b3c7a37a8dffa92e0df686b160b92bccea3))

- **option menu button**: Add menu dropdown to embbed all links & options
  ([#193](https://github.com/CS-SI/eodag-labextension/pull/193),
  [`1c73d23`](https://github.com/CS-SI/eodag-labextension/commit/1c73d2362cae0eeb751fa6270a84e46935ceb04d))

- **user settings**: Add user settings edition menu item button
  ([#194](https://github.com/CS-SI/eodag-labextension/pull/194),
  [`4f44126`](https://github.com/CS-SI/eodag-labextension/commit/4f44126a75f7bd8e54a26c45e3a1de0bd9fe5b14))

- Eodag local conf dir symlink ([#200](https://github.com/CS-SI/eodag-labextension/pull/200),
  [`ee5520f`](https://github.com/CS-SI/eodag-labextension/commit/ee5520ffb48fb2ba346fea5f4f4f71f9b153ff6b))

- Pydantic settings and info handler ([#191](https://github.com/CS-SI/eodag-labextension/pull/191),
  [`d5827ec`](https://github.com/CS-SI/eodag-labextension/commit/d5827ec6287979ea90ee139cd5939e59bca0c505))

### Bug Fixes

- **autocomplete**: Fix double click needed to empty the autocomplete fields
  ([#187](https://github.com/CS-SI/eodag-labextension/pull/187),
  [`23060ea`](https://github.com/CS-SI/eodag-labextension/commit/23060ea112b4bf6fcbd490f815fd22b832824c4e))

- **form**: Resets the optional parameters when an optional parameter is unchecked
  ([#189](https://github.com/CS-SI/eodag-labextension/pull/189),
  [`3ba4d63`](https://github.com/CS-SI/eodag-labextension/commit/3ba4d634945c030c4cae36b6610172be03f812dc))

- **mapExtentComponent**: Map settings through extension settings
  ([#186](https://github.com/CS-SI/eodag-labextension/pull/186),
  [`36ca7a3`](https://github.com/CS-SI/eodag-labextension/commit/36ca7a3dc3b6e61d39c70e7eb676a4a9d75dd9d1))

- **modal**: Fix multiple display bugs in modal
  ([#184](https://github.com/CS-SI/eodag-labextension/pull/184),
  [`9eaf358`](https://github.com/CS-SI/eodag-labextension/commit/9eaf3584461adc6e78f1500d524d2310f74ef376))

### Continuous Integration

- Deploy github action upgrade ([#179](https://github.com/CS-SI/eodag-labextension/pull/179),
  [`a884aff`](https://github.com/CS-SI/eodag-labextension/commit/a884aff138034f94fa617b9e0a4512cb93107f02))

### Documentation

- Changelog typo ([#178](https://github.com/CS-SI/eodag-labextension/pull/178),
  [`9cd8075`](https://github.com/CS-SI/eodag-labextension/commit/9cd80758e9f8fc59bfe23b873f78faa46330ccc1))

- Updated README and CONTRIBUTING ([#203](https://github.com/CS-SI/eodag-labextension/pull/203),
  [`ba05777`](https://github.com/CS-SI/eodag-labextension/commit/ba05777fedd94fd0c62ad26c0fc1cf89bc9c3d09))

### Chores

- **map settings**: Rename title & description
  ([#190](https://github.com/CS-SI/eodag-labextension/pull/190),
  [`a553e74`](https://github.com/CS-SI/eodag-labextension/commit/a553e741ffbd160e38a69e95e2ce35795eae62af))

- Python-semantic-release settings ([#202](https://github.com/CS-SI/eodag-labextension/pull/202),
  [`5ad4801`](https://github.com/CS-SI/eodag-labextension/commit/5ad48016ff73b6d147a605258b0fbe236c0baba1))

## v5.0.0b1 (2025-05-06)

- Jupyterlab v4 upgrade [(#161)](https://github.com/CS-SI/eodag-labextension/pull/161)

## v4.0.0 (2025-04-10)

- **Dynamic search form based on queryables** [(#168)](https://github.com/CS-SI/eodag-labextension/pull/168)
- Search errors handling fix [(#170)](https://github.com/CS-SI/eodag-labextension/pull/170)
- Drop support for Python 3.8 [(#166)](https://github.com/CS-SI/eodag-labextension/pull/166)
- Updates dependencies and developement tools versions [(#163)](https://github.com/CS-SI/eodag-labextension/pull/163)
  [(#169)](https://github.com/CS-SI/eodag-labextension/pull/169)[(#172)](https://github.com/CS-SI/eodag-labextension/pull/172)

## v3.7.0 (2024-10-10)

- [3.7.0b1] Update to `eodag v3` search api [(#153)](https://github.com/CS-SI/eodag-labextension/pull/153)
- [3.7.0b1] Update to `eodag v3` imports [(#148)](https://github.com/CS-SI/eodag-labextension/pull/148)
- [3.7.0b1] `pytest` version pinned [(#150)](https://github.com/CS-SI/eodag-labextension/pull/150)
- [3.7.0b2] pinned `ipyleaflet` [(#155)](https://github.com/CS-SI/eodag-labextension/pull/155)
- **[v3.7.0b1 to v3.7.0]** Updates dependencies and developement tools versions [(#147)](https://github.com/CS-SI/eodag-labextension/pull/147)
  [(#148)](https://github.com/CS-SI/eodag-labextension/pull/148)[(#151)](https://github.com/CS-SI/eodag-labextension/pull/151)
  [(#152)](https://github.com/CS-SI/eodag-labextension/pull/152)[(#158)](https://github.com/CS-SI/eodag-labextension/pull/158)
  [(#159)](https://github.com/CS-SI/eodag-labextension/pull/159)

## v3.7.0b2 (2024-06-26)

- pinned `ipyleaflet` [(#155)](https://github.com/CS-SI/eodag-labextension/pull/155)

## v3.7.0b1 (2024-06-25)

- Update to `eodag v3` search api [(#153)](https://github.com/CS-SI/eodag-labextension/pull/153)
- Update to `eodag v3` imports [(#148)](https://github.com/CS-SI/eodag-labextension/pull/148)
- `pytest` version pinned [(#150)](https://github.com/CS-SI/eodag-labextension/pull/150)
- Updates dependencies and developement tools versions [(#147)](https://github.com/CS-SI/eodag-labextension/pull/147)
  [(#148)](https://github.com/CS-SI/eodag-labextension/pull/148)[(#151)](https://github.com/CS-SI/eodag-labextension/pull/151)
  [(#152)](https://github.com/CS-SI/eodag-labextension/pull/152)

## v3.6.0 (2024-03-04)

- New `reload eodag environment` button [(#139)](https://github.com/CS-SI/eodag-labextension/pull/139)
- Customizable map default settings [(#143)](https://github.com/CS-SI/eodag-labextension/pull/143)
- Handlers patterns fix and code refactoring [(#142)](https://github.com/CS-SI/eodag-labextension/pull/142)[(#144)](https://github.com/CS-SI/eodag-labextension/pull/144)
- Updates dependencies and developement tools versions [(#138)](https://github.com/CS-SI/eodag-labextension/pull/138)

## v3.5.0 (2024-02-08)

- New `provider` filtering [(#127)](https://github.com/CS-SI/eodag-labextension/pull/127)
- New python tests [(#127)](https://github.com/CS-SI/eodag-labextension/pull/127)[(#130)](https://github.com/CS-SI/eodag-labextension/pull/130)
- Product type `title` instead of longer `abstract` displayed in dropdown list tooltip [(#131)](https://github.com/CS-SI/eodag-labextension/pull/131)
- Supported python versions starting from `3.8` to `3.11` [(#132)](https://github.com/CS-SI/eodag-labextension/pull/132)

## v3.4.0 (2023-10-12)

- Updates internal geometry format and removes exposed REST API [(#120)](https://github.com/CS-SI/eodag-labextension/pull/120)
- Fixes issue with DatePicker maximum date [(#122)](https://github.com/CS-SI/eodag-labextension/pull/122)
- Updates pre-commit hooks versions [(#114)](https://github.com/CS-SI/eodag-labextension/pull/114)
- Updates dependencies and developement tools versions [(#115)](https://github.com/CS-SI/eodag-labextension/pull/115)
  [(#117)](https://github.com/CS-SI/eodag-labextension/pull/117)[(#118)](https://github.com/CS-SI/eodag-labextension/pull/118)
  [(#121)](https://github.com/CS-SI/eodag-labextension/pull/121)

## v3.3.1 (2023-02-16)

- Fixes generated code formatting [(#109)](https://github.com/CS-SI/eodag-labextension/pull/109)
- Prevents not-ready kernel error [(#109)](https://github.com/CS-SI/eodag-labextension/pull/109)
- Updates dependencies and developement tools versions [(#111)](https://github.com/CS-SI/eodag-labextension/pull/111)

## v3.3.0 (2023-01-18)

- Layout update and new button to directly generate search code [(#95)](https://github.com/CS-SI/eodag-labextension/pull/95)
- Throws an error message if no notebook is opened to insert code in [(#85)](https://github.com/CS-SI/eodag-labextension/pull/85)
- Guess product type using keywords in search form [(#96)](https://github.com/CS-SI/eodag-labextension/pull/96)[(#100)](https://github.com/CS-SI/eodag-labextension/pull/100)
- Implements a way to disable cloud cover [(#78)](https://github.com/CS-SI/eodag-labextension/pull/78)
- Settings button and replace existing search code option [(#104)](https://github.com/CS-SI/eodag-labextension/pull/104)
- Help for additional parameters and buttons disabled when missing product type [(#102)](https://github.com/CS-SI/eodag-labextension/pull/102)
- Harmonized product highlight between list and map in search overview [(#91)](https://github.com/CS-SI/eodag-labextension/pull/91)
- Restores EODAG serve-rest services (STAC API) through `./eodag` endpoint
  [(#83)](https://github.com/CS-SI/eodag-labextension/pull/83)
- Fixes `cloudCover` usage during search [(#82)](https://github.com/CS-SI/eodag-labextension/pull/82)
- Updates [Contributing guidelines](https://github.com/CS-SI/eodag-labextension/blob/develop/CONTRIBUTING.md)
  [(#79)](https://github.com/CS-SI/eodag-labextension/pull/79)
- Documentation update [(#106)](https://github.com/CS-SI/eodag-labextension/pull/106)
- `eodag` minimal version requirement set to 2.8.0 [(#107)](https://github.com/CS-SI/eodag-labextension/pull/107)
- Updates dependencies and developement tools versions [(#74)](https://github.com/CS-SI/eodag-labextension/pull/74)[(#75)](https://github.com/CS-SI/eodag-labextension/pull/75)[(#80)](https://github.com/CS-SI/eodag-labextension/pull/80)[(#62)](https://github.com/CS-SI/eodag-labextension/pull/62)[(#63)](https://github.com/CS-SI/eodag-labextension/pull/63)[(#64)](https://github.com/CS-SI/eodag-labextension/pull/64)[(#66)](https://github.com/CS-SI/eodag-labextension/pull/66)[(#67)](https://github.com/CS-SI/eodag-labextension/pull/67)[(#76)](https://github.com/CS-SI/eodag-labextension/pull/76)[(#77)](https://github.com/CS-SI/eodag-labextension/pull/77)[(#84)](https://github.com/CS-SI/eodag-labextension/pull/84)[(#99)](https://github.com/CS-SI/eodag-labextension/pull/99)[(#103)](https://github.com/CS-SI/eodag-labextension/pull/103)[(#105)](https://github.com/CS-SI/eodag-labextension/pull/105)

## v3.2.5 (2022-01-07)

- Fixes leaflet container size, fixes #59 [(#60)](https://github.com/CS-SI/eodag-labextension/pull/60)

## v3.2.4 (2021-12-23)

- Fixes unwanted interactions with ipywidget, fixes #56 [(#57)](https://github.com/CS-SI/eodag-labextension/pull/57)

## v3.2.3 (2021-10-07)

- First public release
