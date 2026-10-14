#!/usr/bin/env bash
# Verify the exact shipped archive from a relocated, previously empty directory.
# This is an in-engine installation smoke, not a human graphical playtest.
set -euo pipefail
if [[ $# -ne 1 || ! -s "$1" ]]; then
  echo "usage: $0 ZionAD-linux-alpha.tar.gz" >&2
  exit 2
fi
archive="$(realpath "$1")"
sandbox="$(mktemp -d)"
pid=""
cleanup() {
  if [[ -n "$pid" ]]; then
    kill -TERM "$pid" 2>/dev/null || true
    wait "$pid" 2>/dev/null || true
  fi
  rm -rf "$sandbox"
}
trap cleanup EXIT
python3 - "$archive" "$sandbox" <<'PY'
import pathlib, sys, tarfile
with tarfile.open(sys.argv[1], "r:gz") as archive:
    for member in archive:
        p = pathlib.PurePosixPath(member.name)
        assert p.parts and p.parts[0] == "ZionAD", member.name
        assert not p.is_absolute() and ".." not in p.parts, member.name
    # Reject symlink escapes and special device files.
    archive.extractall(sys.argv[2], filter="data")
PY
root="$sandbox/ZionAD"
for file in play-zion.sh binaries/system/pyrogenesis \
  binaries/data/mods/public/public.zip binaries/data/mods/mod/mod.zip \
  binaries/data/mods/public/maps/scripts/ZionVictory.js LICENSE.md; do
  test -s "$root/$file" || { echo "Missing packaged asset: $file" >&2; exit 1; }
done
python3 - "$root" <<'PY'
from pathlib import Path
from zipfile import ZipFile
import sys
root=Path(sys.argv[1])
with ZipFile(root/"binaries/data/mods/mod/mod.zip") as archive:
    names=set(archive.namelist())
    for font in ("LinBiolinum_Rah.ttf","LinBiolinum_RBah.ttf","DejaVuSansMono.ttf"):
        assert "fonts/"+font in names, "Required base-mod font missing: "+font
with ZipFile(root/"binaries/data/mods/public/public.zip") as archive:
    assert "maps/scenarios/arcadia.pmp" in archive.namelist(), "Native Arcadia terrain missing"
print("ZION_PACKAGE_ASSETS_OK: verified original licensed fonts and terrain")
PY
cd "$root/binaries/system"
export LD_LIBRARY_PATH="$PWD:${LD_LIBRARY_PATH:-}"
if ldd ./pyrogenesis | grep -F "not found"; then
  echo "Unresolved shared-library dependency in relocated game" >&2
  exit 1
fi
timeout --signal=TERM --kill-after=5s 120s "$root/play-zion.sh" \
  -autostart=scenarios/arcadia -autostart-victory=zion \
  -autostart-nonvisual -autostart-disable-replay -nosound -quickstart \
  > "$sandbox/package-game.log" 2>&1 &
pid=$!
ready=0
for ((i=0;i<110;i++)); do
  if grep -Fq "GAME STARTED, ALL INIT COMPLETE" "$sandbox/package-game.log" && \
     grep -Fq "ZION_SOCIAL_TICK_OK" "$sandbox/package-game.log"; then
    ready=1
    break
  fi
  if ! kill -0 "$pid" 2>/dev/null; then break; fi
  sleep 1
done
if ((ready != 1)); then
  echo "Relocated Pyrogenesis did not initialize and evaluate Zion society" >&2
  tail -100 "$sandbox/package-game.log" >&2 || true
  exit 1
fi
if grep -Ei '(^| )ERROR:|JavaScript error:|unhandled exception|assertion failed' "$sandbox/package-game.log"; then
  echo "Native game emitted an error in relocated installation" >&2
  exit 1
fi
printf 'ZION_PACKAGE_NATIVE_OK: installed executable booted and simulated civic welfare\n'
