# Zion A.D.

**An open-source civilization strategy game built directly on the 0 A.D. / Pyrogenesis engine.**

This repository contains the original game source tree: C++ engine, simulation, UI,
renderer, maps, units, buildings, and the art/sound files (large binary assets are
tracked as Git LFS pointers). It is the foundation of Zion A.D., not a separate
browser game or a small 0 A.D. add-on.

**Vision:** Guide societies across 2,000 years toward Zion: shared flourishing,
ecological regeneration, justice, wisdom, agency, love, peace, and institutions
that are worthy of the people they serve. Multiple forms of governance and
integral developmental paths will be implemented within the native simulation.

**Development status:** A first **First Covenant** native RTS gameplay slice now
includes three successive governance decisions at civic centers, policies with
real game effects, persistent social conditions, an in-game welfare HUD, and a
native flourishing victory mode. See [play instructions](docs/FIRST-PLAYABLE.md).
The full 2,000-year campaign and new future-age 3D art are not implemented;
a complete Pyrogenesis build and game launch have not yet been verified.

## Source and build

* Original developer documentation: [UPSTREAM-README.md](UPSTREAM-README.md)
* Current 0 A.D. project: https://gitea.wildfiregames.com/0ad/0ad
* [Zion A.D. Linux build and engine smoke test](docs/BUILD-LINUX.md)
* Upstream build instructions: https://gitea.wildfiregames.com/0ad/0ad/wiki/BuildInstructions
* The official `.lfsconfig` points to Wildfire Games' LFS server for fetching art
  and sound assets. Run `git lfs install && git lfs pull` if needed.
* Maintainers can fetch subsequent upstream changes with
  `git remote add upstream https://gitea.wildfiregames.com/0ad/0ad.git`
  and `git fetch upstream main`.

## Attribution and licenses

An unofficial derivative of **0 A.D.**, originally developed by Wildfire Games.
All upstream copyrights and license files are retained. Engine code is primarily
GPL-2.0-or-later; art assets use their respective upstream licenses, including
CC BY-SA 3.0. See [LICENSE.md](LICENSE.md) and upstream licensing files.
Zion A.D. is not affiliated with Wildfire Games.

## Project direction

See [ZION-VISION.md](ZION-VISION.md). All gameplay changes must live in the
native Pyrogenesis/0 A.D. source tree.
