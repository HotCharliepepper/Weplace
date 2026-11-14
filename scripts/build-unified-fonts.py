"""Supplement only glyphs missing from the reused local RF Sans subsets.
Source: installed Noto CJK, SIL OFL 1.1 (existing license copied alongside).
"""
from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools import subset
import json,hashlib
root=Path(__file__).resolve().parents[1]
text=(root/'unified-r3.html').read_text()+(root/'assets/js/unified-r3.js').read_text()
needed={ord(c) for c in text if '\uac00'<=c<='\ud7a3'}
out=root/'assets/unified-r3/fonts';out.mkdir(parents=True,exist_ok=True)
rules=[];manifest=[]
for style,w in [('Regular','400'),('Bold','600 900')]:
    base=root/('assets/ad-funnel-r2a/fonts/WeplaceFunnelSans'+('Bold' if style=='Bold' else '')+'.woff2')
    old=set(TTFont(base).getBestCmap())|set(TTFont(root/f'assets/resolute-fast-r1/fonts/WeplaceResoluteSupplement-{style}.woff').getBestCmap())
    missing=needed-old
    font=TTFont('/usr/share/fonts/opentype/noto/NotoSansCJK-'+style+'.ttc',fontNumber=1)
    assert missing<=set(font.getBestCmap())
    opt=subset.Options();opt.flavor='woff2';s=subset.Subsetter(options=opt);s.populate(unicodes=missing);s.subset(font);font.flavor='woff2'
    for nid in [1,3,4,6,16]:font['name'].setName('WeplaceUnifiedSupplement-'+style,nid,3,1,0x409)
    dest=out/f'WeplaceUnifiedSupplement-{style}.woff2';font.save(dest)
    rules.append('@font-face{font-family:"Unified Supplement";src:url("/assets/unified-r3/fonts/'+dest.name+'");font-weight:'+w+';font-display:swap;unicode-range:'+','.join('U+'+format(c,'X') for c in sorted(missing))+'}')
    manifest.append({'file':str(dest.relative_to(root)),'bytes':dest.stat().st_size,'characters':''.join(map(chr,sorted(missing))),'sha256':hashlib.sha256(dest.read_bytes()).hexdigest(),'missingAfter':0})
rules.append('.unified-r3{--rf-font:"Unified Supplement","RF Sans","Noto Sans CJK KR","Apple SD Gothic Neo","Malgun Gothic",sans-serif}')
(root/'assets/css/unified-r3-fonts.css').write_text('\n'.join(rules)+'\n')
(out/'LICENSE.txt').write_bytes((root/'assets/ad-funnel-r2a/fonts/LICENSE.txt').read_bytes())
(root/'docs/unified-r3/font-coverage.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2))
print(json.dumps(manifest,ensure_ascii=False))
