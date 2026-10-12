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

**Development status:** This is the upstream game source imported as a starting
foundation. The 2,000-year Zion gameplay, new title-screen UI, policy simulation,
and historical eras are not implemented yet. Do not confuse the imported 0 A.D.
executable with a complete, playable Zion A.D. game.

## Source and build

* Original developer documentation: [UPSTREAM-README.md](UPSTREAM-README.md)
* Current 0 A.D. project: https://gitea.wildfiregames.com/0ad/0ad
* Build instructions: https://gitea.wildfiregames.com/0ad/0ad/wiki/BuildInstructions
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
