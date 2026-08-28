from pathlib import Path

p = Path('prototype/home-massage-esthetic/index.html')
s = p.read_text(encoding='utf-8')

# Nested prototype paths must resolve from the site root.
s = s.replace('url("img/', 'url("/img/')
s = s.replace('src="img/', 'src="/img/')
s = s.replace('href="industries/', 'href="/industries/')

# Make the new field-focus section visible in the desktop dot navigation.
anchor = '  <a href="#customer-view" data-sec="customer-view"><span>손님 눈으로 보기</span></a>'
focus = '  <a href="#massage-esthetic-focus" data-sec="massage-esthetic-focus"><span>마사지·에스테틱</span></a>'
if focus not in s and anchor in s:
    s = s.replace(anchor, anchor + '\n' + focus, 1)

p.write_text(s, encoding='utf-8')
print(p)
