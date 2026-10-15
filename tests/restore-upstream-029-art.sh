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
# The modern GUI, territory borders, coastal water, and default cursor are
# supplied by 0 A.D.'s BASE mod, not its public game mod. The previous public-
# only restoration left these exact textures as missing LFS placeholders.
base_upstream="https://svn.wildfiregames.com/nightly-build/trunk/binaries/data/mods/mod/art"
base_root="$(dirname "$root")/mod/art"
for relative in \
  textures/ui/global/modern \
  textures/terrain/types/water \
  textures/misc \
  textures/cursors
do
  destination="$base_root/$relative"
  mkdir -p "$(dirname "$destination")"
  echo "Restoring original 0 A.D. BASE artwork: $relative"
  timeout 420s svn export --non-interactive --force --quiet \
    -r "$revision" "$base_upstream/$relative" "$destination"
done

# The old default-arrow cursor and current public arrow-default-down artwork
# both use the same top-left hotspot; retain official upstream cursor metadata.
mkdir -p "$root/art/textures/cursors"
cp "$base_root/textures/cursors/default-arrow.txt" \
   "$root/art/textures/cursors/arrow-default-down.txt"

python3 - "$root" "$revision" <<'PY'
from pathlib import Path
import sys

root = Path(sys.argv[1]) / "art"
base = root.parent.parent / "mod" / "art"
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
base_required = [
    "textures/ui/global/modern/background.png",
    "textures/ui/global/modern/shadow-high.png",
    "textures/ui/global/modern/border.png",
    "textures/ui/global/modern/titlebar-middle.png",
    "textures/ui/global/modern/titlebar-left.png",
    "textures/terrain/types/water/coastalWave.png",
    "textures/terrain/types/water/foam.png",
    "textures/misc/territory_border.png",
    "textures/misc/territory_border_mask.png",
    "textures/cursors/default-arrow.png",
    "textures/cursors/default-arrow.txt",
]
for name in base_required:
    file = base / name
    assert file.is_file() and file.stat().st_size > 0, f"Missing base-mod artwork: {name}"
    assert not file.read_bytes()[:80].startswith(b"version https://git-lfs.github.com/spec/v1"), (
        f"Unresolved base-mod LFS pointer: {name}")
    print(f"ZION_029_BASE_ART_VERIFIED: {name} ({file.stat().st_size} bytes)")
hotspot = root / "textures/cursors/arrow-default-down.txt"
assert hotspot.is_file() and hotspot.read_text().strip(), "Default cursor hotspot missing"
print(f"ZION_029_BASE_ART_OK: restored modern GUI, territory, coastal water and cursor hotspots")
print(f"ZION_029_ART_RESTORED: SVN revision {revision}; verified water and cursor assets")
PY
