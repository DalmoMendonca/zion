# Build and launch the real Zion A.D. engine (Linux)

This repository is the actual 0 A.D. / Pyrogenesis source fork. It does not
contain a browser prototype or an independent plug-in game engine.

## Linux dependencies

On Ubuntu 24.04:

```sh
sudo apt-get update
sudo apt-get install -y build-essential cargo cmake curl git-lfs pkg-config \
    python3 m4 libboost-dev libboost-system-dev libboost-filesystem-dev \
    libcurl4-gnutls-dev libenet-dev libfmt-dev libfreetype-dev \
    libgloox-dev libicu-dev libminiupnpc-dev libogg-dev libopenal-dev \
    libpng-dev libsdl2-dev libsodium-dev libvorbis-dev libwxgtk3.2-dev \
    libxml2-dev libxcursor-dev libgl1-mesa-dev libglu1-mesa-dev \
    libvulkan-dev llvm subversion zlib1g-dev xvfb
```

0 A.D. presently embeds Mozilla SpiderMonkey 128.13.0. Mozilla's Rust
host-triplet detection in that version fails with Rust 1.98 and newer
[Mozilla bug 2053518](https://bugzilla.mozilla.org/show_bug.cgi?id=2053518).
A reliable workaround for source builds is:

```sh
rustup toolchain install 1.97.1 --profile minimal
rustup default 1.97.1
cargo install --locked cbindgen@0.29.0
```

## Compile

```sh
git clone https://github.com/DalmoMendonca/zion.git
cd zion
git lfs install
git lfs pull
# Tests and the scenario editor can be omitted for faster first smoke builds.
bash libraries/build-source-libs.sh --without-nvtt --with-system-cxxtest -j3
bash build/workspaces/update-workspaces.sh \
    --with-system-cxxtest --without-nvtt --without-atlas \
    --without-lobby --without-tests --without-audio
make -C build/workspaces/gcc -j3 config=release
binaries/system/pyrogenesis -version
```

The game uses the original art tracked in Wildfire Games' Git LFS server.
The fork's `.lfsconfig` points to that official host; do not replace
the pointer files with blank artwork.

## Start the native game

```sh
cd binaries/system
./pyrogenesis
```

Start a single-player match with `Zion A.D. — First Covenant` as the
victory condition. Research government institutions from Civic Centers.
The [first-playable guide](FIRST-PLAYABLE.md) explains the rules.

For automated simulation without graphics:

```sh
cd binaries/system
./pyrogenesis -autostart=scenarios/arcadia -autostart-victory=zion \
    -autostart-nonvisual -autostart-disable-replay -nosound -quickstart
```

A genuine smoke-test run should print `GAME STARTED, ALL INIT COMPLETE`
and then simulated turns. Error details are in the game's main log.

## Continuous integration and verification status

The [native engine smoke workflow](../.github/workflows/native-engine-smoke.yml)
tries to compile and launch Pyrogenesis on every relevant engine/gameplay
change. This is a full source compile, not the earlier Node-only test harness.
A separate [game asset validation](../.github/workflows/verify-upstream-assets.yml)
confirms maps and artwork can be retrieved from the upstream LFS server.

Check the workflow run's conclusion and logs before claiming a full engine build
or in-game functionality has passed. An active run is not evidence of success.
