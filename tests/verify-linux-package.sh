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
# Simulate a first-time user without any pre-existing 0 A.D. configuration.
export HOME="$sandbox/home"
mkdir -p "$HOME"
pid=""
cleanup() {
  if [[ -n "$pid" ]]; then
    kill -TERM "$pid" 2>/dev/null || true
    wait "$pid" 2>/dev/null || true
  fi
  if [[ -n "${ZION_PACKAGE_LOG_PATH:-}" && -f "$sandbox/package-game.log" ]]; then
    mkdir -p "$(dirname "$ZION_PACKAGE_LOG_PATH")"
    cp "$sandbox/package-game.log" "$ZION_PACKAGE_LOG_PATH"
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
  binaries/data/mods/public/maps/scenarios/arcadia.pmp \
  binaries/data/mods/public/maps/scenarios/sandbox_athenians.pmp \
  binaries/data/mods/public/maps/scripts/ZionVictory.js LICENSE.md; do
  test -s "$root/$file" || { echo "Missing packaged asset: $file" >&2; exit 1; }
done
python3 - "$root" <<'PY'
from pathlib import Path
import sys
root=Path(sys.argv[1])
base=root/"binaries/data/mods/mod"
public=root/"binaries/data/mods/public"
for font in ("LinBiolinum_Rah.ttf","LinBiolinum_RBah.ttf","DejaVuSansMono.ttf"):
    p=base/"fonts"/font
    assert p.is_file() and p.stat().st_size>1024, "Required base-mod font missing: "+font
assert (public/"maps/scenarios/arcadia.pmp").stat().st_size>100_000, "Native terrain missing"
assert (public/"maps/scenarios/sandbox_athenians.pmp").stat().st_size>100_000, "Sandbox terrain missing"
assert not (public/"public.zip").exists(), "Old upstream ZIP can shadow current Zion scripts"
assert not (base/"mod.zip").exists(), "Old bootstrap ZIP can shadow current Zion scripts"
assert (public/"art").is_dir(), "Actor artwork missing"
print("ZION_PACKAGE_ASSETS_OK: verified original licensed fonts, terrain and fork script isolation")
PY
cd "$root/binaries/system"
export LD_LIBRARY_PATH="$PWD:${LD_LIBRARY_PATH:-}"
if ldd ./pyrogenesis | grep -F "not found"; then
  echo "Unresolved shared-library dependency in relocated game" >&2
  exit 1
fi
timeout --signal=TERM --kill-after=5s 160s "$root/play-zion.sh" \
  -autostart=scenarios/sandbox_athenians -autostart-victory=zion \
  -autostart-nonvisual -autostart-disable-replay -nosound -quickstart \
  > "$sandbox/package-game.log" 2>&1 &
pid=$!
ready=0
for ((i=0;i<140;i++)); do
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
  if command -v gdb >/dev/null 2>&1; then
    echo "Collecting a native startup backtrace in a clean installation" >&2
    timeout 35s gdb -batch -ex "set pagination off" -ex "run" -ex "thread apply all bt 12" --args \
      "$root/binaries/system/pyrogenesis" -mod=public -quickstart \
      -autostart=scenarios/sandbox_athenians -autostart-victory=zion \
      -autostart-nonvisual -autostart-disable-replay -nosound \
      > "$sandbox/package-backtrace.log" 2>&1 || true
    tail -140 "$sandbox/package-backtrace.log" >&2 || true
    if [[ -n "${ZION_PACKAGE_BACKTRACE_PATH:-}" ]]; then
      mkdir -p "$(dirname "$ZION_PACKAGE_BACKTRACE_PATH")"
      cp "$sandbox/package-backtrace.log" "$ZION_PACKAGE_BACKTRACE_PATH"
    fi
  fi
  exit 1
fi
if grep -Ei '(^| )ERROR:|JavaScript error:|unhandled exception|assertion failed' "$sandbox/package-game.log"; then
  echo "Native game emitted an error in relocated installation" >&2
  exit 1
fi
printf 'ZION_PACKAGE_NATIVE_OK: installed executable booted and simulated civic welfare\n'
