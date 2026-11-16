from pathlib import Path
import subprocess, sys, types, json, hashlib

OUT=Path(__file__).parent
FONT=Path(sys.argv[1]) if len(sys.argv)>1 else OUT.parent.parent/'home-r2'/'Pretendard-SemiBold.woff2'
def decompress(data):
    return subprocess.run(['node','-e',"process.stdout.write(require('zlib').brotliDecompressSync(require('fs').readFileSync(0)))"],input=data,stdout=subprocess.PIPE,check=True).stdout
sys.modules['brotli']=types.SimpleNamespace(decompress=decompress)
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
font=TTFont(FONT)
glyphs=font.getGlyphSet()
cmap=font.getBestCmap()
upem=font['head'].unitsPerEm

PALETTE={'paper':'#F5F0E9','ink':'#20352D','forest':'#285247','sage':'#AAB69E','gold':'#C8A56B','white':'#FFFDFA'}

def text_paths(text,x,y,size,fill,letter_spacing=0):
    parts=[]; cursor=0; scale=size/upem
    for char in text:
        glyph_name=cmap.get(ord(char))
        if not glyph_name: raise ValueError(f'Missing glyph {char!r}')
        pen=SVGPathPen(glyphs); glyphs[glyph_name].draw(pen)
        if pen.getCommands():
            color=PALETTE['gold'] if char==',' else fill
            parts.append(f'<path fill="{color}" d="{pen.getCommands()}" transform="translate({x+cursor:.3f} {y}) scale({scale:.8f} {-scale:.8f})"/>')
        cursor+=font['hmtx'][glyph_name][0]*scale+letter_spacing
    return ''.join(parts),cursor

def ribbon_defs(suffix=''):
    return f'''<defs>
      <linearGradient id="left{suffix}" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#396B57"/><stop offset="1" stop-color="#12372C"/></linearGradient>
      <linearGradient id="rise{suffix}" x1="0" y1="1" x2="1" y2="0"><stop stop-color="#657E62"/><stop offset="0.52" stop-color="#C6CDB0"/><stop offset="1" stop-color="#AAB69E"/></linearGradient>
      <linearGradient id="fold{suffix}" x1="0" y1="0" x2="0.8" y2="1"><stop stop-color="#D1D6BA"/><stop offset="0.6" stop-color="#8C9F80"/><stop offset="1" stop-color="#47674F"/></linearGradient>
      <linearGradient id="end{suffix}" x1="0" y1="1" x2="1" y2="0"><stop stop-color="#5F7A5B"/><stop offset="1" stop-color="#B8C5A7"/></linearGradient>
    </defs>'''

def ribbon(suffix='',flat=False):
    colors=[PALETTE['forest'],PALETTE['sage'],'#708D6C','#9FB190'] if flat else [f'url(#left{suffix})',f'url(#rise{suffix})',f'url(#fold{suffix})',f'url(#end{suffix})']
    return f'''<g>
      <path fill="{colors[0]}" d="M14 20H136C176 20 190 30 210 74L302 262C268 298 226 309 183 305C151 302 136 281 118 245L3 38C-3 25 1 20 14 20Z"/>
      <path fill="{colors[1]}" d="M156 286C177 311 207 309 229 275L330 111C343 89 358 94 371 126L326 225C310 265 293 303 247 317C216 326 177 319 156 286Z"/>
      <path fill="{colors[2]}" d="M330 111C341 90 355 97 383 97H407C450 97 471 115 488 155L526 251C534 272 539 292 548 303C528 323 503 323 484 303C472 291 464 271 454 245L389 117C369 84 345 92 330 111Z"/>
      <path fill="{colors[3]}" d="M484 303C504 324 526 325 548 304C566 287 576 260 588 234L644 147C649 138 644 136 636 136H591C569 136 557 150 548 171L496 278C489 292 484 298 484 303Z"/>
      <circle cx="619" cy="62" r="60" fill="{PALETTE['gold']}"/>
    </g>'''

def svg(width,height,body,viewbox=None,title='Weplace'):
    return f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="{viewbox or f"0 0 {width} {height}"}" role="img" aria-label="{title}"><title>{title}</title>{body}</svg>\n'

def horizontal(reverse=False):
    fill=PALETTE['white'] if reverse else PALETTE['ink']
    word,width=text_paths('Weplace',119,65,64,fill,-1.4)
    comma=f'<path fill="#C8A56B" transform="translate({122+width:.3f} 55) scale(.78)" d="M7 0C2 0 0 3 0 7C0 11 2 13 6 13C6 18 3 22 0 24C8 22 15 15 15 8C15 3 12 0 7 0Z"/>'
    return svg(400,90,ribbon_defs()+f'<g transform="translate(0 19) scale(.162)">{ribbon()}</g>'+word+comma)

(OUT/'weplace-logo-light.svg').write_text(horizontal())
(OUT/'weplace-logo-dark.svg').write_text(horizontal(True))
(OUT/'weplace-symbol.svg').write_text(svg(680,330,ribbon_defs()+ribbon()))
(OUT/'weplace-symbol-flat.svg').write_text(svg(680,330,ribbon(flat=True)))

# Deliberately simplified small-size mark: separate strong silhouette and dot.
small='''<rect width="96" height="96" rx="23" fill="#F5F0E9"/>
<path d="M12 28H26L38 65L49 40H61L70 63L80 42H91L76 76C73 82 65 82 62 75L54 57L43 78C39 84 31 83 28 76Z" fill="#285247"/>
<path d="M38 65L49 40H61L54 57L43 78C40 83 35 84 31 80Z" fill="#AAB69E"/>
<circle cx="82" cy="24" r="10" fill="#C8A56B"/>'''
(OUT/'favicon.svg').write_text(svg(96,96,small))

# Home-screen icon uses the small-size family with more comfortable padding.
(OUT/'apple-touch-icon.svg').write_text(svg(180,180,'<rect width="180" height="180" rx="0" fill="#F5F0E9"/><g transform="translate(18 18) scale(1.5)">'+small+'</g>'))

word,_=text_paths('Weplace,',72,160,76,PALETTE['ink'],-1.6)
headline,_=text_paths('매장의 변화,',72,325,62,PALETTE['ink'],-1.6)
headline2,_=text_paths('실행과 기록으로.',72,405,62,PALETTE['ink'],-1.6)
sub,_=text_paths('사진 · 안내 · 검색 · 예약의 흐름',75,505,24,'#52635B',-.1)
og=svg(1200,630,ribbon_defs('og')+'<rect width="1200" height="630" fill="#F5F0E9"/><rect x="832" width="368" height="630" fill="#E8EBDD"/><path d="M72 555H1128" stroke="#C9CFC0"/>'+word+headline+headline2+sub+f'<g transform="translate(740 219) scale(.57)">{ribbon("og")}</g>'+'<circle cx="1117" cy="555" r="6" fill="#C8A56B"/>')
(OUT/'og-weplace-r42.svg').write_text(og)

names={r.nameID:r.toUnicode() for r in font['name'].names if r.nameID in [1,2,6,13,14]}
(OUT/'font-provenance.json').write_text(json.dumps({'source':'assets/home-r2/Pretendard-SemiBold.woff2','sha256':hashlib.sha256(FONT.read_bytes()).hexdigest(),'nameTable':names,'wordmark':'Glyph outlines, tracking adjusted. No embedded font bytes.','photoReference':'upload/image(20261103-134948).png','vectorStatus':'Web-native interpretation of supplied raster reference; not an exact source-logo extraction.'},ensure_ascii=False,indent=2))
print(json.dumps({'font':names,'svg_files':sorted(p.name for p in OUT.glob('*.svg'))},ensure_ascii=False))
