"""Preserve the existing font subsets; supply missing Korean content glyphs only.

Requires fonttools[woff] and brotli. Input: extracted official pretendard@1.3.9
package directory (contains dist/web/static/woff2). Not part of the web build.
"""
import hashlib
import json
import re
import shutil
import sys
from pathlib import Path
from fontTools import subset
from fontTools.ttLib import TTFont

ROOT = Path(__file__).resolve().parents[1]
SOURCE = Path(sys.argv[1])
OUT = ROOT / 'assets/home-r43'
OUT.mkdir(parents=True, exist_ok=True)
sources = [ROOT/'index.html', ROOT/'review/journey.html']
sources += [ROOT/'assets/js'/name for name in [
    'main-landing-r2.js', 'spatial-demo.js', 'main-landing-r4.js',
    'main-landing-r43.js', 'journey-r43.js', 'share-r43.js',
]]
needed = {ord(c) for f in sources for c in f.read_text() if '\uac00' <= c <= '\ud7a3'}
manifest = {'source': 'pretendard@1.3.9 official npm package',
            'sourceRepository': 'https://github.com/orioncactus/pretendard',
            'license': 'SIL Open Font License 1.1',
            'family': 'Weplace Content Supplement',
            'purpose': 'Renamed modified subsets containing Korean glyphs absent from preserved R2 fonts.',
            'sourceFiles': [str(f.relative_to(ROOT)) for f in sources], 'fonts': []}
rules = []
for style, weight in [('Regular', 400), ('SemiBold', 600)]:
    original = ROOT/f'assets/home-r2/Pretendard-{style}.woff2'
    missing = needed - set(TTFont(original).getBestCmap())
    source = SOURCE/f'dist/web/static/woff2/Pretendard-{style}.woff2'
    font = TTFont(source)
    assert missing <= set(font.getBestCmap()), 'Source font cannot cover requested content'
    options = subset.Options()
    options.flavor = 'woff2'
    sub = subset.Subsetter(options=options)
    sub.populate(unicodes=missing)
    sub.subset(font)
    names = {1: 'Weplace Content Supplement', 2: style,
             3: 'WeplaceContentSupplement-R43-' + style,
             4: 'Weplace Content Supplement ' + style,
             6: 'WeplaceContentSupplement-' + style,
             16: 'Weplace Content Supplement', 17: style}
    for name_id, value in names.items():
        font['name'].setName(value, name_id, 3, 1, 0x409)
        font['name'].setName(value, name_id, 1, 0, 0)
    target = OUT/f'WeplaceContentSupplement-{style}.woff2'
    font.save(target)
    union = set(TTFont(original).getBestCmap()) | set(TTFont(target).getBestCmap())
    assert needed <= union
    unicode_range = ','.join('U+'+format(c, 'X') for c in sorted(missing))
    rules.append('@font-face{font-family:"Weplace Content Supplement";src:url("../home-r43/'+target.name+'");font-weight:'+('600 900' if weight==600 else '400')+';font-style:normal;font-display:swap;unicode-range:'+unicode_range+'}')
    manifest['fonts'].append({'file': str(target.relative_to(ROOT)),
        'sourceSha256': hashlib.sha256(source.read_bytes()).hexdigest(),
        'sha256': hashlib.sha256(target.read_bytes()).hexdigest(), 'bytes': target.stat().st_size,
        'supplementedCharacters': ''.join(map(chr, sorted(missing))),
        'coveredContentHangulCount': len(needed), 'missingContentHangulCount': len(needed-union)})
rules.append('.home-r43,.journey-page{font-family:Pretendard,"Weplace Content Supplement",-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}')
(ROOT/'assets/css/r43-font-supplement.css').write_text('\n'.join(rules)+'\n')
(OUT/'FONT-LICENSE.txt').write_text('\n'.join(line.rstrip() for line in (SOURCE/'dist/LICENSE.txt').read_text().splitlines())+'\n')
(ROOT/'docs/r4-spatial/r43/font-coverage.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2)+'\n')
print(json.dumps(manifest, ensure_ascii=False, indent=2))
