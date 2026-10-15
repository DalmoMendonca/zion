#!/usr/bin/env bash
# Restore official development artwork without Git LFS credentials or old scripts.
# The SVN nightly tree contains the real copyrighted/licensed 0 A.D. art files
# and exposes a revision number so all restored directories come from one build.
set -euo pipefail
root="${1:-binaries/data/mods/public}"
upstream="https://svn.wildfiregames.com/nightly-build/trunk/binaries/data/mods/public/art"
revision="$(timeout 90s svn info --non-interactive --show-item revision "$upstream")"
[[ "$revision" =~ ^[0-9]+$ ]] || { echo "Invalid upstream SVN revision: $revision" >&2; exit 1; }
echo "ZION_UPSTREAM_ART_REVISION=$revision"
for relative in \
  textures/animated/water \
  textures/cursors \
  textures/misc \
  textures/ui \
  textures/terrain/types/water \
  materials
do
  destination="$root/art/$relative"
  mkdir -p "$(dirname "$destination")"
  echo "Restoring original 0 A.D. artwork: $relative"
  timeout 420s svn export --non-interactive --force --quiet \
    -r "$revision" "$upstream/$relative" "$destination"
done
python3 - "$root" "$revision" <<'PY'
from pathlib import Path
import sys

root = Path(sys.argv[1]) / "art"
revision = sys.argv[2]
required = [
    "textures/animated/water/noise/normal29.dds",
    "textures/animated/water/lake/normal0022.png",
    "textures/cursors/arrow-default-down.png",
]
for name in required:
    path = root / name
    assert path.is_file(), f"Official development artwork missing: {name}"
    assert path.stat().st_size > 512, f"Truncated development artwork: {name}"
    assert not path.read_bytes()[:80].startswith(b"version https://git-lfs.github.com/spec/v1"), (
        f"Unresolved LFS pointer: {name}")
    print(f"ZION_UPSTREAM_ART_VERIFIED: {name} ({path.stat().st_size} bytes)")
print(f"ZION_029_ART_RESTORED: SVN revision {revision}; verified water and cursor assets")
PY
