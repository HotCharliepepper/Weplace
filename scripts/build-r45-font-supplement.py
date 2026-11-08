"""Add only R4.5 Hangul missing from the preserved R2 + R4.3 font subsets.

Input: extracted official pretendard@1.3.9 package directory. Requires fonttools[woff].
"""
import hashlib
import json
import sys
from pathlib import Path
from fontTools import subset
from fontTools.ttLib import TTFont

root = Path(__file__).resolve().parents[1]
source = Path(sys.argv[1])
sources = [root/'index.html', root/'assets/js/main-landing-r45.js']
needed = {ord(c) for f in sources for c in f.read_text() if '\uac00' <= c <= '\ud7a3'}
out = root/'assets/home-r45'
out.mkdir(parents=True, exist_ok=True)
manifest = {'source': 'pretendard@1.3.9 official npm package', 'license': 'SIL Open Font License 1.1', 'fonts': []}
rules = []
for style, weight in [('Regular', 400), ('SemiBold', 600)]:
    existing = set(TTFont(root/f'assets/home-r2/Pretendard-{style}.woff2').getBestCmap())
    existing |= set(TTFont(root/f'assets/home-r43/WeplaceContentSupplement-{style}.woff2').getBestCmap())
    existing |= set(TTFont(root/f'assets/home-r44/WeplaceHeroSupplement-{style}.woff2').getBestCmap())
    missing = needed - existing
    font_source = source/f'dist/web/static/woff2/Pretendard-{style}.woff2'
    font = TTFont(font_source)
    assert missing <= set(font.getBestCmap())
    options = subset.Options(); options.flavor = 'woff2'
    sub = subset.Subsetter(options=options); sub.populate(unicodes=missing); sub.subset(font)
    names = {1:'Weplace Path Supplement',2:style,3:'WeplacePathSupplement-R45-'+style,4:'Weplace Path Supplement '+style,6:'WeplacePathSupplement-'+style,16:'Weplace Path Supplement',17:style}
    for name_id, value in names.items():
        font['name'].setName(value,name_id,3,1,0x409)
        font['name'].setName(value,name_id,1,0,0)
    dest = out/f'WeplacePathSupplement-{style}.woff2'; font.save(dest)
    union = existing | set(TTFont(dest).getBestCmap())
    assert needed <= union
    rules.append('@font-face{font-family:"Weplace Path Supplement";src:url("../home-r45/'+dest.name+'");font-weight:'+('600 900' if weight==600 else '400')+';font-style:normal;font-display:swap;unicode-range:'+','.join('U+'+format(c,'X') for c in sorted(missing))+'}')
    manifest['fonts'].append({'file':str(dest.relative_to(root)), 'bytes':dest.stat().st_size, 'sha256':hashlib.sha256(dest.read_bytes()).hexdigest(), 'supplementedCharacters':''.join(map(chr,sorted(missing))), 'missingContentHangulCount':len(needed-union)})
rules.append('.home-r45{font-family:Pretendard,"Weplace Content Supplement","Weplace Hero Supplement","Weplace Path Supplement",-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}')
(root/'assets/css/r45-font-supplement.css').write_text('\n'.join(rules)+'\n')
(out/'FONT-LICENSE.txt').write_text((source/'dist/LICENSE.txt').read_text())
(root/'docs/r4-spatial/r45/font-coverage.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
print(json.dumps(manifest,ensure_ascii=False))
