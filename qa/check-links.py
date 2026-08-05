from pathlib import Path
from bs4 import BeautifulSoup
from urllib.parse import urlparse
import sys
root=Path(__file__).resolve().parents[1]
issues=[]; count=0
for html in root.rglob('*.html'):
    if 'qa/fixtures/' in html.relative_to(root).as_posix():
        continue
    soup=BeautifulSoup(html.read_text(encoding='utf-8',errors='ignore'),'html.parser')
    for tag,attr in [('a','href'),('img','src'),('script','src'),('link','href')]:
        for node in soup.find_all(tag):
            value=node.get(attr)
            if not value or value.startswith(('#','mailto:','tel:','sms:','javascript:','data:','http://','https://','//')): continue
            clean=value.split('#')[0].split('?')[0]
            if not clean: continue
            count+=1
            target=(root/clean.lstrip('/')) if clean.startswith('/') else (html.parent/clean)
            if clean.endswith('/'):
                target=target/'index.html'
            elif target.is_dir():
                target=target/'index.html'
            if not target.exists(): issues.append(f'{html.relative_to(root)} -> {value}')
print(f'checked={count} broken={len(issues)}')
for x in issues[:100]: print('BROKEN',x)
if issues: sys.exit(1)
