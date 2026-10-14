"""Generate paired public homepages; no packages, network access or credentials needed.

Edit index.html (Korean), content/pricing-guide.json, en-translations.json,
and research-{ko,en}.fragment.html, then run: python3 scripts/build-pages.py.
Prices remain proposals while status == draft. Do not publish before owner review.
"""
from pathlib import Path
from html.parser import HTMLParser
from html import escape
import json, re

ROOT = Path(__file__).resolve().parent.parent
D = json.loads((ROOT / 'en-translations.json').read_text())
P = json.loads((ROOT / 'content/pricing-guide.json').read_text())

def price_section(lang):
    en = lang == 'en'
    title = 'Three ways to begin.<br>A clear scope for each.' if en else '지금 필요한 일부터.<br>세 가지 시작 기준.'
    intro = ('Choose by the problem you need to solve. Start with a budget guideline, then agree on scope and a final quote.' if en else '어떤 문제가 먼저인지에 따라 선택합니다. 기본 예산과 포함 범위를 확인하고, 상담 후 필요한 업무와 최종 금액을 정합니다.')
    draft = P['status'] == 'draft'
    status = ('PROPOSED STARTING FEES · UNDER REVIEW' if en else '검토용 기본가 · 정식 요금 확정 전') if draft else ('SERVICE PRICE GUIDE' if en else '서비스 가격 가이드')
    cards = []
    for service in P['services']:
        c = service[lang]
        price = ('₩' + format(service['amount'], ',')) if en else (format(service['amount']//10000, ',') + '만 원')
        unit = ('per month' if service['unit']=='month' else 'per project') if en else ('월' if service['unit']=='month' else '프로젝트')
        suffix = (f'From · {unit} · VAT excluded' if en else f'{unit} 기준 시작가 · 부가세 별도')
        items = ''.join('<li>'+escape(x)+'</li>' for x in c['includes'])
        label = 'Discuss '+c['name'].lower()+' ↗' if en else c['name']+' 상담하기 ↗'
        cards.append(f'<article class="price-card" id="service-{service["id"]}"><div class="research-meta">{service["id"].upper()}</div><h3>{escape(c["name"])}</h3><p class="price-problem">{escape(c["question"])}</p><div class="price-amount">{price}<small>{suffix}</small></div><ul>{items}</ul><p class="price-exclusions">{escape(c["excludes"])}</p><a class="button button-dark" href="#contact" data-lead="service_{service["id"]}">{escape(label)}</a></article>')
    overlap = ('Combining services? We scope shared work once and separate the deliverables, media budget and operating fees in your quote.' if en else '여러 서비스를 함께 진행하면 겹치는 업무를 한 번만 산정합니다. 견적서에는 납품물·운영비·광고 집행비를 나누어 표시합니다.')
    terms = ('All amounts are in Korean won, exclusive of VAT. These are proposed starting fees, not a confirmed offer. Final fees, setup costs, quantities, term, revision scope and payment conditions are agreed before work begins. No ranking, AI recommendation or revenue guarantee. English support and additional languages are confirmed during consultation.' if en else '위 금액과 수량은 운영 검토를 위한 제안이며 확정 견적이 아닙니다. 모든 금액은 원화·부가세 별도입니다. 초기 구축비, 최종 수량, 기간, 수정 범위와 결제 조건은 착수 전 견적서로 합의합니다. 검색 순위·AI 추천·매출 보장은 포함하지 않습니다. 외국어 대응 범위는 상담 후 정합니다.')
    return f'<section class="section price-section" id="services"><div class="wrap"><div class="eyebrow">ADVERTISING / BRANDING / MARKETING</div><div class="price-intro"><h2>{title}</h2><p class="lede" style="margin-top:24px">{intro}</p></div><span class="price-status">{status}</span><div class="price-grid">{"".join(cards)}</div><p class="price-overlap">{overlap}</p><p class="price-terms">{terms}</p></div></section>'

class Translator(HTMLParser):
    def __init__(self): super().__init__(convert_charrefs=False); self.out=[]; self.mode=None; self.missing=set()
    def translate(self, text):
        key=text.strip()
        if key in D:
            leading=text[:len(text)-len(text.lstrip())]; trailing=text[len(text.rstrip()):]
            return leading+D[key]+trailing
        if re.search('[가-힣]',key) and key != '한국어': self.missing.add(key)
        return text
    def handle_starttag(self,tag,attrs):
        if tag in ('script','style'): self.mode=tag
        result=[]
        for key,value in attrs:
            if value is None: result.append(key); continue
            if key in ('alt','title','aria-label','placeholder','data-audit','content'): value=self.translate(value)
            result.append(key+'="'+escape(value,quote=True)+'"')
        self.out.append('<'+tag+(' '+' '.join(result) if result else '')+'>')
    def handle_startendtag(self,tag,attrs):
        self.handle_starttag(tag,attrs); self.out[-1]=self.out[-1][:-1]+'/>'
    def handle_endtag(self,tag):
        self.out.append('</'+tag+'>')
        if tag in ('script','style'):self.mode=None
    def handle_data(self,data):
        if self.mode=='script':
            # Translate fixed single-quoted JS strings using JSON escaping.
            def translate_literal(match):
                value=match.group(1)
                if re.search('[가-힣]',value):
                    if value not in D:self.missing.add('JS: '+value)
                    return json.dumps(D.get(value,value),ensure_ascii=False)
                return match.group(0)
            if not data.lstrip().startswith('{'):
                data=re.sub(r"'([^'\\]*(?:\\.[^'\\]*)*)'",translate_literal,data)
            self.out.append(data)
        elif self.mode=='style':self.out.append(data)
        else:self.out.append(escape(self.translate(data),quote=False))
    def handle_entityref(self,name):self.out.append('&'+name+';')
    def handle_charref(self,name):self.out.append('&#'+name+';')
    def handle_comment(self,data):self.out.append('<!--'+data+'-->')
    def handle_decl(self,decl):self.out.append('<!'+decl+'>')

ko=(ROOT/'index.html').read_text()
research_ko=(ROOT/'research-ko.fragment.html').read_text()
research_en=(ROOT/'research-en.fragment.html').read_text()
marker='<!-- MARKET UPDATE START -->'
if marker in ko:
    ko=re.sub(r'<!-- MARKET UPDATE START -->.*?<!-- MARKET UPDATE END -->', marker+research_ko+price_section('ko')+'<!-- MARKET UPDATE END -->',ko,flags=re.S)
else:
    ko=ko.replace('<section class="section" id="faq">',marker+research_ko+price_section('ko')+'<!-- MARKET UPDATE END -->\n<section class="section" id="faq">',1)
if '/assets/market-update.css' not in ko:
    ko=ko.replace('</head>','<link rel="stylesheet" href="/assets/market-update.css">\n</head>')
if 'hreflang="en"' not in ko:
    ko=ko.replace('<link rel="canonical" href="https://withweplace.kr/">','<link rel="canonical" href="https://withweplace.kr/">\n<link rel="alternate" hreflang="ko" href="https://withweplace.kr/">\n<link rel="alternate" hreflang="en" href="https://withweplace.kr/en/">\n<link rel="alternate" hreflang="x-default" href="https://withweplace.kr/">')
if 'class="language-switch"' not in ko:
    ko=ko.replace('  <a href="#contact" class="nav-cta"','  <div class="language-switch" aria-label="Language"><span lang="ko" aria-current="page">한국어</span><a lang="en" hreflang="en" href="/en/">EN</a></div>\n  <a href="#contact" class="nav-cta"')
ko=ko.replace('<a href="#industries">업종별 시스템</a>','<a href="#research">AI·외국인 고객</a><a href="#services">서비스·가격</a>')
D.update({'AI·외국인 고객':'AI & tourism','서비스·가격':'Services'})
# Price FAQ points at the actual visible guide, in both language versions.
ko=ko.replace('매장 규모, 현재 정보의 상태, 촬영·제작·운영 범위에 따라 달라집니다. 먼저 진단으로 필요한 작업을 확인한 뒤 범위와 비용, 일정을 구분해 제안합니다.','광고대행·브랜딩·마케팅의 기본가와 포함 범위는 위 서비스·가격 가이드에서 확인할 수 있습니다. 최종 수량, 기간, 별도 비용은 상담 후 견적서로 합의합니다.')
D['광고대행·브랜딩·마케팅의 기본가와 포함 범위는 위 서비스·가격 가이드에서 확인할 수 있습니다. 최종 수량, 기간, 별도 비용은 상담 후 견적서로 합의합니다.']='See the service and pricing guide above for proposed starting fees and inclusions. Final quantities, duration and additional costs are agreed in your quote after consultation.'
(ROOT/'index.html').write_text(ko)
# Exclude already translated fragments from translation validation.
base=re.sub(r'<!-- MARKET UPDATE START -->.*?<!-- MARKET UPDATE END -->','<!-- EN MARKET PLACEHOLDER -->',ko,flags=re.S)
t=Translator();t.feed(base)
if t.missing:
    raise SystemExit('Missing English translations:\n'+'\n'.join(sorted(t.missing)))
en=''.join(t.out).replace('<html lang="ko">','<html lang="en">').replace('<body>','<body class="en-page">')
en=en.replace('<!-- EN MARKET PLACEHOLDER -->',research_en+price_section('en'))
en=en.replace('<link rel="canonical" href="https://withweplace.kr/">','<link rel="canonical" href="https://withweplace.kr/en/">')
en=en.replace('<meta property="og:url" content="https://withweplace.kr/">','<meta property="og:url" content="https://withweplace.kr/en/">')
en=en.replace('<span lang="ko" aria-current="page">한국어</span><a lang="en" hreflang="en" href="/en/">EN</a>','<a lang="ko" hreflang="ko" href="/">한국어</a><span lang="en" aria-current="page">EN</span>')
en=re.sub(r'mailto:weplace25@gmail.com\?subject=[^"\s]+','mailto:weplace25@gmail.com?subject=Weplace%20business%20enquiry',en)
def schema_english(match):
    data=json.loads(match.group(1))
    for item in data.get('@graph',[]):
        if item.get('@type')=='WebPage':
            item.update({'@id':'https://withweplace.kr/en/#webpage','url':'https://withweplace.kr/en/','name':D['Weplace — 손님이 움직이는 이유를, 화면에 담습니다'],'inLanguage':'en'})
        elif item.get('@type')=='WebSite':item['inLanguage']=['ko-KR','en']
        elif item.get('@type')=='Service':
            item['name']='Local business information and customer experience services'
            item['serviceType']='Website, map listing, photos, reviews and pre-visit information'
            item['description']='Consistent, useful information across a business website and local platforms.'
    return '<script type="application/ld+json">'+json.dumps(data,ensure_ascii=False,separators=(',',':'))+'</script>'
en=re.sub(r'<script type="application/ld\+json">(.*?)</script>',schema_english,en,flags=re.S)
(ROOT/'en').mkdir(exist_ok=True)
(ROOT/'en/index.html').write_text(en)
sitemap=(ROOT/'sitemap.xml').read_text()
if 'https://withweplace.kr/en/' not in sitemap:
    sitemap=sitemap.replace('</urlset>','  <url><loc>https://withweplace.kr/en/</loc></url>\n</urlset>')
    (ROOT/'sitemap.xml').write_text(sitemap)
print('Generated Korean and English homepages. Pricing status:',P['status'])
