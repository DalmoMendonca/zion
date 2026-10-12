#!/usr/bin/env python3
"""Pack a mod.io-compatible mod, standalone browser demo, and editable source tree.

No Pyrogenesis binary required; pyromod is a ZIP container. The archive is
compatible with standard mod-install conventions, but real-engine play must be tested.
"""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
from html import escape
import json

ROOT=Path(__file__).resolve().parents[1]
DIST=ROOT.parent
VERSION=json.loads((ROOT/'mod.json').read_text())['version']
MOD_DIRS=('maps','simulation')

def pack_mod():
    output=DIST/f'zion-ad-{VERSION}.pyromod'
    with ZipFile(output,'w',ZIP_DEFLATED) as z:
        for file in [ROOT/'mod.json',ROOT/'COPYING']:
            z.write(file,file.relative_to(ROOT))
        for folder in MOD_DIRS:
            for file in sorted((ROOT/folder).rglob('*')):
                if file.is_file():z.write(file,file.relative_to(ROOT))
    return output

def play_html():
    html=(ROOT/'web/index.html').read_text()
    css=(ROOT/'web/style.css').read_text()
    core=(ROOT/'maps/scripts/ZionCore.js').read_text()
    app=(ROOT/'web/app.js').read_text()
    html=html.replace('<link rel="stylesheet" href="style.css" />',f'<style>\n{css}\n</style>')
    html=html.replace('<script src="../maps/scripts/ZionCore.js"></script>',f'<script>\n{core}\n</script>')
    html=html.replace('<script src="app.js"></script>',f'<script>\n{app}\n</script>')
    output=DIST/'zion-ad-play.html'
    output.write_text(html)
    return output

def pack_source():
    output=DIST/f'zion-ad-{VERSION}-source.zip'
    with ZipFile(output,'w',ZIP_DEFLATED) as z:
        for file in sorted(ROOT.rglob('*')):
            if file.is_file() and '.git' not in file.parts and '__pycache__' not in file.parts:
                z.write(file,Path('zion-ad')/file.relative_to(ROOT))
    return output

if __name__=='__main__':
    for path in (pack_mod(),play_html(),pack_source()):
        print(f'{path} ({path.stat().st_size:,} bytes)')
