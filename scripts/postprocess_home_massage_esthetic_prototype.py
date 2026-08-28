from pathlib import Path

p = Path('prototype/home-massage-esthetic/index.html')
s = p.read_text(encoding='utf-8')

# Nested prototype paths must resolve from the site root.
s = s.replace('url("img/', 'url("/img/')
s = s.replace('src="img/', 'src="/img/')
s = s.replace('href="img/', 'href="/img/')
s = s.replace('href="industries/', 'href="/industries/')

# Make the new field-focus section visible in desktop dot navigation.
anchor = '  <a href="#customer-view" data-sec="customer-view"><span>손님 눈으로 보기</span></a>'
focus_anchor = '  <a href="#massage-esthetic-focus" data-sec="massage-esthetic-focus"><span>마사지·에스테틱</span></a>'
if focus_anchor not in s and anchor in s:
    s = s.replace(anchor, anchor + '\n' + focus_anchor, 1)

focus_css = '''
  /* Prototype · Massage & Esthetic field focus */
  .focus{background:linear-gradient(180deg,#F4EFE6,#EEE6D9);color:#241B12;}
  .focus h2{color:#241B12;}.focus .kicker{color:#8A6E3E}.focus .kicker::before{background:#8A6E3E}
  .focus__lead{margin-top:20px;color:#665C4D;font-size:15.5px;font-weight:300;line-height:1.88;max-width:31em}
  .focus__signal{margin-top:16px;font-family:var(--serif);font-size:16px;line-height:1.7;color:#3F352A}
  .focus__compare{margin-top:38px;display:grid;grid-template-columns:1fr auto 1fr;gap:14px;align-items:stretch}
  .focus__card{border:1px solid rgba(122,86,64,.18);border-radius:17px;background:#FBF8F1;padding:20px;box-shadow:0 18px 48px rgba(61,44,28,.07)}
  .focus__card--good{border-color:rgba(138,110,62,.35)}.focus__lab{font-size:10px;font-weight:700;letter-spacing:.12em;color:#8B8174;text-transform:uppercase}.focus__card--good .focus__lab{color:#8A6E3E}
  .focus__mock{margin-top:14px;border-radius:13px;background:#F0E9DC;overflow:hidden;border:1px solid rgba(122,86,64,.12)}
  .focus__photo{height:86px;position:relative;background:linear-gradient(145deg,#9A8068,#62554A)}
  .focus__photo--vague::after{content:'INTERIOR';position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,.55);font-family:var(--eng);font-style:italic;letter-spacing:.12em;font-size:11px}
  .focus__photo--clear{background:linear-gradient(145deg,#B59A77,#745E49)}.focus__photo--clear::after{content:'MASSAGE · FACIAL CARE';position:absolute;left:11px;bottom:9px;color:#fff;font-size:9.5px;font-weight:700;letter-spacing:.06em}
  .focus__body{padding:12px 13px 14px}.focus__name{font-family:var(--serif);font-size:13px;font-weight:600;color:#241B12}.focus__line{height:6px;border-radius:99px;background:#D9CFBF;margin-top:8px}.focus__line.sm{width:56%}
  .focus__chips{margin-top:9px;display:flex;gap:5px;flex-wrap:wrap}.focus__chips span{font-size:8.5px;border-radius:6px;background:#E9DDC1;color:#6E5835;padding:4px 6px}.focus__why{margin-top:14px;font-size:12.5px;color:#716658;line-height:1.72}.focus__arrow{align-self:center;color:#8A6E3E;font-size:20px}
  .focus__refs{margin-top:24px;display:grid;grid-template-columns:1fr 1fr;gap:10px}.focus__ref{border-top:1px solid rgba(122,86,64,.18);padding-top:15px}.focus__ref b{display:block;font-family:var(--serif);font-size:14px;color:#2F261D;font-weight:600}.focus__ref p{margin-top:5px;color:#766A5B;font-size:11.8px;line-height:1.65}
  .focus__actions{margin-top:28px;display:flex;gap:10px;flex-wrap:wrap}.focus__btn{display:inline-block;text-decoration:none;border-radius:11px;padding:13px 19px;font-size:13px;font-weight:700}.focus__btn--main{background:#281F16;color:#F5EEE2}.focus__btn--sub{border:1px solid rgba(122,86,64,.25);color:#3E3327;background:transparent}
  @media(max-width:600px){.focus__compare{grid-template-columns:1fr}.focus__arrow{transform:rotate(90deg);justify-self:center}.focus__refs{grid-template-columns:1fr}.focus__actions{flex-direction:column}.focus__btn{text-align:center}}
'''
if 'Prototype · Massage & Esthetic field focus' not in s:
    css_marker = '  .creed{text-align:center;}'
    if css_marker in s:
        s = s.replace(css_marker, focus_css + '\n' + css_marker, 1)

focus_html = '''
<section class="sec focus" id="massage-esthetic-focus">
  <div class="wrap">
    <div class="kicker r">FIELD FOCUS · MASSAGE & ESTHETIC</div>
    <h2 class="r d1">업종마다 손님이<br>멈추는 자리는 다릅니다.</h2>
    <p class="focus__lead r d2">지금 Weplace가 먼저 깊게 보는 업종은 마사지·에스테틱입니다. 관리 실력은 방문 전에는 보이지 않기 때문에, 손님은 화면에서 먼저 안심할 근거를 찾습니다.</p>
    <p class="focus__signal r d2">좋은 공간과 관리를 이미 갖고 있어도, 첫 사진에서 무슨 곳인지 늦게 읽히면 그 장점은 한 번 더 찾아봐야 보입니다.</p>
    <div class="focus__compare r d2">
      <div class="focus__card"><div class="focus__lab">한 번 더 봐야 하는 화면</div><div class="focus__mock"><div class="focus__photo focus__photo--vague"></div><div class="focus__body"><div class="focus__name">○○ 힐링</div><div class="focus__line"></div><div class="focus__line sm"></div></div></div><div class="focus__why">예쁘고 편안해 보여도 마사지·페이셜·바디케어 중 무엇을 하는 곳인지 첫 화면에서는 늦게 읽힐 수 있습니다.</div></div>
      <div class="focus__arrow" aria-hidden="true">→</div>
      <div class="focus__card focus__card--good"><div class="focus__lab">한눈에 읽히는 화면</div><div class="focus__mock"><div class="focus__photo focus__photo--clear"></div><div class="focus__body"><div class="focus__name">○○ 마사지 · 페이셜케어</div><div class="focus__chips"><span>Facial</span><span>Body</span><span>60–90 min</span><span>Book</span></div></div></div><div class="focus__why">공간의 분위기를 잃지 않으면서도 업종·관리·시간·예약의 다음 행동이 같은 자리에서 읽힙니다.</div></div>
    </div>
    <div class="focus__refs r d3">
      <div class="focus__ref"><b>난다아로마 · 정보 접근성</b><p>외국인 고객이 서비스·가격을 이해하고 지도·입구·예약까지 이어지는 흐름을 구조 레퍼런스로 봅니다.</p></div>
      <div class="focus__ref"><b>해윤제 · 첫 방문 안심</b><p>어떤 곳인지 → 나에게 맞는지 → 믿고 가도 되는지 → 무엇을 받을지 → 어떻게 예약할지의 질문 순서를 기준으로 봅니다.</p></div>
    </div>
    <div class="focus__actions r d3"><a class="focus__btn focus__btn--main" href="/prototype/massage-esthetic/">마사지·에스테틱 프로토타입 보기</a><a class="focus__btn focus__btn--sub" href="#diagnosis-preview">1장 진단 방식 보기</a></div>
  </div>
</section>

'''
if 'id="massage-esthetic-focus"' not in s:
    html_marker = '<section class="sec sec--void" id="ai-surface">'
    if html_marker in s:
        s = s.replace(html_marker, focus_html + html_marker, 1)

p.write_text(s, encoding='utf-8')
print(p)
