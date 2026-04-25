#!/usr/bin/env python3
import re, os

base = os.path.join(os.path.dirname(__file__), 'island_escape')

with open(os.path.join(base, 'index.html'), encoding='utf-8') as f:
    html = f.read()

# inline CSS
def inline_css(m):
    href = m.group(1)
    path = os.path.join(base, href)
    with open(path, encoding='utf-8') as f:
        css = f.read()
    return f'<style>\n{css}\n</style>'

html = re.sub(r'<link[^>]+href="([^"]+\.css)"[^>]*>', inline_css, html)

# inline JS (skip Google Fonts)
def inline_js(m):
    src = m.group(1)
    path = os.path.join(base, src)
    with open(path, encoding='utf-8') as f:
        js = f.read()
    return f'<script>\n{js}\n</script>'

html = re.sub(r'<script src="([^"]+)">', inline_js, html)

out = os.path.join(base, 'game.html')
with open(out, 'w', encoding='utf-8') as f:
    f.write(html)

size = os.path.getsize(out)
print(f'game.html generated: {size:,} bytes ({size//1024} KB)')
