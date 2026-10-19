"""Render DELIVERY.md into a print-ready HTML sheet, then hand it to LibreOffice.

Single source of truth: the Markdown file. This script only decides how each
block looks on paper — the mermaid diagram becomes a table (Word cannot render
mermaid, and a frozen code block reads badly in a printed handover).
"""
import re
import pathlib
import markdown

ROOT = pathlib.Path('/Users/sumuzhi/WorkBuddy/2026-10-19-14-44-12')
md_path = ROOT / 'DELIVERY.md'
out_html = ROOT / 'build' / 'delivery.html'
out_html.parent.mkdir(exist_ok=True)

text = md_path.read_text(encoding='utf-8')

# --- replace the mermaid diagram with a structured table -------------------
ARCH_TABLE = """
<table class="arch">
  <thead><tr><th style="width:18%">层次</th><th style="width:34%">组件</th><th>职责</th></tr></thead>
  <tbody>
    <tr><td rowspan="4">应用外壳</td><td>App.jsx</td><td>路由、滚动复位、跳过导航链接</td></tr>
    <tr><td>Header / Footer</td><td>导航、搜索入口、收藏与购物袋角标</td></tr>
    <tr><td>CartDrawer</td><td>购物袋 + 三步结算，独立于页面存在</td></tr>
    <tr><td>SearchOverlay / Toaster</td><td>实时搜索浮层 / 操作反馈</td></tr>
    <tr><td rowspan="3">页面</td><td>Home / Shop</td><td>氛围首页 / 可筛选列表</td></tr>
    <tr><td>Product</td><td>详情、规格选择、加购</td></tr>
    <tr><td>NotFound</td><td>兜底空状态</td></tr>
    <tr><td rowspan="2">状态</td><td>StoreContext（useReducer）</td><td>购物车、收藏、折扣码的唯一真相源</td></tr>
    <tr><td>localStorage</td><td>会话延续，key <code>ostra.store.v1</code></td></tr>
    <tr><td rowspan="2">数据</td><td>products.js</td><td>12 件商品 · 5 个分类 · 金额以分为单位</td></tr>
    <tr><td>format.js</td><td>金额格式化、到货区间计算</td></tr>
  </tbody>
</table>
"""

pattern = re.compile(r'```mermaid\n.*?\n```', re.S)
text, n = pattern.subn(ARCH_TABLE, text)
print(f'mermaid blocks replaced: {n}')

html_body = markdown.markdown(
    text,
    extensions=['tables', 'fenced_code', 'sane_lists', 'attr_list'],
)

CSS = """
@page { size: A4; margin: 20mm 16mm 18mm 16mm; }
body { font-family: "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
       font-size: 10.5pt; line-height: 1.65; color: #1b1916; }
h1 { font-size: 22pt; letter-spacing: -0.4pt; margin: 0 0 6pt; color: #1b1916;
     border-bottom: 2px solid #b4553c; padding-bottom: 8pt; }
h2 { font-size: 14pt; margin: 20pt 0 8pt; padding-left: 8pt;
     border-left: 3px solid #b4553c; page-break-after: avoid; }
h3 { font-size: 11.5pt; margin: 14pt 0 6pt; color: #57504a; page-break-after: avoid; }
p { margin: 0 0 7pt; }
table { width: 100%; border-collapse: collapse; margin: 8pt 0 12pt; font-size: 9pt;
        page-break-inside: auto; }
th { background: #f7f3eb; border: 0.5pt solid #d8cdbd; padding: 5pt 6pt;
     text-align: left; font-weight: 600; color: #1b1916; }
td { border: 0.5pt solid #e2d9cb; padding: 5pt 6pt; vertical-align: top; }
tr { page-break-inside: avoid; }
tbody tr:nth-child(even) td { background: #fcfaf6; }
code { font-family: "SF Mono", Menlo, monospace; font-size: 8.5pt;
       background: #f4efe6; padding: 0.5pt 3pt; border-radius: 2pt; }
pre { background: #f7f3eb; border-left: 3px solid #d8cdbd; padding: 8pt 10pt;
      font-size: 8.5pt; line-height: 1.5; page-break-inside: avoid; }
pre code { background: none; padding: 0; }
blockquote { margin: 8pt 0; padding: 6pt 10pt; background: #f4efe6;
             border-left: 3px solid #b4553c; color: #57504a; }
ul, ol { margin: 0 0 8pt; padding-left: 16pt; }
li { margin-bottom: 3pt; }
strong { color: #1b1916; }
table.arch td[rowspan] { background: #f7f3eb; font-weight: 600; }
hr { border: none; border-top: 0.5pt solid #d8cdbd; margin: 14pt 0; }
h2 + table, h3 + table { page-break-before: avoid; }
"""

html = f"""<!DOCTYPE html>
<html lang="zh-CN"><head><meta charset="utf-8">
<title>Ostra 商品选购 Web 应用 · 交付文档</title>
<style>{CSS}</style></head><body>
{html_body}
</body></html>"""

out_html.write_text(html, encoding='utf-8')
print('html written:', out_html, len(html), 'chars')
