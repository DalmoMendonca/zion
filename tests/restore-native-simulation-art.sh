#!/usr/bin/env bash
# Hydrate the exact original scenario and worker animations needed by the
# native simulation tests. Avoid anonymous Git LFS endpoints: the official
# nightly Subversion repository contains real binary assets, not pointers.
set -euo pipefail

root="${1:-binaries/data/mods/public}"
upstream="https://svn.wildfiregames.com/nightly-build/trunk/binaries/data/mods/public"
revision="$(timeout 90s svn info --non-interactive --show-item revision "$upstream")"
[[ "$revision" =~ ^[0-9]+$ ]] || { echo "Invalid original-asset revision: $revision" >&2; exit 1; }
echo "ZION_NATIVE_ART_REVISION=$revision"

files=(
  maps/scenarios/arcadia.pmp
  art/animation/biped/citizen/idle_relax_f.dae
  art/animation/biped/citizen/walk_relax_f.dae
  art/animation/biped/citizen/build.dae
  art/animation/biped/gatherer/farming.dae
  art/animation/biped/gatherer/gather_wood.dae
  art/animation/biped/gatherer/carry_grain_f.dae
)
for relative in "${files[@]}"; do
  destination="$root/$relative"
  mkdir -p "$(dirname "$destination")"
  timeout 150s svn export --non-interactive --force --quiet \
    -r "$revision" "$upstream/$relative" "$destination"
done

python3 - "$root" "${files[@]}" <<'PY'
from pathlib import Path
import sys

root = Path(sys.argv[1])
for name in sys.argv[2:]:
    path = root / name
    data = path.read_bytes()
    assert len(data) > 512, f"Missing or unhydrated official original asset: {name}"
    assert not data.startswith(b"version https://git-lfs.github.com/spec/v1"), (
        f"Unresolved Git LFS placeholder: {name}")
    if name.endswith(".pmp"):
        assert len(data) > 100_000 and data.startswith(b"PSMP"), (
            f"Invalid authentic original scenario: {name}")
    else:
        assert b"COLLADA" in data[:8192], f"Not a COLLADA animation: {name}"
    print(f"ZION_NATIVE_ASSET_VERIFIED: {name} ({len(data)} bytes)")
PY
